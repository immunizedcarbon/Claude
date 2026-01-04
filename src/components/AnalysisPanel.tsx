import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  FileText,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Microscope,
  Zap,
  PlayCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { Button, IconButton } from './ui/Button';
import { StatusBadge } from './ui/Badge';
import { ChatPanel } from './ChatPanel';
import { useStore } from '@/store/useStore';
import { useAnalysis } from '@/hooks';
import type { PlenarprotokollText } from '@/types';

type Mode = 'overview' | 'investigator';

interface AnalysisPanelProps {
  protocol: PlenarprotokollText;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ protocol }) => {
  const [mode, setMode] = useState<Mode>('overview');
  const [showThoughts, setShowThoughts] = useState(false);
  const [copied, setCopied] = useState(false);

  const settings = useStore((state) => state.settings);
  const {
    currentAnalysis,
    isSummarizing,
    isAnalyzing,
    hasGeminiKey,
    generateSummary,
    generateAnalysis,
  } = useAnalysis();

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-bundestag-100 dark:bg-bundestag-900/50 p-2 rounded-lg text-bundestag-600 dark:text-bundestag-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Analyse-Zentrum</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Protokoll {protocol.dokumentnummer}
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-xl">
          <button
            onClick={() => setMode('overview')}
            className={`
              px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                mode === 'overview'
                  ? 'bg-white dark:bg-slate-600 text-bundestag-700 dark:text-bundestag-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }
            `}
          >
            Übersicht
          </button>
          <button
            onClick={() => setMode('investigator')}
            className={`
              px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1
              ${
                mode === 'investigator'
                  ? 'bg-white dark:bg-slate-600 text-bundestag-700 dark:text-bundestag-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }
            `}
          >
            <Microscope className="w-3.5 h-3.5" />
            Investigator
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-900/50">
        {mode === 'overview' && (
          <div className="absolute inset-0 overflow-y-auto p-6 space-y-6">
            {/* API Key Warning */}
            {!hasGeminiKey && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">
                      Gemini API-Key erforderlich
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Bitte hinterlegen Sie einen gültigen Gemini API-Key in den Einstellungen, um
                      KI-Analysen durchzuführen.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Executive Summary Section */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-bundestag-200 dark:hover:border-bundestag-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Executive Summary (Flash)
                </h3>
                {currentAnalysis?.summary && (
                  <StatusBadge status="completed" />
                )}
              </div>

              {currentAnalysis?.summary ? (
                <div className="space-y-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-slate prose-headings:font-semibold prose-a:text-bundestag-600">
                    <ReactMarkdown>{currentAnalysis.summary}</ReactMarkdown>
                  </div>
                  <div className="flex justify-end">
                    <IconButton
                      icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      label="Kopieren"
                      onClick={() => handleCopy(currentAnalysis.summary || '')}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/30">
                  <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center max-w-xs">
                    Erstellen Sie eine schnelle Zusammenfassung der Top-Themen und Beschlüsse.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={generateSummary}
                    disabled={!hasGeminiKey || isSummarizing}
                    isLoading={isSummarizing}
                    leftIcon={<PlayCircle className="w-4 h-4" />}
                  >
                    Zusammenfassung generieren
                  </Button>
                </div>
              )}
            </section>

            {/* Deep Analysis Section */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm ring-1 ring-bundestag-100 dark:ring-bundestag-900 transition-all hover:ring-bundestag-300 dark:hover:ring-bundestag-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-bundestag-600 dark:text-bundestag-400 uppercase tracking-wider flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" />
                  Tiefenanalyse ({settings.geminiModel})
                </h3>
                {currentAnalysis?.deepAnalysis && (
                  <StatusBadge status="completed" />
                )}
              </div>

              {currentAnalysis?.deepAnalysis ? (
                <div className="space-y-4">
                  {/* Thoughts Section */}
                  {currentAnalysis.deepAnalysis.thoughts && settings.showThoughts && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setShowThoughts(!showThoughts)}
                        className="w-full flex items-center justify-between p-3 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <BrainCircuit className="w-3.5 h-3.5" />
                          Gedankengang anzeigen
                        </span>
                        {showThoughts ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                      {showThoughts && (
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 whitespace-pre-wrap max-h-60 overflow-y-auto">
                          {currentAnalysis.deepAnalysis.thoughts}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-slate prose-headings:font-semibold prose-a:text-bundestag-600">
                    <ReactMarkdown>{currentAnalysis.deepAnalysis.text}</ReactMarkdown>
                  </div>
                  <div className="flex justify-end">
                    <IconButton
                      icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      label="Kopieren"
                      onClick={() => handleCopy(currentAnalysis.deepAnalysis?.text || '')}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-bundestag-100 dark:border-bundestag-800 rounded-lg bg-bundestag-50/30 dark:bg-bundestag-900/10">
                  <Sparkles className="w-12 h-12 text-bundestag-200 dark:text-bundestag-700 mb-3" />
                  <h4 className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Wissenschaftliche Diskursanalyse
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-sm">
                    Nutzen Sie die Thinking-Fähigkeiten von Gemini, um Rhetorik, Framing und
                    implizite Signale zu untersuchen.
                  </p>
                  <Button
                    variant="primary"
                    onClick={generateAnalysis}
                    disabled={!hasGeminiKey || isAnalyzing}
                    isLoading={isAnalyzing}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Analyse starten
                  </Button>
                </div>
              )}
            </section>

            {/* Document Info */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                Dokumentdetails
              </h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Dokumentnummer</dt>
                  <dd className="font-mono text-slate-900 dark:text-white">
                    {protocol.dokumentnummer}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Datum</dt>
                  <dd className="text-slate-900 dark:text-white">
                    {new Date(protocol.datum).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Wahlperiode</dt>
                  <dd className="text-slate-900 dark:text-white">
                    {protocol.wahlperiode}. Wahlperiode
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Herausgeber</dt>
                  <dd className="text-slate-900 dark:text-white">{protocol.herausgeber}</dd>
                </div>
              </dl>
              {protocol.fundstelle?.pdf_url && (
                <a
                  href={protocol.fundstelle.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Original-PDF öffnen
                </a>
              )}
            </section>
          </div>
        )}

        {mode === 'investigator' && <ChatPanel protocol={protocol} />}
      </div>
    </div>
  );
};
