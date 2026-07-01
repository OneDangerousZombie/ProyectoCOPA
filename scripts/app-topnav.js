// scripts/app-topnav.js
// ============================================================================
// Maneja el navbar de desktop/tablet compartido (app-topnav.css):
// dropdown de usuario y logout. Los .nav-item del navbar ya los maneja
// navigation.js automáticamente (mismo querySelectorAll('.nav-item') que
// ya usa para el bottom-nav) — este archivo NO toca esa lógica.
//
// Compartido por cualquier página de pages/ que incluya el navbar de
// desktop (mismo patrón que data.js/utils.js: un solo archivo, no uno
// por página).
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
    var userTrigger = document.getElementById('userTrigger');
    var userMenu = document.getElementById('userMenu');
    var navUserName = document.getElementById('navUserName');
    var logoutBtn = document.getElementById('logoutBtn');

    // Si hay una sesión guardada por login.js (sessionStorage.copaUser),
    // mostrar el nombre real en vez del placeholder "Usuario". Puramente
    // de lectura — no crea ni modifica la sesión.
    if (navUserName) {
        try {
            var raw = sessionStorage.getItem('copaUser');
            if (raw) {
                var jugador = JSON.parse(raw);
                if (jugador && jugador.nombre) {
                    navUserName.textContent = jugador.nombre;
                }
            }
        } catch (e) {
            // sin sesión válida: se queda el placeholder "Usuario"
        }
    }

    if (userTrigger && userMenu) {
        userTrigger.addEventListener('click', function (event) {
            event.stopPropagation();
            var isOpen = userMenu.classList.contains('active');
            userMenu.classList.toggle('active', !isOpen);
            userTrigger.setAttribute('aria-expanded', String(!isOpen));
        });

        document.addEventListener('click', function () {
            userMenu.classList.remove('active');
            userTrigger.setAttribute('aria-expanded', 'false');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            try {
                sessionStorage.removeItem('copaUser');
            } catch (e) { /* no-op */ }
            window.location.href = 'login.html';
        });
    }
});
