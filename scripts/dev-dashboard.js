// scripts/dev-dashboard.js — v2
// Actualizado para la nueva base copatres:
//   - KPI extra: total ligas
//   - ELO viene de liga_miembros
//   - Nuevo gráfico: miembros por liga

var COLORS = {
    green:     '#22c55e',
    greenFade: 'rgba(34,197,94,0.15)',
    blue:      '#60a5fa',
    purple:    '#c084fc',
    amber:     '#fbbf24',
    red:       '#f87171',
    border:    'rgba(255,255,255,0.06)',
    textSec:   '#8a8a8a',
};

var TOOLTIP = {
    backgroundColor: '#1c1c1c',
    borderColor: '#262626',
    borderWidth: 1,
    titleColor: '#f8f8f8',
    bodyColor: '#8a8a8a',
    padding: 10,
    cornerRadius: 8,
};

document.addEventListener('DOMContentLoaded', function () {
    if (window.Chart) {
        Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
        Chart.defaults.font.size   = 12;
        Chart.defaults.color       = COLORS.textSec;
    }
    loadDashboard();
});

function loadDashboard() {
    setLoading(true);
    fetch('../api/dev/stats.php', { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (json) {
            if (!json.ok) throw new Error(json.error || 'Error del servidor');
            render(json.data);
        })
        .catch(function (err) {
            var el = document.getElementById('devDashboardError');
            if (el) { el.textContent = 'No se pudieron cargar los datos: ' + err.message; el.style.display = 'block'; }
        })
        .finally(function () { setLoading(false); });
}

function setLoading(v) {
    var el = document.getElementById('devLoadingOverlay');
    if (el) el.style.display = v ? 'flex' : 'none';
}

function render(d) {
    // KPIs
    setText('kpiJugadores',  d.totalJugadores);
    setText('kpiPartidos',   d.totalPartidos);
    setText('kpiGoles',      d.totalGoles);
    setText('kpiEloPromedio',d.avgElo);
    setText('kpiLigas',      d.totalLigas);

    // Chart 1: Partidos por mes
    var ppm = d.partidosPorMes || [];
    buildLine('chartPartidosMes',
        ppm.map(function(x){return x.label;}),
        [{
            label: 'Partidos',
            data:  ppm.map(function(x){return x.cantidad;}),
            borderColor: COLORS.green, backgroundColor: COLORS.greenFade,
            fill: true, tension: 0.4,
            pointBackgroundColor: COLORS.green, pointRadius: 4, pointHoverRadius: 6,
        }]
    );

    // Chart 2: Top goleadores (barras horizontales)
    var tg = d.topGoleadores || [];
    buildBar('chartGoleadores',
        tg.map(function(x){return x.nombre;}),
        [
            { label:'Goles',       data: tg.map(function(x){return x.goles;}),       backgroundColor: COLORS.green, borderRadius: 4 },
            { label:'Asistencias', data: tg.map(function(x){return x.asistencias;}), backgroundColor: COLORS.blue,  borderRadius: 4 },
        ],
        true
    );

    // Chart 3: Win rate
    var wr = d.distribucionWinRate || [];
    buildBar('chartWinRate',
        wr.map(function(x){return x.rango;}),
        [{ label:'Jugadores', data: wr.map(function(x){return x.cantidad;}),
           backgroundColor:[COLORS.red,COLORS.amber,COLORS.green,COLORS.textSec], borderRadius:4 }]
    );

    // Chart 4: Distribución ELO (ahora viene de liga_miembros)
    var elo = d.distribucionElo || [];
    buildBar('chartDistribucionElo',
        elo.map(function(x){return x.rango;}),
        [{ label:'Jugadores', data: elo.map(function(x){return x.cantidad;}),
           backgroundColor:[COLORS.red,COLORS.amber,COLORS.green,COLORS.purple], borderRadius:6 }]
    );

    // Chart 5: Formatos de partido
    var fmt = d.distribucionFormato || [];
    buildDoughnut('chartFormatos',
        fmt.map(function(x){return x.formato;}),
        fmt.map(function(x){return x.cantidad;}),
        [COLORS.green,COLORS.blue,COLORS.purple,COLORS.amber,COLORS.red,'#a78bfa']
    );

    // Chart 6: Canchas
    var can = d.canchasUso || [];
    buildDoughnut('chartCanchas',
        can.map(function(x){return x.nombre;}),
        can.map(function(x){return x.cantidad;}),
        [COLORS.green,COLORS.amber,COLORS.blue]
    );

    // Chart 7 (nuevo): Miembros por liga
    var ml = d.miembrosPorLiga || [];
    buildBar('chartMiembrosPorLiga',
        ml.map(function(x){return x.liga;}),
        [{ label:'Miembros', data: ml.map(function(x){return x.miembros;}),
           backgroundColor: COLORS.purple, borderRadius:6 }]
    );
}

function gridOpts(horizontal) {
    return {
        responsive: true, maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
        scales: {
            x: { grid:{color:COLORS.border}, ticks:{color:COLORS.textSec} },
            y: { grid:{color:COLORS.border}, ticks:{color:COLORS.textSec,precision:0}, beginAtZero:true }
        },
        plugins: { tooltip: TOOLTIP }
    };
}

function buildLine(id, labels, datasets) {
    var ctx = document.getElementById(id); if (!ctx) return;
    new Chart(ctx, { type:'line', data:{labels:labels,datasets:datasets},
        options: Object.assign(gridOpts(), {
            plugins:{ tooltip:TOOLTIP, legend:{display:true,labels:{color:COLORS.textSec,boxWidth:12}} }
        })
    });
}

function buildBar(id, labels, datasets, horizontal) {
    var ctx = document.getElementById(id); if (!ctx) return;
    var opts = gridOpts(horizontal);
    opts.plugins.legend = { display: datasets.length > 1, labels:{color:COLORS.textSec,boxWidth:12} };
    new Chart(ctx, { type:'bar', data:{labels:labels,datasets:datasets}, options:opts });
}

function buildDoughnut(id, labels, data, bg) {
    var ctx = document.getElementById(id); if (!ctx) return;
    new Chart(ctx, { type:'doughnut',
        data:{labels:labels, datasets:[{data:data,backgroundColor:bg,borderColor:'transparent',borderWidth:0,hoverOffset:6}]},
        options:{
            responsive:true, maintainAspectRatio:false, cutout:'68%',
            plugins:{
                legend:{display:true,position:'right',labels:{color:COLORS.textSec,boxWidth:10,padding:12,font:{size:11}}},
                tooltip:TOOLTIP
            }
        }
    });
}

function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = (val != null) ? val : '—';
}
