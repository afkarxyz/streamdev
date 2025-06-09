#!/bin/bash

# StreamFlow Auto Installer Script
# Script untuk instalasi otomatis StreamFlow di VPS

set -e  # Exit jika ada error

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fungsi untuk print dengan warna
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Header
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   StreamFlow Auto Installer    ${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Konfirmasi sebelum instalasi
read -p "Apakah Anda ingin melanjutkan instalasi StreamFlow? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Instalasi dibatalkan."
    exit 1
fi

print_status "Memulai instalasi StreamFlow..."

# 1. Update sistem
print_status "Updating sistem..."
sudo apt update && sudo apt upgrade -y
print_success "Sistem berhasil diupdate"

# 2. Install Node.js
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
print_success "Node.js berhasil diinstall"

# Verifikasi Node.js
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js version: $NODE_VERSION"
print_success "NPM version: $NPM_VERSION"

# 3. Install FFmpeg
print_status "Installing FFmpeg..."
sudo apt install ffmpeg -y
FFMPEG_VERSION=$(ffmpeg -version | head -n 1)
print_success "FFmpeg berhasil diinstall: $FFMPEG_VERSION"

# 4. Install Git
print_status "Installing Git..."
sudo apt install git -y
GIT_VERSION=$(git --version)
print_success "Git berhasil diinstall: $GIT_VERSION"

# 5. Clone StreamFlow repository
print_status "Cloning StreamFlow repository..."
if [ -d "streamflow" ]; then
    print_warning "Folder streamflow sudah ada. Menghapus folder lama..."
    rm -rf streamflow
fi
git clone https://github.com/bangtutorial/streamflow
print_success "Repository berhasil di-clone"

# 6. Masuk ke folder dan install dependencies
print_status "Installing dependencies..."
cd streamflow
npm install
print_success "Dependencies berhasil diinstall"

# 7. Generate session secret
print_status "Generating session secret..."
npm run generate-secret
print_success "Session secret berhasil di-generate"

# 8. Setup port (opsional)
echo ""
print_status "Konfigurasi Port"
read -p "Apakah Anda ingin mengubah port default (7575)? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Masukkan port yang diinginkan: " NEW_PORT
    if [[ $NEW_PORT =~ ^[0-9]+$ ]] && [ $NEW_PORT -ge 1024 ] && [ $NEW_PORT -le 65535 ]; then
        sed -i "s/PORT=7575/PORT=$NEW_PORT/" .env
        print_success "Port berhasil diubah ke $NEW_PORT"
        FINAL_PORT=$NEW_PORT
    else
        print_error "Port tidak valid. Menggunakan port default (7575)"
        FINAL_PORT=7575
    fi
else
    FINAL_PORT=7575
    print_status "Menggunakan port default: $FINAL_PORT"
fi

# 9. Setup timezone
echo ""
print_status "Setup Timezone"
print_status "Timezone saat ini: $(timedatectl show --property=Timezone --value)"
read -p "Apakah Anda ingin mengubah timezone ke Asia/Jakarta (WIB)? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo timedatectl set-timezone Asia/Jakarta
    print_success "Timezone berhasil diubah ke Asia/Jakarta"
else
    print_status "Timezone tidak diubah"
fi

# 10. Setup firewall
print_status "Setting up firewall..."
sudo ufw allow $FINAL_PORT
sudo ufw --force enable
print_success "Firewall berhasil dikonfigurasi untuk port $FINAL_PORT"

# 11. Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2
print_success "PM2 berhasil diinstall"

# 12. Start aplikasi dengan PM2
print_status "Starting StreamFlow dengan PM2..."
pm2 start app.js --name streamflow
print_success "StreamFlow berhasil dijalankan dengan PM2"

# 13. Setup PM2 startup
print_status "Setting up PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME
pm2 save
print_success "PM2 startup berhasil dikonfigurasi"

# Informasi akhir
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}   INSTALASI SELESAI!           ${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
print_success "StreamFlow berhasil diinstall dan berjalan!"
echo ""
print_status "Informasi Akses:"
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "IP_SERVER")
echo -e "   URL: ${YELLOW}http://$SERVER_IP:$FINAL_PORT${NC}"
echo ""
print_status "Langkah selanjutnya:"
echo "   1. Buka URL di browser"
echo "   2. Buat username dan password"
echo "   3. Sign out setelah masuk dashboard"
echo "   4. Jalankan: pm2 restart streamflow"
echo ""
print_status "Command berguna:"
echo "   - Cek status: pm2 status"
echo "   - Restart app: pm2 restart streamflow"
echo "   - Stop app: pm2 stop streamflow"
echo "   - Lihat logs: pm2 logs streamflow"
echo "   - Reset password: cd streamflow && node reset-password.js"
echo ""
print_warning "CATATAN: Jangan lupa restart aplikasi setelah membuat akun pertama!"
echo -e "${GREEN}================================${NC}"
