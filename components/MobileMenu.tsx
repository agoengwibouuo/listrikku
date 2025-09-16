'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Plus, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  User,
  LogOut,
  Database,
  Info,
  Target,
  LogIn,
  UserPlus
} from 'lucide-react';
import DirectThemeToggle from './DirectThemeToggle';
import { useAuth } from '../contexts/AuthContext';

interface MobileMenuProps {
  isLoggedIn?: boolean;
}

export default function MobileMenu({ isLoggedIn = true }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { href: '/', icon: Home, label: 'Beranda', active: pathname === '/' },
    { href: '/add-reading', icon: Plus, label: 'Tambah', active: pathname === '/add-reading' },
    { href: '/budget', icon: Target, label: 'Budget', active: pathname === '/budget' },
    { href: '/reports', icon: BarChart3, label: 'Laporan', active: pathname === '/reports' },
    { href: '/settings', icon: Settings, label: 'Pengaturan', active: pathname === '/settings' },
  ];

  const sideMenuItems = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/setup', icon: Database, label: 'Database Setup' },
    { href: '/landing', icon: Info, label: 'Tentang Aplikasi' },
    { href: '/demo', icon: BarChart3, label: 'Demo Mode' },
  ];

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-8 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-gray-100/80 rounded-xl"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-100 rounded mt-1"></div>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-white/20 dark:border-gray-800/20 sticky top-6 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors"
            >
              <Menu size={20} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* App Title */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <img src="/favicon.svg" alt="ListrikKu" className="w-5 h-5" />
              </div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ListrikKu</h1>
            </div>

            {/* Theme Toggle */}
            <DirectThemeToggle />
          </div>
        </div>
      </div>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Side Menu */}
          <div className="absolute left-0 top-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <img src="/favicon.svg" alt="ListrikKu" className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">ListrikKu</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pencatatan Listrik</p>
                    </div>
                  </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>

                  {/* User Info */}
                  {user ? (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{user.full_name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-2xl p-4 mb-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Belum Login</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Login untuk mengakses semua fitur</p>
                        <div className="flex space-x-2">
                          <Link
                            href="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                          >
                            Login
                          </Link>
                          <Link
                            href="/register"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                          >
                            Daftar
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

              {/* Main Menu */}
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Menu Utama</h4>
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      item.active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Additional Menu */}
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Lainnya</h4>
                {sideMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

                  {/* Logout */}
                  {user && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={async () => {
                          await logout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 w-full"
                      >
                        <LogOut size={20} />
                        <span className="font-medium">Keluar</span>
                      </button>
                    </div>
                  )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-white/20 dark:border-gray-800/20 shadow-lg">
            <div className="flex items-center justify-around py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                    item.active
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                    item.active
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-xs font-medium mt-1">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
