import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ScoutResult } from '../types/scout';

interface ComparisonModalProps {
  results: ScoutResult[];
  onClose: () => void;
  onRemoveItem: (id: string) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  results,
  onClose,
  onRemoveItem,
}) => {
  const [copied, setCopied] = useState(false);

  if (results.length === 0) return null;

  const handleCopyMarkdown = () => {
    let md = `# DealScout AI — Opportunity Comparison\n\n`;
    md += `Generated on ${new Date().toLocaleDateString()}\n\n`;

    results.forEach((r, idx) => {
      md += `### ${idx + 1}. [${r.title}](${r.sourceUrl})\n`;
      md += `- **Match Score:** ${r.matchScore}/100\n`;
      md += `- **Domain:** ${r.sourceDomain}\n`;
      md += `- **Why it matches:** ${r.matchReason}\n`;
      if (r.pros?.length) md += `- **Pros:** ${r.pros.join(', ')}\n`;
      if (r.cons?.length) md += `- **Cons:** ${r.cons.join(', ')}\n`;
      if (r.verificationNeeded?.length) {
        md += `- **Verification Needed:** ${r.verificationNeeded.join(', ')}\n`;
      }
      md += `\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-[#101012] dark:bg-[#101012] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#29292D] dark:border-[#29292D] light:border-zinc-200 bg-[#141416] dark:bg-[#141416] light:bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 flex items-center justify-center text-[#FF3434] border border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white dark:text-white light:text-zinc-950">
                Side-by-Side Scout Comparison
              </h2>
              <p className="text-xs font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500">
                Comparing {results.length} candidate opportunities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 hover:bg-[#25252A] dark:hover:bg-[#25252A] light:hover:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white dark:hover:text-white light:hover:text-zinc-950 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#FF3434]" />}
              <span>{copied ? 'Copied MD' : 'Export Markdown'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white dark:text-[#A1A1AA] dark:hover:text-white light:text-zinc-500 light:hover:text-zinc-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="flex-1 overflow-x-auto p-6 scrollbar-thin">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${results.length}, minmax(280px, 1fr))` }}>
            {results.map((r) => (
              <div
                key={r.id}
                className="rounded-xl p-4.5 bg-[#141416] dark:bg-[#141416] light:bg-zinc-50 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono text-zinc-300 dark:text-zinc-300 light:text-zinc-700 font-semibold truncate">
                      {r.sourceDomain}
                    </span>
                    <button
                      onClick={() => onRemoveItem(r.id)}
                      className="text-[#71717A] hover:text-[#FF3434] transition-colors p-0.5"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-sm text-white dark:text-white light:text-zinc-950 leading-snug line-clamp-2">
                    {r.title}
                  </h3>

                  {/* Match Score */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#18181C] dark:bg-[#18181C] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
                    <span className="text-xs font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500">Match Score:</span>
                    <span className="text-sm font-mono font-bold text-[#FF3434]">
                      {r.matchScore}/100
                    </span>
                  </div>

                  {/* Why this matches */}
                  <div className="text-xs space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[#71717A] dark:text-[#71717A] light:text-zinc-500 font-semibold block">
                      Why It Matches:
                    </span>
                    <p className="text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-[11px] leading-relaxed line-clamp-3">
                      {r.matchReason}
                    </p>
                  </div>

                  {/* Verified Pros */}
                  {r.pros && r.pros.length > 0 && (
                    <div className="text-xs space-y-1">
                      <span className="font-mono text-[10px] uppercase text-emerald-400 dark:text-emerald-400 light:text-emerald-700 font-semibold block">
                        Pros:
                      </span>
                      <ul className="space-y-1 text-[11px] text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                        {r.pros.slice(0, 3).map((p, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cons */}
                  {r.cons && r.cons.length > 0 && (
                    <div className="text-xs space-y-1">
                      <span className="font-mono text-[10px] uppercase text-[#71717A] dark:text-[#71717A] light:text-zinc-500 font-semibold block">
                        Caveats:
                      </span>
                      <ul className="space-y-1 text-[11px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600">
                        {r.cons.slice(0, 2).map((c, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-[#71717A]">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Verification Needed */}
                  {r.verificationNeeded && r.verificationNeeded.length > 0 && (
                    <div className="p-2 rounded bg-amber-950/20 dark:bg-amber-950/20 light:bg-amber-50 border border-amber-500/30 text-[11px] text-amber-200 dark:text-amber-200 light:text-amber-900 space-y-1">
                      <span className="font-semibold flex items-center gap-1 font-mono text-[10px]">
                        <AlertTriangle className="w-3 h-3 text-amber-400 dark:text-amber-400 light:text-amber-600" />
                        Verify on Site:
                      </span>
                      <p className="leading-snug">{r.verificationNeeded[0]}</p>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
                  <a
                    href={(r.sourceUrl && (r.sourceUrl.startsWith('http://') || r.sourceUrl.startsWith('https://'))) ? r.sourceUrl : '#'}
                    target={(r.sourceUrl && (r.sourceUrl.startsWith('http://') || r.sourceUrl.startsWith('https://'))) ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#FF3434] hover:bg-[#FF4D4D] text-white transition-colors"
                  >
                    <span>Open Listing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
