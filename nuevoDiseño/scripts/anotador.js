// ── Estado ──────────────────────────────────────────────────
var currentMatch  = null;
var timerInterval = null;
var seconds       = 0;
var isRunning     = false;
var eventsList    = [];
var pendingGoal   = { team: null, scorer: null };
var pendingSub    = { team: null, playerOut: null };

var AVATAR_COLORS = ['#7f77dd', '#1d9e75', '#d85a30', '#d4537e', '#378ade', '#ba7517', '#639922'];

// ── Init ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
    var matchId = sessionStorage.getItem('currentMatchId');
    if (matchId) {
        loadMatch(parseInt(matchId));
    } else {
        window.location.href = 'crear-partido.html';
        return;
    }

    document.getElementById('startTimer')    .onclick = startTimer;
    document.getElementById('pauseTimer')    .onclick = pauseTimer;
    document.getElementById('resumeTimer')   .onclick = resumeTimer;
    document.getElementById('undoBtn')       .onclick = undoLastEvent;
    document.getElementById('finishMatchBtn').onclick = finishMatch;
});

// ── Cargar partido ───────────────────────────────────────────
function loadMatch(matchId) {
    var matches = getMatches();
    currentMatch = null;
    for (var i = 0; i < matches.length; i++) {
        if (matches[i].id === matchId) { currentMatch = matches[i]; break; }
    }
    if (!currentMatch) {
        window.location.href = 'crear-partido.html';
        return;
    }

    currentMatch.whiteScore = currentMatch.whiteScore || 0;
    currentMatch.blackScore = currentMatch.blackScore || 0;
    currentMatch.whiteTeam  = currentMatch.whiteTeam  || [];
    currentMatch.blackTeam  = currentMatch.blackTeam  || [];
    eventsList = currentMatch.events || [];

    var t1 = currentMatch.team1Name || 'BLANCO';
    var t2 = currentMatch.team2Name || 'NEGRO';

    setEl('team1Label',   t1);
    setEl('team2Label',   t2);
    setEl('tlLabel1',     t1);
    setEl('tlLabel2',     t2);
    setEl('subBtnLabel1', t1);
    setEl('subBtnLabel2', t2);

    updateScoreboard();
    updateTimeline();
}

function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ── Timer ────────────────────────────────────────────────────
function startTimer() {
    if (timerInterval) return;
    isRunning     = true;
    timerInterval = setInterval(function() { seconds++; updateTimerDisplay(); }, 1000);
    document.getElementById('timer').classList.add('running');
    document.getElementById('startTimer').classList.add('hidden');
    document.getElementById('pauseTimer').classList.remove('hidden');
    document.getElementById('resumeTimer').classList.add('hidden');
}

function pauseTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    isRunning = false;
    document.getElementById('timer').classList.remove('running');
    document.getElementById('pauseTimer').classList.add('hidden');
    document.getElementById('resumeTimer').classList.remove('hidden');
}

function resumeTimer() {
    document.getElementById('resumeTimer').classList.add('hidden');
    startTimer();
}

function updateTimerDisplay() {
    var el = document.getElementById('timer');
    if (el) el.textContent = fmtTime(seconds);
}

function fmtTime(s) {
    return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
}

function pad(n) { return String(n).padStart(2, '0'); }

// ── Avatar helper ────────────────────────────────────────────
// Genera un color consistente por nombre (mismo jugador = mismo color siempre)
function avatarColorFor(name) {
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) % 1000;
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// Construye el HTML del círculo de avatar.
// Hoy: solo inicial coloreada. El día que haya foto en la BD,
// alcanza con envolver una <img> acá adentro con fallback a esta inicial.
function avatarHtml(name) {
    var color  = avatarColorFor(name);
    var letter = name.charAt(0).toUpperCase();
    return '<div class="player-avatar-circle" style="background:' + color + '22; border:1px solid ' + color + '55; color:' + color + ';">' +
        letter +
    '</div>';
}

// ── Modal GOL — paso 1 ───────────────────────────────────────
function openGoalModal(team) {
    if (!currentMatch) return;
    pendingGoal = { team: team, scorer: null };

    var t1   = currentMatch.team1Name || 'BLANCO';
    var t2   = currentMatch.team2Name || 'NEGRO';
    var name = team === 'white' ? t1 : t2;
    var list = team === 'white' ? currentMatch.whiteTeam : currentMatch.blackTeam;

    setEl('goalModalSub', name);
    buildPlayerList('goalPlayerGrid', list, function(p) { selectScorer(p); });
    document.getElementById('goalModal').classList.add('active');
}

function closeGoalModal() {
    document.getElementById('goalModal').classList.remove('active');
    pendingGoal = { team: null, scorer: null };
}

// ── Modal ASISTENCIA — paso 2 ────────────────────────────────
function selectScorer(name) {
    pendingGoal.scorer = name;
    document.getElementById('goalModal').classList.remove('active');

    var t1     = currentMatch.team1Name || 'BLANCO';
    var t2     = currentMatch.team2Name || 'NEGRO';
    var tName  = pendingGoal.team === 'white' ? t1 : t2;
    var list   = pendingGoal.team === 'white' ? currentMatch.whiteTeam : currentMatch.blackTeam;
    var others = list.filter(function(p) { return p !== name; });

    setEl('assistModalSub', 'Gol de ' + name + ' \u2014 ' + tName);
    buildPlayerList('assistPlayerGrid', others, function(p) { confirmGoal(p); });
    document.getElementById('assistModal').classList.add('active');
}

function closeAssistModal() {
    document.getElementById('assistModal').classList.remove('active');
    pendingGoal = { team: null, scorer: null };
}

function confirmGoal(assist) {
    document.getElementById('assistModal').classList.remove('active');
    if (!pendingGoal.scorer) return;

    eventsList.push({
        minute: seconds,
        type:   'goal',
        player: pendingGoal.scorer,
        assist: assist || null,
        team:   pendingGoal.team
    });

    if (pendingGoal.team === 'white') currentMatch.whiteScore++;
    else                              currentMatch.blackScore++;

    pendingGoal = { team: null, scorer: null };
    updateScoreboard();
    updateTimeline();
    saveMatchProgress();
    showToast('Gol registrado');
}

// ── Modal CAMBIO — paso 1: quién sale ────────────────────────
// Ahora cada botón de la barra unificada ya pasa el equipo directo
function openSubModal(team) {
    if (!currentMatch) return;
    pendingSub = { team: team, playerOut: null };

    var t1    = currentMatch.team1Name || 'BLANCO';
    var t2    = currentMatch.team2Name || 'NEGRO';
    var tName = team === 'white' ? t1 : t2;
    var list  = team === 'white' ? currentMatch.whiteTeam : currentMatch.blackTeam;

    setEl('subTeamHint', 'Cambio en ' + tName);
    buildPlayerList('subOutGrid', list, function(p) { selectPlayerOut(p); });
    document.getElementById('subModal').classList.add('active');
}

function closeSubModal() {
    document.getElementById('subModal').classList.remove('active');
    pendingSub = { team: null, playerOut: null };
}

// ── Modal CAMBIO — paso 2: quién entra ───────────────────────
function selectPlayerOut(name) {
    pendingSub.playerOut = name;
    document.getElementById('subModal').classList.remove('active');

    var allPlayers = getPlayers().map(function(p) { return p.name; });
    var inMatch    = currentMatch.whiteTeam.concat(currentMatch.blackTeam);
    var available  = allPlayers.filter(function(p) { return inMatch.indexOf(p) === -1; });

    var t1    = currentMatch.team1Name || 'BLANCO';
    var t2    = currentMatch.team2Name || 'NEGRO';
    var tName = pendingSub.team === 'white' ? t1 : t2;
    setEl('subInSub', name + ' sale de ' + tName);

    var grid = document.getElementById('subInGrid');
    if (available.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-tertiary);font-size:0.83rem;text-align:center;padding:1rem;">No hay jugadores disponibles fuera del partido</div>';
    } else {
        buildPlayerList('subInGrid', available, function(p) { confirmSub(p); });
    }

    document.getElementById('subInModal').classList.add('active');
}

function closeSubInModal() {
    document.getElementById('subInModal').classList.remove('active');
    pendingSub = { team: null, playerOut: null };
}

function confirmSub(playerIn) {
    document.getElementById('subInModal').classList.remove('active');
    if (!pendingSub.playerOut) return;

    var arr = pendingSub.team === 'white' ? currentMatch.whiteTeam : currentMatch.blackTeam;
    var idx = arr.indexOf(pendingSub.playerOut);
    if (idx !== -1) arr[idx] = playerIn;

    eventsList.push({
        minute:    seconds,
        type:      'substitution',
        playerOut: pendingSub.playerOut,
        playerIn:  playerIn,
        team:      pendingSub.team
    });

    pendingSub = { team: null, playerOut: null };
    updateTimeline();
    saveMatchProgress();
    showToast('Cambio registrado');
}

// ── Helper: lista vertical con avatares ──────────────────────
function buildPlayerList(containerId, names, onClickFn) {
    var list = document.getElementById(containerId);
    if (!list) return;
    list.innerHTML = '';

    names.forEach(function(name) {
        var row = document.createElement('button');
        row.type      = 'button';
        row.className = 'player-row-btn';
        row.innerHTML =
            avatarHtml(name) +
            '<span class="player-row-name">' + name + '</span>' +
            '<svg class="player-row-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
        row.onclick = function() { onClickFn(name); };
        list.appendChild(row);
    });

    // Resetear scroll al tope — sin esto, el modal puede abrir
    // mostrando el final de la lista en vez del primer jugador
    var scrollWrap = list.closest('.player-list-scroll');
    if (scrollWrap) scrollWrap.scrollTop = 0;
}

// ── Scoreboard ───────────────────────────────────────────────
function updateScoreboard() {
    setEl('whiteScore', currentMatch.whiteScore);
    setEl('blackScore', currentMatch.blackScore);
}

// ── Timeline ─────────────────────────────────────────────────
function updateTimeline() {
    var container = document.getElementById('matchTimeline');
    if (!container) return;

    if (eventsList.length === 0) {
        container.innerHTML = '<div class="timeline-empty">Sin eventos aún</div>';
        return;
    }

    container.innerHTML = eventsList.map(function(ev) {
        var t      = fmtTime(ev.minute);
        var isLeft = ev.team === 'white';
        var html   = '';

        if (ev.type === 'goal') {
            var assist = ev.assist ? '<span class="tl-assist"><i class="fa-solid fa-bullseye"></i> ' + ev.assist + '</span>' : '';
            html = '<i class="fa-solid fa-futbol"></i> <strong>' + ev.player + '</strong>' + assist;
        } else if (ev.type === 'substitution') {
            html = '<span class="tl-sub"><i class="fa-solid fa-arrows-rotate"></i> ' + ev.playerIn + ' \u21D4 ' + ev.playerOut + '</span>';
        }

        return '<div class="tl-row">' +
            '<div class="tl-event-left">'  + (isLeft  ? html : '') + '</div>' +
            '<div class="tl-time">' + t + '</div>' +
            '<div class="tl-event-right">' + (!isLeft ? html : '') + '</div>' +
        '</div>';
    }).join('');

    container.scrollTop = container.scrollHeight;
}

// ── Deshacer ─────────────────────────────────────────────────
function undoLastEvent() {
    if (eventsList.length === 0) { showToast('No hay eventos para deshacer', 'error'); return; }

    var last = eventsList.pop();

    if (last.type === 'goal') {
        if (last.team === 'white') currentMatch.whiteScore = Math.max(0, currentMatch.whiteScore - 1);
        else                       currentMatch.blackScore = Math.max(0, currentMatch.blackScore - 1);
        updateScoreboard();
    }

    if (last.type === 'substitution') {
        var arr = last.team === 'white' ? currentMatch.whiteTeam : currentMatch.blackTeam;
        var idx = arr.indexOf(last.playerIn);
        if (idx !== -1) arr[idx] = last.playerOut;
    }

    updateTimeline();
    saveMatchProgress();
    showToast('Último evento deshecho');
}

// ── Guardar ──────────────────────────────────────────────────
function saveMatchProgress() {
    currentMatch.events = eventsList;
    var matches = getMatches();
    var idx     = -1;
    for (var i = 0; i < matches.length; i++) {
        if (matches[i].id === currentMatch.id) { idx = i; break; }
    }
    if (idx !== -1) {
        matches[idx] = currentMatch;
        localStorage.setItem('matches', JSON.stringify(matches));
    }
}

// ── Confirmar salida ─────────────────────────────────────────
function confirmBack() {
    if (eventsList.length > 0 && isRunning) {
        if (!confirm('El partido está en curso. ¿Salir igualmente?')) return;
    }
    if (isRunning) pauseTimer();
    window.location.href = 'crear-partido.html';
}

// ── FINALIZAR ────────────────────────────────────────────────
async function finishMatch() {
    if (!confirm('¿Finalizar el partido?')) return;
    if (isRunning) pauseTimer();

    currentMatch.completed = true;
    currentMatch.events    = eventsList;

    saveMatchProgress();

    try {
        var result = await uploadMatchEvents(currentMatch);
        if (result.ok) {
            showToast('Eventos guardados en la DB local');
        } else {
            showToast('No se pudieron guardar los eventos: ' + (result.error || 'Error desconocido'), 'error');
        }
    } catch (e) {
        console.warn('Error guardando eventos en DB:', e);
        showToast('No se pudieron guardar los eventos en la DB', 'error');
    }

    try { updateStatsAfterMatch(currentMatch); } catch(e) { console.warn('Stats:', e); }
    try { exportMatchToTXT(currentMatch); } catch(e) { console.warn('TXT:', e); }

    showSummaryScreen();
}

// Trae la lista de jugadores DIRECTO de la base (no del caché de
// localStorage) justo antes de guardar el partido. Esto asegura que la
// resolución nombre → ID_JUGADORES se haga siempre contra el estado actual
// de la DB y no contra un caché que puede haber quedado desactualizado
// (por ejemplo si un jugador fue borrado y recreado con el mismo nombre).
async function fetchFreshPlayersForSave() {
    try {
        var response = await fetch('../api/traerJugadores.php', { cache: 'no-store' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        var data = await response.json();
        if (!data.ok || !Array.isArray(data.jugadores)) throw new Error('Respuesta inválida');
        return data.jugadores.map(function(p) {
            return { id: parseInt(p.id, 10), name: p.nombre };
        });
    } catch (e) {
        console.warn('No se pudo refrescar jugadores desde la DB, se usa el caché local:', e);
        return getPlayers();
    }
}

async function uploadMatchEvents(match) {
    var players = await fetchFreshPlayersForSave();
    var payload = buildMatchEventPayload(match, players);
    if (!payload) {
        return { ok: false, error: 'No hay datos válidos para enviar' };
    }

    var response = await fetch('../api/saveMatchEvents.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        var text = await response.text();
        return { ok: false, error: 'HTTP ' + response.status + ' - ' + text };
    }

    return await response.json();
}

function buildMatchEventPayload(match, players) {
    if (!match || !Array.isArray(match.events)) return null;

    players = players || getPlayers();
    var byName = {};
    players.forEach(function(player) {
        if (player && typeof player.name === 'string') {
            byName[player.name] = player.id;
        }
    });

    function resolveId(name) {
        return Object.prototype.hasOwnProperty.call(byName, name) ? byName[name] : null;
    }

    var eventItems = [];
    match.events.forEach(function(ev) {
        if (!ev || !ev.type || !ev.team) return;
        var team = ev.team === 'white' ? 'white' : 'black';

        if (ev.type === 'goal') {
            var scorerId = resolveId(ev.player);
            if (scorerId !== null) {
                eventItems.push({ type: 'goal', playerId: scorerId, assistId: ev.assist ? resolveId(ev.assist) : null, team: team });
            }
        } else if (ev.type === 'substitution') {
            var inId = resolveId(ev.playerIn);
            if (inId !== null) {
                eventItems.push({ type: 'substitution', playerInId: inId, playerOutId: resolveId(ev.playerOut), team: team });
            }
        }
    });

    // Roster COMPLETO del partido (todos los jugadores que estuvieron en
    // cada equipo, tengan o no algún evento propio). El backend usa esto
    // para registrar NGNA a quien no tuvo contribución, garantizando que
    // TODOS los jugadores impacten su ELO.
    var rosterWhite = (match.whiteTeam || []).map(resolveId).filter(function(id) { return id !== null; });
    var rosterBlack = (match.blackTeam || []).map(resolveId).filter(function(id) { return id !== null; });

    var payloadMatch = {
        date:   match.date || null,
        format: match.format || 'F5',
        venue:  match.venue || null,
        rosterWhite: rosterWhite,
        rosterBlack: rosterBlack
    };
    if (typeof match.canchaId !== 'undefined' && match.canchaId !== null) {
        payloadMatch.canchaId = match.canchaId;
    }

    return {
        match: payloadMatch,
        events: eventItems
    };
}

// ── PANTALLA DE RESUMEN ──────────────────────────────────────
function showSummaryScreen() {
    var t1 = currentMatch.team1Name || 'BLANCO';
    var t2 = currentMatch.team2Name || 'NEGRO';
    var ws = currentMatch.whiteScore;
    var bs = currentMatch.blackScore;

    var winner = '';
    if      (ws > bs) winner = t1 + ' ganó <i class="fa-solid fa-trophy"></i>';
    else if (bs > ws) winner = t2 + ' ganó <i class="fa-solid fa-trophy"></i>';
    else              winner = 'Empate';

    var stats = {};
    eventsList.forEach(function(ev) {
        if (ev.type !== 'goal') return;
        if (!stats[ev.player]) stats[ev.player] = { goals: 0, assists: 0 };
        stats[ev.player].goals++;
        if (ev.assist) {
            if (!stats[ev.assist]) stats[ev.assist] = { goals: 0, assists: 0 };
            stats[ev.assist].assists++;
        }
    });

    var scorers = Object.keys(stats).map(function(name) {
        return { name: name, goals: stats[name].goals, assists: stats[name].assists };
    }).sort(function(a, b) { return (b.goals + b.assists) - (a.goals + a.assists); });

    var scorersHtml = scorers.length === 0
        ? '<div class="sum-empty">Sin goles registrados</div>'
        : scorers.map(function(p) {
            var chips = '';
            if (p.goals   > 0) chips += '<span class="sum-chip sum-chip-green">' + p.goals   + (p.goals   > 1 ? ' goles' : ' gol') + '</span>';
            if (p.assists > 0) chips += '<span class="sum-chip sum-chip-amber">' + p.assists + ' asist</span>';
            return '<div class="sum-player"><span>' + p.name + '</span><div class="sum-chips">' + chips + '</div></div>';
        }).join('');

    var timelineHtml = eventsList.length === 0
        ? '<div class="sum-empty">Sin eventos</div>'
        : eventsList.map(function(ev) {
            var t      = fmtTime(ev.minute);
            var isLeft = ev.team === 'white';
            var html   = '';
            if (ev.type === 'goal') {
                var assist = ev.assist ? ' <span style="color:var(--text-tertiary)">· ' + ev.assist + '</span>' : '';
                html = '<i class="fa-solid fa-futbol"></i> <strong>' + ev.player + '</strong>' + assist;
            } else {
                html = '<span style="color:var(--text-tertiary)"><i class="fa-solid fa-arrows-rotate"></i> ' + ev.playerIn + ' \u2194 ' + ev.playerOut + '</span>';
            }
            return '<div class="tl-row">' +
                '<div class="tl-event-left">'  + (isLeft  ? html : '') + '</div>' +
                '<div class="tl-time">' + t + '</div>' +
                '<div class="tl-event-right">' + (!isLeft ? html : '') + '</div>' +
            '</div>';
        }).join('');

    var duration = fmtTime(seconds);

    document.querySelector('.app-container').innerHTML =
        '<div class="header">' +
            '<div class="header-spacer"></div>' +
            '<h1>Resultado</h1>' +
            '<div class="header-spacer"></div>' +
        '</div>' +

        '<main class="main-content">' +

            '<div class="sum-winner">' + winner + '</div>' +

            '<div class="scoreboard">' +
                '<div class="team-block">' +
                    '<div class="team-label">' + t1 + '</div>' +
                    '<div class="team-score-num" style="color:' + (ws > bs ? 'var(--green-primary)' : 'var(--text-primary)') + '">' + ws + '</div>' +
                '</div>' +
                '<div class="scoreboard-center"><div class="scoreboard-dash">—</div></div>' +
                '<div class="team-block">' +
                    '<div class="team-label">' + t2 + '</div>' +
                    '<div class="team-score-num" style="color:' + (bs > ws ? 'var(--green-primary)' : 'var(--text-primary)') + '">' + bs + '</div>' +
                '</div>' +
            '</div>' +

            '<div class="sum-duration"><i class="fa-solid fa-stopwatch"></i> Duración: ' + duration + '</div>' +

            '<div class="sum-section">' +
                '<div class="sum-section-label">Goleadores y asistentes</div>' +
                scorersHtml +
            '</div>' +

            '<div class="timeline-section">' +
                '<div class="timeline-header">' +
                    '<span class="timeline-team-label tl-left">' + t1 + '</span>' +
                    '<span class="timeline-title">LÍNEA DE TIEMPO</span>' +
                    '<span class="timeline-team-label tl-right">' + t2 + '</span>' +
                '</div>' +
                '<div class="timeline-body">' + timelineHtml + '</div>' +
            '</div>' +

        '</main>' +

        '<div class="bottom-actions">' +
            '<button type="button" class="action-btn" onclick="window.location.href=\'crear-partido.html\'"><i class="fa-solid fa-futbol"></i> Partidos</button>' +
            '<button type="button" class="action-btn primary" onclick="window.location.href=\'home.html\'"><i class="fa-solid fa-house"></i> Inicio</button>' +
        '</div>';
}