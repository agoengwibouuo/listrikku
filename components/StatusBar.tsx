'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Battery, Signal } from 'lucide-react';

export default function StatusBar() {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85); // Fixed initial value
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Simulate battery level changes
    const batteryTimer = setInterval(() => {
      setBatteryLevel(prev => {
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +3
        return Math.max(10, Math.min(100, prev + change));
      });
    }, 10000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      clearInterval(batteryTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/5 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-4 py-1">
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="text-gray-900">--:--</div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Signal className="w-3 h-3 text-gray-700" />
                <span className="text-gray-700">4G</span>
              </div>
              <Wifi className="w-3 h-3 text-gray-700" />
              <div className="flex items-center space-x-1">
                <Battery className="w-4 h-3 text-gray-700" />
                <span className="text-gray-700">85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-black/5 dark:bg-white/5 backdrop-blur-sm">
      <div className="max-w-md mx-auto px-4 py-1">
        <div className="flex items-center justify-between text-xs font-medium">
          {/* Left side - Time */}
          <div className="text-gray-900 dark:text-gray-100">
            {formatTime(time)}
          </div>

          {/* Right side - Status indicators */}
          <div className="flex items-center space-x-2">
            {/* Signal */}
            <div className="flex items-center space-x-1">
              <Signal className="w-3 h-3 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-300">4G</span>
            </div>

            {/* WiFi */}
            <div className="flex items-center">
              {isOnline ? (
                <Wifi className="w-3 h-3 text-gray-700 dark:text-gray-300" />
              ) : (
                <WifiOff className="w-3 h-3 text-red-500" />
              )}
            </div>

            {/* Battery */}
            <div className="flex items-center space-x-1">
              <div className="relative">
                <Battery className="w-4 h-3 text-gray-700 dark:text-gray-300" />
                <div 
                  className="absolute top-0.5 left-0.5 rounded-sm"
                  style={{ 
                    width: `${batteryLevel}%`, 
                    height: '2px',
                    backgroundColor: batteryLevel > 20 ? '#374151' : '#ef4444'
                  }}
                />
              </div>
              <span className="text-gray-700 dark:text-gray-300">{batteryLevel}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
