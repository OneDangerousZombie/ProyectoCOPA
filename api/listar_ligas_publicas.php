<?php
// api/listar_ligas_publicas.php — público, sin autenticación
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$res = $conn->query("
    SELECT l.ID_LIGA as id, l.NOMBRE as nombre,
           l.PRIVADA as privada, l.FORMATO_DEFAULT as formato,
           COUNT(DISTINCT lm.ID_USUARIO) as cantidad_miembros,
           (SELECT MAX(p2.FECHA_PARTIDO) FROM partidos p2 WHERE p2.ID_LIGA = l.ID_LIGA) as ultimo_partido
    FROM ligas l
    LEFT JOIN liga_miembros lm ON l.ID_LIGA = lm.ID_LIGA AND lm.ACTIVO = 1
    WHERE l.ESTADO = 1 AND l.PRIVADA = 0
    GROUP BY l.ID_LIGA
    ORDER BY l.FECHA_CREACION DESC
");
$ligas = [];
while ($r = $res->fetch_assoc()) $ligas[] = $r;
$conn->close();
echo json_encode(['ok' => true, 'ligas' => $ligas]);
