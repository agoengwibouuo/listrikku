'use client';

import { ReactNode } from 'react';

interface AppCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function AppCard({ children, className = '', onClick, hover = true }: AppCardProps) {
  return (
    <div 
      className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-4 ${
        hover ? 'hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 transform hover:scale-[1.02]' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
