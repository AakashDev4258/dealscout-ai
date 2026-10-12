import React from 'react';
import { Radar, Moon, Sun, KeyRound, History, MessageSquare, Mic, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenApiKeyModal: () => void;
  onOpenHistory: () => void;
  onOpenChat: () => void;
  onOpenVoice: () => void;
  historyCount: number;
  configStatus: {
    geminiConfigured: boolean;
    serpApiConfigured: boolean;
  };
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenApiKeyModal,
  onOpenHistory,
  onOpenChat,
  onOpenVoice,
  historyCount,
  configStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-[#29292D] dark:border-[#29292D] light:border-zinc-200 bg-[#0B0B0D]/90 dark:bg-[#0B0B0D]/90 light:bg-white/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#141416] dark:bg-[#141416] light:bg-zinc-100 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 shadow-inner">
            <Radar className="w-5 h-5 text-[#FF3434] animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FF3434] ring-2 ring-[#0B0B0D] dark:ring-[#0B0B0D] light:ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg tracking-tight text-white dark:text-white light:text-zinc-950 font-sans">
                DealScout<span className="text-[#FF3434]">.AI</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
                Agent
              </span>
            </div>
            <p className="hidden md:block text-[11px] font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500">
              Discover Opportunities. Make Smarter Moves.
            </p>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Voice Mode Button */}
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono bg-[#141416] dark:bg-[#141416] light:bg-zinc-100 hover:bg-[#1C1C20] dark:hover:bg-[#1C1C20] light:hover:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white dark:hover:text-white light:hover:text-zinc-950 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 hover:border-[#FF3434]/40 transition-all shadow-sm"
            title="Start Gemini Live Voice Conversation"
          >
            <Mic className="w-3.5 h-3.5 text-[#FF3434]" />
            <span className="hidden sm:inline">Voice Agent</span>
          </button>

          {/* Chatbot Button */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono bg-[#141416] dark:bg-[#141416] light:bg-zinc-100 hover:bg-[#1C1C20] dark:hover:bg-[#1C1C20] light:hover:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white dark:hover:text-white light:hover:text-zinc-950 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 hover:border-[#FF3434]/40 transition-all shadow-sm"
            title="Open DealScout AI Copilot Chatbot"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#FF3434]" />
            <span className="hidden sm:inline">Copilot Chat</span>
          </button>

          {/* Engine Status indicator */}
          <button
            onClick={onOpenApiKeyModal}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              configStatus.serpApiConfigured
                ? 'bg-[#141416] dark:bg-[#141416] light:bg-zinc-100 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border-[#29292D] dark:border-[#29292D] light:border-zinc-200 hover:border-[#3E3E44]'
                : 'bg-red-500/10 text-[#FF3434] border-red-500/30 hover:bg-red-500/20'
            }`}
            title="Configure API Secrets"
          >
            {configStatus.serpApiConfigured ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-[#FF3434]" />
            )}
            <span>
              {configStatus.serpApiConfigured ? 'SerpApi Active' : 'API Setup'}
            </span>
            <KeyRound className="w-3 h-3 text-[#71717A]" />
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[#141416] dark:bg-[#141416] light:bg-zinc-100 hover:bg-[#1C1C20] dark:hover:bg-[#1C1C20] light:hover:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white dark:hover:text-white light:hover:text-zinc-950 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 transition-colors"
            title="View Recent Scout Searches"
          >
            <History className="w-3.5 h-3.5 text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500" />
            {historyCount > 0 && (
              <span className="w-4 h-4 text-[10px] font-mono rounded-full bg-[#FF3434] text-white flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-[#141416] dark:bg-[#141416] light:bg-zinc-100 hover:bg-[#1C1C20] dark:hover:bg-[#1C1C20] light:hover:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 transition-colors"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
