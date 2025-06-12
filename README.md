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
     
**Global**
- [ ] hapus unused code

## Screenshots

**Dashboard**
- [x] menambahkan countdown untuk schedule stream
- [x] menambahkan filter status stream
- [x] auto refresh page saat live dimulai

![image](https://github.com/user-attachments/assets/955ee49c-1c6e-4dba-859c-654bd164fa5c)

**Gallery, History, Analitycs**
- [x] tombol clear all
            
![image](https://github.com/user-attachments/assets/2369562a-39a8-4c53-996b-e21387891e1e)

**Gallery**

- [ ] tiles/details view
- [x] menambahkan info waktu upload
- [x] refine video player

![image](https://github.com/user-attachments/assets/907b979a-429d-44c2-bd41-63e372524a20)

**History**
- [x] reuse history stream
- [ ] responsive view

![image](https://github.com/user-attachments/assets/0d8b60fe-7eb3-4afd-bdca-35ca39abbbde)
