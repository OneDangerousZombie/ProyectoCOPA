<?php
// api/dev/canchas.php — v2
// Corregido: canchas ahora tiene ID_LIGA (FK a ligas), obligatorio al crear.

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';
session_start();

if (!isset($_SESSION['ID_JUGADOR']) || (int)($_SESSION['jugador_rol'] ?? 0) !== 9) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Acceso restringido a DEV']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $id   = (int)$_GET['id'];
        $stmt = $conn->prepare("
            SELECT c.*, l.NOMBRE as liga_nombre,
                   (SELECT COUNT(*) FROM partidos p WHERE p.CANCHA_PARTIDO = c.ID_CANCHA) as partidos_jugados
            FROM canchas c
            LEFT JOIN ligas l ON c.ID_LIGA = l.ID_LIGA
            WHERE c.ID_CANCHA = ?
        ");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $r = $stmt->get_result()->fetch_assoc();
        $stmt->close(); $conn->close();
        if (!$r) { http_response_code(404); echo json_encode(['ok'=>false,'error'=>'Cancha no encontrada']); exit; }
        echo json_encode(['ok' => true, 'cancha' => $r]);
    } else {
        $res  = $conn->query("
            SELECT c.ID_CANCHA as id, c.NOMBRE as nombre, c.DIRECCION as direccion,
                   c.LOCALIDAD as localidad, c.ID_LIGA as id_liga, l.NOMBRE as liga_nombre,
                   COUNT(p.ID_PARTIDOS) as partidos_jugados
            FROM canchas c
            LEFT JOIN ligas l ON c.ID_LIGA = l.ID_LIGA
            LEFT JOIN partidos p ON c.ID_CANCHA = p.CANCHA_PARTIDO
            GROUP BY c.ID_CANCHA ORDER BY c.ID_CANCHA ASC
        ");
        $list = [];
        while ($r = $res->fetch_assoc()) $list[] = $r;
        $conn->close();
        echo json_encode(['ok' => true, 'canchas' => $list]);
    }
    exit;
}

// ── POST: crear ───────────────────────────────────────────────
if ($method === 'POST') {
    $input     = json_decode(file_get_contents('php://input'), true);
    $nombre    = trim($input['nombre']    ?? '');
    $dir       = trim($input['direccion'] ?? '');
    $localidad = trim($input['localidad'] ?? '');
    $id_liga   = (int)($input['id_liga'] ?? 0);

    if (!$nombre || !$dir || !$localidad || !$id_liga) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Todos los campos son obligatorios (incluido id_liga)']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO canchas (ID_LIGA, NOMBRE, DIRECCION, LOCALIDAD) VALUES (?,?,?,?)");
    $stmt->bind_param('isss', $id_liga, $nombre, $dir, $localidad);
    $ok = $stmt->execute();
    $newId = $conn->insert_id;
    $stmt->close(); $conn->close();
    echo json_encode(['ok' => $ok, 'id' => $newId]);
    exit;
}

// ── PUT: modificar ────────────────────────────────────────────
if ($method === 'PUT') {
    $input     = json_decode(file_get_contents('php://input'), true);
    $id        = (int)($input['id']      ?? 0);
    $nombre    = trim($input['nombre']    ?? '');
    $dir       = trim($input['direccion'] ?? '');
    $localidad = trim($input['localidad'] ?? '');
    $id_liga   = (int)($input['id_liga'] ?? 0);

    if (!$id || !$nombre || !$dir || !$localidad || !$id_liga) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Todos los campos son obligatorios']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE canchas SET ID_LIGA=?, NOMBRE=?, DIRECCION=?, LOCALIDAD=? WHERE ID_CANCHA=?");
    $stmt->bind_param('isssi', $id_liga, $nombre, $dir, $localidad, $id);
    $ok = $stmt->execute();
    $stmt->close(); $conn->close();
    echo json_encode(['ok' => $ok]);
    exit;
}

// ── DELETE ────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $ids   = array_filter(array_map('intval', (array)($input['ids'] ?? [])));

    if (empty($ids)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Se requiere al menos un id']);
        exit;
    }

    $ph    = implode(',', array_fill(0, count($ids), '?'));
    $types = str_repeat('i', count($ids));
    $stmt  = $conn->prepare("DELETE FROM canchas WHERE ID_CANCHA IN ($ph)");
    $stmt->bind_param($types, ...$ids);
    $ok = $stmt->execute();
    $stmt->close(); $conn->close();
    echo json_encode(['ok' => $ok, 'eliminados' => count($ids)]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
