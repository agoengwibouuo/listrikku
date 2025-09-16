'use client';

import { ReactNode } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function MobileLayout({ 
  children, 
  title, 
  showBackButton = false, 
  onBack 
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Bar Spacer untuk iOS */}
      <div className="h-safe-area-inset-top bg-white"></div>
      
      {/* Header */}
      {title && (
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <button
                  onClick={onBack}
                  className="touch-button bg-gray-100 text-gray-600 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="max-w-md mx-auto">
        {children}
      </div>
      
      {/* Bottom Safe Area untuk iPhone */}
      <div className="h-safe-area-inset-bottom"></div>
    </div>
  );
}
