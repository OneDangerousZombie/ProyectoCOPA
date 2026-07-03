<?php
// api/seleccionar_liga.php
// Cambia la liga activa en sesión, entre las ligas a las que el usuario
// ya pertenece. No crea ni une nada nuevo (para eso están crear_liga.php
// y unirse_liga.php).
//
// POST { id_liga }
// Devuelve { ok: true, liga: {...} }

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

$input = json_decode(file_get_contents('php://input'), true);
$idLiga = isset($input['id_liga']) && is_numeric($input['id_liga']) ? (int) $input['id_liga'] : null;

if (!$idLiga) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Falta id_liga']);
    exit;
}

$rolLiga = requireAccesoLiga($conn, $idJugador, $idLiga, 1);

$stmt = $conn->prepare('SELECT NOMBRE, FORMATO_DEFAULT FROM ligas WHERE ID_LIGA = ? LIMIT 1');
$stmt->bind_param('i', $idLiga);
$stmt->execute();
$liga = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$liga) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Liga no encontrada']);
    exit;
}

$_SESSION['id_liga_activa'] = $idLiga;

echo json_encode([
    'ok' => true,
    'liga' => [
        'id' => $idLiga,
        'nombre' => $liga['NOMBRE'],
        'formato_default' => $liga['FORMATO_DEFAULT'],
        'rol_liga' => $rolLiga
    ]
]);

$conn->close();
