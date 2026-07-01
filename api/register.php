<?php
// api/register.php
// Recibe { nombre, clave, avatar_url } por POST en formato JSON.
// ROL se fija en 1, VALOR_ELO arranca en 1200, y se inicializan las estadísticas.
// Devuelve { ok: true, jugador: {...} } o { ok: false, error: "..." }

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

// 1. Verificar el método
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

// 6. INICIO DE LA TRANSACCIÓN
$conn->begin_transaction();

try {
    // --- PASO A: Insertar en la tabla 'jugadores' ---
    // Incluyo AVATAR_URL (de tu consulta anterior) y VALOR_ELO (de tu archivo actual)
    $stmtJugador = $conn->prepare(
        'INSERT INTO jugadores (NOMBRE, CLAVE, AVATAR_URL, ROL, VALOR_ELO) VALUES (?, ?, ?, 1, 1200)'
    );
    $stmtJugador->bind_param('sss', $nombre, $clave_hasheada, $avatar_url);
    
    if (!$stmtJugador->execute()) {
        throw new Exception('Error al insertar el jugador.');
    }
    
    $nuevoId = $conn->insert_id;
    $stmtJugador->close();

    // --- PASO B: Insertar en la tabla 'estadisticas' ---
    $stmtEstadisticas = $conn->prepare(
        'INSERT INTO estadisticas (
            ID_JUGADOR, PARTIDOS_JUGADOS, PARTIDOS_GANADOS, PARTIDOS_PERDIDOS, 
            PARTIDOS_EMPATADOS, GOLES, ASISTENCIAS, RACHA
        ) VALUES (?, 0, 0, 0, 0, 0, 0, 0)'
    );
    $stmtEstadisticas->bind_param('i', $nuevoId);
    
    if (!$stmtEstadisticas->execute()) {
        throw new Exception('Error al inicializar las estadísticas.');
    }
    $stmtEstadisticas->close();

    // Si ambos pasos fueron exitosos, confirmamos los cambios en la BD
    $conn->commit();

    // 7. Respuesta de éxito para login.js
    echo json_encode([
        'ok' => true,
        'jugador' => [
            'id'     => (int) $nuevoId,
            'nombre' => $nombre,
            'rol'    => 1,
            'elo'    => 0
        ]
    ]);

} catch (Exception $e) {
    // Si algo falla, deshacemos cualquier cambio (rollback)
    $conn->rollback();
    
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo registrar el usuario: ' . $e->getMessage()]);
}

$conn->close();
?>