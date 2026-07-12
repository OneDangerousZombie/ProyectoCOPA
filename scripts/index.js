/* ===========================================================================
   index.js — Lógica compartida por TODAS las páginas públicas de COPA
   (index, ligas, caracteristicas, ayuda, sobre-nosotros).
   Vanilla JS, sin dependencias. Todo dentro de DOMContentLoaded.

   Fusión aplicada:
   - Dropdown genérico (usuario + ¿Quiénes Somos?) e íconos Font Awesome:
     tomados de la versión post-rediseño.
   - Envío real del formulario de contacto (fetch + manejo de error):
     restaurado desde la versión anterior al rediseño, que se había
     perdido en el merge.
   - Lógica de acordeón: eliminada (ya no existe en ayuda.html / index.css).
   =========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ===== AUTH =====
       Única fuente de verdad de la sesión: backend PHP. Se consulta el
       endpoint /api/session.php para saber si el usuario está logueado.
       Si hay sesión, se muestra el nombre y avatar; si no, se ocultan
       los elementos de usuario. */
    let sessionUser = null;
    let isLoggedIn = false;

    function getApiUrl(file) {
        return window.location.pathname.includes('/pages/') ? '../api/' + file : 'api/' + file;
    }

    async function fetchSession() {
        try {
            const response = await fetch(getApiUrl('session.php'), {
                credentials: 'same-origin'
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data.ok ? data.jugador : null;
        } catch (err) {
            return null;
        }
    }

    async function logout() {
        try {
            await fetch(getApiUrl('logout.php'), {
                method: 'POST',
                credentials: 'same-origin'
            });
        } catch (err) {
            // No bloqueamos el logout por un error de red: igual limpiamos UI.
        }
        sessionUser = null;
        isLoggedIn = false;
        refreshAuthVisibility();
        closeAllDropdowns();
        closeMobileMenu();
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ) {
            window.location.reload();
        } else {
            window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
        }
    }

    /* Aplica isLoggedIn a TODA la página: clase en <body>, datos del usuario
       en el navbar, y visibilidad de cualquier elemento [data-auth]. */
    function refreshAuthVisibility() {
        document.body.classList.toggle('is-authenticated', isLoggedIn);

        const user = sessionUser;

        const nameEl = document.getElementById('navUserName');
        if (nameEl) nameEl.textContent = (user && user.nombre) ? user.nombre : 'Usuario';

        const avatarEl = document.getElementById('navUserAvatar');
        if (avatarEl) {
            if (user && user.avatar) {
                avatarEl.innerHTML = '<img src="' + user.avatar + '" alt="Avatar de ' + (user.nombre || 'usuario') + '">';
            } else {
                avatarEl.innerHTML = '<i class="fa-solid fa-user"></i>';
            }
        }

        document.querySelectorAll('[data-auth="guest"]').forEach((el) => {
            el.classList.toggle('is-hidden', isLoggedIn);
        });

        document.querySelectorAll('[data-auth="user"]').forEach((el) => {
            el.classList.toggle('is-hidden', !isLoggedIn);
        });
    }

    (async function initializeSession() {
        sessionUser = await fetchSession();
        isLoggedIn = !!sessionUser;
        refreshAuthVisibility();
    })();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', logout);


    /* ===== NAVBAR ===== */

    /* Resalta el link activo comparando el archivo actual con data-page,
       mismo patrón que ya usa navigation.js para el bottom-nav de la app.
       Si el link activo vive dentro de un dropdown (ej. ¿Quiénes Somos?),
       también resalta el botón que lo abre. */
    function highlightActiveNav() {
        const path = window.location.pathname;
        const currentPage = path.split('/').pop().replace('.html', '') || 'index';

        document.querySelectorAll('[data-page]').forEach((link) => {
            const isActive = link.getAttribute('data-page') === currentPage;
            link.classList.toggle('active', isActive);

            if (isActive) {
                const parentDropdown = link.closest('.nav-dropdown');
                if (parentDropdown) {
                    const trigger = parentDropdown.querySelector('.nav-dropdown-trigger');
                    if (trigger) trigger.classList.add('active');
                }
            }
        });
    }

    highlightActiveNav();


    /* ===== DROPDOWNS =====
       Maneja cualquier par trigger/menu presente en la página (usuario,
       ¿Quiénes Somos?, o futuros menús) sin necesidad de tocar este código
       al agregar uno nuevo: alcanza con que comparta la misma estructura. */
    const dropdowns = [
        { trigger: document.getElementById('userTrigger'), menu: document.getElementById('userMenu') },
        { trigger: document.getElementById('aboutTrigger'), menu: document.getElementById('aboutMenu') }
    ].filter(({ trigger, menu }) => trigger && menu);

    function closeAllDropdowns() {
        dropdowns.forEach(({ trigger, menu }) => {
            menu.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
        });
    }

    dropdowns.forEach(({ trigger, menu }) => {
        trigger.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = menu.classList.contains('active');
            closeAllDropdowns();
            if (!isOpen) {
                menu.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    document.addEventListener('click', closeAllDropdowns);

    /* ── Menú mobile ── */
    const hamburger = document.getElementById('navHamburger');
    const mobilePanel = document.getElementById('mobileMenuPanel');
    const mobileBackdrop = document.getElementById('mobileMenuBackdrop');

    function closeMobileMenu() {
        if (!hamburger || !mobilePanel) return;
        mobilePanel.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        if (mobileBackdrop) mobileBackdrop.classList.remove('active');
    }

    if (hamburger && mobilePanel) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobilePanel.classList.contains('active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                mobilePanel.classList.add('active');
                hamburger.setAttribute('aria-expanded', 'true');
                if (mobileBackdrop) mobileBackdrop.classList.add('active');
            }
        });

        mobilePanel.querySelectorAll('.mobile-link, .btn-nav').forEach((el) => {
            el.addEventListener('click', closeMobileMenu);
        });

        if (mobileBackdrop) {
            mobileBackdrop.addEventListener('click', closeMobileMenu);
        }
    }


    /* ===== LIGAS (buscador + render, disponible para todos) ===== */
    let ligas = [];
    const ligasGrid   = document.getElementById('ligasGrid');
    const ligasEmpty  = document.getElementById('ligasEmpty');
    const ligaSearch  = document.getElementById('ligaSearch');
    const ligaDetalle = document.getElementById('ligaDetalle');
    const ligaSection = document.getElementById('ligas');

    // ── Renderizar grilla de ligas ────────────────────────────────
    function renderLigas(filtro = '') {
        if (!ligasGrid) return;
        const filtroNorm = filtro.trim().toLowerCase();
        const filtradas  = ligas.filter(l => l.nombre.toLowerCase().includes(filtroNorm));

        ligasGrid.innerHTML = filtradas.map(liga => `
            <div class="liga-card">
                <div class="liga-card-header">
                    <span class="liga-card-name">${liga.nombre}</span>
                    ${liga.privada == 1 ? '<span class="liga-card-badge"><i class="fa-solid fa-lock"></i> Privada</span>' : ''}
                </div>
                <div class="liga-card-meta">
                    <span><i class="fa-solid fa-users"></i> <strong>${liga.cantidad_miembros}</strong> jugadores</span>
                    <span><i class="fa-solid fa-calendar-days"></i> ${liga.ultimo_partido ? new Date(liga.ultimo_partido).toLocaleDateString('es-AR') : 'Sin partidos'}</span>
                </div>
                <button class="liga-card-btn" onclick="verDetalleLiga(${liga.id}, '${liga.nombre.replace(/'/g,"\'")}')" >
                    Ver estadísticas <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `).join('');

        if (ligasEmpty) ligasEmpty.classList.toggle('active', filtradas.length === 0);
    }

    function cargarLigasPublicas() {
        fetch('api/listar_ligas_publicas.php')
            .then(r => r.json())
            .then(data => {
                if (data.ok && Array.isArray(data.ligas)) { ligas = data.ligas; renderLigas(); }
            })
            .catch(() => {});
    }

    if (ligasGrid) {
        cargarLigasPublicas();
        if (ligaSearch) ligaSearch.addEventListener('input', e => renderLigas(e.target.value));
    }

    // ── Ver detalle de una liga ───────────────────────────────────
    window.verDetalleLiga = function(ligaId, nombre) {
        if (!ligaDetalle || !ligaSection) return;

        // Ocultar grilla, mostrar detalle
        ligaSection.style.display = 'none';
        ligaDetalle.style.display = 'block';

        document.getElementById('detalleLigaNombre').textContent = nombre;
        document.getElementById('detallePartido').innerHTML = '<div class="detalle-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Cargando…</div>';
        document.getElementById('detalleStatsBody').innerHTML = '';

        fetch('api/ligaDetalle.php?liga_id=' + ligaId)
            .then(r => r.json())
            .then(data => {
                if (!data.ok) return;
                renderDetallePartido(data.partido);
                renderDetalleStats(data.stats);
            })
            .catch(() => {
                document.getElementById('detallePartido').innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:1rem">No se pudo cargar el detalle.</p>';
            });
    };

    window.volverALigas = function() {
        if (ligaDetalle) ligaDetalle.style.display = 'none';
        if (ligaSection) ligaSection.style.display = '';
    };

    function renderDetallePartido(partido) {
        const el = document.getElementById('detallePartido');
        if (!el) return;
        if (!partido) {
            el.innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:1.5rem;font-size:0.85rem"><i class="fa-solid fa-calendar-xmark"></i>  Todavía no hay partidos en esta liga.</p>';
            return;
        }
        const eq1 = partido.equipos ? partido.equipos.equipo1 : 'Blanco';
        const eq2 = partido.equipos ? partido.equipos.equipo2 : 'Negro';
        const g1  = partido.goles  ? partido.goles.equipo1  : 0;
        const g2  = partido.goles  ? partido.goles.equipo2  : 0;
        const fecha = new Date(partido.fecha).toLocaleDateString('es-AR', {day:'2-digit',month:'long',year:'numeric'});

        el.innerHTML = `
            <div class="detalle-match-label">Último partido · ${fecha}</div>
            <div class="detalle-match-score">
                <span class="detalle-team">${eq1}</span>
                <div class="detalle-score-center">
                    <span class="detalle-score-num">${g1}</span>
                    <span class="detalle-score-sep">—</span>
                    <span class="detalle-score-num">${g2}</span>
                </div>
                <span class="detalle-team">${eq2}</span>
            </div>
            ${partido.cancha ? '<div class="detalle-match-cancha"><i class="fa-solid fa-location-dot"></i> ' + partido.cancha + '</div>' : ''}
        `;
    }

    // ── Stats con filtros ─────────────────────────────────────────
    let detalleStats = [];
    let detalleSortKey  = 'goles';
    let detalleSortDir  = -1;

    function renderDetalleStats(stats) {
        detalleStats = stats || [];
        renderDetalleTabla();
    }

    function renderDetalleTabla() {
        const sorted = [...detalleStats].sort((a, b) => (a[detalleSortKey] - b[detalleSortKey]) * detalleSortDir);
        const tbody = document.getElementById('detalleStatsBody');
        if (!tbody) return;
        tbody.innerHTML = sorted.map((p, i) => {
            const av = p.avatar
                ? `<img src="${p.avatar}" class="detalle-avatar" alt="">`
                : `<div class="detalle-avatar-ph"><i class="fa-solid fa-user"></i></div>`;
            return `<tr>
                <td>${i+1}°</td>
                <td class="td-name"><div class="detalle-name-row">${av}<span>${escHtml(p.nombre)}</span></div></td>
                <td>${p.pj}</td>
                <td>${p.pg}</td>
                <td>${p.pe}</td>
                <td>${p.pp}</td>
                <td>${p.goles}</td>
                <td>${p.asistencias}</td>
                <td>${p.racha}</td>
                <td>${Math.round(p.elo||1000)}</td>
            </tr>`;
        }).join('');
    }

    window.detalleSort = function(key) {
        if (detalleSortKey === key) { detalleSortDir *= -1; }
        else { detalleSortKey = key; detalleSortDir = -1; }
        document.querySelectorAll('.detalle-th-sort').forEach(th => th.classList.remove('active'));
        const th = document.querySelector('.detalle-th-sort[data-key="' + key + '"]');
        if (th) th.classList.add('active');
        renderDetalleTabla();
    };

    window.detalleFiltrar = function(key) {
        detalleSortKey = key;
        detalleSortDir = -1;
        document.querySelectorAll('.detalle-filter-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector('.detalle-filter-btn[data-key="' + key + '"]');
        if (btn) btn.classList.add('active');
        renderDetalleTabla();
    };

    function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }


    /* ===== FORMULARIO (ayuda.html) =====
       Envía por fetch al endpoint indicado en contactForm.action.
       PENDIENTE: todavía no nos pasaron a dónde debe apuntar ese endpoint
       (el <form> en ayuda.html no tiene "action" definido todavía). Hasta
       que llegue ese dato, el fetch va a fallar y se va a mostrar el
       mensaje de "Error de conexión" — es el comportamiento esperado, no
       un bug. Avisar si esto se resuelve y no se actualizó acá. */
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        const formError = document.getElementById('formError');

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nombre = document.getElementById('contactName');
            const email = document.getElementById('contactEmail');
            const asunto = document.getElementById('contactSubject');
            const mensaje = document.getElementById('contactMessage');

            const camposOk = [nombre, email, asunto, mensaje].every((el) => el && el.value.trim().length > 0);
            if (!camposOk) {
                if (formError) {
                    formError.textContent = 'Por favor completá todos los campos obligatorios.';
                    formError.classList.add('active');
                }
                return;
            }

            if (formError) {
                formError.textContent = '';
                formError.classList.remove('active');
            }

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm)
                });

                const data = await response.json();
                if (data.ok) {
                    if (formSuccess) formSuccess.classList.add('active');
                    contactForm.reset();
                } else {
                    if (formError) {
                        formError.textContent = data.error || 'No se pudo enviar el mensaje. Intentá de nuevo.';
                        formError.classList.add('active');
                    }
                }
            } catch (error) {
                if (formError) {
                    formError.textContent = 'Error de conexión. Por favor intentá más tarde.';
                    formError.classList.add('active');
                }
            }
        });
    }




    /* ===== ANIMACIÓN AL SCROLL ===== */
    const revealElements = document.querySelectorAll('.reveal');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach((el) => el.classList.add('is-visible'));
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach((el) => observer.observe(el));
    }


    /* ===== NAVBAR: profundidad al hacer scroll =====
       Puramente decorativo, clase nueva (is-scrolled) que no es leída por
       ningún otro archivo. No reemplaza ni interfiere con highlightActiveNav
       ni con los dropdowns. */
    const landingNavbar = document.querySelector('.landing-navbar');
    if (landingNavbar) {
        const updateNavbarElevation = () => {
            landingNavbar.classList.toggle('is-scrolled', window.scrollY > 8);
        };
        updateNavbarElevation();
        window.addEventListener('scroll', updateNavbarElevation, { passive: true });
    }


    /* ===== BLOOM QUE SIGUE AL CURSOR (Top Liga / Estadísticas) =====
       Solo en los locked-card dentro de .liga-numbers-pair (Rankings y
       Estadísticas) — no afecta al locked-card de goleadores en la
       sidebar de noticias, que no pidió este efecto. Actualiza dos
       variables CSS (--spot-x/--spot-y) que index.css usa en un
       radial-gradient; la clase "is-glowing" solo prende/apaga la
       opacidad del resplandor con una transición suave. */
    const glowCards = document.querySelectorAll('.liga-numbers-pair .locked-card');
    glowCards.forEach((card) => {
        card.addEventListener('mousemove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--spot-x', x + '%');
            card.style.setProperty('--spot-y', y + '%');
        });

        card.addEventListener('mouseenter', () => {
            card.classList.add('is-glowing');
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('is-glowing');
        });
    });

});