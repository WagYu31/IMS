-- ============================================================
-- IMS Finance — MySQL Setup
-- Jalankan di phpMyAdmin setelah buat database baru
-- ============================================================

CREATE TABLE IF NOT EXISTS contracts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  kontrak_no  VARCHAR(20)  NOT NULL UNIQUE,
  client_name VARCHAR(100) NOT NULL,
  form_data   JSON         NOT NULL,
  hasil_data  JSON         NOT NULL,
  jadwal_data JSON         NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
