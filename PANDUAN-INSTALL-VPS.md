# 🚀 Panduan Install di VPS Ubuntu (Pemula)

Panduan ini akan membimbing Anda dari VPS kosong hingga platform berjalan dengan benar.  
Baca setiap langkah dengan teliti — jangan skip.

---

## 📋 Yang Anda Butuhkan Sebelum Mulai

Sebelum mulai, pastikan Anda sudah punya:

| Kebutuhan | Keterangan |
|-----------|------------|
| VPS Ubuntu 22.04 | Minimal 2 CPU, 4GB RAM, 50GB disk |
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
| A | `@` | `IP_VPS_ANDA` | Proxied (Cloudflare) atau TTL 300 |
| A | `api` | `IP_VPS_ANDA` | Proxied |
| A | `phpmyadmin` | `IP_VPS_ANDA` | Proxied |
| A | `pgadmin` | `IP_VPS_ANDA` | Proxied |
| CNAME | `www` | `yourdomain.com` | Proxied |
| CNAME | `*.preview` | `yourdomain.com` | Proxied ← untuk subdomain workspace |
| CNAME | `*` | `yourdomain.com` | Proxied ← untuk custom domain user |

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

Output yang benar: `Docker version 25.x.x, build ...`

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

> ℹ️ Jika Anda belum upload ke GitHub, lihat **Bagian B** di akhir panduan ini dulu, lalu kembali ke sini.

```bash
# Pindah ke folder yang bagus untuk menyimpan project
cd /opt

# Clone project Anda dari GitHub
git clone https://github.com/USERNAME_GITHUB_ANDA/NAMA_REPO.git platform

# Masuk ke folder project
cd platform
```

> Ganti `USERNAME_GITHUB_ANDA` dan `NAMA_REPO` dengan milik Anda.

---

## LANGKAH 8 — Buat File Konfigurasi (.env)

File `.env` berisi password dan konfigurasi rahasia platform Anda.

```bash
# Salin template
cp .env.example .env

# Buka untuk diedit
nano .env
```

Di editor `nano`, edit setiap baris:

```
DOMAIN=yourdomain.com           ← Ganti dengan domain Anda (tanpa https://)
ACME_EMAIL=email@anda.com       ← Email untuk sertifikat SSL

PLATFORM_DB_PASS=               ← Password acak (jalankan perintah di bawah untuk generate)
MYSQL_ROOT_PASSWORD=            ← Password acak lain
POSTGRES_ROOT_PASSWORD=         ← Password acak lain
SESSION_SECRET=                 ← Secret JWT panjang (jalankan perintah di bawah)
PGADMIN_EMAIL=admin@domain.com  ← Email untuk login pgAdmin
PGADMIN_PASSWORD=               ← Password untuk pgAdmin
```

**Cara generate password acak yang kuat:**

Buka terminal baru (atau buka tab baru di terminal), jalankan:
```bash
# Untuk password database (copy hasilnya)
openssl rand -hex 32

# Untuk SESSION_SECRET (copy hasilnya — harus panjang!)
openssl rand -hex 64
```

Setelah selesai edit, simpan di `nano`:
- Tekan `Ctrl + X`
- Tekan `Y`
- Tekan `Enter`

**Verifikasi file .env sudah benar:**
```bash
cat .env
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

Output yang benar (semua harus `running`):
```
NAME                    STATUS
platform-traefik        running
platform-postgres       running
platform-mysql          running
platform-postgres-ws    running
platform-backend        running
platform-frontend       running
platform-phpmyadmin     running
platform-pgadmin        running
```

Jika ada yang `exited`, cek errornya:
```bash
docker compose logs nama-service
# Contoh: docker compose logs platform-backend
```

---

## LANGKAH 11 — Setup Database Platform

```bash
# Jalankan migrasi database (buat tabel-tabel yang dibutuhkan)
docker compose exec backend node -e "
const { db } = require('./lib/db/src/index.js');
console.log('Database connected!');
"
```

> Jika perintah di atas gagal, jalankan ini:
```bash
docker compose exec backend sh -c "cd /app && npx drizzle-kit push"
```

---

## LANGKAH 12 — Verifikasi Platform Berjalan

Buka browser dan akses:

| URL | Yang Seharusnya Muncul |
|-----|----------------------|
| `https://yourdomain.com` | Halaman login/setup platform |
| `https://api.yourdomain.com/api/healthz` | `{"status":"ok"}` |
| `https://phpmyadmin.yourdomain.com` | Halaman login phpMyAdmin |
| `https://pgadmin.yourdomain.com` | Halaman login pgAdmin |

> **SSL belum muncul?** Tunggu 2–5 menit untuk Let's Encrypt generate sertifikat.

---

## LANGKAH 13 — Buat Akun Admin Pertama

Buka `https://yourdomain.com` di browser.  
Jika belum ada user, platform akan otomatis tampilkan form **"Buat Akun Admin"**.

Isi:
- Nama Lengkap
- Username
- Email
- Password

Klik **"Buat Akun Admin"** → Anda langsung masuk sebagai Admin.

> **Catatan:** Setelah akun admin dibuat, halaman register tidak bisa diakses publik lagi.  
> Untuk tambah user baru, masuk ke Admin Panel → Users → Tambah User.

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

### ❌ "Cannot connect to Docker daemon"
```bash
systemctl start docker
systemctl enable docker
```

### ❌ SSL tidak muncul / "Not Secure"
- Pastikan DNS sudah mengarah ke IP VPS (cek di: https://dnschecker.org)
- Tunggu 5 menit lalu refresh
- Cek log Traefik: `docker compose logs traefik`

### ❌ Backend error "Cannot connect to database"
- Pastikan postgres container running: `docker compose ps`
- Restart backend: `docker compose restart backend`

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
4. Verifikasi email

## Langkah B2 — Install Git di Komputer Lokal

**Windows:**
- Download dari https://git-scm.com/download/win
- Install dengan klik Next terus

**Mac:**
```bash
# Buka Terminal, ketik:
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
2. Klik tombol **"New"** (tombol hijau) atau klik **"+"** di kanan atas → **"New repository"**
3. Isi:
   - **Repository name:** `replit-clone` (atau nama lain yang Anda mau)
   - **Description:** Platform IDE self-hosted mirip Replit
   - Pilih **Private** (supaya kode tidak publik)
4. **JANGAN centang** "Initialize this repository with a README"
5. Klik **"Create repository"**

## Langkah B5 — Upload Project dari Replit/Komputer ke GitHub

Di terminal lokal Anda, masuk ke folder project ini:

```bash
# Inisialisasi git (jika belum)
git init

# Tambahkan semua file
git add .

# Commit pertama
git commit -m "Initial commit: Replit clone platform"

# Hubungkan dengan repository GitHub Anda
# Ganti USERNAME dan NAMA_REPO dengan milik Anda
git remote add origin https://github.com/USERNAME/NAMA_REPO.git

# Upload ke GitHub
git branch -M main
git push -u origin main
```

> **Minta username/password?** GitHub sekarang pakai token.  
> Buat token di: GitHub → Settings → Developer settings → Personal access tokens → Generate new token  
> Centang scope: `repo`. Copy tokennya dan pakai sebagai password.

## Langkah B6 — Verifikasi di GitHub

Buka `https://github.com/USERNAME/NAMA_REPO` — semua file harus sudah muncul di sana.

## Langkah B7 — Update Project ke GitHub (setelah ada perubahan)

Setiap kali ada perubahan file, lakukan ini:

```bash
git add .
git commit -m "Deskripsi perubahan Anda"
git push
```

## Langkah B8 — Pull Update di VPS

Setelah push ke GitHub, update di VPS:

```bash
cd /opt/platform
git pull
docker compose up -d --build
```

---

## ✅ Checklist Akhir

- [ ] VPS Ubuntu 22.04 aktif dan bisa di-SSH
- [ ] DNS domain sudah diarahkan ke IP VPS
- [ ] Firewall aktif (port 22, 80, 443 terbuka)
- [ ] Docker dan Docker Compose terinstall
- [ ] File `.env` sudah diisi dengan data yang benar
- [ ] `docker compose up -d --build` berhasil
- [ ] Semua container berstatus `running`
- [ ] Bisa buka `https://yourdomain.com` di browser
- [ ] Akun admin pertama sudah dibuat

🎉 **Selamat! Platform Anda sudah berjalan!**
