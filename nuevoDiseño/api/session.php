<?php
// api/session.php
// Devuelve la sesión de usuario actual si existe.

header('Content-Type: application/json; charset=utf-8');
session_start();

if (isset($_SESSION['ID_JUGADOR']) && isset($_SESSION['NOMBRE'])) {
    echo json_encode([
        'ok' => true,
        'jugador' => [
            'id' => (int) $_SESSION['ID_JUGADOR'],
            'nombre' => $_SESSION['NOMBRE'],
            'rol' => isset($_SESSION['jugador_rol']) ? (int) $_SESSION['jugador_rol'] : null,
            'avatar' => isset($_SESSION['AVATAR_URL']) ? $_SESSION['AVATAR_URL'] : ''
        ]
    ]);
    exit;
}

echo json_encode(['ok' => false, 'jugador' => null]);
