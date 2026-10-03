/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  UserProfile,
  AuthorProfile,
  Book,
  Chapter,
  Genre,
  Category,
  Review,
  BookmarkItem,
  ReadingProgress,
  LibraryItem,
  Follow,
  Wallet,
  TokenPackage,
  Transaction,
  BookUnlock,
  Withdrawal,
  Report,
  AppNotification,
  Advertisement,
  PlatformSettings,
  AuditLog,
  BookStatus,
  ReadingTheme,
} from './types';
import {
  INITIAL_SETTINGS,
  INITIAL_GENRES,
  INITIAL_CATEGORIES,
  INITIAL_TOKEN_PACKAGES,
  INITIAL_ADVERTISEMENTS,
  INITIAL_AUTHORS,
  INITIAL_BOOKS,
  INITIAL_CHAPTERS,
  INITIAL_REVIEWS,
} from './data/seedData';
import { BookCoverImage } from './components/BookCoverImage';
import { AdSlotBanner } from './components/AdSlotBanner';
import { ReaderModal } from './components/ReaderModal';
import { BookDetailView } from './components/BookDetailView';
import { WalletView } from './components/WalletView';
import { AuthorStudioView } from './components/AuthorStudioView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AuthorProfileView } from './components/AuthorProfileView';
import { ReaderLibraryView } from './components/ReaderLibraryView';
import { LegalPoliciesView, LegalDocType } from './components/LegalPoliciesView';
import {
  Search,
  Coins,
  BookOpen,
  Star,
  ArrowRight,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';

type ViewMode =
  | 'home'
  | 'explore'
  | 'authors'
  | 'author-detail'
  | 'book-detail'
  | 'library'
  | 'wallet'
  | 'author-studio'
  | 'admin'
  | 'legal';

const ADMIN_EMAIL = 'olurantiakin@gmail.com';

export default function App() {
  // Navigation & Active View State
  const [view, setView] = useState<ViewMode>('home');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>('copyright');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Reader Modal State
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [readingChapterNum, setReadingChapterNum] = useState<number>(1);

  // Search & Catalog Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'reads' | 'rating'>('featured');

  // Auth & User State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Platform Collections State (Initialized with rich editorial seed catalog)
  const [settings, setSettings] = useState<PlatformSettings>(INITIAL_SETTINGS);
  const [genres, setGenres] = useState<Genre[]>(INITIAL_GENRES);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);
  const [authors, setAuthors] = useState<AuthorProfile[]>(INITIAL_AUTHORS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>(
    INITIAL_TOKEN_PACKAGES
  );
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(
    INITIAL_ADVERTISEMENTS
  );

  // User-Specific & Ledger Collections State
  const [wallet, setWallet] = useState<Wallet>({
    userId: 'guest',
    tokenBalance: 120,
    totalTokensPurchased: 120,
    totalTokensSpent: 0,
    authorEarningsTokens: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bookUnlocks, setBookUnlocks] = useState<BookUnlock[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [follows, setFollows] = useState<Follow[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_welcome',
      userId: 'guest',
      title: 'Welcome to LitVault Digital Library',
      message:
        'Explore complimentary open editions or unlock premium manuscripts with LitTokens.',
      read: false,
    },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const isAdmin =
    userProfile?.role === 'admin' || firebaseUser?.email === ADMIN_EMAIL;

  // 1. Firebase Auth Listener & Profile / Wallet Bootstrap
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      setAuthReady(true);
      if (!u) {
        setUserProfile(null);
        return;
      }

      const userRef = doc(db, 'users', u.uid);
      try {
        const snap = await getDoc(userRef);
        const determinedRole =
          u.email === ADMIN_EMAIL ? 'admin' : 'reader';

        if (!snap.exists()) {
          const newProfile: UserProfile = {
            uid: u.uid,
            displayName: u.displayName || 'LitVault Reader',
            photoURL: u.photoURL || '',
            role: determinedRole,
            status: 'active',
            preferredGenres: ['African Literature', 'Historical Fiction'],
            readingTheme: 'light',
          };
          await setDoc(userRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setUserProfile(newProfile);

          // Store isolated PII in /users/{uid}/private/info
          if (u.email) {
            await setDoc(doc(db, 'users', u.uid, 'private', 'info'), {
              uid: u.uid,
              email: u.email,
              updatedAt: serverTimestamp(),
            });
          }
        } else {
          setUserProfile(snap.data() as UserProfile);
        }

        // Ensure Wallet Exists
        const walletRef = doc(db, 'wallets', u.uid);
        const walletSnap = await getDoc(walletRef);
        if (!walletSnap.exists()) {
          const initialWallet: Wallet = {
            userId: u.uid,
            tokenBalance: 150, // Welcome reading grant
            totalTokensPurchased: 150,
            totalTokensSpent: 0,
            authorEarningsTokens: 0,
          };
          await setDoc(walletRef, {
            ...initialWallet,
            updatedAt: serverTimestamp(),
          });
          setWallet(initialWallet);
        } else {
          setWallet(walletSnap.data() as Wallet);
        }
      } catch (err) {
        console.warn('Profile bootstrap warning:', err);
      }
    });
    return () => unsub();
  }, []);

  // 2. Real-time Firestore Public & User Listeners
  useEffect(() => {
    if (!authReady) return;

    const unsubBooks = onSnapshot(
      query(collection(db, 'books'), where('status', '==', 'published')),
      (snap) => {
        if (!snap.empty) {
          const dbBooks = snap.docs.map((d) => d.data() as Book);
          setBooks((prev) => {
            const map = new Map<string, Book>();
            prev.forEach((b) => map.set(b.id, b));
            dbBooks.forEach((b) => map.set(b.id, b));
            return Array.from(map.values());
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'books')
    );

    const unsubChapters = onSnapshot(
      query(collection(db, 'chapters'), where('status', '==', 'published')),
      (snap) => {
        if (!snap.empty) {
          const dbChaps = snap.docs.map((d) => d.data() as Chapter);
          setChapters((prev) => {
            const map = new Map<string, Chapter>();
            prev.forEach((c) => map.set(c.id, c));
            dbChaps.forEach((c) => map.set(c.id, c));
            return Array.from(map.values());
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'chapters')
    );

    const unsubAuthors = onSnapshot(
      query(collection(db, 'authors'), where('status', '==', 'approved')),
      (snap) => {
        if (!snap.empty) {
          const dbAuthors = snap.docs.map((d) => d.data() as AuthorProfile);
          setAuthors((prev) => {
            const map = new Map<string, AuthorProfile>();
            prev.forEach((a) => map.set(a.id, a));
            dbAuthors.forEach((a) => map.set(a.id, a));
            return Array.from(map.values());
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'authors')
    );

    const unsubReviews = onSnapshot(
      query(collection(db, 'reviews'), where('rating', '>=', 1)),
      (snap) => {
        if (!snap.empty) {
          const dbRevs = snap.docs.map((d) => d.data() as Review);
          setReviews((prev) => {
            const map = new Map<string, Review>();
            prev.forEach((r) => map.set(r.id, r));
            dbRevs.forEach((r) => map.set(r.id, r));
            return Array.from(map.values());
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'reviews')
    );

    return () => {
      unsubBooks();
      unsubChapters();
      unsubAuthors();
      unsubReviews();
    };
  }, [authReady]);

  // Authenticated User Listeners
  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    const uid = firebaseUser.uid;

    const unsubWallet = onSnapshot(
      doc(db, 'wallets', uid),
      (snap) => {
        if (snap.exists()) {
          setWallet(snap.data() as Wallet);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `wallets/${uid}`)
    );

    const unsubUnlocks = onSnapshot(
      query(collection(db, 'bookUnlocks'), where('userId', '==', uid)),
      (snap) => {
        setBookUnlocks(snap.docs.map((d) => d.data() as BookUnlock));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'bookUnlocks')
    );

    const unsubTx = onSnapshot(
      query(collection(db, 'transactions'), where('userId', '==', uid)),
      (snap) => {
        setTransactions(snap.docs.map((d) => d.data() as Transaction));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'transactions')
    );

    const unsubLib = onSnapshot(
      query(collection(db, 'libraries'), where('userId', '==', uid)),
      (snap) => {
        setLibraryItems(snap.docs.map((d) => d.data() as LibraryItem));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'libraries')
    );

    const unsubProg = onSnapshot(
      query(collection(db, 'readingProgress'), where('userId', '==', uid)),
      (snap) => {
        setReadingProgress(snap.docs.map((d) => d.data() as ReadingProgress));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'readingProgress')
    );

    const unsubBm = onSnapshot(
      query(collection(db, 'bookmarks'), where('userId', '==', uid)),
      (snap) => {
        setBookmarks(snap.docs.map((d) => d.data() as BookmarkItem));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'bookmarks')
    );

    const unsubFollows = onSnapshot(
      query(collection(db, 'follows'), where('userId', '==', uid)),
      (snap) => {
        setFollows(snap.docs.map((d) => d.data() as Follow));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'follows')
    );

    return () => {
      unsubWallet();
      unsubUnlocks();
      unsubTx();
      unsubLib();
      unsubProg();
      unsubBm();
      unsubFollows();
    };
  }, [authReady, firebaseUser]);

  // Authentication Handlers
  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Authentication could not complete.'
      );
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setView('home');
  };

  // Audit Log Helper for Admin Operations
  const recordAuditLog = async (
    action: string,
    targetType: string,
    targetId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      actorId: firebaseUser?.uid || 'admin_local',
      actorName: userProfile?.displayName || firebaseUser?.email || 'Administrator',
      action,
      targetType,
      targetId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    if (firebaseUser && isAdmin) {
      try {
        await setDoc(doc(db, 'auditLogs', newLog.id), {
          ...newLog,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn('Audit log write skipped:', e);
      }
    }
  };

  // Wallet & Token Purchase Handler
  const handlePurchasePackage = async (pkg: TokenPackage, provider: string) => {
    const txId = `tx_${Date.now()}`;
    const paymentReference = `${provider.toUpperCase()}_${Date.now()}`;
    const uid = firebaseUser?.uid || 'guest';

    const newTx: Transaction = {
      id: txId,
      userId: uid,
      packageId: pkg.id,
      paymentReference,
      amountMinorUnits: pkg.priceMinorUnits,
      currency: pkg.currency,
      tokensPurchased: pkg.tokens,
      paymentProvider: provider,
      status: 'completed',
    };

    const updatedWallet: Wallet = {
      ...wallet,
      userId: uid,
      tokenBalance: wallet.tokenBalance + pkg.tokens,
      totalTokensPurchased: wallet.totalTokensPurchased + pkg.tokens,
    };

    setWallet(updatedWallet);
    setTransactions((prev) => [newTx, ...prev]);

    if (firebaseUser) {
      try {
        // Ensure package doc exists if admin hasn't seeded it yet
        await setDoc(doc(db, 'wallets', uid), {
          ...updatedWallet,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `wallets/${uid}`);
      }
    }
  };

  // Unlock Premium Book Handler (Integer Revenue Split)
  const handleUnlockBook = async (book: Book) => {
    if (wallet.tokenBalance < book.tokenPrice) {
      setView('wallet');
      return;
    }

    const uid = firebaseUser?.uid || 'guest';
    const unlockId = `unlock_${uid}_${book.id}`;
    const tokensSpent = Math.round(book.tokenPrice);
    const authorShareTokens = Math.floor(
      (tokensSpent * settings.authorRevenueSharePercent) / 100
    );
    const platformShareTokens = tokensSpent - authorShareTokens;

    const newUnlock: BookUnlock = {
      id: unlockId,
      userId: uid,
      bookId: book.id,
      bookTitle: book.title,
      authorId: book.authorId,
      tokensSpent,
      platformShareTokens,
      authorShareTokens,
    };

    const updatedWallet: Wallet = {
      ...wallet,
      userId: uid,
      tokenBalance: wallet.tokenBalance - tokensSpent,
      totalTokensSpent: wallet.totalTokensSpent + tokensSpent,
      authorEarningsTokens:
        book.authorId === uid
          ? wallet.authorEarningsTokens + authorShareTokens
          : wallet.authorEarningsTokens,
    };

    setBookUnlocks((prev) => [newUnlock, ...prev]);
    setWallet(updatedWallet);

    if (firebaseUser) {
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'wallets', uid), {
          ...updatedWallet,
          updatedAt: serverTimestamp(),
        });
        // Check if book exists in Firestore before writing relational unlock
        const bookDoc = await getDoc(doc(db, 'books', book.id));
        if (bookDoc.exists()) {
          batch.set(doc(db, 'bookUnlocks', unlockId), {
            ...newUnlock,
            createdAt: serverTimestamp(),
          });
        }
        await batch.commit();
      } catch (err) {
        console.warn('Unlock sync notice:', err);
      }
    }
  };

  // Reading Progress & Bookmarks
  const handleSaveReadingProgress = async (
    chapter: Chapter,
    percentComplete: number
  ) => {
    const uid = firebaseUser?.uid || 'guest';
    const progId = `prog_${uid}_${chapter.bookId}`;
    const newProg: ReadingProgress = {
      id: progId,
      userId: uid,
      bookId: chapter.bookId,
      chapterId: chapter.id,
      chapterNumber: chapter.chapterNumber,
      percentComplete,
    };

    setReadingProgress((prev) => {
      const filtered = prev.filter((p) => p.bookId !== chapter.bookId);
      return [newProg, ...filtered];
    });

    // Increment read count locally
    setBooks((prev) =>
      prev.map((b) =>
        b.id === chapter.bookId ? { ...b, readsCount: b.readsCount + 1 } : b
      )
    );
  };

  const handleAddBookmark = async (chapter: Chapter, note: string) => {
    const uid = firebaseUser?.uid || 'guest';
    const bmId = `bm_${Date.now()}`;
    const newBm: BookmarkItem = {
      id: bmId,
      userId: uid,
      bookId: chapter.bookId,
      chapterId: chapter.id,
      chapterNumber: chapter.chapterNumber,
      note,
    };
    setBookmarks((prev) => [newBm, ...prev]);
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    if (firebaseUser) {
      try {
        await deleteDoc(doc(db, 'bookmarks', bookmarkId));
      } catch {
        // Ignore if local-only bookmark
      }
    }
  };

  // Library & Follow Toggles
  const handleToggleLibrary = async (book: Book) => {
    const uid = firebaseUser?.uid || 'guest';
    const existing = libraryItems.find((i) => i.bookId === book.id);
    if (existing) {
      setLibraryItems((prev) => prev.filter((i) => i.bookId !== book.id));
    } else {
      const newItem: LibraryItem = {
        id: `lib_${uid}_${book.id}`,
        userId: uid,
        bookId: book.id,
      };
      setLibraryItems((prev) => [newItem, ...prev]);
    }
  };

  const handleToggleFollowAuthor = async (authorId: string) => {
    const uid = firebaseUser?.uid || 'guest';
    const existing = follows.find((f) => f.authorId === authorId);
    if (existing) {
      setFollows((prev) => prev.filter((f) => f.authorId !== authorId));
      setAuthors((prev) =>
        prev.map((a) =>
          a.id === authorId
            ? { ...a, followersCount: Math.max(0, a.followersCount - 1) }
            : a
        )
      );
    } else {
      const newFollow: Follow = {
        id: `fol_${uid}_${authorId}`,
        userId: uid,
        authorId,
      };
      setFollows((prev) => [newFollow, ...prev]);
      setAuthors((prev) =>
        prev.map((a) =>
          a.id === authorId
            ? { ...a, followersCount: a.followersCount + 1 }
            : a
        )
      );
    }
  };

  // Reviews & Reports
  const handleSubmitReview = async (
    bookId: string,
    rating: number,
    comment: string
  ) => {
    const uid = firebaseUser?.uid || 'guest';
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      bookId,
      userId: uid,
      userName: userProfile?.displayName || firebaseUser?.displayName || 'LitVault Reader',
      rating,
      comment,
    };
    setReviews((prev) => [newRev, ...prev]);
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b;
        const nextCount = b.ratingCount + 1;
        const nextAvg = Number(
          ((b.ratingAvg * b.ratingCount + rating) / nextCount).toFixed(1)
        );
        return { ...b, ratingCount: nextCount, ratingAvg: nextAvg };
      })
    );
  };

  const handleSubmitReport = async (
    targetType: 'book' | 'copyright',
    targetId: string,
    targetTitle: string,
    reason: string,
    details: string
  ) => {
    const uid = firebaseUser?.uid || 'guest';
    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: uid,
      targetType,
      targetId,
      targetTitle,
      reason,
      details,
      status: 'open',
    };
    setReports((prev) => [newReport, ...prev]);
    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'reports', newReport.id), {
          ...newReport,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `reports/${newReport.id}`);
      }
    }
  };

  // Author Studio Handlers
  const currentAuthorProfile = useMemo(() => {
    const uid = firebaseUser?.uid;
    if (!uid) return undefined;
    return authors.find((a) => a.userId === uid || a.id === uid);
  }, [authors, firebaseUser]);

  const handleRegisterAuthor = async (data: {
    penName: string;
    bio: string;
    location: string;
    website: string;
    twitterHandle: string;
    copyrightAgreed: boolean;
  }) => {
    const uid = firebaseUser?.uid || `author_${Date.now()}`;
    const newAuthor: AuthorProfile = {
      id: uid,
      userId: uid,
      penName: data.penName,
      bio: data.bio,
      photoUrl: userProfile?.photoURL || INITIAL_AUTHORS[0].photoUrl,
      location: data.location,
      website: data.website,
      twitterHandle: data.twitterHandle,
      status: settings.requireAuthorApproval ? 'pending' : 'approved',
      copyrightAgreed: data.copyrightAgreed,
      followersCount: 1,
      totalReads: 0,
      averageRating: 5.0,
    };

    setAuthors((prev) => [newAuthor, ...prev]);
    if (userProfile && userProfile.role === 'reader') {
      setUserProfile({ ...userProfile, role: 'author' });
    }

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'authors', uid), {
          ...newAuthor,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `authors/${uid}`);
      }
    }
  };

  const handleSaveBook = async (
    bookData: Omit<
      Book,
      | 'id'
      | 'authorId'
      | 'authorName'
      | 'featured'
      | 'trending'
      | 'readsCount'
      | 'ratingAvg'
      | 'ratingCount'
    >,
    existingBookId?: string
  ): Promise<string> => {
    const uid = currentAuthorProfile?.id || firebaseUser?.uid || 'author_local';
    const authorName =
      currentAuthorProfile?.penName ||
      userProfile?.displayName ||
      'LitVault Author';
    const bookId = existingBookId || `book_${Date.now()}`;

    const existing = books.find((b) => b.id === existingBookId);
    const savedBook: Book = {
      ...bookData,
      id: bookId,
      authorId: uid,
      authorName,
      featured: existing?.featured || false,
      trending: existing?.trending || false,
      readsCount: existing?.readsCount || 1,
      ratingAvg: existing?.ratingAvg || 5.0,
      ratingCount: existing?.ratingCount || 1,
    };

    setBooks((prev) => {
      const filtered = prev.filter((b) => b.id !== bookId);
      return [savedBook, ...filtered];
    });

    if (firebaseUser && currentAuthorProfile) {
      try {
        await setDoc(doc(db, 'books', bookId), {
          ...savedBook,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `books/${bookId}`);
      }
    }

    return bookId;
  };

  const handleSaveChapter = async (
    chapterData: Omit<Chapter, 'id' | 'authorId'>,
    existingChapterId?: string
  ) => {
    const uid = currentAuthorProfile?.id || firebaseUser?.uid || 'author_local';
    const chapId = existingChapterId || `chap_${Date.now()}`;
    const newChap: Chapter = {
      ...chapterData,
      id: chapId,
      authorId: uid,
    };

    setChapters((prev) => {
      const filtered = prev.filter((c) => c.id !== chapId);
      return [...filtered, newChap];
    });

    setBooks((prev) =>
      prev.map((b) =>
        b.id === chapterData.bookId
          ? { ...b, chaptersCount: b.chaptersCount + 1 }
          : b
      )
    );

    if (firebaseUser && currentAuthorProfile) {
      try {
        const bookDoc = await getDoc(doc(db, 'books', chapterData.bookId));
        if (bookDoc.exists()) {
          await setDoc(doc(db, 'chapters', chapId), {
            ...newChap,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `chapters/${chapId}`);
      }
    }
  };

  const handleRequestWithdrawal = async (
    tokensAmount: number,
    payoutMethod: string,
    payoutDetails: string
  ) => {
    const uid = firebaseUser?.uid || 'author_local';
    const wId = `wd_${Date.now()}`;
    const newWd: Withdrawal = {
      id: wId,
      authorId: currentAuthorProfile?.id || uid,
      userId: uid,
      authorName: currentAuthorProfile?.penName || 'Author',
      tokensAmount,
      payoutMethod,
      payoutDetails,
      status: 'pending',
    };
    setWithdrawals((prev) => [newWd, ...prev]);
    setWallet((prev) => ({
      ...prev,
      authorEarningsTokens: Math.max(0, prev.authorEarningsTokens - tokensAmount),
    }));
  };

  // Filtered & Sorted Books for Discovery & Search
  const publishedBooks = useMemo(
    () => books.filter((b) => b.status === 'published'),
    [books]
  );

  const filteredBooks = useMemo(() => {
    return publishedBooks
      .filter((b) => {
        if (selectedGenre !== 'All' && b.genre !== selectedGenre) return false;
        if (selectedCategory !== 'All' && b.category !== selectedCategory)
          return false;
        if (tierFilter === 'free' && b.isPremium) return false;
        if (tierFilter === 'premium' && !b.isPremium) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchAuthor = b.authorName.toLowerCase().includes(q);
          const matchGenre = b.genre.toLowerCase().includes(q);
          const matchDesc = b.description.toLowerCase().includes(q);
          const matchTags = b.tags.some((t) => t.toLowerCase().includes(q));
          return (
            matchTitle || matchAuthor || matchGenre || matchDesc || matchTags
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'reads') return b.readsCount - a.readsCount;
        if (sortBy === 'rating') return b.ratingAvg - a.ratingAvg;
        return Number(b.featured) - Number(a.featured);
      });
  }, [
    publishedBooks,
    selectedGenre,
    selectedCategory,
    tierFilter,
    searchQuery,
    sortBy,
  ]);

  const unlockedBookIds = useMemo(
    () => bookUnlocks.map((u) => u.bookId),
    [bookUnlocks]
  );

  const openBookDetail = (book: Book) => {
    setSelectedBookId(book.id);
    setView('book-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthorDetail = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setView('author-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeBook = useMemo(
    () => books.find((b) => b.id === selectedBookId) || books[0],
    [books, selectedBookId]
  );

  const activeAuthor = useMemo(
    () => authors.find((a) => a.id === selectedAuthorId) || authors[0],
    [authors, selectedAuthorId]
  );

  const homeBannerAd = advertisements.find(
    (a) => a.placement === 'homepage_banner'
  );
  const catalogInlineAd = advertisements.find(
    (a) => a.placement === 'catalog_inline'
  );
  const bookSidebarAd = advertisements.find(
    (a) => a.placement === 'book_detail_sidebar'
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      {/* Slim Dismissible Editorial Announcement Strip (<= 40px) */}
      {settings.announcementBanner && (
        <div className="bg-[#1C1917] text-[#FBF9F5] px-4 py-2 text-center text-xs tracking-wide">
          <span>{settings.announcementBanner}</span>
        </div>
      )}

      {/* Top Navigation Bar — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-30 bg-[#FBF9F5]/95 backdrop-blur-sm border-b border-stone-200 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Single Text Element Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setView('home');
            }}
            className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 whitespace-nowrap"
          >
            LitVault
          </a>

          {/* Zone 2: 5 Clean Text Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
          >
            <button
              type="button"
              onClick={() => setView('home')}
              className={`hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap ${
                view === 'home'
                  ? 'text-stone-900 underline underline-offset-8 decoration-[#9A3412] decoration-2'
                  : ''
              }`}
            >
              Editorial
            </button>
            <button
              type="button"
              onClick={() => setView('explore')}
              className={`hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap ${
                view === 'explore'
                  ? 'text-stone-900 underline underline-offset-8 decoration-[#9A3412] decoration-2'
                  : ''
              }`}
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => setView('authors')}
              className={`hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap ${
                view === 'authors'
                  ? 'text-stone-900 underline underline-offset-8 decoration-[#9A3412] decoration-2'
                  : ''
              }`}
            >
              Authors
            </button>
            <button
              type="button"
              onClick={() => setView('library')}
              className={`hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap ${
                view === 'library'
                  ? 'text-stone-900 underline underline-offset-8 decoration-[#9A3412] decoration-2'
                  : ''
              }`}
            >
              Library
            </button>
            <button
              type="button"
              onClick={() => setView('author-studio')}
              className={`hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap ${
                view === 'author-studio'
                  ? 'text-stone-900 underline underline-offset-8 decoration-[#9A3412] decoration-2'
                  : ''
              }`}
            >
              Publish
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setView('admin')}
                className={`hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap ${
                  view === 'admin'
                    ? 'text-[#9A3412] font-semibold underline underline-offset-8 decoration-[#9A3412] decoration-2'
                    : 'text-[#9A3412]'
                }`}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Zone 3: 1-2 Primary Actions (LitToken Wallet + Auth) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setView('wallet')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-stone-300 bg-white text-stone-900 hover:border-stone-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Coins className="w-3.5 h-3.5 text-[#9A3412]" />
              <span className="font-mono-tabular font-semibold">
                {wallet.tokenBalance.toLocaleString()}
              </span>
              <span className="hidden sm:inline text-stone-500">LitTokens</span>
            </button>

            {firebaseUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('library')}
                  className="px-3 py-2 text-xs font-medium text-stone-800 hover:text-stone-900 cursor-pointer whitespace-nowrap hidden sm:inline-flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[110px] truncate">
                    {userProfile?.displayName || firebaseUser.displayName}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 text-xs text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-[#FBF9F5] hover:bg-[#9A3412] transition-colors cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 text-stone-700 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 mt-3 border-t border-stone-200 flex flex-col gap-2 text-sm">
            {(
              [
                { id: 'home', label: 'Editorial Home' },
                { id: 'explore', label: 'Explore Books' },
                { id: 'authors', label: 'Authors' },
                { id: 'library', label: 'My Library' },
                { id: 'author-studio', label: 'Author Studio' },
                { id: 'wallet', label: 'LitToken Wallet' },
                { id: 'admin', label: 'Admin Console' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setView(item.id);
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 px-2 font-medium text-stone-800 hover:bg-stone-100"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {authError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-center text-xs text-red-800">
          {authError}
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-1">
        {/* VIEW 1: PREMIUM EDITORIAL HOMEPAGE */}
        {view === 'home' && (
          <div>
            {/* Editorial Marquee Hero */}
            <section className="border-b border-stone-200 bg-[#F7F4EE]">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Column: Editorial Headline & CTAs */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#9A3412] font-semibold">
                    <span>LitVault International Literary House</span>
                    <span aria-hidden="true">·</span>
                    <span>Read. Discover. Publish.</span>
                  </div>

                  <h1
                    className="font-serif-display text-4xl sm:text-6xl font-semibold text-stone-900 leading-[1.08]"
                    style={{ textWrap: 'balance' }}
                  >
                    {settings.heroHeadline}
                  </h1>

                  <p className="font-prose text-base sm:text-lg text-stone-700 leading-relaxed max-w-2xl">
                    {settings.heroSubheadline}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setView('explore')}
                      className="inline-flex items-center gap-2 px-7 py-3.5 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-[#FBF9F5] hover:bg-[#9A3412] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>Explore Books</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setView('author-studio')}
                      className="inline-flex items-center gap-2 px-7 py-3.5 text-xs font-semibold uppercase tracking-wider border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>Publish Your Book</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setView('admin')}
                      className="px-4 py-3.5 text-xs font-medium text-stone-600 hover:text-stone-900 underline underline-offset-4 cursor-pointer whitespace-nowrap"
                    >
                      Admin Console
                    </button>
                  </div>

                  {/* Quantitative Proof Strip */}
                  <div className="pt-6 border-t border-stone-300/80 grid grid-cols-3 gap-6 max-w-lg text-xs">
                    <div>
                      <p className="font-mono-tabular text-xl font-semibold text-stone-900">
                        {settings.authorRevenueSharePercent}%
                      </p>
                      <p className="text-stone-500">
                        Direct Author Royalty Share
                      </p>
                    </div>
                    <div>
                      <p className="font-mono-tabular text-xl font-semibold text-stone-900">
                        {genres.length}
                      </p>
                      <p className="text-stone-500">Curated Literary Genres</p>
                    </div>
                    <div>
                      <p className="font-mono-tabular text-xl font-semibold text-stone-900">
                        100%
                      </p>
                      <p className="text-stone-500">
                        DRM-Protected Structured Prose
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Lead Featured Monograph Showcase */}
                {publishedBooks[0] && (
                  <div className="lg:col-span-5">
                    <div
                      onClick={() => openBookDetail(publishedBooks[0])}
                      className="group cursor-pointer bg-white border border-stone-200 p-6 sm:p-8 shadow-sm hover:border-stone-400 transition-all"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                        <div className="sm:col-span-5 aspect-[3/4] bg-stone-100 border border-stone-200 overflow-hidden">
                          <BookCoverImage
                            src={publishedBooks[0].coverUrl}
                            alt={publishedBooks[0].title}
                            title={publishedBooks[0].title}
                            author={publishedBooks[0].authorName}
                          />
                        </div>
                        <div className="sm:col-span-7 space-y-3">
                          <p className="text-[11px] uppercase tracking-widest text-[#9A3412] font-semibold">
                            Curator’s Lead Selection
                          </p>
                          <h2 className="font-serif-display text-2xl font-semibold text-stone-900 group-hover:text-[#9A3412] transition-colors">
                            {publishedBooks[0].title}
                          </h2>
                          <p className="text-xs text-stone-600">
                            By {publishedBooks[0].authorName}
                          </p>
                          <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                            {publishedBooks[0].description}
                          </p>
                          <div className="pt-2 flex items-center gap-3 text-xs font-mono-tabular text-stone-500">
                            <span>{publishedBooks[0].genre}</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {publishedBooks[0].isPremium
                                ? `${publishedBooks[0].tokenPrice} LitTokens`
                                : 'Complimentary Edition'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Continue Reading Strip (if reader has active progress) */}
            {readingProgress.length > 0 && (
              <section className="border-b border-stone-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="uppercase tracking-widest text-[#9A3412] font-semibold">
                      Continue Reading
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-serif-display text-base font-semibold text-stone-900">
                      {
                        books.find((b) => b.id === readingProgress[0].bookId)
                          ?.title
                      }
                    </span>
                    <span className="text-stone-500 font-mono-tabular">
                      (Chapter {readingProgress[0].chapterNumber} ·{' '}
                      {readingProgress[0].percentComplete}% completed)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const b = books.find(
                        (x) => x.id === readingProgress[0].bookId
                      );
                      if (b) {
                        setReadingBook(b);
                        setReadingChapterNum(readingProgress[0].chapterNumber);
                      }
                    }}
                    className="font-semibold text-[#9A3412] hover:underline cursor-pointer"
                  >
                    Resume Chapter {readingProgress[0].chapterNumber} →
                  </button>
                </div>
              </section>
            )}

            {/* Section 1: Featured & Trending Literary Catalog */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 py-14 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500">
                    Curated Editions
                  </p>
                  <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-stone-900 mt-1">
                    Featured & Trending Works
                  </h2>
                </div>

                {/* Interactive Filter Tabs (All / Free Reads / Premium Stories / African Literature) */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-200/70 border border-stone-300">
                  {(
                    [
                      { id: 'all', label: 'All Editions' },
                      { id: 'free', label: 'Free Reads' },
                      { id: 'premium', label: 'Premium Stories' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTierFilter(tab.id)}
                      className={`px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        tierFilter === tab.id
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-700 hover:text-stone-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {publishedBooks
                  .filter((b) =>
                    tierFilter === 'free'
                      ? !b.isPremium
                      : tierFilter === 'premium'
                      ? b.isPremium
                      : true
                  )
                  .slice(0, 6)
                  .map((book) => (
                    <article
                      key={book.id}
                      onClick={() => openBookDetail(book)}
                      className="group cursor-pointer border border-stone-200 bg-white flex flex-col justify-between hover:-translate-y-0.5 hover:border-stone-400 transition-all duration-150"
                    >
                      <div>
                        <div className="aspect-[3/4] w-full bg-[#F9F9F8] overflow-hidden border-b border-stone-100">
                          <BookCoverImage
                            src={book.coverUrl}
                            alt={`Cover of ${book.title}`}
                            title={book.title}
                            author={book.authorName}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                          />
                        </div>

                        <div className="p-6 space-y-2.5">
                          {/* Unboxed Metadata (Zero-Pill Rule) */}
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <span className="uppercase tracking-wider">
                              {book.genre}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                book.isPremium
                                  ? 'text-[#9A3412] font-semibold font-mono-tabular'
                                  : 'text-emerald-800 font-medium'
                              }
                            >
                              {book.isPremium
                                ? `${book.tokenPrice} LitTokens`
                                : 'Free Read'}
                            </span>
                          </div>

                          <h3 className="font-serif-display text-2xl font-semibold text-stone-900 group-hover:text-[#9A3412] transition-colors">
                            {book.title}
                          </h3>

                          <p className="text-xs text-stone-600">
                            By {book.authorName}
                          </p>

                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed pt-1">
                            {book.description}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 py-3.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono-tabular">
                        <span>{book.readsCount.toLocaleString()} reads</span>
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {book.ratingAvg.toFixed(1)} ({book.ratingCount})
                        </span>
                      </div>
                    </article>
                  ))}
              </div>
            </section>

            {/* Configurable Homepage Sponsorship / AdSense Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
              <AdSlotBanner
                ad={homeBannerAd}
                globalAdsEnabled={settings.adsEnabled}
                onNavigate={() => setView('explore')}
              />
            </div>

            {/* Section 2: Browse by Literary Genre & Popular Authors */}
            <section className="border-t border-stone-200 bg-[#F7F4EE] py-14">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Browse by Genre */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-stone-500">
                      Taxonomy & Archives
                    </p>
                    <h2 className="font-serif-display text-3xl font-semibold text-stone-900 mt-1">
                      Browse by Literary Genre
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {genres.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setSelectedGenre(g.name);
                          setView('explore');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-3.5 text-left bg-white border border-stone-200 hover:border-stone-900 transition-colors cursor-pointer group"
                      >
                        <p className="text-xs font-semibold text-stone-900 group-hover:text-[#9A3412] truncate">
                          {g.name}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {g.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Authors & Become an Author Callout */}
                <div className="lg:col-span-5 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif-display text-3xl font-semibold text-stone-900">
                        Distinguished Authors
                      </h2>
                      <button
                        type="button"
                        onClick={() => setView('authors')}
                        className="text-xs font-medium text-[#9A3412] hover:underline cursor-pointer"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="divide-y divide-stone-200 border border-stone-200 bg-white">
                      {authors.slice(0, 3).map((au) => (
                        <div
                          key={au.id}
                          onClick={() => openAuthorDetail(au.id)}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-12 shrink-0 bg-stone-200 overflow-hidden">
                              <BookCoverImage
                                src={au.photoUrl}
                                alt={au.penName}
                                title={au.penName}
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-serif-display text-lg font-semibold text-stone-900 truncate">
                                {au.penName}
                              </h3>
                              <p className="text-xs text-stone-500 truncate">
                                {au.location}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono-tabular text-stone-600 shrink-0">
                            {au.followersCount.toLocaleString()} followers
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Become an Author Callout */}
                  <div className="p-6 bg-stone-900 text-[#FBF9F5] space-y-4">
                    <p className="text-xs uppercase tracking-widest text-amber-400">
                      For Novelists, Poets & Essayists
                    </p>
                    <h3 className="font-serif-display text-2xl font-semibold">
                      Publish Your Manuscript on LitVault Studio
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Retain your copyright, price your chapters in LitTokens or
                      offer them free, and earn{' '}
                      {settings.authorRevenueSharePercent}% royalties on every
                      reader unlock.
                    </p>
                    <button
                      type="button"
                      onClick={() => setView('author-studio')}
                      className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#9A3412] text-white hover:bg-[#7C2D12] transition-colors cursor-pointer"
                    >
                      Open Author Studio
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: EXPLORE & SEARCH CATALOG */}
        {view === 'explore' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
            <header className="border-b border-stone-200 pb-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500">
                    International Literary Archive
                  </p>
                  <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold text-stone-900 mt-1">
                    Explore Books & Monographs
                  </h1>
                </div>
                <span className="text-xs font-mono-tabular text-stone-500">
                  Showing {filteredBooks.length} of {publishedBooks.length} works
                </span>
              </div>

              {/* Search & Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by book title, author, genre, or theme..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-stone-300 bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    aria-label="Filter by genre"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-stone-300 bg-white"
                  >
                    <option value="All">All Literary Genres</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    aria-label="Filter by access tier"
                    value={tierFilter}
                    onChange={(e) =>
                      setTierFilter(e.target.value as 'all' | 'free' | 'premium')
                    }
                    className="w-full px-3 py-2.5 text-xs border border-stone-300 bg-white"
                  >
                    <option value="all">Free & Premium</option>
                    <option value="free">Free Editions Only</option>
                    <option value="premium">Premium Only</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    aria-label="Sort books"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as 'featured' | 'reads' | 'rating'
                      )
                    }
                    className="w-full px-3 py-2.5 text-xs border border-stone-300 bg-white"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="reads">Sort: Most Read</option>
                    <option value="rating">Sort: Highest Rated</option>
                  </select>
                </div>
              </div>
            </header>

            <AdSlotBanner
              ad={catalogInlineAd}
              globalAdsEnabled={settings.adsEnabled}
              onNavigate={() => setView('author-studio')}
            />

            {filteredBooks.length === 0 ? (
              <div className="p-12 border border-stone-200 bg-white text-center space-y-3">
                <p className="font-serif-display text-2xl text-stone-800">
                  No matching literary works found
                </p>
                <p className="text-xs text-stone-500">
                  Try clearing your search query or switching genre filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGenre('All');
                    setTierFilter('all');
                  }}
                  className="px-4 py-2 text-xs font-medium bg-stone-900 text-white cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBooks.map((book) => (
                  <article
                    key={book.id}
                    onClick={() => openBookDetail(book)}
                    className="group cursor-pointer border border-stone-200 bg-white flex flex-col justify-between hover:border-stone-400 transition-all"
                  >
                    <div>
                      <div className="aspect-[3/4] w-full bg-[#F9F9F8] overflow-hidden border-b border-stone-100">
                        <BookCoverImage
                          src={book.coverUrl}
                          alt={book.title}
                          title={book.title}
                          author={book.authorName}
                        />
                      </div>
                      <div className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span className="uppercase tracking-wider">
                            {book.genre}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-tabular">
                            {book.isPremium
                              ? `${book.tokenPrice} LitTokens`
                              : 'Free Read'}
                          </span>
                        </div>
                        <h2 className="font-serif-display text-2xl font-semibold text-stone-900 group-hover:text-[#9A3412]">
                          {book.title}
                        </h2>
                        <p className="text-xs text-stone-600">
                          By {book.authorName}
                        </p>
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {book.description}
                        </p>
                      </div>
                    </div>
                    <div className="px-6 py-3.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono-tabular">
                      <span>{book.readsCount.toLocaleString()} reads</span>
                      <span>★ {book.ratingAvg.toFixed(1)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: AUTHORS DIRECTORY */}
        {view === 'authors' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
            <header className="border-b border-stone-200 pb-6">
              <p className="text-xs uppercase tracking-widest text-stone-500">
                International Roster
              </p>
              <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold text-stone-900 mt-1">
                Published Authors & Poets
              </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {authors
                .filter((a) => a.status === 'approved')
                .map((au) => (
                  <div
                    key={au.id}
                    onClick={() => openAuthorDetail(au.id)}
                    className="border border-stone-200 bg-white p-6 space-y-4 hover:border-stone-900 transition-colors cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 shrink-0 bg-stone-200 overflow-hidden">
                          <BookCoverImage
                            src={au.photoUrl}
                            alt={au.penName}
                            title={au.penName}
                          />
                        </div>
                        <div>
                          <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                            {au.penName}
                          </h2>
                          <p className="text-xs text-stone-500">{au.location}</p>
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                        {au.bio}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-mono-tabular text-stone-500">
                      <span>{au.followersCount.toLocaleString()} followers</span>
                      <span>{au.totalReads.toLocaleString()} reads</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 4: AUTHOR DETAIL PAGE */}
        {view === 'author-detail' && activeAuthor && (
          <AuthorProfileView
            author={activeAuthor}
            books={books}
            isFollowing={follows.some((f) => f.authorId === activeAuthor.id)}
            onBack={() => setView('authors')}
            onToggleFollow={handleToggleFollowAuthor}
            onSelectBook={openBookDetail}
          />
        )}

        {/* VIEW 5: BOOK DETAIL PAGE */}
        {view === 'book-detail' && activeBook && (
          <BookDetailView
            book={activeBook}
            chapters={chapters}
            author={authors.find((a) => a.id === activeBook.authorId)}
            reviews={reviews.filter((r) => r.bookId === activeBook.id)}
            relatedBooks={publishedBooks.filter(
              (b) => b.genre === activeBook.genre && b.id !== activeBook.id
            )}
            isUnlocked={
              !activeBook.isPremium || unlockedBookIds.includes(activeBook.id)
            }
            isInLibrary={libraryItems.some((i) => i.bookId === activeBook.id)}
            isFollowingAuthor={follows.some(
              (f) => f.authorId === activeBook.authorId
            )}
            userTokenBalance={wallet.tokenBalance}
            isAuthenticated={Boolean(firebaseUser)}
            sidebarAd={bookSidebarAd}
            globalAdsEnabled={settings.adsEnabled}
            onBack={() => setView('explore')}
            onStartReading={(chapterNum = 1) => {
              setReadingBook(activeBook);
              setReadingChapterNum(chapterNum);
            }}
            onUnlockBook={handleUnlockBook}
            onToggleLibrary={handleToggleLibrary}
            onToggleFollowAuthor={handleToggleFollowAuthor}
            onSubmitReview={handleSubmitReview}
            onSubmitReport={handleSubmitReport}
            onSelectBook={openBookDetail}
            onSelectAuthor={openAuthorDetail}
            onOpenWallet={() => setView('wallet')}
          />
        )}

        {/* VIEW 6: READER PERSONAL LIBRARY */}
        {view === 'library' && (
          <ReaderLibraryView
            userProfile={userProfile}
            books={books}
            libraryItems={libraryItems}
            readingProgress={readingProgress}
            bookmarks={bookmarks}
            unlockedBookIds={unlockedBookIds}
            genres={genres}
            notifications={notifications}
            onSelectBook={openBookDetail}
            onContinueReading={(book, chapNum) => {
              setReadingBook(book);
              setReadingChapterNum(chapNum);
            }}
            onRemoveBookmark={handleRemoveBookmark}
            onUpdatePreferences={async (displayName, preferredGenres) => {
              if (userProfile) {
                setUserProfile({
                  ...userProfile,
                  displayName,
                  preferredGenres,
                });
              }
            }}
            onMarkNotificationRead={async (nId) => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === nId ? { ...n, read: true } : n))
              );
            }}
          />
        )}

        {/* VIEW 7: LITTOKEN WALLET */}
        {view === 'wallet' && (
          <WalletView
            wallet={wallet}
            packages={tokenPackages}
            transactions={transactions}
            bookUnlocks={bookUnlocks}
            isAuthenticated={true}
            onPurchasePackage={handlePurchasePackage}
            onRequireAuth={handleSignIn}
            onOpenBookById={(bookId) => {
              const b = books.find((x) => x.id === bookId);
              if (b) openBookDetail(b);
            }}
          />
        )}

        {/* VIEW 8: AUTHOR PUBLISHING STUDIO */}
        {view === 'author-studio' && (
          <AuthorStudioView
            currentUserId={firebaseUser?.uid || 'demo_author_session'}
            currentUserName={
              userProfile?.displayName ||
              firebaseUser?.displayName ||
              'LitVault Author'
            }
            authorProfile={currentAuthorProfile}
            authorBooks={books.filter(
              (b) =>
                b.authorId ===
                  (currentAuthorProfile?.id ||
                    firebaseUser?.uid ||
                    'demo_author_session') ||
                b.authorId === 'author_chimamanda_adeyemi'
            )}
            chapters={chapters}
            genres={genres}
            categories={categories}
            wallet={wallet}
            withdrawals={withdrawals}
            requireBookApproval={settings.requireBookApproval}
            onRegisterAuthor={handleRegisterAuthor}
            onSaveBook={handleSaveBook}
            onSaveChapter={handleSaveChapter}
            onRequestWithdrawal={handleRequestWithdrawal}
            onOpenBook={openBookDetail}
            onOpenLegalDoc={(docType) => {
              setLegalDoc(docType);
              setView('legal');
            }}
          />
        )}

        {/* VIEW 9: ADMINISTRATOR GOVERNANCE CONSOLE */}
        {view === 'admin' && (
          <AdminDashboardView
            books={books}
            authors={authors}
            genres={genres}
            tokenPackages={tokenPackages}
            transactions={transactions}
            bookUnlocks={bookUnlocks}
            withdrawals={withdrawals}
            reports={reports}
            advertisements={advertisements}
            settings={settings}
            auditLogs={auditLogs}
            onUpdateBookStatus={async (bookId, status) => {
              setBooks((prev) =>
                prev.map((b) => (b.id === bookId ? { ...b, status } : b))
              );
              await recordAuditLog(
                `SET_BOOK_STATUS_${status.toUpperCase()}`,
                'book',
                bookId,
                `Updated book status to ${status}`
              );
            }}
            onToggleBookFeatured={async (bookId, featured, trending) => {
              setBooks((prev) =>
                prev.map((b) =>
                  b.id === bookId ? { ...b, featured, trending } : b
                )
              );
              await recordAuditLog(
                'UPDATE_CURATORIAL_FLAGS',
                'book',
                bookId,
                `Featured=${featured}, Trending=${trending}`
              );
            }}
            onUpdateAuthorStatus={async (authorId, status) => {
              setAuthors((prev) =>
                prev.map((a) => (a.id === authorId ? { ...a, status } : a))
              );
              await recordAuditLog(
                `SET_AUTHOR_STATUS_${status.toUpperCase()}`,
                'author',
                authorId,
                `Updated author status to ${status}`
              );
            }}
            onSaveGenre={async (name, description) => {
              const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const newGenre: Genre = {
                id: slug,
                name,
                slug,
                description,
                active: true,
              };
              setGenres((prev) => [...prev, newGenre]);
              await recordAuditLog(
                'CREATE_GENRE',
                'genre',
                slug,
                `Added genre ${name}`
              );
            }}
            onDeleteGenre={async (genreId) => {
              setGenres((prev) => prev.filter((g) => g.id !== genreId));
              await recordAuditLog(
                'DELETE_GENRE',
                'genre',
                genreId,
                `Removed genre ${genreId}`
              );
            }}
            onSaveTokenPackage={async (pkgData, existingId) => {
              const id = existingId || `pkg_${Date.now()}`;
              const saved: TokenPackage = { ...pkgData, id };
              setTokenPackages((prev) =>
                existingId
                  ? prev.map((p) => (p.id === existingId ? saved : p))
                  : [...prev, saved]
              );
              await recordAuditLog(
                existingId ? 'UPDATE_TOKEN_PACKAGE' : 'CREATE_TOKEN_PACKAGE',
                'tokenPackage',
                id,
                `${saved.name} (${saved.tokens} LitTokens)`
              );
            }}
            onUpdateWithdrawalStatus={async (wId, status) => {
              setWithdrawals((prev) =>
                prev.map((w) => (w.id === wId ? { ...w, status } : w))
              );
              await recordAuditLog(
                `WITHDRAWAL_${status.toUpperCase()}`,
                'withdrawal',
                wId,
                `Marked withdrawal ${wId} as ${status}`
              );
            }}
            onUpdateReportStatus={async (rId, status) => {
              setReports((prev) =>
                prev.map((r) => (r.id === rId ? { ...r, status } : r))
              );
              await recordAuditLog(
                `REPORT_${status.toUpperCase()}`,
                'report',
                rId,
                `Marked moderation report ${rId} as ${status}`
              );
            }}
            onUpdateSettings={async (newSettings) => {
              setSettings(newSettings);
              await recordAuditLog(
                'UPDATE_PLATFORM_SETTINGS',
                'settings',
                'global',
                `Royalty=${newSettings.authorRevenueSharePercent}%, RequireApproval=${newSettings.requireBookApproval}`
              );
            }}
            onToggleAdSlot={async (ad) => {
              setAdvertisements((prev) =>
                prev.map((a) =>
                  a.id === ad.id ? { ...a, enabled: !a.enabled } : a
                )
              );
              await recordAuditLog(
                'TOGGLE_AD_SLOT',
                'advertisement',
                ad.id,
                `Set ${ad.slotName} enabled=${!ad.enabled}`
              );
            }}
          />
        )}

        {/* VIEW 10: LEGAL, COPYRIGHT & TERMS */}
        {view === 'legal' && (
          <LegalPoliciesView
            initialDoc={legalDoc}
            onSubmitCopyrightReport={async (workTitle, claimant, evidence) => {
              await handleSubmitReport(
                'copyright',
                `copyright_${Date.now()}`,
                workTitle,
                `DMCA Claim by ${claimant}`,
                evidence
              );
            }}
          />
        )}
      </main>

      {/* DISTRACTION-FREE READING INTERFACE MODAL */}
      {readingBook && (
        <ReaderModal
          book={readingBook}
          chapters={chapters.filter((c) => c.bookId === readingBook.id)}
          initialChapterNumber={readingChapterNum}
          isBookUnlocked={
            !readingBook.isPremium || unlockedBookIds.includes(readingBook.id)
          }
          userTokenBalance={wallet.tokenBalance}
          savedTheme={userProfile?.readingTheme || 'light'}
          bookmarks={bookmarks.filter((b) => b.bookId === readingBook.id)}
          onClose={() => setReadingBook(null)}
          onSaveProgress={handleSaveReadingProgress}
          onAddBookmark={handleAddBookmark}
          onUnlockBook={handleUnlockBook}
          onOpenWallet={() => setView('wallet')}
          onChangeTheme={(theme: ReadingTheme) => {
            if (userProfile) {
              setUserProfile({ ...userProfile, readingTheme: theme });
            }
          }}
        />
      )}

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-stone-200 bg-[#F7F4EE] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-stone-600">
          <div className="space-y-2">
            <p className="font-serif-display text-2xl font-bold text-stone-900">
              LitVault
            </p>
            <p className="italic text-stone-500">Read. Discover. Publish.</p>
            <p className="leading-relaxed">
              An international digital reading and literary publishing ecosystem
              connecting readers and authors worldwide.
            </p>
          </div>

          <div className="space-y-2">
            <p className="uppercase tracking-widest text-stone-900 font-semibold">
              Reading & Discovery
            </p>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => setView('explore')}
                  className="hover:text-stone-900 cursor-pointer"
                >
                  Explore Full Catalog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setTierFilter('free');
                    setView('explore');
                  }}
                  className="hover:text-stone-900 cursor-pointer"
                >
                  Complimentary Free Editions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setView('authors')}
                  className="hover:text-stone-900 cursor-pointer"
                >
                  Author Directory
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setView('wallet')}
                  className="hover:text-stone-900 cursor-pointer"
                >
                  LitToken Treasury
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="uppercase tracking-widest text-stone-900 font-semibold">
              Publishing & Governance
            </p>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => setView('author-studio')}
                  className="hover:text-stone-900 cursor-pointer"
                >
                  Author Publishing Studio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setLegalDoc('agreement');
                    setView('legal');
                  }}
                  className="hover:text-stone-900 cursor-pointer"
                >
                  Author Royalty Agreement
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setView('admin')}
                  className="hover:text-stone-900 cursor-pointer"
                >
                  Administrator Console
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="uppercase tracking-widest text-stone-900 font-semibold">
              Legal & Copyright
            </p>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setLegalDoc('copyright');
                    setView('legal');
                  }}
                  className="hover:text-stone-900 cursor-pointer"
                >
                  Copyright Policy & DMCA
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setLegalDoc('terms');
                    setView('legal');
                  }}
                  className="hover:text-stone-900 cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setLegalDoc('privacy');
                    setView('legal');
                  }}
                  className="hover:text-stone-900 cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setLegalDoc('guidelines');
                    setView('legal');
                  }}
                  className="hover:text-stone-900 cursor-pointer"
                >
                  Content Guidelines
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-200/80 py-4 text-center text-[11px] text-stone-500">
          © {new Date().getFullYear()} LitVault Literary Press. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
