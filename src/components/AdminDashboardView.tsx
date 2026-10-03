import React, { useState } from 'react';
import {
  Book,
  AuthorProfile,
  Genre,
  TokenPackage,
  Transaction,
  BookUnlock,
  Withdrawal,
  Report,
  Advertisement,
  PlatformSettings,
  AuditLog,
  BookStatus,
} from '../types';
import { formatMinorUnits } from './WalletView';
import {
  Shield,
  Check,
  X,
  Plus,
  Trash2,
  Star,
  TrendingUp,
} from 'lucide-react';

interface AdminDashboardViewProps {
  books: Book[];
  authors: AuthorProfile[];
  genres: Genre[];
  tokenPackages: TokenPackage[];
  transactions: Transaction[];
  bookUnlocks: BookUnlock[];
  withdrawals: Withdrawal[];
  reports: Report[];
  advertisements: Advertisement[];
  settings: PlatformSettings;
  auditLogs: AuditLog[];
  onUpdateBookStatus: (bookId: string, status: BookStatus) => Promise<void>;
  onToggleBookFeatured: (bookId: string, featured: boolean, trending: boolean) => Promise<void>;
  onUpdateAuthorStatus: (
    authorId: string,
    status: 'pending' | 'approved' | 'rejected' | 'suspended'
  ) => Promise<void>;
  onSaveGenre: (name: string, description: string) => Promise<void>;
  onDeleteGenre: (genreId: string) => Promise<void>;
  onSaveTokenPackage: (pkg: Omit<TokenPackage, 'id'>, existingId?: string) => Promise<void>;
  onUpdateWithdrawalStatus: (
    withdrawalId: string,
    status: 'approved' | 'rejected' | 'paid'
  ) => Promise<void>;
  onUpdateReportStatus: (
    reportId: string,
    status: 'resolved' | 'dismissed'
  ) => Promise<void>;
  onUpdateSettings: (newSettings: PlatformSettings) => Promise<void>;
  onToggleAdSlot: (ad: Advertisement) => Promise<void>;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  books,
  authors,
  genres,
  tokenPackages,
  transactions,
  bookUnlocks,
  withdrawals,
  reports,
  advertisements,
  settings,
  auditLogs,
  onUpdateBookStatus,
  onToggleBookFeatured,
  onUpdateAuthorStatus,
  onSaveGenre,
  onDeleteGenre,
  onSaveTokenPackage,
  onUpdateWithdrawalStatus,
  onUpdateReportStatus,
  onUpdateSettings,
  onToggleAdSlot,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'analytics'
    | 'books'
    | 'authors'
    | 'economy'
    | 'genres'
    | 'moderation'
    | 'settings'
    | 'audit'
  >('analytics');

  // New Genre State
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreDesc, setNewGenreDesc] = useState('');

  // New Token Package State
  const [pkgName, setPkgName] = useState('');
  const [pkgTokens, setPkgTokens] = useState(250);
  const [pkgPriceMinor, setPkgPriceMinor] = useState(999);
  const [pkgCurrency, setPkgCurrency] = useState('USD');

  // Settings Form State
  const [formSettings, setFormSettings] = useState<PlatformSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);

  // Computed Platform Metrics (Strictly Integer / Tabular Safe)
  const totalReads = books.reduce((sum, b) => sum + b.readsCount, 0);
  const freeReads = books
    .filter((b) => !b.isPremium)
    .reduce((sum, b) => sum + b.readsCount, 0);
  const totalTokensSold = transactions.reduce(
    (sum, t) => sum + (t.status === 'completed' ? t.tokensPurchased : 0),
    0
  );
  const totalRevenueMinorUnits = transactions.reduce(
    (sum, t) => sum + (t.status === 'completed' ? t.amountMinorUnits : 0),
    0
  );
  const totalAuthorShareTokens = bookUnlocks.reduce(
    (sum, u) => sum + u.authorShareTokens,
    0
  );
  const pendingWithdrawalsCount = withdrawals.filter(
    (w) => w.status === 'pending'
  ).length;
  const openReportsCount = reports.filter((r) => r.status === 'open').length;

  const handleCreateGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    await onSaveGenre(newGenreName.trim(), newGenreDesc.trim());
    setNewGenreName('');
    setNewGenreDesc('');
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim()) return;
    await onSaveTokenPackage({
      name: pkgName.trim(),
      tokens: Math.max(1, Math.round(pkgTokens)),
      priceMinorUnits: Math.max(0, Math.round(pkgPriceMinor)),
      currency: pkgCurrency,
      active: true,
      popular: false,
    });
    setPkgName('');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await onUpdateSettings(formSettings);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <header className="border-b border-stone-200 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#9A3412] font-semibold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            <span>LitVault Administrator Governance Console</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-stone-900 mt-1">
            Platform Operations, Economy & Moderation
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-200/70 border border-stone-300">
          {(
            [
              { id: 'analytics', label: 'Analytics' },
              { id: 'books', label: `Books (${books.length})` },
              { id: 'authors', label: `Authors (${authors.length})` },
              { id: 'economy', label: 'LitToken Economy' },
              { id: 'genres', label: `Genres (${genres.length})` },
              { id: 'moderation', label: `Moderation (${openReportsCount})` },
              { id: 'settings', label: 'CMS & Ads' },
              { id: 'audit', label: 'Audit Logs' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-stone-200">
              <p className="text-xs uppercase tracking-wider text-stone-500">
                Total Books
              </p>
              <p className="font-mono-tabular text-2xl font-semibold text-stone-900 mt-1">
                {books.length}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {books.filter((b) => b.status === 'published').length} Published
              </p>
            </div>
            <div className="p-5 bg-white border border-stone-200">
              <p className="text-xs uppercase tracking-wider text-stone-500">
                Registered Authors
              </p>
              <p className="font-mono-tabular text-2xl font-semibold text-stone-900 mt-1">
                {authors.length}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {authors.filter((a) => a.status === 'approved').length} Approved
              </p>
            </div>
            <div className="p-5 bg-white border border-stone-200">
              <p className="text-xs uppercase tracking-wider text-stone-500">
                Total Reads
              </p>
              <p className="font-mono-tabular text-2xl font-semibold text-stone-900 mt-1">
                {totalReads.toLocaleString()}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5 font-mono-tabular">
                {freeReads.toLocaleString()} Free · {bookUnlocks.length} Unlocks
              </p>
            </div>
            <div className="p-5 bg-white border border-stone-200">
              <p className="text-xs uppercase tracking-wider text-stone-500">
                Gross Token Sales
              </p>
              <p className="font-mono-tabular text-2xl font-semibold text-[#9A3412] mt-1">
                {formatMinorUnits(totalRevenueMinorUnits, 'USD')}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5 font-mono-tabular">
                {totalTokensSold.toLocaleString()} LitTokens Sold
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-stone-200">
              <p className="text-xs uppercase tracking-wider text-stone-500">
                Author Royalty Pool ({settings.authorRevenueSharePercent}%)
              </p>
              <p className="font-mono-tabular text-2xl font-semibold text-emerald-800 mt-1">
                {totalAuthorShareTokens.toLocaleString()} LitTokens
              </p>
            </div>
            <div className="p-5 bg-white border border-stone-200">
              <p className="text-xs uppercase tracking-wider text-stone-500">
                Pending Withdrawals
              </p>
              <p className="font-mono-tabular text-2xl font-semibold text-stone-900 mt-1">
                {pendingWithdrawalsCount}
              </p>
            </div>
            <div className="p-5 bg-white border border-stone-200">
              <p className="text-xs uppercase tracking-wider text-stone-500">
                Open Moderation Reports
              </p>
              <p className="font-mono-tabular text-2xl font-semibold text-stone-900 mt-1">
                {openReportsCount}
              </p>
            </div>
          </div>

          {/* Readership Performance by Book Chart */}
          <div className="bg-white border border-stone-200 p-6 space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              Readership Distribution Across Catalog
            </h2>
            <div className="space-y-3">
              {books.slice(0, 6).map((b) => {
                const maxReads = Math.max(...books.map((x) => x.readsCount), 1);
                const widthPct = Math.max(
                  4,
                  Math.round((b.readsCount / maxReads) * 100)
                );
                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-stone-900">
                        {b.title}{' '}
                        <span className="text-stone-500">by {b.authorName}</span>
                      </span>
                      <span className="font-mono-tabular text-stone-700">
                        {b.readsCount.toLocaleString()} reads
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-[#9A3412]"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKS MANAGEMENT & MODERATION */}
      {activeTab === 'books' && (
        <div className="bg-white border border-stone-200 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Genre</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Curatorial Flags</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-stone-50/80">
                  <td className="py-3.5 px-4 font-semibold text-stone-900">
                    {b.title}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">{b.authorName}</td>
                  <td className="py-3.5 px-4 text-stone-600">{b.genre}</td>
                  <td className="py-3.5 px-4 font-mono-tabular">
                    {b.isPremium ? `${b.tokenPrice} Tokens` : 'Free'}
                  </td>
                  <td className="py-3.5 px-4 uppercase font-mono-tabular font-medium">
                    {b.status.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleBookFeatured(b.id, !b.featured, b.trending)
                        }
                        className={`px-2 py-1 border cursor-pointer ${
                          b.featured
                            ? 'border-amber-700 bg-amber-50 text-amber-900 font-semibold'
                            : 'border-stone-200 text-stone-500'
                        }`}
                      >
                        <Star className="w-3 h-3 inline mr-1" />
                        Featured
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onToggleBookFeatured(b.id, b.featured, !b.trending)
                        }
                        className={`px-2 py-1 border cursor-pointer ${
                          b.trending
                            ? 'border-[#9A3412] bg-orange-50 text-[#9A3412] font-semibold'
                            : 'border-stone-200 text-stone-500'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        Trending
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {b.status !== 'published' && (
                      <button
                        type="button"
                        onClick={() => onUpdateBookStatus(b.id, 'published')}
                        className="px-2.5 py-1 bg-emerald-800 text-white font-medium cursor-pointer"
                      >
                        Approve & Publish
                      </button>
                    )}
                    {b.status !== 'suspended' && (
                      <button
                        type="button"
                        onClick={() => onUpdateBookStatus(b.id, 'suspended')}
                        className="px-2.5 py-1 border border-amber-700 text-amber-800 cursor-pointer"
                      >
                        Suspend
                      </button>
                    )}
                    {b.status !== 'removed' ? (
                      <button
                        type="button"
                        onClick={() => onUpdateBookStatus(b.id, 'removed')}
                        className="px-2.5 py-1 border border-red-700 text-red-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateBookStatus(b.id, 'published')}
                        className="px-2.5 py-1 border border-stone-700 text-stone-800 cursor-pointer"
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: AUTHORS MANAGEMENT */}
      {activeTab === 'authors' && (
        <div className="bg-white border border-stone-200 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Pen Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Followers</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {authors.map((a) => (
                <tr key={a.id}>
                  <td className="py-3.5 px-4 font-semibold text-stone-900">
                    {a.penName}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">{a.location}</td>
                  <td className="py-3.5 px-4 font-mono-tabular">
                    {a.followersCount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 uppercase font-mono-tabular">
                    {a.status}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {a.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => onUpdateAuthorStatus(a.id, 'approved')}
                        className="px-3 py-1 bg-emerald-800 text-white cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                    {a.status !== 'suspended' && (
                      <button
                        type="button"
                        onClick={() => onUpdateAuthorStatus(a.id, 'suspended')}
                        className="px-3 py-1 border border-red-700 text-red-700 cursor-pointer"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: TOKEN ECONOMY & PACKAGES */}
      {activeTab === 'economy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleCreatePackage}
            className="lg:col-span-5 bg-white border border-stone-200 p-6 space-y-4"
          >
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              Configure New LitToken Package
            </h2>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                Package Title *
              </label>
              <input
                type="text"
                required
                value={pkgName}
                onChange={(e) => setPkgName(e.target.value)}
                placeholder="e.g., Bibliophile Chest"
                className="w-full px-3 py-2 text-xs border border-stone-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                  LitTokens *
                </label>
                <input
                  type="number"
                  min={10}
                  required
                  value={pkgTokens}
                  onChange={(e) => setPkgTokens(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono-tabular border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                  Price in Cents (Minor Units) *
                </label>
                <input
                  type="number"
                  min={99}
                  required
                  value={pkgPriceMinor}
                  onChange={(e) => setPkgPriceMinor(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono-tabular border border-stone-300"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white cursor-pointer"
            >
              Add Token Package
            </button>
          </form>

          <div className="lg:col-span-7 bg-white border border-stone-200 p-6 space-y-4">
            <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
              Active Token Packages
            </h3>
            <div className="divide-y divide-stone-200">
              {tokenPackages.map((p) => (
                <div
                  key={p.id}
                  className="py-3.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-stone-900">
                      {p.name} ({p.tokens} LitTokens)
                    </p>
                    <p className="font-mono-tabular text-stone-500">
                      {formatMinorUnits(p.priceMinorUnits, p.currency)} ({p.priceMinorUnits} minor units)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onSaveTokenPackage(
                        {
                          name: p.name,
                          tokens: p.tokens,
                          priceMinorUnits: p.priceMinorUnits,
                          currency: p.currency,
                          active: !p.active,
                          popular: p.popular,
                        },
                        p.id
                      )
                    }
                    className={`px-3 py-1 border cursor-pointer ${
                      p.active
                        ? 'border-emerald-700 text-emerald-800'
                        : 'border-stone-300 text-stone-500'
                    }`}
                  >
                    {p.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GENRES MANAGER */}
      {activeTab === 'genres' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleCreateGenre}
            className="lg:col-span-5 bg-white border border-stone-200 p-6 space-y-4"
          >
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              Add Literary Genre
            </h2>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                Genre Name *
              </label>
              <input
                type="text"
                required
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                placeholder="e.g., Speculative Folklore"
                className="w-full px-3 py-2 text-xs border border-stone-300"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                Curatorial Description
              </label>
              <textarea
                rows={3}
                value={newGenreDesc}
                onChange={(e) => setNewGenreDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white cursor-pointer"
            >
              Create Genre
            </button>
          </form>

          <div className="lg:col-span-7 bg-white border border-stone-200 p-6 space-y-4">
            <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
              Configured Genres ({genres.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {genres.map((g) => (
                <div
                  key={g.id}
                  className="p-3 border border-stone-200 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-stone-900">{g.name}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteGenre(g.id)}
                    className="text-stone-400 hover:text-red-700 cursor-pointer"
                    title="Remove Genre"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: WITHDRAWALS & CONTENT REPORTS MODERATION */}
      {activeTab === 'moderation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-stone-200 p-6 space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              Author Payout Withdrawals
            </h2>
            {withdrawals.length === 0 ? (
              <p className="text-xs text-stone-500">No withdrawal requests.</p>
            ) : (
              <div className="divide-y divide-stone-200">
                {withdrawals.map((w) => (
                  <div key={w.id} className="py-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">
                        {w.authorName} — {w.tokensAmount} LitTokens
                      </span>
                      <span className="uppercase font-mono-tabular font-semibold">
                        {w.status}
                      </span>
                    </div>
                    <p className="text-stone-500">
                      {w.payoutMethod}: {w.payoutDetails}
                    </p>
                    {w.status === 'pending' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onUpdateWithdrawalStatus(w.id, 'paid')}
                          className="px-3 py-1 bg-emerald-800 text-white cursor-pointer"
                        >
                          Approve & Mark Paid
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateWithdrawalStatus(w.id, 'rejected')
                          }
                          className="px-3 py-1 border border-red-700 text-red-700 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-200 p-6 space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              Content & Copyright Reports
            </h2>
            {reports.length === 0 ? (
              <p className="text-xs text-stone-500">
                Zero open reports in moderation queue.
              </p>
            ) : (
              <div className="divide-y divide-stone-200">
                {reports.map((r) => (
                  <div key={r.id} className="py-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">
                        [{r.targetType.toUpperCase()}] {r.targetTitle}
                      </span>
                      <span className="uppercase font-mono-tabular">
                        {r.status}
                      </span>
                    </div>
                    <p className="font-medium text-[#9A3412]">{r.reason}</p>
                    <p className="text-stone-600">{r.details}</p>
                    {r.status === 'open' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onUpdateReportStatus(r.id, 'resolved')}
                          className="px-3 py-1 bg-stone-900 text-white cursor-pointer"
                        >
                          Resolve Report
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateReportStatus(r.id, 'dismissed')
                          }
                          className="px-3 py-1 border border-stone-300 cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: CMS, REVENUE SHARE, SEO & AD SLOTS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleSaveSettings}
            className="lg:col-span-7 bg-white border border-stone-200 p-6 space-y-4"
          >
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
              Editorial Homepage, Royalty Share & SEO Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                  Author Royalty Share (%)
                </label>
                <input
                  type="number"
                  min={10}
                  max={95}
                  value={formSettings.authorRevenueSharePercent}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      authorRevenueSharePercent: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono-tabular border border-stone-300"
                />
              </div>

              <div className="flex flex-col justify-center gap-2 pt-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSettings.requireBookApproval}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        requireBookApproval: e.target.checked,
                      })
                    }
                  />
                  <span>Require Admin Approval Before Books Publish</span>
                </label>

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSettings.adsEnabled}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        adsEnabled: e.target.checked,
                      })
                    }
                  />
                  <span>Enable Global AdSense & Sponsored Slots</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                Homepage Hero Headline
              </label>
              <input
                type="text"
                value={formSettings.heroHeadline}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    heroHeadline: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                Homepage Hero Subheadline
              </label>
              <textarea
                rows={2}
                value={formSettings.heroSubheadline}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    heroSubheadline: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">
                Top Editorial Announcement Strip
              </label>
              <input
                type="text"
                value={formSettings.announcementBanner}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    announcementBanner: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs border border-stone-300"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white cursor-pointer"
            >
              {savingSettings ? 'Saving Configuration...' : 'Save Platform Settings'}
            </button>
          </form>

          <div className="lg:col-span-5 bg-white border border-stone-200 p-6 space-y-4">
            <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
              Advertisement Placements
            </h3>
            <div className="divide-y divide-stone-200">
              {advertisements.map((ad) => (
                <div
                  key={ad.id}
                  className="py-3.5 flex items-center justify-between text-xs"
                >
                  <div className="pr-3">
                    <p className="font-semibold text-stone-900">{ad.slotName}</p>
                    <p className="text-stone-500 font-mono-tabular">
                      Slot: {ad.adSlotId} ({ad.adType})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleAdSlot(ad)}
                    className={`px-3 py-1 border cursor-pointer ${
                      ad.enabled
                        ? 'border-emerald-700 text-emerald-800'
                        : 'border-stone-300 text-stone-500'
                    }`}
                  >
                    {ad.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: IMMUTABLE AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-stone-200 p-6 space-y-4">
          <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
            Immutable Administrative Audit Trail
          </h2>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-stone-500">No administrative actions logged yet.</p>
          ) : (
            <div className="divide-y divide-stone-200 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900">
                      {log.actorName}
                    </span>{' '}
                    performed <span className="font-mono-tabular font-semibold text-[#9A3412]">{log.action}</span>{' '}
                    on {log.targetType} ({log.targetId})
                    <p className="text-stone-500 mt-0.5">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
