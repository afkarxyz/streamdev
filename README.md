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

**Gallery**

- [ ] tiles/details view
- [x] menambahkan info waktu upload
- [x] refine video player
      
**History**
- [ ] reuse history stream
- [ ] responsive view

**Global**
- [ ] hapus unused code

## Screenshots

**Dashboard**

![image](https://github.com/user-attachments/assets/955ee49c-1c6e-4dba-859c-654bd164fa5c)

- [x] menambahkan countdown untuk schedule stream
- [x] menambahkan filter status stream
- [x] auto refresh page saat live dimulai

**Gallery, History, Analitycs**
      
![image](https://github.com/user-attachments/assets/2369562a-39a8-4c53-996b-e21387891e1e)

- [x] tombol clear all
