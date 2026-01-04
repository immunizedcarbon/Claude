import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { Theme } from '@/types';

export function useTheme() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (settings.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return settings.theme;
  };

  const setTheme = (theme: Theme) => {
    updateSettings({ theme });
  };

  const toggleTheme = () => {
    const current = getEffectiveTheme();
    setTheme(current === 'light' ? 'dark' : 'light');
  };

  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#0a1929' : '#334e68');
    }
  }, [settings.theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const effectiveTheme = mediaQuery.matches ? 'dark' : 'light';
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  return {
    theme: settings.theme,
    effectiveTheme: getEffectiveTheme(),
    setTheme,
    toggleTheme,
  };
}
