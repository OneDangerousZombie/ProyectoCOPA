<?php
// api/estadisticas.php
// Devuelve las estadísticas de TODOS los jugadores de la LIGA ACTIVA,
// con JOIN a jugadores (nombre, avatar) y liga_miembros (elo).
//
// GET → { ok: true, estadisticas: [...] }
// Cada fila incluye: id, nombre, avatar, elo, pj, pg, pe, pp, goles, asistencias, racha

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
$idLiga = requireLigaActiva();
requireAccesoLiga($conn, $idJugador, $idLiga, 1); // cualquier miembro puede ver stats

// Traer estadísticas de la liga activa, con nombre y avatar del jugador
$stmt = $conn->prepare("
    SELECT
        j.ID_JUGADORES AS id,
        j.NOMBRE AS nombre,
        j.AVATAR_URL AS avatar,
        lm.VALOR_ELO AS elo,
        COALESCE(e.PARTIDOS_JUGADOS, 0) AS pj,
        COALESCE(e.PARTIDOS_GANADOS, 0) AS pg,
        COALESCE(e.PARTIDOS_PERDIDOS, 0) AS pp,
        COALESCE(e.PARTIDOS_EMPATADOS, 0) AS pe,
        COALESCE(e.GOLES, 0) AS goles,
        COALESCE(e.ASISTENCIAS, 0) AS asistencias,
        COALESCE(e.RACHA, 0) AS racha
    FROM jugadores j
    JOIN liga_miembros lm ON lm.ID_USUARIO = j.ID_JUGADORES AND lm.ID_LIGA = ? AND lm.ACTIVO = 1
    LEFT JOIN estadisticas e ON e.ID_USUARIO = j.ID_JUGADORES AND e.ID_LIGA = ?
    ORDER BY j.NOMBRE ASC
");

$stmt->bind_param('ii', $idLiga, $idLiga);
$stmt->execute();
$result = $stmt->get_result();

$estadisticas = [];
while ($row = $result->fetch_assoc()) {
    $estadisticas[] = [
        'id'          => (int) $row['id'],
        'nombre'      => $row['nombre'],
        'avatar'      => $row['avatar'] ?? '',
        'elo'         => (float) $row['elo'],
        'pj'          => (int) $row['pj'],
        'pg'          => (int) $row['pg'],
        'pp'          => (int) $row['pp'],
        'pe'          => (int) $row['pe'],
        'goles'       => (int) $row['goles'],
        'asistencias' => (int) $row['asistencias'],
        'racha'       => (int) $row['racha'],
    ];
}

$stmt->close();
$conn->close();

echo json_encode(['ok' => true, 'estadisticas' => $estadisticas]);
