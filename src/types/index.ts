// ============================================================================
// Bundestag API Types
// Based on the official DIP API specification
// ============================================================================

export interface Fundstelle {
  id: string;
  dokumentart: 'Drucksache' | 'Plenarprotokoll';
  dokumentnummer: string;
  datum: string;
  drucksachetyp?: string;
  herausgeber?: string;
  pdf_url?: string;
  xml_url?: string;
  seite?: string;
  anfangsseite?: number;
  endseite?: number;
  anfangsquadrant?: string;
  endquadrant?: string;
}

export interface Vorgangsbezug {
  id: string;
  vorgangsnummer: string;
  titel: string;
  vorgangstyp: string;
}

export interface Ressort {
  federfuehrend: boolean;
  titel: string;
}

export interface Urheber {
  einbringer: boolean;
  bezeichnung: string;
  titel: string;
  rolle?: string;
}

export interface PlenarprotokollText {
  id: string;
  dokumentart: 'Plenarprotokoll';
  typ: string;
  dokumentnummer: string;
  wahlperiode: number;
  datum: string;
  titel: string;
  text: string;
  fundstelle: Fundstelle;
  herausgeber: string;
  pdf_url?: string;
  vorgangsbezug?: Vorgangsbezug[];
  deskriptor?: Array<{ name: string; typ: string }>;
}

export interface Plenarprotokoll {
  id: string;
  dokumentart: 'Plenarprotokoll';
  typ: string;
  dokumentnummer: string;
  wahlperiode: number;
  datum: string;
  titel: string;
  fundstelle: Fundstelle;
  herausgeber: string;
  pdf_url?: string;
  vorgangsbezug?: Vorgangsbezug[];
}

export interface PlenarprotokollListResponse {
  numFound: number;
  cursor?: string;
  documents: Plenarprotokoll[];
}

export interface PlenarprotokollTextListResponse {
  numFound: number;
  cursor?: string;
  documents: PlenarprotokollText[];
}

export interface Drucksache {
  id: string;
  dokumentart: 'Drucksache';
  typ: string;
  dokumentnummer: string;
  wahlperiode: number;
  datum: string;
  titel: string;
  kurztitel?: string;
  autoren_anzahl?: number;
  fundstelle: Fundstelle;
  herausgeber: string;
  pdf_url?: string;
  urheber?: Urheber[];
  ressort?: Ressort[];
}

export interface Person {
  id: string;
  nachname: string;
  vorname: string;
  namenszusatz?: string;
  titel?: string;
  fraktion?: string;
  bundesland?: string;
  wahlperiode?: number[];
  basisdatum?: string;
  datum?: string;
}

// ============================================================================
// Search & Filter Types
// ============================================================================

export interface SearchParams {
  wahlperiode: number;
  startDatum?: string;
  endDatum?: string;
  suchbegriff?: string;
  cursor?: string;
  limit?: number;
  deskriptor?: string[];
  person?: string;
  fraktion?: string;
}

export interface DateRange {
  start: string;
  end: string;
}

// ============================================================================
// AI Analysis Types
// ============================================================================

export type AnalysisStatus = 'idle' | 'loading' | 'completed' | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thoughts?: string;
  timestamp: number;
  isStreaming?: boolean;
  sources?: string[];
}

export interface AnalysisResult {
  summary?: string;
  deepAnalysis?: DeepAnalysis;
  status: AnalysisStatus;
  error?: string;
  timestamp?: number;
}

export interface DeepAnalysis {
  text: string;
  thoughts?: string;
  sections?: AnalysisSection[];
}

export interface AnalysisSection {
  title: string;
  content: string;
  type: 'rhetoric' | 'framing' | 'conflicts' | 'decisions' | 'summary';
}

export interface AnalysisCache {
  [protocolId: string]: AnalysisResult;
}

// ============================================================================
// Application State Types
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'de' | 'en';
export type GeminiModel = 'gemini-2.0-flash' | 'gemini-2.5-flash' | 'gemini-2.5-pro';

export interface ApiKeys {
  bundestagKey: string;
  geminiKey: string;
}

export interface UserSettings {
  theme: Theme;
  language: Language;
  geminiModel: GeminiModel;
  thinkingBudget: number;
  autoSummarize: boolean;
  showThoughts: boolean;
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  cacheEnabled: boolean;
  maxCacheItems: number;
}

export interface AppState {
  // API Keys
  apiKeys: ApiKeys;
  setApiKeys: (keys: Partial<ApiKeys>) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  activeTab: 'overview' | 'investigator';
  setActiveTab: (tab: 'overview' | 'investigator') => void;

  // Protocol Data
  protocols: PlenarprotokollText[];
  setProtocols: (protocols: PlenarprotokollText[]) => void;
  appendProtocols: (protocols: PlenarprotokollText[]) => void;
  selectedProtocol: PlenarprotokollText | null;
  setSelectedProtocol: (protocol: PlenarprotokollText | null) => void;
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
  cursor: string | undefined;
  setCursor: (cursor: string | undefined) => void;

  // Loading States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isLoadingMore: boolean;
  setIsLoadingMore: (loading: boolean) => void;

  // Analysis Cache
  analysisCache: AnalysisCache;
  updateAnalysisCache: (protocolId: string, result: Partial<AnalysisResult>) => void;
  clearAnalysisCache: () => void;

  // Chat State
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  updateLastMessage: (content: string, thoughts?: string) => void;

  // Error State
  error: string | null;
  setError: (error: string | null) => void;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ProtocolCardProps {
  protocol: PlenarprotokollText;
  isSelected: boolean;
  onClick: () => void;
}

export interface AnalysisPanelProps {
  protocol: PlenarprotokollText;
}

export interface ChatPanelProps {
  protocol: PlenarprotokollText;
}

export interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================================================
// Export & Report Types
// ============================================================================

export interface ExportOptions {
  format: 'markdown' | 'pdf' | 'json';
  includeAnalysis: boolean;
  includeChatHistory: boolean;
  includeThoughts: boolean;
}

export interface ProtocolReport {
  protocol: PlenarprotokollText;
  analysis?: AnalysisResult;
  chatHistory?: ChatMessage[];
  exportedAt: string;
}
