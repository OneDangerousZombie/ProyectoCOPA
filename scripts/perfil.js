// scripts/perfil.js — v2
// Ahora el historial de partidos viene de la API real (api/mis_partidos.php).
// El perfil del usuario sigue usando api/perfil.php.

document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    loadMatchHistoryFromApi();
});

// ═══════════════════════════════════════════════════════════════
// PERFIL DEL USUARIO — api/perfil.php (sin cambios, ya funcionaba)
// ═══════════════════════════════════════════════════════════════
function loadProfileData() {
    fetch('../api/perfil.php')
        .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function(data) {
            if (!data.success) {
                if (data.error === 'Usuario no autenticado') {
                    window.location.href = 'login.html';
                    return;
                }
                if (data.code === 'NO_LIGA_ACTIVA' || data.code === 'NO_MIEMBRO') {
                    window.location.href = 'league-selection.html';
                    return;
                }
                throw new Error(data.error);
            }

            var sesion = data.sesion;
            var stats = data.estadisticas;

            // Nombre
            var nameEl = document.getElementById('profileName');
            if (nameEl) nameEl.textContent = sesion.NOMBRE || 'Jugador';

            // Liga activa
            if (data.liga && data.liga.nombre) {
                var ligaEl = document.getElementById('profileLigaActiva');
                if (!ligaEl && nameEl) {
                    ligaEl = document.createElement('p');
                    ligaEl.id = 'profileLigaActiva';
                    ligaEl.style.cssText = 'font-size:0.8rem;color:var(--text-tertiary);margin:0.15rem 0 0';
                    nameEl.insertAdjacentElement('afterend', ligaEl);
                }
                if (ligaEl) {
                    ligaEl.textContent = data.liga.nombre + ' · ELO ' + Math.round(data.liga.valor_elo);
                }
            }

            // Avatar
            var avatarImg = document.getElementById('profileAvatar');
            if (avatarImg && sesion.AVATAR_URL) {
                avatarImg.src = sesion.AVATAR_URL;
            }

            // Stats base
            var pj = parseInt(stats.PARTIDOS_JUGADOS) || 0;
            var pg = parseInt(stats.PARTIDOS_GANADOS) || 0;
            var pe = parseInt(stats.PARTIDOS_EMPATADOS) || 0;
            var pp = parseInt(stats.PARTIDOS_PERDIDOS) || 0;
            var goles = parseInt(stats.GOLES) || 0;
            var asis = parseInt(stats.ASISTENCIAS) || 0;
            var racha = parseInt(stats.RACHA) || 0;

            setText('profilePJ', pj);
            setText('profileGoles', goles);
            setText('profileAsistencias', asis);
            setText('profileRacha', racha);

            // Win rate
            var winRate = pj > 0 ? ((pg / pj) * 100).toFixed(1) : '0';
            setText('profileWinRate', winRate + '%');

            // Logro de racha
            var logroRacha = document.getElementById('logroRacha');
            if (logroRacha) {
                if (racha >= 3) {
                    logroRacha.style.display = 'flex';
                } else {
                    logroRacha.style.display = 'none';
                }
            }
        })
        .catch(function(error) {
            console.error('Error cargando perfil:', error);
        });
}

// ═══════════════════════════════════════════════════════════════
// HISTORIAL DE PARTIDOS — api/mis_partidos.php (NUEVO)
// ═══════════════════════════════════════════════════════════════
function loadMatchHistoryFromApi() {
    var container = document.getElementById('matchHistoryList');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--text-tertiary)">' +
        '<i class="fa-solid fa-circle-notch fa-spin" style="color:var(--green-primary);margin-right:.5rem"></i> Cargando historial…</div>';

    fetch('../api/mis_partidos.php', { credentials: 'same-origin' })
        .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function(data) {
            if (!data.ok) throw new Error(data.error || 'Error del servidor');

            var partidos = data.partidos || [];

            if (partidos.length === 0) {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div>No hay partidos registrados</div>';
                return;
            }

            container.innerHTML = '';
            partidos.forEach(function(match) {
                var item = document.createElement('div');
                var resultadoClass = match.resultado === 'win' ? '' : match.resultado === 'draw' ? ' draw' : ' loss';
                var resultadoText = match.resultado === 'win' ? '✓ Victoria' : match.resultado === 'draw' ? '= Empate' : '✗ Derrota';
                var resultadoColor = match.resultado === 'win' ? 'var(--green-primary)' : match.resultado === 'draw' ? '#f59e0b' : '#ef4444';

                item.className = 'history-item' + resultadoClass;
                item.innerHTML =
                    '<div style="display:flex;justify-content:space-between;align-items:center">' +
                        '<span style="font-size:0.8rem;color:var(--text-tertiary)">' + escapeHtml(match.fechaLabel || match.fecha) + '</span>' +
                        '<span style="font-size:0.78rem;font-weight:700;color:' + resultadoColor + '">' + resultadoText + '</span>' +
                    '</div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.3rem">' +
                        '<span style="font-size:0.875rem;font-weight:600">' + escapeHtml(match.equipo) + '</span>' +
                        '<span style="font-size:1rem;font-weight:800;color:var(--text-primary)">' + match.miGoles + ' — ' + match.rivalGoles + '</span>' +
                    '</div>' +
                    (match.goles > 0 || match.asistencias > 0
                        ? '<div style="font-size:0.75rem;color:var(--text-tertiary);margin-top:0.25rem">' +
                            (match.goles > 0 ? '⚽ ' + match.goles + ' gol' + (match.goles > 1 ? 'es' : '') : '') +
                            (match.goles > 0 && match.asistencias > 0 ? ' · ' : '') +
                            (match.asistencias > 0 ? '🎯 ' + match.asistencias + ' asist' + (match.asistencias > 1 ? 's' : '') : '') +
                          '</div>'
                        : '');

                container.appendChild(item);
            });
        })
        .catch(function(err) {
            console.error('Error cargando historial:', err);
            // Fallback a localStorage
            loadMatchHistoryFallback();
        });
}

// Fallback: leer de localStorage si la API falla
function loadMatchHistoryFallback() {
    var container = document.getElementById('matchHistoryList');
    if (!container) return;

    var matches = typeof getMatches === 'function' ? getMatches() : [];
    var userName = document.getElementById('profileName').textContent;

    var userMatches = matches.filter(function(m) {
        return m.completed && (m.whiteTeam.includes(userName) || m.blackTeam.includes(userName));
    });

    if (userMatches.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div>No hay partidos registrados</div>';
        return;
    }

    container.innerHTML = '';
    userMatches.slice(0, 5).forEach(function(match) {
        var isInWhite = match.whiteTeam.includes(userName);
        var teamName = isInWhite ? 'BLANCO' : 'NEGRO';
        var myScore = isInWhite ? match.whiteScore : match.blackScore;
        var theirScore = isInWhite ? match.blackScore : match.whiteScore;
        var won = myScore > theirScore;
        var draw = myScore === theirScore;

        var item = document.createElement('div');
        item.className = 'history-item' + (won ? '' : draw ? ' draw' : ' loss');
        item.innerHTML =
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
                '<span style="font-size:0.8rem;color:var(--text-tertiary)">' + (match.fecha || '') + '</span>' +
                '<span style="font-size:0.78rem;font-weight:700;color:' + (won ? 'var(--green-primary)' : draw ? '#f59e0b' : '#ef4444') + '">' +
                    (won ? '✓ Victoria' : draw ? '= Empate' : '✗ Derrota') +
                '</span>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.3rem">' +
                '<span style="font-size:0.875rem;font-weight:600">' + teamName + '</span>' +
                '<span style="font-size:1rem;font-weight:800;color:var(--text-primary)">' + myScore + ' — ' + theirScore + '</span>' +
            '</div>';
        container.appendChild(item);
    });
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════
function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val != null ? val : '-';
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
}
