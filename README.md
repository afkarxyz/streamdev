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
## TODO

**Dashboard**
- [ ] fix waktu tidak sinkron saat edit schedule stream
- [ ] fix stream yang tiba-tiba start 1 menit sebelum waktu yang dijadwalkan, misal jadwal 16:30, ternyata start live di 16:29

**Gallery, History, Analitycs**
- [ ] tombol delete all/clear all video

**Gallery**
- [ ] reuse history stream
- [ ] tiles/details view
- [ ] menambahkan info waktu upload

**History**
- [ ] reuse history stream

**Global**
- [ ] hapus unused code

## Screenshots

![image](https://github.com/user-attachments/assets/65d9219b-891f-4825-8076-75da554ed653)

- [x] menambahkan countdown untuk schedule stream
- [x] menambahkan filter status stream
- [x] auto refresh page saat live dimulai
