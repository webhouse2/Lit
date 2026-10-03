import React, { useState, useEffect } from 'react';
import { Book, Chapter, ReadingTheme, BookmarkItem } from '../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Lock,
  SlidersHorizontal,
  Coins,
  Check,
} from 'lucide-react';

interface ReaderModalProps {
  book: Book;
  chapters: Chapter[];
  initialChapterNumber?: number;
  isBookUnlocked: boolean;
  userTokenBalance: number;
  savedTheme: ReadingTheme;
  bookmarks: BookmarkItem[];
  onClose: () => void;
  onSaveProgress: (chapter: Chapter, percentComplete: number) => void;
  onAddBookmark: (chapter: Chapter, note: string) => Promise<void>;
  onUnlockBook: (book: Book) => Promise<void>;
  onOpenWallet: () => void;
  onChangeTheme: (theme: ReadingTheme) => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  book,
  chapters,
  initialChapterNumber = 1,
  isBookUnlocked,
  userTokenBalance,
  savedTheme,
  bookmarks,
  onClose,
  onSaveProgress,
  onAddBookmark,
  onUnlockBook,
  onOpenWallet,
  onChangeTheme,
}) => {
  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const [currentIdx, setCurrentIdx] = useState(() => {
    const found = sortedChapters.findIndex((c) => c.chapterNumber === initialChapterNumber);
    return found >= 0 ? found : 0;
  });

  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [readingWidth, setReadingWidth] = useState<'narrow' | 'classic' | 'wide'>('classic');
  const [theme, setTheme] = useState<ReadingTheme>(savedTheme || 'light');
  const [showControls, setShowControls] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [bookmarkSaved, setBookmarkSaved] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const currentChapter = sortedChapters[currentIdx];

  const isChapterLocked =
    currentChapter &&
    (book.isPremium || currentChapter.isPremium) &&
    currentChapter.chapterNumber > 1 &&
    !isBookUnlocked;

  useEffect(() => {
    if (currentChapter && !isChapterLocked) {
      const percent = Math.round(((currentIdx + 1) / Math.max(sortedChapters.length, 1)) * 100);
      onSaveProgress(currentChapter, percent);
    }
  }, [currentIdx, currentChapter?.id, isChapterLocked]);

  const handleThemeSelect = (newTheme: ReadingTheme) => {
    setTheme(newTheme);
    onChangeTheme(newTheme);
  };

  const handleBookmarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChapter) return;
    await onAddBookmark(
      currentChapter,
      bookmarkNote.trim() || `Bookmarked at Chapter ${currentChapter.chapterNumber}: ${currentChapter.title}`
    );
    setBookmarkNote('');
    setShowBookmarkForm(false);
    setBookmarkSaved(true);
    setTimeout(() => setBookmarkSaved(false), 2500);
  };

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      await onUnlockBook(book);
    } finally {
      setUnlocking(false);
    }
  };

  const themeClasses: Record<ReadingTheme, string> = {
    light: 'bg-[#FBF9F5] text-[#1C1917]',
    sepia: 'bg-[#F3EAD8] text-[#2C221E]',
    dark: 'bg-[#121214] text-[#E7E5E4] tracking-[0.01em]',
  };

  const headerBorderClasses: Record<ReadingTheme, string> = {
    light: 'border-stone-200 bg-[#FBF9F5]/95',
    sepia: 'border-[#DFD2B8] bg-[#F3EAD8]/95',
    dark: 'border-stone-800 bg-[#121214]/95',
  };

  const fontSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const lineSpacingClasses = {
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  };

  const widthClasses = {
    narrow: 'max-w-xl',
    classic: 'max-w-2xl',
    wide: 'max-w-4xl',
  };

  const progressPercent = Math.round(
    ((currentIdx + 1) / Math.max(sortedChapters.length, 1)) * 100
  );

  const chapterBookmarks = bookmarks.filter(
    (b) => currentChapter && b.chapterId === currentChapter.id
  );

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-colors duration-200 ${themeClasses[theme]}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Reading ${book.title}`}
    >
      {/* Top Reading Utility Bar */}
      <header
        className={`sticky top-0 z-20 border-b backdrop-blur-sm px-4 sm:px-8 py-3 flex items-center justify-between ${headerBorderClasses[theme]}`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-medium opacity-75 hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap"
          >
            <X className="w-4 h-4" />
            <span>Exit Reader</span>
          </button>
          <span aria-hidden="true" className="opacity-30">
            ·
          </span>
          <div className="truncate">
            <span className="font-serif-display text-base font-semibold">{book.title}</span>
            <span className="hidden sm:inline text-xs opacity-60 ml-2">
              by {book.authorName}
            </span>
          </div>
        </div>

        {/* Chapter Switcher & Reader Settings */}
        <div className="flex items-center gap-3 shrink-0">
          <select
            aria-label="Select chapter"
            value={currentIdx}
            onChange={(e) => setCurrentIdx(Number(e.target.value))}
            className="text-xs border border-current/20 bg-transparent px-2.5 py-1.5 rounded-none focus:outline-none cursor-pointer"
          >
            {sortedChapters.map((chap, idx) => (
              <option
                key={chap.id}
                value={idx}
                className="bg-stone-900 text-stone-100"
              >
                Ch. {chap.chapterNumber}: {chap.title}{' '}
                {(book.isPremium || chap.isPremium) && chap.chapterNumber > 1 && !isBookUnlocked
                  ? ' (Locked)'
                  : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowBookmarkForm((v) => !v)}
            title="Bookmark this chapter"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-current/20 hover:border-current/50 transition-colors cursor-pointer whitespace-nowrap"
          >
            {bookmarkSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bookmark</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowControls((v) => !v)}
            title="Typography & Theme Controls"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-current/20 hover:border-current/50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Typography</span>
          </button>
        </div>
      </header>

      {/* Subtle Progress Hairline */}
      <div className="w-full h-0.5 bg-current/10">
        <div
          className="h-full bg-[#9A3412] transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Collapsible Typography & Reading Mode Drawer */}
      {showControls && (
        <div className={`border-b px-4 sm:px-8 py-4 ${headerBorderClasses[theme]}`}>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            {/* Theme */}
            <div>
              <p className="opacity-60 mb-1.5 uppercase tracking-wider text-[11px]">
                Reading Surface
              </p>
              <div className="flex gap-1">
                {(['light', 'sepia', 'dark'] as ReadingTheme[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleThemeSelect(t)}
                    className={`flex-1 py-1.5 px-2 capitalize border cursor-pointer ${
                      theme === t
                        ? 'border-[#9A3412] font-semibold'
                        : 'border-current/20 opacity-70'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <p className="opacity-60 mb-1.5 uppercase tracking-wider text-[11px]">
                Type Scale
              </p>
              <div className="flex gap-1">
                {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFontSize(sz)}
                    className={`flex-1 py-1.5 px-2 uppercase border cursor-pointer ${
                      fontSize === sz
                        ? 'border-[#9A3412] font-semibold'
                        : 'border-current/20 opacity-70'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Spacing */}
            <div>
              <p className="opacity-60 mb-1.5 uppercase tracking-wider text-[11px]">
                Leading
              </p>
              <div className="flex gap-1">
                {(['normal', 'relaxed', 'loose'] as const).map((ls) => (
                  <button
                    key={ls}
                    type="button"
                    onClick={() => setLineSpacing(ls)}
                    className={`flex-1 py-1.5 px-2 capitalize border cursor-pointer ${
                      lineSpacing === ls
                        ? 'border-[#9A3412] font-semibold'
                        : 'border-current/20 opacity-70'
                    }`}
                  >
                    {ls}
                  </button>
                ))}
              </div>
            </div>

            {/* Column Measure */}
            <div>
              <p className="opacity-60 mb-1.5 uppercase tracking-wider text-[11px]">
                Measure
              </p>
              <div className="flex gap-1">
                {(['narrow', 'classic', 'wide'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setReadingWidth(w)}
                    className={`flex-1 py-1.5 px-2 capitalize border cursor-pointer ${
                      readingWidth === w
                        ? 'border-[#9A3412] font-semibold'
                        : 'border-current/20 opacity-70'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optional Bookmark Note Form */}
      {showBookmarkForm && (
        <div className={`border-b px-4 sm:px-8 py-3 ${headerBorderClasses[theme]}`}>
          <form
            onSubmit={handleBookmarkSubmit}
            className="max-w-2xl mx-auto flex items-center gap-2"
          >
            <input
              type="text"
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              maxLength={400}
              placeholder="Add an optional margin note for this chapter bookmark..."
              className="flex-1 text-xs px-3 py-2 border border-current/25 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-[#9A3412] text-white cursor-pointer whitespace-nowrap"
            >
              Save Bookmark
            </button>
          </form>
        </div>
      )}

      {/* Main Literary Reading Column */}
      <main className={`mx-auto px-6 py-12 sm:py-16 ${widthClasses[readingWidth]}`}>
        {!currentChapter ? (
          <div className="py-16 text-center">
            <p className="font-serif-display text-2xl">No chapters published yet.</p>
          </div>
        ) : (
          <article>
            <header className="mb-10 pb-8 border-b border-current/15">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-60 mb-2">
                <span>Chapter {String(currentChapter.chapterNumber).padStart(2, '0')}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{currentChapter.wordCount} words</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{progressPercent}% complete</span>
              </div>
              <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold leading-tight">
                {currentChapter.title}
              </h1>
            </header>

            {chapterBookmarks.length > 0 && (
              <div className="mb-8 p-3.5 border border-current/15 text-xs opacity-80">
                <p className="font-semibold mb-1">Your Margin Bookmark:</p>
                {chapterBookmarks.map((bm) => (
                  <p key={bm.id} className="italic">
                    “{bm.note}”
                  </p>
                ))}
              </div>
            )}

            {isChapterLocked ? (
              <div className="my-12 p-8 sm:p-10 border border-current/20 text-center space-y-5">
                <Lock className="w-8 h-8 mx-auto text-[#9A3412]" />
                <div className="space-y-2 max-w-md mx-auto">
                  <p className="text-xs uppercase tracking-widest opacity-60">
                    Premium Literary Edition
                  </p>
                  <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold">
                    Unlock Full Manuscript Access
                  </h2>
                  <p className="text-sm opacity-80 leading-relaxed">
                    Chapter 1 is complimentary. Unlock <strong>{book.title}</strong> and all
                    remaining chapters permanently for{' '}
                    <span className="font-mono-tabular font-semibold">
                      {book.tokenPrice} LitTokens
                    </span>
                    . Authors receive 75% of every unlock directly.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  {userTokenBalance >= book.tokenPrice ? (
                    <button
                      type="button"
                      disabled={unlocking}
                      onClick={handleUnlock}
                      className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider bg-[#9A3412] text-white hover:bg-[#7C2D12] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Coins className="w-4 h-4" />
                      <span>
                        {unlocking
                          ? 'Unlocking Edition...'
                          : `Unlock Now (${book.tokenPrice} LitTokens)`}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenWallet();
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider bg-[#9A3412] text-white hover:bg-[#7C2D12] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Coins className="w-4 h-4" />
                      <span>
                        Top Up Wallet (Need {book.tokenPrice - userTokenBalance} more LitTokens)
                      </span>
                    </button>
                  )}
                </div>
                <p className="text-xs font-mono-tabular opacity-60">
                  Your Wallet Balance: {userTokenBalance} LitTokens
                </p>
              </div>
            ) : (
              <div
                className={`font-prose space-y-6 ${fontSizeClasses[fontSize]} ${lineSpacingClasses[lineSpacing]}`}
              >
                {currentChapter.content.split('\n\n').map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className={
                      pIdx === 0
                        ? 'first-letter:text-5xl first-letter:font-serif-display first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1'
                        : ''
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Chapter Footer Navigation */}
            <footer className="mt-16 pt-8 border-t border-current/15 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => {
                  setCurrentIdx((i) => Math.max(0, i - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium border border-current/25 disabled:opacity-30 hover:border-current/60 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Chapter</span>
              </button>

              <span className="text-xs font-mono-tabular opacity-60">
                {currentIdx + 1} / {sortedChapters.length}
              </span>

              <button
                type="button"
                disabled={currentIdx >= sortedChapters.length - 1}
                onClick={() => {
                  setCurrentIdx((i) => Math.min(sortedChapters.length - 1, i + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium border border-current/25 disabled:opacity-30 hover:border-current/60 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </footer>
          </article>
        )}
      </main>
    </div>
  );
};
