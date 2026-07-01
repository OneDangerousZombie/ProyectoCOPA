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
    var navUserAvatar = document.getElementById('navUserAvatar');
    var logoutBtn = document.getElementById('logoutBtn');

    // Si hay una sesión guardada en el backend, mostrar el nombre real
    // y el avatar real en vez de los placeholders.
    if (navUserName) {
        try {
            var raw = null;
            var sessionPath = '../api/session.php';
            fetch(sessionPath, { credentials: 'same-origin' })
                .then(function(response) {
                    if (!response.ok) return null;
                    return response.json();
                })
                .then(function(data) {
                    if (data && data.ok && data.jugador) {
                        var jugador = data.jugador;
                        if (jugador.nombre) {
                            navUserName.textContent = jugador.nombre;
                        }
                        if (navUserAvatar) {
                            if (jugador.avatar) {
                                navUserAvatar.innerHTML = '<img src="' + jugador.avatar + '" alt="Avatar de ' + (jugador.nombre || 'usuario') + '">';
                            } else {
                                navUserAvatar.innerHTML = '<i class="fa-solid fa-user"></i>';
                            }
                        }
                    }
                })
                .catch(function () {
                    // sin sesión válida: se queda el placeholder "Usuario"
                });
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
