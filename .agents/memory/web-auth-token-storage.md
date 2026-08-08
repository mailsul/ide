---
name: Web auth token storage (dua tempat)
description: Kenapa token auth IDE platform hidup di localStorage DAN sessionStorage, dan aturan bacanya.
---

Token JWT web disimpan di **dua** tempat tergantung pilihan "Ingat saya":
`localStorage` kalau dicentang, `sessionStorage` kalau tidak. Setiap pembaca
token harus lewat helper penyimpanan bersama, tidak boleh membaca satu storage
saja.

**Why:** Pernah terjadi bug "login stuck": token getter global hanya membaca
`localStorage`, jadi login tanpa "Ingat saya" mengirim `/auth/me` tanpa header
`Authorization`. Backend balas 401, auth context menghapus token, guard
memantulkan user kembali ke halaman login — tanpa pesan error, sehingga terlihat
seperti form login yang tidak merespons.

**How to apply:** Saat menambah pemanggil API baru, interceptor, koneksi
WebSocket/terminal, atau logika "apakah user sudah login", ambil token dari
helper bersama. Kalau menambah mode penyimpanan baru, perbarui helper itu —
jangan menambah pembacaan storage langsung di tempat lain.

Pelajaran umum: kegagalan auth yang senyap harus punya pesan yang terlihat user.
Pantulan balik ke login tanpa alasan tidak bisa dibedakan dari form yang rusak.
