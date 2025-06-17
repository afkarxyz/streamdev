## ⚡ Quick Install [StreamFlow](https://github.com/bangtutorial/streamflow)

### Installation
```bash
curl -o install.sh https://raw.githubusercontent.com/afkarxyz/streamdev/main/install.sh && chmod +x install.sh && ./install.sh
```

### Access Application
- Open browser: `http://YOUR_SERVER_IP:7575`
- Create username & password
- **Sign out** after login

### Reset Password
```bash
cd streamdev && node reset-password.js
```

### Extract Logs
```bash
cd ~/streamdev/logs && curl -F'file=@app.log' https://0x0.st
```
## 🔖 Changelog: 17-06-2025

* Menambahkan Logs.
* Tampilan lebih minimalis.
* Memperbaiki bug broken thumbnail dari import Google Drive.
  
## 🔖 Changelog: [15-06-2025](https://github.com/afkarxyz/streamdev/tree/f8e9fdcd88264a5d1ca02f508d5d266a5e14fd20)

🖥️ Dashboard

* Notifikasi: Sekarang menampilkan riwayat commit dari repositori.
* Refine Modal New Stream:
  * Dropdown pemilihan video diratakan ke kiri.
  * Mengubah posisi fitur "Loop Video".
  * "Advanced Settings" sekarang menggunakan toggle. Akan muncul peringatan ketika diklik.
  * Menambahkan informasi zona waktu, lokasi, dan IP.
* Menambahkan tab pada "Streaming Status".
* Menambahkan fungsi timer pada scheduled stream.
* Mengubah posisi status stream dan memperjelas warnanya pada tampilan mobile.

📁 Gallery

* Menambahkan informasi total video.
* Menambahkan tombol "Clear" untuk menghapus semua video sekaligus.
* Menambahkan fungsi batch upload untuk mengunggah banyak file sekaligus.
* Menambahkan overlay progress bar saat import Google Drive ditutup.
* Menampilkan waktu upload/import file.
* Mengubah sort menjadi toggle.
* Memperbaiki bug informasi ukuran file di atas 1 GB dan paginasi yang sebelumnya kurang akurat.

📜 History

* Menambahkan informasi total video.
* Menambahkan tombol "Clear" untuk menghapus semua video sekaligus.
* Menambahkan ikon filter berdasarkan platform.
* Menambahkan tombol untuk menggunakan ulang riwayat stream (reuse stream history).

⚙️ Settings

* Menghapus penggunaan API import Google Drive, diganti dengan direct download.
* Menambahkan validasi password pada pengaturan keamanan (security settings).

🌍 Global

* Menghapus dependensi yang tidak terpakai, membersihkan kode yang tidak digunakan, dan memperbarui dependensi.
* Menambahkan halaman baru "Analytics" untuk memantau performa video tanpa perlu membuka YouTube Studio.
* Menambahkan halaman info perubahan update yang terletak di atas foto profil.
* Ikon Streamflow sekarang dapat diklik.
* Semua pesan alert kini menggunakan custom modal yang seragam.
* Memperbaiki bug.
