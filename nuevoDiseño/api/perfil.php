<?php

require_once __DIR__ . '/db.php';

// 1. Reanudar la sesión
session_start();

// Configurar el encabezado JSON
header('Content-Type: application/json; charset=utf-8');


// 3. Verificar la autenticación
if (!isset($_SESSION['ID_JUGADOR'])) {
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}

$id_jugador = $_SESSION['ID_JUGADOR'];

try {
    // 4. Consultar datos del jugador para obtener AVATAR_URL desde la tabla jugadores.
    $stmtJugador = $conn->prepare("SELECT NOMBRE, AVATAR_URL FROM jugadores WHERE ID_JUGADORES = ? LIMIT 1");
    $stmtJugador->bind_param('i', $id_jugador);
    $stmtJugador->execute();
    $resultJugador = $stmtJugador->get_result();
    $jugador = $resultJugador->fetch_assoc();

    if (!$jugador) {
        echo json_encode([
            'success' => false,
            'error' => 'Jugador no encontrado'
        ]);
        $stmtJugador->close();
        exit;
    }

    $_SESSION['NOMBRE'] = $jugador['NOMBRE'];
    $_SESSION['AVATAR_URL'] = $jugador['AVATAR_URL'];

    $stmtJugador->close();

    // 5. Consultar estadísticas del jugador.
    $stmt = $conn->prepare("SELECT ID_ESTADISTICAS, PARTIDOS_JUGADOS, PARTIDOS_GANADOS, 
                                  PARTIDOS_PERDIDOS, PARTIDOS_EMPATADOS, GOLES, 
                                  ASISTENCIAS, RACHA 
                           FROM estadisticas 
                           WHERE ID_JUGADOR = ? 
                           LIMIT 1");
    $stmt->bind_param('i', $id_jugador);
    $stmt->execute();
    $result = $stmt->get_result();
    $estadisticas = $result->fetch_assoc();

    echo json_encode([
        'success' => true,
        'sesion' => $_SESSION,
        'estadisticas' => $estadisticas ?: []
    ]);

    $stmt->close();

} catch (Exception $e) {
    // Cambiamos PDOException por Exception general para capturar errores de MySQLi
    echo json_encode(['success' => false, 'error' => 'Error en la consulta: ' . $e->getMessage()]);
}

?>