import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Loader2,
  Check,
  Copy,
} from 'lucide-react';
import type { ChatMessage, ChatContext, ScoutCategory } from '../types/scout';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scoutContext: ChatContext;
  onRunScoutQuery: (query: string, category?: ScoutCategory) => void;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  scoutContext,
  onRunScoutQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm your DealScout AI Copilot. I'm connected to your live scout session. Ask me to compare findings, analyze trade-offs, draft outreach emails, or suggest refined queries!",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Speech Recognition (STT) setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechNotice('Speech recognition is not supported in this browser. Please type your message.');
      setTimeout(() => setSpeechNotice(null), 3500);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          scoutContext,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Chat request failed');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "I didn't receive a response. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err.message || 'Unable to connect with DealScout Copilot.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayTts = async (msg: ChatMessage) => {
    if (playingAudioId === msg.id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(msg.id);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content.slice(0, 400) }),
      });

      if (!response.ok) throw new Error('TTS failed');
      const data = await response.json();

      if (data.audio) {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        currentAudioRef.current = audio;
        audio.onended = () => setPlayingAudioId(null);
        audio.onerror = () => setPlayingAudioId(null);
        audio.play();
      } else {
        setPlayingAudioId(null);
      }
    } catch (e) {
      console.warn('TTS playback error:', e);
      setPlayingAudioId(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    'Which listing has the highest match score and why?',
    'Compare top 2 opportunities side-by-side',
    'Draft a 3-sentence outreach email for #1',
    'What verification warnings should I double-check?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg h-full bg-[#101012] dark:bg-[#101012] light:bg-white border-l border-[#29292D] dark:border-[#29292D] light:border-zinc-200 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#29292D] dark:border-[#29292D] light:border-zinc-200 bg-[#141416] dark:bg-[#141416] light:bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1C1C20] dark:bg-[#1C1C20] light:bg-zinc-100 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 flex items-center justify-center text-[#FF3434]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-white dark:text-white light:text-zinc-950">
                  DealScout Copilot
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/20 font-semibold">
                  Context Aware
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500 truncate max-w-[240px]">
                {scoutContext.query ? `Session: "${scoutContext.query}"` : 'Autonomous Scout Copilot'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome',
                    role: 'assistant',
                    content: 'Conversation reset. How can I help you explore your opportunities?',
                    timestamp: Date.now(),
                  },
                ])
              }
              className="p-1.5 rounded-lg text-[#71717A] hover:text-white dark:hover:text-white light:hover:text-zinc-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71717A] hover:text-white dark:hover:text-white light:hover:text-zinc-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            const isAudioPlaying = playingAudioId === m.id;

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#18181C] dark:bg-[#18181C] light:bg-zinc-100 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 flex items-center justify-center text-[#FF3434] shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-[#FF3434] text-white shadow-md'
                      : 'bg-[#141416] dark:bg-[#141416] light:bg-zinc-100 text-zinc-200 dark:text-zinc-200 light:text-zinc-900 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {/* Actions for assistant messages */}
                  {!isUser && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200 text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-500 text-[11px] font-mono">
                      <button
                        onClick={() => handlePlayTts(m)}
                        className={`flex items-center gap-1 hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-colors ${
                          isAudioPlaying ? 'text-[#FF3434] font-bold' : ''
                        }`}
                        title="Listen to response (Gemini TTS)"
                      >
                        {isAudioPlaying ? (
                          <>
                            <VolumeX className="w-3 h-3 text-[#FF3434]" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Speak</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="flex items-center gap-1 hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-colors ml-2"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#222228] border border-[#33333A] flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-[#18181C] dark:bg-[#18181C] light:bg-zinc-100 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 flex items-center justify-center text-[#FF3434] shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="rounded-xl p-3 bg-[#141416] dark:bg-[#141416] light:bg-zinc-100 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 text-xs font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-zinc-600 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-[#FF3434] animate-spin" />
                <span>Gemini is analyzing scout context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-[#0E0E10] dark:bg-[#0E0E10] light:bg-zinc-50 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#141416] hover:bg-[#1C1C20] dark:bg-[#141416] dark:hover:bg-[#1C1C20] light:bg-white light:hover:bg-zinc-100 text-zinc-300 hover:text-white dark:text-zinc-300 dark:hover:text-white light:text-zinc-700 light:hover:text-zinc-900 whitespace-nowrap border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#29292D] dark:border-[#29292D] light:border-zinc-200 bg-[#141416] dark:bg-[#141416] light:bg-zinc-50 space-y-2">
          {speechNotice && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
              {speechNotice}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Input button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-lg border transition-all ${
                isListening
                  ? 'bg-[#FF3434] text-white border-[#FF3434] animate-pulse'
                  : 'bg-[#101012] dark:bg-[#101012] light:bg-white text-[#A1A1AA] hover:text-white dark:hover:text-white light:hover:text-zinc-900 border-[#29292D] dark:border-[#29292D] light:border-zinc-200'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Speak your question (Mic)'}
            >
              {isListening ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about current scout results..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-[#101012] dark:bg-[#101012] light:bg-white text-white dark:text-white light:text-zinc-950 placeholder-[#71717A] dark:placeholder-[#71717A] light:placeholder-zinc-400 border border-[#29292D] dark:border-[#29292D] light:border-zinc-200 focus:outline-none focus:border-[#FF3434]"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-lg bg-[#FF3434] hover:bg-[#FF4D4D] text-white disabled:opacity-40 transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
