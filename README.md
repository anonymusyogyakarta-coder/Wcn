<p align="center">
  <img src="https://img.shields.io/badge/WCN%20BOT-V2.5.0--PREMIUM-purple?style=for-the-badge&logo=whatsapp" alt="WCN Version">
  <img src="https://img.shields.io/badge/PLATFORM-TERMUX--ONLY-black?style=for-the-badge&logo=android" alt="Platform">
  <img src="https://img.shields.io/badge/LANGUAGE-NODE.JS-green?style=for-the-badge&logo=node.js" alt="Language">
  <img src="https://img.shields.io/badge/STATUS-ACTIVE%2024%2F7-brightgreen?style=for-the-badge" alt="Status">
</p>

<h1 align="center"> WCN PREMIUM BOT </h1>
<p align="center"><b>Pure Termux CLI Architecture • High Performance Multi-Device WhatsApp Bot</b></p>

---

## 🔮 OVERVIEW
> **WCN BOT PREMIUM** adalah script WhatsApp bot modular masa kini yang dirancang khusus untuk berjalan ringan di dalam terminal Android (**Termux**). Menggunakan koneksi canggih **Baileys v6**, bot ini tidak memerlukan server panel web atau scan QR yang ribet. Cukup input nomor telepon langsung di terminal, dan sistem siber akan mencetak **Pairing Code** secara interaktif!

---

## 🚀 FITUR-FITUR UNGGULAN (PREMIUM MODULES)

| Kategori | Perintah | Fungsi Utama | Status |
| :--- | :--- | :--- | :--- |
| 🤖 **Artificial Intelligence** | `.ai <text>` | Tanya jawab pintar berbasis GPT-3.5 Turbo | `AKTIF` |
| 🎨 **Imaging AI** | `.generate <prompt>` | Menggambar foto/ilustrasi siber real-time | `AKTIF` |
| 📸 **Cyber Tracking** | `.rvo` | Auto-detect & lacak log pesan *View Once* | `PREMIUM` |
| 🌤️ **Information Tools** | `.cuaca <kota>` | Cek kondisi & kelembapan cuaca terkini | `AKTIF` |
| 👥 **Group Control** | `.kick` / `.add` | Manajemen kilat member grup (Fitur Admin) | `AKTIF` |
| 🎭 **Multimedia** | `.s` / `.neko` | Pembuat stiker otomatis & gambar anime | `AKTIF` |

---

## 🛡️ SISTEM PROTEKSI UTAMA
* **Anti-Crash Engine:** Dilengkapi dengan proteksi `uncaughtException` agar bot tetap menyala 24 jam meskipun terjadi eror pada request API.
* **Auto-Reconnect:** Jika koneksi internet HP lo drop, sistem WCN akan otomatis melakukan penyambungan ulang tanpa perlu memasukkan kode pairing lagi.

---

## 🛠️ PANDUAN INSTALASI INSTAN (UNTUK SEMUA ORANG)

Siapa pun bisa mengaktifkan bot ini di Termux mereka sendiri dalam waktu kurang dari 5 menit. Cukup salin dan tempel baris perintah di bawah ini secara berurutan:

### 1️⃣ Pembaruan Environment & Instalasi Alat Tempur
```bash
pkg update && pkg upgrade -y && pkg install git nodejs -y
