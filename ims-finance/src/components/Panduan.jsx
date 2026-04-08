import React from 'react';
import './Panduan.css';

export default function Panduan() {
  return (
    <div className="panduan-page fade-in">

      {/* Hero */}
      <div className="panduan-hero">
        <div className="panduan-hero-icon">📖</div>
        <h2 className="panduan-hero-title">Panduan Penggunaan</h2>
        <p className="panduan-hero-sub">IMS Finance · Sistem Kredit Kendaraan · PT. Inovasi Mitra Sejati</p>
      </div>

      {/* ── SOAL 1 ── */}
      <div className="panduan-section">
        <div className="panduan-section-title">
          🧮 Kalkulator Angsuran Kredit
          <span className="panduan-badge">Soal 1</span>
        </div>

        <div className="panduan-steps">
          {[
            { n: 1, label: 'Isi Data Kontrak', desc: 'Masukkan Nomor Kontrak, Nama Client, Harga OTR, Down Payment (%), Tenor (bulan), Bunga Flat/Tahun, dan Tanggal Angsuran Pertama.' },
            { n: 2, label: 'Klik "Hitung Angsuran"', desc: 'Sistem akan menghitung DP, pokok pinjaman, total bunga, dan jadwal cicilan bulanan otomatis.' },
            { n: 3, label: 'Klik "Simpan Kontrak"', desc: 'Kontrak tersimpan di panel kanan dan bisa diakses dari tab Jatuh Tempo & Denda.' },
          ].map(s => (
            <div className="panduan-step" key={s.n}>
              <div className="panduan-step-num">{s.n}</div>
              <div className="panduan-step-body">
                <div className="panduan-step-label">{s.label}</div>
                <div className="panduan-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="panduan-formula">
          <div className="panduan-formula-title">Rumus Flat Rate</div>
          <div className="panduan-formula-rows">
            {[
              ['Down Payment',   'OTR × % DP'],
              ['Pokok Pinjaman', 'OTR − DP'],
              ['Total Bunga',    'Pokok × Bunga/Thn × (Tenor ÷ 12)'],
              ['Total Bayar',    'Pokok + Total Bunga'],
              ['Angsuran/Bulan', 'Total Bayar ÷ Tenor'],
            ].map(([l, v]) => (
              <div className="panduan-formula-row" key={l}>
                <span className="panduan-formula-row-label">{l}</span>
                <span className="panduan-formula-row-val">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <table className="panduan-example-table">
          <thead>
            <tr><th>Parameter</th><th>Nilai</th><th>Hasil</th></tr>
          </thead>
          <tbody>
            <tr><td>OTR</td><td>—</td><td>Rp 240.000.000</td></tr>
            <tr><td>Down Payment</td><td>20%</td><td>Rp 48.000.000</td></tr>
            <tr><td>Pokok Pinjaman</td><td>240jt − 48jt</td><td>Rp 192.000.000</td></tr>
            <tr><td>Total Bunga</td><td>192jt × 14% × 1.5</td><td>Rp 40.320.000</td></tr>
            <tr><td>Angsuran / Bulan</td><td>232.320.000 ÷ 18</td><td>Rp 12.907.000</td></tr>
          </tbody>
        </table>
      </div>

      <hr className="panduan-divider" />

      {/* ── SOAL 2 ── */}
      <div className="panduan-section">
        <div className="panduan-section-title">
          📅 Jatuh Tempo
          <span className="panduan-badge">Soal 2</span>
        </div>

        <div className="panduan-steps">
          {[
            { n: 1, label: 'Pilih Kontrak', desc: 'Pilih kontrak yang sudah disimpan dari dropdown.' },
            { n: 2, label: 'Tentukan Tanggal Batas', desc: 'Masukkan tanggal untuk mengecek cicilan mana yang sudah jatuh tempo pada tanggal tersebut.' },
            { n: 3, label: 'Klik "Jalankan Query"', desc: 'Sistem menampilkan total cicilan yang sudah jatuh tempo beserta detail per bulan.' },
          ].map(s => (
            <div className="panduan-step" key={s.n}>
              <div className="panduan-step-num">{s.n}</div>
              <div className="panduan-step-body">
                <div className="panduan-step-label">{s.label}</div>
                <div className="panduan-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="panduan-note">
          <span className="panduan-note-icon">💡</span>
          <div>
            <strong>Contoh:</strong> Per tanggal <strong>14 Agustus 2024</strong>, angsuran yang jatuh tempo pada tanggal <strong>25 Jan – 25 Jul 2024</strong> (7 bulan) sudah lewat. Angsuran 25 Agustus belum tampil karena tanggal 25 &gt; 14 — masih 11 hari lagi.
            <br /><br />
            Total = 7 × Rp 12.907.000 = <strong>Rp 90.349.000</strong>
          </div>
        </div>
      </div>

      <hr className="panduan-divider" />

      {/* ── SOAL 3 ── */}
      <div className="panduan-section">
        <div className="panduan-section-title">
          ⚠️ Denda Keterlambatan
          <span className="panduan-badge">Soal 3</span>
        </div>

        <div className="panduan-steps">
          {[
            { n: 1, label: 'Pilih Kontrak', desc: 'Pilih kontrak dari dropdown.' },
            { n: 2, label: 'Masukkan Tanggal Pembayaran Aktual', desc: 'Tanggal kapan debitur benar-benar membayar (bukan jatuh tempo).' },
            { n: 3, label: 'Lihat Hasil Denda', desc: 'Sistem menghitung berapa hari terlambat dan total denda per cicilan.' },
          ].map(s => (
            <div className="panduan-step" key={s.n}>
              <div className="panduan-step-num">{s.n}</div>
              <div className="panduan-step-body">
                <div className="panduan-step-label">{s.label}</div>
                <div className="panduan-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="panduan-formula">
          <div className="panduan-formula-title">Rumus Denda</div>
          <div className="panduan-formula-rows">
            {[
              ['Keterlambatan', 'Tgl Bayar − Tgl Jatuh Tempo (hari)'],
              ['Denda/Hari',    'Angsuran × 0.1%'],
              ['Total Denda',   'Keterlambatan × Denda/Hari'],
            ].map(([l, v]) => (
              <div className="panduan-formula-row" key={l}>
                <span className="panduan-formula-row-label">{l}</span>
                <span className="panduan-formula-row-val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
