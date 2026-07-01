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
    // 4. Realizar la consulta usando la variable de conexión ya existente (asumiendo $pdo)
    $stmt = $conn->prepare("SELECT ID_ESTADISTICAS, PARTIDOS_JUGADOS, PARTIDOS_GANADOS, 
                                  PARTIDOS_PERDIDOS, PARTIDOS_EMPATADOS, GOLES, 
                                  ASISTENCIAS, RACHA 
                           FROM estadisticas 
                           WHERE ID_JUGADOR = ? 
                           LIMIT 1");
                           
    //$stmt->bindParam(':id_jugador', $id_jugador, PDO::PARAM_INT);
    $stmt->bind_param('i', $id_jugador);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $estadisticas = $result->fetch_assoc();

    //$estadisticas = $stmt->fetch(PDO::FETCH_ASSOC);

    // 5. Retornar la respuesta estructurada
    if ($estadisticas) {
        echo json_encode([
            'success' => true,
            'sesion' => $_SESSION, 
            'estadisticas' => $estadisticas
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No se encontraron estadísticas para este jugador'
        ]);
    }

    $stmt->close();

} catch (Exception $e) {
    // Cambiamos PDOException por Exception general para capturar errores de MySQLi
    echo json_encode(['success' => false, 'error' => 'Error en la consulta: ' . $e->getMessage()]);
}

?>