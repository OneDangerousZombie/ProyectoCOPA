/* ===========================================================================
   index.js — Lógica compartida por TODAS las páginas públicas de COPA
   (index, ligas, caracteristicas, como-funciona, ayuda, sobre-nosotros).
   Vanilla JS, sin dependencias. Todo dentro de DOMContentLoaded.
   =========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ===== AUTH =====
       Única fuente de verdad de la sesión. Hoy se simula con localStorage;
       el día que se conecte con PHP, ESTA es la única función que hay que
       reemplazar (por ejemplo leyendo un valor que el servidor inyectó en
       el HTML, o llamando a un endpoint). Todo lo demás (navbar, cards
       bloqueadas, accesos, etc.) sigue funcionando igual porque depende
       únicamente de isLoggedIn / refreshAuthVisibility(). */
    const AUTH_KEY = 'copaUser';

    function getStoredUser() {
        const raw = localStorage.getItem(AUTH_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (err) {
            return null;
        }
    }

    let isLoggedIn = !!getStoredUser();

    function setSession(user) {
        if (user) {
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(AUTH_KEY);
        }
        isLoggedIn = !!user;
        refreshAuthVisibility();
    }

    function logout() {
        setSession(null);
        closeAllDropdowns();
        closeMobileMenu();
    }

    /* Aplica isLoggedIn a TODA la página: clase en <body>, datos del usuario
       en el navbar, y visibilidad de cualquier elemento [data-auth]. */
    function refreshAuthVisibility() {
        document.body.classList.toggle('is-authenticated', isLoggedIn);

        const user = getStoredUser();

        const nameEl = document.getElementById('navUserName');
        if (nameEl) nameEl.textContent = (user && user.username) ? user.username : 'Usuario';

        const avatarEl = document.getElementById('navUserAvatar');
        if (avatarEl) avatarEl.textContent = (user && user.avatar) ? user.avatar : '👤';

        document.querySelectorAll('[data-auth="guest"]').forEach((el) => {
            el.classList.toggle('is-hidden', isLoggedIn);
        });

        document.querySelectorAll('[data-auth="user"]').forEach((el) => {
            el.classList.toggle('is-hidden', !isLoggedIn);
        });

        updateTestToggleLabel();
    }

    refreshAuthVisibility();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', logout);


    /* ===== NAVBAR ===== */

    /* Resalta el link activo comparando el archivo actual con data-page,
       mismo patrón que ya usa navigation.js para el bottom-nav de la app. */
    function highlightActiveNav() {
        const path = window.location.pathname;
        const currentPage = path.split('/').pop().replace('.html', '') || 'index';

        document.querySelectorAll('[data-page]').forEach((link) => {
            link.classList.toggle('active', link.getAttribute('data-page') === currentPage);
        });
    }

    highlightActiveNav();


    /* ===== DROPDOWNS ===== */
    const userTrigger = document.getElementById('userTrigger');
    const userMenu = document.getElementById('userMenu');

    function closeAllDropdowns() {
        if (userMenu) userMenu.classList.remove('active');
        if (userTrigger) userTrigger.setAttribute('aria-expanded', 'false');
    }

    if (userTrigger && userMenu) {
        userTrigger.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = userMenu.classList.contains('active');
            closeAllDropdowns();
            if (!isOpen) {
                userMenu.classList.add('active');
                userTrigger.setAttribute('aria-expanded', 'true');
            }
        });
    }

    document.addEventListener('click', closeAllDropdowns);

    /* ── Menú mobile ── */
    const hamburger = document.getElementById('navHamburger');
    const mobilePanel = document.getElementById('mobileMenuPanel');

    function closeMobileMenu() {
        if (!hamburger || !mobilePanel) return;
        mobilePanel.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    if (hamburger && mobilePanel) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobilePanel.classList.contains('active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                mobilePanel.classList.add('active');
                hamburger.setAttribute('aria-expanded', 'true');
            }
        });

        mobilePanel.querySelectorAll('.mobile-link, .btn-nav').forEach((el) => {
            el.addEventListener('click', closeMobileMenu);
        });
    }


    /* ===== LIGAS (buscador + render, disponible para todos) ===== */
    const ligas = [
        { nombre: 'Liga 5 Estrellas', jugadores: 42, ultimoPartido: 'Fecha 7 — BLANCO 3-2 NEGRO' },
        { nombre: 'Fútbol Amigos FC', jugadores: 28, ultimoPartido: 'Fecha 5 — Verde 1-1 Rojo' },
        { nombre: 'Liga Universitaria', jugadores: 56, ultimoPartido: 'Fecha 9 — Halcones 4-0 Tigres' },
        { nombre: 'Picado de los Martes', jugadores: 18, ultimoPartido: 'Fecha 12 — Azul 2-3 Amarillo' }
    ];

    const ligasGrid = document.getElementById('ligasGrid');
    const ligasEmpty = document.getElementById('ligasEmpty');
    const ligaSearch = document.getElementById('ligaSearch');

    function renderLigas(filtro = '') {
        if (!ligasGrid) return;

        const filtroNormalizado = filtro.trim().toLowerCase();
        const filtradas = ligas.filter((liga) =>
            liga.nombre.toLowerCase().includes(filtroNormalizado)
        );

        ligasGrid.innerHTML = filtradas.map((liga) => `
            <div class="liga-card">
                <span class="liga-card-name">${liga.nombre}</span>
                <div class="liga-card-meta">
                    <span><strong>${liga.jugadores}</strong> jugadores</span>
                    <span>Último partido: ${liga.ultimoPartido}</span>
                </div>
                <a href="pages/liga.html" class="liga-card-btn">Ver Liga →</a>
            </div>
        `).join('');

        if (ligasEmpty) {
            ligasEmpty.classList.toggle('active', filtradas.length === 0);
        }
    }

    if (ligasGrid) {
        renderLigas();
        if (ligaSearch) {
            ligaSearch.addEventListener('input', (event) => renderLigas(event.target.value));
        }
    }


    /* ===== FORMULARIO (ayuda.html) =====
       Sin backend todavía: valida, muestra confirmación y limpia el form.
       Los campos ya tienen los "name" listos para un futuro <form action="...php">. */
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const nombre = document.getElementById('contactName');
            const email = document.getElementById('contactEmail');
            const mensaje = document.getElementById('contactMessage');

            const camposOk = [nombre, email, mensaje].every((el) => el && el.value.trim().length > 0);
            if (!camposOk) return;

            if (formSuccess) formSuccess.classList.add('active');
            contactForm.reset();
        });
    }


    /* ===== TEST LOGIN =====
       Botón temporal para desarrollo: alterna Modo Invitado / Modo Usuario
       Logueado sin recargar la página. Se puede borrar por completo el día
       que se conecte la autenticación real — nada más depende de esto. */
    function createTestToggle() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'testToggleBtn';
        btn.className = 'test-toggle-btn';
        btn.innerHTML = '<span class="test-toggle-dot"></span><span id="testToggleLabel">Modo: Invitado</span>';

        btn.addEventListener('click', () => {
            if (isLoggedIn) {
                setSession(null);
            } else {
                setSession({ username: 'Brandon', avatar: '👤' });
            }
        });

        document.body.appendChild(btn);
        updateTestToggleLabel();
    }

    function updateTestToggleLabel() {
        const label = document.getElementById('testToggleLabel');
        if (label) label.textContent = isLoggedIn ? 'Modo: Usuario logueado' : 'Modo: Invitado';
    }

    createTestToggle();


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

});
