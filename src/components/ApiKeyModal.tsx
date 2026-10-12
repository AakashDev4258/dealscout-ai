import React from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  configStatus: {
    geminiConfigured: boolean;
    serpApiConfigured: boolean;
    serpApiKeyIsUrl?: boolean;
  };
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, configStatus }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#101012] dark:bg-[#101012] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#29292D] dark:border-[#29292D] light:border-zinc-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#141416] dark:bg-[#141416] light:bg-zinc-100 flex items-center justify-center text-[#FF3434] border border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white dark:text-white light:text-zinc-950">
                Agent Engine Secrets & Integration
              </h3>
              <p className="text-xs font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500">
                Google AI Studio & SerpApi Server Credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-white dark:hover:text-white light:hover:text-zinc-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if SerpApi key was entered as a URL */}
        {configStatus.serpApiKeyIsUrl && (
          <div className="p-3.5 rounded-xl bg-amber-950/20 dark:bg-amber-950/20 light:bg-amber-50 border border-amber-500/40 text-amber-200 dark:text-amber-200 light:text-amber-900 text-xs font-mono space-y-1">
            <div className="flex items-center gap-2 font-semibold text-amber-400 dark:text-amber-400 light:text-amber-700">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Notice: SERPAPI_API_KEY is currently set to a URL</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your SerpApi secret appears to be set to a URL instead of your private key token. Please replace it in AI Studio Secrets with your 64-character API key from{' '}
              <a href="https://serpapi.com/manage-api-key" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                serpapi.com/manage-api-key
              </a>.
            </p>
          </div>
        )}

        {/* Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Gemini Status */}
          <div className="p-3.5 rounded-xl bg-[#141416] dark:bg-[#141416] light:bg-zinc-50 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono text-zinc-300 dark:text-zinc-300 light:text-zinc-700 flex items-center gap-1.5 font-medium">
                <Cpu className="w-3.5 h-3.5 text-[#FF3434]" />
                Gemini 3.8 Flash
              </span>
              {configStatus.geminiConfigured ? (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Attached
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono text-[#FF3434] font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Missing
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500 leading-relaxed">
              Powers query planning, 4-factor scoring, Copilot chatbot, and Gemini Live voice audio.
            </p>
          </div>

          {/* SerpApi Status */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            configStatus.serpApiConfigured
              ? 'bg-[#141416] dark:bg-[#141416] light:bg-zinc-50 border-[#29292D] dark:border-[#29292D] light:border-zinc-200'
              : 'bg-[#1A0F0F] dark:bg-[#1A0F0F] light:bg-red-50 border-red-500/40'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono text-zinc-300 dark:text-zinc-300 light:text-zinc-700 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                SerpApi Google Engine
              </span>
              {configStatus.serpApiConfigured ? (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono text-[#FF3434] font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Key Required
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500 leading-relaxed">
              Executes live Google web searches for verified jobs, hackathons, discounts, and grants.
            </p>
          </div>
        </div>

        {/* Step by Step Setup Guide */}
        <div className="space-y-4 bg-[#141416] dark:bg-[#141416] light:bg-zinc-50 p-4.5 rounded-xl border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 text-xs">
          <div>
            <h4 className="font-mono uppercase text-[#FF3434] font-semibold tracking-wider mb-1 flex items-center gap-1.5">
              <span>1. Configuring SerpApi Google Search:</span>
            </h4>
            <ol className="text-zinc-300 dark:text-zinc-300 light:text-zinc-700 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Sign in to{' '}
                <a
                  href="https://serpapi.com/manage-api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline inline-flex items-center gap-0.5 hover:text-[#FF3434]"
                >
                  serpapi.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and copy your <strong>API Key</strong> (free tier provides 100 searches/mo).
              </li>
              <li>
                In Google AI Studio, open <span className="font-bold text-white dark:text-white light:text-zinc-950">Settings &gt; Secrets</span> in the top-right menu.
              </li>
              <li>
                Set secret name to <code className="text-[#FF3434] font-mono font-bold">SERPAPI_API_KEY</code> and paste your 64-character hex key.
              </li>
            </ol>
          </div>

          <div className="pt-2 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
            <h4 className="font-mono uppercase text-[#FF3434] font-semibold tracking-wider mb-1 flex items-center gap-1.5">
              <span>2. Configuring Gemini API:</span>
            </h4>
            <p className="text-zinc-300 dark:text-zinc-300 light:text-zinc-700 leading-relaxed">
              Ensure your <code className="text-[#FF3434] font-mono font-bold">GEMINI_API_KEY</code> in AI Studio Secrets contains a valid Google AI Studio key (starts with <code className="font-mono text-zinc-200 dark:text-zinc-200 light:text-zinc-800">AIzaSy...</code> from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-[#FF3434]"
              >
                aistudio.google.com
              </a>).
            </p>
          </div>
        </div>

        {/* Security Guarantee */}
        <div className="p-3.5 rounded-xl bg-[#141416] dark:bg-[#141416] light:bg-zinc-100 text-[11px] font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600 space-y-1 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
          <div className="flex items-center gap-1.5 text-white dark:text-white light:text-zinc-900 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Server-Side Secret Isolation</span>
          </div>
          <p>
            All Gemini and SerpApi calls are strictly processed server-side in Node.js. No API keys are ever leaked to client bundles, logs, or URLs.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-[#FF3434] hover:text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-[#FF3434] dark:hover:text-white light:bg-zinc-900 light:text-white light:hover:bg-[#FF3434] transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
