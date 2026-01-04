// ============================================================================
// Application Constants
// ============================================================================

// API Endpoints
export const BUNDESTAG_API_BASE = 'https://search.dip.bundestag.de/api/v1';
export const CORS_PROXY_URL = 'https://corsproxy.io/?';

// Default API Key (public, valid until 05/2026)
export const DEFAULT_BUNDESTAG_KEY = 'OSOegLs.PR2lwJ1dwCeje9vTj7FPOt3hvpYKtwKkhw';

// Gemini Models Configuration
export const GEMINI_MODELS = {
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Schnellstes Modell, ideal für einfache Zusammenfassungen',
    maxTokens: 1048576,
    supportsThinking: false,
    costTier: 'low',
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Ausgewogene Balance zwischen Geschwindigkeit und Qualität',
    maxTokens: 1048576,
    supportsThinking: true,
    costTier: 'medium',
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Höchste Qualität für komplexe Analysen',
    maxTokens: 2097152,
    supportsThinking: true,
    costTier: 'high',
  },
} as const;

// Wahlperioden (Legislative Periods)
export const WAHLPERIODEN = [
  { value: 21, label: '21. Wahlperiode (2025-heute)', current: true },
  { value: 20, label: '20. Wahlperiode (2021-2025)', current: false },
  { value: 19, label: '19. Wahlperiode (2017-2021)', current: false },
  { value: 18, label: '18. Wahlperiode (2013-2017)', current: false },
  { value: 17, label: '17. Wahlperiode (2009-2013)', current: false },
  { value: 16, label: '16. Wahlperiode (2005-2009)', current: false },
] as const;

// Text limits for AI processing
export const TEXT_LIMITS = {
  SUMMARY_MAX_CHARS: 500000,      // ~125k tokens for Flash
  ANALYSIS_MAX_CHARS: 1500000,   // ~375k tokens for Pro
  CHAT_CONTEXT_CHARS: 1000000,   // ~250k tokens for chat
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  MAX_ITEMS: 50,
  TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
  STORAGE_KEY: 'bundestag-ai-cache',
} as const;

// UI Configuration
export const UI_CONFIG = {
  RESULTS_PER_PAGE: 20,
  DEBOUNCE_MS: 300,
  TOAST_DURATION_MS: 5000,
  ANIMATION_DURATION_MS: 200,
} as const;

// Default Settings
export const DEFAULT_SETTINGS = {
  theme: 'system' as const,
  language: 'de' as const,
  geminiModel: 'gemini-2.5-flash' as const,
  thinkingBudget: 4096,
  autoSummarize: false,
  showThoughts: true,
  compactMode: false,
  fontSize: 'medium' as const,
  notifications: true,
  cacheEnabled: true,
  maxCacheItems: 50,
};

// Fraktionen (Parliamentary Groups)
export const FRAKTIONEN = [
  { value: 'SPD', label: 'SPD', color: '#E3000F' },
  { value: 'CDU/CSU', label: 'CDU/CSU', color: '#000000' },
  { value: 'GRÜNE', label: 'Bündnis 90/Die Grünen', color: '#64A12D' },
  { value: 'FDP', label: 'FDP', color: '#FFED00' },
  { value: 'AfD', label: 'AfD', color: '#009EE0' },
  { value: 'DIE LINKE', label: 'Die Linke', color: '#BE3075' },
  { value: 'BSW', label: 'BSW', color: '#8B4513' },
  { value: 'fraktionslos', label: 'Fraktionslos', color: '#808080' },
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'Bitte geben Sie einen gültigen API-Key ein.',
  NETWORK_ERROR: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
  RATE_LIMIT: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
  INVALID_RESPONSE: 'Unerwartetes Antwortformat von der API.',
  NO_RESULTS: 'Keine Protokolle für diese Suchkriterien gefunden.',
  ANALYSIS_FAILED: 'Die Analyse konnte nicht durchgeführt werden.',
  GEMINI_KEY_REQUIRED: 'Ein Gemini API-Key ist erforderlich für diese Funktion.',
  TEXT_TOO_LONG: 'Der Text ist zu lang für die Verarbeitung.',
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEARCH: { key: '/', description: 'Suche fokussieren' },
  SETTINGS: { key: ',', modifier: 'ctrl', description: 'Einstellungen öffnen' },
  CLOSE: { key: 'Escape', description: 'Dialog schließen' },
  NEXT: { key: 'j', description: 'Nächstes Protokoll' },
  PREV: { key: 'k', description: 'Vorheriges Protokoll' },
  ANALYZE: { key: 'a', modifier: 'ctrl', description: 'Analyse starten' },
  THEME: { key: 't', modifier: 'ctrl', description: 'Theme wechseln' },
} as const;

// Analysis Prompts
export const PROMPTS = {
  SUMMARY: `Du bist ein spezialisierter Parlaments-Analyst. Erstelle eine prägnante Executive Summary des folgenden Plenarprotokolls.

Struktur deine Antwort wie folgt:
1. **Kernthemen**: Die 3-5 wichtigsten Debattenpunkte
2. **Beschlüsse**: Konkrete Gesetzesverabschiedungen oder Abstimmungsergebnisse
3. **Konfliktlinien**: Wesentliche Meinungsverschiedenheiten zwischen den Fraktionen
4. **Bemerkenswert**: Auffällige Momente oder Zitate

Halte die Zusammenfassung auf maximal 500 Wörter. Schreibe auf Deutsch.`,

  DEEP_ANALYSIS: `Führe eine wissenschaftliche Diskursanalyse dieses Bundestagsprotokolls durch.

Untersuchungsaspekte:
1. **Rhetorische Strategien**: Welche Argumentationsmuster nutzen die verschiedenen Fraktionen?
2. **Framing-Analyse**: Wie werden Schlüsselbegriffe von verschiedenen Seiten besetzt und kontextualisiert?
3. **Implizite Signale**: Was steht zwischen den Zeilen (Zwischenrufe, Beifall, Heiterkeit)?
4. **Machtdynamiken**: Welche Akteure dominieren die Debatte und warum?

Gehe methodisch vor und belege deine Thesen mit konkreten Beispielen aus dem Text.
Schreibe auf Deutsch und strukturiere deine Analyse klar.`,

  CHAT_SYSTEM: `Du bist ein forensischer Investigator für Bundestagsprotokolle.

Deine Aufgaben:
1. Du hast den VOLLSTÄNDIGEN Text des Protokolls im Kontext. Nutze ihn als primäre Quelle.
2. Beantworte Fragen präzise und zitiere relevante Passagen.
3. Wenn der Nutzer nach Hintergrundinformationen fragt, die nicht im Text stehen, weise darauf hin.
4. Bleibe objektiv und parteipolitisch neutral.
5. Strukturiere längere Antworten mit Markdown.

Antworte immer auf Deutsch.`,
} as const;
