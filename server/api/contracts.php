<?php
// ============================================================
// IMS Finance — Contracts REST API
// Endpoint: /api/contracts.php
// ============================================================

// CORS headers — allow React app to call this API
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents('php://input'), true) ?? [];

// ── GET: ambil semua kontrak ──────────────────────────────────
if ($method === 'GET') {
    $rows = $pdo->query(
        'SELECT kontrak_no, client_name, form_data, hasil_data, jadwal_data
         FROM contracts ORDER BY created_at ASC'
    )->fetchAll();

    $contracts = array_map(fn($r) => [
        'kontrakNo'  => $r['kontrak_no'],
        'clientName' => $r['client_name'],
        'form'       => json_decode($r['form_data'],   true),
        'hasil'      => json_decode($r['hasil_data'],  true),
        'jadwal'     => json_decode($r['jadwal_data'], true),
    ], $rows);

    echo json_encode($contracts);
    exit;
}

// ── POST: simpan / update kontrak ────────────────────────────
if ($method === 'POST') {
    $required = ['kontrakNo', 'clientName', 'form', 'hasil', 'jadwal'];
    foreach ($required as $key) {
        if (empty($input[$key])) {
            http_response_code(400);
            echo json_encode(['error' => "Field '$key' wajib diisi"]);
            exit;
        }
    }

    $stmt = $pdo->prepare(
        'INSERT INTO contracts (kontrak_no, client_name, form_data, hasil_data, jadwal_data)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           client_name = VALUES(client_name),
           form_data   = VALUES(form_data),
           hasil_data  = VALUES(hasil_data),
           jadwal_data = VALUES(jadwal_data),
           updated_at  = NOW()'
    );
    $stmt->execute([
        $input['kontrakNo'],
        $input['clientName'],
        json_encode($input['form']),
        json_encode($input['hasil']),
        json_encode($input['jadwal']),
    ]);

    echo json_encode(['success' => true, 'kontrakNo' => $input['kontrakNo']]);
    exit;
}

// ── DELETE: hapus kontrak ─────────────────────────────────────
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Parameter id wajib ada']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM contracts WHERE kontrak_no = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
