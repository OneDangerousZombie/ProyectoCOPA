<?php
// api/saveMatchEvents.php
// Carga un nuevo partido en la tabla partidos (dentro de la LIGA ACTIVA) y
// registra los eventos asociados en recolector_eventos. Actualiza
// estadísticas y ELO, ambos scopeados a esa liga.

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/liga_helpers.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$idJugadorSesion = requireLogin();
$idLiga = requireLigaActiva();
requireAccesoLiga($conn, $idJugadorSesion, $idLiga, 1); // cualquier miembro puede cargar partidos

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input) || !isset($input['match']) || !is_array($input['match'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Payload inválido']);
    exit;
}

$match = $input['match'];
$events = isset($input['events']) && is_array($input['events']) ? $input['events'] : [];

$fecha  = isset($match['date']) && trim($match['date']) !== '' ? trim($match['date']) : date('Y-m-d');
$formato = isset($match['format']) && trim($match['format']) !== '' ? trim($match['format']) : 'F5';
$venue  = isset($match['venue']) ? trim($match['venue']) : '';
$canchaId = isset($match['canchaId']) && is_numeric($match['canchaId']) ? (int) $match['canchaId'] : null;

// Roster completo del partido (TODOS los jugadores de cada equipo, tengan o
// no contribución). Se usa para registrar el evento NGNA (ID_EVENTO_PARTIDO
// = 6) a quien participó del partido pero no tuvo GOL/ASISTENCIA/CAMBIO.
$rosterWhite = isset($match['rosterWhite']) && is_array($match['rosterWhite'])
    ? array_values(array_unique(array_map('intval', $match['rosterWhite'])))
    : [];
$rosterBlack = isset($match['rosterBlack']) && is_array($match['rosterBlack'])
    ? array_values(array_unique(array_map('intval', $match['rosterBlack'])))
    : [];

// Validamos que todos los jugadores del roster pertenezcan a la liga
// activa. Esto evita que, por error o manipulación del payload, se
// mezclen jugadores de otra liga en el ELO/estadísticas de esta.
function validarRosterEnLiga($conn, $idLiga, array $idsJugadores) {
    if (count($idsJugadores) === 0) {
        return [];
    }
    $idsList = implode(',', array_map('intval', $idsJugadores));
    $result = $conn->query("SELECT ID_USUARIO FROM liga_miembros WHERE ID_LIGA = $idLiga AND ID_USUARIO IN ($idsList) AND ACTIVO = 1");
    if (!$result) {
        throw new Exception('Error validando jugadores de la liga: ' . $conn->error);
    }
    $validos = [];
    while ($row = $result->fetch_assoc()) {
        $validos[] = (int) $row['ID_USUARIO'];
    }
    $result->free();
    return $validos;
}

function findCanchaId($conn, $idLiga, $venue) {
    if ($venue !== '') {
        $search = '%' . strtolower($venue) . '%';
        $stmt = $conn->prepare('SELECT ID_CANCHA FROM canchas WHERE ID_LIGA = ? AND (LOWER(NOMBRE) LIKE ? OR LOWER(DIRECCION) LIKE ? OR LOWER(LOCALIDAD) LIKE ?) LIMIT 1');
        if ($stmt) {
            $stmt->bind_param('isss', $idLiga, $search, $search, $search);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            if ($row) {
                return (int) $row['ID_CANCHA'];
            }
        }
    }

    // Si no vino nombre de cancha o no matcheó ninguna, usamos la primera
    // cancha disponible de la liga activa.
    $stmt = $conn->prepare('SELECT ID_CANCHA FROM canchas WHERE ID_LIGA = ? ORDER BY ID_CANCHA ASC LIMIT 1');
    $stmt->bind_param('i', $idLiga);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) {
        throw new Exception('Esta liga todavía no tiene canchas cargadas. Agregá una cancha antes de cargar un partido.');
    }
    return (int) $row['ID_CANCHA'];
}

$conn->begin_transaction();

try {
    if ($canchaId === null) {
        $canchaId = findCanchaId($conn, $idLiga, $venue);
    } else {
        // Verificamos que la cancha indicada pertenezca a la liga activa.
        $stmtCheck = $conn->prepare('SELECT 1 FROM canchas WHERE ID_CANCHA = ? AND ID_LIGA = ? LIMIT 1');
        $stmtCheck->bind_param('ii', $canchaId, $idLiga);
        $stmtCheck->execute();
        $existeCancha = $stmtCheck->get_result()->num_rows > 0;
        $stmtCheck->close();
        if (!$existeCancha) {
            throw new Exception('La cancha indicada no pertenece a la liga activa');
        }
    }

    $rosterWhite = validarRosterEnLiga($conn, $idLiga, $rosterWhite);
    $rosterBlack = validarRosterEnLiga($conn, $idLiga, $rosterBlack);

    $insertPartido = $conn->prepare('INSERT INTO partidos (ID_LIGA, FECHA_PARTIDO, FORMATO, CANCHA_PARTIDO, ESTADO) VALUES (?, ?, ?, ?, 1)');
    if (!$insertPartido) {
        throw new Exception('Error preparando inserción de partido: ' . $conn->error);
    }

    if (!$insertPartido->bind_param('issi', $idLiga, $fecha, $formato, $canchaId)) {
        throw new Exception('Error vinculando parámetros de partido: ' . $insertPartido->error);
    }

    if (!$insertPartido->execute()) {
        throw new Exception('Error al insertar partido: ' . $insertPartido->error);
    }

    $partidoId = $conn->insert_id;
    $insertPartido->close();

    $insertEvento = $conn->prepare('INSERT INTO recolector_eventos (ID_PARTIDO, ID_USUARIO, ID_EVENTO_PARTIDO, EQUIPO_EVENTO) VALUES (?, ?, ?, ?)');
    if (!$insertEvento) {
        throw new Exception('Error preparando inserción de evento: ' . $conn->error);
    }

    foreach ($events as $event) {
        if (!is_array($event) || !isset($event['type']) || !isset($event['team'])) {
            continue;
        }

        $teamNum = $event['team'] === 'white' ? 1 : 2;

        if ($event['type'] === 'goal') {
            if (!isset($event['playerId']) || !is_numeric($event['playerId'])) {
                continue;
            }
            $scorerId = (int) $event['playerId'];
            $tipoEvento = 1;
            $insertEvento->bind_param('iiii', $partidoId, $scorerId, $tipoEvento, $teamNum);
            if (!$insertEvento->execute()) {
                throw new Exception('Error al insertar gol: ' . $insertEvento->error);
            }

            if (isset($event['assistId']) && is_numeric($event['assistId'])) {
                $assistId = (int) $event['assistId'];
                $tipoEvento = 2;
                $insertEvento->bind_param('iiii', $partidoId, $assistId, $tipoEvento, $teamNum);
                if (!$insertEvento->execute()) {
                    throw new Exception('Error al insertar asistencia: ' . $insertEvento->error);
                }
            }
        } elseif ($event['type'] === 'substitution') {
            $tipoEvento = 3;

            if (isset($event['playerOutId']) && is_numeric($event['playerOutId'])) {
                $outId = (int) $event['playerOutId'];
                $insertEvento->bind_param('iiii', $partidoId, $outId, $tipoEvento, $teamNum);
                if (!$insertEvento->execute()) {
                    throw new Exception('Error al insertar cambio (sale): ' . $insertEvento->error);
                }
            }

            if (isset($event['playerInId']) && is_numeric($event['playerInId'])) {
                $inId = (int) $event['playerInId'];
                $insertEvento->bind_param('iiii', $partidoId, $inId, $tipoEvento, $teamNum);
                if (!$insertEvento->execute()) {
                    throw new Exception('Error al insertar cambio (entra): ' . $insertEvento->error);
                }
            }
        }
    }

    // Registrar NGNA (ID_EVENTO_PARTIDO = 6) para TODO jugador del roster
    // completo del partido que no haya quedado con ningún evento real
    // (GOL, ASISTENCIA o CAMBIO). Así, absolutamente todos los jugadores
    // que participaron del partido -tengan o no contribución- terminan
    // con al menos una fila en recolector_eventos, y por lo tanto
    // calcularELOPartido() los va a incluir y modificar su ELO.
    $rosterCompleto = [];
    foreach ($rosterWhite as $id) {
        $rosterCompleto[$id] = 1;
    }
    foreach ($rosterBlack as $id) {
        $rosterCompleto[$id] = 2;
    }

    if (count($rosterCompleto) > 0) {
        $idsList = implode(',', array_keys($rosterCompleto));
        $resultJugadores = $conn->query("SELECT DISTINCT ID_USUARIO FROM recolector_eventos WHERE ID_PARTIDO = $partidoId AND ID_USUARIO IN ($idsList)");
        if (!$resultJugadores) {
            throw new Exception('Error verificando jugadores con eventos: ' . $conn->error);
        }

        $jugadoresConEventos = [];
        while ($row = $resultJugadores->fetch_assoc()) {
            $jugadoresConEventos[] = (int) $row['ID_USUARIO'];
        }
        $resultJugadores->free();

        $tipoEventoNoParticipacion = 6;
        foreach ($rosterCompleto as $jugadorId => $equipoId) {
            if (!in_array($jugadorId, $jugadoresConEventos, true)) {
                $insertEvento->bind_param('iiii', $partidoId, $jugadorId, $tipoEventoNoParticipacion, $equipoId);
                if (!$insertEvento->execute()) {
                    throw new Exception('Error al insertar NGNA para jugador ' . $jugadorId . ': ' . $insertEvento->error);
                }
            }
        }
    }

    $insertEvento->close();

    actualizarEstadisticasJugador($conn, $idLiga, $partidoId);
    calcularELOPartido($conn, $idLiga, $partidoId);

    $conn->commit();

    echo json_encode(['ok' => true, 'idPartido' => $partidoId]);
    $conn->close();
    exit;
} catch (Exception $e) {
    $conn->rollback();
    $conn->close();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    exit;
}

function actualizarEstadisticasJugador($conn, $idLiga, $partidoId) {
    $idLiga = (int) $idLiga;
    $partidoId = (int) $partidoId;

    $row = $conn->query("SELECT COUNT(*) AS total FROM recolector_eventos WHERE ID_PARTIDO = $partidoId AND ID_EVENTO_PARTIDO = 1 AND EQUIPO_EVENTO = 1");
    if (!$row) {
        throw new Exception('Error contando goles eq1: ' . $conn->error);
    }
    $golesEq1 = (int) $row->fetch_assoc()['total'];
    $row->free();

    $row = $conn->query("SELECT COUNT(*) AS total FROM recolector_eventos WHERE ID_PARTIDO = $partidoId AND ID_EVENTO_PARTIDO = 1 AND EQUIPO_EVENTO = 2");
    if (!$row) {
        throw new Exception('Error contando goles eq2: ' . $conn->error);
    }
    $golesEq2 = (int) $row->fetch_assoc()['total'];
    $row->free();

    $playersResult = $conn->query("SELECT DISTINCT ID_USUARIO, EQUIPO_EVENTO FROM recolector_eventos WHERE ID_PARTIDO = $partidoId");
    if (!$playersResult) {
        throw new Exception('Error listando jugadores del partido: ' . $conn->error);
    }

    while ($playerRow = $playersResult->fetch_assoc()) {
        $jugadorId = (int) $playerRow['ID_USUARIO'];
        $equipo = (int) $playerRow['EQUIPO_EVENTO'];

        // Usar MAX(EQUIPO_EVENTO) para obtener el equipo consistente (en caso de cambios)
        $equipoRow = $conn->query("SELECT MAX(EQUIPO_EVENTO) AS equipo FROM recolector_eventos WHERE ID_PARTIDO = $partidoId AND ID_USUARIO = $jugadorId LIMIT 1");
        if ($equipoRow) {
            $equipoData = $equipoRow->fetch_assoc();
            $equipo = (int) $equipoData['equipo'];
            $equipoRow->free();
        }

        $resultado = 0.5;
        if ($equipo === 1) {
            if ($golesEq1 > $golesEq2) {
                $resultado = 1.0;
            } elseif ($golesEq1 < $golesEq2) {
                $resultado = 0.0;
            }
        } else {
            if ($golesEq2 > $golesEq1) {
                $resultado = 1.0;
            } elseif ($golesEq2 < $golesEq1) {
                $resultado = 0.0;
            }
        }

        $golesRow = $conn->query("SELECT COUNT(*) AS total FROM recolector_eventos WHERE ID_PARTIDO = $partidoId AND ID_USUARIO = $jugadorId AND ID_EVENTO_PARTIDO = 1");
        if (!$golesRow) {
            throw new Exception('Error contando goles por jugador: ' . $conn->error);
        }
        $goles = (int) $golesRow->fetch_assoc()['total'];
        $golesRow->free();

        $asisRow = $conn->query("SELECT COUNT(*) AS total FROM recolector_eventos WHERE ID_PARTIDO = $partidoId AND ID_USUARIO = $jugadorId AND ID_EVENTO_PARTIDO = 2");
        if (!$asisRow) {
            throw new Exception('Error contando asistencias por jugador: ' . $conn->error);
        }
        $asistencias = (int) $asisRow->fetch_assoc()['total'];
        $asisRow->free();

        $existsRow = $conn->query("SELECT 1 FROM estadisticas WHERE ID_LIGA = $idLiga AND ID_USUARIO = $jugadorId LIMIT 1");
        if (!$existsRow) {
            throw new Exception('Error verificando existencia en estadisticas: ' . $conn->error);
        }
        $exists = $existsRow->num_rows > 0;
        $existsRow->free();

        $ganados = $resultado === 1.0 ? 1 : 0;
        $perdidos = $resultado === 0.0 ? 1 : 0;
        $empatados = $resultado === 0.5 ? 1 : 0;

        if ($exists) {
            $updateSql = "UPDATE estadisticas SET
                PARTIDOS_JUGADOS = PARTIDOS_JUGADOS + 1,
                PARTIDOS_GANADOS = PARTIDOS_GANADOS + $ganados,
                PARTIDOS_PERDIDOS = PARTIDOS_PERDIDOS + $perdidos,
                PARTIDOS_EMPATADOS = PARTIDOS_EMPATADOS + $empatados,
                GOLES = GOLES + $goles,
                ASISTENCIAS = ASISTENCIAS + $asistencias,
                RACHA = CASE WHEN $resultado = 1.0 THEN RACHA + 1 WHEN $resultado = 0.0 THEN 0 ELSE RACHA END
             WHERE ID_LIGA = $idLiga AND ID_USUARIO = $jugadorId";

            if (!$conn->query($updateSql)) {
                throw new Exception('Error actualizando estadisticas del jugador ' . $jugadorId . ': ' . $conn->error);
            }
        } else {
            $racha = $resultado === 1.0 ? 1 : 0;
            $insertSql = "INSERT INTO estadisticas (
                ID_LIGA, ID_USUARIO, PARTIDOS_JUGADOS, PARTIDOS_GANADOS, PARTIDOS_PERDIDOS,
                PARTIDOS_EMPATADOS, GOLES, ASISTENCIAS, RACHA
            ) VALUES ($idLiga, $jugadorId, 1, $ganados, $perdidos, $empatados, $goles, $asistencias, $racha)";

            if (!$conn->query($insertSql)) {
                throw new Exception('Error insertando estadisticas del jugador ' . $jugadorId . ': ' . $conn->error);
            }
        }
    }

    $playersResult->free();
}

function calcularELOPartido($conn, $idLiga, $partidoId) {
    $idLiga = (int) $idLiga;
    $partidoId = (int) $partidoId;
    $jugadores = obtenerJugadoresPartido($conn, $idLiga, $partidoId);

    $equipo1 = array_filter($jugadores, function($j) { return $j['equipo'] == 1; });
    $equipo2 = array_filter($jugadores, function($j) { return $j['equipo'] == 2; });

    if (count($equipo1) === 0 && count($equipo2) === 0) {
        return;
    }

    $elo1 = promedioELO($equipo1);
    $elo2 = promedioELO($equipo2);

    $esperado1 = calcularEsperado($elo1, $elo2);
    $esperado2 = calcularEsperado($elo2, $elo1);

    $resultado = calcularResultadoPartido($conn, $partidoId);

    $rendimiento1 = calcularRendimientoEquipo($conn, $equipo1, $partidoId);
    $rendimiento2 = calcularRendimientoEquipo($conn, $equipo2, $partidoId);

    foreach ($equipo1 as $jugador) {
        $id = (int) $jugador['id_jugador'];
        $rend = isset($rendimiento1[$id]) ? $rendimiento1[$id] : 1.0;
        $delta = calcularDelta($resultado['equipo1'], $esperado1, $rend);
        actualizarELO($conn, $idLiga, $id, $delta);
    }

    foreach ($equipo2 as $jugador) {
        $id = (int) $jugador['id_jugador'];
        $rend = isset($rendimiento2[$id]) ? $rendimiento2[$id] : 1.0;
        $delta = calcularDelta($resultado['equipo2'], $esperado2, $rend);
        actualizarELO($conn, $idLiga, $id, $delta);
    }
}

function obtenerJugadoresPartido($conn, $idLiga, $partidoId) {
    $idLiga = (int) $idLiga;
    $partidoId = (int) $partidoId;
    // El ELO se lee de liga_miembros (por liga), no de jugadores.
    $sql = "SELECT re.ID_USUARIO AS id_jugador, MAX(re.EQUIPO_EVENTO) AS equipo, lm.VALOR_ELO AS elo
            FROM recolector_eventos re
            JOIN liga_miembros lm ON lm.ID_USUARIO = re.ID_USUARIO AND lm.ID_LIGA = $idLiga
            WHERE re.ID_PARTIDO = $partidoId
            GROUP BY re.ID_USUARIO, lm.VALOR_ELO";

    $result = $conn->query($sql);
    if (!$result) {
        throw new Exception('Error obteniendo jugadores del partido: ' . $conn->error);
    }

    $jugadores = [];
    while ($row = $result->fetch_assoc()) {
        $jugadores[] = [
            'id_jugador' => (int) $row['id_jugador'],
            'equipo' => (int) $row['equipo'],
            'elo' => (float) $row['elo'],
        ];
    }
    $result->free();
    return $jugadores;
}

function promedioELO(array $jugadores) {
    if (count($jugadores) === 0) {
        return 1000.0;
    }
    $suma = 0.0;
    foreach ($jugadores as $jugador) {
        $suma += (float) $jugador['elo'];
    }
    return $suma / count($jugadores);
}

function calcularEsperado($eloPropio, $eloRival) {
    return 1.0 / (1.0 + pow(10, ($eloRival - $eloPropio) / 400.0));
}

function calcularResultadoPartido($conn, $partidoId) {
    $partidoId = (int) $partidoId;
    $sql = "SELECT EQUIPO_EVENTO AS equipo, COUNT(*) AS goles
            FROM recolector_eventos
            WHERE ID_PARTIDO = $partidoId AND ID_EVENTO_PARTIDO = 1
            GROUP BY EQUIPO_EVENTO";

    $result = $conn->query($sql);
    if (!$result) {
        throw new Exception('Error calculando resultado del partido: ' . $conn->error);
    }

    $goles = [1 => 0, 2 => 0];
    while ($row = $result->fetch_assoc()) {
        $equipo = (int) $row['equipo'];
        $goles[$equipo] = (int) $row['goles'];
    }
    $result->free();

    if ($goles[1] > $goles[2]) {
        return ['equipo1' => 1.0, 'equipo2' => 0.0];
    } elseif ($goles[1] < $goles[2]) {
        return ['equipo1' => 0.0, 'equipo2' => 1.0];
    }
    return ['equipo1' => 0.5, 'equipo2' => 0.5];
}

function calcularRendimientoEquipo($conn, array $jugadores, $partidoId) {
    if (count($jugadores) === 0) {
        return [];
    }

    $ids = array_map('intval', array_column($jugadores, 'id_jugador'));
    $idsList = implode(',', $ids);
    $partidoId = (int) $partidoId;

    $sql = "SELECT ID_USUARIO AS id_jugador,
                   SUM(CASE WHEN ID_EVENTO_PARTIDO = 1 THEN 1 ELSE 0 END) AS goles,
                   SUM(CASE WHEN ID_EVENTO_PARTIDO = 2 THEN 1 ELSE 0 END) AS asistencias
            FROM recolector_eventos
            WHERE ID_PARTIDO = $partidoId
              AND ID_USUARIO IN ($idsList)
            GROUP BY ID_USUARIO";

    $result = $conn->query($sql);
    if (!$result) {
        throw new Exception('Error calculando rendimiento de equipo: ' . $conn->error);
    }

    $statsPorJugador = [];
    while ($row = $result->fetch_assoc()) {
        $id = (int) $row['id_jugador'];
        $goles = (int) $row['goles'];
        $asistencias = (int) $row['asistencias'];
        $statsPorJugador[$id] = [
            'goles' => $goles,
            'asistencias' => $asistencias,
            'total_ga' => $goles + $asistencias,
        ];
    }
    $result->free();

    $totalGA = 0;
    foreach ($statsPorJugador as $stats) {
        $totalGA += $stats['total_ga'];
    }

    $cantidad = count($jugadores);
    $promedioGA = $cantidad > 0 ? $totalGA / $cantidad : 0;

    $rendimiento = [];
    foreach ($jugadores as $jugador) {
        $id = (int) $jugador['id_jugador'];
        $ga = isset($statsPorJugador[$id]) ? $statsPorJugador[$id]['total_ga'] : 0;
        $rendimiento[$id] = $promedioGA == 0 ? 1.0 : ($ga / $promedioGA);
    }

    return $rendimiento;
}

function calcularDelta($resultado, $esperado, $rendimiento) {
    $componenteEquipo = 0.6 * ($resultado - $esperado);
    $componenteIndividual = 0.4 * ($rendimiento - 1.0);
    $K = 32;
    return $K * ($componenteEquipo + $componenteIndividual);
}

function actualizarELO($conn, $idLiga, $idJugador, $delta) {
    $idLiga = (int) $idLiga;
    $idJugador = (int) $idJugador;
    $delta = round($delta, 2);

    $sql = "UPDATE liga_miembros SET VALOR_ELO = VALOR_ELO + ($delta) WHERE ID_LIGA = $idLiga AND ID_USUARIO = $idJugador";
    if (!$conn->query($sql)) {
        throw new Exception('Error actualizando ELO del jugador ' . $idJugador . ': ' . $conn->error);
    }
}
