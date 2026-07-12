<?php
// api/partidos.php
// Devuelve los partidos de la LIGA ACTIVA con sus eventos.
// GET → { ok: true, partidos: [...] }
// Cada partido incluye: id, fecha, formato, cancha, equipo1, equipo2,
// goles1, goles2, estado, y eventos (goles, asistencias, cambios).

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

// Traer partidos de la liga
$stmt = $conn->prepare("
    SELECT
        p.ID_PARTIDOS AS id,
        p.FECHA_PARTIDO AS fecha,
        p.FORMATO AS formato,
        c.NOMBRE AS cancha,
        p.ESTADO AS estado
    FROM partidos p
    LEFT JOIN canchas c ON c.ID_CANCHA = p.CANCHA_PARTIDO
    WHERE p.ID_LIGA = ?
    ORDER BY p.FECHA_PARTIDO DESC, p.ID_PARTIDOS DESC
");
$stmt->bind_param('i', $idLiga);
$stmt->execute();
$result = $stmt->get_result();

$partidos = [];
while ($row = $result->fetch_assoc()) {
    $partidoId = (int) $row['id'];

    // Traer eventos del partido
    $stmtEv = $conn->prepare("
        SELECT
            re.ID_USUARIO AS jugador_id,
            j.NOMBRE AS jugador_nombre,
            re.ID_EVENTO_PARTIDO AS tipo_evento,
            re.EQUIPO_EVENTO AS equipo,
            re.MINUTO_EVENTO AS minuto
        FROM recolector_eventos re
        JOIN jugadores j ON j.ID_JUGADORES = re.ID_USUARIO
        WHERE re.ID_PARTIDO = ?
        ORDER BY re.MINUTO_EVENTO ASC
    ");
    $stmtEv->bind_param('i', $partidoId);
    $stmtEv->execute();
    $resEv = $stmtEv->get_result();

    $golesEq1 = 0;
    $golesEq2 = 0;
    $eventos = [];

    while ($ev = $resEv->fetch_assoc()) {
        $tipo = (int) $ev['tipo_evento'];
        $equipo = (int) $ev['equipo'];

        if ($tipo === 1) { // Gol
            if ($equipo === 1) $golesEq1++;
            else $golesEq2++;

            // Buscar asistencia del mismo equipo cerca en tiempo
            $eventos[] = [
                'type' => 'goal',
                'player' => $ev['jugador_nombre'],
                'team' => $equipo === 1 ? 'white' : 'black',
                'minute' => ($ev['minuto'] ?? 0) * 60
            ];
        } elseif ($tipo === 2) { // Asistencia
            // Agregar asistencia al último gol del mismo equipo si no tiene
            for ($i = count($eventos) - 1; $i >= 0; $i--) {
                if ($eventos[$i]['type'] === 'goal' &&
                    $eventos[$i]['team'] === ($equipo === 1 ? 'white' : 'black') &&
                    !isset($eventos[$i]['assist'])) {
                    $eventos[$i]['assist'] = $ev['jugador_nombre'];
                    break;
                }
            }
        } elseif ($tipo === 3) { // Cambio
            $eventos[] = [
                'type' => 'substitution',
                'playerIn' => $ev['jugador_nombre'],
                'team' => $equipo === 1 ? 'white' : 'black',
                'minute' => ($ev['minuto'] ?? 0) * 60
            ];
        }
    }
    $stmtEv->close();

    // Traer jugadores de cada equipo del partido
    $stmtJug = $conn->prepare("
        SELECT DISTINCT
            re.ID_USUARIO AS jugador_id,
            j.NOMBRE AS jugador_nombre,
            MAX(re.EQUIPO_EVENTO) AS equipo
        FROM recolector_eventos re
        JOIN jugadores j ON j.ID_JUGADORES = re.ID_USUARIO
        WHERE re.ID_PARTIDO = ?
        GROUP BY re.ID_USUARIO, j.NOMBRE
    ");
    $stmtJug->bind_param('i', $partidoId);
    $stmtJug->execute();
    $resJug = $stmtJug->get_result();

    $whiteTeam = [];
    $blackTeam = [];
    while ($jug = $resJug->fetch_assoc()) {
        if ((int)$jug['equipo'] === 1) {
            $whiteTeam[] = $jug['jugador_nombre'];
        } else {
            $blackTeam[] = $jug['jugador_nombre'];
        }
    }
    $stmtJug->close();

    $partidos[] = [
        'id' => $partidoId,
        'date' => $row['fecha'],
        'format' => (int) $row['formato'],
        'venue' => $row['cancha'] ?? '',
        'fecha' => date('d M', strtotime($row['fecha'])) . ' — ' . ($row['cancha'] ?? ''),
        'team1Name' => 'BLANCO',
        'team2Name' => 'NEGRO',
        'whiteTeam' => $whiteTeam,
        'blackTeam' => $blackTeam,
        'whiteScore' => $golesEq1,
        'blackScore' => $golesEq2,
        'completed' => true,
        'events' => $eventos
    ];
}

$stmt->close();
$conn->close();

echo json_encode(['ok' => true, 'partidos' => $partidos]);
