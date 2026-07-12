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
// ══════════════════════════════════════════════════════
// AGREGADO: botón DEV para ROL=9, liga activa en navbar,
// logout global que destruye sesión PHP.
// ══════════════════════════════════════════════════════

(function() {
    // Extender el fetch de sesión que ya hace el original
    // para inyectar el botón DEV y el nombre de liga
    fetch('../api/session.php', { credentials: 'same-origin' })
        .then(function(r){ return r.json(); })
        .then(function(data) {
            if (!data.ok || !data.jugador) return;
            var j = data.jugador;

            // ── Botón DEV para ROL=9 ──────────────────
            if (j.rol === 9) {
                var links = document.querySelector('.app-topnav-links');
                if (links && !document.getElementById('devNavBtn')) {
                    var a = document.createElement('a');
                    a.id = 'devNavBtn';
                    a.href = 'dev-dashboard.html';
                    a.className = 'nav-item dev-nav-pill';
                    a.innerHTML = '<span class="nav-icon"><i class="fa-solid fa-terminal"></i></span> DEV';
                    links.appendChild(a);
                }
                // En perfil.html, mostrar botón DEV
                var profileDevBtn = document.getElementById('profileDevBtn');
                if (profileDevBtn) profileDevBtn.style.display = 'flex';
                // En mobile bottom-nav
                var bn = document.querySelector('.bottom-nav');
                if (bn && !document.getElementById('devBottomBtn')) {
                    var d = document.createElement('div');
                    d.id = 'devBottomBtn';
                    d.className = 'nav-item dev-bottom-item';
                    d.innerHTML = '<span class="nav-icon"><i class="fa-solid fa-terminal"></i></span>DEV';
                    d.onclick = function(){ window.location.href='dev-dashboard.html'; };
                    bn.appendChild(d);
                }
            }

            // ── Liga activa en navbar ─────────────────
            try {
                var liga = JSON.parse(sessionStorage.getItem('copaLigaActiva') || 'null');
                if (liga && liga.nombre) {
                    var inner = document.querySelector('.app-topnav-inner');
                    if (inner && !document.getElementById('navLigaName')) {
                        var span = document.createElement('span');
                        span.id = 'navLigaName';
                        span.className = 'app-topnav-liga-name';
                        span.textContent = liga.nombre;
                        var brand = inner.querySelector('.app-topnav-brand');
                        if (brand && brand.nextSibling) inner.insertBefore(span, brand.nextSibling);
                    }
                    var ac = document.querySelector('.app-container');
                    if (ac && !document.getElementById('mobileHeaderLiga')) {
                        var mh = document.createElement('div');
                        mh.id = 'mobileHeaderLiga';
                        mh.className = 'mobile-liga-header';
                        mh.innerHTML = '<i class="fa-solid fa-trophy"></i> ' + liga.nombre;
                        ac.insertBefore(mh, ac.firstChild);
                    }
                }
            } catch(e) {}
        })
        .catch(function(){});

    // ── Logout global: destruye sesión PHP antes de redirigir ──
    // Reemplaza el listener del logoutBtn original
    document.addEventListener('DOMContentLoaded', function() {
        var btn = document.getElementById('logoutBtn');
        if (!btn) return;
        // Clonar para remover listeners anteriores
        var newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function() {
            fetch('../api/logout.php', { method:'POST', credentials:'same-origin' })
                .catch(function(){})
                .finally(function(){
                    try { sessionStorage.clear(); } catch(e){}
                    window.location.href = '../index.html';
                });
        });
    });
})();

// ── Interceptor de nuevo-partido.html para ROL_LIGA=5 ─────────
// Muestra el popup ANTES de navegar a nuevo-partido,
// interceptando cualquier click que apunte a esa página.
(function() {
    var rolLiga = 0;

    fetch('../api/session.php', { credentials: 'same-origin' })
        .then(function(r){ return r.json(); })
        .then(function(data) {
            rolLiga = (data.ligaActiva && data.ligaActiva.rol_liga) ? data.ligaActiva.rol_liga : 0;
        })
        .catch(function(){});

    document.addEventListener('click', function(e) {
        // Capturar clicks en nav-items, links o botones que apunten a nuevo-partido
        var target = e.target.closest('[data-page="nuevo-partido"], a[href*="nuevo-partido"], button[onclick*="nuevo-partido"]');
        if (!target) return;
        if (rolLiga === 5) return;

        e.preventDefault();
        e.stopImmediatePropagation();
        mostrarPopupNuevoPartido();
    }, true);

    function mostrarPopupNuevoPartido() {
        if (document.getElementById('npAccessPopup')) return;
        var overlay = document.createElement('div');
        overlay.id = 'npAccessPopup';
        overlay.className = 'access-popup-overlay';
        overlay.innerHTML =
            '<div class="access-popup">' +
                '<div class="access-popup-icon"><i class="fa-solid fa-lock"></i></div>' +
                '<h3>Acceso restringido</h3>' +
                '<p>Solo los administradores pueden crear partidos.</p>' +
                '<a href="crear-partido.html" class="access-popup-btn">' +
                    '<i class="fa-solid fa-arrow-left"></i> Volver a partidos' +
                '</a>' +
            '</div>';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
    }
})();
