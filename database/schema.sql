-- Database schema untuk ListrikKu
-- Jalankan script ini di phpMyAdmin untuk membuat database dan tabel

CREATE DATABASE IF NOT EXISTS electricity_tracker;
USE electricity_tracker;

-- Tabel untuk user management
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP NULL,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel untuk user sessions
CREATE TABLE user_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel untuk user preferences
CREATE TABLE user_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  theme ENUM('light', 'dark', 'system') DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'id',
  currency VARCHAR(10) DEFAULT 'IDR',
  timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_preferences (user_id)
);

-- Tabel untuk menyimpan pengaturan harga listrik
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

-- Tabel untuk menyimpan pencatatan meteran
CREATE TABLE IF NOT EXISTS meter_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reading_date DATE NOT NULL,
    meter_value INT NOT NULL,
    previous_reading INT NOT NULL DEFAULT 0,
    usage_kwh INT NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reading_date (reading_date),
    INDEX idx_meter_value (meter_value),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel untuk menyimpan riwayat perhitungan detail
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

-- Tabel untuk menyimpan pengaturan aplikasi
CREATE TABLE IF NOT EXISTS app_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert data default untuk pengaturan listrik (tarif PLN)
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

-- Tabel untuk budget planning
CREATE TABLE budget_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  monthly_budget DECIMAL(10,2) NOT NULL,
  target_usage_kwh INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel untuk budget tracking
CREATE TABLE budget_tracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  budget_plan_id INT NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  actual_usage_kwh INT DEFAULT 0,
  actual_cost DECIMAL(10,2) DEFAULT 0.00,
  budget_remaining DECIMAL(10,2) DEFAULT 0.00,
  usage_percentage DECIMAL(5,2) DEFAULT 0.00,
  cost_percentage DECIMAL(5,2) DEFAULT 0.00,
  status ENUM('on_track', 'over_budget', 'under_budget') DEFAULT 'on_track',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_plan_id) REFERENCES budget_plans(id) ON DELETE CASCADE,
  UNIQUE KEY unique_budget_month (budget_plan_id, month_year)
);

-- Tabel untuk budget alerts
CREATE TABLE budget_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  budget_plan_id INT NOT NULL,
  alert_type ENUM('usage_warning', 'cost_warning', 'budget_exceeded') NOT NULL,
  threshold_percentage DECIMAL(5,2) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_plan_id) REFERENCES budget_plans(id) ON DELETE CASCADE
);

-- Insert pengaturan aplikasi default
INSERT INTO app_settings (setting_key, setting_value, setting_type, description) VALUES
('default_tariff_id', '1', 'number', 'ID tarif listrik default yang digunakan'),
('currency_symbol', 'Rp', 'string', 'Simbol mata uang yang digunakan'),
('date_format', 'DD/MM/YYYY', 'string', 'Format tanggal yang digunakan'),
('enable_notifications', 'true', 'boolean', 'Aktifkan notifikasi'),
('low_usage_threshold', '100', 'number', 'Batas bawah penggunaan kWh untuk peringatan'),
('high_usage_threshold', '500', 'number', 'Batas atas penggunaan kWh untuk peringatan'),
('app_version', '1.0.0', 'string', 'Versi aplikasi saat ini');

-- Insert default budget plan
INSERT INTO budget_plans (name, monthly_budget, target_usage_kwh, start_date, description) VALUES
('Budget Listrik Rumah', 500000.00, 200, CURDATE(), 'Budget default untuk penggunaan listrik rumah tangga');

-- Insert default budget alerts
INSERT INTO budget_alerts (budget_plan_id, alert_type, threshold_percentage, message) VALUES
(1, 'usage_warning', 80.00, 'Penggunaan listrik sudah mencapai 80% dari target bulanan'),
(1, 'cost_warning', 80.00, 'Biaya listrik sudah mencapai 80% dari budget bulanan'),
(1, 'budget_exceeded', 100.00, 'Budget listrik bulanan sudah terlampaui!');
