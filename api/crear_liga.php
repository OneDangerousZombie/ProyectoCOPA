<?php
// api/crear_liga.php
// Crea una liga nueva. El usuario que la crea queda como admin de esa
// liga (ROL_LIGA=5), con su propio ELO arrancando en 1000, y la deja
// seleccionada como liga activa.
//
// POST { nombre, descripcion?, formato_default?, privada? }
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
$nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
$descripcion = isset($input['descripcion']) ? trim($input['descripcion']) : '';
$formato = (isset($input['formato_default']) && trim($input['formato_default']) !== '') ? trim($input['formato_default']) : 'F5';
$privada = !empty($input['privada']) ? 1 : 0;

if ($nombre === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'El nombre de la liga es obligatorio']);
    exit;
}
if (mb_strlen($nombre) > 50) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'El nombre es demasiado largo (máx. 50 caracteres)']);
    exit;
}

$conn->begin_transaction();

try {
    // Toda liga tiene un código de invitación generado (se use o no ahora;
    // sirve si más adelante la pasan a privada).
    $codigo = generarCodigoInvitacion($conn);

    $stmt = $conn->prepare(
        'INSERT INTO ligas (NOMBRE, DESCRIPCION, ID_CREADOR, FECHA_CREACION, FORMATO_DEFAULT, PRIVADA, CODIGO_INVITACION, ESTADO)
         VALUES (?, ?, ?, CURDATE(), ?, ?, ?, 1)'
    );
    $stmt->bind_param('ssisis', $nombre, $descripcion, $idJugador, $formato, $privada, $codigo);
    if (!$stmt->execute()) {
        throw new Exception('No se pudo crear la liga: ' . $stmt->error);
    }
    $idLiga = $conn->insert_id;
    $stmt->close();

    // El creador entra como admin de su propia liga.
    $stmtMiembro = $conn->prepare(
        'INSERT INTO liga_miembros (ID_LIGA, ID_USUARIO, ROL_LIGA, VALOR_ELO) VALUES (?, ?, 5, 1000.00)'
    );
    $stmtMiembro->bind_param('ii', $idLiga, $idJugador);
    if (!$stmtMiembro->execute()) {
        throw new Exception('No se pudo agregar al creador como admin: ' . $stmtMiembro->error);
    }
    $stmtMiembro->close();

    // Estadísticas en blanco para esta liga.
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

    echo json_encode([
        'ok' => true,
        'liga' => [
            'id' => (int) $idLiga,
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            'formato_default' => $formato,
            'privada' => (bool) $privada,
            'codigo_invitacion' => $codigo,
            'rol_liga' => 5
        ]
    ]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}

$conn->close();
