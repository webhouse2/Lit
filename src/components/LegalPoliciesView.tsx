import React, { useState } from 'react';
import { ShieldCheck, FileText, Scale, Lock, AlertTriangle } from 'lucide-react';

export type LegalDocType =
  | 'terms'
  | 'privacy'
  | 'copyright'
  | 'agreement'
  | 'guidelines';

interface LegalPoliciesViewProps {
  initialDoc?: LegalDocType;
  onSubmitCopyrightReport: (
    workTitle: string,
    claimantName: string,
    evidence: string
  ) => Promise<void>;
}

export const LegalPoliciesView: React.FC<LegalPoliciesViewProps> = ({
  initialDoc = 'copyright',
  onSubmitCopyrightReport,
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);
  const [workTitle, setWorkTitle] = useState('');
  const [claimantName, setClaimantName] = useState('');
  const [evidence, setEvidence] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCopyrightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workTitle.trim() || !evidence.trim()) return;
    await onSubmitCopyrightReport(
      workTitle.trim(),
      claimantName.trim(),
      evidence.trim()
    );
    setWorkTitle('');
    setClaimantName('');
    setEvidence('');
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <header className="border-b border-stone-200 pb-6 space-y-2">
        <p className="text-xs uppercase tracking-widest text-stone-500">
          LitVault Legal, Intellectual Property & Trust Framework
        </p>
        <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold text-stone-900">
          Policies, Copyright & Publishing Terms
        </h1>
      </header>

      {/* Document Selector */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-4">
        {(
          [
            { id: 'copyright', label: 'Copyright Policy & DMCA' },
            { id: 'agreement', label: 'Author Publishing Agreement' },
            { id: 'terms', label: 'Terms of Service' },
            { id: 'privacy', label: 'Privacy Policy' },
            { id: 'guidelines', label: 'Content Guidelines' },
          ] as const
        ).map((doc) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => setActiveDoc(doc.id)}
            className={`px-4 py-2 text-xs font-medium border transition-colors cursor-pointer ${
              activeDoc === doc.id
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-300 bg-white text-stone-700 hover:border-stone-900'
            }`}
          >
            {doc.label}
          </button>
        ))}
      </div>

      {/* Document Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="lg:col-span-7 bg-white border border-stone-200 p-6 sm:p-8 font-prose text-sm text-stone-800 space-y-4 leading-relaxed">
          {activeDoc === 'copyright' && (
            <>
              <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                Copyright Protection & Intellectual Property Policy
              </h2>
              <p>
                LitVault respects the intellectual property rights of authors,
                poets, and publishers worldwide. Every author registering on
                LitVault or submitting a manuscript must affirmatively certify
                that they are the original creator or hold exclusive digital
                publishing rights.
              </p>
              <p>
                <strong>Zero-Tolerance for Plagiarism:</strong> Unauthorized
                reproduction of copyrighted works results in immediate removal of
                the offending book, suspension of the uploader’s account, and
                forfeiture of any accrued LitToken royalties to the verified
                rights-holder.
              </p>
            </>
          )}

          {activeDoc === 'agreement' && (
            <>
              <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                Author Publishing & Royalty Distribution Agreement
              </h2>
              <p>
                1. <strong>Ownership Retained:</strong> Authors retain 100%
                copyright ownership of their literary works published on
                LitVault. You grant LitVault a non-exclusive digital license to
                display and distribute chapters to readers on the platform.
              </p>
              <p>
                2. <strong>Royalty Split:</strong> For every premium book or
                chapter unlocked via LitTokens, the author receives the
                configured platform royalty share (default 75% of tokens spent),
                recorded atomically in the immutable Author Earnings Ledger.
              </p>
            </>
          )}

          {activeDoc === 'terms' && (
            <>
              <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                LitVault Terms of Service
              </h2>
              <p>
                By accessing LitVault, readers and authors agree to abide by our
                community standards, token economy rules, and anti-piracy
                protections. LitTokens are digital reading credits used within
                LitVault to unlock premium literary editions.
              </p>
            </>
          )}

          {activeDoc === 'privacy' && (
            <>
              <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                Privacy Policy & PII Isolation Architecture
              </h2>
              <p>
                LitVault enforces strict Attribute-Based Access Control (ABAC)
                and Personally Identifiable Information (PII) isolation. Your
                email address is stored in an isolated private subcollection
                accessible only to you and verified administrators, never exposed
                on public profiles.
              </p>
            </>
          )}

          {activeDoc === 'guidelines' && (
            <>
              <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                Editorial & Community Content Guidelines
              </h2>
              <p>
                LitVault welcomes literary fiction, historical drama, poetry,
                thrillers, Christian inspirational works, and speculative
                fiction. Works must carry accurate age ratings (`All Ages`,
                `13+`, `16+`, `18+`). Hate speech, unlawful defamation, and
                plagiarized manuscripts are strictly prohibited.
              </p>
            </>
          )}
        </article>

        {/* Formal Copyright Complaint / DMCA Workflow */}
        <aside className="lg:col-span-5 bg-[#F7F4EE] border border-stone-200 p-6 space-y-4">
          <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
            Submit Formal Copyright / DMCA Notice
          </h3>
          <p className="text-xs text-stone-600">
            If you believe your copyrighted literary work has been published on
            LitVault without authorization, file a formal notice below for
            immediate administrative review.
          </p>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-700/30 text-xs text-emerald-950">
              Your copyright notice has been logged in the Administrator
              Moderation Queue.
            </div>
          ) : (
            <form onSubmit={handleCopyrightSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-stone-600 mb-1">
                  Infringing Book Title or URL *
                </label>
                <input
                  type="text"
                  required
                  value={workTitle}
                  onChange={(e) => setWorkTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block uppercase tracking-wider text-stone-600 mb-1">
                  Rights-Holder / Claimant Name *
                </label>
                <input
                  type="text"
                  required
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block uppercase tracking-wider text-stone-600 mb-1">
                  Proof of Original Publication / ISBN / Statement *
                </label>
                <textarea
                  rows={4}
                  required
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 font-semibold uppercase tracking-wider bg-[#9A3412] text-white cursor-pointer"
              >
                File Copyright Complaint
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
};
