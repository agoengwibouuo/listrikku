'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { NetworkStatus } from '../lib/offlineStorage';

interface OfflineStatusProps {
  className?: string;
}

export default function OfflineStatus({ className = '' }: OfflineStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [offlineDataCount, setOfflineDataCount] = useState(0);

  useEffect(() => {
    // Initialize network status
    NetworkStatus.init();
    setIsOnline(NetworkStatus.getStatus());

    // Listen for network status changes
    const unsubscribe = NetworkStatus.addListener((online) => {
      setIsOnline(online);
      setIsVisible(!online);
      
      // Hide after 3 seconds when coming back online
      if (online) {
        setTimeout(() => setIsVisible(false), 3000);
      }
    });

    // Check for offline data
    const checkOfflineData = async () => {
      try {
        const { offlineStorage } = await import('../lib/offlineStorage');
        const count = await offlineStorage.getOfflineDataCount();
        setOfflineDataCount(count);
      } catch (error) {
        console.error('Failed to check offline data:', error);
      }
    };

    checkOfflineData();

    return unsubscribe;
  }, []);

  const handleRetry = async () => {
    try {
      const { offlineStorage } = await import('../lib/offlineStorage');
      const offlineData = await offlineStorage.getOfflineData();
      
      if (offlineData.length > 0) {
        // Trigger background sync
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SYNC_OFFLINE_DATA' });
        }
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  if (!isVisible && isOnline) {
    return null;
  }

  return (
    <div className={`fixed top-16 left-0 right-0 z-50 ${className}`}>
      <div className="max-w-md mx-auto px-4">
        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 transition-all duration-300 ${
          isOnline ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOnline ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'
            }`}>
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
            </div>
            
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                isOnline ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {isOnline ? 'Koneksi Internet Tersedia' : 'Tidak Ada Koneksi Internet'}
              </p>
              <p className={`text-xs ${
                isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {isOnline 
                  ? 'Aplikasi berfungsi normal' 
                  : 'Data akan disinkronkan saat online'
                }
              </p>
            </div>

            {!isOnline && (
              <button
                onClick={handleRetry}
                className="w-8 h-8 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded-lg flex items-center justify-center transition-colors"
                title="Coba sinkronkan data"
              >
                <RefreshCw className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            )}
          </div>

          {offlineDataCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <CloudOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs text-amber-700 dark:text-amber-300">
                  {offlineDataCount} data menunggu sinkronisasi
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Offline indicator for bottom of screen
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    NetworkStatus.init();
    setIsOnline(NetworkStatus.getStatus());

    const unsubscribe = NetworkStatus.addListener((online) => {
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-red-500 text-white rounded-lg p-2 text-center">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Offline Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
}
