<?php
// api/traerCanchas.php
// Devuelve la lista de canchas de la LIGA ACTIVA para el selector de
// nuevo partido.

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

$stmt = $conn->prepare('SELECT ID_CANCHA, NOMBRE, DIRECCION, LOCALIDAD FROM canchas WHERE ID_LIGA = ? ORDER BY NOMBRE ASC');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error preparando consulta: ' . $conn->error]);
    exit;
}

$stmt->bind_param('i', $idLiga);
$stmt->execute();
$result = $stmt->get_result();
$canchas = [];
while ($row = $result->fetch_assoc()) {
    $canchas[] = [
        'id' => (int) $row['ID_CANCHA'],
        'nombre' => $row['NOMBRE'],
        'direccion' => $row['DIRECCION'],
        'localidad' => $row['LOCALIDAD']
    ];
}

$stmt->close();
$conn->close();

echo json_encode(['ok' => true, 'canchas' => $canchas]);
