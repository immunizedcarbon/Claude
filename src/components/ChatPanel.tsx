import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  MessageSquare,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Trash2,
  User,
  Bot,
} from 'lucide-react';
import { Spinner } from './ui/Spinner';
import { useStore } from '@/store/useStore';
import { useAnalysis } from '@/hooks';
import type { PlenarprotokollText } from '@/types';

interface ChatPanelProps {
  protocol: PlenarprotokollText;
}

const SUGGESTED_QUESTIONS = [
  'Welche Anträge wurden angenommen?',
  'Fasse die Kritik der Opposition zusammen',
  'Welche Themen wurden am häufigsten diskutiert?',
  'Gab es kontroverse Abstimmungen?',
];

export const ChatPanel: React.FC<ChatPanelProps> = () => {
  const [input, setInput] = useState('');
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const settings = useStore((state) => state.settings);
  const { chatMessages, isChatting, hasGeminiKey, sendMessage, resetChat } = useAnalysis();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatting) return;
    sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const toggleThoughts = (messageId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-white dark:bg-slate-800">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-900/30">
        {!hasGeminiKey && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mx-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  API-Key erforderlich
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Bitte hinterlegen Sie einen Gemini API-Key in den Einstellungen.
                </p>
              </div>
            </div>
          </div>
        )}

        {chatMessages.length === 0 && hasGeminiKey && (
          <div className="text-center mt-10 space-y-4">
            <div className="w-12 h-12 bg-bundestag-100 dark:bg-bundestag-900/50 rounded-full flex items-center justify-center mx-auto text-bundestag-600 dark:text-bundestag-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white">
              Stellen Sie Fragen an das Protokoll
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Der Investigator lädt das <strong>gesamte Dokument</strong> in den Kontext. Dies
              ermöglicht präzise Detailfragen.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestionClick(q)}
                  className="text-xs px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full hover:border-bundestag-400 dark:hover:border-bundestag-500 hover:text-bundestag-600 dark:hover:text-bundestag-400 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] rounded-2xl p-4 shadow-sm
                ${
                  msg.role === 'user'
                    ? 'bg-bundestag-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-bl-none'
                }
              `}
            >
              {/* Role indicator */}
              <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
                {msg.role === 'user' ? (
                  <>
                    <User className="w-3 h-3" />
                    Sie
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3" />
                    BundestagAI
                  </>
                )}
              </div>

              {/* Thoughts Section */}
              {msg.thoughts && settings.showThoughts && (
                <div className="mb-2 pb-2 border-b border-slate-100/20 dark:border-slate-500/30">
                  <button
                    onClick={() => toggleThoughts(msg.id)}
                    className="text-xs opacity-70 flex items-center gap-1 hover:opacity-100 transition-opacity"
                  >
                    <BrainCircuit className="w-3 h-3" />
                    {expandedThoughts[msg.id] ? 'Gedanken verbergen' : 'Gedanken anzeigen'}
                    {expandedThoughts[msg.id] ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                  {expandedThoughts[msg.id] && (
                    <div className="mt-2 text-xs font-mono opacity-90 bg-black/5 dark:bg-black/20 p-2 rounded max-h-60 overflow-y-auto whitespace-pre-wrap">
                      {msg.thoughts}
                    </div>
                  )}
                </div>
              )}

              {/* Message Content */}
              {msg.isStreaming ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-sm opacity-70 animate-pulse">Denkt nach...</span>
                </div>
              ) : (
                <div
                  className={`prose prose-sm max-w-none ${
                    msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isChatting && chatMessages[chatMessages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
              <Spinner size="sm" className="text-bundestag-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                Liest das Dokument und analysiert...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {chatMessages.length > 0 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={resetChat}
              className="text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Chat zurücksetzen
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasGeminiKey ? 'Nachricht an BundestagAI...' : 'API-Key erforderlich...'}
            disabled={!hasGeminiKey || isChatting}
            className="
              flex-1 py-3 pl-4 pr-12 bg-slate-50 dark:bg-slate-700
              border border-slate-200 dark:border-slate-600 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-bundestag-500/20
              focus:border-bundestag-500 dark:focus:border-bundestag-400
              transition-all text-sm placeholder-slate-400 dark:placeholder-slate-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
          <button
            type="submit"
            disabled={!input.trim() || !hasGeminiKey || isChatting}
            className="
              absolute right-2 p-2 bg-bundestag-600 text-white rounded-lg
              hover:bg-bundestag-700 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all focus:outline-none focus:ring-2 focus:ring-bundestag-500
            "
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
          Drücken Sie Enter zum Senden • KI-generierte Antworten können Fehler enthalten
        </p>
      </div>
    </div>
  );
};
