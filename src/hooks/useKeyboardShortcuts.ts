import { useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useTheme } from './useTheme';

export function useKeyboardShortcuts() {
  const { toggleTheme } = useTheme();
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);
  const settingsOpen = useStore((state) => state.settingsOpen);
  const protocols = useStore((state) => state.protocols);
  const selectedProtocol = useStore((state) => state.selectedProtocol);
  const setSelectedProtocol = useStore((state) => state.setSelectedProtocol);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only allow Escape to close dialogs
        if (event.key === 'Escape') {
          if (settingsOpen) {
            setSettingsOpen(false);
            event.preventDefault();
          }
        }
        return;
      }

      // Ctrl/Cmd + key shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case ',':
            // Open settings
            setSettingsOpen(true);
            event.preventDefault();
            break;
          case 't':
            // Toggle theme
            toggleTheme();
            event.preventDefault();
            break;
        }
        return;
      }

      // Single key shortcuts
      switch (event.key) {
        case 'Escape':
          if (settingsOpen) {
            setSettingsOpen(false);
            event.preventDefault();
          }
          break;
        case '/':
          // Focus search input
          const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
          if (searchInput) {
            searchInput.focus();
            event.preventDefault();
          }
          break;
        case 'j':
          // Next protocol
          if (protocols.length > 0) {
            const currentIndex = selectedProtocol
              ? protocols.findIndex((p) => p.id === selectedProtocol.id)
              : -1;
            const nextIndex = Math.min(currentIndex + 1, protocols.length - 1);
            if (nextIndex >= 0) {
              setSelectedProtocol(protocols[nextIndex]);
            }
          }
          break;
        case 'k':
          // Previous protocol
          if (protocols.length > 0) {
            const currentIndex = selectedProtocol
              ? protocols.findIndex((p) => p.id === selectedProtocol.id)
              : protocols.length;
            const prevIndex = Math.max(currentIndex - 1, 0);
            setSelectedProtocol(protocols[prevIndex]);
          }
          break;
      }
    },
    [settingsOpen, protocols, selectedProtocol, setSettingsOpen, setSelectedProtocol, toggleTheme]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
