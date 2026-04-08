/**
 * Utility: format angka ke format Rupiah
 */
export function formatRupiah(angka) {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

/**
 * Utility: format tanggal ke format DD-MMM-YYYY (Indonesia)
 */
export function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}-${bulan[d.getMonth()]}-${d.getFullYear()}`;
}

/**
 * Hitung angsuran per bulan (flat rate)
 * @param {number} otr          - Harga OTR kendaraan
 * @param {number} dpPersen     - Persen DP (0-100)
 * @param {number} tenorBulan   - Tenor dalam bulan
 * @param {number} bungaPerTahun- Bunga flat per tahun (persen)
 * @returns {object}            - { dp, pokok, bungaTotal, angsuranPerBulan }
 */
export function hitungAngsuran(otr, dpPersen, tenorBulan, bungaPerTahun) {
  const dp = otr * (dpPersen / 100);
  const pokok = otr - dp;
  const bungaPerBulan = bungaPerTahun / 100 / 12;
  const totalBunga = pokok * bungaPerBulan * tenorBulan;
  const totalBayar = pokok + totalBunga;
  const angsuranPerBulan = Math.round(totalBayar / tenorBulan / 1000) * 1000; // bulatkan ke ribuan
  return { dp, pokok, bungaTotal: totalBunga, angsuranPerBulan, totalBayar };
}

/**
 * Generate jadwal angsuran lengkap
 * @param {string} kontrakNo      - Nomor kontrak
 * @param {number} angsuranBulan  - Nilai angsuran per bulan
 * @param {number} tenorBulan     - Jumlah bulan tenor
 * @param {string} tglMulaiStr    - Tanggal mulai cicilan (YYYY-MM-DD)
 * @returns {Array}               - Array objek jadwal angsuran
 */
export function generateJadwal(kontrakNo, angsuranBulan, tenorBulan, tglMulaiStr) {
  const jadwal = [];
  const tglMulai = new Date(tglMulaiStr);

  for (let i = 0; i < tenorBulan; i++) {
    const jatuhTempo = new Date(tglMulai);
    jatuhTempo.setMonth(tglMulai.getMonth() + i);
    jadwal.push({
      kontrak_no: kontrakNo,
      angsuran_ke: i + 1,
      angsuran_per_bulan: angsuranBulan,
      tanggal_jatuh_tempo: jatuhTempo.toISOString().split('T')[0],
    });
  }
  return jadwal;
}

/**
 * Hitung total angsuran jatuh tempo per tanggal tertentu
 */
export function hitungTotalJatuhTempo(jadwal, clientName, perTanggal) {
  const tglBatas = new Date(perTanggal);
  const angsuranJatuhTempo = jadwal.filter(
    (a) => new Date(a.tanggal_jatuh_tempo) <= tglBatas
  );
  const total = angsuranJatuhTempo.reduce((acc, a) => acc + a.angsuran_per_bulan, 0);
  return {
    kontrak_no: jadwal[0]?.kontrak_no || '-',
    client_name: clientName,
    jumlah_angsuran: angsuranJatuhTempo.length,
    total_angsuran_jatuh_tempo: total,
  };
}

/**
 * Hitung denda keterlambatan
 * @param {Array}  jadwal         - Jadwal angsuran lengkap
 * @param {string} clientName     - Nama client
 * @param {number} sudahBayarKe   - Sudah bayar sampai angsuran ke-berapa
 * @param {string} perTanggal     - Tanggal perhitungan denda (YYYY-MM-DD)
 * @param {number} dendaPersen    - Persentase denda per hari (mis: 0.1 = 0.1%)
 */
export function hitungDenda(jadwal, clientName, sudahBayarKe, perTanggal, dendaPersen = 0.1) {
  const tglHitung = new Date(perTanggal);
  const result = [];

  for (const a of jadwal) {
    const jatuhTempo = new Date(a.tanggal_jatuh_tempo);
    // Belum dibayar jika no angsuran > sudahBayarKe DAN sudah jatuh tempo
    if (a.angsuran_ke > sudahBayarKe && jatuhTempo < tglHitung) {
      const hariTelat = Math.floor(
        (tglHitung - jatuhTempo) / (1000 * 60 * 60 * 24)
      );
      const totalDenda = Math.round(a.angsuran_per_bulan * (dendaPersen / 100) * hariTelat);
      result.push({
        kontrak_no: a.kontrak_no,
        client_name: clientName,
        installment_no: a.angsuran_ke,
        angsuran_per_bulan: a.angsuran_per_bulan,
        tanggal_jatuh_tempo: a.tanggal_jatuh_tempo,
        hari_keterlambatan: hariTelat,
        total_denda: totalDenda,
      });
    }
  }
  return result;
}
