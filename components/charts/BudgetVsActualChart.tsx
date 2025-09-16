'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { Target, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface BudgetData {
  month: string;
  budget: number;
  actual: number;
  usage_budget: number;
  usage_actual: number;
  status: 'on_track' | 'over_budget' | 'under_budget';
}

interface BudgetVsActualChartProps {
  data: BudgetData[];
  height?: number;
}

export default function BudgetVsActualChart({ 
  data, 
  height = 300 
}: BudgetVsActualChartProps) {
  const [viewMode, setViewMode] = useState<'cost' | 'usage'>('cost');

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
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {formatMonth(label)}
          </p>
          <div className="space-y-1">
            {viewMode === 'cost' ? (
              <>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Budget: <span className="font-semibold">{formatCurrency(data.budget)}</span>
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Aktual: <span className="font-semibold">{formatCurrency(data.actual)}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selisih: <span className={`font-semibold ${data.actual > data.budget ? 'text-red-500' : 'text-green-500'}`}>
                    {formatCurrency(data.actual - data.budget)}
                  </span>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Target: <span className="font-semibold">{data.usage_budget} kWh</span>
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Aktual: <span className="font-semibold">{data.usage_actual} kWh</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selisih: <span className={`font-semibold ${data.usage_actual > data.usage_budget ? 'text-red-500' : 'text-green-500'}`}>
                    {data.usage_actual - data.usage_budget} kWh
                  </span>
                </p>
              </>
            )}
            <div className="flex items-center space-x-1 mt-2">
              {data.status === 'on_track' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {data.status === 'over_budget' && <AlertTriangle className="w-4 h-4 text-red-500" />}
              {data.status === 'under_budget' && <Target className="w-4 h-4 text-blue-500" />}
              <span className="text-xs font-medium capitalize text-gray-600 dark:text-gray-400">
                {data.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate statistics
  const totalBudget = data.reduce((sum, item) => sum + (viewMode === 'cost' ? item.budget : item.usage_budget), 0);
  const totalActual = data.reduce((sum, item) => sum + (viewMode === 'cost' ? item.actual : item.usage_actual), 0);
  const overBudgetCount = data.filter(item => 
    viewMode === 'cost' ? item.actual > item.budget : item.usage_actual > item.usage_budget
  ).length;
  const onTrackCount = data.filter(item => item.status === 'on_track').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return '#10b981';
      case 'over_budget': return '#ef4444';
      case 'under_budget': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Budget vs Aktual
          </h3>
        </div>
        
        {/* View Mode Selector */}
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cost')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${
              viewMode === 'cost'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <DollarSign className="w-3 h-3" />
            <span>Biaya</span>
          </button>
          <button
            onClick={() => setViewMode('usage')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${
              viewMode === 'usage'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Target className="w-3 h-3" />
            <span>Penggunaan</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Budget</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {viewMode === 'cost' ? formatCurrency(totalBudget) : `${totalBudget.toFixed(0)} kWh`}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Aktual</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {viewMode === 'cost' ? formatCurrency(totalActual) : `${totalActual.toFixed(0)} kWh`}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">On Track</p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400">
            {onTrackCount}/{data.length}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            <Legend />
            
            {/* Budget Bar */}
            <Bar 
              dataKey={viewMode === 'cost' ? 'budget' : 'usage_budget'} 
              fill="#3b82f6" 
              name={viewMode === 'cost' ? 'Budget (Rp)' : 'Target (kWh)'}
              radius={[4, 4, 0, 0]}
              opacity={0.7}
            />
            
            {/* Actual Line */}
            <Line
              type="monotone"
              dataKey={viewMode === 'cost' ? 'actual' : 'usage_actual'}
              stroke="#10b981"
              strokeWidth={3}
              name={viewMode === 'cost' ? 'Aktual (Rp)' : 'Aktual (kWh)'}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
            
            {/* Reference Line for 100% budget */}
            <ReferenceLine 
              y={viewMode === 'cost' ? totalBudget / data.length : totalBudget / data.length} 
              stroke="#ef4444" 
              strokeDasharray="5 5"
              label="Rata-rata Budget"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Status Summary */}
      <div className="flex items-center justify-center space-x-4 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">On Track</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Over Budget</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Under Budget</span>
        </div>
      </div>
    </div>
  );
}
