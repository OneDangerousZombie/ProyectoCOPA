<?php
// api/register.php
// Recibe { nombre, clave, avatar_url } por POST en formato JSON.
// Crea el usuario global (tabla jugadores). Ya NO inicializa estadísticas
// ni ELO acá: eso ahora es por liga, y se crea recién cuando el usuario
// crea o se une a una liga (ver crear_liga.php / unirse_liga.php).
// Devuelve { ok: true, jugador: {...} } o { ok: false, error: "..." }

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

// 1. INICIAR LA SESIÓN DE PHP
session_start();

// 2. Verificar el método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

// 2. Leer el JSON entrante
$input = json_decode(file_get_contents('php://input'), true);

$nombre     = isset($input['nombre']) ? trim($input['nombre']) : '';
$clave      = isset($input['clave'])  ? trim($input['clave'])  : '';
// Agregamos el avatar que mencionaste antes (si no viene, queda vacío)
$avatar_url = isset($input['avatar_url']) ? trim($input['avatar_url']) : '';

// 3. Validaciones iniciales
if ($nombre === '' || $clave === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Usuario y contraseña son obligatorios']);
    exit;
}

if (mb_strlen($nombre) > 20) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'El nombre de usuario es demasiado largo (máx. 20 caracteres)']);
    exit;
}

// 4. Verificar que el nombre no exista
$check = $conn->prepare('SELECT ID_JUGADORES FROM jugadores WHERE NOMBRE = ? LIMIT 1');
$check->bind_param('s', $nombre);
$check->execute();
if ($check->get_result()->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['ok' => false, 'error' => 'Ese nombre de usuario ya existe']);
    $check->close();
    exit;
}
$check->close();

// 5. Hashear la contraseña (¡Muy importante para la seguridad!)
$clave_hasheada = password_hash($clave, PASSWORD_DEFAULT);

// 6. Insertar en la tabla 'jugadores' (usuario global del sistema).
//    No se crea estadística ni ELO acá: nace recién al entrar a una liga.
$stmtJugador = $conn->prepare(
    'INSERT INTO jugadores (NOMBRE, CLAVE, AVATAR_URL, ROL) VALUES (?, ?, ?, 1)'
);
$stmtJugador->bind_param('sss', $nombre, $clave_hasheada, $avatar_url);

if (!$stmtJugador->execute()) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo registrar el usuario: ' . $stmtJugador->error]);
    $stmtJugador->close();
    $conn->close();
    exit;
}

$nuevoId = $conn->insert_id;
$stmtJugador->close();

// Guardar sesión en el backend
$_SESSION['ID_JUGADOR']  = $nuevoId;
$_SESSION['NOMBRE']      = $nombre;
$_SESSION['AVATAR_URL']  = $avatar_url;
$_SESSION['jugador_rol'] = 1;

// 7. Respuesta de éxito para login.js.
//    El frontend debe llevar al usuario a league-selection.html después de
//    esto, porque todavía no pertenece a ninguna liga.
echo json_encode([
    'ok' => true,
    'jugador' => [
        'id'     => (int) $nuevoId,
        'nombre' => $nombre,
        'rol'    => 1,
        'avatar' => $avatar_url
    ]
]);

$conn->close();
