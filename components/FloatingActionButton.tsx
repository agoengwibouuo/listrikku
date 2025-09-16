'use client';

import { useState, useEffect } from 'react';
import { Plus, X, BarChart3, Settings, Database, Camera, Target } from 'lucide-react';
import Link from 'next/link';

interface FloatingActionButtonProps {
  className?: string;
}

export default function FloatingActionButton({ className = '' }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const quickActions = [
    { href: '/add-reading', icon: Plus, label: 'Tambah Pencatatan', color: 'bg-blue-500' },
    { href: '/add-reading?camera=true', icon: Camera, label: 'Foto Meteran', color: 'bg-green-500' },
    { href: '/budget', icon: Target, label: 'Budget Planning', color: 'bg-orange-500' },
    { href: '/reports', icon: BarChart3, label: 'Laporan', color: 'bg-amber-500' },
    { href: '/settings', icon: Settings, label: 'Pengaturan', color: 'bg-gray-500' },
    { href: '/setup', icon: Database, label: 'Database', color: 'bg-purple-500' },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className={`fixed bottom-24 right-4 z-40 ${className}`}>
      {/* Quick Actions */}
      <div className={`absolute bottom-16 right-0 space-y-3 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {quickActions.map((action, index) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-3 ${action.color} text-white px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <action.icon size={18} />
            <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-105'
        } flex items-center justify-center`}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
}
