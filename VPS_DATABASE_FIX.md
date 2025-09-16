# 🔧 Fix VPS Database Connection

## Masalah yang Ditemukan

Error: `Access denied for user 'listrik-db'@'103.247.13.30'`

Ini berarti user database `listrik-db` tidak memiliki permission untuk koneksi dari IP Anda (`103.247.13.30`).

## 🛠️ Solusi

### 1. Login ke VPS dan Akses MySQL

```bash
# SSH ke VPS Anda
ssh your_username@208.76.40.94

# Login ke MySQL sebagai root
mysql -u root -p
```

### 2. Grant Permission untuk User

Jalankan perintah berikut di MySQL:

```sql
-- Grant all privileges untuk user listrik-db dari IP Anda
GRANT ALL PRIVILEGES ON `listrik-db`.* TO 'listrik-db'@'103.247.13.30' IDENTIFIED BY 'Nbyftj2kZkp28wsf';

-- Atau grant dari semua IP (kurang aman tapi lebih mudah)
GRANT ALL PRIVILEGES ON `listrik-db`.* TO 'listrik-db'@'%' IDENTIFIED BY 'Nbyftj2kZkp28wsf';

-- Reload privileges
FLUSH PRIVILEGES;

-- Keluar dari MySQL
EXIT;
```

### 3. Pastikan Database dan Tabel Ada

```sql
-- Login ke MySQL
mysql -u root -p

-- Pilih database
USE `listrik-db`;

-- Cek apakah tabel ada
SHOW TABLES;

-- Jika tabel tidak ada, import schema
-- (Anda perlu upload file database/schema.sql ke VPS)
```

### 4. Import Schema Database

**Opsi A: Via phpMyAdmin**
1. Buka phpMyAdmin di VPS: `http://208.76.40.94/phpmyadmin`
2. Login dengan user `listrik-db`
3. Pilih database `listrik-db`
4. Import file `database/schema.sql`

**Opsi B: Via Command Line**
```bash
# Upload schema.sql ke VPS
scp database/schema.sql your_username@208.76.40.94:/tmp/

# SSH ke VPS
ssh your_username@208.76.40.94

# Import schema
mysql -u listrik-db -p listrik-db < /tmp/schema.sql
```

### 5. Test Koneksi

Setelah setup selesai, test koneksi:

```bash
node test-vps-db.js
```

## 🔒 Alternatif: Buat User Baru

Jika masih ada masalah, buat user baru:

```sql
-- Login sebagai root
mysql -u root -p

-- Buat user baru
CREATE USER 'electricity_user'@'%' IDENTIFIED BY 'strong_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON `listrik-db`.* TO 'electricity_user'@'%';

-- Reload privileges
FLUSH PRIVILEGES;

-- Test koneksi user baru
mysql -u electricity_user -p listrik-db
```

Kemudian update `.env.local`:
```env
DB_USER=electricity_user
DB_PASSWORD=strong_password_here
```

## 🚨 Troubleshooting

### Error: "Host 'xxx.xxx.xxx.xxx' is not allowed to connect"
- **Solusi**: Grant permission untuk IP tersebut atau gunakan `%` untuk semua IP

### Error: "Unknown database 'listrik-db'"
- **Solusi**: Buat database terlebih dahulu:
```sql
CREATE DATABASE `listrik-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Table doesn't exist"
- **Solusi**: Import schema database:
```sql
SOURCE /path/to/schema.sql;
```

## 📋 Checklist

- [ ] User `listrik-db` memiliki permission dari IP Anda
- [ ] Database `listrik-db` sudah dibuat
- [ ] Tabel sudah diimport dari `schema.sql`
- [ ] Test koneksi berhasil dengan `node test-vps-db.js`
- [ ] Aplikasi bisa akses database

## 🎯 Setelah Fix

1. Restart development server: `npm run dev`
2. Buka aplikasi: `http://localhost:3000`
3. Klik tombol database di header untuk test
4. Mulai menggunakan aplikasi!

## 💡 Tips Keamanan

- Gunakan password yang kuat
- Batasi akses hanya dari IP yang diperlukan
- Backup database secara berkala
- Monitor log MySQL untuk aktivitas mencurigakan
