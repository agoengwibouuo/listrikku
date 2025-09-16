'use client';

import { ReactNode } from 'react';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export default function MobileCard({
  children,
  className = '',
  hover = false,
  padding = 'md'
}: MobileCardProps) {
  const baseClasses = 'bg-white rounded-xl shadow-sm';
  const hoverClasses = hover ? 'card-hover' : '';
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const classes = `${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
}
