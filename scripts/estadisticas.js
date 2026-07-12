// scripts/estadisticas.js — v2
// Ahora consulta la API real (api/estadisticas.php) en vez de leer
// localStorage. Los filtros de ordenamiento se aplican sobre los datos
// traídos del servidor.

var currentStatFilter = 'points';
var currentDateFilter = 'all';
var dbStats = [];      // datos crudos de la API
var dbStatsLoaded = false;

window.addEventListener('DOMContentLoaded', function() {
    // Si viene desde home con fecha preseleccionada
    var savedFecha = sessionStorage.getItem('selectedFecha');
    if (savedFecha) {
        var n = savedFecha.match(/\d+/);
        if (n) {
            document.getElementById('dateFilter').value = n[0];
            currentDateFilter = n[0];
        }
        sessionStorage.removeItem('selectedFecha');
    }

    // Cargar datos reales desde la API
    cargarEstadisticasDesdeApi();

    document.getElementById('statFilter')?.addEventListener('change', function(e) {
        currentStatFilter = e.target.value;
        renderRanking();
    });
    document.getElementById('dateFilter')?.addEventListener('change', function(e) {
        currentDateFilter = e.target.value;
        // El filtro por fecha no está implementado en la API todavía;
        // por ahora recarga todo (la API ya filtra por liga activa).
        renderRanking();
    });
});

// ── Cargar desde la API ────────────────────────────────────
function cargarEstadisticasDesdeApi() {
    var tbody = document.getElementById('rankingBody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--text-tertiary)">' +
            '<i class="fa-solid fa-circle-notch fa-spin" style="color:var(--green-primary);margin-right:.5rem"></i> Cargando estadísticas…</td></tr>';
    }

    fetch('../api/estadisticas.php', { credentials: 'same-origin' })
        .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function(data) {
            if (!data.ok) {
                throw new Error(data.error || 'Error del servidor');
            }
            dbStats = data.estadisticas || [];
            dbStatsLoaded = true;

            // Fallback: si la API devolvió vacío, intentar localStorage
            if (dbStats.length === 0) {
                console.warn('API devolvió 0 estadísticas, usando localStorage como fallback');
                dbStats = convertirLocalStats();
            }

            renderSummaryCards();
            renderRanking();
        })
        .catch(function(err) {
            console.error('Error cargando estadísticas:', err);
            // Fallback a localStorage
            dbStats = convertirLocalStats();
            dbStatsLoaded = true;
            renderSummaryCards();
            renderRanking();

            var tbody = document.getElementById('rankingBody');
            if (tbody && dbStats.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#f87171">' +
                    'No se pudieron cargar las estadísticas. ' + err.message + '</td></tr>';
            }
        });
}

// ── Convertir stats de localStorage al formato de la API ─────
function convertirLocalStats() {
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

// ── Cards resumen arriba de la tabla ─────────────────────────
function renderSummaryCards() {
    var container = document.getElementById('summaryCards');
    if (!container) return;

    if (!dbStatsLoaded || dbStats.length === 0) {
        container.innerHTML = '';
        return;
    }

    // Total goles en la liga
    var totalGoals = dbStats.reduce(function(sum, p) { return sum + (p.goles || 0); }, 0);

    // Máximo goleador
    var topScorer = dbStats.slice().sort(function(a, b) {
        return (b.goles || 0) - (a.goles || 0);
    })[0];

    // Máximo asistente
    var topAssist = dbStats.slice().sort(function(a, b) {
        return (b.asistencias || 0) - (a.asistencias || 0);
    })[0];

    // Mejor win rate (mínimo 3 partidos para ser representativo)
    var topWinRate = dbStats.slice()
        .filter(function(p) { return (p.pj || 0) >= 3; })
        .sort(function(a, b) {
            var wrA = (a.pj || 0) > 0 ? (a.pg || 0) / a.pj : 0;
            var wrB = (b.pj || 0) > 0 ? (b.pg || 0) / b.pj : 0;
            return wrB - wrA;
        })[0];

    // Si nadie tiene 3+ partidos, tomar el mejor de todos
    if (!topWinRate && dbStats.length > 0) {
        topWinRate = dbStats.slice().sort(function(a, b) {
            var wrA = (a.pj || 0) > 0 ? (a.pg || 0) / a.pj : 0;
            var wrB = (b.pj || 0) > 0 ? (b.pg || 0) / b.pj : 0;
            return wrB - wrA;
        })[0];
    }

    var wr = topWinRate && (topWinRate.pj || 0) > 0
        ? Math.round((topWinRate.pg / topWinRate.pj) * 100)
        : 0;

    container.innerHTML =
        summaryCard('<i class="fa-solid fa-futbol"></i>', totalGoals, 'Goles en la liga') +
        summaryCard('<i class="fa-solid fa-trophy"></i>', topScorer ? topScorer.nombre : '—',
            'Máximo goleador · ' + (topScorer ? topScorer.goles : 0) + ' goles') +
        summaryCard('<i class="fa-solid fa-bullseye"></i>', topAssist ? topAssist.nombre : '—',
            'Más asistencias · ' + (topAssist ? topAssist.asistencias : 0)) +
        summaryCard('<i class="fa-solid fa-chart-line"></i>', topWinRate ? topWinRate.nombre : '—',
            'Mejor win rate · ' + wr + '%');
}

function summaryCard(icon, val, label) {
    return '<div class="stat-summary-card">' +
        '<div class="stat-summary-icon">' + icon + '</div>' +
        '<div class="stat-summary-val">' + escapeHtml(String(val)) + '</div>' +
        '<div class="stat-summary-label">' + label + '</div>' +
    '</div>';
}

// ── Tabla ranking ─────────────────────────────────────────────
function renderRanking() {
    var tbody = document.getElementById('rankingBody');
    if (!tbody) return;

    if (!dbStatsLoaded) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--text-tertiary)">' +
            '<i class="fa-solid fa-circle-notch fa-spin" style="color:var(--green-primary);margin-right:.5rem"></i> Cargando…</td></tr>';
        return;
    }

    if (dbStats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--text-tertiary)">' +
            'Sin estadísticas disponibles</td></tr>';
        return;
    }

    // Clonar y ordenar según filtro
    var ranking = dbStats.slice();
    ranking.sort(function(a, b) {
        var va = getSortVal(a);
        var vb = getSortVal(b);
        return vb - va; // descendente
    });

    // Valor máximo para barras
    var maxVal = 0;
    ranking.forEach(function(p) {
        var v = getSortVal(p);
        if (v > maxVal) maxVal = v;
    });

    tbody.innerHTML = ranking.map(function(p, i) {
        var rankClass = i === 0 ? 'top-1' : i === 1 ? 'top-2' : i === 2 ? 'top-3' : '';
        var pts       = (p.pg || 0) * 3 + (p.pe || 0);
        var winRate   = (p.pj || 0) > 0 ? Math.round((p.pg || 0) / p.pj * 100) : 0;
        var sortVal   = getSortVal(p);
        var barPct    = maxVal > 0 ? Math.round((sortVal / maxVal) * 100) : 0;

        var avatarHtml = p.avatar
            ? '<img src="' + p.avatar + '" class="ranking-avatar" alt="">'
            : '<div class="ranking-avatar-placeholder"><i class="fa-solid fa-user"></i></div>';

        return '<tr class="' + rankClass + '">' +
            '<td>' + (i + 1) + '°</td>' +
            '<td class="td-name">' +
                '<div class="ranking-name-row">' + avatarHtml + '<span>' + escapeHtml(p.nombre) + '</span></div>' +
                '<div class="rank-bar-wrap"><div class="rank-bar-fill" style="width:' + barPct + '%"></div></div>' +
            '</td>' +
            '<td>' + (p.pj  || 0) + '</td>' +
            '<td>' + (p.pg  || 0) + '</td>' +
            '<td>' + (p.pe  || 0) + '</td>' +
            '<td>' + (p.pp  || 0) + '</td>' +
            '<td>' + (p.goles    || 0) + '</td>' +
            '<td>' + (p.asistencias || 0) + '</td>' +
            '<td><strong>' + pts + '</strong></td>' +
        '</tr>';
    }).join('');
}

function getSortVal(p) {
    switch(currentStatFilter) {
        case 'goals':   return p.goles       || 0;
        case 'assists': return p.asistencias || 0;
        case 'won':     return p.pg          || 0;
        case 'lost':    return p.pp          || 0;
        case 'draw':    return p.pe          || 0;
        case 'streak':  return p.racha       || 0;
        default:        return (p.pg || 0) * 3 + (p.pe || 0);
    }
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
}