import React, { useState } from 'react';
import {
  AuthorProfile,
  Book,
  Chapter,
  Genre,
  Category,
  Withdrawal,
  Wallet,
  AgeRating,
} from '../types';
import { COVER_IMAGES } from '../data/seedData';
import { BookCoverImage } from './BookCoverImage';
import {
  Plus,
  BookOpen,
  Coins,
  FileText,
  CheckCircle2,
  Send,
  Edit3,
  Eye,
} from 'lucide-react';

interface AuthorStudioViewProps {
  currentUserId?: string;
  currentUserName?: string;
  authorProfile?: AuthorProfile;
  authorBooks: Book[];
  chapters: Chapter[];
  genres: Genre[];
  categories: Category[];
  wallet: Wallet;
  withdrawals: Withdrawal[];
  requireBookApproval: boolean;
  onRegisterAuthor: (data: {
    penName: string;
    bio: string;
    location: string;
    website: string;
    twitterHandle: string;
    copyrightAgreed: boolean;
  }) => Promise<void>;
  onSaveBook: (
    bookData: Omit<
      Book,
      'id' | 'authorId' | 'authorName' | 'featured' | 'trending' | 'readsCount' | 'ratingAvg' | 'ratingCount'
    >,
    existingBookId?: string
  ) => Promise<string>;
  onSaveChapter: (
    chapterData: Omit<Chapter, 'id' | 'authorId'>,
    existingChapterId?: string
  ) => Promise<void>;
  onRequestWithdrawal: (
    tokensAmount: number,
    payoutMethod: string,
    payoutDetails: string
  ) => Promise<void>;
  onOpenBook: (book: Book) => void;
  onOpenLegalDoc: (doc: 'copyright' | 'agreement') => void;
}

export const AuthorStudioView: React.FC<AuthorStudioViewProps> = ({
  currentUserId,
  currentUserName,
  authorProfile,
  authorBooks,
  chapters,
  genres,
  categories,
  wallet,
  withdrawals,
  requireBookApproval,
  onRegisterAuthor,
  onSaveBook,
  onSaveChapter,
  onRequestWithdrawal,
  onOpenBook,
  onOpenLegalDoc,
}) => {
  // Author Registration State
  const [penName, setPenName] = useState(currentUserName || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [website, setWebsite] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [copyrightAgreed, setCopyrightAgreed] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Studio Tab State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'new-book' | 'chapters' | 'royalties'
  >('overview');

  // Book Form State
  const [editingBookId, setEditingBookId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [coverUrl, setCoverUrl] = useState(COVER_IMAGES.lagosNocturne);
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState(genres[0]?.name || 'African Literature');
  const [category, setCategory] = useState(categories[0]?.name || 'Full-Length Novel');
  const [tagsInput, setTagsInput] = useState('Literary, Contemporary');
  const [language, setLanguage] = useState('English');
  const [ageRating, setAgeRating] = useState<AgeRating>('13+');
  const [isPremium, setIsPremium] = useState(false);
  const [tokenPrice, setTokenPrice] = useState(50);
  const [submitMode, setSubmitMode] = useState<'draft' | 'publish'>('publish');
  const [copyrightConfirmed, setCopyrightConfirmed] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [studioNotice, setStudioNotice] = useState<string | null>(null);

  // Chapter Form State
  const [selectedBookIdForChapter, setSelectedBookIdForChapter] = useState<string>(
    authorBooks[0]?.id || ''
  );
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [chapterIsPremium, setChapterIsPremium] = useState(false);
  const [savingChapter, setSavingChapter] = useState(false);

  // Withdrawal Form State
  const [withdrawTokens, setWithdrawTokens] = useState(50);
  const [payoutMethod, setPayoutMethod] = useState('Paystack Bank Settlement');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [requestingWithdrawal, setRequestingWithdrawal] = useState(false);

  if (!currentUserId) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
        <p className="text-xs uppercase tracking-widest text-stone-500">
          LitVault Author Studio
        </p>
        <h1 className="font-serif-display text-4xl font-semibold text-stone-900">
          Publish Your Work to an International Readership
        </h1>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          Please sign in with your Google account in the top navigation bar to
          register your Author Profile, upload manuscripts, and earn 75% royalties
          on every LitToken unlock.
        </p>
      </div>
    );
  }

  // Step 1: If user has not registered an Author Profile yet
  if (!authorProfile) {
    const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!copyrightAgreed) return;
      setRegistering(true);
      try {
        await onRegisterAuthor({
          penName: penName.trim(),
          bio: bio.trim(),
          location: location.trim(),
          website: website.trim(),
          twitterHandle: twitterHandle.trim(),
          copyrightAgreed,
        });
      } finally {
        setRegistering(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12 space-y-8">
        <div className="space-y-2 border-b border-stone-200 pb-6">
          <p className="text-xs uppercase tracking-widest text-[#9A3412]">
            Author Onboarding & Rights Verification
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-stone-900">
            Establish Your LitVault Author Imprint
          </h1>
          <p className="text-sm text-stone-600">
            Complete your biographical dossier and confirm original copyright
            ownership to access the publishing studio.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5 bg-white border border-stone-200 p-6 sm:p-8">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
              Pen Name / Literary Byline *
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={120}
              value={penName}
              onChange={(e) => setPenName(e.target.value)}
              placeholder="e.g., Zainab Adeyemi-Cole"
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 focus:outline-none focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
              City & Country *
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={120}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Accra, Ghana · London, UK"
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 focus:outline-none focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
              Author Biography (min 10 characters) *
            </label>
            <textarea
              rows={4}
              required
              minLength={10}
              maxLength={2000}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your literary background, themes, and previous publications..."
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
                Official Website (Optional)
              </label>
              <input
                type="text"
                maxLength={300}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-sm border border-stone-300"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
                X / Social Handle (Optional)
              </label>
              <input
                type="text"
                maxLength={80}
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@yourhandle"
                className="w-full px-3.5 py-2 text-sm border border-stone-300"
              />
            </div>
          </div>

          <div className="p-4 border border-stone-200 bg-[#FBF9F5] space-y-2">
            <label className="flex items-start gap-3 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={copyrightAgreed}
                onChange={(e) => setCopyrightAgreed(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I affirm under penalty of perjury that I am the original creator or
                authorized rights-holder of all works I submit to LitVault, and I
                accept the{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc('agreement')}
                  className="underline text-[#9A3412] font-medium"
                >
                  Author Publishing & Royalty Agreement
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc('copyright')}
                  className="underline text-[#9A3412] font-medium"
                >
                  Copyright Policy
                </button>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={registering || !copyrightAgreed}
            className="w-full py-3 px-6 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white hover:bg-[#9A3412] disabled:opacity-40 transition-colors cursor-pointer"
          >
            {registering ? 'Creating Author Imprint...' : 'Complete Author Registration'}
          </button>
        </form>
      </div>
    );
  }

  const totalReads = authorBooks.reduce((acc, b) => acc + b.readsCount, 0);

  const handleEditBookClick = (b: Book) => {
    setEditingBookId(b.id);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setCoverUrl(b.coverUrl);
    setDescription(b.description);
    setGenre(b.genre);
    setCategory(b.category);
    setTagsInput(b.tags.join(', '));
    setLanguage(b.language);
    setAgeRating(b.ageRating);
    setIsPremium(b.isPremium);
    setTokenPrice(b.tokenPrice);
    setCopyrightConfirmed(true);
    setActiveTab('new-book');
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copyrightConfirmed) return;
    setSavingBook(true);
    setStudioNotice(null);
    try {
      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `book-${Date.now()}`;
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);

      const targetStatus =
        submitMode === 'draft'
          ? 'draft'
          : requireBookApproval
          ? 'pending_review'
          : 'published';

      const existingBook = authorBooks.find((b) => b.id === editingBookId);

      const savedId = await onSaveBook(
        {
          slug,
          title: title.trim(),
          subtitle: subtitle.trim(),
          coverUrl: coverUrl.trim() || COVER_IMAGES.lagosNocturne,
          description: description.trim(),
          genre,
          category,
          tags,
          language,
          ageRating,
          isPremium,
          tokenPrice: isPremium ? Math.max(1, Math.round(tokenPrice)) : 0,
          status: targetStatus,
          copyrightConfirmed: true,
          chaptersCount: existingBook ? existingBook.chaptersCount : 0,
        },
        editingBookId
      );

      setSelectedBookIdForChapter(savedId);
      setStudioNotice(
        submitMode === 'draft'
          ? `Saved "${title}" as a draft.`
          : requireBookApproval
          ? `Submitted "${title}" for editorial moderation approval.`
          : `Published "${title}" live to the catalog!`
      );
      setEditingBookId(undefined);
      setTitle('');
      setSubtitle('');
      setDescription('');
      setActiveTab('chapters');
    } finally {
      setSavingBook(false);
    }
  };

  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetBookId = selectedBookIdForChapter || authorBooks[0]?.id;
    if (!targetBookId || !chapterTitle.trim() || !chapterContent.trim()) return;
    setSavingChapter(true);
    setStudioNotice(null);
    try {
      const words = chapterContent
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      await onSaveChapter({
        bookId: targetBookId,
        chapterNumber: Math.max(1, Math.round(chapterNumber)),
        title: chapterTitle.trim(),
        content: chapterContent.trim(),
        wordCount: words,
        isPremium: chapterIsPremium,
        tokenPrice: chapterIsPremium ? 50 : 0,
        status: 'published',
      });
      setStudioNotice(
        `Chapter ${chapterNumber} ("${chapterTitle}") published and synced to manuscript.`
      );
      setChapterNumber((n) => n + 1);
      setChapterTitle('');
      setChapterContent('');
    } finally {
      setSavingChapter(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutDetails.trim() || withdrawTokens > wallet.authorEarningsTokens) return;
    setRequestingWithdrawal(true);
    try {
      await onRequestWithdrawal(
        Math.round(withdrawTokens),
        payoutMethod,
        payoutDetails.trim()
      );
      setPayoutDetails('');
      setStudioNotice('Withdrawal request submitted to LitVault Treasury.');
    } finally {
      setRequestingWithdrawal(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Studio Top Header */}
      <header className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="uppercase tracking-widest">Author Publishing Studio</span>
            <span aria-hidden="true">·</span>
            <span>Pen Name: {authorProfile.penName}</span>
            <span aria-hidden="true">·</span>
            <span className="uppercase font-medium text-emerald-800">
              Status: {authorProfile.status}
            </span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-stone-900 mt-1">
            Manuscripts, Chapters & Royalties
          </h1>
        </div>

        {/* Interactive Studio Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-200/70 border border-stone-300">
          {(
            [
              { id: 'overview', label: 'Studio Overview' },
              { id: 'new-book', label: editingBookId ? 'Edit Book' : '+ New Book' },
              { id: 'chapters', label: 'Chapter Manager' },
              { id: 'royalties', label: 'Royalties & Payouts' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {studioNotice && (
        <div className="p-4 border border-emerald-700/30 bg-emerald-50/80 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{studioNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setStudioNotice(null)}
            className="underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Analytics Metric Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-stone-200">
          <p className="text-xs uppercase tracking-wider text-stone-500">
            Published Works
          </p>
          <p className="font-mono-tabular text-3xl font-semibold text-stone-900 mt-1">
            {authorBooks.length}
          </p>
        </div>
        <div className="p-5 bg-white border border-stone-200">
          <p className="text-xs uppercase tracking-wider text-stone-500">
            Total Manuscript Reads
          </p>
          <p className="font-mono-tabular text-3xl font-semibold text-stone-900 mt-1">
            {totalReads.toLocaleString()}
          </p>
        </div>
        <div className="p-5 bg-white border border-stone-200">
          <p className="text-xs uppercase tracking-wider text-stone-500">
            Author Followers
          </p>
          <p className="font-mono-tabular text-3xl font-semibold text-stone-900 mt-1">
            {authorProfile.followersCount.toLocaleString()}
          </p>
        </div>
        <div className="p-5 bg-white border border-stone-200">
          <p className="text-xs uppercase tracking-wider text-stone-500">
            Royalty Balance (LitTokens)
          </p>
          <p className="font-mono-tabular text-3xl font-semibold text-[#9A3412] mt-1">
            {wallet.authorEarningsTokens.toLocaleString()}
          </p>
        </div>
      </section>

      {/* TAB 1: STUDIO OVERVIEW */}
      {activeTab === 'overview' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              Your Literary Catalog
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingBookId(undefined);
                setActiveTab('new-book');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white hover:bg-[#9A3412] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Book</span>
            </button>
          </div>

          {authorBooks.length === 0 ? (
            <div className="p-12 border border-stone-200 bg-white text-center space-y-3">
              <p className="font-serif-display text-2xl text-stone-800">
                Your Author Catalog is Empty
              </p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Start publishing your first novel, short story anthology, or poetry
                collection.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('new-book')}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#9A3412] text-white cursor-pointer"
              >
                Upload First Book
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authorBooks.map((b) => {
                const bookChaps = chapters.filter((c) => c.bookId === b.id);
                return (
                  <div
                    key={b.id}
                    className="border border-stone-200 bg-white p-5 flex gap-5"
                  >
                    <div className="w-24 aspect-[3/4] shrink-0 bg-stone-100 border border-stone-200 overflow-hidden">
                      <BookCoverImage
                        src={b.coverUrl}
                        alt={b.title}
                        title={b.title}
                        author={b.authorName}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-stone-500">
                          <span>Status: {b.status.replace('_', ' ')}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {b.isPremium ? `${b.tokenPrice} LitTokens` : 'Free'}
                          </span>
                        </div>
                        <h3 className="font-serif-display text-xl font-semibold text-stone-900 truncate">
                          {b.title}
                        </h3>
                        <p className="text-xs text-stone-500 font-mono-tabular">
                          {bookChaps.length} Chapters · {b.readsCount.toLocaleString()}{' '}
                          Reads · {b.ratingAvg.toFixed(1)} ★
                        </p>
                      </div>

                      <div className="pt-4 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditBookClick(b)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-stone-300 hover:border-stone-900 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Metadata</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBookIdForChapter(b.id);
                            setChapterNumber(bookChaps.length + 1);
                            setActiveTab('chapters');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-stone-300 hover:border-stone-900 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>+ Add Chapter</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenBook(b)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#9A3412] hover:underline cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Page</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: CREATE / EDIT BOOK */}
      {activeTab === 'new-book' && (
        <form
          onSubmit={handleBookSubmit}
          className="bg-white border border-stone-200 p-6 sm:p-8 space-y-6"
        >
          <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              {editingBookId ? 'Edit Book Details' : 'Submit New Literary Work'}
            </h2>
            <span className="text-xs text-stone-500">
              {requireBookApproval
                ? 'Admin Moderation Queue Active'
                : 'Direct Publishing Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
                Book Title *
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The Lanterns of Kano"
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
                Subtitle
              </label>
              <input
                type="text"
                maxLength={240}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., A Novel of Trade and Devotion"
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
                Primary Genre *
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 bg-white"
              >
                {genres.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
                Editorial Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
                Age Rating *
              </label>
              <select
                value={ageRating}
                onChange={(e) => setAgeRating(e.target.value as AgeRating)}
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 bg-white"
              >
                {(['All Ages', '13+', '16+', '18+'] as AgeRating[]).map((ar) => (
                  <option key={ar} value={ar}>
                    {ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Artwork Selector */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-stone-600">
              Cover Artwork (Select Curated Print Cover or Provide URL)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Indigo & Gold Relief', url: COVER_IMAGES.lagosNocturne },
                { label: 'Sahara Astrolabe', url: COVER_IMAGES.saharaChronicles },
                { label: 'Coastal Archways', url: COVER_IMAGES.echoesOfAccra },
                { label: 'Bronze Courtyard', url: COVER_IMAGES.ironAndIvory },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCoverUrl(preset.url)}
                  className={`p-2 border text-left text-xs cursor-pointer ${
                    coverUrl === preset.url
                      ? 'border-[#9A3412] bg-amber-50/40 font-semibold'
                      : 'border-stone-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              maxLength={500}
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="Or paste custom cover image URL..."
              className="w-full px-3.5 py-2 text-xs border border-stone-300 mt-2"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
              Synopsis & Editorial Description (min 10 characters) *
            </label>
            <textarea
              rows={5}
              required
              minLength={10}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a compelling synopsis for readers..."
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
                Thematic Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
                Access Tier
              </label>
              <select
                value={isPremium ? 'premium' : 'free'}
                onChange={(e) => setIsPremium(e.target.value === 'premium')}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 bg-white"
              >
                <option value="free">Complimentary (Free to All Readers)</option>
                <option value="premium">Premium Edition (LitTokens Unlock)</option>
              </select>
            </div>

            {isPremium && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
                  Unlock Price (LitTokens)
                </label>
                <input
                  type="number"
                  min={5}
                  max={10000}
                  value={tokenPrice}
                  onChange={(e) => setTokenPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular border border-stone-300"
                />
              </div>
            )}
          </div>

          <div className="p-4 border border-stone-200 bg-[#FBF9F5]">
            <label className="flex items-start gap-3 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={copyrightConfirmed}
                onChange={(e) => setCopyrightConfirmed(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I confirm that I hold the exclusive digital publishing rights to this
                book and that it does not infringe upon any third-party copyright or
                intellectual property.
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="submit"
              disabled={savingBook}
              onClick={() => setSubmitMode('draft')}
              className="px-5 py-2.5 text-xs font-medium border border-stone-300 text-stone-800 hover:border-stone-900 cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={savingBook || !copyrightConfirmed}
              onClick={() => setSubmitMode('publish')}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#9A3412] text-white hover:bg-[#7C2D12] disabled:opacity-40 cursor-pointer"
            >
              {savingBook
                ? 'Saving Manuscript...'
                : requireBookApproval
                ? 'Submit Book for Approval'
                : 'Publish Book Now'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CHAPTER MANAGER */}
      {activeTab === 'chapters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleChapterSubmit}
            className="lg:col-span-7 bg-white border border-stone-200 p-6 sm:p-8 space-y-5"
          >
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              Add / Publish Chapter
            </h2>

            {authorBooks.length === 0 ? (
              <p className="text-xs text-stone-500">
                Please create a book first before adding chapters.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                      Select Book *
                    </label>
                    <select
                      value={selectedBookIdForChapter}
                      onChange={(e) => setSelectedBookIdForChapter(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 bg-white"
                    >
                      {authorBooks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                      Chapter # *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      required
                      value={chapterNumber}
                      onChange={(e) => setChapterNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono-tabular border border-stone-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                    Chapter Title *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    placeholder="e.g., Chapter I: The Monsoon Arrives"
                    className="w-full px-3.5 py-2 text-sm border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                    Chapter Literary Prose *
                  </label>
                  <textarea
                    rows={10}
                    required
                    maxLength={100000}
                    value={chapterContent}
                    onChange={(e) => setChapterContent(e.target.value)}
                    placeholder="Paste or compose your chapter prose here. Separate paragraphs with a blank line..."
                    className="w-full px-3.5 py-2.5 text-sm font-prose border border-stone-300 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chapterIsPremium}
                      onChange={(e) => setChapterIsPremium(e.target.checked)}
                    />
                    <span>Mark as Premium Chapter (Chapter 1 is always free preview)</span>
                  </label>

                  <button
                    type="submit"
                    disabled={savingChapter}
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white hover:bg-[#9A3412] cursor-pointer"
                  >
                    {savingChapter ? 'Publishing...' : 'Publish Chapter'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="lg:col-span-5 bg-white border border-stone-200 p-6 space-y-4">
            <h3 className="font-serif-display text-xl font-semibold text-stone-900">
              Existing Chapters
            </h3>
            <div className="divide-y divide-stone-200">
              {chapters
                .filter(
                  (c) =>
                    c.bookId === (selectedBookIdForChapter || authorBooks[0]?.id)
                )
                .sort((a, b) => a.chapterNumber - b.chapterNumber)
                .map((chap) => (
                  <div key={chap.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-stone-900">
                        Ch. {chap.chapterNumber}: {chap.title}
                      </p>
                      <p className="text-stone-500 font-mono-tabular">
                        {chap.wordCount} words ·{' '}
                        {chap.isPremium ? 'Premium' : 'Free'}
                      </p>
                    </div>
                    <span className="uppercase text-[11px] text-emerald-700">
                      {chap.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROYALTIES & PAYOUT WITHDRAWALS */}
      {activeTab === 'royalties' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleWithdrawalSubmit}
            className="lg:col-span-6 bg-white border border-stone-200 p-6 sm:p-8 space-y-5"
          >
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              Request Royalty Withdrawal
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your available author royalty balance is{' '}
              <strong className="font-mono-tabular text-[#9A3412]">
                {wallet.authorEarningsTokens} LitTokens
              </strong>
              . Minimum withdrawal threshold is 10 LitTokens.
            </p>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                LitTokens to Withdraw *
              </label>
              <input
                type="number"
                min={10}
                max={Math.max(10, wallet.authorEarningsTokens)}
                required
                value={withdrawTokens}
                onChange={(e) => setWithdrawTokens(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-mono-tabular border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                Settlement Channel *
              </label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 bg-white"
              >
                <option value="Paystack Bank Settlement">
                  Paystack Direct Bank Settlement (NGN / GHS / KES / ZAR)
                </option>
                <option value="Wise International Wire">
                  Wise International Transfer (USD / EUR / GBP)
                </option>
                <option value="Stripe Express Payout">
                  Stripe Express Author Payout
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                Beneficiary Bank / Account Reference *
              </label>
              <input
                type="text"
                required
                minLength={4}
                maxLength={280}
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                placeholder="Bank Name, Account Number / IBAN..."
                className="w-full px-3.5 py-2 text-sm border border-stone-300"
              />
            </div>

            <button
              type="submit"
              disabled={
                requestingWithdrawal || wallet.authorEarningsTokens < 10
              }
              className="w-full py-3 px-5 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white hover:bg-[#9A3412] disabled:opacity-40 cursor-pointer"
            >
              {requestingWithdrawal
                ? 'Submitting Payout Request...'
                : 'Submit Withdrawal Request'}
            </button>
          </form>

          <div className="lg:col-span-6 bg-white border border-stone-200 p-6 space-y-4">
            <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
              Withdrawal History
            </h3>
            {withdrawals.length === 0 ? (
              <p className="text-xs text-stone-500 py-8 text-center">
                No withdrawal requests submitted yet.
              </p>
            ) : (
              <div className="divide-y divide-stone-200">
                {withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="py-3.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-stone-900">
                        {w.tokensAmount} LitTokens · {w.payoutMethod}
                      </p>
                      <p className="text-stone-500">{w.payoutDetails}</p>
                    </div>
                    <span className="uppercase font-mono-tabular font-semibold text-stone-800">
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
