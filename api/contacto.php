<?php
// api/contacto.php
// Recibe el formulario de ayuda y guarda el mensaje en la tabla contactos.

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$correo_electronico = isset($_POST['correo_electronico']) ? trim($_POST['correo_electronico']) : '';
$asunto = isset($_POST['asunto']) ? trim($_POST['asunto']) : '';
$mensaje = isset($_POST['mensaje']) ? trim($_POST['mensaje']) : '';

if ($nombre === '' || $correo_electronico === '' || $asunto === '' || $mensaje === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Todos los campos son obligatorios']);
    exit;
}

if (!filter_var($correo_electronico, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Correo electrónico inválido']);
    exit;
}

$stmt = $conn->prepare('INSERT INTO contactos (NOMBRE, CORREO_ELECTRONICO, ASUNTO, MENSAJE) VALUES (?, ?, ?, ?)');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error en la consulta: ' . $conn->error]);
    exit;
}

$stmt->bind_param('ssss', $nombre, $correo_electronico, $asunto, $mensaje);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo guardar el mensaje']);
    $stmt->close();
    exit;
}

$stmt->close();
$conn->close();

echo json_encode(['ok' => true, 'message' => 'Mensaje recibido, gracias por contactarnos']);
