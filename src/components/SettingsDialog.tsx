import React, { useState } from 'react';
import {
  Key,
  Palette,
  Brain,
  Gauge,
  Database,
  AlertCircle,
  CheckCircle,
  Info,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Toggle, RadioGroup } from './ui/Toggle';
import { Badge } from './ui/Badge';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks';
import { validateGeminiKey, getAvailableModels } from '@/services/gemini';
import { validateApiKey as validateBundestagKey } from '@/services/bundestag';
import type { Theme, GeminiModel } from '@/types';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'api' | 'ai' | 'appearance' | 'advanced';

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('api');
  const [isValidatingGemini, setIsValidatingGemini] = useState(false);
  const [isValidatingBundestag, setIsValidatingBundestag] = useState(false);
  const [geminiValid, setGeminiValid] = useState<boolean | null>(null);
  const [bundestagValid, setBundestagValid] = useState<boolean | null>(null);

  const apiKeys = useStore((state) => state.apiKeys);
  const setApiKeys = useStore((state) => state.setApiKeys);
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const clearAnalysisCache = useStore((state) => state.clearAnalysisCache);
  const analysisCache = useStore((state) => state.analysisCache);
  const { setTheme } = useTheme();

  const cacheSize = Object.keys(analysisCache).length;
  const geminiModels = getAvailableModels();

  const handleValidateGemini = async () => {
    if (!apiKeys.geminiKey) return;
    setIsValidatingGemini(true);
    setGeminiValid(null);
    try {
      const valid = await validateGeminiKey(apiKeys.geminiKey);
      setGeminiValid(valid);
    } catch {
      setGeminiValid(false);
    } finally {
      setIsValidatingGemini(false);
    }
  };

  const handleValidateBundestag = async () => {
    if (!apiKeys.bundestagKey) return;
    setIsValidatingBundestag(true);
    setBundestagValid(null);
    try {
      const valid = await validateBundestagKey(apiKeys.bundestagKey);
      setBundestagValid(valid);
    } catch {
      setBundestagValid(false);
    } finally {
      setIsValidatingBundestag(false);
    }
  };

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    { id: 'api', label: 'API-Keys', icon: <Key className="w-4 h-4" /> },
    { id: 'ai', label: 'KI-Modell', icon: <Brain className="w-4 h-4" /> },
    { id: 'appearance', label: 'Darstellung', icon: <Palette className="w-4 h-4" /> },
    { id: 'advanced', label: 'Erweitert', icon: <Gauge className="w-4 h-4" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Einstellungen"
      description="Konfigurieren Sie die Anwendung nach Ihren Wünschen"
      size="lg"
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 -mx-6 px-6 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? 'bg-bundestag-100 text-bundestag-700 dark:bg-bundestag-900/30 dark:text-bundestag-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-bundestag-600 hover:underline flex items-center gap-1"
              >
                Key erstellen
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="AIza..."
                value={apiKeys.geminiKey}
                onChange={(e) => {
                  setApiKeys({ geminiKey: e.target.value });
                  setGeminiValid(null);
                }}
                className="font-mono text-sm"
              />
              <Button
                variant="secondary"
                onClick={handleValidateGemini}
                disabled={!apiKeys.geminiKey || isValidatingGemini}
                isLoading={isValidatingGemini}
              >
                Prüfen
              </Button>
            </div>
            {geminiValid !== null && (
              <div
                className={`flex items-center gap-2 mt-2 text-sm ${
                  geminiValid ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {geminiValid ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    API-Key ist gültig
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    API-Key ist ungültig
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Erforderlich für KI-Analysen und den Investigator-Modus.
            </p>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Bundestag DIP API Key
              </label>
              <Badge variant="success" size="sm">
                Öffentlicher Key voreingestellt
              </Badge>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={apiKeys.bundestagKey}
                onChange={(e) => {
                  setApiKeys({ bundestagKey: e.target.value });
                  setBundestagValid(null);
                }}
                className="font-mono text-sm"
              />
              <Button
                variant="secondary"
                onClick={handleValidateBundestag}
                disabled={!apiKeys.bundestagKey || isValidatingBundestag}
                isLoading={isValidatingBundestag}
              >
                Prüfen
              </Button>
            </div>
            {bundestagValid !== null && (
              <div
                className={`flex items-center gap-2 mt-2 text-sm ${
                  bundestagValid ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {bundestagValid ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    API-Key ist gültig
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    API-Key ist ungültig
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Der öffentliche Key ist bis 05/2026 gültig. Für höhere Limits können Sie einen
              persönlichen Key beantragen.
            </p>
          </div>
        </div>
      )}

      {/* AI Model Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <RadioGroup<GeminiModel>
            label="Gemini Modell"
            value={settings.geminiModel}
            onChange={(value) => updateSettings({ geminiModel: value })}
            options={geminiModels.map((model) => ({
              value: model.id as GeminiModel,
              label: model.name,
              description: model.description,
            }))}
          />

          <hr className="border-slate-200 dark:border-slate-700" />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Thinking Budget: {settings.thinkingBudget.toLocaleString()} Tokens
            </label>
            <input
              type="range"
              min={1024}
              max={16384}
              step={1024}
              value={settings.thinkingBudget}
              onChange={(e) => updateSettings({ thinkingBudget: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1K (schnell)</span>
              <span>16K (gründlich)</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Höheres Budget ermöglicht tiefere Analysen, verbraucht aber mehr Tokens.
            </p>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          <Toggle
            checked={settings.showThoughts}
            onChange={(checked) => updateSettings({ showThoughts: checked })}
            label="Gedankenprozess anzeigen"
            description="Zeigt die internen Überlegungen des KI-Modells an (wenn verfügbar)."
          />
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <RadioGroup<Theme>
            label="Farbschema"
            value={settings.theme}
            onChange={(value) => setTheme(value)}
            options={[
              {
                value: 'light',
                label: 'Hell',
                description: 'Helles Design für den Tag',
              },
              {
                value: 'dark',
                label: 'Dunkel',
                description: 'Dunkles Design für die Nacht',
              },
              {
                value: 'system',
                label: 'System',
                description: 'Automatisch basierend auf Systemeinstellung',
              },
            ]}
          />

          <hr className="border-slate-200 dark:border-slate-700" />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Schriftgröße
            </label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSettings({ fontSize: size })}
                  className={`
                    flex-1 px-4 py-3 rounded-lg border transition-colors
                    ${
                      settings.fontSize === size
                        ? 'border-bundestag-500 bg-bundestag-50 dark:bg-bundestag-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }
                  `}
                >
                  <span
                    className={`block font-medium ${
                      size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : ''
                    }`}
                  >
                    {size === 'small' ? 'Klein' : size === 'medium' ? 'Normal' : 'Groß'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          <Toggle
            checked={settings.compactMode}
            onChange={(checked) => updateSettings({ compactMode: checked })}
            label="Kompaktmodus"
            description="Reduziert Abstände für mehr Inhalt auf dem Bildschirm."
          />
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Analyse-Cache
                </span>
              </div>
              <Badge variant={cacheSize > 0 ? 'info' : 'default'}>
                {cacheSize} Einträge
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Gespeicherte Analysen werden beim nächsten Aufruf wiederverwendet.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAnalysisCache}
              leftIcon={<Trash2 className="w-4 h-4" />}
              disabled={cacheSize === 0}
            >
              Cache leeren
            </Button>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          <Toggle
            checked={settings.cacheEnabled}
            onChange={(checked) => updateSettings({ cacheEnabled: checked })}
            label="Caching aktivieren"
            description="Analysen werden lokal gespeichert, um Tokens zu sparen."
          />

          <hr className="border-slate-200 dark:border-slate-700" />

          <Toggle
            checked={settings.autoSummarize}
            onChange={(checked) => updateSettings({ autoSummarize: checked })}
            label="Auto-Zusammenfassung"
            description="Erstellt automatisch eine Zusammenfassung beim Auswählen eines Protokolls."
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 -mx-6 px-6">
        <Button variant="secondary" onClick={onClose}>
          Schließen
        </Button>
        <Button variant="primary" onClick={onClose}>
          Speichern
        </Button>
      </div>
    </Modal>
  );
};
