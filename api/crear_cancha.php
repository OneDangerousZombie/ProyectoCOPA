<?php
// api/crear_cancha.php
// Agrega una cancha a la liga activa. Solo para admin o delegado de esa
// liga (ROL_LIGA >= 3), porque las canchas nuevas quedan disponibles para
// todo el mundo en esa liga a la hora de cargar un partido.
//
// POST { nombre, direccion, localidad }
// Devuelve { ok: true, cancha: {...} }

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/liga_helpers.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$idJugador = requireLogin();
$idLiga = requireLigaActiva();
requireAccesoLiga($conn, $idJugador, $idLiga, 3); // delegado o admin

$input = json_decode(file_get_contents('php://input'), true);
$nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
$direccion = isset($input['direccion']) ? trim($input['direccion']) : '';
$localidad = isset($input['localidad']) ? trim($input['localidad']) : '';

if ($nombre === '' || $direccion === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Nombre y dirección son obligatorios']);
    exit;
}

$stmt = $conn->prepare('INSERT INTO canchas (ID_LIGA, NOMBRE, DIRECCION, LOCALIDAD) VALUES (?, ?, ?, ?)');
$stmt->bind_param('isss', $idLiga, $nombre, $direccion, $localidad);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo crear la cancha: ' . $stmt->error]);
    $stmt->close();
    $conn->close();
    exit;
}

$idCancha = $conn->insert_id;
$stmt->close();

echo json_encode(['ok' => true, 'cancha' => [
    'id' => (int) $idCancha,
    'nombre' => $nombre,
    'direccion' => $direccion,
    'localidad' => $localidad
]]);

$conn->close();
