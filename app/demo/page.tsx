'use client';

import { useState } from 'react';
import { 
  ArrowLeft, 
  Zap, 
  BarChart3, 
  Plus, 
  Settings, 
  Database,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  DollarSign,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const mockData = {
    recentReadings: [
      { id: 1, date: '2024-01-15', meter: 1250, usage: 45, cost: 67500 },
      { id: 2, date: '2024-01-14', meter: 1205, usage: 38, cost: 57000 },
      { id: 3, date: '2024-01-13', meter: 1167, usage: 42, cost: 63000 },
      { id: 4, date: '2024-01-12', meter: 1125, usage: 35, cost: 52500 },
      { id: 5, date: '2024-01-11', meter: 1090, usage: 40, cost: 60000 }
    ],
    statistics: {
      totalUsage: 1250,
      totalCost: 1875000,
      avgUsage: 42,
      totalReadings: 15
    },
    trends: {
      usage: { change: 12.5, type: 'increase' },
      cost: { change: 8.3, type: 'increase' }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTrendIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (type: string) => {
    switch (type) {
      case 'increase':
        return 'text-red-600';
      case 'decrease':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 pt-20 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/landing" className="touch-button bg-gray-100 text-gray-600 rounded-lg">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Demo Aplikasi</h1>
              <p className="text-sm text-gray-600">Lihat fitur-fitur aplikasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto px-4">
          <div className="flex space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'add', label: 'Tambah Data', icon: Plus },
              { id: 'settings', label: 'Pengaturan', icon: Settings },
              { id: 'pwa', label: 'PWA', icon: Smartphone }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={16} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Penggunaan</p>
                    <p className="text-lg font-bold text-gray-900">{mockData.statistics.totalUsage} kWh</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Biaya</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(mockData.statistics.totalCost)}</p>
                  </div>
                  <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-success-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Trends */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Trend Bulan Ini</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(mockData.trends.usage.type)}
                    <span className="text-sm text-gray-600">Penggunaan kWh</span>
                  </div>
                  <span className={`text-sm font-medium ${getTrendColor(mockData.trends.usage.type)}`}>
                    +{mockData.trends.usage.change}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(mockData.trends.cost.type)}
                    <span className="text-sm text-gray-600">Biaya Listrik</span>
                  </div>
                  <span className={`text-sm font-medium ${getTrendColor(mockData.trends.cost.type)}`}>
                    +{mockData.trends.cost.change}%
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Readings */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Pencatatan Terbaru</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {mockData.recentReadings.map((reading) => (
                  <div key={reading.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(reading.date)}</p>
                          <p className="text-sm text-gray-600">
                            {reading.usage} kWh • {formatCurrency(reading.cost)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{reading.meter}</p>
                        <p className="text-xs text-gray-500">kWh</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Pencatatan Meteran</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Pencatatan
                  </label>
                  <input
                    type="date"
                    value="2024-01-15"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nilai Meteran (kWh)
                  </label>
                  <input
                    type="number"
                    value="1250"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value="Pencatatan rutin bulanan"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled
                  />
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-primary-900">Perhitungan Otomatis</span>
                  </div>
                  <div className="text-sm text-primary-700 space-y-1">
                    <p>Penggunaan: 45 kWh</p>
                    <p>Biaya: {formatCurrency(67500)}</p>
                    <p>Tarif: R1/TR 900 VA</p>
                  </div>
                </div>

                <button
                  disabled
                  className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 flex items-center justify-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Simpan Pencatatan</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Tarif</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-primary-900">Tarif PLN R1/TR 900 VA</h4>
                    <span className="bg-success-100 text-success-800 text-xs px-2 py-1 rounded-full">
                      Aktif
                    </span>
                  </div>
                  <div className="text-sm text-primary-700 space-y-1">
                    <p>Block 1: 900 kWh × {formatCurrency(1352)}</p>
                    <p>Admin: {formatCurrency(0)} • PPN: 10%</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Tarif PLN R1/TR 1300 VA</h4>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      Tidak Aktif
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Block 1: 1300 kWh × {formatCurrency(1444)}</p>
                    <p>Admin: {formatCurrency(0)} • PPN: 10%</p>
                  </div>
                </div>

                <button
                  disabled
                  className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 flex items-center justify-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Tambah Tarif Baru</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pwa' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Install sebagai PWA</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Smartphone className="w-6 h-6 text-primary-600" />
                    <h4 className="font-medium text-primary-900">Mobile App Experience</h4>
                  </div>
                  <p className="text-sm text-primary-700">
                    Install aplikasi di HP Anda untuk akses yang lebih mudah dan cepat.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                    </div>
                    <span className="text-sm text-gray-700">Offline Support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                    </div>
                    <span className="text-sm text-gray-700">Push Notifications</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                    </div>
                    <span className="text-sm text-gray-700">Fast Loading</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                    </div>
                    <span className="text-sm text-gray-700">Home Screen Icon</span>
                  </div>
                </div>

                <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
                  <h4 className="font-medium text-warning-900 mb-2">Cara Install:</h4>
                  <ol className="text-sm text-warning-700 space-y-1 list-decimal list-inside">
                    <li>Buka aplikasi di browser HP</li>
                    <li>Klik menu browser (⋮)</li>
                    <li>Pilih "Add to Home Screen"</li>
                    <li>Konfirmasi install</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-success-600 rounded-xl p-6 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Siap Menggunakan Aplikasi?</h3>
          <p className="text-white/90 mb-4">
            Daftar sekarang untuk mengakses semua fitur lengkap
          </p>
          <div className="flex space-x-3">
            <Link
              href="/register"
              className="flex-1 bg-white text-primary-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Daftar Gratis
            </Link>
            <Link
              href="/login"
              className="flex-1 bg-transparent text-white py-3 rounded-xl font-semibold border-2 border-white hover:bg-white/10 transition-colors"
            >
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
