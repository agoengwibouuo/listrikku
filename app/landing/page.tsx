'use client';

import { useState } from 'react';
import { 
  Zap, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Database, 
  ArrowRight, 
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Zap,
      title: 'Pencatatan Mudah',
      description: 'Catat meteran listrik dengan mudah dan cepat menggunakan smartphone Anda',
      color: 'primary'
    },
    {
      icon: BarChart3,
      title: 'Analisis Lengkap',
      description: 'Dapatkan laporan dan analisis penggunaan listrik yang detail dan informatif',
      color: 'success'
    },
    {
      icon: Smartphone,
      title: 'PWA Mobile',
      description: 'Install sebagai aplikasi di HP Anda untuk akses yang lebih mudah',
      color: 'warning'
    },
    {
      icon: Shield,
      title: 'Data Aman',
      description: 'Data Anda tersimpan aman di cloud dengan enkripsi yang kuat',
      color: 'danger'
    }
  ];

  const stats = [
    { icon: Users, value: '1000+', label: 'Pengguna Aktif' },
    { icon: TrendingUp, value: '95%', label: 'Akurasi Data' },
    { icon: Calendar, value: '24/7', label: 'Akses Data' },
    { icon: DollarSign, value: '30%', label: 'Hemat Biaya' }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      primary: 'bg-primary-100 text-primary-600',
      success: 'bg-success-100 text-success-600',
      warning: 'bg-warning-100 text-warning-600',
      danger: 'bg-danger-100 text-danger-600'
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <img src="/favicon.svg" alt="ListrikKu" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ListrikKu</h1>
                <p className="text-sm text-gray-600">PWA</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="bg-primary-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Kelola Listrik Rumah
              <span className="gradient-text block">Dengan Mudah</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Aplikasi PWA modern untuk pencatatan dan analisis penggunaan listrik rumah. 
              Install di HP, akses kapan saja, data tersimpan aman di cloud.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Mulai Gratis</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/demo"
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Lihat Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Fitur Unggulan</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola penggunaan listrik rumah
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'bg-white shadow-xl border-2 border-primary-200' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(feature.color)}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 float-animation">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${getColorClasses(features[activeFeature].color)}`}>
                    {(() => {
                      const IconComponent = features[activeFeature].icon;
                      return <IconComponent className="w-8 h-8" />;
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-gray-600">
                    {features[activeFeature].description}
                  </p>
                </div>
                
                {/* Mock UI */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-primary-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-primary-600 to-success-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Mengelola Listrik Rumah?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Bergabunglah dengan ribuan pengguna yang sudah merasakan kemudahan mengelola listrik rumah
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="bg-transparent text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white hover:bg-white/10 transition-all duration-200"
            >
              Sudah Punya Akun?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <img src="/favicon.svg" alt="ListrikKu" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">ListrikKu</h3>
                  <p className="text-sm text-gray-400">PWA</p>
                </div>
              </div>
              <p className="text-gray-400">
                Aplikasi modern untuk mengelola penggunaan listrik rumah dengan mudah dan efisien.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Fitur</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Harga</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Bantuan</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Kontak</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privasi</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Syarat</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ListrikKu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
