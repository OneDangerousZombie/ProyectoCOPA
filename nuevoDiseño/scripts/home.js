var currentFecha = 1;
var allMatches   = [];
var fechaList    = [];

window.addEventListener('DOMContentLoaded', function() {
    allMatches = getMatches();

    // Construir lista de fechas únicas con partidos completados
    var seen = {};
    allMatches.forEach(function(m) {
        if (m.completed && m.fecha && !seen[m.fecha]) {
            seen[m.fecha] = true;
            fechaList.push(m.fecha);
        }
    });

    // Si no hay partidos completados, mostrar igual con defaults
    if (fechaList.length === 0) fechaList = ['Sin partidos aún'];
    currentFecha = fechaList.length - 1; // última fecha

    renderCarousel();
    loadUserPerformance();
    loadTopPlayers();

    document.getElementById('prevFecha')?.addEventListener('click', function() {
        if (currentFecha > 0) { currentFecha--; renderCarousel(); }
    });
    document.getElementById('nextFecha')?.addEventListener('click', function() {
        if (currentFecha < fechaList.length - 1) { currentFecha++; renderCarousel(); }
    });
    document.getElementById('viewFullTable')?.addEventListener('click', function() {
        window.location.href = 'estadisticas.html';
    });
    document.getElementById('viewStatsBtn')?.addEventListener('click', function() {
        window.location.href = 'estadisticas.html';
    });
});

// ── Carrusel ─────────────────────────────────────────────────
function renderCarousel() {
    var label = fechaList[currentFecha] || '—';
    document.getElementById('fechaTitle').textContent = label.toUpperCase();

    var match = allMatches.find(function(m) { return m.completed && m.fecha === label; });

    var scoreEl = document.querySelector('.match-teams .score');
    var team1El = document.querySelector('.match-teams .team:first-child');
    var team2El = document.querySelector('.match-teams .team:last-child');

    if (match) {
        if (team1El) team1El.textContent = match.team1Name || 'BLANCO';
        if (team2El) team2El.textContent = match.team2Name || 'NEGRO';
        if (scoreEl) scoreEl.textContent = match.whiteScore + ' - ' + match.blackScore;
        loadTimeline(match.events || []);
    } else {
        if (team1El) team1El.textContent = 'BLANCO';
        if (team2El) team2El.textContent = 'NEGRO';
        if (scoreEl) scoreEl.textContent = '— - —';
        var tl = document.getElementById('timeline');
        if (tl) tl.innerHTML = '<div style="color:var(--text-tertiary);font-size:0.8rem;text-align:center;padding:0.75rem 0">Sin datos para esta fecha</div>';
    }
}

function loadTimeline(events) {
    var tl = document.getElementById('timeline');
    if (!tl) return;

    if (!events || events.length === 0) {
        tl.innerHTML = '<div style="color:var(--text-tertiary);font-size:0.8rem;text-align:center;padding:0.75rem 0">Sin eventos registrados</div>';
        return;
    }

    tl.innerHTML = events.filter(function(e) { return e.type === 'goal'; }).map(function(e) {
        var m   = Math.floor(e.minute / 60);
        var s   = e.minute % 60;
        var t   = pad(m) + "'" ;
        var isLeft = e.team === 'white';
        var assist = e.assist ? ' <span class="assist">\uD83C\uDFAF ' + e.assist + '</span>' : '';
        var ev = '<span class="event">\u26BD ' + e.player + '</span>' + assist;

        return '<div class="timeline-item ' + (isLeft ? 'left' : 'right') + '">' +
            '<span class="time">' + t + '</span>' +
            ev +
        '</div>';
    }).join('');
}

function pad(n) { return String(n).padStart(2, '0'); }

// ── Mi Desempeño ─────────────────────────────────────────────
function loadUserPerformance() {
    // Usuario fijo = Brandon (índice 0 en PLAYERS_LIST)
    var stats = getStats();
    var user  = stats[0];

    if (!user) {
        document.getElementById('userPoints').textContent    = '0';
        document.getElementById('lastPoints').textContent    = 'Sin partidos';
        document.getElementById('pj').textContent = '0';
        document.getElementById('pg').textContent = '0';
        document.getElementById('pe').textContent = '0';
        document.getElementById('pp').textContent = '0';
        document.getElementById('goles').textContent        = '0';
        document.getElementById('asistencias').textContent  = '0';
        return;
    }

    var pts   = user.points || 0;
    var wins  = user.wins   || 0;
    var draws = user.draws  || 0;
    var calculated = wins * 3 + draws;

    document.getElementById('userPoints').textContent   = calculated || pts;
    document.getElementById('lastPoints').textContent   = calcTrend(user);
    document.getElementById('pj').textContent           = user.matches  || 0;
    document.getElementById('pg').textContent           = user.wins     || 0;
    document.getElementById('pe').textContent           = user.draws    || 0;
    document.getElementById('pp').textContent           = user.losses   || 0;
    document.getElementById('goles').textContent        = user.goals    || 0;
    document.getElementById('asistencias').textContent  = user.assists  || 0;
}

function calcTrend(user) {
    if (!user || !user.matches) return 'Sin partidos aún';
    var avg = ((user.wins * 3 + user.draws) / user.matches).toFixed(1);
    return '↑ ' + avg + ' pts promedio por partido';
}

// ── Top Liga ─────────────────────────────────────────────────
function loadTopPlayers() {
    var ranking   = getRanking('points');
    var top6      = ranking.slice(0, 6);
    var container = document.getElementById('topPlayersList');
    if (!container) return;

    var medals = ['🥇', '🥈', '🥉'];
    var max    = top6.length > 0 ? ((top6[0].wins || 0) * 3 + (top6[0].draws || 0)) : 1;

    container.innerHTML = top6.map(function(p, i) {
        var pts     = (p.wins || 0) * 3 + (p.draws || 0) || p.points || 0;
        var pct     = max > 0 ? Math.round((pts / max) * 100) : 0;
        var rank    = medals[i] || ((i + 1) + '°');
        var winRate = p.matches > 0 ? Math.round((p.wins / p.matches) * 100) : 0;

        return '<div class="player-row">' +
            '<span class="player-rank">' + rank + '</span>' +
            '<div class="player-name-col">' +
                '<span class="player-name">' + p.playerName + '</span>' +
                '<div class="player-bar-wrap">' +
                    '<div class="player-bar-fill" style="width:' + pct + '%"></div>' +
                '</div>' +
            '</div>' +
            '<div class="player-stats">' +
                '<span><strong>' + (p.goals || 0) + '</strong> G</span>' +
                '<span><strong>' + (p.assists || 0) + '</strong> A</span>' +
                '<span class="pts-badge">' + pts + ' pts</span>' +
            '</div>' +
        '</div>';
    }).join('');
}
