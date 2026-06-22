let npState = {
    format:     0,
    team1:      [],
    team2:      [],
    allPlayers: []
};

// ── Init ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
    // Fecha de hoy
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('npDate').value = today;

    // Hora actual redondeada
    var now  = new Date();
    var mins = now.getMinutes() >= 30 ? 30 : 0;
    document.getElementById('npTime').value =
        pad(now.getHours()) + ':' + pad(mins);

    // Cargar jugadores de data.js
    var dbPlayers = getPlayers();
    npState.allPlayers = dbPlayers.map(function(p) {
        return { name: p.name, elo: p.elo, isNew: false };
    });

    // Listeners formato — usando onclick directo en lugar de addEventListener
    // para evitar problemas de timing
    document.querySelectorAll('.format-btn').forEach(function(btn) {
        btn.onclick = function() {
            npState.format = parseInt(this.dataset.format);
            document.querySelectorAll('.format-btn').forEach(function(b) {
                b.classList.remove('selected');
            });
            this.classList.add('selected');
            renderPlayerList();
            validateForm();
        };
    });

    // Listeners inputs
    ['npDate','npTime','npVenue','npTeam1Name','npTeam2Name'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.oninput = function() { validateForm(); };
    });

    // Enter en nuevo jugador
    document.getElementById('newPlayerInput').onkeypress = function(e) {
        if (e.key === 'Enter') addNewPlayer();
    };

    renderPlayerList();
    validateForm();
});

function pad(n) { return String(n).padStart(2,'0'); }

// ── Agregar jugador nuevo ───────────────────────────────────
function addNewPlayer() {
    var input = document.getElementById('newPlayerInput');
    var name  = input.value.trim();
    if (!name) return;

    var exists = npState.allPlayers.find(function(p) {
        return p.name.toLowerCase() === name.toLowerCase();
    });

    if (exists) {
        showToast('Ese jugador ya está en la lista', 'error');
        input.value = '';
        return;
    }

    npState.allPlayers.unshift({ name: name, elo: null, isNew: true });
    input.value = '';
    renderPlayerList();
    validateForm();
}

// ── Asignar jugador ─────────────────────────────────────────
function assignPlayer(name, team) {
    if (team === 1) {
        if (npState.team1.indexOf(name) !== -1) {
            npState.team1 = npState.team1.filter(function(p) { return p !== name; });
        } else {
            npState.team2 = npState.team2.filter(function(p) { return p !== name; });
            npState.team1.push(name);
        }
    } else {
        if (npState.team2.indexOf(name) !== -1) {
            npState.team2 = npState.team2.filter(function(p) { return p !== name; });
        } else {
            npState.team1 = npState.team1.filter(function(p) { return p !== name; });
            npState.team2.push(name);
        }
    }
    renderPlayerList();
    validateForm();
}

// ── Quitar jugador ──────────────────────────────────────────
function removePlayer(name) {
    npState.allPlayers = npState.allPlayers.filter(function(p) { return p.name !== name; });
    npState.team1      = npState.team1.filter(function(p) { return p !== name; });
    npState.team2      = npState.team2.filter(function(p) { return p !== name; });
    renderPlayerList();
    validateForm();
}

// ── Render ──────────────────────────────────────────────────
function renderPlayerList() {
    var container = document.getElementById('playersAssignList');
    var t1Name = (document.getElementById('npTeam1Name').value.trim() || 'Eq.1').substring(0, 7);
    var t2Name = (document.getElementById('npTeam2Name').value.trim() || 'Eq.2').substring(0, 7);

    if (npState.allPlayers.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);font-size:0.83rem;padding:1rem 0">Agregá jugadores arriba</div>';
        updateStatus();
        return;
    }

    container.innerHTML = npState.allPlayers.map(function(p) {
        var inT1     = npState.team1.indexOf(p.name) !== -1;
        var inT2     = npState.team2.indexOf(p.name) !== -1;
        var rowClass = inT1 ? 'assigned-1' : inT2 ? 'assigned-2' : '';
        var eloText  = p.elo ? 'ELO ' + p.elo : 'Nuevo';
        var safe     = p.name.replace(/'/g, "\\'");

        return '<div class="player-assign-row ' + rowClass + '">' +
            '<span class="player-assign-name">' + p.name + '</span>' +
            '<span class="player-assign-elo">' + eloText + '</span>' +
            '<div class="player-assign-btns">' +
                '<button type="button" class="assign-btn ' + (inT1 ? 'btn-t1-active' : 'btn-t1-inactive') + '" ' +
                    'onclick="assignPlayer(\'' + safe + '\', 1)">' +
                    (inT1 ? '✓ ' : '') + t1Name +
                '</button>' +
                '<button type="button" class="assign-btn ' + (inT2 ? 'btn-t2-active' : 'btn-t2-inactive') + '" ' +
                    'onclick="assignPlayer(\'' + safe + '\', 2)">' +
                    (inT2 ? '✓ ' : '') + t2Name +
                '</button>' +
                '<button type="button" class="remove-player-btn" onclick="removePlayer(\'' + safe + '\')">×</button>' +
            '</div>' +
        '</div>';
    }).join('');

    updateStatus();
}

function updateStatus() {
    var t1  = npState.team1.length;
    var t2  = npState.team2.length;
    var req = npState.format || 0;

    document.getElementById('team1Count').textContent = t1;
    document.getElementById('team2Count').textContent = t2;

    var pct = req > 0 ? Math.min(((t1 + t2) / (req * 2)) * 100, 100) : 0;
    document.getElementById('progressFill').style.width = pct + '%';

    var msg = '';
    if (!req)          msg = 'Elegí un formato primero';
    else if (t1 < req) msg = 'Faltan ' + (req - t1) + ' en equipo 1';
    else if (t2 < req) msg = 'Faltan ' + (req - t2) + ' en equipo 2';
    else               msg = '✓ ' + t1 + ' vs ' + t2 + ' — listos para jugar';
    document.getElementById('playersStatusText').textContent = msg;
}

// ── Validar ─────────────────────────────────────────────────
function validateForm() {
    var date   = document.getElementById('npDate').value;
    var venue  = document.getElementById('npVenue').value.trim();
    var fmt    = npState.format;
    var t1ok   = fmt > 0 && npState.team1.length >= fmt;
    var t2ok   = fmt > 0 && npState.team2.length >= fmt;
    var ready  = date && venue && fmt && t1ok && t2ok;

    document.getElementById('npSaveBtn').disabled = !ready;

    var info = '';
    if      (!date)   info = 'Seleccioná una fecha';
    else if (!venue)  info = 'Ingresá el nombre de la cancha';
    else if (!fmt)    info = 'Elegí el formato del partido';
    else if (!t1ok)   info = 'Faltan ' + (fmt - npState.team1.length) + ' jugadores en equipo 1';
    else if (!t2ok)   info = 'Faltan ' + (fmt - npState.team2.length) + ' jugadores en equipo 2';
    else              info = '¡Todo listo para jugar!';
    document.getElementById('npCtaInfo').textContent = info;
}

// ── Guardar e iniciar ────────────────────────────────────────
function saveAndStart() {
    var date   = document.getElementById('npDate').value;
    var time   = document.getElementById('npTime').value;
    var venue  = document.getElementById('npVenue').value.trim();
    var t1Name = document.getElementById('npTeam1Name').value.trim() || 'BLANCO';
    var t2Name = document.getElementById('npTeam2Name').value.trim() || 'NEGRO';

    var dateObj  = new Date(date + 'T12:00:00');
    var dateStr  = dateObj.toLocaleDateString('es-AR', { weekday:'short', day:'numeric', month:'short' });
    var fechaLabel = dateStr + (time ? ' ' + time : '') + ' — ' + venue;

    var newMatch = {
        id:         Date.now(),
        date:       date,
        time:       time,
        venue:      venue,
        format:     npState.format,
        fecha:      fechaLabel,
        team1Name:  t1Name,
        team2Name:  t2Name,
        whiteTeam:  npState.team1,
        blackTeam:  npState.team2,
        whiteScore: 0,
        blackScore: 0,
        completed:  false,
        events:     []
    };

    saveMatch(newMatch);
    sessionStorage.setItem('currentMatchId', newMatch.id);
    window.location.href = 'anotador.html';
}
