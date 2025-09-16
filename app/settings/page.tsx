'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Check, X, Zap } from 'lucide-react';
import Link from 'next/link';
import MobileMenu from '../../components/MobileMenu';
import ClientOnly from '../../components/ClientOnly';
import ConfirmationModal from '../../components/ConfirmationModal';

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
  created_at: string;
  updated_at: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ElectricitySettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {}
  });
  const [formData, setFormData] = useState({
    tariff_name: '',
    base_tariff: 0,
    first_block_kwh: 0,
    first_block_rate: 0,
    second_block_kwh: 0,
    second_block_rate: 0,
    third_block_kwh: 0,
    third_block_rate: 0,
    admin_fee: 0,
    vat_percentage: 10,
    is_active: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        console.error('Failed to fetch settings:', data);
        alert('Gagal mengambil data pengaturan: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Terjadi kesalahan saat mengambil data. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tariff_name || formData.first_block_rate <= 0) {
      alert('Nama tarif dan tarif block pertama harus diisi');
      return;
    }

    try {
      const url = editingId ? `/api/settings/${editingId}` : '/api/settings';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(editingId ? 'Pengaturan berhasil diupdate!' : 'Pengaturan berhasil ditambahkan!');
        setShowAddForm(false);
        setEditingId(null);
        resetForm();
        fetchSettings();
      } else {
        alert(data.error || 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleEdit = (setting: ElectricitySettings) => {
    setFormData({
      tariff_name: setting.tariff_name,
      base_tariff: setting.base_tariff,
      first_block_kwh: setting.first_block_kwh,
      first_block_rate: setting.first_block_rate,
      second_block_kwh: setting.second_block_kwh,
      second_block_rate: setting.second_block_rate,
      third_block_kwh: setting.third_block_kwh,
      third_block_rate: setting.third_block_rate,
      admin_fee: setting.admin_fee,
      vat_percentage: setting.vat_percentage,
      is_active: setting.is_active
    });
    setEditingId(setting.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    const setting = settings.find(s => s.id === id);
    if (!setting) return;

    setConfirmationModal({
      isOpen: true,
      title: 'Hapus Pengaturan Tarif',
      message: `Apakah Anda yakin ingin menghapus pengaturan "${setting.tariff_name}"? Tindakan ini tidak dapat dibatalkan.`,
      type: 'danger',
      onConfirm: () => confirmDelete(id)
    });
  };

  const confirmDelete = async (id: number) => {
    try {
      console.log('Starting delete process for ID:', id);
      setDeletingId(id);
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      
      // Try test API first
      console.log('Testing database connection...');
      const testResponse = await fetch('/api/test-delete');
      const testData = await testResponse.json();
      console.log('Test API response:', testData);
      
      // Now try the actual delete
      const response = await fetch(`/api/settings/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response headers:', response.headers);
      
      const data = await response.json();
      console.log('Delete response data:', data);
      
      if (data.success) {
        console.log('Delete successful');
        // Show success modal
        setConfirmationModal({
          isOpen: true,
          title: 'Berhasil',
          message: 'Pengaturan tarif berhasil dihapus!',
          type: 'success',
          onConfirm: () => {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
            fetchSettings();
          }
        });
      } else {
        console.log('Delete failed:', data.error || data.message);
        // Show error modal
        setConfirmationModal({
          isOpen: true,
          title: 'Gagal Menghapus',
          message: data.error || data.message || 'Gagal menghapus pengaturan',
          type: 'danger',
          onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    } catch (error) {
      console.error('Error deleting settings:', error);
      // Show error modal
      setConfirmationModal({
        isOpen: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menghapus data. Periksa koneksi internet Anda.',
        type: 'danger',
        onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetActive = async (id: number) => {
    const setting = settings.find(s => s.id === id);
    if (!setting) return;

    setConfirmationModal({
      isOpen: true,
      title: 'Aktifkan Pengaturan',
      message: `Apakah Anda yakin ingin mengaktifkan pengaturan "${setting.tariff_name}"? Pengaturan yang aktif sebelumnya akan dinonaktifkan.`,
      type: 'info',
      onConfirm: () => confirmSetActive(id)
    });
  };

  const confirmSetActive = async (id: number) => {
    try {
      const setting = settings.find(s => s.id === id);
      if (!setting) return;

      const response = await fetch(`/api/settings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...setting,
          is_active: true
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setConfirmationModal({
          isOpen: true,
          title: 'Berhasil',
          message: 'Pengaturan berhasil diaktifkan!',
          type: 'success',
          onConfirm: () => {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
            fetchSettings();
          }
        });
      } else {
        setConfirmationModal({
          isOpen: true,
          title: 'Gagal Mengaktifkan',
          message: data.error || 'Gagal mengaktifkan pengaturan',
          type: 'danger',
          onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    } catch (error) {
      console.error('Error setting active:', error);
      setConfirmationModal({
        isOpen: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat mengaktifkan pengaturan',
        type: 'danger',
        onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const resetForm = () => {
    setFormData({
      tariff_name: '',
      base_tariff: 0,
      first_block_kwh: 0,
      first_block_rate: 0,
      second_block_kwh: 0,
      second_block_rate: 0,
      third_block_kwh: 0,
      third_block_rate: 0,
      admin_fee: 0,
      vat_percentage: 10,
      is_active: false
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pengaturan...</p>
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

      <div className="max-w-md mx-auto px-4 pt-20 pb-4">
        {/* Add Button */}
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            resetForm();
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 mb-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
        >
          <Plus size={16} />
          <span className="text-sm">Tambah Tarif Baru</span>
        </button>

        {/* Settings List */}
        <div className="space-y-3">
          {settings.map((setting) => (
            <div key={setting.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{setting.tariff_name}</h3>
                    {setting.is_active && (
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
                        Aktif
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Block 1: {setting.first_block_kwh} kWh × {formatCurrency(setting.first_block_rate)}</p>
                    {setting.second_block_kwh > 0 && (
                      <p>Block 2: {setting.second_block_kwh} kWh × {formatCurrency(setting.second_block_rate)}</p>
                    )}
                    {setting.third_block_kwh > 0 && (
                      <p>Block 3: {setting.third_block_kwh} kWh × {formatCurrency(setting.third_block_rate)}</p>
                    )}
                    <p>Admin: {formatCurrency(setting.admin_fee)} • PPN: {setting.vat_percentage}%</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {!setting.is_active && (
                    <button
                      onClick={() => handleSetActive(setting.id)}
                      className="w-7 h-7 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                      title="Aktifkan"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(setting)}
                    className="w-7 h-7 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(setting.id)}
                    className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                    title={setting.is_active ? "Tidak dapat menghapus pengaturan aktif" : "Hapus"}
                    disabled={setting.is_active || deletingId === setting.id}
                  >
                    {deletingId === setting.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingId ? 'Edit Tarif' : 'Tambah Tarif Baru'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      resetForm();
                    }}
                    className="touch-button bg-gray-100 text-gray-600 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Tarif *
                    </label>
                    <input
                      type="text"
                      value={formData.tariff_name}
                      onChange={(e) => handleInputChange('tariff_name', e.target.value)}
                      placeholder="Contoh: Tarif PLN R1/TR 900 VA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        kWh Block 1 *
                      </label>
                      <input
                        type="number"
                        value={formData.first_block_kwh}
                        onChange={(e) => handleInputChange('first_block_kwh', parseInt(e.target.value) || 0)}
                        placeholder="900"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarif Block 1 *
                      </label>
                      <input
                        type="number"
                        value={formData.first_block_rate}
                        onChange={(e) => handleInputChange('first_block_rate', parseInt(e.target.value) || 0)}
                        placeholder="1352"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        kWh Block 2
                      </label>
                      <input
                        type="number"
                        value={formData.second_block_kwh}
                        onChange={(e) => handleInputChange('second_block_kwh', parseInt(e.target.value) || 0)}
                        placeholder="1300"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarif Block 2
                      </label>
                      <input
                        type="number"
                        value={formData.second_block_rate}
                        onChange={(e) => handleInputChange('second_block_rate', parseInt(e.target.value) || 0)}
                        placeholder="1444"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Biaya Admin
                      </label>
                      <input
                        type="number"
                        value={formData.admin_fee}
                        onChange={(e) => handleInputChange('admin_fee', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PPN (%)
                      </label>
                      <input
                        type="number"
                        value={formData.vat_percentage}
                        onChange={(e) => handleInputChange('vat_percentage', parseInt(e.target.value) || 10)}
                        placeholder="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="is_active" className="text-sm text-gray-700">
                      Jadikan tarif aktif
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingId(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium"
                    >
                      {editingId ? 'Update' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          type={confirmationModal.type}
          confirmText={confirmationModal.type === 'danger' ? 'Hapus' : 'OK'}
          cancelText="Batal"
          loading={deletingId !== null}
        />
      </div>
    </div>
  );
}
