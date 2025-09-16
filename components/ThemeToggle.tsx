'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <Sun className="w-5 h-5 text-gray-400" />
      </div>
    );
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  const currentThemeIndex = themes.findIndex(t => t.value === theme);
  const nextTheme = themes[(currentThemeIndex + 1) % themes.length];

  const handleToggle = () => {
    console.log('Theme toggle clicked, switching from', theme, 'to:', nextTheme.value);
    setTheme(nextTheme.value);
  };

  const CurrentIcon = themes.find(t => t.value === theme)?.icon || Sun;

  return (
    <button
      onClick={handleToggle}
      className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-200 group"
      title={`Current: ${themes.find(t => t.value === theme)?.label} (Click to cycle)`}
    >
      <CurrentIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform duration-200" />
    </button>
  );
}

// Alternative: Dropdown Theme Selector
export function ThemeSelector() {
  const { theme, setTheme, actualTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <Sun className="w-5 h-5 text-gray-400" />
      </div>
    );
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Light Mode' },
    { value: 'dark', icon: Moon, label: 'Dark Mode' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-200"
        title="Theme Settings"
      >
        {currentTheme && <currentTheme.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center space-x-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  theme === themeOption.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <themeOption.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {themeOption.label}
                </span>
                {theme === themeOption.value && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
