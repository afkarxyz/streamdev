## 🚀 Quick Install [StreamFlow](https://github.com/bangtutorial/streamflow)

### Installation
```bash
curl -o install.sh https://raw.githubusercontent.com/afkarxyz/streamdev/main/install.sh && chmod +x install.sh && ./install.sh
```

### Access Application
- Open browser: `http://YOUR_SERVER_IP:7575`
- Create username & password
- **Sign out** after login
- Restart app: `pm2 restart streamflow`

### Reset Password
```bash
cd streamdev && node reset-password.js
```
## 🚀 Changelog

### 🖥️ Dashboard

* 🔔 **Notifikasi:** Sekarang menampilkan riwayat commit dari repositori.
* ⚙️ **Refine Modal New Stream:**

  * 📍 Dropdown pemilihan video diratakan ke kiri.
  * 🔄 Mengubah posisi fitur "Loop Video".
  * 🔧 "Advanced Settings" sekarang menggunakan toggle. Akan muncul peringatan ketika diklik.
  * 🌐 Menambahkan informasi zona waktu, lokasi, dan IP.
* 📑 Menambahkan tab "Stream".
* ⏲️ Menambahkan fungsi timer pada fitur scheduled stream.
* 📱 Mengubah posisi status stream dan memperjelas warnanya pada tampilan mobile.

### 📁 Gallery

* 📌 Menambahkan informasi total video.
* 🗑️ Menambahkan tombol "Clear" untuk menghapus beberapa video sekaligus.
* 📤 Menambahkan fungsi batch upload untuk mengunggah banyak file sekaligus.
* 📈 Menambahkan overlay progress bar saat modal import Google Drive ditutup.
* ⌛ Menampilkan waktu upload/import file.
* 🔀 Mengubah sort menjadi toggle.
* 🐞 Memperbaiki bug informasi ukuran file di atas 1 GB dan paginasi yang sebelumnya kurang akurat.

### 📜 History

* 📌 Menambahkan informasi total video.
* 🗑️ Menambahkan tombol "Clear" untuk menghapus beberapa video sekaligus.
* 🎛️ Menambahkan ikon filter berdasarkan platform.
* ♻️ Menambahkan tombol untuk menggunakan ulang riwayat stream (reuse stream history).

### ⚙️ Settings

* ☁️ Menghapus penggunaan API import Google Drive, diganti dengan direct download.
* 🔐 Menambahkan validasi password pada pengaturan keamanan (security settings).

### 🌍 Global

* 🧹 Menghapus dependensi yang tidak terpakai, membersihkan kode yang tidak digunakan, dan memperbarui dependensi.
* 📊 Menambahkan halaman baru "Analytics" untuk memantau performa video tanpa perlu membuka YouTube Studio.
* 📢 Menambahkan halaman info perubahan update yang ditampilkan di atas foto profil.
* 🖱️ Ikon Streamflow sekarang dapat diklik.
* 💬 Semua pesan alert kini menggunakan custom modal yang seragam.
* 🐛 Memperbaiki bug minor.
