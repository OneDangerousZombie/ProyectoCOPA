<?php
// api/dev/jugadores.php — v2
// Corregido para la nueva base copatres:
//   - jugadores ya no tiene VALOR_ELO (vive en liga_miembros)
//   - estadisticas usa ID_USUARIO (antes ID_JUGADOR)
//   - jugadores tiene campo MAIL nuevo

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
            SELECT
                j.ID_JUGADORES, j.NOMBRE, j.ROL, j.AVATAR_URL, j.MAIL,
                r.ROL_DESCRIPCION,
                COALESCE(SUM(e.PARTIDOS_JUGADOS),0) as PJ,
                COALESCE(SUM(e.PARTIDOS_GANADOS),0) as PG,
                COALESCE(SUM(e.PARTIDOS_PERDIDOS),0) as PP,
                COALESCE(SUM(e.PARTIDOS_EMPATADOS),0) as PE,
                COALESCE(SUM(e.GOLES),0) as GOLES,
                COALESCE(SUM(e.ASISTENCIAS),0) as ASISTENCIAS,
                ROUND(AVG(lm.VALOR_ELO),2) as ELO_PROMEDIO,
                COUNT(DISTINCT lm.ID_LIGA) as LIGAS
            FROM jugadores j
            LEFT JOIN roles r ON j.ROL = r.ID_ROLES
            LEFT JOIN estadisticas e ON j.ID_JUGADORES = e.ID_USUARIO
            LEFT JOIN liga_miembros lm ON j.ID_JUGADORES = lm.ID_USUARIO AND lm.ACTIVO = 1
            WHERE j.ID_JUGADORES = ?
            GROUP BY j.ID_JUGADORES
        ");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();
        $stmt->close(); $conn->close();
        if (!$res) { http_response_code(404); echo json_encode(['ok'=>false,'error'=>'No encontrado']); exit; }
        echo json_encode(['ok' => true, 'jugador' => $res]);
    } else {
        $res  = $conn->query("
            SELECT
                j.ID_JUGADORES as id, j.NOMBRE as nombre, j.ROL as rol,
                r.ROL_DESCRIPCION as rol_desc, j.MAIL as mail,
                ROUND(AVG(lm.VALOR_ELO),0) as elo,
                COALESCE(SUM(e.PARTIDOS_JUGADOS),0) as pj,
                COALESCE(SUM(e.GOLES),0) as goles,
                COUNT(DISTINCT lm.ID_LIGA) as ligas
            FROM jugadores j
            LEFT JOIN roles r ON j.ROL = r.ID_ROLES
            LEFT JOIN estadisticas e ON j.ID_JUGADORES = e.ID_USUARIO
            LEFT JOIN liga_miembros lm ON j.ID_JUGADORES = lm.ID_USUARIO AND lm.ACTIVO = 1
            GROUP BY j.ID_JUGADORES
            ORDER BY j.ID_JUGADORES ASC
        ");
        $list = [];
        while ($r = $res->fetch_assoc()) $list[] = $r;
        $conn->close();
        echo json_encode(['ok' => true, 'jugadores' => $list]);
    }
    exit;
}

// ── PUT: modificar ────────────────────────────────────────────
if ($method === 'PUT') {
    $input  = json_decode(file_get_contents('php://input'), true);
    $id     = (int)($input['id'] ?? 0);
    $nombre = trim($input['nombre'] ?? '');
    $rol    = (int)($input['rol'] ?? 1);
    $mail   = trim($input['mail'] ?? '');

    if (!$id || !$nombre) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'id y nombre son obligatorios']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE jugadores SET NOMBRE=?, ROL=?, MAIL=? WHERE ID_JUGADORES=?");
    $stmt->bind_param('sisi', $nombre, $rol, $mail, $id);
    $ok = $stmt->execute();
    $stmt->close(); $conn->close();
    echo json_encode(['ok' => $ok]);
    exit;
}

// ── DELETE: eliminar ──────────────────────────────────────────
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $ids   = array_filter(array_map('intval', (array)($input['ids'] ?? [])));

    if (empty($ids)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Se requiere al menos un id']);
        exit;
    }

    $conn->begin_transaction();
    try {
        $ph    = implode(',', array_fill(0, count($ids), '?'));
        $types = str_repeat('i', count($ids));

        // Orden: recolector_eventos → estadisticas → liga_miembros → jugadores
        foreach ([
            "DELETE FROM recolector_eventos WHERE ID_USUARIO IN ($ph)",
            "DELETE FROM estadisticas WHERE ID_USUARIO IN ($ph)",
            "DELETE FROM liga_miembros WHERE ID_USUARIO IN ($ph)",
            "DELETE FROM jugadores WHERE ID_JUGADORES IN ($ph)"
        ] as $sql) {
            $s = $conn->prepare($sql);
            $s->bind_param($types, ...$ids);
            $s->execute(); $s->close();
        }

        $conn->commit();
        echo json_encode(['ok' => true, 'eliminados' => count($ids)]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    }
    $conn->close();
    exit;
}

// ── POST: crear usuario ────────────────────────────────────────
if ($method === 'POST' && isset($_GET['crear'])) {
    $input  = json_decode(file_get_contents('php://input'), true);
    $nombre = trim($input['nombre'] ?? '');
    $rol    = (int)($input['rol'] ?? 1);
    $mail   = trim($input['mail'] ?? '');
    $clave  = trim($input['clave'] ?? '');

    if (!$nombre || !$clave) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'nombre y clave son obligatorios']);
        exit;
    }

    $hash = password_hash($clave, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO jugadores (NOMBRE, ROL, MAIL, CLAVE) VALUES (?,?,?,?)");
    $stmt->bind_param('siss', $nombre, $rol, $mail, $hash);
    $ok    = $stmt->execute();
    $newId = $conn->insert_id;
    $stmt->close(); $conn->close();
    echo json_encode(['ok' => $ok, 'id' => $newId]);
    exit;
}

// ── POST: membresías (para popup habilitar/inhabilitar) ──────
if ($method === 'POST' && isset($_GET['membresias'])) {
    $input = json_decode(file_get_contents('php://input'), true);
    $ids   = array_filter(array_map('intval', (array)($input['ids'] ?? [])));
    if (empty($ids)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ids requeridos']); exit; }
    $ph    = implode(',', array_fill(0, count($ids), '?'));
    $types = str_repeat('i', count($ids));
    $stmt = $conn->prepare("
        SELECT lm.ID_USUARIO, j.NOMBRE as usuario_nombre,
               lm.ID_LIGA, l.NOMBRE as liga_nombre, lm.ACTIVO
        FROM liga_miembros lm
        JOIN jugadores j ON lm.ID_USUARIO = j.ID_JUGADORES
        JOIN ligas l ON lm.ID_LIGA = l.ID_LIGA
        WHERE lm.ID_USUARIO IN ($ph)
        ORDER BY j.NOMBRE, l.NOMBRE
    ");
    $stmt->bind_param($types, ...$ids);
    $stmt->execute();
    $res = $stmt->get_result();
    $list = [];
    while ($r = $res->fetch_assoc()) $list[] = $r;
    $stmt->close(); $conn->close();
    echo json_encode(['ok' => true, 'membresias' => $list]);
    exit;
}

// ── POST: actualizar membresías (activar/desactivar por par) ──
if ($method === 'POST' && isset($_GET['actualizar_membresias'])) {
    $input  = json_decode(file_get_contents('php://input'), true);
    $pares  = (array)($input['pares'] ?? []);
    $estado = (int)($input['estado'] ?? 0);
    if (empty($pares)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'pares requeridos']); exit; }

    $stmt = $conn->prepare("UPDATE liga_miembros SET ACTIVO=? WHERE ID_USUARIO=? AND ID_LIGA=?");
    $ok = true;
    foreach ($pares as $p) {
        $idu = (int)($p['id_usuario'] ?? 0);
        $idl = (int)($p['id_liga'] ?? 0);
        if (!$idu || !$idl) continue;
        $stmt->bind_param('iii', $estado, $idu, $idl);
        if (!$stmt->execute()) $ok = false;
    }
    $stmt->close(); $conn->close();
    echo json_encode(['ok' => $ok, 'actualizadas' => count($pares)]);
    exit;
}

// ── POST: inhabilitar ─────────────────────────────────────────
if ($method === 'POST') {
    // Inhabilitar = poner ACTIVO=0 en liga_miembros para todos los ids
    $input = json_decode(file_get_contents('php://input'), true);
    $ids   = array_filter(array_map('intval', (array)($input['ids'] ?? [])));
    if (empty($ids)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ids requeridos']); exit; }
    $ph    = implode(',', array_fill(0, count($ids), '?'));
    $types = str_repeat('i', count($ids));
    $s     = $conn->prepare("UPDATE liga_miembros SET ACTIVO=0 WHERE ID_USUARIO IN ($ph)");
    $s->bind_param($types, ...$ids);
    $ok = $s->execute(); $s->close(); $conn->close();
    echo json_encode(['ok' => $ok, 'inhabilitados' => count($ids)]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
