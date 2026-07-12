<?php
// api/listar_ligas.php
// GET. Devuelve las ligas del usuario logueado y las ligas públicas a las
// que todavía no pertenece (para mostrar en el selector de ligas).
//
// Devuelve { ok: true, misLigas: [...], publicas: [...] }

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/liga_helpers.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$idJugador = requireLogin();

// Ligas a las que ya pertenece.
$stmt = $conn->prepare(
    'SELECT l.ID_LIGA, l.NOMBRE, l.DESCRIPCION, l.FORMATO_DEFAULT, l.PRIVADA, l.CODIGO_INVITACION,
            lm.ROL_LIGA, lm.VALOR_ELO,
            (SELECT COUNT(*) FROM liga_miembros lm2 WHERE lm2.ID_LIGA = l.ID_LIGA AND lm2.ACTIVO = 1) AS CANTIDAD_MIEMBROS
     FROM ligas l
     JOIN liga_miembros lm ON lm.ID_LIGA = l.ID_LIGA
     WHERE lm.ID_USUARIO = ? AND lm.ACTIVO = 1 AND l.ESTADO = 1
     ORDER BY l.NOMBRE ASC'
);
$stmt->bind_param('i', $idJugador);
$stmt->execute();
$result = $stmt->get_result();

$misLigas = [];
$idsPropias = [];
while ($row = $result->fetch_assoc()) {
    $idsPropias[] = (int) $row['ID_LIGA'];
    $misLigas[] = [
        'id' => (int) $row['ID_LIGA'],
        'nombre' => $row['NOMBRE'],
        'descripcion' => $row['DESCRIPCION'],
        'formato_default' => $row['FORMATO_DEFAULT'],
        'privada' => (bool) $row['PRIVADA'],
        'codigo_invitacion' => $row['CODIGO_INVITACION'], // visible para todos los miembros
        'rol_liga' => (int) $row['ROL_LIGA'],
        'valor_elo' => (float) $row['VALOR_ELO'],
        'cantidad_miembros' => (int) $row['CANTIDAD_MIEMBROS']
    ];
}
$stmt->close();

// Ligas públicas a las que todavía no pertenece (para "unirme").
$publicas = [];
$sqlPublicas = 'SELECT l.ID_LIGA, l.NOMBRE, l.DESCRIPCION, l.FORMATO_DEFAULT,
                        (SELECT COUNT(*) FROM liga_miembros lm2 WHERE lm2.ID_LIGA = l.ID_LIGA AND lm2.ACTIVO = 1) AS CANTIDAD_MIEMBROS
                 FROM ligas l
                 WHERE l.PRIVADA = 0 AND l.ESTADO = 1';
if (count($idsPropias) > 0) {
    $sqlPublicas .= ' AND l.ID_LIGA NOT IN (' . implode(',', array_map('intval', $idsPropias)) . ')';
}
$sqlPublicas .= ' ORDER BY CANTIDAD_MIEMBROS DESC, l.NOMBRE ASC';

$resultPublicas = $conn->query($sqlPublicas);
if ($resultPublicas) {
    while ($row = $resultPublicas->fetch_assoc()) {
        $publicas[] = [
            'id' => (int) $row['ID_LIGA'],
            'nombre' => $row['NOMBRE'],
            'descripcion' => $row['DESCRIPCION'],
            'formato_default' => $row['FORMATO_DEFAULT'],
            'cantidad_miembros' => (int) $row['CANTIDAD_MIEMBROS']
        ];
    }
    $resultPublicas->free();
}

echo json_encode(['ok' => true, 'misLigas' => $misLigas, 'publicas' => $publicas]);

$conn->close();