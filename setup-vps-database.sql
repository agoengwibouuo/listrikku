-- Script untuk setup database di VPS
-- Jalankan sebagai root di MySQL

-- 1. Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS `listrik-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Grant permission untuk user listrik-db dari IP Anda (103.247.13.30)
GRANT ALL PRIVILEGES ON `listrik-db`.* TO 'listrik-db'@'103.247.13.30' IDENTIFIED BY 'Nbyftj2kZkp28wsf';

-- 3. Grant permission untuk user listrik-db dari semua IP (opsional, kurang aman)
GRANT ALL PRIVILEGES ON `listrik-db`.* TO 'listrik-db'@'%' IDENTIFIED BY 'Nbyftj2kZkp28wsf';

-- 4. Reload privileges
FLUSH PRIVILEGES;

-- 5. Pilih database
USE `listrik-db`;

-- 6. Buat tabel electricity_settings
CREATE TABLE IF NOT EXISTS electricity_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tariff_name VARCHAR(100) NOT NULL,
    base_tariff DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    first_block_kwh INT NOT NULL DEFAULT 0,
    first_block_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    second_block_kwh INT NOT NULL DEFAULT 0,
    second_block_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    third_block_kwh INT NOT NULL DEFAULT 0,
    third_block_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    admin_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    vat_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Buat tabel meter_readings
CREATE TABLE IF NOT EXISTS meter_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reading_date DATE NOT NULL,
    meter_value INT NOT NULL,
    previous_reading INT NOT NULL DEFAULT 0,
    usage_kwh INT NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reading_date (reading_date),
    INDEX idx_meter_value (meter_value)
);

-- 8. Buat tabel billing_details
CREATE TABLE IF NOT EXISTS billing_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meter_reading_id INT NOT NULL,
    block_number INT NOT NULL,
    kwh_used INT NOT NULL,
    rate_per_kwh DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meter_reading_id) REFERENCES meter_readings(id) ON DELETE CASCADE
);

-- 9. Buat tabel app_settings
CREATE TABLE IF NOT EXISTS app_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 10. Insert data default untuk pengaturan listrik
INSERT INTO electricity_settings (
    tariff_name, 
    base_tariff, 
    first_block_kwh, 
    first_block_rate, 
    second_block_kwh, 
    second_block_rate, 
    third_block_kwh, 
    third_block_rate, 
    admin_fee, 
    vat_percentage
) VALUES (
    'Tarif PLN R1/TR 900 VA',
    0.00,
    900,
    1352.00,
    1300,
    1444.70,
    0,
    0.00,
    0.00,
    10.00
), (
    'Tarif PLN R1/TR 1300 VA',
    0.00,
    1300,
    1444.70,
    2200,
    1444.70,
    0,
    0.00,
    0.00,
    10.00
), (
    'Tarif PLN R1/TR 2200 VA',
    0.00,
    2200,
    1444.70,
    0,
    0.00,
    0,
    0.00,
    0.00,
    10.00
);

-- 11. Insert pengaturan aplikasi default
INSERT INTO app_settings (setting_key, setting_value, setting_type, description) VALUES
('default_tariff_id', '1', 'number', 'ID tarif listrik default yang digunakan'),
('currency_symbol', 'Rp', 'string', 'Simbol mata uang yang digunakan'),
('date_format', 'DD/MM/YYYY', 'string', 'Format tanggal yang digunakan'),
('enable_notifications', 'true', 'boolean', 'Aktifkan notifikasi'),
('low_usage_threshold', '100', 'number', 'Batas bawah penggunaan kWh untuk peringatan'),
('high_usage_threshold', '500', 'number', 'Batas atas penggunaan kWh untuk peringatan'),
('app_version', '1.0.0', 'string', 'Versi aplikasi saat ini');

-- 12. Verifikasi setup
SELECT 'Database setup completed!' as status;
SELECT COUNT(*) as electricity_settings_count FROM electricity_settings;
SELECT COUNT(*) as app_settings_count FROM app_settings;
SHOW TABLES;
