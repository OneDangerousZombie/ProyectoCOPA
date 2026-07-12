<?php
// api/dev/ligas.php — v2
// La tabla ligas YA EXISTE en copatres. Implementación real completa.
// GET    → lista todas las ligas con nombre del creador y conteo de miembros
// GET ?id=N → detalle de una liga
// POST   → crea una liga nueva
// PUT    → modifica una liga
// DELETE → elimina una o varias ligas (con sus canchas y miembros por CASCADE)

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
            SELECT l.*, j.NOMBRE as creador_nombre,
                   COUNT(lm.ID_USUARIO) as total_miembros
            FROM ligas l
            LEFT JOIN jugadores j ON l.ID_CREADOR = j.ID_JUGADORES
            LEFT JOIN liga_miembros lm ON l.ID_LIGA = lm.ID_LIGA AND lm.ACTIVO = 1
            WHERE l.ID_LIGA = ?
            GROUP BY l.ID_LIGA
        ");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $r = $stmt->get_result()->fetch_assoc();
        $stmt->close(); $conn->close();
        if (!$r) { http_response_code(404); echo json_encode(['ok'=>false,'error'=>'Liga no encontrada']); exit; }
        echo json_encode(['ok' => true, 'liga' => $r]);
    } else {
        $res = $conn->query("
            SELECT l.ID_LIGA as id, l.NOMBRE as nombre, l.DESCRIPCION as descripcion,
                   l.FECHA_CREACION as fecha_creacion, l.FORMATO_DEFAULT as formato,
                   l.PRIVADA as privada, l.CODIGO_INVITACION as codigo,
                   l.ESTADO as estado, j.NOMBRE as creador,
                   COUNT(lm.ID_USUARIO) as miembros,
                   (SELECT COUNT(*) FROM partidos p WHERE p.ID_LIGA = l.ID_LIGA) as partidos
            FROM ligas l
            LEFT JOIN jugadores j ON l.ID_CREADOR = j.ID_JUGADORES
            LEFT JOIN liga_miembros lm ON l.ID_LIGA = lm.ID_LIGA AND lm.ACTIVO = 1
            GROUP BY l.ID_LIGA ORDER BY l.ID_LIGA DESC
        ");
        $list = [];
        while ($r = $res->fetch_assoc()) $list[] = $r;
        $conn->close();
        echo json_encode(['ok' => true, 'ligas' => $list]);
    }
    exit;
}

// ── POST: inhabilitar/habilitar ──────────────────────────────
if ($method === 'POST' && isset($_GET['inhabilitar'])) {
    $input  = json_decode(file_get_contents('php://input'), true);
    $ids    = array_filter(array_map('intval', (array)($input['ids'] ?? [])));
    $estado = (int)($input['estado'] ?? 0);
    if (empty($ids)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ids requeridos']); exit; }
    $ph    = implode(',', array_fill(0, count($ids), '?'));
    $types = 'i' . str_repeat('i', count($ids));
    $s     = $conn->prepare("UPDATE ligas SET ESTADO=? WHERE ID_LIGA IN ($ph)");
    $s->bind_param($types, $estado, ...$ids);
    $ok = $s->execute(); $s->close(); $conn->close();
    echo json_encode(['ok' => $ok, 'actualizadas' => count($ids)]);
    exit;
}

// ── POST: crear ───────────────────────────────────────────────
if ($method === 'POST') {
    $input      = json_decode(file_get_contents('php://input'), true);
    $nombre     = trim($input['nombre']      ?? '');
    $descripcion= trim($input['descripcion'] ?? '');
    $formato    = trim($input['formato']     ?? 'F5');
    $privada    = (int)($input['privada']    ?? 0);
    $id_creador = (int)$_SESSION['ID_JUGADOR'];
    $fecha      = date('Y-m-d');

    if (!$nombre) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'El nombre es obligatorio']);
        exit;
    }

    // Código de invitación único de 6 caracteres
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    do {
        $codigo = '';
        for ($i = 0; $i < 6; $i++) $codigo .= $chars[random_int(0, strlen($chars)-1)];
        $check = $conn->prepare("SELECT ID_LIGA FROM ligas WHERE CODIGO_INVITACION = ?");
        $check->bind_param('s', $codigo); $check->execute();
        $exists = $check->get_result()->num_rows > 0; $check->close();
    } while ($exists);

    $stmt = $conn->prepare("INSERT INTO ligas (NOMBRE, DESCRIPCION, ID_CREADOR, FECHA_CREACION, FORMATO_DEFAULT, PRIVADA, CODIGO_INVITACION) VALUES (?,?,?,?,?,?,?)");
    $stmt->bind_param('ssissis', $nombre, $descripcion, $id_creador, $fecha, $formato, $privada, $codigo);
    $ok    = $stmt->execute();
    $newId = $conn->insert_id;
    $stmt->close(); $conn->close();
    echo json_encode(['ok' => $ok, 'id' => $newId, 'codigo' => $codigo]);
    exit;
}

// ── PUT: modificar ────────────────────────────────────────────
if ($method === 'PUT') {
    $input      = json_decode(file_get_contents('php://input'), true);
    $id         = (int)($input['id']         ?? 0);
    $nombre     = trim($input['nombre']      ?? '');
    $descripcion= trim($input['descripcion'] ?? '');
    $formato    = trim($input['formato']     ?? 'F5');
    $privada    = (int)($input['privada']    ?? 0);
    $estado     = (int)($input['estado']     ?? 1);

    if (!$id || !$nombre) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'id y nombre son obligatorios']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE ligas SET NOMBRE=?, DESCRIPCION=?, FORMATO_DEFAULT=?, PRIVADA=?, ESTADO=? WHERE ID_LIGA=?");
    $stmt->bind_param('sssiii', $nombre, $descripcion, $formato, $privada, $estado, $id);
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

    $conn->begin_transaction();
    $conn->begin_transaction();
try {
    // Borrar dependencias sin CASCADE antes de la liga, en orden
    $s_ev = $conn->prepare("
        DELETE re FROM recolector_eventos re
        JOIN partidos p ON re.ID_PARTIDO = p.ID_PARTIDOS
        WHERE p.ID_LIGA IN ($ph)
    ");
    $s_ev->bind_param($types, ...$ids);
    $s_ev->execute(); $s_ev->close();

    $s0 = $conn->prepare("DELETE FROM estadisticas WHERE ID_LIGA IN ($ph)");
    $s0->bind_param($types, ...$ids);
    $s0->execute(); $s0->close();

    $s_p = $conn->prepare("DELETE FROM partidos WHERE ID_LIGA IN ($ph)");
    $s_p->bind_param($types, ...$ids);
    $s_p->execute(); $s_p->close();

    $s1 = $conn->prepare("DELETE FROM canchas WHERE ID_LIGA IN ($ph)");
    $s1->bind_param($types, ...$ids);
    $s1->execute(); $s1->close();

    $stmt = $conn->prepare("DELETE FROM ligas WHERE ID_LIGA IN ($ph)");
    $stmt->bind_param($types, ...$ids);
    $stmt->execute(); $stmt->close();

    $conn->commit();
    echo json_encode(['ok' => true, 'eliminadas' => count($ids)]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
