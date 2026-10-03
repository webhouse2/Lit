import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverImageProps {
  src: string;
  alt: string;
  title?: string;
  author?: string;
  className?: string;
}

export const BookCoverImage: React.FC<BookCoverImageProps> = ({
  src,
  alt,
  title,
  author,
  className = 'w-full h-full object-cover',
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col justify-between p-5 bg-gradient-to-br from-[#292524] via-[#1C1917] to-[#431407] text-[#FBF9F5] border border-stone-700/50 ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-stone-400">
          <span>LitVault Press</span>
          <BookOpen className="w-3.5 h-3.5 text-amber-500/80" />
        </div>
        <div className="my-auto py-4 border-y border-stone-700/60">
          <p className="font-serif-display text-lg font-semibold leading-snug line-clamp-3 text-stone-100">
            {title || alt}
          </p>
          {author && (
            <p className="mt-1.5 text-xs text-stone-300 truncate">{author}</p>
          )}
        </div>
        <div className="text-[10px] tracking-widest uppercase text-stone-400">
          Archival Edition
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
