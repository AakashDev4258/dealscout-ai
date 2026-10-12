import React, { useState } from 'react';
import {
  Briefcase,
  Trophy,
  Tag,
  BookOpen,
  Sparkles,
  SlidersHorizontal,
  Search,
  ArrowRight,
  MapPin,
  Clock,
  X,
  Compass,
} from 'lucide-react';
import type { ScoutCategory, ScoutFilters } from '../types/scout';

interface SearchConsoleProps {
  query: string;
  onQueryChange: (q: string) => void;
  category: ScoutCategory;
  onCategoryChange: (cat: ScoutCategory) => void;
  filters: ScoutFilters;
  onFiltersChange: (f: ScoutFilters) => void;
  onScout: () => void;
  isLoading: boolean;
}

const CATEGORIES: { id: ScoutCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'All Opportunities', icon: Sparkles },
  { id: 'jobs', label: 'Jobs & Internships', icon: Briefcase },
  { id: 'hackathons', label: 'Hackathons & Bounties', icon: Trophy },
  { id: 'deals', label: 'Products & Deals', icon: Tag },
  { id: 'research', label: 'Research & Grants', icon: BookOpen },
  { id: 'custom', label: 'Custom Discovery', icon: Compass },
];

const PRESETS: Record<ScoutCategory, { label: string; query: string }[]> = {
  all: [
    { label: 'Remote AI Jobs', query: 'Remote AI engineer roles posted recently with salary transparent' },
    { label: 'Global Hackathons', query: 'Global hackathons in 2026 with cash prize pool and open registration' },
    { label: 'Developer Deals', query: 'Discounted mechanical keyboards and ergonomics for developers deals' },
  ],
  jobs: [
    { label: 'Junior AI Engineer', query: 'Junior AI engineer remote jobs posted this week hiring now' },
    { label: 'Summer 2026 Intern', query: 'Software engineer internship summer 2026 application open' },
    { label: 'Staff ML Engineer', query: 'Staff machine learning engineer remote salary $200k+' },
  ],
  hackathons: [
    { label: 'Agentic AI Hackathons', query: 'Agentic AI hackathons 2026 cash prizes online registration' },
    { label: 'Solana/Web3 Bounties', query: 'Active Web3 developer bounties and hackathons with prize pool' },
    { label: 'Student Hackathons', query: 'Collegiate hackathons 2026 spring travel stipend grants' },
  ],
  deals: [
    { label: 'M3/M4 MacBook Deals', query: 'MacBook Pro M3 or M4 discount deals under $2000 in stock' },
    { label: '4K Monitor Discounts', query: '4K 144Hz monitor discount sales under $400' },
    { label: 'Cloud Credits/SaaS', query: 'Free cloud computing credits for startups and developer discounts' },
  ],
  research: [
    { label: 'Open Science AI Grants', query: 'Open source AI research grants and funding open call 2026' },
    { label: 'Climate Tech Fellowships', query: 'Climate tech innovation fellowships and seed grants application' },
    { label: 'NSF Seed Funding', query: 'NSF SBIR small business research grants RFP open' },
  ],
  custom: [
    { label: 'YC Application Deadlines', query: 'Y Combinator batch application deadline and founder requirements' },
    { label: 'Tech Conferences 2026', query: 'Premier artificial intelligence conferences CFP dates 2026' },
    { label: 'Angel Investment RFPs', query: 'AI startup accelerator open applications rolling basis' },
  ],
};

export const SearchConsole: React.FC<SearchConsoleProps> = ({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  filters,
  onFiltersChange,
  onScout,
  isLoading,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && query.trim()) {
      onScout();
    }
  };

  const activeFilterCount = [
    filters.location,
    filters.remoteOnly,
    filters.budgetMin || filters.budgetMax,
    filters.timeframe && filters.timeframe !== 'any',
  ].filter(Boolean).length;

  const currentPresets = PRESETS[category] || PRESETS.all;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3.5">
      {/* Category Navigation Bar (Segmented Controls) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#1C1C20] text-white dark:bg-[#1C1C20] dark:text-white light:bg-zinc-900 light:text-white border-[#FF3434] shadow-[0_0_14px_rgba(255,52,52,0.25)] font-semibold'
                  : 'bg-[#141416] hover:bg-[#1A1A1E] dark:bg-[#141416] dark:hover:bg-[#1A1A1E] light:bg-white light:hover:bg-zinc-100 text-[#A1A1AA] hover:text-white dark:text-[#A1A1AA] dark:hover:text-white light:text-zinc-600 light:hover:text-zinc-900 border-[#29292D] dark:border-[#29292D] light:border-zinc-200 hover:border-[#3E3E44]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF3434]' : 'text-[#71717A] dark:text-[#71717A] light:text-zinc-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Search Surface */}
      <div className="relative rounded-xl bg-[#141416] dark:bg-[#141416] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 shadow-2xl transition-all focus-within:border-[#FF3434] focus-within:ring-2 focus-within:ring-[#FF3434]/20">
        <div className="flex items-center px-4 py-3 sm:py-3.5 gap-3">
          {/* Prompt prefix icon */}
          <div className="flex items-center gap-1.5 text-[#71717A] dark:text-[#71717A] light:text-zinc-400 font-mono text-sm select-none">
            <span className="text-[#FF3434] font-bold">&gt;</span>
            <Search className="w-4 h-4 text-[#71717A] dark:text-[#71717A] light:text-zinc-400" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              category === 'jobs'
                ? 'e.g. Remote AI engineer at seed-funded startups with salary...'
                : category === 'hackathons'
                ? 'e.g. Generative AI hackathons with $50k+ cash prize pool in 2026...'
                : category === 'deals'
                ? 'e.g. 32-inch 4K OLED monitor discount under $700...'
                : category === 'research'
                ? 'e.g. Open climate tech seed grants and fellowships for 2026...'
                : 'Scout any job, deal, hackathon, grant, or market opportunity...'
            }
            className="flex-1 bg-transparent text-white dark:text-white light:text-zinc-950 text-sm sm:text-base font-sans placeholder-[#71717A] dark:placeholder-[#71717A] light:placeholder-zinc-400 focus:outline-none"
          />

          {/* Clear query button */}
          {query && !isLoading && (
            <button
              onClick={() => onQueryChange('')}
              className="p-1 text-[#71717A] hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-colors"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Filters Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 text-white dark:text-white light:text-zinc-950 border-[#FF3434]/50'
                : 'bg-transparent text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600 border-[#29292D] dark:border-[#29292D] light:border-zinc-200 hover:text-white dark:hover:text-white light:hover:text-zinc-950'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#FF3434] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* "Scout Now" Primary Action Button */}
          <button
            onClick={onScout}
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg bg-[#FF3434] hover:bg-[#FF4D4D] active:bg-[#E02424] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold tracking-wide shadow-[0_0_20px_rgba(255,52,52,0.3)] transition-all transform active:scale-95"
          >
            <span>{isLoading ? 'Scouting...' : 'Scout Now'}</span>
            <ArrowRight className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Expandable Filter Drawer */}
        {showFilters && (
          <div className="border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200 p-4 bg-[#101012] dark:bg-[#101012] light:bg-zinc-50 rounded-b-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#71717A] dark:text-[#71717A] light:text-zinc-500 font-semibold">
                Search Constraints & Criteria
              </span>
              <button
                onClick={() => onFiltersChange({})}
                className="text-xs font-mono text-[#FF3434] hover:underline"
              >
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Location Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-700 flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-[#FF3434]" />
                  <span>Location or Region</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. United States, Global, SF..."
                  value={filters.location || ''}
                  onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#141416] dark:bg-[#141416] light:bg-white text-white dark:text-white light:text-zinc-950 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 focus:outline-none focus:border-[#FF3434]"
                />
              </div>

              {/* Timeframe Select */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-700 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-[#FF3434]" />
                  <span>Recency / Posted Date</span>
                </label>
                <select
                  value={filters.timeframe || 'any'}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, timeframe: e.target.value as ScoutFilters['timeframe'] })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#141416] dark:bg-[#141416] light:bg-white text-white dark:text-white light:text-zinc-950 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 focus:outline-none focus:border-[#FF3434]"
                >
                  <option value="any">Anytime</option>
                  <option value="24h">Past 24 Hours</option>
                  <option value="week">Past 7 Days</option>
                  <option value="month">Past 30 Days</option>
                </select>
              </div>

              {/* Remote Only Toggle */}
              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!filters.remoteOnly}
                    onChange={(e) => onFiltersChange({ ...filters, remoteOnly: e.target.checked })}
                    className="w-4 h-4 rounded border-[#29292D] dark:border-[#29292D] light:border-zinc-300 text-[#FF3434] focus:ring-[#FF3434] bg-[#141416] dark:bg-[#141416] light:bg-white"
                  />
                  <span className="text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-800 font-medium">
                    Remote / Online Only
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Scouts */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] dark:text-[#71717A] light:text-zinc-500 font-semibold">
          Try Scout:
        </span>
        {currentPresets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              onQueryChange(preset.query);
            }}
            className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#141416] hover:bg-[#1A1A1E] dark:bg-[#141416] dark:hover:bg-[#1A1A1E] light:bg-white light:hover:bg-zinc-100 text-[#A1A1AA] hover:text-white dark:text-[#A1A1AA] dark:hover:text-white light:text-zinc-700 light:hover:text-zinc-950 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 hover:border-[#3E3E44] transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
