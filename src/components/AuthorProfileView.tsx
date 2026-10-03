import React from 'react';
import { AuthorProfile, Book } from '../types';
import { BookCoverImage } from './BookCoverImage';
import {
  ArrowLeft,
  Globe,
  MapPin,
  UserPlus,
  UserCheck,
  Star,
} from 'lucide-react';

interface AuthorProfileViewProps {
  author: AuthorProfile;
  books: Book[];
  isFollowing: boolean;
  onBack: () => void;
  onToggleFollow: (authorId: string) => Promise<void>;
  onSelectBook: (book: Book) => void;
}

export const AuthorProfileView: React.FC<AuthorProfileViewProps> = ({
  author,
  books,
  isFollowing,
  onBack,
  onToggleFollow,
  onSelectBook,
}) => {
  const publishedBooks = books.filter(
    (b) => b.authorId === author.id && b.status === 'published'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Authors</span>
      </button>

      {/* Author Monograph Dossier */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-stone-200 items-start">
        <div className="md:col-span-3">
          <div className="aspect-square w-40 md:w-full bg-stone-200 border border-stone-300 overflow-hidden">
            <BookCoverImage
              src={author.photoUrl}
              alt={author.penName}
              title={author.penName}
            />
          </div>
        </div>

        <div className="md:col-span-9 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#9A3412]">
                LitVault Verified Literary Voice
              </p>
              <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold text-stone-900 mt-1">
                {author.penName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-2">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {author.location}
                </span>
                {author.website && (
                  <>
                    <span aria-hidden="true">·</span>
                    <a
                      href={author.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:text-stone-900 underline underline-offset-4"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Author Website</span>
                    </a>
                  </>
                )}
                {author.twitterHandle && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{author.twitterHandle}</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleFollow(author.id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap ${
                isFollowing
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-900 bg-white text-stone-900 hover:bg-stone-900 hover:text-white'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Following Author</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow Author</span>
                </>
              )}
            </button>
          </div>

          <p className="font-prose text-base text-stone-700 leading-relaxed max-w-3xl">
            {author.bio}
          </p>

          {/* Author Metrics Strip */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center gap-8 text-xs">
            <div>
              <span className="text-stone-500 uppercase tracking-wider block">
                Published Works
              </span>
              <span className="font-mono-tabular text-lg font-semibold text-stone-900">
                {publishedBooks.length}
              </span>
            </div>
            <div>
              <span className="text-stone-500 uppercase tracking-wider block">
                Followers
              </span>
              <span className="font-mono-tabular text-lg font-semibold text-stone-900">
                {author.followersCount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-stone-500 uppercase tracking-wider block">
                Total Readers
              </span>
              <span className="font-mono-tabular text-lg font-semibold text-stone-900">
                {author.totalReads.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-stone-500 uppercase tracking-wider block">
                Critical Rating
              </span>
              <span className="font-mono-tabular text-lg font-semibold text-amber-700 inline-flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                {author.averageRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Author's Published Bibliography */}
      <section className="space-y-6">
        <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-stone-900">
          Published Bibliography ({publishedBooks.length})
        </h2>

        {publishedBooks.length === 0 ? (
          <p className="text-sm text-stone-500 py-8 border border-stone-200 px-6 bg-white">
            No published works currently available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedBooks.map((book) => (
              <article
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="group cursor-pointer border border-stone-200 bg-white flex flex-col justify-between hover:border-stone-400 transition-all"
              >
                <div>
                  <div className="aspect-[3/4] w-full bg-[#F9F9F8] overflow-hidden border-b border-stone-100">
                    <BookCoverImage
                      src={book.coverUrl}
                      alt={book.title}
                      title={book.title}
                      author={book.authorName}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="uppercase tracking-wider">{book.genre}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {book.isPremium
                          ? `${book.tokenPrice} LitTokens`
                          : 'Free Edition'}
                      </span>
                    </div>
                    <h3 className="font-serif-display text-xl font-semibold text-stone-900 group-hover:text-[#9A3412] transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono-tabular">
                  <span>{book.readsCount.toLocaleString()} reads</span>
                  <span>★ {book.ratingAvg.toFixed(1)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
