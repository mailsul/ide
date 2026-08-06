# 🚀 Panduan Install di VPS Ubuntu (Pemula)

Panduan ini akan membimbing Anda dari VPS kosong hingga platform berjalan dengan benar.  
Baca setiap langkah dengan teliti — jangan skip.

---

## 📊 Status Instalasi Anda (Update: 6 Agustus 2026)

| Langkah | Status | Keterangan |
|---------|--------|------------|
| 1 — Koneksi SSH | ✅ Selesai | Login sebagai root |
| 2 — Setting DNS | ✅ Selesai | Domain: `premhub.site` |
| 3 — Update Ubuntu & Tools | ✅ Selesai | curl, git, wget, nano, ufw, htop |
| 4 — Firewall | ✅ Selesai | Port 22, 80, 443 terbuka |
| 5 — Docker | ✅ Selesai | Docker 29.7.1, Compose v5.4.0 |
| 6 — Buat Folder | ✅ Selesai | `/workspaces`, `/opt/platform/docker/traefik/dynamic` |
| 7 — Clone Project | ✅ Selesai | `/opt/platform` dari GitHub |
| 8 — File .env | ✅ Selesai | Sudah diedit dan direstart bersih |
| 9 — Build Workspace Image | ✅ Selesai | `platform/workspace-base:latest` |
| 10 — Jalankan Platform | ✅ Selesai | Semua 8 container `Up` |
| 11 — Migrasi Database | ✅ Selesai | `[✓] Changes applied` |
| 12 — SSL Certificate | ⚠️ Sebagian | `api.premhub.site` ✅, `www.premhub.site` ❌ |
| 13 — Verifikasi Platform | ✅ Selesai | `{"status":"ok"}` dari healthz |
| 14 — Akun Admin | ✅ Selesai | Admin dibuat via API |

---

## 🔴 Yang Masih Perlu Dilakukan

### 1. Fix SSL untuk `www.premhub.site`

**Masalah:** SSL untuk `www.premhub.site` gagal karena record `www` di-Proxy Cloudflare (icon orange). Let's Encrypt menggunakan TLS-ALPN-01 challenge yang tidak bisa menembus proxy Cloudflare.

**Solusi — Ubah `www` menjadi DNS Only di Cloudflare:**

1. Login ke Cloudflare dashboard
2. Pilih domain `premhub.site`
3. Buka tab **DNS**
4. Cari record CNAME untuk `www`
5. Klik edit → ubah **Proxy status** dari orange (Proxied) ke **abu-abu (DNS only)**
6. Simpan

Kemudian di VPS, reset SSL dan tunggu generate ulang:
```bash
cd /opt/platform

# Hapus certificate lama
docker run --rm -v platform_traefik_letsencrypt:/data alpine rm -f /data/acme.json

# Restart Traefik
docker compose up -d --force-recreate traefik

# Tunggu 3-5 menit, lalu cek
curl https://www.premhub.site
```

---

### 2. Verifikasi Login di Browser

Buka browser dan akses **https://premhub.site**

- Karena akun admin sudah dibuat via API, halaman yang muncul adalah **halaman Login** (bukan First-Run Setup)
- Login dengan:
  - **Email:** `maraazn069@gmail.com`
  - **Password:** password yang Anda gunakan saat register

Jika login berhasil → platform siap digunakan! 🎉

---

### 3. (Opsional) Perbaiki Password di .env ke Hex Murni

> ⚠️ Ini **opsional** — jika platform sudah bisa login dan berjalan normal, Anda tidak wajib melakukan ini sekarang. Tapi untuk keamanan jangka panjang, disarankan.

Saat ini `.env` masih memiliki:
- Password DB: `"intinya ini password"` (mengandung spasi)
- SESSION_SECRET: format base64 (mengandung `+`, `/`, `=`)

Jika ingin memperbaiki (ini akan **menghapus semua data dan user**):

```bash
cd /opt/platform

# Generate semua password baru (hex murni)
PLATFORM_DB_PASS=$(openssl rand -hex 32)
MYSQL_PASS=$(openssl rand -hex 32)
POSTGRES_PASS=$(openssl rand -hex 32)
SESSION=$(openssl rand -hex 64)

echo "Salin nilai-nilai ini:"
echo "PLATFORM_DB_PASS=$PLATFORM_DB_PASS"
echo "MYSQL_ROOT_PASSWORD=$MYSQL_PASS"
echo "POSTGRES_ROOT_PASSWORD=$POSTGRES_PASS"
echo "SESSION_SECRET=$SESSION"

# Edit .env dengan nilai baru
nano .env
```

Setelah edit, hapus data lama dan restart:
```bash
# PERINGATAN: Ini hapus semua data!
docker compose down -v
docker compose up -d --build

# Tunggu semua container Up (~30 detik)
sleep 30

# Jalankan ulang migrasi
docker compose exec backend sh -c "cd /app/lib/db && pnpm run push"

# Buat ulang akun admin
curl -X POST https://api.premhub.site/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"EMAIL_ANDA","password":"PASSWORD_BARU","fullName":"Admin"}'
```

---

## 📋 Yang Anda Butuhkan Sebelum Mulai

| Kebutuhan | Keterangan |
|-----------|------------|
| VPS Ubuntu 22.04 / 24.04 | Minimal 2 CPU, 4GB RAM, 50GB disk |
| Domain | Sudah dibeli (contoh: `myplatform.com`) |
| Akses SSH ke VPS | Username `root` atau sudo |
| DNS sudah diarahkan | Lihat Langkah 2 di bawah |

---

## LANGKAH 1 — Koneksi ke VPS via SSH

Di komputer Anda, buka **Terminal** (Mac/Linux) atau **PowerShell** (Windows):

```bash
ssh root@IP_VPS_ANDA
# Contoh: ssh root@123.456.789.10
```

> **Pertama kali login?** Ketik `yes` saat muncul pertanyaan "Are you sure you want to continue connecting?"

---

## LANGKAH 2 — Setting DNS Domain

> ⚠️ Lakukan ini DULU sebelum install apapun, karena SSL butuh DNS yang sudah aktif.

Di panel DNS domain Anda (Cloudflare, Namecheap, dll), tambahkan record berikut.  
Ganti `IP_VPS_ANDA` dengan IP VPS yang sebenarnya.

| Type | Name | Value | Proxy/TTL |
|------|------|-------|-----------|
| A | `@` | `IP_VPS_ANDA` | **DNS only** (abu-abu, bukan orange) |
| A | `api` | `IP_VPS_ANDA` | **DNS only** |
| A | `phpmyadmin` | `IP_VPS_ANDA` | **DNS only** |
| A | `pgadmin` | `IP_VPS_ANDA` | **DNS only** |
| A | `www` | `IP_VPS_ANDA` | **DNS only** ← PENTING: jangan Proxied! |
| CNAME | `*.preview` | `yourdomain.com` | Proxied ← untuk subdomain workspace |
| CNAME | `*` | `yourdomain.com` | Proxied ← untuk custom domain user |

> ⚠️ **PENTING untuk Cloudflare**: Semua A record (`@`, `api`, `phpmyadmin`, `pgadmin`, `www`) **HARUS** DNS only (icon abu-abu), bukan Proxied (orange). Jika Proxied diaktifkan, Let's Encrypt tidak bisa generate SSL certificate menggunakan TLS-ALPN-01 challenge.

> **Catatan:** Perubahan DNS bisa memakan waktu 5–30 menit untuk aktif.

---

## LANGKAH 3 — Update Ubuntu & Install Tools Dasar

Copy-paste perintah berikut ke terminal VPS Anda (satu blok sekaligus):

```bash
# Update sistem
apt update && apt upgrade -y

# Install tools yang dibutuhkan
apt install -y curl git wget nano ufw htop
```

---

## LANGKAH 4 — Atur Firewall

```bash
# Izinkan SSH (PENTING! Jangan skip ini atau Anda terkunci keluar)
ufw allow 22/tcp

# Izinkan HTTP dan HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Aktifkan firewall
ufw enable

# Cek status
ufw status
```

Output yang benar:
```
Status: active
To                  Action      From
--                  ------      ----
22/tcp              ALLOW       Anywhere
80/tcp              ALLOW       Anywhere
443/tcp             ALLOW       Anywhere
```

---

## LANGKAH 5 — Install Docker

```bash
# Download dan jalankan script install Docker resmi
curl -fsSL https://get.docker.com | sh

# Aktifkan Docker agar auto-start saat VPS reboot
systemctl enable --now docker

# Cek apakah Docker berhasil terinstall
docker --version
```

Output yang benar: `Docker version 29.x.x, build ...`

```bash
# Install Docker Compose plugin
apt install -y docker-compose-plugin

# Cek Docker Compose
docker compose version
```

Output yang benar: `Docker Compose version v2.x.x`

---

## LANGKAH 6 — Buat Folder untuk Data Workspace

```bash
# Folder ini menyimpan semua file user/workspace
mkdir -p /workspaces
chmod 755 /workspaces

# Folder untuk config Traefik dinamis
mkdir -p /opt/platform/docker/traefik/dynamic
```

---

## LANGKAH 7 — Clone Project dari GitHub

```bash
# Pindah ke folder /opt
cd /opt

# Clone project dari GitHub
git clone https://github.com/mailsul/ide.git platform

# Masuk ke folder project
cd platform

# Cek isinya
ls
```

---

## LANGKAH 8 — Buat File Konfigurasi (.env)

File `.env` berisi password dan konfigurasi rahasia platform Anda.

**Pertama, generate semua password yang dibutuhkan (jalankan satu per satu, catat hasilnya):**

```bash
# Generate password untuk database (hex murni, aman untuk URL)
echo "PLATFORM_DB_PASS:" && openssl rand -hex 32
echo "MYSQL_ROOT_PASSWORD:" && openssl rand -hex 32
echo "POSTGRES_ROOT_PASSWORD:" && openssl rand -hex 32
echo "PGADMIN_PASSWORD:" && openssl rand -hex 16
echo "SESSION_SECRET:" && openssl rand -hex 64
```

> ⚠️ **PENTING — Baca ini sebelum mengisi .env:**
> - Password **WAJIB** menggunakan output `openssl rand -hex` (hanya huruf a-f dan angka 0-9)
> - **JANGAN** gunakan `openssl rand -base64` — hasilnya mengandung `+`, `/`, `=` yang merusak DATABASE_URL
> - **JANGAN** isi manual seperti "mypassword123" atau "intinya ini password" — spasi dan karakter khusus akan membuat backend tidak bisa terhubung ke database
> - Jika password salah, backend akan jalan (healthz OK) tapi **tidak bisa buat akun** ("Failed to complete setup")

```bash
# Salin template
cp .env.example .env

# Buka untuk diedit
nano .env
```

Di editor `nano`, edit setiap baris dengan nilai yang sudah digenerate:

```
DOMAIN=yourdomain.com                    ← Ganti dengan domain Anda (tanpa https://)
ACME_EMAIL=email@anda.com               ← Email untuk sertifikat SSL

PLATFORM_DB_PASS=abc123def456...        ← Hasil openssl rand -hex 32 (HANYA hex!)
MYSQL_ROOT_PASSWORD=abc123def456...     ← Hasil openssl rand -hex 32 yang berbeda
POSTGRES_ROOT_PASSWORD=abc123def456...  ← Hasil openssl rand -hex 32 yang berbeda
SESSION_SECRET=abc123def456...          ← Hasil openssl rand -hex 64 (HANYA hex!)
PGADMIN_EMAIL=admin@domain.com          ← Email untuk login pgAdmin
PGADMIN_PASSWORD=abc123def456...        ← Hasil openssl rand -hex 16
```

Setelah selesai edit, simpan di `nano`:
- Tekan `Ctrl + X`
- Tekan `Y`
- Tekan `Enter`

**Verifikasi file .env sudah benar (tidak boleh ada spasi di nilai password):**
```bash
cat .env
```

Contoh output yang BENAR:
```
PLATFORM_DB_PASS=3f8a1b2c4d5e6f7a8b9c0d1e2f3a4b5c
SESSION_SECRET=1a2b3c4d5e6f...panjang 128 karakter...
```

Contoh output yang SALAH (jangan seperti ini!):
```
PLATFORM_DB_PASS=intinya ini password   ← ADA SPASI, akan rusak!
SESSION_SECRET=YoVOP5Rw...w==           ← Ada +/=, gunakan hex!
```

---

## LANGKAH 9 — Build Docker Base Image Workspace

Image ini akan dipakai untuk setiap workspace user (berisi Node.js, Python, PHP, dll):

```bash
# Build base image (proses ini 5–15 menit, tergantung internet VPS)
docker build -t platform/workspace-base:latest docker/workspace-base/

# Cek apakah image berhasil dibuat
docker images | grep platform
```

---

## LANGKAH 10 — Jalankan Platform

```bash
# Build semua service dan jalankan di background
# Proses ini 5–10 menit untuk pertama kali
docker compose up -d --build

# Pantau progress build
docker compose logs -f
```

> Tekan `Ctrl + C` untuk keluar dari log (service tetap berjalan).

**Cek semua service berjalan:**
```bash
docker compose ps
```

Output yang benar (semua harus `running` / `Up`):
```
NAME                    STATUS
platform-traefik        Up
platform-postgres       Up (healthy)
platform-mysql          Up
platform-postgres-ws    Up
platform-backend        Up
platform-frontend       Up
platform-phpmyadmin     Up
platform-pgadmin        Up
```

Jika ada yang `Restarting`, cek errornya:
```bash
docker compose logs nama-service
# Contoh: docker compose logs backend
```

---

## LANGKAH 11 — Setup Database Platform

```bash
# Jalankan migrasi database (buat semua tabel)
docker compose exec backend sh -c "cd /app/lib/db && pnpm run push"
```

Output yang benar:
```
[✓] Pulling schema from database...
[✓] Changes applied
```

---

## LANGKAH 12 — Tunggu SSL Certificate

Traefik akan otomatis generate SSL certificate untuk semua domain Anda via Let's Encrypt.  
Proses ini memakan waktu **2–5 menit**.

Cek status SSL:
```bash
docker compose logs traefik | grep -i "obtain\|certif\|acme" | tail -10
```

Verifikasi SSL sudah aktif:
```bash
# Harus berhasil TANPA error SSL
curl https://api.YOURDOMAIN.COM/api/healthz
# Output: {"status":"ok"}
```

---

## LANGKAH 13 — Verifikasi Platform Berjalan

Buka browser dan akses:

| URL | Yang Seharusnya Muncul |
|-----|----------------------|
| `https://yourdomain.com` | Halaman First-Run Setup |
| `https://api.yourdomain.com/api/healthz` | `{"status":"ok"}` |
| `https://phpmyadmin.yourdomain.com` | Halaman login phpMyAdmin |
| `https://pgadmin.yourdomain.com` | Halaman login pgAdmin |

> **SSL "Not Secure" masih muncul?** Tunggu 3–5 menit lalu refresh. SSL di-generate sekali saja.

---

## LANGKAH 14 — Buat Akun Admin Pertama

Buka `https://yourdomain.com` di browser.  
Platform akan otomatis menampilkan halaman **"First-Run Setup"**.

Isi:
- **Username**
- **Email**
- **Full Name** (opsional)
- **Password** (minimal 8 karakter)

Klik **"Complete Setup"** → Anda langsung masuk sebagai Admin.

> **Catatan:** Setelah akun admin dibuat, halaman setup tidak bisa diakses publik lagi.  
> Untuk tambah user baru: Admin Panel → Users → Tambah User.

---

## 🔧 Perintah Berguna Setelah Install

```bash
# Lihat semua container berjalan
docker compose ps

# Lihat log real-time semua service
docker compose logs -f

# Lihat log service tertentu
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f traefik

# Restart semua service
docker compose restart

# Restart service tertentu saja
docker compose restart backend

# Stop semua service
docker compose down

# Update platform (setelah git pull)
git pull
docker compose up -d --build

# Backup database
docker compose exec postgres pg_dump -U platform platform > backup_$(date +%Y%m%d).sql
```

---

## 🚨 Troubleshooting Umum

### ❌ Backend terus "Restarting"
Cek log backend:
```bash
docker compose logs backend --tail 30
```
Penyebab umum: `DATABASE_URL` tidak valid karena password mengandung karakter khusus (`@`, spasi, dll).  
**Fix**: Edit `.env`, ubah password menjadi hex murni (gunakan `openssl rand -hex 32`), lalu:
```bash
docker compose down && docker compose up -d
```

### ❌ SSL "Not Secure" / certificate error
- Pastikan **semua** A records DNS sudah **DNS only** (bukan Proxied) di Cloudflare — termasuk `www`
- Restart Traefik untuk trigger generate ulang cert:
```bash
docker run --rm -v platform_traefik_letsencrypt:/data alpine rm -f /data/acme.json
docker compose up -d --force-recreate traefik
```
- Tunggu 3–5 menit, cek: `curl https://api.YOURDOMAIN.COM/api/healthz`

### ❌ SSL www gagal dengan error "Cannot negotiate ALPN protocol"
Ini terjadi karena record `www` masih di-Proxy Cloudflare (orange). Let's Encrypt TLS-ALPN-01 tidak bisa menembus proxy Cloudflare.  
**Fix**: Di Cloudflare, ubah record `www` dari **Proxied** (orange) ke **DNS only** (abu-abu), lalu reset SSL seperti di atas.

### ❌ "404 page not found" di browser
Traefik tidak bisa baca Docker (Docker API version mismatch). Routes sudah dikonfigurasi via file statis.  
Cek: `docker compose logs traefik | tail -5`

### ❌ "Failed to complete setup" saat register admin

**Penyebab paling umum: password di .env mengandung spasi atau karakter khusus.**

Jika `PLATFORM_DB_PASS` berisi spasi (contoh: `intinya ini password`), maka `DATABASE_URL` yang terbentuk adalah:
`postgresql://platform:intinya ini password@postgres:5432/platform` — ini **INVALID**, backend jalan tapi tidak bisa query database.

**Langkah diagnosis:**

**Step 1 — Test API dari VPS:**
```bash
curl -X POST https://api.YOURDOMAIN.COM/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"youremail@gmail.com","password":"password123","fullName":"Admin"}'
```

Jika output: `{"id":"usr_...","username":"admin",...}` → API OK, masalah di browser (lihat Step 3)  
Jika output: error atau tidak ada → lanjut Step 2

**Step 2 — Cek log backend:**
```bash
docker compose logs backend --tail 30
```
Jika ada error `SASL` atau `password authentication failed` atau `invalid connection string` → **fix .env** (lihat di bawah).

**Fix .env (password salah):**
```bash
cd /opt/platform

# Generate password baru yang BENAR (hex murni)
PLATFORM_DB_PASS=$(openssl rand -hex 32)
MYSQL_PASS=$(openssl rand -hex 32)
POSTGRES_PASS=$(openssl rand -hex 32)
SESSION=$(openssl rand -hex 64)

# Tampilkan untuk dicatat
echo "PLATFORM_DB_PASS=$PLATFORM_DB_PASS"
echo "MYSQL_ROOT_PASSWORD=$MYSQL_PASS"
echo "POSTGRES_ROOT_PASSWORD=$POSTGRES_PASS"
echo "SESSION_SECRET=$SESSION"

# Edit .env dengan nilai baru
nano .env
```

Setelah .env diupdate, hapus volume database lama dan restart:
```bash
# PERINGATAN: Ini hapus semua data database!
docker compose down -v
docker compose up -d --build

# Tunggu semua Up, lalu jalankan ulang migrasi
sleep 20
docker compose exec backend sh -c "cd /app/lib/db && pnpm run push"
```

**Step 3 — Jika curl berhasil tapi browser gagal:**
Kemungkinan SSL belum valid di browser. Buka browser → `https://api.DOMAIN.COM/api/healthz`
- Jika ada peringatan "Not Secure" / SSL error → tunggu 5 menit, SSL masih digenerate
- Jika muncul `{"status":"ok"}` tapi setup masih gagal → cek bagian Traefik di bawah

### ⚠️ Traefik log penuh dengan "client version 1.24 is too old"
Ini adalah warning normal — Traefik tidak bisa auto-discover container via Docker API, tapi **tidak berpengaruh** karena routes sudah dikonfigurasi via file statis (`docker/traefik/dynamic/routes.yml`). Platform tetap berjalan normal. Abaikan error ini.

### ❌ "Cannot connect to Docker daemon"
```bash
systemctl start docker
systemctl enable docker
```

### ❌ Build gagal karena memory
```bash
# Tambah swap memory (untuk VPS RAM kecil)
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

---

# 📁 BAGIAN B — Upload Project ke GitHub

> Lakukan ini di komputer lokal Anda (bukan di VPS), lalu hasilnya di-clone ke VPS.

## Langkah B1 — Buat Akun GitHub (jika belum punya)

1. Buka https://github.com
2. Klik **Sign up**
3. Daftar dengan email Anda

## Langkah B2 — Install Git di Komputer Lokal

**Windows:**
- Download dari https://git-scm.com/download/win
- Install dengan klik Next terus

**Mac:**
```bash
git --version
# Jika belum ada, macOS akan otomatis minta install
```

**Linux/Ubuntu:**
```bash
sudo apt install git -y
```

## Langkah B3 — Konfigurasi Git (sekali saja)

```bash
git config --global user.name "Nama Anda"
git config --global user.email "email@anda.com"
```

## Langkah B4 — Buat Repository Baru di GitHub

1. Login ke https://github.com
2. Klik **"New"** → isi nama repo → pilih **Private**
3. **JANGAN centang** "Initialize this repository with a README"
4. Klik **"Create repository"**

## Langkah B5 — Upload Project dari Replit ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/NAMA_REPO.git
git branch -M main
git push -u origin main
```

> **Minta username/password?** GitHub pakai Personal Access Token.  
> Buat di: GitHub → Settings → Developer settings → Personal access tokens → Generate new token  
> Centang scope: `repo`. Pakai token sebagai password.

## Langkah B6 — Update Project ke GitHub (setelah ada perubahan)

```bash
git add .
git commit -m "Deskripsi perubahan"
git push
```

## Langkah B7 — Pull Update di VPS

```bash
cd /opt/platform
git pull
docker compose up -d --build
```

---

## ✅ Checklist Akhir

- [x] VPS Ubuntu aktif dan bisa di-SSH
- [x] DNS domain A records → **DNS only** (bukan Proxied) di Cloudflare ← **pastikan `www` juga DNS only!**
- [x] Firewall aktif (port 22, 80, 443 terbuka)
- [x] Docker dan Docker Compose terinstall
- [x] File `.env` sudah diisi dengan password **hex murni** (tanpa karakter khusus)
- [x] `docker compose up -d --build` berhasil
- [x] Semua container berstatus `Up`
- [x] `curl https://api.DOMAIN/api/healthz` mengembalikan `{"status":"ok"}`
- [ ] SSL `www.premhub.site` aktif (ubah record `www` ke DNS only di Cloudflare)
- [ ] Bisa login ke `https://premhub.site` di browser

🎉 **Hampir selesai! Tinggal 2 langkah terakhir.**
