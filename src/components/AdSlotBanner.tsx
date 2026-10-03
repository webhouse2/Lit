import React from 'react';
import { Advertisement } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface AdSlotBannerProps {
  ad?: Advertisement;
  globalAdsEnabled: boolean;
  onNavigate?: (url: string) => void;
}

export const AdSlotBanner: React.FC<AdSlotBannerProps> = ({
  ad,
  globalAdsEnabled,
  onNavigate,
}) => {
  if (!globalAdsEnabled || !ad || !ad.enabled) {
    return null;
  }

  return (
    <aside
      aria-label={ad.slotName}
      className="w-full border border-stone-200 bg-[#F7F4EE] px-6 py-4 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="uppercase tracking-widest">
              {ad.adType === 'adsense' ? 'AdSense Slot' : 'Sponsored Literary Campaign'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-[11px] text-stone-400">
              Slot ID: {ad.adSlotId}
            </span>
          </div>
          <p className="font-serif-display text-lg font-medium text-stone-900">
            {ad.headline}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {ad.adType === 'adsense' ? (
            <div className="text-xs text-stone-500 font-mono-tabular border border-dashed border-stone-300 px-3 py-1.5 bg-[#FBF9F5]">
              Publisher: {ad.publisherId}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate && onNavigate(ad.ctaUrl)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-900 border border-stone-300 bg-white hover:bg-stone-100 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>{ad.ctaText}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
