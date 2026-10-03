import React, { useState, useEffect } from 'react';
import {
  Book,
  Chapter,
  AuthorProfile,
  Review,
  Advertisement,
} from '../types';
import { BookCoverImage } from './BookCoverImage';
import { AdSlotBanner } from './AdSlotBanner';
import {
  BookOpen,
  Coins,
  Star,
  Bookmark,
  Share2,
  Flag,
  Check,
  Lock,
  ArrowLeft,
  UserPlus,
  UserCheck,
} from 'lucide-react';

interface BookDetailViewProps {
  book: Book;
  chapters: Chapter[];
  author?: AuthorProfile;
  reviews: Review[];
  relatedBooks: Book[];
  isUnlocked: boolean;
  isInLibrary: boolean;
  isFollowingAuthor: boolean;
  userTokenBalance: number;
  isAuthenticated: boolean;
  sidebarAd?: Advertisement;
  globalAdsEnabled: boolean;
  onBack: () => void;
  onStartReading: (chapterNumber?: number) => void;
  onUnlockBook: (book: Book) => Promise<void>;
  onToggleLibrary: (book: Book) => Promise<void>;
  onToggleFollowAuthor: (authorId: string) => Promise<void>;
  onSubmitReview: (bookId: string, rating: number, comment: string) => Promise<void>;
  onSubmitReport: (
    targetType: 'book' | 'copyright',
    targetId: string,
    targetTitle: string,
    reason: string,
    details: string
  ) => Promise<void>;
  onSelectBook: (book: Book) => void;
  onSelectAuthor: (authorId: string) => void;
  onOpenWallet: () => void;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  chapters,
  author,
  reviews,
  relatedBooks,
  isUnlocked,
  isInLibrary,
  isFollowingAuthor,
  userTokenBalance,
  isAuthenticated,
  sidebarAd,
  globalAdsEnabled,
  onBack,
  onStartReading,
  onUnlockBook,
  onToggleLibrary,
  onToggleFollowAuthor,
  onSubmitReview,
  onSubmitReport,
  onSelectBook,
  onSelectAuthor,
  onOpenWallet,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'book' | 'copyright'>('book');
  const [reportReason, setReportReason] = useState('Copyright or Plagiarism Concern');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const bookChapters = [...chapters]
    .filter((c) => c.bookId === book.id && c.status === 'published')
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  // Dynamic SEO & Structured Data for Book Page
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${book.title} by ${book.authorName} — LitVault`;
    return () => {
      document.title = prevTitle;
    };
  }, [book.title, book.authorName]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?book=${book.slug || book.id}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingReview(true);
    try {
      await onSubmitReview(book.id, rating, comment.trim());
      setComment('');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) return;
    await onSubmitReport(
      reportType,
      book.id,
      book.title,
      reportReason,
      reportDetails.trim()
    );
    setReportDetails('');
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setShowReportModal(false);
    }, 1800);
  };

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      await onUnlockBook(book);
    } finally {
      setUnlocking(false);
    }
  };

  const bookSchemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.authorName,
    },
    genre: book.genre,
    inLanguage: book.language,
    description: book.description,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: book.ratingAvg,
      reviewCount: Math.max(book.ratingCount, 1),
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: bookSchemaJson }}
      />

      {/* Breadcrumb Back Navigation */}
      <div className="mb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span>{book.genre}</span>
          <span aria-hidden="true">·</span>
          <span>{book.category}</span>
          <span aria-hidden="true">·</span>
          <span>{book.language}</span>
        </div>
      </div>

      {/* Contiguous Purchase & Reading Module */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-stone-200">
        {/* Left Column: High-Resolution Cover Presentation */}
        <div className="lg:col-span-4">
          <div className="aspect-[3/4] w-full max-w-xs mx-auto lg:max-w-none bg-stone-100 border border-stone-200 overflow-hidden shadow-sm">
            <BookCoverImage
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              title={book.title}
              author={book.authorName}
            />
          </div>
        </div>

        {/* Right Column: Editorial Metadata & Primary Actions */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
              <span className="font-semibold uppercase tracking-widest text-[#9A3412]">
                {book.isPremium
                  ? isUnlocked
                    ? 'Premium Edition · Unlocked'
                    : `Premium Edition · ${book.tokenPrice} LitTokens`
                  : 'Complimentary Open Edition'}
              </span>
              <span aria-hidden="true">·</span>
              <span>Age Rating: {book.ageRating}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">
                {book.readsCount.toLocaleString()} reads
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-mono-tabular">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {book.ratingAvg.toFixed(1)} ({book.ratingCount})
              </span>
            </div>

            <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold text-stone-900 leading-tight">
              {book.title}
            </h1>

            {book.subtitle && (
              <p className="font-serif-display italic text-xl text-stone-600">
                {book.subtitle}
              </p>
            )}

            <div className="pt-1 flex items-center gap-3 text-sm">
              <span className="text-stone-500">By</span>
              <button
                type="button"
                onClick={() => onSelectAuthor(book.authorId)}
                className="font-medium text-stone-900 underline underline-offset-4 hover:text-[#9A3412] transition-colors cursor-pointer"
              >
                {book.authorName}
              </button>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <p className="font-prose text-base text-stone-700 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>

            {book.tags.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="uppercase tracking-widest text-[11px] text-stone-400">
                  Index Themes:
                </span>
                {book.tags.map((tag, i) => (
                  <React.Fragment key={tag}>
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <span>{tag}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-6 border-t border-stone-200 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onStartReading(1)}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-[#FBF9F5] hover:bg-stone-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {book.isPremium && !isUnlocked
                    ? 'Read Sample Chapter'
                    : 'Read Book Now'}
                </span>
              </button>

              {book.isPremium && !isUnlocked && (
                <>
                  {userTokenBalance >= book.tokenPrice || !isAuthenticated ? (
                    <button
                      type="button"
                      disabled={unlocking}
                      onClick={handleUnlock}
                      className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider bg-[#9A3412] text-white hover:bg-[#7C2D12] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Coins className="w-4 h-4" />
                      <span>
                        {unlocking
                          ? 'Unlocking...'
                          : `Unlock Full Book (${book.tokenPrice} LitTokens)`}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenWallet}
                      className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider bg-[#9A3412] text-white hover:bg-[#7C2D12] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Coins className="w-4 h-4" />
                      <span>
                        Buy LitTokens to Unlock ({book.tokenPrice} LitTokens)
                      </span>
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={() => onToggleLibrary(book)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  isInLibrary
                    ? 'border-stone-900 bg-stone-100 text-stone-900'
                    : 'border-stone-300 text-stone-700 hover:border-stone-900'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isInLibrary ? 'Saved in Library' : 'Add to Library'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-4 py-3 text-xs font-medium border border-stone-300 text-stone-700 hover:border-stone-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-3 text-xs text-stone-500 hover:text-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters & Author Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-12 border-b border-stone-200">
        {/* Chapter List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              Table of Contents
            </h2>
            <span className="text-xs font-mono-tabular text-stone-500">
              {bookChapters.length} Chapters
            </span>
          </div>

          {bookChapters.length === 0 ? (
            <p className="text-sm text-stone-500 py-6 border border-stone-200 px-4">
              No chapters have been published for this work yet.
            </p>
          ) : (
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {bookChapters.map((chap) => {
                const locked =
                  (book.isPremium || chap.isPremium) &&
                  chap.chapterNumber > 1 &&
                  !isUnlocked;
                return (
                  <button
                    key={chap.id}
                    type="button"
                    onClick={() => onStartReading(chap.chapterNumber)}
                    className="w-full py-4 px-3 flex items-center justify-between text-left hover:bg-stone-100/80 transition-colors cursor-pointer"
                  >
                    <div className="space-y-0.5 pr-4">
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="font-mono-tabular">
                          Chapter {String(chap.chapterNumber).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">{chap.wordCount} words</span>
                        {chap.chapterNumber === 1 && book.isPremium && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-medium">
                              Free Preview
                            </span>
                          </>
                        )}
                      </div>
                      <p className="font-serif-display text-lg font-medium text-stone-900">
                        {chap.title}
                      </p>
                    </div>

                    <div className="shrink-0 text-xs font-medium">
                      {locked ? (
                        <span className="inline-flex items-center gap-1 text-[#9A3412]">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </span>
                      ) : (
                        <span className="text-stone-600 underline underline-offset-4">
                          Read
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* About the Author & Sidebar Ad */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-6 border border-stone-200 bg-[#F7F4EE] space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-500">
                  About the Author
                </p>
                <h3 className="font-serif-display text-2xl font-semibold text-stone-900 mt-0.5">
                  {author?.penName || book.authorName}
                </h3>
                {author?.location && (
                  <p className="text-xs text-stone-500 mt-0.5">{author.location}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onToggleFollowAuthor(book.authorId)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  isFollowingAuthor
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-300 bg-white text-stone-900 hover:border-stone-900'
                }`}
              >
                {isFollowingAuthor ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow Author</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-stone-700 leading-relaxed">
              {author?.bio ||
                `${book.authorName} is a published literary voice on LitVault.`}
            </p>

            <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
              <span className="font-mono-tabular">
                {(author?.followersCount || 0).toLocaleString()} Followers
              </span>
              <button
                type="button"
                onClick={() => onSelectAuthor(book.authorId)}
                className="font-medium text-[#9A3412] hover:underline cursor-pointer"
              >
                View Full Author Profile →
              </button>
            </div>
          </div>

          <AdSlotBanner
            ad={sidebarAd}
            globalAdsEnabled={globalAdsEnabled}
            onNavigate={() => onOpenWallet()}
          />
        </div>
      </div>

      {/* Reader Reviews & Ratings */}
      <section className="py-12 border-b border-stone-200 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
            Reader Critical Reception
          </h2>
          <p className="text-sm text-stone-600">
            Share a thoughtful critique or reflection for fellow readers and the
            author.
          </p>

          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`px-3 py-1.5 text-xs font-mono-tabular border cursor-pointer ${
                      rating >= star
                        ? 'border-amber-600 bg-amber-50/70 text-amber-900 font-semibold'
                        : 'border-stone-200 text-stone-400'
                    }`}
                  >
                    {star} ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
                Your Review
              </label>
              <textarea
                rows={4}
                required
                maxLength={1500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your critique of the narrative, prose style, and pacing..."
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 bg-white focus:outline-none focus:border-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {submittingReview ? 'Publishing Review...' : 'Post Review'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 border border-stone-200 text-center text-sm text-stone-500">
              No reviews yet. Be the first reader to review {book.title}.
            </div>
          ) : (
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {reviews.map((rev) => (
                <article key={rev.id} className="py-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-900">{rev.userName}</span>
                    <span className="font-mono-tabular text-amber-700">
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(Math.max(0, 5 - rev.rating))} ({rev.rating}/5)
                    </span>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">{rev.comment}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="pt-12 space-y-6">
          <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
            Related Works in {book.genre}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedBooks.slice(0, 3).map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectBook(rel)}
                className="group cursor-pointer border border-stone-200 bg-white p-4 flex gap-4 hover:border-stone-400 transition-colors"
              >
                <div className="w-20 aspect-[3/4] shrink-0 overflow-hidden bg-stone-100">
                  <BookCoverImage
                    src={rel.coverUrl}
                    alt={rel.title}
                    title={rel.title}
                    author={rel.authorName}
                  />
                </div>
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-stone-500">
                      {rel.genre}
                    </p>
                    <h3 className="font-serif-display text-lg font-semibold text-stone-900 group-hover:text-[#9A3412] truncate">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-stone-600 truncate">{rel.authorName}</p>
                  </div>
                  <p className="text-xs font-mono-tabular text-stone-700">
                    {rel.isPremium ? `${rel.tokenPrice} LitTokens` : 'Free Read'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Report Content / Copyright Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] border border-stone-300 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
                Report Content or Copyright Issue
              </h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-xs text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                Close
              </button>
            </div>

            {reportSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-sm font-medium text-emerald-800">
                  Report submitted to LitVault Trust & Safety Moderation Queue.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
                    Report Category
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) =>
                      setReportType(e.target.value as 'book' | 'copyright')
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-300 bg-white"
                  >
                    <option value="book">Content Guidelines Violation</option>
                    <option value="copyright">
                      Formal Copyright / DMCA Infringement Notice
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
                    Primary Reason
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
                    Detailed Evidence & Statement
                  </label>
                  <textarea
                    rows={4}
                    required
                    minLength={10}
                    maxLength={1500}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide specific chapters, provenance details, or policy violations..."
                    className="w-full px-3 py-2 text-xs border border-stone-300 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-xs border border-stone-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-[#9A3412] text-white cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
