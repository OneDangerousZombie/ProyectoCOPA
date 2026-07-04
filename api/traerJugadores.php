<?php
// api/traerJugadores.php
// Devuelve la lista de jugadores de la LIGA ACTIVA (no todos los usuarios
// del sistema), con su NOMBRE y VALOR_ELO dentro de esa liga.

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/liga_helpers.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

requireLogin();
$idLiga = requireLigaActiva();

$stmt = $conn->prepare(
    'SELECT j.ID_JUGADORES, j.NOMBRE, lm.VALOR_ELO, j.ROL, j.AVATAR_URL, lm.ROL_LIGA
     FROM jugadores j
     JOIN liga_miembros lm ON lm.ID_USUARIO = j.ID_JUGADORES
     WHERE lm.ID_LIGA = ? AND lm.ACTIVO = 1
     ORDER BY j.NOMBRE ASC'
);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error en la consulta: ' . $conn->error]);
    exit;
}

$stmt->bind_param('i', $idLiga);
$stmt->execute();
$result = $stmt->get_result();
$jugadores = [];
while ($row = $result->fetch_assoc()) {
    $jugadores[] = [
        'id' => (int) $row['ID_JUGADORES'],
        'nombre' => $row['NOMBRE'],
        'valor_elo' => (int) round((float) $row['VALOR_ELO']),
        'rol' => $row['ROL'],
        'rol_liga' => (int) $row['ROL_LIGA'],
        'avatar' => $row['AVATAR_URL'] ?? ''
    ];
}

$stmt->close();
$conn->close();

echo json_encode(['ok' => true, 'jugadores' => $jugadores]);
