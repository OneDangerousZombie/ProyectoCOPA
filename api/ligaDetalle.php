<?php
// api/ligaDetalle.php?liga_id=N — público, sin autenticación
// Devuelve: info de la liga, último partido con eventos, stats de todos los miembros
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$ligaId = (int)($_GET['liga_id'] ?? 0);
if (!$ligaId) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'liga_id requerido']); exit; }

// Info de la liga
$s = $conn->prepare("SELECT ID_LIGA as id, NOMBRE as nombre, FORMATO_DEFAULT as formato FROM ligas WHERE ID_LIGA=? AND ESTADO=1 LIMIT 1");
$s->bind_param('i', $ligaId); $s->execute();
$liga = $s->get_result()->fetch_assoc(); $s->close();
if (!$liga) { http_response_code(404); echo json_encode(['ok'=>false,'error'=>'Liga no encontrada']); exit; }

// Último partido de la liga
$s = $conn->prepare("
    SELECT p.ID_PARTIDOS as id, p.FECHA_PARTIDO as fecha, p.FORMATO as formato, p.ESTADO as estado,
           c.NOMBRE as cancha
    FROM partidos p
    LEFT JOIN canchas c ON p.CANCHA_PARTIDO = c.ID_CANCHA
    WHERE p.ID_LIGA = ?
    ORDER BY p.FECHA_PARTIDO DESC, p.ID_PARTIDOS DESC
    LIMIT 1
");
$s->bind_param('i', $ligaId); $s->execute();
$partido = $s->get_result()->fetch_assoc(); $s->close();

$goles = ['equipo1' => 0, 'equipo2' => 0];
$equipos = ['equipo1' => 'Blanco', 'equipo2' => 'Negro'];

if ($partido) {
    $pid = (int)$partido['id'];
    // Goles por equipo
    $ev = $conn->query("
        SELECT re.NUMERO_EQUIPO, COUNT(*) as goles
        FROM recolector_eventos re
        JOIN eventos e ON re.ID_EVENTO = e.ID_EVENTO
        WHERE re.ID_PARTIDO = $pid AND e.NOMBRE = 'Gol'
        GROUP BY re.NUMERO_EQUIPO
    ");
    if ($ev) {
        while ($r = $ev->fetch_assoc()) {
            $key = 'equipo' . (int)$r['NUMERO_EQUIPO'];
            $goles[$key] = (int)$r['goles'];
        }
    }
    // Colores de equipos (puede no existir la tabla partido_equipos)
    $pe = @$conn->query("SELECT NUMERO_EQUIPO, COLOR FROM partido_equipos WHERE ID_PARTIDO = $pid");
    if ($pe) {
        while ($r = $pe->fetch_assoc()) {
            $key = 'equipo' . (int)$r['NUMERO_EQUIPO'];
            $equipos[$key] = $r['COLOR'];
        }
    }
    $partido['goles']  = $goles;
    $partido['equipos'] = $equipos;
}

// Stats de todos los miembros activos de la liga
$s = $conn->prepare("
    SELECT j.ID_JUGADORES as id, j.NOMBRE as nombre, j.AVATAR_URL as avatar,
           lm.VALOR_ELO as elo,
           COALESCE(e.PARTIDOS_JUGADOS,0) as pj,
           COALESCE(e.PARTIDOS_GANADOS,0)  as pg,
           COALESCE(e.PARTIDOS_PERDIDOS,0) as pp,
           COALESCE(e.PARTIDOS_EMPATADOS,0)as pe,
           COALESCE(e.GOLES,0)             as goles,
           COALESCE(e.ASISTENCIAS,0)       as asistencias,
           COALESCE(e.RACHA,0)             as racha
    FROM liga_miembros lm
    JOIN jugadores j ON lm.ID_USUARIO = j.ID_JUGADORES
    LEFT JOIN estadisticas e ON e.ID_USUARIO = j.ID_JUGADORES AND e.ID_LIGA = lm.ID_LIGA
    WHERE lm.ID_LIGA = ? AND lm.ACTIVO = 1
    ORDER BY lm.VALOR_ELO DESC
");
$s->bind_param('i', $ligaId); $s->execute();
$rows = $s->get_result();
$stats = [];
while ($r = $rows->fetch_assoc()) $stats[] = $r;
$s->close(); $conn->close();

echo json_encode(['ok' => true, 'liga' => $liga, 'partido' => $partido, 'stats' => $stats]);
