// scripts/home.js — v2
// Ahora consulta APIs reales en vez de localStorage.
// Usa: api/estadisticas.php (ranking), api/perfil.php (mi desempeño),
//      api/partidos.php (carrusel de partidos).

var currentFecha = 0;
var allMatches   = [];
var fechaList    = [];
var dbStats      = [];      // datos de api/estadisticas.php
var myProfile    = null;    // datos de api/perfil.php
var dbStatsLoaded = false;
var matchesLoaded = false;
var profileLoaded = false;

window.addEventListener('DOMContentLoaded', function() {
    // Cargar todo en paralelo
    cargarEstadisticas();
    cargarPerfil();
    cargarPartidos();

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

// ═══════════════════════════════════════════════════════════════
// 1. CARGAR ESTADÍSTICAS DE LA LIGA (para Top Liga)
// ═══════════════════════════════════════════════════════════════
function cargarEstadisticas() {
    fetch('../api/estadisticas.php', { credentials: 'same-origin' })
        .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function(data) {
            if (!data.ok) throw new Error(data.error);
            dbStats = data.estadisticas || [];
            dbStatsLoaded = true;
            loadTopPlayers();
        })
        .catch(function(err) {
            console.error('Error cargando estadísticas:', err);
            // Fallback a localStorage
            dbStats = convertirLocalStatsHome();
            dbStatsLoaded = true;
            loadTopPlayers();
        });
}

// ═══════════════════════════════════════════════════════════════
// 2. CARGAR PERFIL DEL USUARIO (para Mi Desempeño)
// ═══════════════════════════════════════════════════════════════
function cargarPerfil() {
    fetch('../api/perfil.php', { credentials: 'same-origin' })
        .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function(data) {
            if (!data.success) {
                if (data.code === 'NO_LIGA_ACTIVA' || data.code === 'NO_MIEMBRO') {
                    window.location.href = 'league-selection.html';
                }
                throw new Error(data.error);
            }
            myProfile = data;
            profileLoaded = true;
            loadUserPerformance();
        })
        .catch(function(err) {
            console.error('Error cargando perfil:', err);
            // Fallback: intentar localStorage
            profileLoaded = true;
            loadUserPerformanceFallback();
        });
}

// ═══════════════════════════════════════════════════════════════
// 3. CARGAR PARTIDOS DE LA LIGA (para el carrusel)
// ═══════════════════════════════════════════════════════════════
function cargarPartidos() {
    fetch('../api/partidos.php', { credentials: 'same-origin' })
        .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function(data) {
            if (!data.ok) throw new Error(data.error);
            allMatches = data.partidos || [];

            // Construir lista de fechas únicas
            var seen = {};
            fechaList = [];
            allMatches.forEach(function(m) {
                if (m.date && !seen[m.date]) {
                    seen[m.date] = true;
                    fechaList.push(m.date);
                }
            });

            if (fechaList.length === 0) {
                fechaList = ['Sin partidos aún'];
            }
            currentFecha = 0;

            matchesLoaded = true;
            renderCarousel();
        })
        .catch(function(err) {
            console.error('Error cargando partidos:', err);
            // Fallback a localStorage
            allMatches = getMatches().filter(function(m) { return m.completed; });
            var seen = {};
            fechaList = [];
            allMatches.forEach(function(m) {
                if (m.fecha && !seen[m.fecha]) {
                    seen[m.fecha] = true;
                    fechaList.push(m.fecha);
                }
            });
            if (fechaList.length === 0) fechaList = ['Sin partidos aún'];
            currentFecha = 0;
            matchesLoaded = true;
            renderCarousel();
        });
}

// ═══════════════════════════════════════════════════════════════
// TOP LIGA — ahora con datos reales de la API
// ═══════════════════════════════════════════════════════════════
function loadTopPlayers() {
    var container = document.getElementById('topPlayersList');
    if (!container) return;

    if (!dbStatsLoaded) {
        container.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--text-tertiary)">' +
            '<i class="fa-solid fa-circle-notch fa-spin" style="color:var(--green-primary);margin-right:.5rem"></i> Cargando…</div>';
        return;
    }

    if (dbStats.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--text-tertiary)">Sin jugadores en la liga</div>';
        return;
    }

    // Ordenar por puntos (3*PG + PE)
    var ranking = dbStats.slice().sort(function(a, b) {
        var pa = (a.pg || 0) * 3 + (a.pe || 0);
        var pb = (b.pg || 0) * 3 + (b.pe || 0);
        return pb - pa;
    });

    var top6 = ranking.slice(0, 6);
    var medals = ['🥇', '🥈', '🥉'];
    var maxPts = top6.length > 0 ? ((top6[0].pg || 0) * 3 + (top6[0].pe || 0)) : 1;

    container.innerHTML = top6.map(function(p, i) {
        var pts     = (p.pg || 0) * 3 + (p.pe || 0);
        var pct     = maxPts > 0 ? Math.round((pts / maxPts) * 100) : 0;
        var rank    = medals[i] || ((i + 1) + '°');
        var winRate = (p.pj || 0) > 0 ? Math.round((p.pg || 0) / p.pj * 100) : 0;

        return '<div class="player-row">' +
            '<span class="player-rank">' + rank + '</span>' +
            '<div class="player-name-col">' +
                '<span class="player-name">' + escapeHtml(p.nombre) + '</span>' +
                '<div class="player-bar-wrap">' +
                    '<div class="player-bar-fill" style="width:' + pct + '%"></div>' +
                '</div>' +
            '</div>' +
            '<div class="player-stats">' +
                '<span><strong>' + (p.goles || 0) + '</strong> G</span>' +
                '<span><strong>' + (p.asistencias || 0) + '</strong> A</span>' +
                '<span class="pts-badge">' + pts + ' pts</span>' +
            '</div>' +
        '</div>';
    }).join('');
}

// ═══════════════════════════════════════════════════════════════
// MI DESEMPEÑO — ahora con datos reales del usuario logueado
// ═══════════════════════════════════════════════════════════════
function loadUserPerformance() {
    if (!profileLoaded || !myProfile || !myProfile.estadisticas) {
        loadUserPerformanceFallback();
        return;
    }

    var ligaNombre = myProfile.liga && myProfile.liga.nombre ? myProfile.liga.nombre : '';
    var titleEl = document.querySelector('.performance-card h3');
    if (titleEl) titleEl.textContent = ligaNombre ? 'Mi Desempeño en ' + ligaNombre : 'Mi Desempeño';

    var stats = myProfile.estadisticas;
    var pts   = (parseInt(stats.PARTIDOS_GANADOS) || 0) * 3 + (parseInt(stats.PARTIDOS_EMPATADOS) || 0);
    var pj    = parseInt(stats.PARTIDOS_JUGADOS) || 0;
    var pg    = parseInt(stats.PARTIDOS_GANADOS) || 0;
    var pe    = parseInt(stats.PARTIDOS_EMPATADOS) || 0;
    var pp    = parseInt(stats.PARTIDOS_PERDIDOS) || 0;
    var goles = parseInt(stats.GOLES) || 0;
    var asis  = parseInt(stats.ASISTENCIAS) || 0;

    document.getElementById('userPoints').textContent = pts;
    document.getElementById('lastPoints').textContent = calcTrend(pj, pg, pe);
    document.getElementById('pj').textContent = pj;
    document.getElementById('pg').textContent = pg;
    document.getElementById('pe').textContent = pe;
    document.getElementById('pp').textContent = pp;
    document.getElementById('goles').textContent = goles;
    document.getElementById('asistencias').textContent = asis;
}

function loadUserPerformanceFallback() {
    // Fallback: intentar localStorage
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

    var pts   = (user.wins || 0) * 3 + (user.draws || 0);
    var wins  = user.wins   || 0;
    var draws = user.draws  || 0;
    var calculated = wins * 3 + draws;

    document.getElementById('userPoints').textContent   = calculated || pts;
    document.getElementById('lastPoints').textContent   = calcTrend(user.matches || 0, user.wins || 0, user.draws || 0);
    document.getElementById('pj').textContent           = user.matches  || 0;
    document.getElementById('pg').textContent           = user.wins     || 0;
    document.getElementById('pe').textContent           = user.draws    || 0;
    document.getElementById('pp').textContent           = user.losses   || 0;
    document.getElementById('goles').textContent        = user.goals    || 0;
    document.getElementById('asistencias').textContent  = user.assists  || 0;
}

function calcTrend(matches, wins, draws) {
    if (!matches) return 'Sin partidos aún';
    var avg = ((wins * 3 + draws) / matches).toFixed(1);
    return '↑ ' + avg + ' pts promedio por partido';
}

// ═══════════════════════════════════════════════════════════════
// CARRUSEL — ahora con partidos reales de la API
// ═══════════════════════════════════════════════════════════════
function renderCarousel() {
    var label = fechaList[currentFecha] || '—';
    document.getElementById('fechaTitle').textContent = label.toUpperCase();

    var match = allMatches.find(function(m) {
        return m.completed && (m.date === label || m.fecha === label);
    });

    var scoreEl = document.querySelector('.match-teams .score');
    var team1El = document.querySelector('.match-teams .team:first-child');
    var team2El = document.querySelector('.match-teams .team:last-child');

    if (match) {
        if (team1El) team1El.textContent = match.team1Name || 'BLANCO';
        if (team2El) team2El.textContent = match.team2Name || 'NEGRO';
        if (scoreEl) scoreEl.textContent = (match.whiteScore || 0) + ' - ' + (match.blackScore || 0);
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
        var m   = Math.floor((e.minute || 0) / 60);
        var t   = pad(m) + "'";
        var isLeft = e.team === 'white';
        var assist = e.assist ? ' <span class="assist">🎯 ' + escapeHtml(e.assist) + '</span>' : '';
        var ev = '<span class="event">⚽ ' + escapeHtml(e.player) + '</span>' + assist;

        return '<div class="timeline-item ' + (isLeft ? 'left' : 'right') + '">' +
            '<span class="time">' + t + '</span>' +
            ev +
        '</div>';
    }).join('');
}

function pad(n) { return String(n).padStart(2, '0'); }

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════
function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
}

function convertirLocalStatsHome() {
    var stats = getStats();
    var players = getPlayers();
    return stats.map(function(s) {
        var player = players.find(function(p) { return p.id === s.playerId; });
        return {
            id:          s.playerId,
            nombre:      player ? player.name : (s.playerName || 'Jugador #' + s.playerId),
            avatar:      player ? (player.avatar || '') : '',
            elo:         player ? (player.elo || 1000) : 1000,
            pj:          s.matches  || 0,
            pg:          s.wins     || 0,
            pp:          s.losses   || 0,
            pe:          s.draws    || 0,
            goles:       s.goals    || 0,
            asistencias: s.assists  || 0,
            racha:       s.streak   || 0
        };
    });
}
