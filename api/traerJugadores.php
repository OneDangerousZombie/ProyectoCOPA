<?php
// api/traerJugadores.php
// Devuelve la lista de jugadores con NOMBRE y VALOR_ELO para nuevo-partido.

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$stmt = $conn->prepare('SELECT NOMBRE, VALOR_ELO FROM jugadores ORDER BY NOMBRE ASC');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error en la consulta: ' . $conn->error]);
    exit;
}

$stmt->execute();
$result = $stmt->get_result();
$jugadores = [];
while ($row = $result->fetch_assoc()) {
    $jugadores[] = [
        'nombre' => $row['NOMBRE'],
        'valor_elo' => (int) $row['VALOR_ELO']
    ];
}

$stmt->close();
$conn->close();

echo json_encode(['ok' => true, 'jugadores' => $jugadores]);
