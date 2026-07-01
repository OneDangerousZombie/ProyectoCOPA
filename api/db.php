<?php
// api/db.php
// Conexión central a la base de datos. Todos los demás endpoints
// incluyen este archivo en lugar de repetir la conexión.

// ── Configuración de conexión ──────────────────────────────
// Ajustar usuario/clave si tu XAMPP/WAMP usa otros valores.
// Por defecto, XAMPP en Windows/Mac usa usuario 'root' sin contraseña.
$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = '';
$DB_NAME = 'copa';
// usar el nombre de la base de datos importada desde db/copa.sql

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'No se pudo conectar a la base de datos.',
        'detalle' => $conn->connect_error
    ]);
    exit;
}

$conn->set_charset('utf8mb4');

