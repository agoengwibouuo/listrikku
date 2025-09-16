'use client';

import { useState, useEffect } from 'react';
import DirectThemeToggle from '../../components/DirectThemeToggle';

export default function TestThemePage() {
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    setMounted(true);
    setCurrentTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Theme Toggle Test
          </h1>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Theme:</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currentTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </p>
            </div>

            <div className="flex justify-center">
              <DirectThemeToggle />
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Test Elements:
              </h3>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                  setCurrentTheme(newTheme);
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Refresh Theme Status
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>Check browser console for theme toggle logs</p>
              <p>Check localStorage for 'theme' key</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
