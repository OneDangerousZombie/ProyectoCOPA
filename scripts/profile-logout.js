// scripts/profile-logout.js
// Botón de "Cerrar sesión" visible en todos los tamaños de pantalla en
// perfil.html (el del dropdown de app-topnav solo se ve desde 860px).
// Archivo nuevo y separado a propósito: no toca perfil.js.

document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('profileLogoutBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
        try {
            localStorage.removeItem('copaUser');
        } catch (e) { /* no-op */ }
        window.location.href = 'login.html';
    });
});
