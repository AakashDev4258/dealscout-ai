import React, { useEffect, useState, useRef } from 'react';
import {
  Brain,
  Globe,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Terminal,
  ChevronDown,
  ChevronUp,
  Clock,
  Search,
} from 'lucide-react';
import type { PipelineStep, AgentLogEntry, PipelineStageId } from '../types/scout';

interface PipelineVisualizerProps {
  steps: PipelineStep[];
  currentStage: PipelineStageId;
  overallProgress: number;
  currentQueries: string[];
  rawCount?: number;
  deduplicatedCount?: number;
  logs: AgentLogEntry[];
  isStreaming: boolean;
  error?: string;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  steps,
  currentStage,
  overallProgress,
  currentQueries,
  rawCount,
  deduplicatedCount,
  logs,
  isStreaming,
  error,
}) => {
  const [elapsed, setElapsed] = useState<number>(0);
  const [showLogs, setShowLogs] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStreaming) {
      const startTime = Date.now();
      timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 100) / 10);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isStreaming]);

  useEffect(() => {
    if (showLogs && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, showLogs]);

  const stageIcons: Record<string, React.FC<{ className?: string }>> = {
    understanding: Brain,
    searching: Globe,
    analyzing: ShieldCheck,
    recommendations: Sparkles,
    complete: CheckCircle2,
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl bg-[#141416] dark:bg-[#141416] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 p-5 sm:p-6 shadow-2xl transition-all space-y-5">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-[#FF3434] animate-ping absolute opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3434]" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-white dark:text-white light:text-zinc-950 font-bold block">
              Autonomous Agent Execution Telemetry
            </span>
            <span className="text-[11px] font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500">
              Current Stage: <span className="text-[#FF3434] font-semibold">{steps.find((s) => s.id === currentStage)?.label || 'Running Pipeline'}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {rawCount !== undefined && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
              {rawCount} raw results
            </span>
          )}
          {deduplicatedCount !== undefined && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/30">
              {deduplicatedCount} deduplicated
            </span>
          )}
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3 text-[#FF3434]" />
            {elapsed.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Granular Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600">Pipeline Progress</span>
          <span className="text-[#FF3434] font-bold">{overallProgress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#101012] dark:bg-[#101012] light:bg-zinc-100 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-[#FF3434]/80 to-[#FF3434] rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(255,52,52,0.4)]"
            style={{ width: `${Math.min(100, Math.max(5, overallProgress))}%` }}
          />
        </div>
      </div>

      {/* 4 Granular Stages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s, idx) => {
          const Icon = stageIcons[s.id] || Brain;
          const isCurrent = s.status === 'running';
          const isDone = s.status === 'completed';
          const isFailed = s.status === 'failed';

          return (
            <div
              key={s.id}
              className={`rounded-lg p-3.5 border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-[#18181C] dark:bg-[#18181C] light:bg-zinc-50 border-[#FF3434] shadow-[0_0_18px_rgba(255,52,52,0.18)]'
                  : isDone
                  ? 'bg-[#101012] dark:bg-[#101012] light:bg-zinc-50/80 border-[#29292D] dark:border-[#29292D] light:border-zinc-200'
                  : isFailed
                  ? 'bg-[#1A0F0F] dark:bg-[#1A0F0F] light:bg-red-50 border-red-500/50'
                  : 'bg-[#0E0E10] dark:bg-[#0E0E10] light:bg-zinc-50/40 opacity-50 border-[#29292D]/40 dark:border-[#29292D]/40 light:border-zinc-200/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#71717A] dark:text-[#71717A] light:text-zinc-400">
                      0{idx + 1}.
                    </span>
                    <Icon
                      className={`w-4 h-4 ${
                        isCurrent
                          ? 'text-[#FF3434] animate-pulse'
                          : isDone
                          ? 'text-emerald-400 dark:text-emerald-400 light:text-emerald-600'
                          : isFailed
                          ? 'text-red-500'
                          : 'text-[#71717A] dark:text-[#71717A] light:text-zinc-400'
                      }`}
                    />
                  </div>

                  <div>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#FF3434] font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Active
                      </span>
                    )}
                    {isDone && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </span>
                    )}
                    {isFailed && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-red-500 font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                    {!isCurrent && !isDone && !isFailed && (
                      <span className="text-[10px] font-mono text-[#71717A] dark:text-[#71717A] light:text-zinc-400">
                        Queued
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-white dark:text-white light:text-zinc-950 truncate">
                  {s.label}
                </h4>
                <p className="text-[11px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                  {s.description}
                </p>
              </div>

              {/* Sub-steps checklist */}
              {s.subSteps && s.subSteps.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200/80 space-y-1.5">
                  {s.subSteps.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between text-[10px] font-mono leading-tight"
                    >
                      <span
                        className={`truncate ${
                          sub.status === 'completed'
                            ? 'text-zinc-300 dark:text-zinc-300 light:text-zinc-700'
                            : sub.status === 'in_progress'
                            ? 'text-[#FF3434] font-semibold'
                            : 'text-[#71717A] dark:text-[#71717A] light:text-zinc-400'
                        }`}
                      >
                        {sub.title}
                      </span>
                      {sub.status === 'completed' ? (
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 shrink-0 ml-1" />
                      ) : sub.status === 'in_progress' ? (
                        <Loader2 className="w-2.5 h-2.5 text-[#FF3434] animate-spin shrink-0 ml-1" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#29292D] dark:bg-[#29292D] light:bg-zinc-300 shrink-0 ml-1" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Targeted Google Queries */}
      {currentQueries && currentQueries.length > 0 && (
        <div className="p-3.5 rounded-lg bg-[#101012] dark:bg-[#101012] light:bg-zinc-50 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600 font-semibold">
            <Search className="w-3.5 h-3.5 text-[#FF3434]" />
            <span>Targeted Google Queries Dispatched to SerpApi:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentQueries.map((q, idx) => (
              <span
                key={idx}
                className="text-xs font-mono px-2.5 py-1 rounded bg-[#18181C] dark:bg-[#18181C] light:bg-white text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200"
              >
                &ldquo;{q}&rdquo;
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Agent Thought & Network Log Terminal */}
      <div className="pt-2 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="w-full flex items-center justify-between text-xs font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600 hover:text-white dark:hover:text-white light:hover:text-zinc-950 py-1 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#FF3434]" />
            <span>Agent Telemetry & Decision Log ({logs.length} events)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#71717A] dark:text-[#71717A] light:text-zinc-400">
            <span>{showLogs ? 'Hide Console' : 'Expand Console'}</span>
            {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showLogs && (
          <div
            ref={logContainerRef}
            className="mt-3 p-3.5 rounded-lg bg-[#0B0B0D] dark:bg-[#0B0B0D] light:bg-zinc-900 border border-[#29292D] dark:border-[#29292D] light:border-zinc-800 font-mono text-xs max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin text-zinc-300"
          >
            {logs.length === 0 ? (
              <div className="text-[#71717A] italic">Awaiting telemetry events...</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#71717A] shrink-0">{log.timestamp}</span>
                  <span
                    className={`font-semibold shrink-0 uppercase text-[10px] px-1 py-0.5 rounded ${
                      log.type === 'error'
                        ? 'bg-red-500/20 text-red-400'
                        : log.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="text-zinc-300 break-words flex-1">{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* In-flight Error alert if any */}
      {error && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-mono flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#FF3434] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block">Agent Pipeline Notice:</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};
