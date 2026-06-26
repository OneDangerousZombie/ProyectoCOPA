var currentStatFilter = 'points';
var currentDateFilter = 'all';

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

    loadRanking();
    loadSummaryCards();

    document.getElementById('statFilter')?.addEventListener('change', function(e) {
        currentStatFilter = e.target.value;
        loadRanking();
    });
    document.getElementById('dateFilter')?.addEventListener('change', function(e) {
        currentDateFilter = e.target.value;
        loadRanking();
    });
});

// ── Cards resumen arriba de la tabla ─────────────────────────
function loadSummaryCards() {
    var stats   = getStats();
    var matches = getMatches().filter(function(m) { return m.completed; });

    // Total goles en la liga
    var totalGoals = 0;
    matches.forEach(function(m) {
        totalGoals += (m.whiteScore || 0) + (m.blackScore || 0);
    });

    // Máximo goleador
    var topScorer = stats.slice().sort(function(a,b) { return (b.goals||0)-(a.goals||0); })[0];

    // Máximo asistente
    var topAssist = stats.slice().sort(function(a,b) { return (b.assists||0)-(a.assists||0); })[0];

    // Win rate mayor
    var topWinRate = stats.slice()
        .filter(function(p) { return p.matches > 0; })
        .sort(function(a,b) { return (b.wins/b.matches)-(a.wins/a.matches); })[0];

    var cards = document.getElementById('summaryCards');
    if (!cards) return;

    var wr = topWinRate ? Math.round((topWinRate.wins / topWinRate.matches) * 100) : 0;

    cards.innerHTML =
        summaryCard('⚽', totalGoals, 'Goles en la liga') +
        summaryCard('🥇', topScorer ? topScorer.playerName : '—', 'Máximo goleador · ' + (topScorer ? topScorer.goals : 0) + ' goles') +
        summaryCard('🎯', topAssist ? topAssist.playerName : '—', 'Más asistencias · ' + (topAssist ? topAssist.assists : 0)) +
        summaryCard('📈', topWinRate ? topWinRate.playerName : '—', 'Mejor win rate · ' + wr + '%');
}

function summaryCard(icon, val, label) {
    return '<div class="stat-summary-card">' +
        '<div class="stat-summary-icon">' + icon + '</div>' +
        '<div class="stat-summary-val">' + val + '</div>' +
        '<div class="stat-summary-label">' + label + '</div>' +
    '</div>';
}

// ── Tabla ranking ─────────────────────────────────────────────
function loadRanking() {
    var ranking = getRanking(currentStatFilter, currentDateFilter);
    var tbody   = document.getElementById('rankingBody');
    if (!tbody) return;

    // Valor máximo para barras
    var maxVal = 0;
    ranking.forEach(function(p) { var v = getSortVal(p); if (v > maxVal) maxVal = v; });

    tbody.innerHTML = ranking.map(function(p, i) {
        var rankClass = i === 0 ? 'top-1' : i === 1 ? 'top-2' : i === 2 ? 'top-3' : '';
        var pts       = (p.wins || 0) * 3 + (p.draws || 0) || p.points || 0;
        var winRate   = p.matches > 0 ? Math.round((p.wins / p.matches) * 100) : 0;
        var sortVal   = getSortVal(p);
        var barPct    = maxVal > 0 ? Math.round((sortVal / maxVal) * 100) : 0;

        return '<tr class="' + rankClass + '">' +
            '<td>' + (i + 1) + '°</td>' +
            '<td class="td-name">' +
                '<span>' + p.playerName + '</span>' +
                '<div class="rank-bar-wrap"><div class="rank-bar-fill" style="width:' + barPct + '%"></div></div>' +
            '</td>' +
            '<td>' + (p.matches  || 0) + '</td>' +
            '<td>' + (p.wins     || 0) + '</td>' +
            '<td>' + (p.draws    || 0) + '</td>' +
            '<td>' + (p.losses   || 0) + '</td>' +
            '<td>' + (p.goals    || 0) + '</td>' +
            '<td>' + (p.assists  || 0) + '</td>' +
            '<td><strong>' + pts + '</strong></td>' +
        '</tr>';
    }).join('');
}

function getSortVal(p) {
    switch(currentStatFilter) {
        case 'goals':   return p.goals   || 0;
        case 'assists': return p.assists || 0;
        case 'won':     return p.wins    || 0;
        case 'lost':    return p.losses  || 0;
        case 'draw':    return p.draws   || 0;
        case 'streak':  return p.streak  || 0;
        default:        return (p.wins || 0) * 3 + (p.draws || 0) || p.points || 0;
    }
}
