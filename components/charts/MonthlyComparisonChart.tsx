'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface MonthlyData {
  month: string;
  usage: number;
  cost: number;
  year: number;
}

interface MonthlyComparisonChartProps {
  data: MonthlyData[];
  type?: 'bar' | 'pie';
  height?: number;
}

export default function MonthlyComparisonChart({ 
  data, 
  type = 'bar', 
  height = 300 
}: MonthlyComparisonChartProps) {
  const [chartType, setChartType] = useState(type);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Get unique years from data
  const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);
  
  // Filter data by selected year
  const filteredData = selectedYear 
    ? data.filter(item => item.year === selectedYear)
    : data.slice(0, 12); // Show last 12 months if no year selected

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString);
    return date.toLocaleDateString('id-ID', { month: 'short' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {formatMonth(label)}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Penggunaan: <span className="font-semibold">{payload[0].value} kWh</span>
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              Biaya: <span className="font-semibold">{formatCurrency(payload[1].value)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {data.name}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Penggunaan: <span className="font-semibold">{data.value} kWh</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Persentase: <span className="font-semibold">{data.payload.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare pie chart data
  const pieData = filteredData.map(item => ({
    name: formatMonth(item.month),
    value: item.usage,
    percentage: ((item.usage / filteredData.reduce((sum, d) => sum + d.usage, 0)) * 100).toFixed(1)
  }));

  const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
    '#14b8a6', '#f43f5e'
  ];

  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      );
    }

    return (
      <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          tickFormatter={formatMonth}
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="usage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    );
  };

  // Calculate statistics
  const totalUsage = filteredData.reduce((sum, item) => sum + item.usage, 0);
  const totalCost = filteredData.reduce((sum, item) => sum + item.cost, 0);
  const averageUsage = totalUsage / filteredData.length;
  const averageCost = totalCost / filteredData.length;

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Perbandingan Bulanan
          </h3>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Year Selector */}
          {years.length > 1 && (
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Semua Tahun</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
          
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                chartType === 'pie'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Pie
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Penggunaan</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalUsage.toFixed(0)} kWh</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rata-rata: {averageUsage.toFixed(1)} kWh</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingDown className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Biaya</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rata-rata: {formatCurrency(averageCost)}</p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      {chartType === 'bar' && (
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Penggunaan (kWh)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Biaya (Rp)</span>
          </div>
        </div>
      )}
    </div>
  );
}
