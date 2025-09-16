# ListrikKu

Aplikasi web PWA untuk pencatatan penggunaan listrik rumah yang dioptimalkan untuk HP. Aplikasi ini membantu Anda melacak penggunaan listrik dengan membandingkan sisa di meteran dan memberikan analisis lengkap tentang konsumsi listrik.

## Fitur Utama

- 📱 **PWA (Progressive Web App)** - Dapat diinstall di HP seperti aplikasi native
- ⚡ **Pencatatan Meteran** - Input nilai meteran dengan perhitungan otomatis
- 💰 **Pengaturan Tarif** - Kelola tarif listrik dengan sistem block
- 📊 **Laporan & Analisis** - Statistik penggunaan dan trend
- 🎨 **Mobile-First Design** - Interface yang dioptimalkan untuk HP
- 💾 **Offline Support** - Bekerja tanpa koneksi internet

## Teknologi yang Digunakan

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS 3.4
- **Database**: MySQL dengan phpMyAdmin
- **PWA**: Service Worker, Web App Manifest
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd electricity-tracker-pwa
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
1. Buka phpMyAdmin
2. Import file `database/schema.sql` untuk membuat database dan tabel
3. Pastikan database `electricity_tracker` sudah dibuat

### 4. Konfigurasi Environment
Buat file `.env.local` berdasarkan `env.example`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=electricity_tracker
DB_PORT=3306
```

### 5. Jalankan Aplikasi
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Struktur Database

### Tabel `electricity_settings`
Menyimpan pengaturan tarif listrik dengan sistem block:
- `tariff_name`: Nama tarif (contoh: "Tarif PLN R1/TR 900 VA")
- `first_block_kwh`: Batas kWh untuk block pertama
- `first_block_rate`: Tarif per kWh untuk block pertama
- `second_block_kwh`: Batas kWh untuk block kedua
- `second_block_rate`: Tarif per kWh untuk block kedua
- `admin_fee`: Biaya administrasi
- `vat_percentage`: Persentase PPN

### Tabel `meter_readings`
Menyimpan pencatatan meteran:
- `reading_date`: Tanggal pencatatan
- `meter_value`: Nilai meteran saat ini
- `previous_reading`: Nilai meteran sebelumnya
- `usage_kwh`: Penggunaan kWh (otomatis dihitung)
- `total_cost`: Total biaya (otomatis dihitung)

### Tabel `billing_details`
Menyimpan detail perhitungan per block:
- `meter_reading_id`: ID pencatatan meteran
- `block_number`: Nomor block (1, 2, 3)
- `kwh_used`: kWh yang digunakan di block tersebut
- `rate_per_kwh`: Tarif per kWh
- `subtotal`: Subtotal biaya

## Cara Penggunaan

### 1. Setup Awal
1. Buka aplikasi di browser HP
2. Pergi ke menu "Pengaturan"
3. Tambah atau aktifkan tarif listrik yang sesuai
4. Kembali ke halaman utama

### 2. Pencatatan Meteran
1. Klik "Tambah Pencatatan Meteran"
2. Masukkan tanggal pencatatan
3. Masukkan nilai meteran saat ini
4. Tambahkan catatan jika diperlukan
5. Klik "Simpan Pencatatan"

### 3. Melihat Laporan
1. Klik menu "Laporan"
2. Pilih periode (bulanan/tahunan/semua)
3. Lihat statistik dan trend penggunaan

### 4. Install sebagai PWA
1. Buka aplikasi di browser HP
2. Klik menu browser (3 titik)
3. Pilih "Add to Home Screen" atau "Install App"
4. Aplikasi akan muncul di home screen seperti aplikasi native

## API Endpoints

### Meter Readings
- `GET /api/meter-readings` - Ambil semua pencatatan
- `POST /api/meter-readings` - Tambah pencatatan baru
- `GET /api/meter-readings/[id]` - Ambil pencatatan berdasarkan ID
- `PUT /api/meter-readings/[id]` - Update pencatatan
- `DELETE /api/meter-readings/[id]` - Hapus pencatatan

### Settings
- `GET /api/settings` - Ambil semua pengaturan tarif
- `POST /api/settings` - Tambah pengaturan tarif baru
- `GET /api/settings/[id]` - Ambil pengaturan berdasarkan ID
- `PUT /api/settings/[id]` - Update pengaturan
- `DELETE /api/settings/[id]` - Hapus pengaturan

### Reports
- `GET /api/reports?period=month&year=2024&month=1` - Ambil laporan

## Build untuk Production

```bash
npm run build
npm start
```

## Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## Kontak

Jika ada pertanyaan atau saran, silakan buat issue di repository ini.
