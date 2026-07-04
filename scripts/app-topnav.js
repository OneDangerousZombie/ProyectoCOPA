// scripts/app-topnav.js
// ============================================================================
// Maneja el navbar de desktop/tablet compartido (app-topnav.css):
// dropdown de usuario, liga activa y logout. Los .nav-item del navbar ya
// los maneja navigation.js automáticamente (mismo querySelectorAll('.nav-item')
// que ya usa para el bottom-nav) — este archivo NO toca esa lógica.
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

    // Si hay una sesión guardada en el backend, mostrar el nombre real,
    // el avatar real y la liga activa en vez de los placeholders.
    if (navUserName) {
        try {
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

                    renderLigaActivaEnMenu(data && data.ligaActiva ? data.ligaActiva : null);

                    // Si está logueado pero todavía no eligió/creó una liga,
                    // lo mandamos a elegir una (salvo que ya esté en esa página).
                    var enPaginaDeSeleccion = /league-selection\.html$/.test(window.location.pathname);
                    if (data && data.ok && data.jugador && !data.ligaActiva && !enPaginaDeSeleccion) {
                        window.location.href = 'league-selection.html';
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

// Agrega, dentro del dropdown de usuario, el nombre de la liga activa y un
// link para cambiar de liga. Se arma en JS (no en cada .html) porque el
// navbar se repite igual en todas las páginas.
function renderLigaActivaEnMenu(ligaActiva) {
    var userMenu = document.getElementById('userMenu');
    var logoutBtn = document.getElementById('logoutBtn');
    if (!userMenu) return;

    var existente = document.getElementById('navLigaActivaItem');
    if (existente) existente.remove();

    var item = document.createElement('a');
    item.href = 'league-selection.html';
    item.id = 'navLigaActivaItem';
    item.className = 'app-topnav-user-menu-item';

    if (ligaActiva && ligaActiva.nombre) {
        item.innerHTML = '<i class="fa-solid fa-shield-halved" style="margin-right:0.4rem;opacity:0.7;"></i>' +
            escapeHtmlTopnav(ligaActiva.nombre) + ' <span style="opacity:0.6;font-weight:400;">(cambiar)</span>';
    } else {
        item.textContent = 'Elegir una liga';
    }

    if (logoutBtn && logoutBtn.parentNode === userMenu) {
        userMenu.insertBefore(item, logoutBtn);
    } else {
        userMenu.appendChild(item);
    }
}

function escapeHtmlTopnav(text) {
    var div = document.createElement('div');
    div.textContent = text == null ? '' : text;
    return div.innerHTML;
}
