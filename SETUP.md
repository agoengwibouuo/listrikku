# Setup Guide - ListrikKu

## Langkah-langkah Setup

### 1. Install Dependencies
Jalankan perintah berikut di terminal:
```bash
npm install
```

Jika ada error PowerShell execution policy, jalankan:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Setup Database MySQL
1. Buka phpMyAdmin di browser
2. Buat database baru dengan nama `electricity_tracker`
3. Import file `database/schema.sql` ke database tersebut
4. Pastikan semua tabel berhasil dibuat

### 3. Konfigurasi Environment
Buat file `.env.local` di root project dengan isi:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=electricity_tracker
DB_PORT=3306
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### 5. Test PWA Features
1. Buka aplikasi di browser HP
2. Klik menu browser (3 titik)
3. Pilih "Add to Home Screen" atau "Install App"
4. Aplikasi akan terinstall seperti aplikasi native

## Troubleshooting

### Database Connection Error
- Pastikan MySQL server berjalan
- Cek username dan password di `.env.local`
- Pastikan database `electricity_tracker` sudah dibuat

### PWA Not Working
- Pastikan aplikasi dijalankan dengan HTTPS (atau localhost)
- Cek browser console untuk error service worker
- Pastikan manifest.json dapat diakses

### Build Error
- Pastikan semua dependencies terinstall
- Cek versi Node.js (minimal v16)
- Jalankan `npm run build` untuk test production build

## Fitur Aplikasi

### Halaman Utama
- Dashboard dengan statistik penggunaan
- Quick access ke fitur utama
- Pencatatan terbaru

### Tambah Pencatatan
- Input nilai meteran
- Perhitungan otomatis biaya
- Preview perhitungan sebelum simpan

### Pengaturan Tarif
- Kelola tarif listrik dengan sistem block
- Aktifkan/nonaktifkan tarif
- Edit dan hapus tarif

### Laporan & Analisis
- Statistik penggunaan
- Trend bulanan/tahunan
- Data pencatatan terbaru

## Database Schema

### Tabel Utama
- `electricity_settings`: Pengaturan tarif listrik
- `meter_readings`: Pencatatan meteran
- `billing_details`: Detail perhitungan per block
- `app_settings`: Pengaturan aplikasi

### Data Default
Aplikasi sudah include data default untuk tarif PLN:
- R1/TR 900 VA
- R1/TR 1300 VA  
- R1/TR 2200 VA

## Mobile Optimization

### Touch-Friendly Design
- Button minimal 44px height
- Spacing yang cukup antar elemen
- Gesture support

### PWA Features
- Offline support
- Install prompt
- App-like experience
- Push notifications ready

### Responsive Layout
- Mobile-first design
- Adaptive untuk berbagai ukuran layar
- Safe area support untuk iPhone
