'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Zap, DollarSign } from 'lucide-react';

interface DashboardData {
  date: string;
  usage: number;
  cost: number;
}

interface DashboardChartProps {
  data: DashboardData[];
  height?: number;
  showTrend?: boolean;
}

export default function DashboardChart({ 
  data, 
  height = 200, 
  showTrend = true 
}: DashboardChartProps) {
  const [viewMode, setViewMode] = useState<'usage' | 'cost'>('usage');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Calculate trend
  const calculateTrend = () => {
    if (data.length < 2) return null;
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const value = viewMode === 'usage' ? latest.usage : latest.cost;
    const prevValue = viewMode === 'usage' ? previous.usage : previous.cost;
    const change = ((value - prevValue) / prevValue) * 100;
    
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      percentage: Math.abs(change)
    };
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    
    switch (trend.direction) {
      case 'up':
        return 'text-red-500';
      case 'down':
        return 'text-green-500';
      case 'stable':
        return 'text-gray-500';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatDate(label)}
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

  // Calculate statistics
  const totalUsage = data.reduce((sum, item) => sum + item.usage, 0);
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const averageUsage = totalUsage / data.length;
  const averageCost = totalCost / data.length;

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Trend 7 Hari Terakhir
          </h3>
          {trend && showTrend && (
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {trend.percentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        
        {/* View Mode Selector */}
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('usage')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${
              viewMode === 'usage'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>kWh</span>
          </button>
          <button
            onClick={() => setViewMode('cost')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${
              viewMode === 'cost'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <DollarSign className="w-3 h-3" />
            <span>Rp</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Penggunaan</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalUsage.toFixed(0)} kWh</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rata-rata: {averageUsage.toFixed(1)} kWh/hari</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Biaya</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rata-rata: {formatCurrency(averageCost)}/hari</p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="usage"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#usageGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#costGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
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
    </div>
  );
}
