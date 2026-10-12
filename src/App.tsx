/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchConsole } from './components/SearchConsole';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { ResultCard } from './components/ResultCard';
import { ComparisonModal } from './components/ComparisonModal';
import { RefineBar } from './components/RefineBar';
import { HistoryDrawer, type HistoryItem } from './components/HistoryDrawer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { VoiceModal } from './components/VoiceModal';
import type {
  ScoutCategory,
  ScoutFilters,
  ScoutResult,
  PipelineStep,
  PipelineStageId,
  AgentLogEntry,
  ScoutResponse,
  ChatContext,
} from './types/scout';
import {
  Sparkles,
  Scale,
  AlertTriangle,
  KeyRound,
  ExternalLink,
  MessageSquare,
  Mic,
  Cpu,
  Linkedin,
} from 'lucide-react';

const INITIAL_STEPS: PipelineStep[] = [
  {
    id: 'understanding',
    label: 'Understanding request',
    description: 'Gemini decomposes user intent, category context, and scoring constraints.',
    status: 'idle',
    progress: 0,
    subSteps: [
      { id: 'parse_intent', title: 'Intent Parsing', description: 'Extracting semantic goals & parameters', status: 'pending' },
      { id: 'query_strategy', title: 'Search Plan Formulation', description: 'Formulating targeted Google queries', status: 'pending' },
    ],
  },
  {
    id: 'searching',
    label: 'Searching the web',
    description: 'SerpApi queries live Google index across targeted queries.',
    status: 'idle',
    progress: 0,
    subSteps: [
      { id: 'dispatch_queries', title: 'Google Index Queries', description: 'Executing parallel SerpApi requests', status: 'pending' },
      { id: 'gather_snippets', title: 'Search Stream Ingestion', description: 'Ingesting organic snippets & metadata', status: 'pending' },
    ],
  },
  {
    id: 'analyzing',
    label: 'Analyzing results',
    description: 'Gemini cross-references snippets against 4 objective criteria.',
    status: 'idle',
    progress: 0,
    subSteps: [
      { id: 'evidence_verification', title: 'Snippet Verification', description: 'Checking facts & currency', status: 'pending' },
      { id: 'scoring_breakdown', title: 'Match Score Calculation', description: 'Computing 4-criteria breakdown', status: 'pending' },
    ],
  },
  {
    id: 'recommendations',
    label: 'Preparing recommendations',
    description: 'Synthesizing pros, cons, and flagging unverified site details.',
    status: 'idle',
    progress: 0,
    subSteps: [
      { id: 'finalize_report', title: 'Opportunity Intelligence Report', description: 'Compiling ranked listings & source links', status: 'pending' },
    ],
  },
];

export default function App() {
  // Theme state: dark mode is default across entire application
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('dealscout_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  // Query & Options state
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ScoutCategory>('all');
  const [filters, setFilters] = useState<ScoutFilters>({});

  // Execution & Progress state
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [currentStage, setCurrentStage] = useState<PipelineStageId>('understanding');
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [generatedQueries, setGeneratedQueries] = useState<string[]>([]);
  const [rawCount, setRawCount] = useState<number | undefined>();
  const [deduplicatedCount, setDeduplicatedCount] = useState<number | undefined>();
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Results state
  const [results, setResults] = useState<ScoutResult[]>([]);
  const [activePlan, setActivePlan] = useState<ScoutResponse['plan'] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'title'>('score');

  // Comparison state
  const [comparedResults, setComparedResults] = useState<ScoutResult[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Modals & Drawers state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('dealscout_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Config status from server
  const [configStatus, setConfigStatus] = useState({
    geminiConfigured: true,
    serpApiConfigured: false,
  });

  // Fetch config status on mount
  useEffect(() => {
    fetch('/api/config-status')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setConfigStatus({
            geminiConfigured: !!data.geminiConfigured,
            serpApiConfigured: !!data.serpApiConfigured,
          });
        }
      })
      .catch((err) => console.warn('Config status check error:', err));
  }, []);

  // Sync theme with root element (html.dark or html.light) and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
    }
    localStorage.setItem('dealscout_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const saveToHistory = useCallback((q: string, cat: ScoutCategory, count: number) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      query: q,
      category: cat,
      timestamp: Date.now(),
      resultCount: count,
    };
    setHistoryItems((prev) => {
      const updated = [newItem, ...prev.filter((i) => i.query !== q)].slice(0, 15);
      localStorage.setItem('dealscout_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Main Scout Execution Pipeline with Granular Progress Tracking
  const executeScout = async (scoutQuery?: string, scoutFilters?: ScoutFilters) => {
    const finalQuery = (scoutQuery || query).trim();
    if (!finalQuery) return;

    const finalFilters = scoutFilters !== undefined ? scoutFilters : filters;

    setIsLoading(true);
    setError(null);
    setErrorCode(null);
    setHasSearched(true);
    setCurrentStage('understanding');
    setOverallProgress(5);
    setAgentLogs([]);

    // Reset pipeline steps
    setPipelineSteps(
      INITIAL_STEPS.map((s, idx) => ({
        ...s,
        status: idx === 0 ? 'running' : 'idle',
        subSteps: s.subSteps.map((sub) => ({ ...sub, status: 'pending' })),
      }))
    );
    setGeneratedQueries([]);
    setRawCount(undefined);
    setDeduplicatedCount(undefined);

    try {
      const response = await fetch('/api/scout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: finalQuery,
          category,
          filters: finalFilters,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const chunk of lines) {
            const trimmed = chunk.trim();
            if (!trimmed) continue;

            let eventName = 'message';
            let dataStr = '';

            const eventMatch = trimmed.match(/^event:\s*(.+)$/m);
            if (eventMatch) eventName = eventMatch[1].trim();

            const dataMatch = trimmed.match(/^data:\s*(.+)$/m);
            if (dataMatch) dataStr = dataMatch[1].trim();

            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              if (eventName === 'stage_change') {
                const newStage: PipelineStageId = data.stage;
                setCurrentStage(newStage);
                if (data.progress !== undefined) {
                  setOverallProgress(data.progress);
                }

                setPipelineSteps((prev) =>
                  prev.map((step) => {
                    if (step.id === newStage) {
                      return { ...step, status: 'running' };
                    }
                    const order = ['understanding', 'searching', 'analyzing', 'recommendations', 'complete'];
                    const curIndex = order.indexOf(newStage);
                    const thisIndex = order.indexOf(step.id);
                    if (thisIndex < curIndex) {
                      return {
                        ...step,
                        status: 'completed',
                        subSteps: step.subSteps.map((sub) => ({ ...sub, status: 'completed' })),
                      };
                    }
                    return step;
                  })
                );
              } else if (eventName === 'sub_step') {
                if (data.progress !== undefined) {
                  setOverallProgress(data.progress);
                }
                setPipelineSteps((prev) =>
                  prev.map((step) => {
                    if (step.id === data.stage) {
                      return {
                        ...step,
                        subSteps: step.subSteps.map((sub) =>
                          sub.id === data.subStepId
                            ? { ...sub, status: 'completed' }
                            : sub
                        ),
                      };
                    }
                    return step;
                  })
                );
              } else if (eventName === 'log') {
                setAgentLogs((prev) => [
                  ...prev,
                  {
                    timestamp: data.timestamp || new Date().toLocaleTimeString(),
                    stage: data.stage,
                    type: data.type || 'info',
                    message: data.message,
                  },
                ]);
              } else if (eventName === 'plan_generated') {
                setActivePlan(data.plan);
                if (Array.isArray(data.queries)) {
                  setGeneratedQueries(data.queries);
                }
              } else if (eventName === 'search_counts' || eventName === 'search_completed') {
                setRawCount(data.rawCount);
                setDeduplicatedCount(data.deduplicatedCount);
              } else if (eventName === 'results' || eventName === 'complete') {
                const receivedResults: ScoutResult[] = data.results || [];
                setResults(receivedResults);
                if (data.plan) setActivePlan(data.plan);
                setOverallProgress(100);
                setCurrentStage('complete');

                setPipelineSteps((prev) =>
                  prev.map((s) => ({
                    ...s,
                    status: 'completed',
                    subSteps: s.subSteps.map((sub) => ({ ...sub, status: 'completed' })),
                  }))
                );

                saveToHistory(finalQuery, category, receivedResults.length);
              } else if (eventName === 'pipeline_error' || eventName === 'error') {
                setError(data.error);
                if (data.code) setErrorCode(data.code);
                setIsLoading(false);

                setPipelineSteps((prev) =>
                  prev.map((s) => (s.id === currentStage ? { ...s, status: 'failed' } : s))
                );
              }
            } catch (jsonErr) {
              console.warn('Error parsing event-stream JSON:', jsonErr);
            }
          }
        }
      } else {
        // Fallback for non-streaming response
        const data: ScoutResponse = await response.json();
        setResults(data.results);
        setActivePlan(data.plan);
        setOverallProgress(100);
        setCurrentStage('complete');
        setPipelineSteps((prev) =>
          prev.map((s) => ({
            ...s,
            status: 'completed',
            subSteps: s.subSteps.map((sub) => ({ ...sub, status: 'completed' })),
          }))
        );
        saveToHistory(finalQuery, category, data.results.length);
      }
    } catch (err: any) {
      console.error('Scout execution failed:', err);
      setError(err.message || 'An error occurred during scouting.');
      setPipelineSteps((prev) =>
        prev.map((s) => (s.id === currentStage ? { ...s, status: 'failed' } : s))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  const handleToggleCompare = (res: ScoutResult) => {
    setComparedResults((prev) => {
      const exists = prev.some((r) => r.id === res.id);
      if (exists) {
        return prev.filter((r) => r.id !== res.id);
      } else {
        if (prev.length >= 4) {
          setCompareNotice('You can compare a maximum of 4 opportunities simultaneously.');
          setTimeout(() => setCompareNotice(null), 3000);
          return prev;
        }
        return [...prev, res];
      }
    });
  };

  const handleRefine = (refinementText: string) => {
    const combinedQuery = `${query} (${refinementText})`;
    setQuery(combinedQuery);
    executeScout(combinedQuery);
  };

  const handleReset = () => {
    setQuery('');
    setResults([]);
    setActivePlan(null);
    setHasSearched(false);
    setError(null);
    setErrorCode(null);
    setComparedResults([]);
    setAgentLogs([]);
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'score') return b.matchScore - a.matchScore;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'date') return (b.datePublished || '').localeCompare(a.datePublished || '');
    return 0;
  });

  // Current scout context for Copilot Chatbot
  const chatContext: ChatContext = {
    query,
    category,
    resultsCount: results.length,
    topResults: results.slice(0, 5).map((r) => ({
      title: r.title,
      matchScore: r.matchScore,
      sourceDomain: r.sourceDomain,
      sourceUrl: r.sourceUrl,
      summary: r.summary,
      pros: r.pros,
      cons: r.cons,
      verificationNeeded: r.verificationNeeded,
    })),
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] dark:bg-[#0B0B0D] light:bg-[#F5F5F7] text-[#E5E2E1] dark:text-[#E5E2E1] light:text-[#111113] font-sans flex flex-col justify-between selection:bg-[#FF3434] selection:text-white transition-colors duration-200 relative">
      {/* Subtle Futuristic Red Ambient Glow & Grid Background */}
      <div className="absolute top-0 inset-x-0 h-[520px] ambient-glow pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[520px] radar-grid pointer-events-none" />

      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenApiKeyModal={() => setShowApiKeyModal(true)}
        onOpenHistory={() => setShowHistoryDrawer(true)}
        onOpenChat={() => setShowChatDrawer(true)}
        onOpenVoice={() => setShowVoiceModal(true)}
        historyCount={historyItems.length}
        configStatus={configStatus}
      />

      {/* Main Content Workspace */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-2 pb-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141416] dark:bg-[#141416] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 text-xs font-mono text-zinc-300 dark:text-zinc-300 light:text-zinc-700 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#FF3434] animate-pulse" />
            <span className="uppercase tracking-wider text-[11px] font-semibold">Autonomous Intelligence Agent for Deals, Jobs, & Grants</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white dark:text-white light:text-zinc-950 leading-tight">
            Scout verified opportunities with{' '}
            <span className="text-[#FF3434]">evidence-backed</span> precision.
          </h1>
        </div>

        {/* Search Console */}
        <SearchConsole
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          filters={filters}
          onFiltersChange={setFilters}
          onScout={() => executeScout()}
          isLoading={isLoading}
        />

        {/* Real-Time Granular Agent Execution Pipeline Visualizer */}
        {(isLoading || (hasSearched && pipelineSteps.some((s) => s.status !== 'idle'))) && (
          <PipelineVisualizer
            steps={pipelineSteps}
            currentStage={currentStage}
            overallProgress={overallProgress}
            currentQueries={generatedQueries}
            rawCount={rawCount}
            deduplicatedCount={deduplicatedCount}
            logs={agentLogs}
            isStreaming={isLoading}
            error={error || undefined}
          />
        )}

        {/* Missing SerpApi Key Notice if search failed due to configuration */}
        {errorCode === 'MISSING_SERPAPI_KEY' && (
          <div className="max-w-4xl mx-auto p-6 rounded-xl bg-[#141416] dark:bg-[#141416] light:bg-white border border-red-500/40 shadow-2xl text-left space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 text-[#FF3434]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white dark:text-white light:text-zinc-950">
                  SERPAPI_API_KEY Required for Web Scouting
                </h3>
                <p className="text-xs sm:text-sm text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600 mt-1 leading-relaxed">
                  DealScout AI requires SerpApi to perform live Google searches across jobs, deals, hackathons, and research grants without fabricating listings.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#101012] dark:bg-[#101012] light:bg-zinc-50 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 text-xs font-mono space-y-2">
              <div className="text-[#71717A] dark:text-[#71717A] light:text-zinc-500 font-semibold uppercase tracking-wider">
                Quick Setup Steps:
              </div>
              <p className="text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                1. Get a free key at <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-[#FF3434] underline font-bold">serpapi.com</a> (100 free searches/mo).<br />
                2. In Google AI Studio, open <span className="font-bold text-white dark:text-white light:text-zinc-950">Settings &gt; Secrets</span> in the top-right header.<br />
                3. Add secret <code className="text-[#FF3434] font-bold">SERPAPI_API_KEY</code> with your key.<br />
                4. Click "Retry Scout" below!
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => executeScout()}
                className="px-4 py-2 rounded-lg bg-[#FF3434] hover:bg-[#FF4D4D] text-white text-xs font-semibold shadow-md transition-all"
              >
                Retry Scout
              </button>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="px-4 py-2 rounded-lg bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 hover:bg-[#25252A] dark:hover:bg-[#25252A] light:hover:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-xs font-mono border border-[#29292D] dark:border-[#29292D] light:border-zinc-200"
              >
                View Detailed Guide
              </button>
            </div>
          </div>
        )}

        {/* SerpApi Email Verification Notice */}
        {errorCode === 'SERPAPI_EMAIL_VERIFICATION_REQUIRED' && (
          <div className="max-w-4xl mx-auto p-6 rounded-xl bg-[#141416] dark:bg-[#141416] light:bg-white border border-amber-500/50 shadow-2xl text-left space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white dark:text-white light:text-zinc-950">
                  SerpApi Account Requires Email Verification
                </h3>
                <p className="text-xs sm:text-sm text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600 mt-1 leading-relaxed">
                  Your SerpApi key is connected, but SerpApi has flagged that your account email needs to be verified before searches can be processed.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#101012] dark:bg-[#101012] light:bg-zinc-50 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 text-xs font-mono space-y-2">
              <div className="text-amber-400 dark:text-amber-400 light:text-amber-600 font-semibold uppercase tracking-wider">
                Action Required:
              </div>
              <p className="text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                Please check the email inbox you registered with at SerpApi for their confirmation email, or visit{' '}
                <a
                  href="https://serpapi.com/users/welcome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 dark:text-amber-400 light:text-amber-600 underline font-bold inline-flex items-center gap-1"
                >
                  serpapi.com/users/welcome <ExternalLink className="w-3 h-3" />
                </a>{' '}
                to complete verification.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://serpapi.com/users/welcome"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <span>Verify Email on SerpApi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => executeScout()}
                className="px-4 py-2 rounded-lg bg-[#FF3434] hover:bg-[#FF4D4D] text-white text-xs font-semibold shadow-md transition-all"
              >
                I've Verified — Retry Scout
              </button>
            </div>
          </div>
        )}

        {/* Gemini High Demand Temporary Notice */}
        {errorCode === 'GEMINI_HIGH_DEMAND' && (
          <div className="max-w-4xl mx-auto p-6 rounded-xl bg-[#141416] dark:bg-[#141416] light:bg-white border border-[#FF3434]/40 shadow-2xl text-left space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF3434]/10 border border-[#FF3434]/30 flex items-center justify-center shrink-0 text-[#FF3434]">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white dark:text-white light:text-zinc-950">
                  Temporary Gemini High-Demand Spike (503)
                </h3>
                <p className="text-xs sm:text-sm text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600 mt-1 leading-relaxed">
                  Google's Gemini servers experienced a temporary capacity surge. Spikes in demand are usually short-lived and clear up within a few moments.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => executeScout()}
                className="px-4 py-2 rounded-lg bg-[#FF3434] hover:bg-[#FF4D4D] text-white text-xs font-semibold shadow-md transition-all"
              >
                Retry Scout Now
              </button>
            </div>
          </div>
        )}

        {/* Results Area */}
        {hasSearched && !isLoading && results.length > 0 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            {/* Results Header Toolbar */}
            <div className="rounded-xl bg-[#141416] dark:bg-[#141416] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF3434] font-semibold">
                    Scout Intelligence Report
                  </span>
                  <span className="text-xs font-mono text-[#71717A]">•</span>
                  <span className="text-xs font-mono text-emerald-400 dark:text-emerald-400 light:text-emerald-700 font-semibold">
                    {results.length} Verified Listings
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-white dark:text-white light:text-zinc-950">
                  {activePlan?.intentSummary || `Results for "${query}"`}
                </h2>
              </div>

              {/* Sort & Compare Toolbar Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowChatDrawer(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 hover:bg-[#25252A] dark:hover:bg-[#25252A] light:hover:bg-zinc-200 text-zinc-300 hover:text-white dark:text-zinc-300 dark:hover:text-white light:text-zinc-700 light:hover:text-zinc-900 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#FF3434]" />
                  <span>Ask Copilot</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs font-mono bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 px-3 py-1.5 rounded-lg border border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
                  <span className="text-[#71717A] dark:text-[#71717A] light:text-zinc-500">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-white dark:text-white light:text-zinc-900 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="score" className="bg-[#141416] text-white">Highest Match Score</option>
                    <option value="date" className="bg-[#141416] text-white">Most Recent Date</option>
                    <option value="title" className="bg-[#141416] text-white">Alphabetical Title</option>
                  </select>
                </div>

                {comparedResults.length > 0 && (
                  <button
                    onClick={() => setShowComparisonModal(true)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FF3434] text-white shadow-[0_0_15px_rgba(255,52,52,0.35)] animate-pulse"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Compare ({comparedResults.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedResults.map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  isCompared={comparedResults.some((c) => c.id === result.id)}
                  onToggleCompare={handleToggleCompare}
                  highlightedQuery={query}
                />
              ))}
            </div>

            {/* In-Line Refine Bar */}
            <RefineBar
              onRefine={handleRefine}
              onReset={handleReset}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Empty State */}
        {hasSearched && !isLoading && results.length === 0 && !error && (
          <div className="max-w-2xl mx-auto text-center py-16 px-4 space-y-4 rounded-xl bg-[#141416] dark:bg-[#141416] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <Sparkles className="w-6 h-6 text-[#FF3434]" />
            </div>
            <h3 className="text-lg font-semibold text-white dark:text-white light:text-zinc-950">No Matching Opportunities Found</h3>
            <p className="text-xs sm:text-sm text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600 max-w-md mx-auto leading-relaxed">
              SerpApi search returned 0 matching listings for your specific query constraints. Try broadening your keywords or removing strict location filters.
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-[#FF3434] hover:text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-[#FF3434] dark:hover:text-white light:bg-zinc-900 light:text-white light:hover:bg-[#FF3434] transition-colors"
            >
              Start Fresh Scout
            </button>
          </div>
        )}
      </main>

      {/* Floating Bottom Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5">
        <button
          onClick={() => setShowChatDrawer(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FF3434] hover:bg-[#FF4D4D] text-white shadow-[0_0_20px_rgba(255,52,52,0.4)] text-xs font-semibold transition-all transform hover:scale-105"
          title="Open DealScout AI Copilot"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask Copilot</span>
        </button>

        <button
          onClick={() => setShowVoiceModal(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#18181C] dark:bg-[#18181C] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 hover:border-[#FF3434] text-white dark:text-white light:text-zinc-900 shadow-2xl text-xs font-mono transition-all transform hover:scale-105"
          title="Start Live Voice Conversation"
        >
          <Mic className="w-4 h-4 text-[#FF3434]" />
          <span className="hidden sm:inline">Voice Agent</span>
        </button>
      </div>

      {/* Comparison limit notice toast */}
      {compareNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-900 border border-[#FF3434] text-white px-4 py-2.5 rounded-xl text-xs font-mono shadow-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF3434] shrink-0" />
          <span>{compareNotice}</span>
        </div>
      )}

      {/* Floating Bottom Comparison Bar (when items are selected) */}
      {comparedResults.length > 0 && !showComparisonModal && (
        <div className="fixed bottom-6 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-4 px-5 py-3 rounded-full bg-[#141416]/95 dark:bg-[#141416]/95 light:bg-white/95 backdrop-blur-md border border-[#FF3434]/40 shadow-2xl">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#FF3434]" />
              <span className="text-xs font-mono font-semibold text-white dark:text-white light:text-zinc-950">
                {comparedResults.length} selected for comparison
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowComparisonModal(true)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FF3434] text-white hover:bg-[#FF4D4D] transition-all"
              >
                Open Side-by-Side View
              </button>
              <button
                onClick={() => setComparedResults([])}
                className="text-xs text-[#A1A1AA] hover:text-white dark:text-[#A1A1AA] dark:hover:text-white light:text-zinc-500 light:hover:text-zinc-900 font-mono"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      {showComparisonModal && (
        <ComparisonModal
          results={comparedResults}
          onClose={() => setShowComparisonModal(false)}
          onRemoveItem={(id) => setComparedResults((prev) => prev.filter((r) => r.id !== id))}
        />
      )}

      <HistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        items={historyItems}
        onSelect={(item) => {
          setQuery(item.query);
          setCategory(item.category);
          executeScout(item.query);
        }}
        onClear={() => {
          setHistoryItems([]);
          localStorage.removeItem('dealscout_history');
        }}
      />

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        configStatus={configStatus}
      />

      <ChatbotDrawer
        isOpen={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
        scoutContext={chatContext}
        onRunScoutQuery={(q, cat) => {
          setQuery(q);
          if (cat) setCategory(cat);
          setShowChatDrawer(false);
          executeScout(q);
        }}
      />

      <VoiceModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onExecuteScout={(q) => {
          setQuery(q);
          executeScout(q);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200 py-8 pb-14 bg-[#0B0B0D] dark:bg-[#0B0B0D] light:bg-white transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-mono text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
          <a
            href="http://www.linkedin.com/in/aakash6569"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Made by Aakash - Connect on LinkedIn"
            className="inline-flex items-center gap-2 hover:text-white dark:hover:text-white light:hover:text-zinc-950 transition-colors group"
          >
            {/* LinkedIn App Icon */}
            <svg
              className="w-4 h-4 text-[#0A66C2] group-hover:brightness-110 transition-transform group-hover:scale-110 shrink-0 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.3a1.63 1.63 0 1 0 1.63 1.63A1.63 1.63 0 0 0 7.86 6.3Z" />
            </svg>
            <span className="text-zinc-400 dark:text-zinc-400 light:text-zinc-500 font-sans text-xs">
              Made by <span className="text-zinc-200 dark:text-zinc-200 light:text-zinc-800 font-medium group-hover:text-[#FF3434] transition-colors">Aakash</span>
            </span>
          </a>
        </div>
      </footer>
    </div>
  );
}
