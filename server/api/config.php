<?php
// ============================================================
// IMS Finance — Database Config
// EDIT bagian ini dengan kredensial cPanel kamu!
// ============================================================

define('DB_HOST', 'arzano-db.id.rapidplex.com'); // host DB DomaiNesia
define('DB_NAME', 'pitiagic_ims');
define('DB_USER', 'pitiagic_ims');
define('DB_PASS', 'IMS@WWog6wkvYiYEtOdR#2024');

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed: ' . $e->getMessage()]);
    exit;
}
