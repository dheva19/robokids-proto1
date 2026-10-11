# 🤖 RoboKids - Platform Edukasi Robotika & Pemrograman Visual Anak (MVP)

> **Minimum Viable Product (MVP) Demo Hackathon - 1 Stage Misi**  
> Dibangun dengan HTML5, CSS3 murni, Vanilla JavaScript, Google Blockly, dan Web Audio API.

---

## 🌟 Tentang RoboKids

**RoboKids** adalah platform berbasis web interaktif yang dirancang khusus untuk mengenalkan konsep **logika pemrograman robotik** dan **elektronika sirkuit fisik** kepada anak-anak usia dini (SD & SMP) dengan cara yang menyenangkan, visual, dan ramah anak (*gamified learning*).

Aplikasi ini menggunakan tata letak **Split-Screen (Dua Panel Berdampingan)** yang menghubungkan dunia fisik perangkat keras (*hardware assembly*) dengan logika perangkat lunak (*visual block coding*).

---

## 🚀 Fitur Utama Prototipe (1 Stage Misi)

### 1. Panel Perakitan Hardware & Edukasi Breadboard (Sisi Kiri)
* **Desain Kotak Komponen Lab Modular Baru:**
  * Kompartemen komponen elektronik canggih dengan aksen warna khusus per kategori (Daya 🔋, Pengaman 🛑, Output 📢, Kabel 🔴⚫🟢).
  * Dilengkapi tekstur pegangan (*grip handle* `⠿`), ikon 3D interaktif, label spesifikasi teknis mini (*voltage/ohm/frequency*), serta lencana status langsung (*Siap Pasang* vs *✅ Terpasang*).
  * Penghitung kemajuan perakitan real-time: `[ 0 / 6 Terpasang ]`.
* **Sistem Manual Drag & Drop Komponen:**
  * Komponen dapat ditarik (*drag & drop*) ke soket breadboard atau diklik langsung (*click-to-place*) untuk kemudahan tablet/mouse.
  * Dilengkapi efek animasi *snap-in*, audio klik gurih, dan penolakan otomatis jika salah soket.
* **Komponen yang Dikenalkan & Dirakit:**
  1. 🔋 **Baterai 9V (Sumber Daya):** Sumber energi listrik mandiri untuk sirkuit robot.
  2. 🛑 **Resistor 1kΩ (Pengaman):** Membatasi arus agar komponen output tidak rusak/terbakar.
  3. 📢 **Piezo Buzzer (Output Suara):** Mengubah gelombang listrik menjadi bunyi "BEEP" ceria.
  4. 🔴 **Kabel VCC (+5V):** Menghubungkan daya kutub positif ke rel sirkuit.
  5. ⚫ **Kabel GND (Arde):** Menghubungkan kutub negatif untuk menutup sirkuit listrik (*closed-loop*).
  6. 🟢 **Kabel GPIO 9 (Logika Kontrol):** Menghubungkan otak mikrokontroler robot ke buzzer via resistor.
* **Konsekuensi Nyata Perakitan (*Circuit Consequence*):**
  * ❌ **Jika sirkuit belum lengkap atau salah pasang:**
    * Status sirkuit menunjukkan `🔴 Sirkuit Terputus (X/6)`.
    * **Buzzer TIDAK AKAN BEKERJA!** Suara hanya berbunyi klik tumpul (*dud sound*), panel sirkuit berkedip merah, dan robot tidak dapat membuka peti kristal!
  * 🟢 **Jika sirkuit lengkap 6/6:**
    * Status berubah menjadi `🟢 Sirkuit Siap & Berdaya ⚡ (6/6)`.
    * Buzzer berbunyi nyaring, gelombang suara bergetar, dan robot dapat menyelesaikan misi!
* **Fitur Kemudahan Presentasi:**
  * Tombol **"✨ Rakit Otomatis"** untuk merakit sirkuit instan saat demo cepat.
  * Tombol **"🔄 Bongkar"** untuk mengosongkan sirkuit kembali ke kotak komponen.

### 2. Panel Visual Block Programming & Simulator Robot (Sisi Kanan)
* **Tata Letak Panel Resizable Dinamis (Drag to Resize):**
  * **Resizer Horizontal (◀ ▶):** Pembatas antara panel kiri dan kanan dapat digeser bebas untuk memperbesar/memperkecil area sirkuit atau area koding sesuai kebutuhan presentasi.
  * **Resizer Vertikal (▲ ▼):** Pembatas antara arena simulator grid dan area Blockly dapat digeser naik-turun untuk mengatur tinggi pandangan arena.
  * Redraw otomatis Google Blockly (`Blockly.svgResize`) saat ukuran panel digeser sehingga kanvas blok tidak pernah terpotong.
* **Integrasi Google Blockly (Renderer Zelos ala Scratch):**
  * 4 Blok Perintah Utama yang dirancang khusus:
    1. `🚀 Maju [1-5] langkah`: Menggerakkan robot virtual ke depan.
    2. `🔄 Belok ke [Kanan ↻ / Kiri ↺] 90°`: Memutar arah hadap robot 90 derajat.
    3. `🔊 Bunyikan Buzzer`: Mengirim sinyal logika HIGH ke GPIO 9 untuk membunyikan sirine virtual.
    4. `⏳ Tunggu [1-3] detik`: Memberi jeda waktu sebelum instruksi berikutnya.
* **Simulator Arena Robot Virtual (Grid 8 x 8 Kotak):**
  * Karakter **Robo-Bot** ceria dengan mata LED berkedip dan antena penunjuk arah.
  * Titik Start 🚩 pada koordinat (2, 2) menghadap ke Timur.
  * Pulau Rintangan Bebatuan 🪨 dan Kubangan Air 💧 di bagian tengah arena.
  * Deteksi tabrakan otomatis (*collision detection*) dengan dinding dan rintangan.
  * Indikator HUD langsung menampilkan: Posisi koordinat (X, Y), arah hadap kompas, dan status robot.
* **Synthesizer Suara Mandiri (Web Audio API):**
  * Tidak memerlukan file audio eksternal sehingga bebas dari kendala gagal unduh (*100% self-contained*).
  * Menghasilkan suara piezo buzzer 880Hz, langkah robot, putaran belok, tabrakan, klik snap komponen, dan melodi kemenangan (*fanfare*).
* **Skenario Misi 1 (Pencarian Harta Karun Kristal):**
  * Robot harus bernavigasi mengitari rintangan menuju Peti Kristal 💎 pada koordinat (6, 5).
  * Di atas peti, anak harus membunyikan buzzer (yang sirkuitnya telah terpasang dengan benar) untuk membuka peti!
  * Saat berhasil, muncul perayaan kembang api confetti dan dialog selamat!

---

## 📂 Struktur Berkas

```
test1/
├── index.html        # Antarmuka split-screen, SVG breadboard, soket dropzone, arena grid, & modal
├── style.css         # Desain ramah anak, animasi snap-in, pergerakan robot CSS, dan layout responsif
├── script.js         # Logika interaktif, drag & drop hardware, Web Audio synth, Blockly engine, & simulator
└── README.md         # Dokumentasi resmi dan panduan penggunaan
```

---

## 💻 Cara Menjalankan Prototipe

Aplikasi ini dibuat menggunakan standar web terbuka tanpa membutuhkan instalasi `npm`, `node`, atau alat kompilasi apa pun.

### Opsi 1: Buka Langsung di Browser (Paling Cepat)
1. Buka folder proyek ini di File Explorer.
2. Klik ganda (*double click*) pada file **`index.html`**.
3. Aplikasi akan langsung berjalan di Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari.

### Opsi 2: Menggunakan HTTP Server Lokal (Opsional)
Jika Anda menggunakan ekstensi *Live Server* di VS Code atau terminal:
```bash
# Menggunakan Python 3:
python -m http.server 8080

# Lalu buka browser di: http://localhost:8080
```

---

## 🎯 Panduan Skenario Demo Hackathon (Under 2 Minutes)

1. **Demonstrasikan Hubungan Hardware & Software (Gagal Dahulu):**
   * Di panel kanan, klik **"💡 Solusi Kunci"** lalu tekan tombol hijau **"▶️ JALANKAN ROBOT (RUN)"**.
   * Robot berjalan menuju peti harta karun kristal, namun saat mencoba membunyikan buzzer:
     * ❌ **Buzzer TIDAK AKAN BERBUNYI!** Muncul peringatan: *"Buzzer gagal berbunyi karena Baterai 9V belum terpasang!"*
2. **Demonstrasikan Perakitan Drag & Drop di Panel Kiri:**
   * Tunjukkan cara menarik 🔋 **Baterai 9V**, 🛑 **Resistor**, 📢 **Buzzer**, dan kabel-kabel ke soketnya di breadboard (atau klik tombol **"✨ Rakit Otomatis"**).
   * Status sirkuit berubah menjadi hijau: `🟢 Sirkuit Siap & Berdaya ⚡ (6/6)`.
   * Klik tombol **"🔔 Tes Bunyi"** pada kartu inspektor untuk membuktikan sirkuit kini aktif.
3. **Jalankan Ulang Robot:**
   * Tekan tombol **"▶️ JALANKAN ROBOT (RUN)"** sekali lagi.
   * Saat tiba di peti kristal, buzzer berbunyi nyaring **BEEP!**, musik kemenangan berkumandang, dan dialog perayaan confetti muncul! 🏆
