# IMS Finance — Developer Assessment

Aplikasi web **IMS Finance** — Sistem Kredit Kendaraan untuk Developer Assessment PT. Inovasi Mitra Sejati.

## 📁 Struktur Proyek

```
IMS/
├── ims-finance/        # React + Vite Frontend App
├── schema.sql          # DDL & Seed Data MySQL
├── queries.sql         # Solusi SQL (Soal 2 & 3)
└── SOAL DEVELOPER.pdf  # Soal assessment
```

## 🚀 Cara Menjalankan

```bash
cd ims-finance
npm install
npm run dev
```

Buka browser: `http://localhost:5173`

## ✨ Fitur

### Soal 1 — Kalkulator Angsuran
- Input data kredit kendaraan (OTR, DP, Tenor, Bunga Flat)
- Hitung angsuran per bulan dengan metode **flat rate**
- Generate jadwal angsuran lengkap
- **Multi-kontrak**: simpan dan kelola banyak kontrak sekaligus

### Soal 2 — Jatuh Tempo
- Query total angsuran yang sudah jatuh tempo per tanggal tertentu
- Preview query SQL lengkap
- Pilihan kontrak dinamis via dropdown

### Soal 3 — Denda Keterlambatan
- Hitung denda per angsuran yang terlambat (0,1%/hari)
- Input variabel: sudah bayar ke-N, % denda, tanggal hitung
- Breakdown kalkulasi per angsuran

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Pure CSS (Custom Design System · ISO Breakpoints)
- **Database**: MySQL (schema + seed data tersedia)
- **Font**: Inter (Google Fonts)

## 📐 Design System

- Responsive: xs / sm / md / lg / xl / xxl (ISO/W3C)
- 8px spacing grid
- WCAG 2.1 AA contrast
- Dark mode premium UI

---

*© 2024 PT. Inovasi Mitra Sejati — Developer Assessment*
