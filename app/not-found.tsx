'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  AlertTriangle,
  Zap,
  BarChart3,
  Target,
  Settings
} from 'lucide-react';
import MobileMenu from '../components/MobileMenu';
import ClientOnly from '../components/ClientOnly';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 transition-colors duration-200">
        <ClientOnly>
          <MobileMenu />
        </ClientOnly>
        
        <div className="max-w-md mx-auto px-4 pt-20 pb-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-8 text-center">
            <div className="animate-pulse">
              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 transition-colors duration-200">
      <ClientOnly>
        <MobileMenu />
      </ClientOnly>

      <div className="max-w-md mx-auto px-4 pt-20 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-white/20 dark:border-gray-700/20"
            >
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Halaman Tidak Ditemukan</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Error 404</p>
            </div>
          </div>
        </div>

        {/* 404 Content */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-8 text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">404</h2>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Halaman Tidak Ditemukan</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Maaf, halaman yang Anda cari tidak ditemukan. Halaman mungkin telah dipindahkan, dihapus, atau URL yang Anda masukkan salah.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Kembali ke Beranda</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Kembali</span>
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Halaman Populer</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Beranda</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Dashboard utama</p>
              </div>
            </Link>

            <Link
              href="/add-reading"
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Tambah Pencatatan</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Input meteran</p>
              </div>
            </Link>

            <Link
              href="/budget"
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Budget Planning</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Kelola anggaran</p>
              </div>
            </Link>

            <Link
              href="/reports"
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Laporan</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Analisis data</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Butuh Bantuan?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Jika Anda terus mengalami masalah, coba:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Periksa URL yang Anda masukkan</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Gunakan menu navigasi untuk berpindah halaman</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Refresh halaman atau restart aplikasi</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Hubungi support jika masalah berlanjut</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
