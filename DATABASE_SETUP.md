# 🗄️ Database Setup Guide

## Masalah yang Anda Alami

Error 500 yang Anda lihat disebabkan oleh koneksi database yang belum terkonfigurasi dengan benar. Mari kita perbaiki step by step.

## 🔧 Solusi Langkah demi Langkah

### 1. Install MySQL (jika belum ada)

**Windows:**
- Download MySQL Installer dari https://dev.mysql.com/downloads/installer/
- Install MySQL Server dan MySQL Workbench
- Set password untuk root user

**XAMPP (Alternatif mudah):**
- Download XAMPP dari https://www.apachefriends.org/
- Install dan jalankan XAMPP Control Panel
- Start MySQL service

### 2. Buat Database

**Via phpMyAdmin (XAMPP):**
1. Buka browser: `http://localhost/phpmyadmin`
2. Klik "New" untuk membuat database baru
3. Nama database: `electricity_tracker`
4. Collation: `utf8mb4_unicode_ci`
5. Klik "Create"

**Via MySQL Command Line:**
```sql
CREATE DATABASE electricity_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Import Schema Database

**Via phpMyAdmin:**
1. Pilih database `electricity_tracker`
2. Klik tab "Import"
3. Klik "Choose File" dan pilih file `database/schema.sql`
4. Klik "Go" untuk import

**Via MySQL Command Line:**
```bash
mysql -u root -p electricity_tracker < database/schema.sql
```

### 4. Konfigurasi Environment

Edit file `.env.local` dengan kredensial database Anda:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=electricity_tracker
DB_PORT=3306
```

**Ganti `your_mysql_password_here` dengan password MySQL Anda yang sebenarnya!**

### 5. Test Koneksi

Jalankan perintah berikut untuk test koneksi:

```bash
node test-db.js
```

Atau buka aplikasi dan klik tombol database di header untuk test koneksi.

## 🚨 Troubleshooting

### Error: "ECONNREFUSED"
- **Penyebab:** MySQL server tidak berjalan
- **Solusi:** Start MySQL service di XAMPP atau Windows Services

### Error: "ER_ACCESS_DENIED"
- **Penyebab:** Username/password salah
- **Solusi:** Cek kredensial di `.env.local`

### Error: "ER_BAD_DB_ERROR"
- **Penyebab:** Database `electricity_tracker` tidak ada
- **Solusi:** Buat database sesuai langkah 2

### Error: "ER_NO_SUCH_TABLE"
- **Penyebab:** Tabel belum diimport
- **Solusi:** Import `database/schema.sql` sesuai langkah 3

## 📋 Checklist Setup

- [ ] MySQL server berjalan
- [ ] Database `electricity_tracker` dibuat
- [ ] File `database/schema.sql` diimport
- [ ] File `.env.local` dikonfigurasi dengan benar
- [ ] Test koneksi berhasil

## 🎯 Data Default

Setelah import schema, Anda akan mendapat data default:

### Tarif PLN:
- **R1/TR 900 VA**: Block 1-900 kWh @ Rp 1.352/kWh
- **R1/TR 1300 VA**: Block 1-1300 kWh @ Rp 1.444,70/kWh  
- **R1/TR 2200 VA**: Block 1-2200 kWh @ Rp 1.444,70/kWh

### Pengaturan Aplikasi:
- Currency: Rp
- Date format: DD/MM/YYYY
- VAT: 10%

## 🚀 Setelah Setup Selesai

1. Restart development server: `npm run dev`
2. Buka aplikasi: `http://localhost:3000`
3. Klik tombol database di header untuk test koneksi
4. Mulai menambah pencatatan meteran!

## 💡 Tips

- Gunakan XAMPP untuk setup yang lebih mudah
- Pastikan port 3306 tidak digunakan aplikasi lain
- Backup database secara berkala
- Gunakan password yang kuat untuk MySQL
