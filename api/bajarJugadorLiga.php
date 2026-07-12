<?php
// api/bajarJugadorLiga.php
// Pone ACTIVO=0 a un jugador en la liga activa.
// Reutiliza liga_helpers.php (requireLogin, requireLigaActiva, requireAccesoLiga)
// que ya creó el equipo.
// POST { id_usuario }

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/liga_helpers.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$idActual = requireLogin();
$idLiga   = requireLigaActiva();

// Verificar que quien llama es ROL_LIGA=5 (creador)
requireAccesoLiga($conn, $idActual, $idLiga, 5);

$input    = json_decode(file_get_contents('php://input'), true);
$idTarget = (int)($input['id_usuario'] ?? 0);

if (!$idTarget) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'id_usuario requerido']);
    exit;
}

if ($idTarget === $idActual) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'No podés darte de baja a vos mismo']);
    exit;
}

$stmt = $conn->prepare("UPDATE liga_miembros SET ACTIVO=0 WHERE ID_LIGA=? AND ID_USUARIO=?");
$stmt->bind_param('ii', $idLiga, $idTarget);
$ok = $stmt->execute();
$stmt->close();
$conn->close();

echo json_encode(['ok' => $ok]);
