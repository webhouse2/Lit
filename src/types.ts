export type UserRole = 'reader' | 'author' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type ReadingTheme = 'light' | 'sepia' | 'dark';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  status: UserStatus;
  preferredGenres: string[];
  readingTheme: ReadingTheme;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuthorProfile {
  id: string;
  userId: string;
  penName: string;
  bio: string;
  photoUrl: string;
  location: string;
  website: string;
  twitterHandle: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  copyrightAgreed: boolean;
  followersCount: number;
  totalReads: number;
  averageRating: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type BookStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'suspended'
  | 'removed';

export type AgeRating = 'All Ages' | '13+' | '16+' | '18+';

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  authorId: string;
  authorName: string;
  coverUrl: string;
  description: string;
  genre: string;
  category: string;
  tags: string[];
  language: string;
  ageRating: AgeRating;
  isPremium: boolean;
  tokenPrice: number;
  status: BookStatus;
  copyrightConfirmed: boolean;
  featured: boolean;
  trending: boolean;
  chaptersCount: number;
  readsCount: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Chapter {
  id: string;
  bookId: string;
  authorId: string;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
  isPremium: boolean;
  tokenPrice: number;
  status: 'draft' | 'published';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BookmarkItem {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  chapterNumber: number;
  note: string;
  createdAt?: unknown;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  chapterNumber: number;
  percentComplete: number;
  updatedAt?: unknown;
}

export interface LibraryItem {
  id: string;
  userId: string;
  bookId: string;
  addedAt?: unknown;
}

export interface Follow {
  id: string;
  userId: string;
  authorId: string;
  createdAt?: unknown;
}

export interface Wallet {
  userId: string;
  tokenBalance: number;
  totalTokensPurchased: number;
  totalTokensSpent: number;
  authorEarningsTokens: number;
  updatedAt?: unknown;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  priceMinorUnits: number; // Stored safely in integer cents/kobo
  currency: string;
  active: boolean;
  popular: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  packageId: string;
  paymentReference: string;
  amountMinorUnits: number;
  currency: string;
  tokensPurchased: number;
  paymentProvider: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BookUnlock {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  authorId: string;
  tokensSpent: number;
  platformShareTokens: number;
  authorShareTokens: number;
  createdAt?: unknown;
}

export interface AuthorEarning {
  id: string;
  authorId: string;
  authorUserId: string;
  bookId: string;
  unlockId: string;
  tokensEarned: number;
  createdAt?: unknown;
}

export interface Withdrawal {
  id: string;
  authorId: string;
  userId: string;
  authorName: string;
  tokensAmount: number;
  payoutMethod: string;
  payoutDetails: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'book' | 'author' | 'review' | 'copyright';
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Advertisement {
  id: string;
  slotName: string;
  placement: 'homepage_banner' | 'catalog_inline' | 'book_detail_sidebar';
  enabled: boolean;
  adType: 'adsense' | 'sponsored_campaign';
  publisherId: string;
  adSlotId: string;
  headline: string;
  ctaText: string;
  ctaUrl: string;
}

export interface PlatformSettings {
  id: string;
  authorRevenueSharePercent: number;
  requireBookApproval: boolean;
  requireAuthorApproval: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  announcementBanner: string;
  adsEnabled: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt?: unknown;
}
