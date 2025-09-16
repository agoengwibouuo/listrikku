'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function SimpleThemeToggle() {
  const { actualTheme, setTheme } = useTheme();
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

  const handleToggle = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', actualTheme, 'to', newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-200 group"
      title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {actualTheme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform duration-200" />
      ) : (
        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform duration-200" />
      )}
    </button>
  );
}
