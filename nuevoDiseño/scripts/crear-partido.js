var selectedPlayers  = [];
var currentWhiteTeam = [];
var currentBlackTeam = [];
var currentFormat    = 0;

window.addEventListener('DOMContentLoaded', function() {
    loadUpcomingMatches();

    document.getElementById('closeModalBtn')?.addEventListener('click', closeCreateMatchModal);
    document.getElementById('step1Next')    ?.addEventListener('click', goToStep2);
    document.getElementById('step2Back')    ?.addEventListener('click', goToStep1);
    document.getElementById('step2Next')    ?.addEventListener('click', goToStep3);
    document.getElementById('step3Back')    ?.addEventListener('click', goToStep2);
    document.getElementById('balanceTeamsBtn')?.addEventListener('click', balanceTeams);
    document.getElementById('saveMatchBtn') ?.addEventListener('click', saveAndStartMatch);
    document.getElementById('matchDate')    ?.addEventListener('input', validateStep1);
    document.getElementById('matchVenue')   ?.addEventListener('input', validateStep1);

    document.querySelectorAll('.format-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            selectFormat(parseInt(btn.dataset.format), btn);
        });
    });

    document.querySelector('.close-edit-modal')?.addEventListener('click', function() {
        document.getElementById('editTeamsModal').classList.remove('active');
    });
});

// ── Lista de partidos ────────────────────────────────────────
function loadUpcomingMatches() {
    var matches   = getMatches();
    var container = document.getElementById('upcomingMatchesList');
    if (!container) return;

    var upcoming = matches.filter(function(m) { return !m.completed; });

    if (upcoming.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-clipboard-list"></i></div>No hay partidos pendientes.</div>';
        return;
    }

    container.innerHTML = '';
    upcoming.forEach(function(match) {
        var total    = match.whiteTeam.length + match.blackTeam.length;
        var required = match.format * 2;
        var complete = total === required;
        var t1       = match.team1Name || 'BLANCO';
        var t2       = match.team2Name || 'NEGRO';

        var div = document.createElement('div');
        div.className   = 'match-item';
        div.dataset.id  = match.id;
        div.innerHTML =
            '<div class="match-header">' +
                '<span class="match-date">' + match.fecha + '</span>' +
                '<span class="match-status ' + (complete ? 'complete' : 'pending') + '">' +
                    (complete ? '<i class="fa-solid fa-circle-check"></i> Completo' : '<i class="fa-solid fa-triangle-exclamation"></i> Incompleto') +
                '</span>' +
            '</div>' +
            '<div class="match-venue"><i class="fa-solid fa-location-dot"></i> ' + match.venue + '</div>' +
            '<div class="match-teams">' +
                '<span>' + t1 + '</span>' +
                '<span class="match-vs">vs</span>' +
                '<span>' + t2 + '</span>' +
            '</div>' +
            '<div class="match-format">' + match.format + ' vs ' + match.format + '</div>' +
            // Accordion de equipos (oculto por defecto, ahora editable)
            '<div class="teams-accordion" id="acc-' + match.id + '">' +
                '<div class="teams-accordion-inner" id="acc-inner-' + match.id + '">' +
                    buildAccordionInner(match) +
                '</div>' +
            '</div>' +
            '<div class="match-actions">' +
                '<button type="button" class="btn-view-teams" onclick="toggleTeams(' + match.id + ')"><i class="fa-solid fa-users"></i> Ver equipos</button>' +
                '<button type="button" class="btn-start" onclick="startMatch(' + match.id + ')"><i class="fa-solid fa-play"></i> Iniciar</button>' +
            '</div>';

        container.appendChild(div);
    });
}

// ── Accordion equipos ────────────────────────────────────────
function toggleTeams(matchId) {
    var acc = document.getElementById('acc-' + matchId);
    var btn = acc.parentElement.querySelector('.btn-view-teams');
    if (!acc) return;

    var isOpen = acc.classList.contains('open');
    acc.classList.toggle('open', !isOpen);
    if (btn) btn.innerHTML = isOpen ? '<i class="fa-solid fa-users"></i> Ver equipos' : '<i class="fa-solid fa-eye-slash"></i> Ocultar';
}

// ── Construir el contenido del acordeón (equipos editables) ──
// Cada jugador es ahora un botón: tocarlo lo manda al otro equipo.
// Se usa tanto al renderizar la lista por primera vez como al
// refrescar después de mover un jugador (moveMatchPlayer).
function buildAccordionInner(match) {
    var t1 = match.team1Name || 'BLANCO';
    var t2 = match.team2Name || 'NEGRO';

    return '<div class="acc-team-col">' +
            '<div class="acc-team-title">' + t1 + '</div>' +
            match.whiteTeam.map(function(p) {
                var safe = p.replace(/'/g, "\\'");
                return '<button type="button" class="acc-player" onclick="moveMatchPlayer(' + match.id + ', \'white\', \'' + safe + '\')">' +
                    '<span>' + p + '</span><i class="fa-solid fa-right-left"></i>' +
                '</button>';
            }).join('') +
        '</div>' +
        '<div class="acc-divider"></div>' +
        '<div class="acc-team-col">' +
            '<div class="acc-team-title">' + t2 + '</div>' +
            match.blackTeam.map(function(p) {
                var safe = p.replace(/'/g, "\\'");
                return '<button type="button" class="acc-player" onclick="moveMatchPlayer(' + match.id + ', \'black\', \'' + safe + '\')">' +
                    '<span>' + p + '</span><i class="fa-solid fa-right-left"></i>' +
                '</button>';
            }).join('') +
        '</div>';
}

// ── Mover un jugador de equipo en un partido pendiente ────────
// Funcionalidad nueva (pedida explícitamente): permite modificar
// quién juega en cada equipo después de creado el partido, sin
// tener que iniciarlo. Lee/escribe directamente en localStorage
// con la misma forma que ya usa data.js (getMatches/'matches').
function moveMatchPlayer(matchId, fromTeam, playerName) {
    var matches = getMatches();
    var idx = matches.findIndex(function(m) { return m.id === matchId; });
    if (idx === -1) return;

    var match = matches[idx];
    if (fromTeam === 'white') {
        match.whiteTeam = match.whiteTeam.filter(function(p) { return p !== playerName; });
        match.blackTeam.push(playerName);
    } else {
        match.blackTeam = match.blackTeam.filter(function(p) { return p !== playerName; });
        match.whiteTeam.push(playerName);
    }
    matches[idx] = match;
    localStorage.setItem('matches', JSON.stringify(matches));

    var inner = document.getElementById('acc-inner-' + matchId);
    if (inner) inner.innerHTML = buildAccordionInner(match);

    if (typeof showToast === 'function') showToast('Jugador movido de equipo');
}

// ── Modal crear partido ──────────────────────────────────────
function openCreateMatchModal() {
    selectedPlayers  = [];
    currentWhiteTeam = [];
    currentBlackTeam = [];
    currentFormat    = 0;
    document.getElementById('matchDate').value  = '';
    document.getElementById('matchVenue').value = '';
    document.querySelectorAll('.format-btn').forEach(function(b) { b.classList.remove('selected'); });
    document.getElementById('step1Next').disabled = true;
    goToStep1(true);
    document.getElementById('createMatchModal').classList.add('active');
}

function closeCreateMatchModal() {
    document.getElementById('createMatchModal').classList.remove('active');
}

// ── Pasos ────────────────────────────────────────────────────
function goToStep1(silent) {
    setStep(1);
    document.getElementById('step1').classList.remove('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');
}

function goToStep2() {
    var date  = document.getElementById('matchDate').value;
    var venue = document.getElementById('matchVenue').value.trim();
    if (!date || !venue || !currentFormat) {
        showToast('Completá todos los campos del paso 1', 'error');
        return;
    }
    var players   = getPlayers();
    var container = document.getElementById('playersSelection');
    container.innerHTML = '';
    players.forEach(function(player) {
        var label = document.createElement('label');
        label.className = 'checkbox-label';
        var checked = selectedPlayers.indexOf(player.name) !== -1 ? 'checked' : '';
        label.innerHTML = '<input type="checkbox" value="' + player.name + '" ' + checked + ' onchange="togglePlayer(this)">' + player.name;
        container.appendChild(label);
    });
    updateStep2Counters();
    setStep(2);
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
    document.getElementById('step3').classList.add('hidden');
}

function goToStep3() {
    if (selectedPlayers.length < currentFormat) {
        showToast('Seleccioná al menos ' + currentFormat + ' jugadores por equipo', 'error');
        return;
    }
    if (currentWhiteTeam.length === 0 && currentBlackTeam.length === 0) balanceTeams();
    updateTeamsDisplay();
    setStep(3);
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.remove('hidden');
}

function setStep(n) {
    var labels = ['Datos del partido', 'Elegir jugadores', 'Armar equipos'];
    document.getElementById('modalStepLabel').textContent = 'Paso ' + n + ' de 3';
    document.getElementById('modalStepTitle').textContent = labels[n - 1];
    [1, 2, 3].forEach(function(i) {
        document.getElementById('dot' + i).classList.toggle('active', i <= n);
    });
}

// ── Formato ──────────────────────────────────────────────────
function selectFormat(n, btn) {
    currentFormat = n;
    document.querySelectorAll('.format-btn').forEach(function(b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    validateStep1();
}

function validateStep1() {
    var date  = document.getElementById('matchDate').value;
    var venue = document.getElementById('matchVenue').value.trim();
    document.getElementById('step1Next').disabled = !(date && venue && currentFormat);
}

// ── Jugadores ────────────────────────────────────────────────
function togglePlayer(checkbox) {
    if (checkbox.checked) {
        if (selectedPlayers.indexOf(checkbox.value) === -1) selectedPlayers.push(checkbox.value);
    } else {
        selectedPlayers = selectedPlayers.filter(function(p) { return p !== checkbox.value; });
    }
    currentWhiteTeam = [];
    currentBlackTeam = [];
    updateStep2Counters();
}

function updateStep2Counters() {
    var required = currentFormat * 2;
    var count    = selectedPlayers.length;
    document.getElementById('selectedCount').textContent = count;
    document.getElementById('requiredCount').textContent = required;
    var pct = Math.min((count / required) * 100, 100);
    document.getElementById('playersProgressFill').style.width = pct + '%';
    document.getElementById('step2Next').disabled = count < currentFormat;
}

// ── Balance ──────────────────────────────────────────────────
function balanceTeams() {
    var players  = getPlayers();
    var selected = selectedPlayers
        .map(function(name) { return players.find(function(p) { return p.name === name; }) || { name: name, elo: 1000 }; })
        .sort(function(a, b) { return b.elo - a.elo; });
    currentWhiteTeam = [];
    currentBlackTeam = [];
    selected.forEach(function(player, i) {
        if (i % 2 === 0) currentWhiteTeam.push(player.name);
        else             currentBlackTeam.push(player.name);
    });
    updateTeamsDisplay();
}

function updateTeamsDisplay() {
    document.getElementById('whiteTeamList').innerHTML =
        currentWhiteTeam.map(function(p) { return '<div>' + p + '</div>'; }).join('') ||
        '<div class="team-empty">—</div>';
    document.getElementById('blackTeamList').innerHTML =
        currentBlackTeam.map(function(p) { return '<div>' + p + '</div>'; }).join('') ||
        '<div class="team-empty">—</div>';

    var players = getPlayers();
    var eloSum  = function(team) {
        return team.reduce(function(s, name) {
            var p = players.find(function(pl) { return pl.name === name; });
            return s + (p ? p.elo : 1000);
        }, 0);
    };
    var diff    = Math.abs(eloSum(currentWhiteTeam) - eloSum(currentBlackTeam));
    var el      = document.getElementById('eloDiff');
    if (diff < 150) {
        el.innerHTML = '<i class="fa-solid fa-scale-balanced"></i> Equipos equilibrados';
        el.style.color = 'var(--green-primary)';
    } else {
        el.innerHTML = '<i class="fa-solid fa-scale-balanced"></i> Diferencia ELO: ' + diff;
        el.style.color = 'var(--text-secondary)';
    }
    document.querySelectorAll('.edit-team-btn').forEach(function(btn) {
        btn.onclick = function() { openEditTeamsModal(); };
    });
}

// ── Edit teams modal ─────────────────────────────────────────
function openEditTeamsModal() {
    document.getElementById('editWhiteList').innerHTML = currentWhiteTeam.map(function(p) {
        return '<div class="player-item"><span>' + p + '</span>' +
               '<div class="player-actions"><button type="button" onclick="moveToBlack(\'' + p + '\')">→ Negro</button></div></div>';
    }).join('');
    document.getElementById('editBlackList').innerHTML = currentBlackTeam.map(function(p) {
        return '<div class="player-item">' +
               '<div class="player-actions"><button type="button" onclick="moveToWhite(\'' + p + '\')">← Blanco</button></div>' +
               '<span>' + p + '</span></div>';
    }).join('');
    document.getElementById('editTeamsModal').classList.add('active');
}

function moveToBlack(name) {
    currentWhiteTeam = currentWhiteTeam.filter(function(p) { return p !== name; });
    currentBlackTeam.push(name);
    updateTeamsDisplay();
    document.getElementById('editTeamsModal').classList.remove('active');
    openEditTeamsModal();
}

function moveToWhite(name) {
    currentBlackTeam = currentBlackTeam.filter(function(p) { return p !== name; });
    currentWhiteTeam.push(name);
    updateTeamsDisplay();
    document.getElementById('editTeamsModal').classList.remove('active');
    openEditTeamsModal();
}

// ── Guardar e iniciar ────────────────────────────────────────
function saveAndStartMatch() {
    var date  = document.getElementById('matchDate').value;
    var venue = document.getElementById('matchVenue').value.trim();
    if (!date || !venue) { showToast('Completá fecha y cancha', 'error'); return; }
    if (currentWhiteTeam.length === 0 || currentBlackTeam.length === 0) {
        showToast('Balanceá los equipos primero', 'error'); return;
    }
    var newMatch = {
        id:         Date.now(),
        date:       date,
        venue:      venue,
        format:     currentFormat,
        fecha:      new Date(date + 'T12:00:00').toLocaleDateString('es-AR', { day:'numeric', month:'short' }) + ' — ' + venue,
        whiteTeam:  currentWhiteTeam,
        blackTeam:  currentBlackTeam,
        whiteScore: 0,
        blackScore: 0,
        completed:  false,
        events:     []
    };
    saveMatch(newMatch);
    closeCreateMatchModal();
    sessionStorage.setItem('currentMatchId', newMatch.id);
    window.location.href = 'anotador.html';
}

function startMatch(matchId) {
    sessionStorage.setItem('currentMatchId', matchId);
    window.location.href = 'anotador.html';
}