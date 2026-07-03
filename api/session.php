<?php
// api/session.php
// Devuelve la sesión de usuario actual si existe, junto con la info de la
// liga activa (si hay una seleccionada).

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/liga_helpers.php';
session_start();

if (!isset($_SESSION['ID_JUGADOR']) || !isset($_SESSION['NOMBRE'])) {
    echo json_encode(['ok' => false, 'jugador' => null]);
    exit;
}

$idJugador = (int) $_SESSION['ID_JUGADOR'];

$ligaActiva = null;
$idLigaActiva = ligaActivaId();

if ($idLigaActiva) {
    // Nos aseguramos de que siga siendo miembro (por si lo sacaron de la
    // liga en el medio de la sesión).
    $rolLiga = verificarAccesoLiga($conn, $idJugador, $idLigaActiva);

    if ($rolLiga !== null) {
        $stmt = $conn->prepare('SELECT ID_LIGA, NOMBRE, FORMATO_DEFAULT, PRIVADA FROM ligas WHERE ID_LIGA = ? LIMIT 1');
        $stmt->bind_param('i', $idLigaActiva);
        $stmt->execute();
        $liga = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($liga) {
            $ligaActiva = [
                'id' => (int) $liga['ID_LIGA'],
                'nombre' => $liga['NOMBRE'],
                'formato_default' => $liga['FORMATO_DEFAULT'],
                'privada' => (bool) $liga['PRIVADA'],
                'rol_liga' => $rolLiga
            ];
        }
    } else {
        // Ya no pertenece a esa liga: limpiamos la sesión.
        unset($_SESSION['id_liga_activa']);
    }
}

echo json_encode([
    'ok' => true,
    'jugador' => [
        'id' => $idJugador,
        'nombre' => $_SESSION['NOMBRE'],
        'rol' => isset($_SESSION['jugador_rol']) ? (int) $_SESSION['jugador_rol'] : null,
        'avatar' => isset($_SESSION['AVATAR_URL']) ? $_SESSION['AVATAR_URL'] : ''
    ],
    'ligaActiva' => $ligaActiva
]);

$conn->close();
