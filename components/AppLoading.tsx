'use client';

import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface AppLoadingProps {
  message?: string;
}

export default function AppLoading({ message = 'Memuat aplikasi...' }: AppLoadingProps) {
  const [dots, setDots] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center z-50 transition-colors duration-200">
      <div className="text-center">
        {/* App Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Zap className="w-10 h-10 text-white" />
        </div>

        {/* App Name */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Electricity Tracker</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Pencatatan Listrik Rumah</p>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Loading Message */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {message}{mounted ? dots : ''}
        </p>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mt-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
