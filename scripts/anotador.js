// ── Estado ──────────────────────────────────────────────────
var currentMatch  = null;
var timerInterval = null;
var seconds       = 0;
var isRunning     = false;
var eventsList    = [];
var pendingGoal   = { team: null, scorer: null };
var pendingSub    = { team: null, playerOut: null };

// ── Init ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
    var matchId = sessionStorage.getItem('currentMatchId');
    if (matchId) {
        loadMatch(parseInt(matchId));
    } else {
        // Sin partido activo, volver
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

    setEl('team1Label',    t1);
    setEl('team2Label',    t2);
    setEl('tlLabel1',      t1);
    setEl('tlLabel2',      t2);
    setEl('subTab1Label',  t1);
    setEl('subTab2Label',  t2);

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

// ── Modal GOL — paso 1 ───────────────────────────────────────
function openGoalModal(team) {
    if (!currentMatch) return;
    pendingGoal = { team: team, scorer: null };

    var t1   = currentMatch.team1Name || 'BLANCO';
    var t2   = currentMatch.team2Name || 'NEGRO';
    var name = team === 'white' ? t1 : t2;
    var list = team === 'white' ? currentMatch.whiteTeam : currentMatch.blackTeam;

    setEl('goalModalSub', name);
    buildGrid('goalPlayerGrid', list, function(p) { selectScorer(p); });
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
    buildGrid('assistPlayerGrid', others, function(p) { confirmGoal(p); });
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

// ── Modal CAMBIO — paso 1 ────────────────────────────────────
function openSubModal() {
    if (!currentMatch) return;
    pendingSub = { team: 'white', playerOut: null };
    selectSubTeam('white');
    document.getElementById('subModal').classList.add('active');
}

function selectSubTeam(team) {
    pendingSub.team = team;
    document.getElementById('subTab1').classList.toggle('active', team === 'white');
    document.getElementById('subTab2').classList.toggle('active', team === 'black');

    var t1    = currentMatch.team1Name || 'BLANCO';
    var t2    = currentMatch.team2Name || 'NEGRO';
    var tName = team === 'white' ? t1 : t2;
    var list  = team === 'white' ? currentMatch.whiteTeam : currentMatch.blackTeam;

    setEl('subTeamHint', 'Jugadores de ' + tName);
    buildGrid('subOutGrid', list, function(p) { selectPlayerOut(p); });
}

function closeSubModal() {
    document.getElementById('subModal').classList.remove('active');
    pendingSub = { team: null, playerOut: null };
}

// ── Modal CAMBIO — paso 2 ────────────────────────────────────
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
        grid.innerHTML = '<div style="color:var(--text-tertiary);font-size:0.83rem;text-align:center;padding:1rem;grid-column:1/-1">No hay jugadores disponibles fuera del partido</div>';
    } else {
        buildGrid('subInGrid', available, function(p) { confirmSub(p); });
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

// ── Helpers ──────────────────────────────────────────────────
function buildGrid(containerId, names, onClickFn) {
    var grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = '';
    names.forEach(function(name) {
        var btn = document.createElement('button');
        btn.type      = 'button';
        btn.className = 'player-select-btn';
        btn.textContent = name;
        btn.onclick   = function() { onClickFn(name); };
        grid.appendChild(btn);
    });
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
            var assist = ev.assist ? '<span class="tl-assist">\uD83C\uDFAF ' + ev.assist + '</span>' : '';
            html = '\u26BD <strong>' + ev.player + '</strong>' + assist;
        } else if (ev.type === 'substitution') {
            html = '<span class="tl-sub">\uD83D\uDD04 ' + ev.playerIn + ' \u21D4 ' + ev.playerOut + '</span>';
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
function finishMatch() {
    if (!confirm('¿Finalizar el partido?')) return;
    if (isRunning) pauseTimer();

    currentMatch.completed = true;
    currentMatch.events    = eventsList;

    // Guardar primero — seguro
    saveMatchProgress();

    // Intentar actualizar stats (no bloqueante)
    try { updateStatsAfterMatch(currentMatch); } catch(e) { console.warn('Stats:', e); }

    // Exportar TXT backup
    try { exportMatchToTXT(currentMatch); } catch(e) { console.warn('TXT:', e); }

    // Mostrar pantalla de resumen
    showSummaryScreen();
}

// ── PANTALLA DE RESUMEN ──────────────────────────────────────
function showSummaryScreen() {
    var t1    = currentMatch.team1Name || 'BLANCO';
    var t2    = currentMatch.team2Name || 'NEGRO';
    var ws    = currentMatch.whiteScore;
    var bs    = currentMatch.blackScore;

    var winner = '';
    if      (ws > bs) winner = t1 + ' ganó 🏆';
    else if (bs > ws) winner = t2 + ' ganó 🏆';
    else              winner = 'Empate';

    // Contar goles y asistencias por jugador
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

    // Armar HTML de goleadores
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

    // Armar HTML de timeline
    var timelineHtml = eventsList.length === 0
        ? '<div class="sum-empty">Sin eventos</div>'
        : eventsList.map(function(ev) {
            var t      = fmtTime(ev.minute);
            var isLeft = ev.team === 'white';
            var html   = '';
            if (ev.type === 'goal') {
                var assist = ev.assist ? ' <span style="color:var(--text-tertiary)">· ' + ev.assist + '</span>' : '';
                html = '⚽ <strong>' + ev.player + '</strong>' + assist;
            } else {
                html = '<span style="color:var(--text-tertiary)">🔄 ' + ev.playerIn + ' ↔ ' + ev.playerOut + '</span>';
            }
            return '<div class="tl-row">' +
                '<div class="tl-event-left">'  + (isLeft  ? html : '') + '</div>' +
                '<div class="tl-time">' + t + '</div>' +
                '<div class="tl-event-right">' + (!isLeft ? html : '') + '</div>' +
            '</div>';
        }).join('');

    // Duración
    var duration = fmtTime(seconds);

    // Reemplazar contenido del body
    document.querySelector('.app-container').innerHTML =
        '<div class="header">' +
            '<div style="width:34px"></div>' +
            '<h1>Resultado</h1>' +
            '<div style="width:34px"></div>' +
        '</div>' +

        '<main class="main-content">' +

            // Ganador
            '<div class="sum-winner">' + winner + '</div>' +

            // Marcador final
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

            // Duración
            '<div class="sum-duration">⏱ Duración: ' + duration + '</div>' +

            // Estadísticas
            '<div class="sum-section">' +
                '<div class="sum-section-label">Goleadores y asistentes</div>' +
                scorersHtml +
            '</div>' +

            // Timeline
            '<div class="timeline-section">' +
                '<div class="timeline-header">' +
                    '<span class="timeline-team-label tl-left">' + t1 + '</span>' +
                    '<span class="timeline-title">LÍNEA DE TIEMPO</span>' +
                    '<span class="timeline-team-label tl-right">' + t2 + '</span>' +
                '</div>' +
                '<div class="timeline-body">' + timelineHtml + '</div>' +
            '</div>' +

        '</main>' +

        // Botones finales
        '<div class="bottom-actions">' +
            '<button type="button" class="action-btn" onclick="window.location.href=\'crear-partido.html\'">⚽ Partidos</button>' +
            '<button type="button" class="action-btn primary" onclick="window.location.href=\'home.html\'">🏠 Inicio</button>' +
        '</div>';
}
