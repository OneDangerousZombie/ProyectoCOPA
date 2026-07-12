<?php
// api/mis_partidos.php
// Devuelve los partidos en los que participó el usuario logueado
// dentro de la LIGA ACTIVA, con detalle de resultado, goles, asistencias.
//
// GET → { ok: true, partidos: [...] }

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
requireAccesoLiga($conn, $idJugador, $idLiga, 1);

// Traer partidos donde el usuario participó (tiene al menos un evento)
$stmt = $conn->prepare("
    SELECT DISTINCT
        p.ID_PARTIDOS AS id,
        p.FECHA_PARTIDO AS fecha,
        p.FORMATO AS formato,
        c.NOMBRE AS cancha
    FROM partidos p
    JOIN recolector_eventos re ON re.ID_PARTIDO = p.ID_PARTIDOS
    LEFT JOIN canchas c ON c.ID_CANCHA = p.CANCHA_PARTIDO
    WHERE p.ID_LIGA = ? AND re.ID_USUARIO = ?
    ORDER BY p.FECHA_PARTIDO DESC, p.ID_PARTIDOS DESC
    LIMIT 20
");
$stmt->bind_param('ii', $idLiga, $idJugador);
$stmt->execute();
$result = $stmt->get_result();

$partidos = [];
while ($row = $result->fetch_assoc()) {
    $partidoId = (int) $row['id'];

    // Goles por equipo
    $stmtGoles = $conn->prepare("
        SELECT
            EQUIPO_EVENTO AS equipo,
            COUNT(*) AS goles
        FROM recolector_eventos
        WHERE ID_PARTIDO = ? AND ID_EVENTO_PARTIDO = 1
        GROUP BY EQUIPO_EVENTO
    ");
    $stmtGoles->bind_param('i', $partidoId);
    $stmtGoles->execute();
    $resGoles = $stmtGoles->get_result();

    $golesEq1 = 0;
    $golesEq2 = 0;
    while ($g = $resGoles->fetch_assoc()) {
        if ((int)$g['equipo'] === 1) $golesEq1 = (int)$g['goles'];
        else $golesEq2 = (int)$g['goles'];
    }
    $stmtGoles->close();

    // En qué equipo jugó el usuario
    $stmtEquipo = $conn->prepare("
        SELECT MAX(EQUIPO_EVENTO) AS equipo
        FROM recolector_eventos
        WHERE ID_PARTIDO = ? AND ID_USUARIO = ?
    ");
    $stmtEquipo->bind_param('ii', $partidoId, $idJugador);
    $stmtEquipo->execute();
    $miEquipo = (int)($stmtEquipo->get_result()->fetch_assoc()['equipo'] ?? 0);
    $stmtEquipo->close();

    // Goles y asistencias del usuario en este partido
    $stmtStats = $conn->prepare("
        SELECT
            SUM(CASE WHEN ID_EVENTO_PARTIDO = 1 THEN 1 ELSE 0 END) AS goles,
            SUM(CASE WHEN ID_EVENTO_PARTIDO = 2 THEN 1 ELSE 0 END) AS asistencias
        FROM recolector_eventos
        WHERE ID_PARTIDO = ? AND ID_USUARIO = ?
    ");
    $stmtStats->bind_param('ii', $partidoId, $idJugador);
    $stmtStats->execute();
    $stats = $stmtStats->get_result()->fetch_assoc();
    $stmtStats->close();

    // Determinar resultado
    $miGoles = $miEquipo === 1 ? $golesEq1 : $golesEq2;
    $rivalGoles = $miEquipo === 1 ? $golesEq2 : $golesEq1;
    $resultado = 'draw';
    if ($miGoles > $rivalGoles) $resultado = 'win';
    elseif ($miGoles < $rivalGoles) $resultado = 'loss';

    $partidos[] = [
        'id' => $partidoId,
        'fecha' => $row['fecha'],
        'fechaLabel' => date('d M', strtotime($row['fecha'])) . ' — ' . ($row['cancha'] ?? ''),
        'formato' => (int) $row['formato'],
        'equipo' => $miEquipo === 1 ? 'BLANCO' : 'NEGRO',
        'miGoles' => $miGoles,
        'rivalGoles' => $rivalGoles,
        'goles' => (int) ($stats['goles'] ?? 0),
        'asistencias' => (int) ($stats['asistencias'] ?? 0),
        'resultado' => $resultado
    ];
}

$stmt->close();
$conn->close();

echo json_encode(['ok' => true, 'partidos' => $partidos]);
