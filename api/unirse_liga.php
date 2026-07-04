<?php
// api/unirse_liga.php
// Une al usuario logueado a una liga, ya sea por ID (liga pública, listada
// en el selector) o por código de invitación (liga privada).
//
// POST { id_liga? , codigo? }  -- mandar uno de los dos
// Devuelve { ok: true, liga: {...} }

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/liga_helpers.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$idJugador = requireLogin();

$input = json_decode(file_get_contents('php://input'), true);
$idLigaInput = isset($input['id_liga']) && is_numeric($input['id_liga']) ? (int) $input['id_liga'] : null;
$codigo = isset($input['codigo']) ? strtoupper(trim($input['codigo'])) : '';

if (!$idLigaInput && $codigo === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Indicá una liga o un código de invitación']);
    exit;
}

// Buscar la liga por ID (debe ser pública) o por código (puede ser privada).
if ($codigo !== '') {
    $stmt = $conn->prepare('SELECT ID_LIGA, NOMBRE, PRIVADA, ESTADO FROM ligas WHERE CODIGO_INVITACION = ? LIMIT 1');
    $stmt->bind_param('s', $codigo);
} else {
    $stmt = $conn->prepare('SELECT ID_LIGA, NOMBRE, PRIVADA, ESTADO FROM ligas WHERE ID_LIGA = ? AND PRIVADA = 0 LIMIT 1');
    $stmt->bind_param('i', $idLigaInput);
}
$stmt->execute();
$liga = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$liga) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'No encontramos ninguna liga con esos datos']);
    exit;
}
if ((int) $liga['ESTADO'] !== 1) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Esa liga no está activa']);
    exit;
}

$idLiga = (int) $liga['ID_LIGA'];

// ¿Ya es miembro?
$yaEsMiembro = verificarAccesoLiga($conn, $idJugador, $idLiga);
if ($yaEsMiembro !== null) {
    // Ya pertenece: simplemente la seleccionamos como activa.
    $_SESSION['id_liga_activa'] = $idLiga;
    echo json_encode(['ok' => true, 'liga' => ['id' => $idLiga, 'nombre' => $liga['NOMBRE'], 'rol_liga' => $yaEsMiembro], 'yaEraMiembro' => true]);
    $conn->close();
    exit;
}

$conn->begin_transaction();
try {
    $stmtMiembro = $conn->prepare('INSERT INTO liga_miembros (ID_LIGA, ID_USUARIO, ROL_LIGA, VALOR_ELO) VALUES (?, ?, 1, 1000.00)');
    $stmtMiembro->bind_param('ii', $idLiga, $idJugador);
    if (!$stmtMiembro->execute()) {
        throw new Exception('No se pudo unir a la liga: ' . $stmtMiembro->error);
    }
    $stmtMiembro->close();

    $stmtStats = $conn->prepare(
        'INSERT INTO estadisticas (ID_LIGA, ID_USUARIO, PARTIDOS_JUGADOS, PARTIDOS_GANADOS, PARTIDOS_PERDIDOS, PARTIDOS_EMPATADOS, GOLES, ASISTENCIAS, RACHA)
         VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0)'
    );
    $stmtStats->bind_param('ii', $idLiga, $idJugador);
    if (!$stmtStats->execute()) {
        throw new Exception('No se pudieron inicializar las estadísticas: ' . $stmtStats->error);
    }
    $stmtStats->close();

    $conn->commit();

    $_SESSION['id_liga_activa'] = $idLiga;

    echo json_encode(['ok' => true, 'liga' => ['id' => $idLiga, 'nombre' => $liga['NOMBRE'], 'rol_liga' => 1], 'yaEraMiembro' => false]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}

$conn->close();
