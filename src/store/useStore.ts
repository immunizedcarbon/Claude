import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppState,
  ApiKeys,
  UserSettings,
  SearchParams,
  AnalysisResult,
} from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_BUNDESTAG_KEY } from '@/config/constants';

// Separate persisted state for sensitive data
interface PersistedState {
  apiKeys: ApiKeys;
  settings: UserSettings;
  analysisCache: Record<string, AnalysisResult>;
}

// Initial search params
const initialSearchParams: SearchParams = {
  wahlperiode: 21,
  limit: 20,
};

// Create the store with persistence
export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // API Keys
      apiKeys: {
        bundestagKey: DEFAULT_BUNDESTAG_KEY,
        geminiKey: '',
      },
      setApiKeys: (keys) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, ...keys },
        })),

      // Settings
      settings: DEFAULT_SETTINGS,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () =>
        set(() => ({
          settings: DEFAULT_SETTINGS,
        })),

      // UI State
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      activeTab: 'overview',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Protocol Data
      protocols: [],
      setProtocols: (protocols) => set({ protocols }),
      appendProtocols: (newProtocols) =>
        set((state) => ({
          protocols: [...state.protocols, ...newProtocols],
        })),
      selectedProtocol: null,
      setSelectedProtocol: (protocol) =>
        set({
          selectedProtocol: protocol,
          activeTab: 'overview',
          chatMessages: [], // Clear chat when selecting new protocol
        }),
      searchParams: initialSearchParams,
      setSearchParams: (params) =>
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        })),
      cursor: undefined,
      setCursor: (cursor) => set({ cursor }),

      // Loading States
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      isLoadingMore: false,
      setIsLoadingMore: (loading) => set({ isLoadingMore: loading }),

      // Analysis Cache
      analysisCache: {},
      updateAnalysisCache: (protocolId, result) =>
        set((state) => ({
          analysisCache: {
            ...state.analysisCache,
            [protocolId]: {
              ...state.analysisCache[protocolId],
              ...result,
              timestamp: Date.now(),
            },
          },
        })),
      clearAnalysisCache: () => set({ analysisCache: {} }),

      // Chat State
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      clearChatMessages: () => set({ chatMessages: [] }),
      updateLastMessage: (content, thoughts) =>
        set((state) => {
          const messages = [...state.chatMessages];
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            messages[messages.length - 1] = {
              ...lastMessage,
              content,
              thoughts,
              isStreaming: false,
            };
          }
          return { chatMessages: messages };
        }),

      // Error State
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'bundestag-ai-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedState => ({
        apiKeys: state.apiKeys,
        settings: state.settings,
        analysisCache: state.analysisCache,
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...(persistedState as PersistedState),
            settings: DEFAULT_SETTINGS,
          };
        }
        return persistedState as PersistedState;
      },
    }
  )
);

// Selectors for common state access patterns
export const useApiKeys = () => useStore((state) => state.apiKeys);
export const useSettings = () => useStore((state) => state.settings);
export const useProtocols = () => useStore((state) => state.protocols);
export const useSelectedProtocol = () => useStore((state) => state.selectedProtocol);
export const useAnalysisCache = () => useStore((state) => state.analysisCache);
export const useChatMessages = () => useStore((state) => state.chatMessages);
export const useIsLoading = () => useStore((state) => state.isLoading);
export const useError = () => useStore((state) => state.error);

// Check if Gemini API key is configured
export const useHasGeminiKey = () =>
  useStore((state) => !!state.apiKeys.geminiKey && state.apiKeys.geminiKey.length > 0);

// Get current analysis for selected protocol
export const useCurrentAnalysis = () =>
  useStore((state) => {
    const { selectedProtocol, analysisCache } = state;
    if (!selectedProtocol) return null;
    return analysisCache[selectedProtocol.id] || null;
  });

// Theme handling with system preference
export const useTheme = () => {
  const settings = useSettings();
  const updateSettings = useStore((state) => state.updateSettings);

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (settings.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return settings.theme;
  };

  const toggleTheme = () => {
    const current = getEffectiveTheme();
    updateSettings({ theme: current === 'light' ? 'dark' : 'light' });
  };

  return { theme: settings.theme, effectiveTheme: getEffectiveTheme(), toggleTheme };
};
