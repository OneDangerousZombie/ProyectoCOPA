// scripts/league-selection.js
// ============================================================================
// Lógica de la pantalla post-login (league-selection.html), ya conectada al
// backend real de ligas: api/listar_ligas.php, api/crear_liga.php,
// api/unirse_liga.php y api/seleccionar_liga.php.
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
    cargarLigas();
    initJoinDropdown();
    initJoinByCode();
    initCreateLeagueModal();
});

// ── Traer "mis ligas" + ligas públicas disponibles ─────────────────────────
function cargarLigas() {
    fetch('../api/listar_ligas.php')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            if (!data.ok) {
                console.warn('No se pudieron cargar las ligas:', data.error);
                return;
            }
            renderMisLigas(data.misLigas || []);
            renderLigasPublicas(data.publicas || []);
        })
        .catch(function (error) {
            console.error('Error cargando ligas:', error);
        });
}

function renderMisLigas(misLigas) {
    var wrap = document.getElementById('misLigasWrap');
    var list = document.getElementById('misLigasList');
    if (!wrap || !list) return;

    if (misLigas.length === 0) {
        wrap.style.display = 'none';
        return;
    }

    wrap.style.display = 'block';
    list.innerHTML = misLigas.map(function (liga) {
        var rolBadge = liga.rol_liga >= 5 ? ' · Admin' : '';
        return '<button type="button" class="league-dropdown-item mis-ligas-item" data-liga-id="' + liga.id + '" style="width:100%; text-align:left; background:none; border:none; cursor:pointer;">' +
            '<span class="league-dropdown-name">' + escapeHtml(liga.nombre) + rolBadge + '</span>' +
            '<span class="league-dropdown-meta">' + liga.cantidad_miembros + ' jugadores · ELO ' + Math.round(liga.valor_elo) + '</span>' +
        '</button>';
    }).join('');

    list.querySelectorAll('.mis-ligas-item').forEach(function (item) {
        item.addEventListener('click', function () {
            seleccionarLiga(parseInt(item.getAttribute('data-liga-id'), 10));
        });
    });
}

function renderLigasPublicas(publicas) {
    var list = document.getElementById('leagueDropdownList');
    if (!list) return;

    list.innerHTML = publicas.length === 0
        ? '<div class="league-dropdown-empty">No hay ligas públicas disponibles todavía.</div>'
        : publicas.map(function (liga) {
            return '<button type="button" class="league-dropdown-item liga-publica-item" data-liga-id="' + liga.id + '" style="width:100%; text-align:left; background:none; border:none; cursor:pointer;">' +
                '<span class="league-dropdown-name">' + escapeHtml(liga.nombre) + '</span>' +
                '<span class="league-dropdown-meta">' + liga.cantidad_miembros + ' jugadores</span>' +
            '</button>';
        }).join('');

    list.querySelectorAll('.liga-publica-item').forEach(function (item) {
        item.addEventListener('click', function () {
            unirseALiga({ id_liga: parseInt(item.getAttribute('data-liga-id'), 10) });
        });
    });
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text == null ? '' : text;
    return div.innerHTML;
}

// ── Ir a una liga a la que ya pertenezco ───────────────────────────────────
function seleccionarLiga(idLiga) {
    fetch('../api/seleccionar_liga.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_liga: idLiga })
    })
        .then(function (response) { return response.json(); })
        .then(function (data) {
            if (data.ok) {
                window.location.href = 'home.html';
            } else {
                alert(data.error || 'No se pudo seleccionar la liga');
            }
        })
        .catch(function () {
            alert('Error de conexión al seleccionar la liga');
        });
}

// ── Unirme a una liga (pública, por click, o privada, por código) ─────────
function unirseALiga(payload) {
    fetch('../api/unirse_liga.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(function (response) { return response.json(); })
        .then(function (data) {
            if (data.ok) {
                window.location.href = 'home.html';
            } else {
                alert(data.error || 'No se pudo unir a la liga');
            }
        })
        .catch(function () {
            alert('Error de conexión al unirse a la liga');
        });
}

// ── "Unirme a una Liga" (desplegable) ──────────────────────────────────────
function initJoinDropdown() {
    var joinBtn = document.getElementById('joinLeagueBtn');
    var dropdown = document.getElementById('leagueDropdown');

    if (!joinBtn || !dropdown) return;

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

// ── Unirme por código de invitación ────────────────────────────────────────
function initJoinByCode() {
    var input = document.getElementById('joinLeagueCode');
    var btn = document.getElementById('joinByCodeBtn');
    if (!input || !btn) return;

    btn.addEventListener('click', function () {
        var codigo = input.value.trim().toUpperCase();
        if (!codigo) {
            input.focus();
            return;
        }
        unirseALiga({ codigo: codigo });
    });

    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            btn.click();
        }
    });
}

// ── "Crear Liga" ──────────────────────────────────────────────────────────
function initCreateLeagueModal() {
    var createBtn = document.getElementById('createLeagueBtn');
    var modal = document.getElementById('createLeagueModal');
    var closeBtn = document.getElementById('closeCreateLeagueModal');
    var nameInput = document.getElementById('newLeagueName');
    var privadaSelect = document.getElementById('newLeaguePrivada');
    var submitBtn = document.getElementById('createLeagueSubmitBtn');
    var codeBox = document.getElementById('createLeagueCodeBox');
    var codeValue = document.getElementById('createLeagueCodeValue');
    var errorBox = document.getElementById('createLeagueErrorBox');

    if (!createBtn || !modal || !submitBtn) return;

    function openModal() {
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        codeBox.classList.remove('active');
        nameInput.value = '';
        submitBtn.textContent = 'Crear liga';
        submitBtn.disabled = false;
        errorBox.style.display = 'none';
    }

    function mostrarError(msg) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
    }

    createBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
    });

    submitBtn.addEventListener('click', function () {
        // Ya se creó: confirmar y redirigir a home.
        if (codeBox.classList.contains('active')) {
            window.location.href = 'home.html';
            return;
        }

        var name = nameInput.value.trim();
        if (!name) {
            nameInput.focus();
            return;
        }

        errorBox.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creando...';

        fetch('../api/crear_liga.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: name,
                privada: privadaSelect ? privadaSelect.value : '0'
            })
        })
            .then(function (response) { return response.json(); })
            .then(function (data) {
                if (!data.ok) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Crear liga';
                    mostrarError(data.error || 'No se pudo crear la liga');
                    return;
                }

                codeValue.textContent = data.liga.codigo_invitacion || '—';
                codeBox.classList.add('active');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Continuar';
            })
            .catch(function () {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Crear liga';
                mostrarError('Error de conexión al crear la liga');
            });
    });
}
