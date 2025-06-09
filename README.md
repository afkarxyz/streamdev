## 🚀 Quick Install

### Step 1: Download Script
```bash
curl -o install.sh https://raw.githubusercontent.com/afkarxyz/streamdev/main/install.sh
```

### Step 2: Run Installation
```bash
chmod +x install.sh
./install.sh
```

### Step 3: Access Application
- Open browser: `http://YOUR_SERVER_IP:7575`
- Create username & password
- **Sign out** after login
- Restart app: `pm2 restart streamflow`

---

## 📋 Essential Commands

### Application Management
```bash
pm2 status                 # Check app status
pm2 restart streamflow     # Restart application
pm2 stop streamflow        # Stop application
pm2 logs streamflow        # View logs
```

### Reset Password
```bash
cd streamdev
node reset-password.js
```
