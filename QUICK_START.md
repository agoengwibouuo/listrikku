# 🚀 Quick Start Guide

## Langkah Cepat untuk Menjalankan Aplikasi

### 1. Persiapan Database MySQL
```sql
-- Buka phpMyAdmin atau MySQL client
-- Jalankan perintah berikut:

CREATE DATABASE electricity_tracker;
```

Kemudian import file `database/schema.sql` ke database tersebut.

### 2. Jalankan Aplikasi

**Windows:**
```bash
# Double-click file run-app.bat
# atau jalankan di command prompt:
run-app.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Manual:**
```bash
npm install
npm run dev
```

### 3. Akses Aplikasi
- Buka browser: `http://localhost:3000`
- Untuk test di HP: `http://[your-ip]:3000`

### 4. Setup PWA di HP
1. Buka aplikasi di browser HP
2. Klik menu browser (⋮)
3. Pilih "Add to Home Screen" atau "Install App"
4. Aplikasi akan terinstall seperti app native

## ⚡ Fitur Utama

### 🏠 Dashboard
- Statistik penggunaan listrik
- Trend bulanan
- Quick actions

### ➕ Tambah Pencatatan
- Input nilai meteran
- Perhitungan otomatis biaya
- Preview sebelum simpan

### ⚙️ Pengaturan Tarif
- Kelola tarif listrik
- Sistem block tarif PLN
- Aktifkan/nonaktifkan tarif

### 📊 Laporan & Analisis
- Laporan bulanan/tahunan
- Statistik penggunaan
- Trend dan perbandingan

## 🛠️ Troubleshooting

### Database Connection Error
```
❌ Error: connect ECONNREFUSED
```
**Solusi:**
- Pastikan MySQL server berjalan
- Cek kredensial di `.env.local`
- Pastikan database `electricity_tracker` exists

### Port Already in Use
```
❌ Error: listen EADDRINUSE :::3000
```
**Solusi:**
```bash
# Ganti port di package.json atau kill proses:
npx kill-port 3000
```

### PWA Not Installing
**Solusi:**
- Pastikan HTTPS (atau localhost)
- Cek browser console untuk errors
- Clear cache dan reload

## 📱 Mobile Testing

### Mengakses dari HP
1. Pastikan HP dan PC dalam jaringan yang sama
2. Cari IP address PC: `ipconfig` (Windows) atau `ifconfig` (Linux/Mac)
3. Akses dari HP: `http://[PC-IP]:3000`

### PWA Features
- ✅ Offline support
- ✅ Install prompt
- ✅ App-like experience
- ✅ Mobile-optimized UI

## 🎯 Default Data

Aplikasi sudah include tarif PLN default:
- **R1/TR 900 VA**: Block 1-900 kWh @ Rp 1.352/kWh
- **R1/TR 1300 VA**: Block 1-1300 kWh @ Rp 1.444,70/kWh
- **R1/TR 2200 VA**: Block 1-2200 kWh @ Rp 1.444,70/kWh

## 📞 Support

Jika mengalami masalah:
1. Cek file `SETUP.md` untuk panduan lengkap
2. Lihat console browser untuk error messages
3. Pastikan semua dependencies terinstall
4. Test database connection dengan `node test-db.js`
