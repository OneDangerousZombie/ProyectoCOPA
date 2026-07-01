<?php
// api/traerCanchas.php
// Devuelve la lista de canchas disponibles para el selector de nuevo partido.

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$stmt = $conn->prepare('SELECT ID_CANCHA, NOMBRE, DIRECCION, LOCALIDAD FROM canchas ORDER BY NOMBRE ASC');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error preparando consulta: ' . $conn->error]);
    exit;
}

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
