<?php
// api/liga_helpers.php
// Funciones compartidas por todos los endpoints que necesitan saber en qué
// liga está parado el usuario, o verificar que pertenece a ella.
//
// Requiere que ya se haya llamado session_start() antes de usar estas
// funciones (cada endpoint lo hace por su cuenta, como ya venían haciendo).

// Devuelve el ID de la liga activa guardada en sesión, o null si no hay
// ninguna seleccionada todavía.
function ligaActivaId() {
    return isset($_SESSION['id_liga_activa']) ? (int) $_SESSION['id_liga_activa'] : null;
}

// Corta la ejecución con 401 si no hay sesión de usuario iniciada.
// Devuelve el ID_JUGADOR si está logueado.
function requireLogin() {
    if (!isset($_SESSION['ID_JUGADOR'])) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Usuario no autenticado']);
        exit;
    }
    return (int) $_SESSION['ID_JUGADOR'];
}

// Corta la ejecución con 400 si no hay una liga activa seleccionada.
// Devuelve el ID_LIGA si la hay.
function requireLigaActiva() {
    $idLiga = ligaActivaId();
    if (!$idLiga) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'No hay una liga activa seleccionada', 'code' => 'NO_LIGA_ACTIVA']);
        exit;
    }
    return $idLiga;
}

// Verifica que $idJugador pertenezca a $idLiga y esté activo.
// Devuelve el ROL_LIGA (int) si pertenece, o null si no pertenece.
function verificarAccesoLiga($conn, $idJugador, $idLiga) {
    $stmt = $conn->prepare('SELECT ROL_LIGA FROM liga_miembros WHERE ID_LIGA = ? AND ID_USUARIO = ? AND ACTIVO = 1 LIMIT 1');
    $stmt->bind_param('ii', $idLiga, $idJugador);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    return $row ? (int) $row['ROL_LIGA'] : null;
}

// Igual que verificarAccesoLiga pero corta la ejecución con 403 si no
// pertenece. $rolMinimo permite exigir un rol mínimo (5=admin, 3=delegado,
// 1=jugador raso). Devuelve el ROL_LIGA real del usuario.
function requireAccesoLiga($conn, $idJugador, $idLiga, $rolMinimo = 1) {
    $rol = verificarAccesoLiga($conn, $idJugador, $idLiga);
    if ($rol === null) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'No pertenecés a esta liga']);
        exit;
    }
    if ($rol < $rolMinimo) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'No tenés permisos suficientes en esta liga']);
        exit;
    }
    return $rol;
}

// Genera un código de invitación de 6 caracteres que no exista todavía
// en la tabla ligas.
function generarCodigoInvitacion($conn) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin O/0 ni I/1, para evitar confusiones
    do {
        $code = '';
        for ($i = 0; $i < 6; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }
        $stmt = $conn->prepare('SELECT 1 FROM ligas WHERE CODIGO_INVITACION = ? LIMIT 1');
        $stmt->bind_param('s', $code);
        $stmt->execute();
        $existe = $stmt->get_result()->num_rows > 0;
        $stmt->close();
    } while ($existe);
    return $code;
}
