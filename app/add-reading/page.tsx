'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Calculator, Calendar, Zap, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import MobileMenu from '../../components/MobileMenu';
import ClientOnly from '../../components/ClientOnly';
import CameraOCR from '../../components/CameraOCR';

interface ElectricitySettings {
  id: number;
  tariff_name: string;
  base_tariff: number;
  first_block_kwh: number;
  first_block_rate: number;
  second_block_kwh: number;
  second_block_rate: number;
  third_block_kwh: number;
  third_block_rate: number;
  admin_fee: number;
  vat_percentage: number;
  is_active: boolean;
}

interface MeterReading {
  id: number;
  reading_date: string;
  meter_value: number;
  previous_reading: number;
  usage_kwh: number;
  total_cost: number;
  notes?: string;
}

export default function AddReadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<ElectricitySettings | null>(null);
  const [lastReading, setLastReading] = useState<MeterReading | null>(null);
  const [formData, setFormData] = useState({
    reading_date: format(new Date(), 'yyyy-MM-dd'),
    meter_value: '',
    notes: ''
  });
  const [calculatedCost, setCalculatedCost] = useState<{
    usage_kwh: number;
    total_cost: number;
    details: Array<{ block: number; kwh: number; rate: number; subtotal: number }>;
  } | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    fetchInitialData();
    
    // Check if camera should be opened from URL parameter
    if (searchParams.get('camera') === 'true') {
      setShowCamera(true);
    }
  }, [searchParams]);

  const fetchInitialData = async () => {
    try {
      // Fetch active settings
      const settingsResponse = await fetch('/api/settings');
      const settingsData = await settingsResponse.json();
      if (settingsData.success) {
        const activeSetting = settingsData.data.find((s: ElectricitySettings) => s.is_active);
        setSettings(activeSetting || null);
      }

      // Fetch last reading
      const readingsResponse = await fetch('/api/meter-readings');
      const readingsData = await readingsResponse.json();
      if (readingsData.success && readingsData.data.length > 0) {
        setLastReading(readingsData.data[0]);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const calculateCost = (meterValue: number) => {
    if (!settings || !meterValue) return;

    const previousValue = lastReading?.meter_value || 0;
    const usageKwh = Math.max(0, meterValue - previousValue);

    const details: Array<{ block: number; kwh: number; rate: number; subtotal: number }> = [];
    let totalCost = 0;
    let remainingKwh = usageKwh;

    // Block pertama
    if (remainingKwh > 0 && settings.first_block_kwh > 0) {
      const kwhInFirstBlock = Math.min(remainingKwh, settings.first_block_kwh);
      const subtotal = kwhInFirstBlock * settings.first_block_rate;
      details.push({
        block: 1,
        kwh: kwhInFirstBlock,
        rate: settings.first_block_rate,
        subtotal
      });
      totalCost += subtotal;
      remainingKwh -= kwhInFirstBlock;
    }

    // Block kedua
    if (remainingKwh > 0 && settings.second_block_kwh > 0) {
      const kwhInSecondBlock = Math.min(remainingKwh, settings.second_block_kwh);
      const subtotal = kwhInSecondBlock * settings.second_block_rate;
      details.push({
        block: 2,
        kwh: kwhInSecondBlock,
        rate: settings.second_block_rate,
        subtotal
      });
      totalCost += subtotal;
      remainingKwh -= kwhInSecondBlock;
    }

    // Block ketiga
    if (remainingKwh > 0 && settings.third_block_kwh > 0) {
      const kwhInThirdBlock = Math.min(remainingKwh, settings.third_block_kwh);
      const subtotal = kwhInThirdBlock * settings.third_block_rate;
      details.push({
        block: 3,
        kwh: kwhInThirdBlock,
        rate: settings.third_block_rate,
        subtotal
      });
      totalCost += subtotal;
      remainingKwh -= kwhInThirdBlock;
    }

    // Tambahkan biaya admin dan PPN
    totalCost += settings.admin_fee;
    const vatAmount = (totalCost * settings.vat_percentage) / 100;
    totalCost += vatAmount;

    setCalculatedCost({
      usage_kwh: usageKwh,
      total_cost: totalCost,
      details
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'meter_value' && value) {
      calculateCost(parseInt(value));
    }
  };

  const handleCameraResult = (value: string) => {
    setFormData(prev => ({
      ...prev,
      meter_value: value
    }));

    // Recalculate cost with camera result
    if (value) {
      calculateCost(parseInt(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.meter_value || !formData.reading_date) {
      alert('Mohon isi semua field yang wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/meter-readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Pencatatan meteran berhasil disimpan!');
        router.push('/');
      } else {
        alert(data.error || 'Gagal menyimpan pencatatan meteran');
      }
    } catch (error) {
      console.error('Error saving meter reading:', error);
      alert('Terjadi kesalahan saat menyimpan data');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 transition-colors duration-200">
      {/* Mobile Menu */}
      <ClientOnly>
        <MobileMenu />
      </ClientOnly>

      <div className="max-w-md mx-auto px-4 pt-20 pb-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tarif Info */}
          {settings && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Tarif Aktif</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">{settings.tariff_name}</p>
            </div>
          )}

          {/* Last Reading Info */}
          {lastReading && (
            <div className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Pencatatan Terakhir</span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {format(new Date(lastReading.reading_date), 'dd MMMM yyyy', { locale: id })} - {lastReading.meter_value} kWh
              </p>
            </div>
          )}

          {/* Form Fields */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Pencatatan *
              </label>
              <input
                type="date"
                value={formData.reading_date}
                onChange={(e) => handleInputChange('reading_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nilai Meteran (kWh) *
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={formData.meter_value}
                  onChange={(e) => handleInputChange('meter_value', e.target.value)}
                  placeholder="Masukkan nilai meteran"
                  className="flex-1 px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                  required
                  min={lastReading?.meter_value || 0}
                />
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center justify-center"
                  title="Ambil foto meteran"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              {lastReading && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pencatatan terakhir: {lastReading.meter_value} kWh
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Tambahkan catatan jika diperlukan"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Calculation Preview */}
          {calculatedCost && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Perhitungan Biaya</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100/50 dark:border-gray-700/50">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Penggunaan</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{calculatedCost.usage_kwh} kWh</span>
                </div>
                
                {calculatedCost.details.map((detail, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Block {detail.block}</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{detail.kwh} kWh × {formatCurrency(detail.rate)}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(detail.subtotal)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between items-center py-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total Biaya</span>
                  <span className="font-bold text-base text-blue-600 dark:text-blue-400">
                    {formatCurrency(calculatedCost.total_cost)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.meter_value || !formData.reading_date}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="text-sm">Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span className="text-sm">Simpan Pencatatan</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Camera OCR Modal */}
      {showCamera && (
        <CameraOCR
          onResult={handleCameraResult}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
