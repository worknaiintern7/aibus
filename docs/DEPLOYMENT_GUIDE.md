# 🚀 AI Bus Production Deployment Guide (Docker + CI/CD + VPS + Domain & SSL)

यह गाइड आपको AI Bus प्रोजेक्ट को **Docker**, **GitHub Actions (CI/CD)**, और **Ubuntu VPS** पर कस्टम डोमेन और फ्री SSL (HTTPS) के साथ लाइव डिप्लॉय करने का पूरा स्टेप-बाय-स्टेप तरीका समझाता है।

---

## 🏗️ 1. Architecture Overview (आर्किटेक्चर)

```
[ User Browser / Mobile ]
         │
         ▼
[ DNS: Cloudflare / Namecheap / GoDaddy ]
         │
         ▼ (Port 80 / 443 HTTPS)
┌─────────────────────────────────────────────────────────────┐
│ VPS Host Server (Ubuntu 22.04 / 24.04 LTS)                  │
│                                                             │
│   [ Host Nginx Reverse Proxy + Let's Encrypt SSL ]          │
│          │                   │                  │           │
│          ▼                   ▼                  ▼           │
│   (Port 3000)         (Port 3001)        (Port 8080)        │
│   ┌─────────────┐     ┌─────────────┐    ┌─────────────┐    │
│   │  Customer   │     │    Admin    │    │   Backend   │    │
│   │ React (Vite)│     │ React (Vite)│    │ Spring Boot │    │
│   │   (Nginx)   │     │   (Nginx)   │    │  (Java 21)  │    │
│   └─────────────┘     └─────────────┘    └──────┬──────┘    │
│                                                 │           │
│                                                 ▼           │
│                                         ┌─────────────┐     │
│                                         │ PostgreSQL  │     │
│                                         │ (Port 5432) │     │
│                                         └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 2. Step 1: Domain DNS Setup (डोमेन कॉन्फ़िगरेशन)

अपने डोमेन प्रोवाइडर (Cloudflare, Namecheap, GoDaddy, Hostinger आदि) के DNS Management में जाएं और नीचे दिए गए `A Records` ऐड करें:

| Type | Name / Host | Value (Points to) | TTL | Description |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (या root domain) | `YOUR_VPS_IP` | Auto / 1 min | Main Customer Frontend |
| **A** | `www` | `YOUR_VPS_IP` | Auto / 1 min | WWW Customer Frontend |
| **A** | `admin` | `YOUR_VPS_IP` | Auto / 1 min | Admin Dashboard |
| **A** | `api` | `YOUR_VPS_IP` | Auto / 1 min | Spring Boot Backend API |

> 💡 **उदाहरण**: अगर आपका डोमेन `aibusbooking.com` है:
> - Customer Website: `https://aibusbooking.com`
> - Admin Panel: `https://admin.aibusbooking.com`
> - Backend API: `https://api.aibusbooking.com`

---

## 🖥️ 3. Step 2: VPS Server Setup (सर्वर सेटअप)

### 3.1 VPS में SSH लॉगिन करें:
```bash
ssh root@YOUR_VPS_IP
```

### 3.2 Automated Setup Script चलाएं:
प्रोजेक्ट में `deploy/setup-vps.sh` स्क्रिप्ट दी गई है, जो अपने आप Docker, Nginx, UFW Firewall, और Certbot इनस्टॉल कर देगी।

सर्वर पर सीधे रन करें:
```bash
# पैकेज अपडेट करें और git इनस्टॉल करें
sudo apt update && sudo apt install -y git curl

# प्रोजेक्ट को /var/www/aibus पर क्लोन करें
sudo mkdir -p /var/www/aibus
sudo chown -R $USER:$USER /var/www/aibus
git clone https://github.com/worknaiintern7/aibus.git /var/www/aibus

# सेटअप स्क्रिप्ट को executable बनाकर रन करें
cd /var/www/aibus
chmod +x deploy/setup-vps.sh
./deploy/setup-vps.sh
```

---

## ⚙️ 4. Step 3: Production Environment File (`.env`)

`/var/www/aibus/.env` फाइल बनाएं या एडिट करें:

```bash
cd /var/www/aibus
cp .env.production.example .env
nano .env
```

`.env` में अपनी वास्तविक वैल्यूज भरें:
```ini
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=aibus_db
DB_USER=postgres
DB_PASSWORD=YourSuperStrongPassword123!

# AI Bus Provider Credentials
AIBUS_AUTH_URL=https://partnerapi.iamgds.com/ota/v1/Auth
AIBUS_CLIENT_ID=50
AIBUS_CLIENT_SECRET=d66de12fa3473a93415b02494253f088

# Allowed CORS Origins (आपके डोमेन)
ALLOWED_ORIGINS=https://aibusbooking.com,https://www.aibusbooking.com,https://admin.aibusbooking.com

# Frontend API Base URL (Build Time)
VITE_CUSTOMER_API_BASE_URL=https://api.aibusbooking.com
VITE_ADMIN_API_BASE_URL=https://api.aibusbooking.com
```
Save करने के लिए: `Ctrl + O`, `Enter`, और बंद करने के लिए `Ctrl + X` दबाएं।

---

## 🐳 5. Step 4: First Docker Build & Run (डॉकर कंटेनर्स चालू करें)

```bash
cd /var/www/aibus

# कंटेनर्स बिल्ड और स्टार्ट करें
docker compose up -d --build

# चेक करें सभी 4 कंटेनर्स चल रहे हैं या नहीं
docker compose ps
```

आपको 4 कंटेनर्स दिखेंगे:
1. `aibus-postgres` (healthy, port 5432)
2. `aibus-backend` (port 8080)
3. `aibus-customer` (port 3000)
4. `aibus-admin` (port 3001)

Logs चेक करने के लिए:
```bash
docker compose logs -f backend
```

---

## 🔒 6. Step 5: VPS Host Nginx & Free SSL (Let's Encrypt)

अब VPS के मेन Nginx में रिवर्स प्रॉक्सी सेट करेंगे ताकि डोमेन से ट्रैफिक कंटेनर तक पहुंचे।

### 6.1 Nginx कॉन्फ़िगरेशन बनाएं:
```bash
sudo nano /etc/nginx/sites-available/aibus.conf
```

नीचे दिया गया कोड पेस्ट करें (अपने डोमेन नाम से `yourdomain.com` को रिप्लेस करें):

```nginx
# 1. Customer Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 2. Admin Dashboard
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 3. Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
        proxy_connect_timeout 90;
    }
}
```

### 6.2 कॉन्फ़िगरेशन इनेबल करें और Nginx टेस्ट करें:
```bash
# डिफ़ॉल्ट कॉन्फ़िग हटाएं (यदि हो)
sudo rm -f /etc/nginx/sites-enabled/default

# aibus.conf को enable करें
sudo ln -s /etc/nginx/sites-available/aibus.conf /etc/nginx/sites-enabled/

# Nginx सिंटैक्स टेस्ट करें
sudo nginx -t

# Nginx रीलोड करें
sudo systemctl reload nginx
```

### 6.3 Free SSL (HTTPS) इनस्टॉल करें (Certbot):
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com -d api.yourdomain.com
```
Certbot आपसे ईमेल पूछेगा और अपने आप SSL Certificate जेनरेट करके HTTPS कॉन्फ़िगर कर देगा। SSL ऑटो-रिन्यूअल भी अपने आप सेटअप हो जाता है।

---

## 🤖 7. Step 6: GitHub Actions CI/CD Setup (ऑटोमेटिक डिप्लॉयमेंट)

प्रोजेक्ट में पहले से ही 2 वर्कफ़्लोज़ ऐड कर दिए गए हैं:
1. `.github/workflows/ci.yml`: कोड पुश होने पर Backend, Customer, और Admin का बिल्ड टेस्ट करता है।
2. `.github/workflows/deploy.yml`: `main` ब्रांच में कोड पुश होते ही VPS में ऑटोमेटिकली SSH करके डिप्लॉय करता है।

### 7.1 VPS पर SSH Key जेनरेट करें (यदि पहले से नहीं है):
अपने लोकल कंप्यूटर या VPS पर:
```bash
ssh-keygen -t ed25519 -C "github-actions-aibus"
```
Enter दबाते जाएं (बिना पासवर्ड के)।
- Public Key (`~/.ssh/id_ed25519.pub`) को VPS के `~/.ssh/authorized_keys` में ऐड करें:
  ```bash
  cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  ```
- Private Key (`~/.ssh/id_ed25519`) का कंटेंट कॉपी करें:
  ```bash
  cat ~/.ssh/id_ed25519
  ```

### 7.2 GitHub Repository Secrets ऐड करें:
GitHub में अपने रेपो (`worknaiintern7/aibus`) पर जाएं:
`Settings` ➔ `Secrets and variables` ➔ `Actions` ➔ `New repository secret` दबाएं और निम्नलिखित सीक्रेट्स जोड़ें:

1. `VPS_HOST`: आपके VPS का पब्लिक IP (जैसे `123.45.67.89`)
2. `VPS_USER`: SSH यूजरनेम (जैसे `root` या `ubuntu`)
3. `VPS_SSH_KEY`: आपकी Private Key (पूरा `-----BEGIN OPENSSH PRIVATE KEY-----` से `-----END OPENSSH PRIVATE KEY-----` तक)
4. `VPS_PORT`: `22` (अगर कस्टम पोर्ट है तो वह डालें)
5. `VPS_APP_DIR`: `/var/www/aibus`

🎉 **अब जब भी आप GitHub पर `git push origin main` करेंगे, GitHub Actions अपने आप VPS पर नया कोड पुल करके Docker रीबिल्ड कर देगा!**

---

## 🛠️ 8. Useful Commands & Maintenance (जरूरी कमांड्स)

| कार्य | कमांड |
| :--- | :--- |
| **सभी कंटेनर्स का स्टेटस देखना** | `docker compose ps` |
| **Backend के लाइव लॉग्स देखना** | `docker compose logs -f backend` |
| **कंटेनर्स रीस्टार्ट करना** | `docker compose restart` |
| **नया कोड मैन्युअली अपडेट करना** | `git pull && docker compose up -d --build` |
| **Nginx रीलोड करना** | `sudo systemctl reload nginx` |
| **SSL रिन्यूअल टेस्ट करना** | `sudo certbot renew --dry-run` |
| **अनयूज्ड डॉकर कैश साफ करना** | `docker system prune -af` |

---

## ❓ 9. Troubleshooting (समस्या समाधान)

### 1. CORS Error:
- सुनिश्चित करें कि `.env` में `ALLOWED_ORIGINS` में आपका फ्रंटएंड डोमेन (उदा. `https://yourdomain.com`) शामिल है।
- बैकएंड रीस्टार्ट करें: `docker compose restart backend`.

### 2. 502 Bad Gateway:
- इसका मतलब है Nginx चल रहा है लेकिन डॉकर कंटेनर अभी चालू नहीं हुआ या क्रैश हो गया।
- चेक करें: `docker compose ps` और `docker compose logs backend`.

### 3. Database Connection Failure:
- `docker-compose.yml` में PostgreSQL के लिए healthcheck मौजूद है, जिससे Backend डेटाबेस के पूरी तरह रेडी होने के बाद ही शुरू होता है।
- पासवर्ड मैच चेक करें: root `.env` में `DB_PASSWORD`.
