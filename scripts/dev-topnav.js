// scripts/dev-topnav.js
// ============================================================================
// Navbar compartido del área DEV. Maneja:
//   - Verificación de sesión y autorización (solo ROL=9 puede entrar)
//   - Muestra nombre y avatar del usuario logueado
//   - Dropdown de usuario y logout
//   - Resaltado del link activo según la URL actual
//
// IDs usados: devUserTrigger, devUserMenu, devUserName, devUserAvatar,
//             devLogoutBtn (distintos de app-topnav.js para no colisionar
//             si ambas áreas se abrieran en el mismo contexto)
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {

    // ── Auth: verificar sesión antes de mostrar nada ──────────
    fetch('../api/session.php', { credentials: 'same-origin' })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (!data.ok || !data.jugador) {
                // Sin sesión → al login
                window.location.href = 'login.html';
                return;
            }
            if (data.jugador.rol !== 9) {
                // Sin permisos DEV → al home de la app
                window.location.href = 'home.html';
                return;
            }
            // Sesión válida: inyectar datos en el navbar
            var nameEl   = document.getElementById('devUserName');
            var avatarEl = document.getElementById('devUserAvatar');
            if (nameEl)   nameEl.textContent = data.jugador.nombre || 'DEV';
            if (avatarEl) {
                if (data.jugador.avatar) {
                    // El contenedor #devUserAvatar ya tiene las clases CSS que lo limitan
                    avatarEl.innerHTML = '<img src="' + data.jugador.avatar + '" alt="' + (data.jugador.nombre || '') + '">';
                } else {
                    avatarEl.innerHTML = '<i class="fa-solid fa-user"></i>';
                }
            }
        })
        .catch(function () {
            window.location.href = 'login.html';
        });

    // ── Dropdown de usuario ───────────────────────────────────
    var trigger  = document.getElementById('devUserTrigger');
    var menu     = document.getElementById('devUserMenu');
    var logoutBtn= document.getElementById('devLogoutBtn');

    if (trigger && menu) {
        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = menu.classList.contains('active');
            menu.classList.toggle('active', !isOpen);
            trigger.setAttribute('aria-expanded', String(!isOpen));
        });

        document.addEventListener('click', function () {
            menu.classList.remove('active');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            fetch('../api/logout.php', { method: 'POST', credentials: 'same-origin' })
                .catch(function () { /* no-op */ })
                .finally(function () {
                    try { sessionStorage.removeItem('copaUser'); } catch(e){}
                    window.location.href = 'login.html';
                });
        });
    }

    // ── Resaltar link activo ──────────────────────────────────
    var current = window.location.pathname.split('/').pop();
    document.querySelectorAll('.dev-nav-link[data-page]').forEach(function (link) {
        if (link.dataset.page === current) {
            link.classList.add('active');
        }
    });

});
