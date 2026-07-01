// scripts/league-selection.js
// ============================================================================
// Lógica de la pantalla post-login (league-selection.html).
//
// BACKEND: no existe ninguna tabla "ligas" en la base de datos (copa.sql
// solo tiene canchas, estadisticas, eventos, jugadores, partidos,
// recolector_eventos, roles, contactos). Por eso:
//   - La lista de "Unirme a una Liga" usa datos de muestra (MOCK_LEAGUES
//     más abajo), no un fetch real. Reemplazar por un endpoint real
//     (ej. api/traerLigas.php) cuando exista esa tabla.
//   - "Crear Liga" genera un código random en el cliente, pero no se
//     persiste en ningún lado todavía (no hay dónde guardarlo). Queda
//     en sessionStorage como dato informativo para cuando exista el
//     backend correspondiente.
// Todas las opciones, como se pidió, terminan en home.html.
// ============================================================================

var MOCK_LEAGUES = [
    { name: 'Liga 5 Estrellas', players: 42 },
    { name: 'Fútbol Amigos FC', players: 28 },
    { name: 'Picado de los Martes', players: 18 }
];

document.addEventListener('DOMContentLoaded', function () {
    initJoinDropdown();
    initCreateLeagueModal();
});

// ── "Unirme a una Liga" ──────────────────────────────────────────────────
function initJoinDropdown() {
    var joinBtn = document.getElementById('joinLeagueBtn');
    var dropdown = document.getElementById('leagueDropdown');
    var list = document.getElementById('leagueDropdownList');

    if (!joinBtn || !dropdown || !list) return;

    list.innerHTML = MOCK_LEAGUES.length === 0
        ? '<div class="league-dropdown-empty">No hay ligas disponibles todavía.</div>'
        : MOCK_LEAGUES.map(function (liga) {
            return '<a href="home.html" class="league-dropdown-item">' +
                '<span class="league-dropdown-name">' + liga.name + '</span>' +
                '<span class="league-dropdown-meta">' + liga.players + ' jugadores</span>' +
            '</a>';
        }).join('');

    function closeDropdown() {
        dropdown.classList.remove('active');
        joinBtn.setAttribute('aria-expanded', 'false');
    }

    joinBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        var isOpen = dropdown.classList.contains('active');
        if (isOpen) {
            closeDropdown();
        } else {
            dropdown.classList.add('active');
            joinBtn.setAttribute('aria-expanded', 'true');
        }
    });

    document.addEventListener('click', function (event) {
        if (!dropdown.contains(event.target) && event.target !== joinBtn) {
            closeDropdown();
        }
    });
}

// ── "Crear Liga" ──────────────────────────────────────────────────────────
function initCreateLeagueModal() {
    var createBtn = document.getElementById('createLeagueBtn');
    var modal = document.getElementById('createLeagueModal');
    var closeBtn = document.getElementById('closeCreateLeagueModal');
    var nameInput = document.getElementById('newLeagueName');
    var submitBtn = document.getElementById('createLeagueSubmitBtn');
    var codeBox = document.getElementById('createLeagueCodeBox');
    var codeValue = document.getElementById('createLeagueCodeValue');

    if (!createBtn || !modal || !submitBtn) return;

    function openModal() {
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        codeBox.classList.remove('active');
        nameInput.value = '';
        submitBtn.textContent = 'Crear liga';
    }

    function generateLeagueCode() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin caracteres ambiguos (O/0, I/1)
        var code = '';
        for (var i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    createBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
    });

    submitBtn.addEventListener('click', function () {
        var name = nameInput.value.trim();
        if (!name) {
            nameInput.focus();
            return;
        }

        // Ya generó el código: confirmar y redirigir.
        if (codeBox.classList.contains('active')) {
            window.location.href = 'home.html';
            return;
        }

        var code = generateLeagueCode();
        codeValue.textContent = code;
        codeBox.classList.add('active');
        submitBtn.textContent = 'Continuar';

        // Informativo para cuando exista backend de ligas — hoy no hay
        // ningún endpoint que persista esto.
        try {
            sessionStorage.setItem('createdLeague', JSON.stringify({ name: name, code: code }));
        } catch (e) {
            // sessionStorage no disponible: no es bloqueante, seguimos igual.
        }
    });
}
