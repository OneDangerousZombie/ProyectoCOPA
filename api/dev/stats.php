<?php
// api/dev/stats.php — v2
// Reescrito para coincidir con la base copatres:
//   - ELO vive en liga_miembros.VALOR_ELO (no en jugadores)
//   - estadisticas ahora tiene ID_USUARIO (antes ID_JUGADOR) y ID_LIGA
//   - recolector_eventos usa ID_USUARIO (antes ID_JUGADOR_EVENTO)
//   - canchas tiene ID_LIGA

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';
session_start();

if (!isset($_SESSION['ID_JUGADOR']) || (int)($_SESSION['jugador_rol'] ?? 0) !== 9) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Acceso restringido a DEV']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$stats = [];

// ── 1. KPIs ──────────────────────────────────────────────────
$r = $conn->query("SELECT COUNT(*) as t FROM jugadores")->fetch_assoc();
$stats['totalJugadores'] = (int)$r['t'];

$r = $conn->query("SELECT COUNT(*) as t FROM partidos")->fetch_assoc();
$stats['totalPartidos'] = (int)$r['t'];

$r = $conn->query("SELECT COALESCE(SUM(GOLES),0) as t FROM estadisticas")->fetch_assoc();
$stats['totalGoles'] = (int)$r['t'];

$r = $conn->query("SELECT COALESCE(SUM(ASISTENCIAS),0) as t FROM estadisticas")->fetch_assoc();
$stats['totalAsistencias'] = (int)$r['t'];

// ELO promedio desde liga_miembros (donde realmente vive)
$r = $conn->query("SELECT ROUND(AVG(VALOR_ELO)) as avg FROM liga_miembros WHERE ACTIVO = 1")->fetch_assoc();
$stats['avgElo'] = (int)$r['avg'];

$r = $conn->query("SELECT COUNT(*) as t FROM ligas WHERE ESTADO = 1")->fetch_assoc();
$stats['totalLigas'] = (int)$r['t'];

// ── 2. Partidos por mes (últimos 6 meses) ────────────────────
$res = $conn->query("
    SELECT DATE_FORMAT(FECHA_PARTIDO,'%Y-%m') as mes,
           DATE_FORMAT(FECHA_PARTIDO,'%b %Y') as label,
           COUNT(*) as cantidad
    FROM partidos
    WHERE FECHA_PARTIDO >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY mes, label ORDER BY mes ASC
");
$stats['partidosPorMes'] = [];
while ($r = $res->fetch_assoc())
    $stats['partidosPorMes'][] = ['mes'=>$r['mes'], 'label'=>$r['label'], 'cantidad'=>(int)$r['cantidad']];

// ── 3. Top 8 goleadores (estadisticas usa ID_USUARIO) ────────
$res = $conn->query("
    SELECT j.NOMBRE as nombre,
           SUM(e.GOLES) as goles,
           SUM(e.ASISTENCIAS) as asistencias
    FROM estadisticas e
    JOIN jugadores j ON e.ID_USUARIO = j.ID_JUGADORES
    GROUP BY j.ID_JUGADORES, j.NOMBRE
    ORDER BY goles DESC
    LIMIT 8
");
$stats['topGoleadores'] = [];
while ($r = $res->fetch_assoc())
    $stats['topGoleadores'][] = ['nombre'=>$r['nombre'],'goles'=>(int)$r['goles'],'asistencias'=>(int)$r['asistencias']];

// ── 4. Distribución de ELO desde liga_miembros ───────────────
$res = $conn->query("
    SELECT
        SUM(CASE WHEN VALOR_ELO < 900  THEN 1 ELSE 0 END) as bajo,
        SUM(CASE WHEN VALOR_ELO >= 900  AND VALOR_ELO < 1050 THEN 1 ELSE 0 END) as medio,
        SUM(CASE WHEN VALOR_ELO >= 1050 AND VALOR_ELO < 1100 THEN 1 ELSE 0 END) as alto,
        SUM(CASE WHEN VALOR_ELO >= 1100 THEN 1 ELSE 0 END) as elite
    FROM liga_miembros WHERE ACTIVO = 1
");
$r = $res->fetch_assoc();
$stats['distribucionElo'] = [
    ['rango'=>'< 900',       'cantidad'=>(int)$r['bajo']],
    ['rango'=>'900 – 1049',  'cantidad'=>(int)$r['medio']],
    ['rango'=>'1050 – 1099', 'cantidad'=>(int)$r['alto']],
    ['rango'=>'≥ 1100',      'cantidad'=>(int)$r['elite']],
];

// ── 5. Formato de partido más usado ──────────────────────────
$res = $conn->query("
    SELECT FORMATO as formato, COUNT(*) as cantidad
    FROM partidos GROUP BY FORMATO ORDER BY cantidad DESC
");
$stats['distribucionFormato'] = [];
while ($r = $res->fetch_assoc())
    $stats['distribucionFormato'][] = ['formato'=>$r['formato'],'cantidad'=>(int)$r['cantidad']];

// ── 6. Cancha más usada ───────────────────────────────────────
$res = $conn->query("
    SELECT c.NOMBRE as nombre, COUNT(*) as cantidad
    FROM partidos p JOIN canchas c ON p.CANCHA_PARTIDO = c.ID_CANCHA
    GROUP BY c.NOMBRE ORDER BY cantidad DESC
");
$stats['canchasUso'] = [];
while ($r = $res->fetch_assoc())
    $stats['canchasUso'][] = ['nombre'=>$r['nombre'],'cantidad'=>(int)$r['cantidad']];

// ── 7. Win rate distribución ──────────────────────────────────
$res = $conn->query("
    SELECT
        CASE
            WHEN PARTIDOS_JUGADOS = 0 THEN 'Sin partidos'
            WHEN (PARTIDOS_GANADOS / PARTIDOS_JUGADOS) >= 0.6 THEN '≥ 60%'
            WHEN (PARTIDOS_GANADOS / PARTIDOS_JUGADOS) >= 0.4 THEN '40 – 59%'
            ELSE '< 40%'
        END as rango,
        COUNT(*) as cantidad
    FROM estadisticas GROUP BY rango
");
$stats['distribucionWinRate'] = [];
while ($r = $res->fetch_assoc())
    $stats['distribucionWinRate'][] = ['rango'=>$r['rango'],'cantidad'=>(int)$r['cantidad']];

// ── 8. Miembros por liga ──────────────────────────────────────
$res = $conn->query("
    SELECT l.NOMBRE as liga, COUNT(lm.ID_USUARIO) as miembros
    FROM ligas l
    LEFT JOIN liga_miembros lm ON l.ID_LIGA = lm.ID_LIGA AND lm.ACTIVO = 1
    WHERE l.ESTADO = 1
    GROUP BY l.ID_LIGA, l.NOMBRE
    ORDER BY miembros DESC
");
$stats['miembrosPorLiga'] = [];
while ($r = $res->fetch_assoc())
    $stats['miembrosPorLiga'][] = ['liga'=>$r['liga'],'miembros'=>(int)$r['miembros']];

$conn->close();
echo json_encode(['ok' => true, 'data' => $stats]);
