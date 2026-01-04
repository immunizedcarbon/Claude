import React, { useEffect } from 'react';
import { Header, Sidebar, AnalysisPanel, SettingsDialog, EmptyState } from './components';
import { useStore } from './store/useStore';
import { useTheme, useKeyboardShortcuts, useProtocols } from './hooks';

const App: React.FC = () => {
  // Initialize theme
  useTheme();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Global state
  const sidebarOpen = useStore((state) => state.sidebarOpen);
  const setSidebarOpen = useStore((state) => state.setSidebarOpen);
  const settingsOpen = useStore((state) => state.settingsOpen);
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);
  const selectedProtocol = useStore((state) => state.selectedProtocol);
  const settings = useStore((state) => state.settings);

  // Fetch protocols on mount
  const { search } = useProtocols();

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply font size from settings
  useEffect(() => {
    const root = document.documentElement;
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.fontSize = fontSizes[settings.fontSize];
  }, [settings.fontSize]);

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
          {selectedProtocol ? (
            <div className="h-full flex gap-6 flex-col xl:flex-row p-4 md:p-6 overflow-hidden">
              {/* Left: Document Preview (hidden on smaller screens) */}
              <div className="hidden xl:flex w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex-col overflow-hidden shrink-0">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    Originaldokument
                  </h3>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="mb-6">
                    <span className="inline-block px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono mb-2">
                      {selectedProtocol.dokumentnummer}
                    </span>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2">
                      {selectedProtocol.titel}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {new Date(selectedProtocol.datum).toLocaleDateString('de-DE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span>{selectedProtocol.herausgeber}</span>
                    </div>
                  </div>

                  <div className="prose prose-xs prose-slate dark:prose-invert max-w-none font-serif text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {selectedProtocol.text.substring(0, 2000)}
                    {selectedProtocol.text.length > 2000 && (
                      <span className="text-slate-400 dark:text-slate-500">
                        ...
                        <br />
                        <span className="text-xs">
                          [+ {(selectedProtocol.text.length - 2000).toLocaleString('de-DE')} weitere
                          Zeichen]
                        </span>
                      </span>
                    )}
                  </div>

                  {selectedProtocol.fundstelle?.pdf_url && (
                    <a
                      href={selectedProtocol.fundstelle.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      PDF öffnen
                    </a>
                  )}
                </div>
              </div>

              {/* Right: Analysis Panel */}
              <div className="flex-1 h-full min-w-0">
                <AnalysisPanel protocol={selectedProtocol} />
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </main>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default App;
