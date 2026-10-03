import React, { useState } from 'react';
import {
  Book,
  ReadingProgress,
  BookmarkItem,
  LibraryItem,
  UserProfile,
  Genre,
  AppNotification,
} from '../types';
import { BookCoverImage } from './BookCoverImage';
import {
  BookOpen,
  Bookmark,
  Clock,
  Sliders,
  Trash2,
  Bell,
  Check,
} from 'lucide-react';

interface ReaderLibraryViewProps {
  userProfile: UserProfile | null;
  books: Book[];
  libraryItems: LibraryItem[];
  readingProgress: ReadingProgress[];
  bookmarks: BookmarkItem[];
  unlockedBookIds: string[];
  genres: Genre[];
  notifications: AppNotification[];
  onSelectBook: (book: Book) => void;
  onContinueReading: (book: Book, chapterNumber: number) => void;
  onRemoveBookmark: (bookmarkId: string) => Promise<void>;
  onUpdatePreferences: (
    displayName: string,
    preferredGenres: string[]
  ) => Promise<void>;
  onMarkNotificationRead: (notificationId: string) => Promise<void>;
}

export const ReaderLibraryView: React.FC<ReaderLibraryViewProps> = ({
  userProfile,
  books,
  libraryItems,
  readingProgress,
  bookmarks,
  unlockedBookIds,
  genres,
  notifications,
  onSelectBook,
  onContinueReading,
  onRemoveBookmark,
  onUpdatePreferences,
  onMarkNotificationRead,
}) => {
  const [activeTab, setActiveTab] = useState<
    'saved' | 'history' | 'bookmarks' | 'notifications' | 'preferences'
  >('saved');

  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || 'Reader'
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    userProfile?.preferredGenres || ['African Literature', 'Historical Fiction']
  );
  const [savingPrefs, setSavingPrefs] = useState(false);

  const savedBooks = books.filter(
    (b) =>
      libraryItems.some((item) => item.bookId === b.id) ||
      unlockedBookIds.includes(b.id)
  );

  const togglePreferredGenre = (genreName: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreName)
        ? prev.filter((g) => g !== genreName)
        : prev.length < 10
        ? [...prev, genreName]
        : prev
    );
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      await onUpdatePreferences(displayName.trim(), selectedGenres);
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      <header className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-500">
            Personal Literary Collection
          </p>
          <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold text-stone-900 mt-1">
            Reader Library & Study
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-200/70 border border-stone-300">
          {(
            [
              { id: 'saved', label: `My Books (${savedBooks.length})` },
              {
                id: 'history',
                label: `Reading Progress (${readingProgress.length})`,
              },
              { id: 'bookmarks', label: `Bookmarks (${bookmarks.length})` },
              {
                id: 'notifications',
                label: `Notifications (${notifications.filter((n) => !n.read).length})`,
              },
              { id: 'preferences', label: 'Preferences' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
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

      {/* TAB 1: SAVED & UNLOCKED BOOKS */}
      {activeTab === 'saved' && (
        <section className="space-y-6">
          {savedBooks.length === 0 ? (
            <div className="p-12 border border-stone-200 bg-white text-center space-y-2">
              <p className="font-serif-display text-2xl text-stone-800">
                Your Personal Shelf is Empty
              </p>
              <p className="text-xs text-stone-500">
                Save books to your library or unlock premium editions to access
                them here anytime.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedBooks.map((book) => {
                const prog = readingProgress.find((p) => p.bookId === book.id);
                return (
                  <div
                    key={book.id}
                    className="border border-stone-200 bg-white p-4 flex gap-4 justify-between"
                  >
                    <div
                      onClick={() => onSelectBook(book)}
                      className="w-20 aspect-[3/4] shrink-0 bg-stone-100 cursor-pointer overflow-hidden"
                    >
                      <BookCoverImage
                        src={book.coverUrl}
                        alt={book.title}
                        title={book.title}
                        author={book.authorName}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-stone-500">
                          {unlockedBookIds.includes(book.id)
                            ? 'Unlocked Edition'
                            : 'Saved in Library'}
                        </p>
                        <h3
                          onClick={() => onSelectBook(book)}
                          className="font-serif-display text-lg font-semibold text-stone-900 hover:text-[#9A3412] truncate cursor-pointer"
                        >
                          {book.title}
                        </h3>
                        <p className="text-xs text-stone-500 truncate">
                          {book.authorName}
                        </p>
                      </div>

                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-xs font-mono-tabular text-stone-500">
                          {prog ? `${prog.percentComplete}% read` : 'Not started'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onContinueReading(book, prog?.chapterNumber || 1)
                          }
                          className="text-xs font-semibold text-[#9A3412] hover:underline cursor-pointer"
                        >
                          {prog ? `Continue Ch. ${prog.chapterNumber} →` : 'Read →'}
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

      {/* TAB 2: READING HISTORY & PROGRESS */}
      {activeTab === 'history' && (
        <section className="space-y-4">
          {readingProgress.length === 0 ? (
            <div className="p-10 border border-stone-200 bg-white text-center text-xs text-stone-500">
              Your reading history will appear automatically as you read chapters.
            </div>
          ) : (
            <div className="border border-stone-200 bg-white divide-y divide-stone-200">
              {readingProgress.map((prog) => {
                const book = books.find((b) => b.id === prog.bookId);
                if (!book) return null;
                return (
                  <div
                    key={prog.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h3 className="font-serif-display text-xl font-semibold text-stone-900">
                        {book.title}
                      </h3>
                      <p className="text-xs text-stone-500">
                        By {book.authorName} · Last read Chapter{' '}
                        {prog.chapterNumber} ({prog.percentComplete}% complete)
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-32 h-1.5 bg-stone-100 overflow-hidden">
                        <div
                          className="h-full bg-[#9A3412]"
                          style={{ width: `${prog.percentComplete}%` }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onContinueReading(book, prog.chapterNumber)
                        }
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white hover:bg-[#9A3412] cursor-pointer whitespace-nowrap"
                      >
                        Resume Reading
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: MARGIN BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <section className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="p-10 border border-stone-200 bg-white text-center text-xs text-stone-500">
              No chapter bookmarks saved yet. Click "Bookmark" inside the reader
              to save passages and margin notes.
            </div>
          ) : (
            <div className="border border-stone-200 bg-white divide-y divide-stone-200">
              {bookmarks.map((bm) => {
                const book = books.find((b) => b.id === bm.bookId);
                return (
                  <div
                    key={bm.id}
                    className="p-5 flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-serif-display text-lg font-semibold text-stone-900">
                        {book?.title || 'Literary Work'} — Chapter{' '}
                        {bm.chapterNumber}
                      </p>
                      <p className="text-stone-700 italic">“{bm.note}”</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {book && (
                        <button
                          type="button"
                          onClick={() =>
                            onContinueReading(book, bm.chapterNumber)
                          }
                          className="text-[#9A3412] font-semibold hover:underline cursor-pointer"
                        >
                          Open Chapter
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveBookmark(bm.id)}
                        className="text-stone-400 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <section className="space-y-4">
          {notifications.length === 0 ? (
            <div className="p-10 border border-stone-200 bg-white text-center text-xs text-stone-500">
              You have no notifications.
            </div>
          ) : (
            <div className="border border-stone-200 bg-white divide-y divide-stone-200">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 flex items-center justify-between text-xs ${
                    n.read ? 'opacity-65' : 'bg-amber-50/30'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-stone-900">{n.title}</p>
                    <p className="text-stone-600">{n.message}</p>
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => onMarkNotificationRead(n.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 border border-stone-300 text-stone-700 hover:border-stone-900 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 5: READING PREFERENCES & PROFILE SETTINGS */}
      {activeTab === 'preferences' && (
        <form
          onSubmit={handleSavePrefs}
          className="bg-white border border-stone-200 p-6 sm:p-8 space-y-6 max-w-2xl"
        >
          <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
            Profile & Personalized Recommendation Preferences
          </h2>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5">
              Reader Display Name
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-stone-300"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-stone-600">
              Preferred Literary Genres (Up to 10 for Personalized Recommendations)
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => {
                const active = selectedGenres.includes(g.name);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => togglePreferredGenre(g.name)}
                    className={`px-3 py-1.5 text-xs border transition-colors cursor-pointer ${
                      active
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-300 bg-white text-stone-700 hover:border-stone-900'
                    }`}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPrefs}
            className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#9A3412] text-white cursor-pointer"
          >
            {savingPrefs ? 'Saving Preferences...' : 'Save Preferences'}
          </button>
        </form>
      )}
    </div>
  );
};
