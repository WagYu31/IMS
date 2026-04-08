-- ============================================================
--  IMS Finance — Query Solutions
--  PT. Inovasi Mitra Sejati | Developer Assessment 2024
-- ============================================================

-- ============================================================
--  SOAL 2
--  Tampilkan total angsuran yang sudah jatuh tempo
--  untuk client SUGUS per tanggal 14 Agustus 2024
-- ============================================================
--
--  Logika:
--  - JOIN KONTRAK + JADWAL_ANGSURAN (filter CLIENT_NAME = 'SUGUS')
--  - WHERE TANGGAL_JATUH_TEMPO <= '2024-08-14'
--  - SUM semua ANGSURAN_PER_BULAN yang sudah jatuh tempo
--
--  Hasil:  7 angsuran (Jan–Jul 2024 sudah jatuh tempo per tgl 25)
--          Agustus belum jatuh tempo karena tanggalnya 2024-08-25 > 2024-08-14
--          Total = 7 × 12.907.000 = 90.349.000
-- ------------------------------------------------------------

SELECT 
    k.KONTRAK_NO,
    k.CLIENT_NAME,
    COUNT(ja.ID)                        AS JUMLAH_ANGSURAN_JATUH_TEMPO,
    SUM(ja.ANGSURAN_PER_BULAN)          AS TOTAL_ANGSURAN_JATUH_TEMPO
FROM KONTRAK k
JOIN JADWAL_ANGSURAN ja 
    ON k.KONTRAK_NO = ja.KONTRAK_NO
WHERE 
    k.CLIENT_NAME             = 'SUGUS'
    AND ja.TANGGAL_JATUH_TEMPO <= '2024-08-14'
GROUP BY 
    k.KONTRAK_NO, 
    k.CLIENT_NAME;

/*
  HASIL YANG DIHARAPKAN:
  ┌─────────────┬─────────────┬──────────────────────────────┬──────────────────────────────┐
  │ KONTRAK_NO  │ CLIENT_NAME │ JUMLAH_ANGSURAN_JATUH_TEMPO  │ TOTAL_ANGSURAN_JATUH_TEMPO   │
  ├─────────────┼─────────────┼──────────────────────────────┼──────────────────────────────┤
  │ AGR00001    │ SUGUS       │ 7                            │ 90.349.000                   │
  └─────────────┴─────────────┴──────────────────────────────┴──────────────────────────────┘
*/


-- ============================================================
--  SOAL 3
--  Hitung denda keterlambatan untuk client SUGUS
--  Kondisi: sudah bayar s/d angsuran ke-5 (Mei 2024),
--           belum bayar ke-6 (Juni) dan ke-7 (Juli)
--  Per tanggal: 14 Agustus 2024
--  Denda: 0.1% per hari × nilai angsuran yang belum dibayar
-- ============================================================
--
--  Perhitungan manual:
--  Angsuran 6 (jatuh tempo 2024-06-25):
--    Hari telat = DATEDIFF('2024-08-14', '2024-06-25') = 50 hari
--    Denda = 12.907.000 × 0.1% × 50 = 6.453.500
--
--  Angsuran 7 (jatuh tempo 2024-07-25):
--    Hari telat = DATEDIFF('2024-08-14', '2024-07-25') = 20 hari
--    Denda = 12.907.000 × 0.1% × 20 = 2.581.400
-- ------------------------------------------------------------

SELECT 
    k.KONTRAK_NO,
    k.CLIENT_NAME,
    ja.ANGSURAN_KE                                                  AS INSTALLMENT_NO,
    ja.TANGGAL_JATUH_TEMPO,
    DATEDIFF('2024-08-14', ja.TANGGAL_JATUH_TEMPO)                 AS HARI_KETERLAMBATAN,
    ROUND(
        ja.ANGSURAN_PER_BULAN 
        * (0.1 / 100) 
        * DATEDIFF('2024-08-14', ja.TANGGAL_JATUH_TEMPO)
    )                                                               AS TOTAL_DENDA
FROM KONTRAK k
JOIN JADWAL_ANGSURAN ja 
    ON k.KONTRAK_NO = ja.KONTRAK_NO
LEFT JOIN PEMBAYARAN p 
    ON  ja.KONTRAK_NO  = p.KONTRAK_NO 
    AND ja.ANGSURAN_KE = p.ANGSURAN_KE
WHERE 
    k.CLIENT_NAME              = 'SUGUS'
    AND ja.TANGGAL_JATUH_TEMPO <  '2024-08-14'   -- sudah jatuh tempo
    AND p.ID                   IS NULL             -- belum ada record pembayaran
ORDER BY 
    ja.ANGSURAN_KE ASC;

/*
  HASIL YANG DIHARAPKAN:
  ┌─────────────┬─────────────┬────────────────┬────────────────────┬──────────────────────┬────────────┐
  │ KONTRAK_NO  │ CLIENT_NAME │ INSTALLMENT_NO │ TANGGAL_JATUH_TEMPO│ HARI_KETERLAMBATAN   │ TOTAL_DENDA│
  ├─────────────┼─────────────┼────────────────┼────────────────────┼──────────────────────┼────────────┤
  │ AGR00001    │ SUGUS       │ 6              │ 2024-06-25         │ 50                   │ 6.453.500  │
  │ AGR00001    │ SUGUS       │ 7              │ 2024-07-25         │ 20                   │ 2.581.400  │
  └─────────────┴─────────────┴────────────────┴────────────────────┴──────────────────────┴────────────┘
  
  Total Denda = 6.453.500 + 2.581.400 = 9.034.900
*/


-- ============================================================
--  BONUS: Summary Ringkasan Denda
-- ============================================================
SELECT 
    k.KONTRAK_NO,
    k.CLIENT_NAME,
    COUNT(ja.ID)                                                    AS JUMLAH_ANGSURAN_TERLAMBAT,
    SUM(DATEDIFF('2024-08-14', ja.TANGGAL_JATUH_TEMPO))            AS TOTAL_HARI_KETERLAMBATAN,
    SUM(ROUND(
        ja.ANGSURAN_PER_BULAN 
        * (0.1 / 100) 
        * DATEDIFF('2024-08-14', ja.TANGGAL_JATUH_TEMPO)
    ))                                                              AS GRAND_TOTAL_DENDA
FROM KONTRAK k
JOIN JADWAL_ANGSURAN ja 
    ON k.KONTRAK_NO = ja.KONTRAK_NO
LEFT JOIN PEMBAYARAN p 
    ON  ja.KONTRAK_NO  = p.KONTRAK_NO 
    AND ja.ANGSURAN_KE = p.ANGSURAN_KE
WHERE 
    k.CLIENT_NAME              = 'SUGUS'
    AND ja.TANGGAL_JATUH_TEMPO <  '2024-08-14'
    AND p.ID                   IS NULL
GROUP BY 
    k.KONTRAK_NO, 
    k.CLIENT_NAME;

/*
  HASIL:
  ┌─────────────┬─────────────┬───────────────────────────┬──────────────────────────┬──────────────────┐
  │ KONTRAK_NO  │ CLIENT_NAME │ JUMLAH_ANGSURAN_TERLAMBAT │ TOTAL_HARI_KETERLAMBATAN │ GRAND_TOTAL_DENDA│
  ├─────────────┼─────────────┼───────────────────────────┼──────────────────────────┼──────────────────┤
  │ AGR00001    │ SUGUS       │ 2                         │ 70                       │ 9.034.900        │
  └─────────────┴─────────────┴───────────────────────────┴──────────────────────────┴──────────────────┘
*/
