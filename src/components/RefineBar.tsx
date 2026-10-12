import React, { useState } from 'react';
import { RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

interface RefineBarProps {
  onRefine: (refinementText: string) => void;
  onReset: () => void;
  isLoading: boolean;
}

export const RefineBar: React.FC<RefineBarProps> = ({ onRefine, onReset, isLoading }) => {
  const [refineText, setRefineText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refineText.trim() && !isLoading) {
      onRefine(refineText.trim());
      setRefineText('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl bg-[#141416] dark:bg-[#141416] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 p-3 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
      <form onSubmit={handleSubmit} className="flex-1 w-full flex items-center gap-2">
        <div className="text-[#71717A] dark:text-[#71717A] light:text-zinc-500 font-mono text-xs flex items-center gap-1 select-none">
          <Sparkles className="w-3.5 h-3.5 text-[#FF3434]" />
          <span className="hidden sm:inline">Refine:</span>
        </div>
        <input
          type="text"
          value={refineText}
          onChange={(e) => setRefineText(e.target.value)}
          placeholder="e.g. 'Only show listings with verified remote eligibility' or 'Max price under $500'..."
          disabled={isLoading}
          className="flex-1 bg-transparent text-xs sm:text-sm text-white dark:text-white light:text-zinc-950 placeholder-[#71717A] dark:placeholder-[#71717A] light:placeholder-zinc-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!refineText.trim() || isLoading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FF3434] hover:bg-[#FF4D4D] active:bg-[#E02424] disabled:opacity-40 text-white transition-all shadow-sm"
        >
          <span>Refine</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="border-t sm:border-t-0 sm:border-l border-[#29292D] dark:border-[#29292D] light:border-zinc-200 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto flex justify-end">
        <button
          onClick={onReset}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 hover:bg-[#25252A] dark:hover:bg-[#25252A] light:hover:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white dark:hover:text-white light:hover:text-zinc-950 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#FF3434]" />
          <span>New Scout</span>
        </button>
      </div>
    </div>
  );
};
