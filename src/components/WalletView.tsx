import React, { useState } from 'react';
import {
  Wallet,
  TokenPackage,
  Transaction,
  BookUnlock,
} from '../types';
import {
  Coins,
  CreditCard,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface WalletViewProps {
  wallet: Wallet;
  packages: TokenPackage[];
  transactions: Transaction[];
  bookUnlocks: BookUnlock[];
  isAuthenticated: boolean;
  onPurchasePackage: (pkg: TokenPackage, provider: string) => Promise<void>;
  onRequireAuth: () => void;
  onOpenBookById: (bookId: string) => void;
}

export function formatMinorUnits(minorUnits: number, currency = 'USD'): string {
  const whole = Math.floor(minorUnits / 100);
  const cents = Math.abs(minorUnits % 100)
    .toString()
    .padStart(2, '0');
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;
  return `${symbol}${whole}.${cents}`;
}

export const WalletView: React.FC<WalletViewProps> = ({
  wallet,
  packages,
  transactions,
  bookUnlocks,
  isAuthenticated,
  onPurchasePackage,
  onRequireAuth,
  onOpenBookById,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('Paystack');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const activePackages = packages.filter((p) => p.active);

  const handleBuy = async (pkg: TokenPackage) => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    setPurchasingId(pkg.id);
    setPurchaseSuccess(null);
    try {
      await onPurchasePackage(pkg, selectedProvider);
      setPurchaseSuccess(
        `Credited ${pkg.tokens} LitTokens via ${selectedProvider} (${formatMinorUnits(
          pkg.priceMinorUnits,
          pkg.currency
        )}).`
      );
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Header & Wallet Balance Summary */}
      <section className="border-b border-stone-200 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-stone-500">
            LitVault Treasury & Token Economy
          </p>
          <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold text-stone-900">
            Personal LitToken Wallet
          </h1>
          <p className="text-sm text-stone-600 max-w-xl">
            Unlock premium novels, serialized chapters, and poetry monographs
            while directly supporting independent authors around the world.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border border-stone-200 bg-white p-5">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-stone-500">
              Available Balance
            </p>
            <p className="font-mono-tabular text-2xl font-semibold text-[#9A3412] mt-1">
              {wallet.tokenBalance.toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-400">LitTokens</p>
          </div>
          <div className="border-l border-stone-200 pl-4">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">
              Purchased
            </p>
            <p className="font-mono-tabular text-2xl font-semibold text-stone-900 mt-1">
              {wallet.totalTokensPurchased.toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-400">Lifetime</p>
          </div>
          <div className="border-l border-stone-200 pl-4">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">
              Spent on Books
            </p>
            <p className="font-mono-tabular text-2xl font-semibold text-stone-900 mt-1">
              {wallet.totalTokensSpent.toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-400">Unlocks</p>
          </div>
          <div className="border-l border-stone-200 pl-4">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">
              Author Royalties
            </p>
            <p className="font-mono-tabular text-2xl font-semibold text-emerald-800 mt-1">
              {wallet.authorEarningsTokens.toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-400">Earned Tokens</p>
          </div>
        </div>
      </section>

      {purchaseSuccess && (
        <div className="p-4 border border-emerald-700/30 bg-emerald-50/70 flex items-center gap-3 text-xs text-emerald-950">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{purchaseSuccess}</span>
        </div>
      )}

      {/* Payment Gateway Selection & Configurable Packages */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              Acquire LitToken Packages
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              All financial amounts are processed in integer minor units (cents)
              for zero-floating-point precision.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 uppercase tracking-wider text-[11px]">
              Payment Gateway:
            </span>
            {['Paystack', 'Flutterwave', 'Stripe'].map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => setSelectedProvider(provider)}
                className={`px-3 py-1.5 font-medium border transition-colors cursor-pointer ${
                  selectedProvider === provider
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-300 bg-white text-stone-700 hover:border-stone-900'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activePackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`border p-6 flex flex-col justify-between bg-white transition-colors ${
                pkg.popular ? 'border-[#9A3412]' : 'border-stone-200'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-widest text-stone-500">
                    {pkg.name}
                  </span>
                  {pkg.popular && (
                    <span className="text-[#9A3412] font-semibold">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="py-3 border-y border-stone-100">
                  <p className="font-mono-tabular text-3xl font-semibold text-stone-900">
                    {pkg.tokens.toLocaleString()}{' '}
                    <span className="text-sm font-normal text-stone-500">
                      LitTokens
                    </span>
                  </p>
                  <p className="font-mono-tabular text-lg text-[#9A3412] font-medium mt-1">
                    {formatMinorUnits(pkg.priceMinorUnits, pkg.currency)}
                  </p>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  Instant wallet credit · Permanent manuscript unlocks · Supports
                  author royalty pool.
                </p>
              </div>

              <button
                type="button"
                disabled={purchasingId === pkg.id}
                onClick={() => handleBuy(pkg)}
                className="mt-6 w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white hover:bg-[#9A3412] transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>
                  {purchasingId === pkg.id
                    ? 'Processing...'
                    : `Buy with ${selectedProvider}`}
                </span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Ledgers: Unlocked Books & Payment Transactions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6 border-t border-stone-200">
        {/* Unlocked Books */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
              Unlocked Premium Editions
            </h3>
            <span className="text-xs font-mono-tabular text-stone-500">
              {bookUnlocks.length} Records
            </span>
          </div>

          {bookUnlocks.length === 0 ? (
            <div className="p-8 border border-stone-200 bg-white text-center text-xs text-stone-500">
              You have not unlocked any premium books yet.
            </div>
          ) : (
            <div className="border border-stone-200 bg-white divide-y divide-stone-200">
              {bookUnlocks.map((u) => (
                <div
                  key={u.id}
                  className="p-4 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => onOpenBookById(u.bookId)}
                      className="font-serif-display text-base font-semibold text-stone-900 hover:text-[#9A3412] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{u.bookTitle}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-stone-500 font-mono-tabular">
                      Author Royalty: {u.authorShareTokens} Tokens · Platform:{' '}
                      {u.platformShareTokens} Tokens
                    </p>
                  </div>
                  <span className="font-mono-tabular font-semibold text-stone-900">
                    -{u.tokensSpent} LitTokens
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Immutable Payment Transactions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
              Token Purchase Ledger
            </h3>
            <span className="text-xs font-mono-tabular text-stone-500">
              {transactions.length} Transactions
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 border border-stone-200 bg-white text-center text-xs text-stone-500">
              No token purchase transactions recorded yet.
            </div>
          ) : (
            <div className="border border-stone-200 bg-white divide-y divide-stone-200">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-stone-900">
                      +{tx.tokensPurchased.toLocaleString()} LitTokens ({tx.paymentProvider})
                    </p>
                    <p className="font-mono-tabular text-[11px] text-stone-500">
                      Ref: {tx.paymentReference} · Status: {tx.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right font-mono-tabular">
                    <p className="font-semibold text-stone-900">
                      {formatMinorUnits(tx.amountMinorUnits, tx.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
