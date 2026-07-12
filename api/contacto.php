<?php
// api/contacto.php
// Recibe el formulario de ayuda, guarda el mensaje en la base de datos y genera un log del correo.
 
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
 
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}
 
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$correo_electronico = isset($_POST['correo_electronico']) ? trim($_POST['correo_electronico']) : '';
$asunto = isset($_POST['asunto']) ? trim($_POST['asunto']) : '';
$mensaje = isset($_POST['mensaje']) ? trim($_POST['mensaje']) : '';
 
if ($nombre === '' || $correo_electronico === '' || $asunto === '' || $mensaje === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Todos los campos son obligatorios']);
    exit;
}
 
if (!filter_var($correo_electronico, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Correo electrónico inválido']);
    exit;
}
 
$stmt = $conn->prepare('INSERT INTO contactos (NOMBRE, CORREO_ELECTRONICO, ASUNTO, MENSAJE) VALUES (?, ?, ?, ?)');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error en la consulta: ' . $conn->error]);
    exit;
}
 
$stmt->bind_param('ssss', $nombre, $correo_electronico, $asunto, $mensaje);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo guardar el mensaje']);
    $stmt->close();
    exit;
}
 
// --- CONFIGURACIÓN DEL CORREO ---
$destinatario = 'aplicopa2026@gmail.com';
$asunto_correo = "Nuevo contacto web: " . $asunto;
 
$cuerpo_correo = "Has recibido un nuevo mensaje desde el formulario de contacto de tu sitio.\n\n";
$cuerpo_correo .= "DATOS DEL CONTACTO:\n";
$cuerpo_correo .= "Nombre: $nombre\n";
$cuerpo_correo .= "Correo Electrónico: $correo_electronico\n";
$cuerpo_correo .= "Asunto: $asunto\n";
$cuerpo_correo .= "Mensaje:\n$mensaje\n";
 
$headers = "From: noreply@tusitio.com\r\n"; 
$headers .= "Reply-To: $correo_electronico\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();
 
// --- NUEVO CÓDIGO: GENERAR LOG EN TXT ---
// Definimos la ruta del archivo log (se creará en la misma carpeta que este script PHP)
$archivo_log = __DIR__ . '/log_correos.txt';
 
// Obtenemos la fecha y hora actual
$fecha_hora = date('Y-m-d H:i:s');
 
// Armamos el texto que se va a guardar
$texto_log = "=== NUEVO INTENTO DE ENVÍO: $fecha_hora ===\n";
$texto_log .= "PARA: $destinatario\n";
$texto_log .= "ASUNTO: $asunto_correo\n";
$texto_log .= "CABECERAS:\n$headers\n";
$texto_log .= "CUERPO DEL MENSAJE:\n$cuerpo_correo\n";
$texto_log .= "=================================================\n\n";
 
// Guardamos el texto en el archivo. FILE_APPEND evita que se borren los logs anteriores.
file_put_contents($archivo_log, $texto_log, FILE_APPEND);
// ----------------------------------------
 
// Ejecutamos la función mail (puedes comentarla con // si ni siquiera quieres que intente enviarlo por ahora)
@mail($destinatario, $asunto_correo, $cuerpo_correo, $headers);
 
$stmt->close();
$conn->close();
 
echo json_encode(['ok' => true, 'message' => 'Mensaje recibido, gracias por contactarnos']);