// scripts/txt-export.js
// Genera un archivo de texto descargable con el resumen del partido.

function exportMatchToTXT(match) {
    if (!match) {
        throw new Error('No hay datos de partido para exportar.');
    }

    var lines = [];
    var dateLine = match.date ? 'Fecha: ' + match.date : 'Fecha: N/A';
    var timeLine = match.time ? 'Hora: ' + match.time : 'Hora: N/A';
    var venueLine = match.venue ? 'Cancha: ' + match.venue : 'Cancha: N/A';
    var formatLine = match.format ? 'Formato: ' + match.format : 'Formato: N/A';
    var team1 = match.team1Name || 'BLANCO';
    var team2 = match.team2Name || 'NEGRO';
    var scoreLine = 'Marcador: ' + team1 + ' ' + (match.whiteScore || 0) + ' - ' + (match.blackScore || 0) + ' ' + team2;

    lines.push('*** RESUMEN DEL PARTIDO ***');
    lines.push(dateLine);
    lines.push(timeLine);
    lines.push(venueLine);
    lines.push(formatLine);
    lines.push(scoreLine);
    lines.push('');

    lines.push('Equipo 1: ' + team1);
    if (Array.isArray(match.whiteTeam)) {
        lines.push('Jugadores equipo 1: ' + (match.whiteTeam.length ? match.whiteTeam.join(', ') : 'Sin jugadores'));
    }
    lines.push('Equipo 2: ' + team2);
    if (Array.isArray(match.blackTeam)) {
        lines.push('Jugadores equipo 2: ' + (match.blackTeam.length ? match.blackTeam.join(', ') : 'Sin jugadores'));
    }
    lines.push('');

    lines.push('--- Eventos ---');

    if (!Array.isArray(match.events) || match.events.length === 0) {
        lines.push('No se registraron eventos en este partido.');
    } else {
        match.events.forEach(function(ev, index) {
            var prefix = (index + 1) + '. ';
            var minute = typeof ev.minute === 'number' ? ' [' + fmtTime(ev.minute) + ']' : '';

            if (ev.type === 'goal') {
                var assistText = ev.assist ? ' Asistencia: ' + ev.assist : '';
                var teamName = ev.team === 'white' ? team1 : team2;
                lines.push(prefix + 'Gol - Equipo: ' + teamName + minute + ' - Goleador: ' + (ev.player || 'N/A') + assistText);
            } else if (ev.type === 'substitution') {
                var teamName = ev.team === 'white' ? team1 : team2;
                lines.push(prefix + 'Cambio - Equipo: ' + teamName + minute + ' - Sale: ' + (ev.playerOut || 'N/A') + ' - Entra: ' + (ev.playerIn || 'N/A'));
            } else {
                lines.push(prefix + 'Evento desconocido: ' + JSON.stringify(ev));
            }
        });
    }

    var content = lines.join('\r\n');
    var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var filename = 'partido_' + (match.date ? match.date.replace(/[^0-9]/g, '') : 'sin_fecha') + '_' + Date.now() + '.txt';

    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(function() {
        URL.revokeObjectURL(url);
    }, 1000);
}

function fmtTime(s) {
    if (typeof s !== 'number' || !isFinite(s)) {
        return '00:00';
    }
    var minutes = Math.floor(s / 60);
    var seconds = s % 60;
    return pad(minutes) + ':' + pad(seconds);
}

function pad(n) {
    return String(n).padStart(2, '0');
}
