'use client';

import { useState, useEffect } from 'react';
import { Plus, Settings, BarChart3, Zap, Calendar, DollarSign, Database } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import MobileMenu from '../components/MobileMenu';
import FloatingActionButton from '../components/FloatingActionButton';
import AppLoading from '../components/AppLoading';
import EmptyState from '../components/EmptyState';
import AppCard from '../components/AppCard';
import ClientOnly from '../components/ClientOnly';
import SkeletonLoader from '../components/SkeletonLoader';
import DashboardChart from '../components/charts/DashboardChart';

interface MeterReading {
  id: number;
  reading_date: string;
  meter_value: number;
  previous_reading: number;
  usage_kwh: number;
  total_cost: number;
  notes?: string;
  created_at: string;
}

interface Statistics {
  total_readings: number;
  total_usage_all_time: number;
  total_cost_all_time: number;
  avg_usage_all_time: number;
  min_usage_all_time: number;
  max_usage_all_time: number;
  first_reading_date: string;
  last_reading_date: string;
}

interface Trends {
  usage: {
    current: number;
    previous: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'stable';
  };
  cost: {
    current: number;
    previous: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'stable';
  };
}

export default function HomePage() {
  const [recentReadings, setRecentReadings] = useState<MeterReading[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent readings
      const readingsResponse = await fetch('/api/meter-readings');
      const readingsData = await readingsResponse.json();
      if (readingsData.success) {
        setRecentReadings(readingsData.data.slice(0, 5));
      } else {
        console.error('Meter readings error:', readingsData.error);
      }

      // Fetch reports for statistics and trends
      const reportsResponse = await fetch('/api/reports?period=month');
      const reportsData = await reportsResponse.json();
      if (reportsData.success) {
        setStatistics(reportsData.data.statistics);
        setTrends(reportsData.data.trends);
      } else {
        console.error('Reports error:', reportsData.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
  };

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return '📈';
      case 'decrease':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-red-600';
      case 'decrease':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-20">
        <ClientOnly>
          <MobileMenu isLoggedIn={isLoggedIn} />
        </ClientOnly>
        
        <div className="max-w-md mx-auto px-4 pt-20 pb-4 space-y-4">
          {/* Skeleton for Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <AppCard>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <SkeletonLoader lines={2} />
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              </div>
            </AppCard>
            <AppCard>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <SkeletonLoader lines={2} />
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              </div>
            </AppCard>
          </div>

          {/* Skeleton for Trends */}
          <AppCard>
            <SkeletonLoader lines={3} />
          </AppCard>

          {/* Skeleton for Recent Readings */}
          <AppCard className="p-0">
            <div className="p-4 border-b border-gray-100/50">
              <SkeletonLoader lines={1} />
            </div>
            <div className="p-4">
              <SkeletonLoader lines={3} />
            </div>
          </AppCard>

          {/* Skeleton for Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <AppCard>
              <SkeletonLoader lines={2} />
            </AppCard>
            <AppCard>
              <SkeletonLoader lines={2} />
            </AppCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 transition-colors duration-200">
      {/* Mobile Menu */}
      <ClientOnly>
        <MobileMenu isLoggedIn={isLoggedIn} />
      </ClientOnly>

      <div className="max-w-md mx-auto px-4 pt-20 pb-4 space-y-4">
        {/* Quick Stats */}
        {statistics && (
          <div className="grid grid-cols-2 gap-3">
            <AppCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Penggunaan</p>
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">{statistics.total_usage_all_time} kWh</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
            </AppCard>

            <AppCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Biaya</p>
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">{formatCurrency(statistics.total_cost_all_time)}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
              </div>
            </AppCard>
          </div>
        )}

        {/* Trends */}
        {trends && (
          <AppCard>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Trend Bulan Ini</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getTrendIcon(trends.usage.changeType)}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Penggunaan kWh</span>
                </div>
                <span className={`text-xs font-semibold ${getTrendColor(trends.usage.changeType)}`}>
                  {(trends.usage.change || 0) > 0 ? '+' : ''}{(trends.usage.change || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getTrendIcon(trends.cost.changeType)}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Biaya Listrik</span>
                </div>
                <span className={`text-xs font-semibold ${getTrendColor(trends.cost.changeType)}`}>
                  {(trends.cost.change || 0) > 0 ? '+' : ''}{(trends.cost.change || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </AppCard>
        )}

        {/* Dashboard Chart */}
        {recentReadings.length > 0 && (
          <DashboardChart 
            data={recentReadings.slice(0, 7).map(reading => ({
              date: reading.reading_date,
              usage: reading.usage_kwh,
              cost: reading.total_cost
            }))}
            height={200}
            showTrend={true}
          />
        )}

        {/* Add Reading Button */}
        <Link href="/add-reading" className="block">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-center justify-center space-x-2">
              <Plus size={18} />
              <span className="text-sm font-semibold">Tambah Pencatatan</span>
            </div>
          </div>
        </Link>

        {/* Recent Readings */}
        <AppCard className="p-0">
          <div className="p-4 border-b border-gray-100/50 dark:border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Pencatatan Terbaru</h3>
          </div>
          <div className="divide-y divide-gray-100/50 dark:divide-gray-700/50">
            {recentReadings.length > 0 ? (
              recentReadings.map((reading) => (
                <div key={reading.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(reading.reading_date)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {reading.usage_kwh} kWh • {formatCurrency(reading.total_cost)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{reading.meter_value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">kWh</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Zap}
                title="Belum ada pencatatan"
                description="Mulai dengan menambah pencatatan meteran pertama untuk melacak penggunaan listrik Anda"
                action={{
                  label: "Tambah Pencatatan",
                  onClick: () => window.location.href = '/add-reading'
                }}
              />
            )}
          </div>
        </AppCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/reports" className="block">
            <AppCard>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Laporan</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Lihat analisis</p>
                </div>
              </div>
            </AppCard>
          </Link>

          <Link href="/settings" className="block">
            <AppCard>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Pengaturan</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Tarif & konfigurasi</p>
                </div>
              </div>
            </AppCard>
          </Link>
        </div>
      </div>

      {/* Floating Action Button */}
      <ClientOnly>
        <FloatingActionButton />
      </ClientOnly>
    </div>
  );
}
