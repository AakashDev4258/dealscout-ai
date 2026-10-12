import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Radio, Sparkles, ArrowRight } from 'lucide-react';
import type { ScoutCategory } from '../types/scout';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteScout: (query: string, category?: ScoutCategory) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onExecuteScout,
}) => {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [statusText, setStatusText] = useState('Click Start Voice to talk with Gemini Live');
  const [transcript, setTranscript] = useState('');
  const [geminiReply, setGeminiReply] = useState('');
  const [detectedScoutQuery, setDetectedScoutQuery] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Speech Recognition for instant voice queries
  useEffect(() => {
    if (!isOpen) {
      handleStop();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = async (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalPhrase = event.results[i][0].transcript.trim();
            setTranscript(finalPhrase);
            setStatusText('Gemini Live is processing voice input...');
            await processVoiceQuery(finalPhrase);
          } else {
            currentTranscript += event.results[i][0].transcript;
            setTranscript(currentTranscript);
          }
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Voice recognition error:', e);
        setStatusText('Microphone inactive. Click to retry.');
        setIsLiveActive(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isOpen]);

  const processVoiceQuery = async (userText: string) => {
    try {
      setStatusText('Gemini Live answering...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `The user spoke: "${userText}". Provide a friendly 1-2 sentence spoken response. If the user is asking to search or scout for something, specify the scout query in this exact format: [SCOUT_QUERY: <search query>] at the end.`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error('Voice query failed');
      const data = await response.json();
      let replyText = data.reply || 'Understood.';

      // Check if a scout command was detected
      const match = replyText.match(/\[SCOUT_QUERY:\s*(.+?)\]/);
      if (match) {
        setDetectedScoutQuery(match[1]);
        replyText = replyText.replace(/\[SCOUT_QUERY:\s*(.+?)\]/, '').trim();
      }

      setGeminiReply(replyText);

      // Play vocal response using Gemini TTS
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText }),
      });

      if (ttsRes.ok) {
        const ttsData = await ttsRes.json();
        if (ttsData.audio) {
          if (currentAudioRef.current) currentAudioRef.current.pause();
          const audio = new Audio(`data:audio/wav;base64,${ttsData.audio}`);
          currentAudioRef.current = audio;
          audio.play().catch((playErr) => {
            console.warn('Audio playback error:', playErr);
          });
        }
      }

      setStatusText('Listening for your next voice command...');
    } catch (err) {
      console.warn('Voice processing error:', err);
      setStatusText('Listening...');
    }
  };

  const handleStart = () => {
    if (!recognitionRef.current) {
      setStatusText('Speech recognition is not supported in this browser environment.');
      return;
    }
    try {
      recognitionRef.current.start();
      setIsLiveActive(true);
      setStatusText('Listening... Speak now!');
    } catch (e) {
      console.warn('Start voice error:', e);
    }
  };

  const handleStop = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setIsLiveActive(false);
    setStatusText('Voice mode paused.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#101012] dark:bg-[#101012] light:bg-white border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF3434] animate-pulse" />
            <h3 className="text-base font-semibold text-white dark:text-white light:text-zinc-950">
              Gemini Live Voice Agent
            </h3>
          </div>
          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="p-1 rounded-lg text-[#71717A] hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Audio Waveform Visualizer */}
        <div className="py-6 flex flex-col items-center justify-center space-y-6">
          <div className="relative flex items-center justify-center">
            {isLiveActive && (
              <>
                <div className="absolute w-36 h-36 rounded-full bg-[#FF3434]/20 animate-ping" />
                <div className="absolute w-28 h-28 rounded-full bg-[#FF3434]/30 animate-pulse" />
              </>
            )}
            <button
              onClick={isLiveActive ? handleStop : handleStart}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                isLiveActive
                  ? 'bg-[#FF3434] text-white shadow-[0_0_35px_rgba(255,52,52,0.6)]'
                  : 'bg-[#18181C] dark:bg-[#18181C] light:bg-zinc-100 text-[#A1A1AA] hover:text-white dark:hover:text-white light:text-zinc-600 light:hover:text-zinc-950 border border-[#29292D] dark:border-[#29292D] light:border-zinc-300 hover:border-[#FF3434]'
              }`}
            >
              {isLiveActive ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-white dark:text-white light:text-zinc-950 font-semibold block">
              {statusText}
            </span>
            <p className="text-[11px] text-[#71717A] dark:text-[#71717A] light:text-zinc-500 font-mono">
              {isLiveActive ? 'Live microphone active • Speak naturally' : 'Tap the microphone to start talking'}
            </p>
          </div>
        </div>

        {/* Real-time Transcription Stream */}
        <div className="bg-[#141416] dark:bg-[#141416] light:bg-zinc-50 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 rounded-xl p-4 text-left space-y-3 min-h-[100px]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] dark:text-[#71717A] light:text-zinc-500 block font-semibold">
              You Spoke:
            </span>
            <p className="text-xs sm:text-sm text-white dark:text-white light:text-zinc-950 font-medium italic mt-0.5">
              {transcript ? `"${transcript}"` : 'Awaiting voice input...'}
            </p>
          </div>

          {geminiReply && (
            <div className="pt-2 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF3434] flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" />
                Gemini Spoke:
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mt-0.5 leading-relaxed">
                {geminiReply}
              </p>
            </div>
          )}
        </div>

        {/* Scout Action Trigger if user asked to search */}
        {detectedScoutQuery && (
          <div className="p-3.5 rounded-xl bg-[#18181C] dark:bg-[#18181C] light:bg-zinc-100 border border-[#FF3434]/40 flex items-center justify-between gap-3 text-left">
            <div>
              <span className="text-[10px] font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500 block">
                Detected Scout Query:
              </span>
              <span className="text-xs font-semibold text-white dark:text-white light:text-zinc-950 truncate block">
                "{detectedScoutQuery}"
              </span>
            </div>
            <button
              onClick={() => {
                handleStop();
                onClose();
                onExecuteScout(detectedScoutQuery);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FF3434] text-white hover:bg-[#FF4D4D] shrink-0 shadow-sm"
            >
              <span>Execute Scout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200 flex items-center justify-between text-[11px] font-mono text-[#71717A] dark:text-[#71717A] light:text-zinc-500">
          <span>Real-Time Voice Audio</span>
          <span>Web Audio API Active</span>
        </div>
      </div>
    </div>
  );
};
