# Product Requirements Document (PRD): ClayTennis Scorekeeper & Bracket Studio

## 1. Ringkasan Produk (Product Overview)

**ClayTennis** adalah aplikasi web interaktif yang dirancang untuk membantu penggiat tenis, panitia turnamen amatir, dan pemain dalam mengelola bagan turnamen (_bracket_) serta menghitung skor pertandingan secara _real-time_. Aplikasi ini menonjolkan desain antarmuka bergaya **Claymorphism** yang ceria, modern, dan sangat interaktif.

## 2. Tujuan Produk (Objectives)

- Menyediakan sistem otomatis untuk mengacak pemain, membentuk tim, dan membuat bagan turnamen (_bracket_).
- Menyediakan papan skor tenis digital yang akurat dan otomatis mengikuti aturan tenis global (termasuk _Deuce_, _Advantage_, dan _Tiebreak_).
- Memberikan visualisasi lapangan (_Mini-Court_) yang _real-time_ agar pengguna (atau wasit pinggir lapangan) tahu persis posisi berdiri tiap pemain dan giliran servis.

## 3. Fitur Utama (Key Features)

### 3.1. Pemilihan Mode Permainan

- Terdapat pilihan mode **Singles (1v1)** dan **Doubles (2v2)** di layar awal.
- Mode yang dipilih akan secara global mengubah cara kerja Generator Bracket dan pengaturan posisi pada Mini-Court.

### 3.2. Generator Tim & Bracket (Bracket Studio)

- **Input Daftar Pemain:** Memungkinkan pengguna memasukkan daftar nama pemain secara bebas.
- **Auto-Pairing (Khusus Doubles):** Jika mode Doubles aktif, sistem akan mengacak (_shuffle_) dan memasangkan pemain menjadi tim (2 orang per tim). Jika jumlah pemain ganjil, sisa pemain akan dialokasikan dengan adil (mendapat _BYE_).
- **Bracket Generator:** Sistem otomatis membangun _Tournament Tree_. Mengakomodasi format eliminasi dengan penambahan slot _BYE_ otomatis jika jumlah tim/pemain bukan kelipatan pangkat 2.
- **Klik-ke-Match:** Cukup mengklik nama tim/pemain di dalam bagan untuk mengirim mereka langsung bertanding di layar _Match View_.

### 3.3. Papan Skor Interaktif (Counter Score)

- **Logika Skor Tenis:** Poin dihitung dalam format standar (0, 15, 30, 40, Deuce, Ad), _Games_, dan _Sets_.
- **Auto-Tiebreak:** Sistem mengenali ketika skor mencapai 6-6 dan otomatis beralih ke mode Tiebreak (poin angka 1, 2, 3... target 7 dengan selisih 2).
- **Manajemen State:** Dilengkapi tombol _Undo_ (mundur 1 langkah jika salah input poin) dan _Reset Match_ (mengulang pertandingan).

### 3.4. Visualisasi Mini-Court (Live Player Positioning)

- **Visual Lapangan:** Lapangan tenis virtual yang ditempatkan di bagian atas layar skor. Memiliki garis detail (_singles line_, _doubles alley_, dan _service box_).
- **Indikator Pemain (Player Markers):**
  - **Singles:** 2 marker (1 Server, 1 Receiver).
  - **Doubles:** 4 marker (Server, partner Server di depan net, Receiver, dan partner Receiver di depan net).
- **Otomasi Posisi Berdiri:**
  - Sistem memindahkan pemain antara _Deuce Court_ (sisi Kanan) dan _Ad Court_ (sisi Kiri) berdasarkan jumlah poin yang telah dimainkan (Genap = Kanan, Ganjil = Kiri).
- **Otomasi Rotasi Servis:** Giliran servis berpindah ke kubu lawan setelah satu _game_ usai. Pemain yang bertugas servis akan ditandai dengan efek _Glow_ / menyala.

## 4. Desain & UX/UI

- **Tema Visual:** _Claymorphism_ (Menggunakan efek 3D lembut, bayangan ganda _drop shadow_ dan _inset shadow_, serta bentuk membulat/_rounded_).
- **Palet Warna:** Pastel yang dinamis dengan warna aksen cerah (Biru, Merah Muda, Hijau Lime, Ungu) untuk membedakan pemain/tim 1 dan tim 2.
- **Layout Responsif:** Dapat diakses dan tetap terlihat proporsional melalui _smartphone_ atau tablet.

## 5. Kebutuhan Teknis (Technical Requirements)

- **Frontend:** HTML5, CSS3, dan Vanilla JavaScript.
- **Arsitektur:** _Single-Page Application (SPA)_. Seluruh aplikasi berjalan dalam satu file eksekusi berbasis browser (tanpa perlu _backend_ atau instalasi database). State dikelola di memori _browser_.
- **Tipografi:** Google Font "Fredoka" yang memberikan kesan _playful_ dan _sporty_.

## 6. Rencana Pengembangan Lanjutan (Future Enhancements)

- Mengintegrasikan `localStorage` sehingga data bagan turnamen dan skor tidak hilang jika halaman tidak sengaja di-_refresh_.
- Fitur _Export_ bagan bracket sebagai file gambar (PNG/PDF) untuk dibagikan ke media sosial.
- Mode pengaturan kustom: Pemilihan jumlah set (_Best of 3_ atau _Best of 5_) dan format skor _No-Ad_.

Login sebagai organizer LIVE (password Tenma-Seed-2026!):

- sarah@seed.tenma.test: organizer Sunday Rally — Kemang (Doubles, 4/4). Lo juga ikut main di sini.
- reza@seed.tenma.test: organizer Singles Showdown (Singles, 2/2)
