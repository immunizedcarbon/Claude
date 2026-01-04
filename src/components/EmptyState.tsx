import React from 'react';
import { Database, ArrowLeft, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const EmptyState: React.FC = () => {
  const hasGeminiKey = useStore((state) => !!state.apiKeys.geminiKey);
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-100 dark:bg-slate-900">
      <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center mb-8 ring-8 ring-slate-200/50 dark:ring-slate-700/50">
        <Database className="w-12 h-12 text-bundestag-500 dark:text-bundestag-400" />
      </div>

      <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">
        Bundestag AI Analyst
      </h2>

      <p className="text-slate-500 dark:text-slate-400 max-w-lg text-lg mb-8">
        Wählen Sie links ein Plenarprotokoll aus, um die KI-gestützte Analyse durchzuführen.
      </p>

      {!hasGeminiKey && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 max-w-md">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            API-Key konfigurieren
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
            Um die KI-Analysefunktionen nutzen zu können, benötigen Sie einen Gemini API-Key.
          </p>
          <button
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
          >
            Einstellungen öffnen
          </button>
        </div>
      )}

      {hasGeminiKey && (
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          <ArrowLeft className="w-5 h-5 animate-pulse" />
          <span>Wählen Sie ein Protokoll aus der Liste</span>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl">
        <FeatureCard
          title="Executive Summary"
          description="Schnelle Zusammenfassung der wichtigsten Themen und Beschlüsse"
          icon="⚡"
        />
        <FeatureCard
          title="Tiefenanalyse"
          description="Wissenschaftliche Diskursanalyse mit KI-Unterstützung"
          icon="🔬"
        />
        <FeatureCard
          title="Investigator"
          description="Interaktive Fragen an das Protokoll stellen"
          icon="🔍"
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-left">
    <span className="text-2xl mb-3 block">{icon}</span>
    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
  </div>
);
