# 🚀 Panduan Install di VPS Ubuntu (Pemula)

Panduan ini akan membimbing Anda dari VPS kosong hingga platform berjalan dengan benar.  
Baca setiap langkah dengan teliti — jangan skip.

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
| CNAME | `www` | `yourdomain.com` | Proxied |
| CNAME | `*.preview` | `yourdomain.com` | Proxied ← untuk subdomain workspace |
| CNAME | `*` | `yourdomain.com` | Proxied ← untuk custom domain user |

> ⚠️ **PENTING untuk Cloudflare**: A record utama (`@`, `api`, `phpmyadmin`, `pgadmin`) **HARUS** DNS only (icon abu-abu), bukan Proxied (orange). Jika Proxied diaktifkan, Let's Encrypt tidak bisa generate SSL certificate.

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

```bash
# Untuk password database — TANPA karakter khusus seperti @, #, spasi
openssl rand -hex 32

# Untuk SESSION_SECRET
openssl rand -hex 64
```

> ⚠️ **PENTING**: Password **JANGAN** mengandung karakter `@`, `#`, `?`, `&`, spasi, atau simbol khusus lainnya.  
> Gunakan format hex (huruf a-f dan angka 0-9) dari perintah `openssl rand -hex` di atas.

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
- Pastikan A records DNS sudah **DNS only** (bukan Proxied) di Cloudflare
- Restart Traefik untuk trigger generate ulang cert:
```bash
docker run --rm -v platform_traefik_letsencrypt:/data alpine rm -f /data/acme.json
docker compose up -d --force-recreate traefik
```
- Tunggu 3–5 menit, cek: `curl https://api.YOURDOMAIN.COM/api/healthz`

### ❌ "404 page not found" di browser
Traefik tidak bisa baca Docker (Docker API version mismatch). Routes sudah dikonfigurasi via file statis.  
Cek: `docker compose logs traefik | tail -5`

### ❌ "Failed to complete setup" saat register admin
Test API langsung dari VPS:
```bash
curl -X POST https://api.YOURDOMAIN.COM/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"youremail@gmail.com","password":"password123","fullName":"Admin"}'
```
Lihat error yang muncul, lalu cek: `docker compose logs backend --tail 20`

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

- [ ] VPS Ubuntu aktif dan bisa di-SSH
- [ ] DNS domain A records → **DNS only** (bukan Proxied) di Cloudflare
- [ ] Firewall aktif (port 22, 80, 443 terbuka)
- [ ] Docker dan Docker Compose terinstall
- [ ] File `.env` sudah diisi dengan password **hex murni** (tanpa karakter khusus)
- [ ] `docker compose up -d --build` berhasil
- [ ] Semua container berstatus `Up`
- [ ] `curl https://api.DOMAIN/api/healthz` mengembalikan `{"status":"ok"}`
- [ ] Bisa buka `https://yourdomain.com` di browser (ada gembok SSL)
- [ ] Akun admin pertama sudah dibuat via "First-Run Setup"

🎉 **Selamat! Platform Anda sudah berjalan!**
