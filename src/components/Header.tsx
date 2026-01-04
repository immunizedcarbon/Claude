import React from 'react';
import { Menu, X, Settings, Moon, Sun, Keyboard, Database } from 'lucide-react';
import { IconButton } from './ui/Button';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, isSidebarOpen }) => {
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);
  const apiKeys = useStore((state) => state.apiKeys);
  const { effectiveTheme, toggleTheme } = useTheme();

  const hasGeminiKey = !!apiKeys.geminiKey;

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <IconButton
          icon={isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          label={isSidebarOpen ? 'Menü schließen' : 'Menü öffnen'}
          onClick={onMenuClick}
          className="md:hidden"
        />

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-bundestag-700 to-bundestag-500 text-white p-1.5 rounded-lg shadow-md">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Bundestag<span className="text-bundestag-600 dark:text-bundestag-400">AI</span>
            </h1>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Protocol Analyst
            </p>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        {/* Keyboard Shortcuts Hint */}
        <div className="hidden lg:flex items-center gap-2 mr-4 text-xs text-slate-400 dark:text-slate-500">
          <Keyboard className="w-3.5 h-3.5" />
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono">
              /
            </kbd>{' '}
            Suchen
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono">
              Ctrl+,
            </kbd>{' '}
            Einstellungen
          </span>
        </div>

        {/* Theme Toggle */}
        <IconButton
          icon={
            effectiveTheme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )
          }
          label={effectiveTheme === 'dark' ? 'Helles Design' : 'Dunkles Design'}
          onClick={toggleTheme}
        />

        {/* Settings */}
        <IconButton
          icon={<Settings className="w-5 h-5" />}
          label="Einstellungen"
          onClick={() => setSettingsOpen(true)}
          className={
            !hasGeminiKey
              ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-2 ring-red-100 dark:ring-red-800 animate-pulse'
              : ''
          }
        />
      </div>
    </header>
  );
};
