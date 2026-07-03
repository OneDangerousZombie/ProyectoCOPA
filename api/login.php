<?php

// api/login.php

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

// 1. INICIAR LA SESIÓN DE PHP
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
$clave  = isset($input['clave'])  ? trim($input['clave'])  : '';

if ($nombre === '' || $clave === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Usuario y contraseña son obligatorios']);
    exit;
}

/* Implementamos contraseñas seguras */

// Nota: VALOR_ELO ya no vive en jugadores (ahora es por liga, en
// liga_miembros), así que no se pide acá.
$stmt = $conn->prepare('SELECT ID_JUGADORES, NOMBRE, CLAVE, ROL, AVATAR_URL FROM jugadores WHERE NOMBRE = ? LIMIT 1');
$stmt->bind_param('s', $nombre);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 1) {
    // Extraemos los datos del usuario de la base de datos
    $jugador = $resultado->fetch_assoc();

    // 2.Verificamos si la clave ingresada coincide con el hash
    if (password_verify($clave, $jugador['CLAVE'])) {
        // Guardar sesión en el backend
        $_SESSION['ID_JUGADOR']  = $jugador['ID_JUGADORES'];
        $_SESSION['jugador_rol'] = $jugador['ROL'];
        $_SESSION['NOMBRE']      = $jugador['NOMBRE'];
        $_SESSION['AVATAR_URL']  = $jugador['AVATAR_URL'];

        // Importante: NO tocamos $_SESSION['id_liga_activa'] acá. Si el
        // usuario ya tenía una liga activa elegida en una sesión anterior
        // (mismo navegador), se respeta; si no, el frontend lo va a mandar
        // a league-selection.html a elegir/crear una.

        // ¡Contraseña correcta! Procedemos con el login exitoso
        echo json_encode([
            'ok' => true,
            'jugador' => [
                'id'     => (int) $jugador['ID_JUGADORES'],
                'nombre' => $jugador['NOMBRE'],
                'rol'    => (int) $jugador['ROL'],
                'avatar' => $jugador['AVATAR_URL']
            ]
        ]);

    } else {
        // La contraseña no coincide con el hash
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Usuario o contraseña incorrectos']);
    }
} else {
    // El usuario ni siquiera existe
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Usuario o contraseña incorrectos']);
}

$stmt->close();
$conn->close();
