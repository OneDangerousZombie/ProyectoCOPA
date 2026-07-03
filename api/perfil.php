<?php
// api/perfil.php
// Devuelve nombre, avatar, ELO y estadísticas del usuario DENTRO de la
// liga activa. Si no hay liga activa seleccionada, devuelve success:false
// con un código particular para que el frontend mande al usuario a elegir
// una liga.

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/liga_helpers.php';

// 1. Reanudar la sesión
session_start();

// Configurar el encabezado JSON
header('Content-Type: application/json; charset=utf-8');

// 3. Verificar la autenticación
if (!isset($_SESSION['ID_JUGADOR'])) {
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}

$id_jugador = (int) $_SESSION['ID_JUGADOR'];
$id_liga = ligaActivaId();

if (!$id_liga) {
    echo json_encode(['success' => false, 'error' => 'No hay una liga activa seleccionada', 'code' => 'NO_LIGA_ACTIVA']);
    exit;
}

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

    // 4b. ELO y rol dentro de la liga activa (liga_miembros).
    $stmtMiembro = $conn->prepare("SELECT VALOR_ELO, ROL_LIGA FROM liga_miembros WHERE ID_LIGA = ? AND ID_USUARIO = ? LIMIT 1");
    $stmtMiembro->bind_param('ii', $id_liga, $id_jugador);
    $stmtMiembro->execute();
    $miembro = $stmtMiembro->get_result()->fetch_assoc();
    $stmtMiembro->close();

    if (!$miembro) {
        echo json_encode(['success' => false, 'error' => 'No pertenecés a la liga activa', 'code' => 'NO_MIEMBRO']);
        exit;
    }

    // 4c. Nombre de la liga activa (útil para mostrar en el perfil).
    $stmtLiga = $conn->prepare("SELECT NOMBRE FROM ligas WHERE ID_LIGA = ? LIMIT 1");
    $stmtLiga->bind_param('i', $id_liga);
    $stmtLiga->execute();
    $liga = $stmtLiga->get_result()->fetch_assoc();
    $stmtLiga->close();

    // 5. Consultar estadísticas del jugador EN ESTA LIGA.
    $stmt = $conn->prepare("SELECT ID_ESTADISTICAS, PARTIDOS_JUGADOS, PARTIDOS_GANADOS,
                                  PARTIDOS_PERDIDOS, PARTIDOS_EMPATADOS, GOLES,
                                  ASISTENCIAS, RACHA
                           FROM estadisticas
                           WHERE ID_LIGA = ? AND ID_USUARIO = ?
                           LIMIT 1");
    $stmt->bind_param('ii', $id_liga, $id_jugador);
    $stmt->execute();
    $result = $stmt->get_result();
    $estadisticas = $result->fetch_assoc();

    echo json_encode([
        'success' => true,
        'sesion' => [
            'ID_JUGADOR' => $id_jugador,
            'NOMBRE' => $_SESSION['NOMBRE'],
            'AVATAR_URL' => $_SESSION['AVATAR_URL'],
            'jugador_rol' => $_SESSION['jugador_rol'] ?? null
        ],
        'liga' => [
            'id' => $id_liga,
            'nombre' => $liga ? $liga['NOMBRE'] : null,
            'rol_liga' => (int) $miembro['ROL_LIGA'],
            'valor_elo' => (float) $miembro['VALOR_ELO']
        ],
        'estadisticas' => $estadisticas ?: []
    ]);

    $stmt->close();

} catch (Exception $e) {
    // Cambiamos PDOException por Exception general para capturar errores de MySQLi
    echo json_encode(['success' => false, 'error' => 'Error en la consulta: ' . $e->getMessage()]);
}
