import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  MapPin,
  Calendar,
  Building,
  Award,
  Sparkles,
  Plus,
  Check,
} from 'lucide-react';
import type { ScoutResult } from '../types/scout';

interface ResultCardProps {
  result: ScoutResult;
  isCompared: boolean;
  onToggleCompare: (result: ScoutResult) => void;
  highlightedQuery?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  isCompared,
  onToggleCompare,
}) => {
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  // Safe external URL verification
  const safeSourceUrl =
    result.sourceUrl && (result.sourceUrl.startsWith('http://') || result.sourceUrl.startsWith('https://'))
      ? result.sourceUrl
      : undefined;

  // Score badge tone
  const scoreBadgeTone =
    result.matchScore >= 90
      ? 'border-[#FF3434] text-[#FF3434] bg-[#FF3434]/10 dark:text-[#FF4D4D] dark:bg-[#FF3434]/20'
      : result.matchScore >= 80
      ? 'border-emerald-500/50 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
      : 'border-amber-500/50 text-amber-700 dark:text-amber-400 bg-amber-500/10';

  return (
    <div className="relative rounded-xl bg-[#141416] dark:bg-[#141416] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 p-5 sm:p-6 shadow-xl hover:border-[#3E3E44] dark:hover:border-[#3E3E44] light:hover:border-zinc-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Domain, Category, Match Score, and Compare Action */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Source Domain Indicator */}
            <span className="inline-flex items-center gap-1.5 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {result.sourceDomain}
            </span>

            <span className="text-[#29292D] dark:text-[#29292D] light:text-zinc-300" aria-hidden="true">·</span>

            {/* Category tag */}
            <span className="text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500 uppercase text-[10px] tracking-wider">
              {result.category}
            </span>

            {result.datePublished && (
              <>
                <span className="text-[#29292D] dark:text-[#29292D] light:text-zinc-300" aria-hidden="true">·</span>
                <span className="text-[#71717A] dark:text-[#71717A] light:text-zinc-500 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {result.datePublished}
                </span>
              </>
            )}
          </div>

          {/* Action cluster: Compare button + Score Badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(result)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                isCompared
                  ? 'bg-[#FF3434] text-white border-[#FF3434] font-semibold'
                  : 'bg-[#18181C] dark:bg-[#18181C] light:bg-zinc-100 hover:bg-[#202024] dark:hover:bg-[#202024] light:hover:bg-zinc-200 text-zinc-300 hover:text-white dark:text-zinc-300 dark:hover:text-white light:text-zinc-700 light:hover:text-zinc-900 border-[#29292D] dark:border-[#29292D] light:border-zinc-200'
              }`}
              title="Add to side-by-side comparison"
            >
              {isCompared ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              <span>{isCompared ? 'Comparing' : 'Compare'}</span>
            </button>

            {/* Score Badge */}
            <div className="relative">
              <button
                onClick={() => setShowScoreInfo(!showScoreInfo)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${scoreBadgeTone}`}
                title="Click for score calculation methodology"
              >
                <span>{result.matchScore}</span>
                <span className="text-[10px] font-normal opacity-70">/100</span>
                <Info className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {/* Score Breakdown Popover */}
              {showScoreInfo && (
                <div className="absolute right-0 top-full mt-2 w-64 p-3.5 rounded-xl bg-[#101012] dark:bg-[#101012] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 shadow-2xl z-30 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between border-b border-[#29292D] dark:border-[#29292D] light:border-zinc-200 pb-1.5">
                    <span className="font-semibold text-white dark:text-white light:text-zinc-900">
                      Score Breakdown
                    </span>
                    <span className="text-[10px] text-[#71717A] dark:text-[#71717A] light:text-zinc-500">Not a probability</span>
                  </div>
                  <div className="space-y-1 text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600 text-[11px]">
                    <div className="flex justify-between">
                      <span>Query Alignment (35%):</span>
                      <span className="font-bold text-white dark:text-white light:text-zinc-900">
                        {result.scoreBreakdown?.queryAlignment ?? 0}/35
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Evidence Depth (25%):</span>
                      <span className="font-bold text-white dark:text-white light:text-zinc-900">
                        {result.scoreBreakdown?.evidenceDepth ?? 0}/25
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Freshness (20%):</span>
                      <span className="font-bold text-white dark:text-white light:text-zinc-900">
                        {result.scoreBreakdown?.freshness ?? 0}/20
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Practical Feasibility (20%):</span>
                      <span className="font-bold text-white dark:text-white light:text-zinc-900">
                        {result.scoreBreakdown?.feasibility ?? 0}/20
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#71717A] dark:text-[#71717A] light:text-zinc-400 pt-1 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
                    Calculated objectively against snippet facts.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-white dark:text-white light:text-zinc-950 group-hover:text-[#FF3434] dark:group-hover:text-[#FF3434] light:group-hover:text-[#FF3434] transition-colors leading-snug mb-2.5">
          <a
            href={safeSourceUrl || '#'}
            target={safeSourceUrl ? '_blank' : undefined}
            rel={safeSourceUrl ? 'noopener noreferrer' : undefined}
            className="hover:underline flex items-start gap-1.5"
          >
            <span>{result.title}</span>
            {safeSourceUrl && <ExternalLink className="w-4 h-4 shrink-0 text-[#71717A] group-hover:text-[#FF3434] mt-1" />}
          </a>
        </h3>

        {/* Why this matches callout */}
        <div className="mb-3.5 px-3.5 py-2.5 rounded-lg bg-[#18181C] dark:bg-[#18181C] light:bg-zinc-50 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 text-xs leading-relaxed text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#FF3434] font-semibold mb-0.5">
            <Sparkles className="w-3 h-3" />
            <span>Why This Matches Your Request</span>
          </div>
          <p>{result.matchReason}</p>
        </div>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600 mb-4 leading-relaxed line-clamp-3">
          {result.summary}
        </p>

        {/* Metadata Badges */}
        {result.metadata && Object.keys(result.metadata).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {result.metadata.compensation && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/30 font-medium">
                <DollarSign className="w-3 h-3" />
                {result.metadata.compensation}
              </span>
            )}
            {result.metadata.prizePool && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-amber-500/10 text-amber-400 dark:text-amber-400 light:text-amber-700 border border-amber-500/30 font-medium">
                <Award className="w-3 h-3" />
                Prize: {result.metadata.prizePool}
              </span>
            )}
            {result.metadata.currentPrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/30 font-medium">
                <DollarSign className="w-3 h-3" />
                Price: {result.metadata.currentPrice}
                {result.metadata.discountPercentage && (
                  <span className="text-[#FF3434] font-bold ml-1">
                    ({result.metadata.discountPercentage} OFF)
                  </span>
                )}
              </span>
            )}
            {result.metadata.company && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-[#18181C] dark:bg-[#18181C] light:bg-zinc-100 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
                <Building className="w-3 h-3 text-[#71717A]" />
                {result.metadata.company}
              </span>
            )}
            {result.metadata.workType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-[#18181C] dark:bg-[#18181C] light:bg-zinc-100 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
                <MapPin className="w-3 h-3 text-[#71717A]" />
                {result.metadata.workType}
              </span>
            )}
            {result.metadata.deadline && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-amber-500/10 text-amber-300 dark:text-amber-300 light:text-amber-800 border border-amber-500/30">
                <Calendar className="w-3 h-3 text-amber-400 dark:text-amber-400 light:text-amber-600" />
                Deadline: {result.metadata.deadline}
              </span>
            )}
            {result.metadata.fundingAmount && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/30 font-medium">
                Grant: {result.metadata.fundingAmount}
              </span>
            )}
          </div>
        )}

        {/* Pros & Caveats Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs">
          {/* Pros */}
          {result.pros && result.pros.length > 0 && (
            <div className="p-3 rounded-lg bg-emerald-950/20 dark:bg-emerald-950/20 light:bg-emerald-50 border border-emerald-500/20">
              <span className="text-[10px] font-mono uppercase text-emerald-400 dark:text-emerald-400 light:text-emerald-700 font-semibold block mb-1.5">
                Verified Pros:
              </span>
              <ul className="space-y-1 text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                {result.pros.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Caveats */}
          {result.cons && result.cons.length > 0 && (
            <div className="p-3 rounded-lg bg-[#18181C] dark:bg-[#18181C] light:bg-zinc-50 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
              <span className="text-[10px] font-mono uppercase text-[#71717A] dark:text-[#71717A] light:text-zinc-500 font-semibold block mb-1.5">
                Caveats / Limitations:
              </span>
              <ul className="space-y-1 text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600">
                {result.cons.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[#71717A] dark:text-[#71717A] light:text-zinc-400 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Verification Needed */}
        {result.verificationNeeded && result.verificationNeeded.length > 0 && (
          <div className="mb-4 p-2.5 rounded-lg bg-amber-950/20 dark:bg-amber-950/20 light:bg-amber-50 border border-amber-500/30 text-amber-200 dark:text-amber-200 light:text-amber-900 text-[11px] font-mono flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 dark:text-amber-400 light:text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Verification Needed on Site:</span>
              <ul className="list-disc list-inside space-y-0.5 opacity-90">
                {result.verificationNeeded.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200 flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#71717A] dark:text-[#71717A] light:text-zinc-500 uppercase tracking-wider">
          Verified Source Listing
        </span>

        <a
          href={safeSourceUrl || '#'}
          target={safeSourceUrl ? '_blank' : undefined}
          rel={safeSourceUrl ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-[#FF3434] hover:text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-[#FF3434] dark:hover:text-white light:bg-zinc-900 light:text-white light:hover:bg-[#FF3434] transition-colors shadow-sm"
        >
          <span>Open Listing</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
