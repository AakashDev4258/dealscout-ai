import React from 'react';
import { X, Clock, Trash2, ArrowUpRight } from 'lucide-react';
import type { ScoutCategory } from '../types/scout';

export interface HistoryItem {
  id: string;
  query: string;
  category: ScoutCategory;
  timestamp: number;
  resultCount: number;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-[#101012] dark:bg-[#101012] light:bg-white border-l border-[#29292D] dark:border-[#29292D] light:border-zinc-200 p-6 flex flex-col justify-between shadow-2xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF3434]" />
              <h3 className="font-semibold text-sm sm:text-base text-white dark:text-white light:text-zinc-950">
                Recent Scout Sessions
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71717A] hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="py-4 space-y-2 overflow-y-auto max-h-[75vh] scrollbar-thin">
            {items.length === 0 ? (
              <div className="text-center py-12 text-[#71717A] dark:text-[#71717A] light:text-zinc-400 font-mono text-xs">
                No recent scouts yet. Run your first scout!
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-[#141416] hover:bg-[#1A1A1E] dark:bg-[#141416] dark:hover:bg-[#1A1A1E] light:bg-zinc-50 light:hover:bg-zinc-100 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-white dark:text-white light:text-zinc-950 group-hover:text-[#FF3434] dark:group-hover:text-[#FF3434] light:group-hover:text-[#FF3434] transition-colors leading-snug line-clamp-1">
                      {item.query}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#FF3434] shrink-0" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500">
                    <span className="uppercase">{item.category}</span>
                    <span>{item.resultCount} listings</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200 flex items-center justify-between">
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <span className="text-[11px] font-mono text-[#71717A] dark:text-[#71717A] light:text-zinc-500">
              {items.length} saved
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
