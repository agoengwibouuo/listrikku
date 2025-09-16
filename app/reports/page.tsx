'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus, BarChart3, Zap, DollarSign, PieChart, LineChart } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import MobileMenu from '../../components/MobileMenu';
import ClientOnly from '../../components/ClientOnly';
import UsageChart from '../../components/charts/UsageChart';
import MonthlyComparisonChart from '../../components/charts/MonthlyComparisonChart';
import BudgetVsActualChart from '../../components/charts/BudgetVsActualChart';

interface ReportData {
  period: string;
  year: string;
  month: string;
  usageData: Array<{
    period: number;
    total_usage: number;
    total_cost: number;
    reading_count: number;
    avg_usage: number;
    min_usage: number;
    max_usage: number;
  }>;
  recentReadings: Array<{
    id: number;
    reading_date: string;
    meter_value: number;
    usage_kwh: number;
    total_cost: number;
  }>;
  statistics: {
    total_readings: number;
    total_usage_all_time: number;
    total_cost_all_time: number;
    avg_usage_all_time: number;
    min_usage_all_time: number;
    max_usage_all_time: number;
    first_reading_date: string;
    last_reading_date: string;
  };
  trends: {
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
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod, selectedYear, selectedMonth]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period: selectedPeriod,
        year: selectedYear,
        month: selectedMonth
      });
      
      const response = await fetch(`/api/reports?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
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
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
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

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i.toString());
    }
    return years;
  };

  const generateMonths = () => {
    return [
      { value: '1', label: 'Januari' },
      { value: '2', label: 'Februari' },
      { value: '3', label: 'Maret' },
      { value: '4', label: 'April' },
      { value: '5', label: 'Mei' },
      { value: '6', label: 'Juni' },
      { value: '7', label: 'Juli' },
      { value: '8', label: 'Agustus' },
      { value: '9', label: 'September' },
      { value: '10', label: 'Oktober' },
      { value: '11', label: 'November' },
      { value: '12', label: 'Desember' }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 transition-colors duration-200">
      {/* Mobile Menu */}
      <ClientOnly>
        <MobileMenu />
      </ClientOnly>

      <div className="max-w-md mx-auto px-4 pt-20 pb-4 space-y-4">
        {/* Period Selector */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Pilih Periode</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Jenis Laporan</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="month">Bulanan</option>
                <option value="year">Tahunan</option>
                <option value="all">Semua Data</option>
              </select>
            </div>
            
            {selectedPeriod === 'month' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {generateYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {generateMonths().map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {selectedPeriod === 'year' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {generateYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {reportData && (
          <>
            {/* Trends */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Trend Bulan Ini</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(reportData.trends.usage.changeType)}
                    <span className="text-sm text-gray-600">Penggunaan kWh</span>
                  </div>
                  <span className={`text-sm font-medium ${getTrendColor(reportData.trends.usage.changeType)}`}>
                    {(reportData.trends.usage.change || 0) > 0 ? '+' : ''}{(reportData.trends.usage.change || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(reportData.trends.cost.changeType)}
                    <span className="text-sm text-gray-600">Biaya Listrik</span>
                  </div>
                  <span className={`text-sm font-medium ${getTrendColor(reportData.trends.cost.changeType)}`}>
                    {(reportData.trends.cost.change || 0) > 0 ? '+' : ''}{(reportData.trends.cost.change || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Statistik Keseluruhan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{reportData.statistics.total_usage_all_time || 0}</p>
                  <p className="text-sm text-gray-600">Total kWh</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-success-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.statistics.total_cost_all_time || 0)}</p>
                  <p className="text-sm text-gray-600">Total Biaya</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="w-6 h-6 text-warning-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{(reportData.statistics.avg_usage_all_time || 0).toFixed(0)}</p>
                  <p className="text-sm text-gray-600">Rata-rata kWh</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{reportData.statistics.total_readings || 0}</p>
                  <p className="text-sm text-gray-600">Total Pencatatan</p>
                </div>
              </div>
            </div>

            {/* Usage Data */}
            {/* Advanced Charts Section */}
            <div className="space-y-4">
              {/* Usage Trend Chart */}
              <UsageChart 
                data={reportData.usageData.map(item => ({
                  date: item.period.toString(),
                  usage: item.total_usage,
                  cost: item.total_cost,
                  month: item.period.toString()
                }))}
                type="line"
                height={250}
                showTrend={true}
              />

              {/* Monthly Comparison Chart */}
              <MonthlyComparisonChart 
                data={reportData.usageData.map(item => ({
                  month: item.period.toString(),
                  usage: item.total_usage,
                  cost: item.total_cost,
                  year: new Date().getFullYear()
                }))}
                type="bar"
                height={300}
              />
            </div>

            {reportData.usageData.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Data {selectedPeriod === 'month' ? 'Harian' : selectedPeriod === 'year' ? 'Bulanan' : 'Bulanan'}
                </h3>
                <div className="space-y-3">
                  {reportData.usageData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedPeriod === 'month' ? `Hari ${data.period}` : 
                           selectedPeriod === 'year' ? `Bulan ${data.period}` : 
                           `Bulan ${data.period}`}
                        </p>
                        <p className="text-sm text-gray-600">{data.reading_count} pencatatan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{data.total_usage} kWh</p>
                        <p className="text-sm text-gray-600">{formatCurrency(data.total_cost)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Readings */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Pencatatan Terbaru</h3>
              <div className="space-y-3">
                {reportData.recentReadings.map((reading) => (
                  <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(reading.reading_date)}</p>
                      <p className="text-sm text-gray-600">Meter: {reading.meter_value} kWh</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{reading.usage_kwh} kWh</p>
                      <p className="text-sm text-gray-600">{formatCurrency(reading.total_cost)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
