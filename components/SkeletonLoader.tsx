'use client';

import { useState, useEffect } from 'react';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
}

export default function SkeletonLoader({ className = '', lines = 1 }: SkeletonLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fixed widths to prevent hydration mismatch
  const widths = ['w-3/4', 'w-1/2', 'w-5/6', 'w-2/3', 'w-4/5'];

  if (!mounted) {
    return (
      <div className={`animate-pulse ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 ${widths[index % widths.length]}`}
        />
      ))}
    </div>
  );
}
