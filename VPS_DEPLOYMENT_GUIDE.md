# 🚀 Panduan Deploy Aplikasi Electricity Tracker PWA ke VPS

Panduan lengkap untuk mendeploy aplikasi Next.js PWA ke VPS dengan domain pribadi.

## 📋 Prasyarat

- VPS dengan Ubuntu 20.04/22.04 (minimal 1GB RAM, 1 CPU core)
- Domain pribadi yang sudah diarahkan ke IP VPS
- Akses SSH ke VPS
- File aplikasi yang sudah siap

## 🛠️ Langkah 1: Setup VPS

### 1.1 Update Sistem
```bash
# SSH ke VPS
ssh your_username@your_vps_ip

# Update sistem
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Node.js
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifikasi instalasi
node --version
npm --version
```

### 1.3 Install PM2 (Process Manager)
```bash
# Install PM2 secara global
sudo npm install -g pm2

# Setup PM2 untuk startup
pm2 startup
sudo env PATH=$PATH:/usr/bin $(which pm2) startup systemd -u your_username --hp /home/your_username
```

### 1.4 Install Nginx
```bash
# Install Nginx
sudo apt install nginx -y

# Start dan enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Cek status
sudo systemctl status nginx
```

### 1.5 Install MySQL
```bash
# Install MySQL Server
sudo apt install mysql-server -y

# Secure MySQL installation
sudo mysql_secure_installation

# Start dan enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

## 🗄️ Langkah 2: Setup Database

### 2.1 Konfigurasi MySQL
```bash
# Login ke MySQL sebagai root
sudo mysql -u root -p

# Buat database dan user
CREATE DATABASE electricity_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'electricity_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON electricity_tracker.* TO 'electricity_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.2 Import Schema Database
```bash
# Upload schema.sql ke VPS
scp database/schema.sql your_username@your_vps_ip:/tmp/

# SSH ke VPS dan import schema
ssh your_username@your_vps_ip
mysql -u electricity_user -p electricity_tracker < /tmp/schema.sql
```

## 📁 Langkah 3: Deploy Aplikasi

### 3.1 Upload Aplikasi ke VPS
```bash
# Buat direktori aplikasi
mkdir -p /home/your_username/electricity-tracker
cd /home/your_username/electricity-tracker

# Upload file aplikasi (gunakan SCP, SFTP, atau Git)
# Opsi 1: Upload via SCP
scp -r . your_username@your_vps_ip:/home/your_username/electricity-tracker/

# Opsi 2: Clone dari Git (jika sudah di repository)
git clone https://github.com/your-username/electricity-tracker-pwa.git .
```

### 3.2 Install Dependencies
```bash
# Install dependencies
npm install

# Build aplikasi untuk production
npm run build
```

### 3.3 Konfigurasi Environment Variables
```bash
# Buat file .env.local
nano .env.local
```

Isi dengan konfigurasi production:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=electricity_user
DB_PASSWORD=your_strong_password
DB_NAME=electricity_tracker
DB_PORT=3306

# Next.js Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Electricity Tracker PWA
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

### 3.4 Jalankan dengan PM2
```bash
# Buat file ecosystem.config.js
nano ecosystem.config.js
```

Isi dengan konfigurasi PM2:
```javascript
module.exports = {
  apps: [{
    name: 'electricity-tracker',
    script: 'npm',
    args: 'start',
    cwd: '/home/your_username/electricity-tracker',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
# Start aplikasi dengan PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Cek status
pm2 status
pm2 logs electricity-tracker
```

## 🌐 Langkah 4: Konfigurasi Nginx

### 4.1 Buat Konfigurasi Nginx
```bash
# Buat file konfigurasi untuk domain
sudo nano /etc/nginx/sites-available/electricity-tracker
```

Isi dengan konfigurasi:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (akan diisi setelah setup SSL)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Service Worker
    location /sw.js {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "no-cache";
        proxy_cache_bypass $http_pragma;
        proxy_cache_revalidate on;
        expires off;
        access_log off;
    }

    # PWA manifest
    location /site.webmanifest {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

### 4.2 Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/electricity-tracker /etc/nginx/sites-enabled/

# Test konfigurasi Nginx
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔒 Langkah 5: Setup SSL Certificate

### 5.1 Install Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Generate SSL Certificate
```bash
# Generate certificate untuk domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🔧 Langkah 6: Konfigurasi Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH, HTTP, dan HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Cek status
sudo ufw status
```

## 📊 Langkah 7: Monitoring dan Maintenance

### 7.1 Setup Log Rotation
```bash
# Buat file log rotation untuk PM2
sudo nano /etc/logrotate.d/electricity-tracker
```

Isi dengan:
```
/home/your_username/electricity-tracker/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 your_username your_username
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 7.2 Setup Backup Script
```bash
# Buat script backup
nano /home/your_username/backup.sh
```

Isi dengan:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/your_username/backups"
APP_DIR="/home/your_username/electricity-tracker"

# Buat direktori backup
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u electricity_user -p electricity_tracker > $BACKUP_DIR/database_$DATE.sql

# Backup aplikasi
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C $APP_DIR .

# Hapus backup lama (lebih dari 7 hari)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Buat executable
chmod +x /home/your_username/backup.sh

# Setup cron job untuk backup harian
crontab -e
```

Tambahkan baris ini:
```
0 2 * * * /home/your_username/backup.sh
```

## 🚀 Langkah 8: Testing dan Verifikasi

### 8.1 Test Aplikasi
```bash
# Cek status PM2
pm2 status

# Cek log aplikasi
pm2 logs electricity-tracker

# Cek status Nginx
sudo systemctl status nginx

# Cek status MySQL
sudo systemctl status mysql
```

### 8.2 Test dari Browser
1. Buka `https://yourdomain.com`
2. Test semua fitur aplikasi
3. Cek PWA functionality (install, offline mode)
4. Test responsive design di mobile

## 🔧 Troubleshooting

### Aplikasi Tidak Bisa Diakses
```bash
# Cek log PM2
pm2 logs electricity-tracker

# Cek log Nginx
sudo tail -f /var/log/nginx/error.log

# Restart aplikasi
pm2 restart electricity-tracker

# Restart Nginx
sudo systemctl restart nginx
```

### Database Connection Error
```bash
# Test koneksi database
mysql -u electricity_user -p electricity_tracker

# Cek status MySQL
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql
```

### SSL Certificate Issues
```bash
# Cek status certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL
openssl s_client -connect yourdomain.com:443
```

## 📱 PWA Configuration

Pastikan PWA berfungsi dengan baik:

1. **Service Worker**: Cek di browser DevTools > Application > Service Workers
2. **Manifest**: Cek di browser DevTools > Application > Manifest
3. **Offline Mode**: Test dengan mematikan internet
4. **Install Prompt**: Test install ke home screen

## 🔄 Update Aplikasi

Untuk update aplikasi:

```bash
# Pull perubahan terbaru
git pull origin main

# Install dependencies baru
npm install

# Build ulang
npm run build

# Restart aplikasi
pm2 restart electricity-tracker
```

## 📈 Performance Optimization

### 1. Enable Gzip Compression
Sudah dikonfigurasi di Nginx

### 2. Setup CDN (Opsional)
- Gunakan CloudFlare untuk CDN
- Upload static assets ke CDN

### 3. Database Optimization
```sql
-- Optimize database
OPTIMIZE TABLE users, meter_readings, budget_plans, budget_alerts;
```

## 🎯 Checklist Deployment

- [ ] VPS setup dengan Node.js, PM2, Nginx, MySQL
- [ ] Database dibuat dan schema diimport
- [ ] Aplikasi diupload dan dependencies diinstall
- [ ] Environment variables dikonfigurasi
- [ ] PM2 configuration dibuat dan aplikasi dijalankan
- [ ] Nginx reverse proxy dikonfigurasi
- [ ] SSL certificate diinstall
- [ ] Firewall dikonfigurasi
- [ ] Monitoring dan backup setup
- [ ] Testing aplikasi dari browser
- [ ] PWA functionality ditest

## 🆘 Support

Jika mengalami masalah:

1. Cek log aplikasi: `pm2 logs electricity-tracker`
2. Cek log Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Cek log MySQL: `sudo tail -f /var/log/mysql/error.log`
4. Restart services: `pm2 restart electricity-tracker && sudo systemctl restart nginx`

---

**Selamat! Aplikasi Electricity Tracker PWA Anda sudah berhasil di-deploy ke VPS dengan domain pribadi! 🎉**
