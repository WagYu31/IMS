-- ============================================================
--  IMS Finance — Schema Database
--  PT. Inovasi Mitra Sejati
--  Developer Assessment 2024
-- ============================================================

-- Drop existing tables (jika ada)
DROP TABLE IF EXISTS PEMBAYARAN;
DROP TABLE IF EXISTS JADWAL_ANGSURAN;
DROP TABLE IF EXISTS KONTRAK;

-- ============================================================
--  1. Tabel KONTRAK
-- ============================================================
CREATE TABLE KONTRAK (
    KONTRAK_NO          VARCHAR(20)     PRIMARY KEY,
    CLIENT_NAME         VARCHAR(100)    NOT NULL,
    OTR                 DECIMAL(15, 0)  NOT NULL          COMMENT 'Harga On The Road',
    DP_PERSEN           DECIMAL(5, 2)   NOT NULL DEFAULT 0 COMMENT 'Persen Down Payment',
    DP_NOMINAL          DECIMAL(15, 0)  NOT NULL GENERATED ALWAYS AS (OTR * DP_PERSEN / 100) STORED,
    POKOK_PINJAMAN      DECIMAL(15, 0)  NOT NULL GENERATED ALWAYS AS (OTR - (OTR * DP_PERSEN / 100)) STORED,
    TENOR_BULAN         INT             NOT NULL,
    BUNGA_FLAT_PERTAHUN DECIMAL(6, 3)   NOT NULL          COMMENT 'Bunga flat per tahun dalam persen',
    TGL_AKAD            DATE            NOT NULL,
    CREATED_AT          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  2. Tabel JADWAL_ANGSURAN
-- ============================================================
CREATE TABLE JADWAL_ANGSURAN (
    ID                  INT             AUTO_INCREMENT PRIMARY KEY,
    KONTRAK_NO          VARCHAR(20)     NOT NULL,
    ANGSURAN_KE         INT             NOT NULL,
    ANGSURAN_PER_BULAN  DECIMAL(15, 0)  NOT NULL,
    TANGGAL_JATUH_TEMPO DATE            NOT NULL,
    CONSTRAINT fk_jadwal_kontrak FOREIGN KEY (KONTRAK_NO) REFERENCES KONTRAK(KONTRAK_NO),
    CONSTRAINT uq_jadwal UNIQUE (KONTRAK_NO, ANGSURAN_KE)
);

-- ============================================================
--  3. Tabel PEMBAYARAN
-- ============================================================
CREATE TABLE PEMBAYARAN (
    ID                  INT             AUTO_INCREMENT PRIMARY KEY,
    KONTRAK_NO          VARCHAR(20)     NOT NULL,
    ANGSURAN_KE         INT             NOT NULL,
    TGL_BAYAR           DATE            NOT NULL,
    NOMINAL_BAYAR       DECIMAL(15, 0)  NOT NULL,
    KETERANGAN          VARCHAR(255),
    CREATED_AT          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bayar_kontrak FOREIGN KEY (KONTRAK_NO) REFERENCES KONTRAK(KONTRAK_NO)
);

-- ============================================================
--  SEED DATA — Kasus Pak Sugus (AGR00001)
-- ============================================================

-- Kontrak
INSERT INTO KONTRAK (KONTRAK_NO, CLIENT_NAME, OTR, DP_PERSEN, TENOR_BULAN, BUNGA_FLAT_PERTAHUN, TGL_AKAD)
VALUES ('AGR00001', 'SUGUS', 240000000, 20, 18, 14, '2023-12-25');

-- Jadwal Angsuran (18 bulan, angsuran = 12.907.000)
-- Formula: Pokok=192.000.000, Bunga total=192jt × 14%/thn × 1.5thn=40.320.000
-- Angsuran = (192.000.000 + 40.320.000) / 18 = ~12.906.667 → dibulatkan soal menjadi 12.907.000
INSERT INTO JADWAL_ANGSURAN (KONTRAK_NO, ANGSURAN_KE, ANGSURAN_PER_BULAN, TANGGAL_JATUH_TEMPO) VALUES
('AGR00001',  1, 12907000, '2024-01-25'),
('AGR00001',  2, 12907000, '2024-02-25'),
('AGR00001',  3, 12907000, '2024-03-25'),
('AGR00001',  4, 12907000, '2024-04-25'),
('AGR00001',  5, 12907000, '2024-05-25'),
('AGR00001',  6, 12907000, '2024-06-25'),
('AGR00001',  7, 12907000, '2024-07-25'),
('AGR00001',  8, 12907000, '2024-08-25'),
('AGR00001',  9, 12907000, '2024-09-25'),
('AGR00001', 10, 12907000, '2024-10-25'),
('AGR00001', 11, 12907000, '2024-11-25'),
('AGR00001', 12, 12907000, '2024-12-25'),
('AGR00001', 13, 12907000, '2025-01-25'),
('AGR00001', 14, 12907000, '2025-02-25'),
('AGR00001', 15, 12907000, '2025-03-25'),
('AGR00001', 16, 12907000, '2025-04-25'),
('AGR00001', 17, 12907000, '2025-05-25'),
('AGR00001', 18, 12907000, '2025-06-25');

-- Pembayaran (Pak Sugus bayar tepat waktu s/d angsuran ke-5 = Mei 2024)
INSERT INTO PEMBAYARAN (KONTRAK_NO, ANGSURAN_KE, TGL_BAYAR, NOMINAL_BAYAR, KETERANGAN) VALUES
('AGR00001', 1, '2024-01-25', 12907000, 'Pembayaran tepat waktu'),
('AGR00001', 2, '2024-02-25', 12907000, 'Pembayaran tepat waktu'),
('AGR00001', 3, '2024-03-25', 12907000, 'Pembayaran tepat waktu'),
('AGR00001', 4, '2024-04-25', 12907000, 'Pembayaran tepat waktu'),
('AGR00001', 5, '2024-05-25', 12907000, 'Pembayaran tepat waktu');
-- Angsuran ke-6 (Juni) dan ke-7 (Juli) BELUM DIBAYAR per 14 Agustus 2024
