let npState = {
    format:     0,
    team1:      [],
    team2:      [],
    allPlayers: [],
    canchas:    []
};

// ── Helpers ─────────────────────────────────────────────────
function loadPlayersFromApi() {
    return Promise.resolve(typeof dataReady !== 'undefined' ? dataReady : Promise.reject(new Error('dataReady no definido')))
        .then(function() {
            const players = getPlayersByRole(1);
            if (!Array.isArray(players) || players.length === 0) {
                throw new Error('No hay jugadores disponibles en la caché de DB con rol 1');
            }
            return players.map(function(player) {
                return {
                    name: player.name,
                    elo: player.elo,
                    isNew: false
                };
            });
        })
        .catch(function(error) {
            console.warn('Fallback directo a la API en nuevo-partido:', error);
            return fetch('../api/traerJugadores.php')
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('Error al cargar jugadores (Status HTTP no OK)');
                    }
                    return response.json();
                })
                .then(function(data) {
                    if (!data.ok || !Array.isArray(data.jugadores)) {
                        throw new Error('Respuesta inválida de la base de datos');
                    }
                    return data.jugadores
                        .filter(function(player) {
                            return String(player.rol) === '1';
                        })
                        .map(function(player) {
                            return {
                                name: player.nombre,
                                elo: player.valor_elo,
                                isNew: false
                            };
                        });
                });
        });
}

function loadCanchasFromApi() {
    return fetch('../api/traerCanchas.php')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Error al cargar canchas: HTTP ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            if (!data.ok || !Array.isArray(data.canchas)) {
                throw new Error('Respuesta inválida de canchas');
            }
            npState.canchas = data.canchas;
            renderCanchaOptions(data.canchas);
            return data.canchas;
        });
}

function renderCanchaOptions(canchas) {
    var select = document.getElementById('npVenue');
    if (!select) return;

    var html = '<option value="">Seleccioná una cancha</option>';
    select.innerHTML = html + canchas.map(function(cancha) {
        var labelText = cancha.nombre;
        if (cancha.direccion) {
            labelText += ' — ' + cancha.direccion;
        }
        return '<option value="' + cancha.id + '">' + labelText + '</option>';
    }).join('');
}

function getSelectedCancha() {
    var select = document.getElementById('npVenue');
    if (!select) {
        return { id: null, label: '' };
    }
    var value = select.value;
    var id = parseInt(value, 10);
    var label = select.selectedOptions && select.selectedOptions[0] ? select.selectedOptions[0].textContent.trim() : '';
    return { id: isNaN(id) ? null : id, label: label };
}

// ── Init ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('npDate').value = today;

    var now  = new Date();
    var mins = now.getMinutes() >= 30 ? 30 : 0;
    document.getElementById('npTime').value = pad(now.getHours()) + ':' + pad(mins);

    loadPlayersFromApi()
        .then(function(players) {
            npState.allPlayers = players;
            renderPlayerList();
            validateForm();
        })
        .catch(function(error) {
            console.error('Error cargando jugadores en nuevo-partido:', error.message);
            npState.allPlayers = [];
            renderPlayerList();
            validateForm();
        });

    loadCanchasFromApi()
        .catch(function(error) {
            console.warn('Error cargando canchas en nuevo-partido:', error.message);
            var select = document.getElementById('npVenue');
            if (select) select.innerHTML = '<option value="">No se pudieron cargar las canchas</option>';
            validateForm();
        });

    document.querySelectorAll('.format-btn').forEach(function(btn) {
        btn.onclick = function() {
            npState.format = parseInt(this.dataset.format);
            document.querySelectorAll('.format-btn').forEach(function(b) {
                b.classList.remove('selected');
            });
            this.classList.add('selected');
            renderPlayerList();
            validateForm();
        };
    });

    ['npDate','npTime','npVenue','npTeam1Name','npTeam2Name'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            var eventName = el.tagName === 'SELECT' ? 'change' : 'input';
            el.addEventListener(eventName, validateForm);
        }
    });

    document.getElementById('newPlayerInput').onkeypress = function(e) {
        if (e.key === 'Enter') addNewPlayer();
    };

    // ── Agregados de la combinación con crear-partido.js ──────
    document.getElementById('balanceTeamsBtn')?.addEventListener('click', balanceTeams);
    document.getElementById('addGuestBtn')?.addEventListener('click', addGuestPlaceholder);

    renderPlayerList();
    validateForm();
});

function pad(n) { return String(n).padStart(2,'0'); }

// ── Agregar jugador nuevo temporalmente ─────────────────────
function addNewPlayer() {
    var input = document.getElementById('newPlayerInput');
    var name  = input.value.trim();
    if (!name) return;

    var exists = npState.allPlayers.find(function(p) {
        return p.name.toLowerCase() === name.toLowerCase();
    });

    if (exists) {
        // Asumiendo que tienes una función showToast definida globalmente
        if (typeof showToast === 'function') {
            showToast('Ese jugador ya está en la lista', 'error');
        } else {
            alert('Ese jugador ya está en la lista');
        }
        input.value = '';
        return;
    }

    npState.allPlayers.unshift({ name: name, elo: null, isNew: true });
    input.value = '';
    renderPlayerList();
    validateForm();
}

// ── Agregar invitado (placeholder, sin función todavía) ──────
// Pedido explícito: un botón visible que por ahora no hace nada real,
// distinto de "Agregar jugador nuevo" (que sí funciona y se deja igual).
function addGuestPlaceholder() {
    if (typeof showToast === 'function') {
        showToast('Agregar invitado: próximamente', 'error');
    }
}

// ── Asignar jugador ─────────────────────────────────────────
function assignPlayer(name, team) {
    if (team === 1) {
        if (npState.team1.indexOf(name) !== -1) {
            npState.team1 = npState.team1.filter(function(p) { return p !== name; });
        } else {
            npState.team2 = npState.team2.filter(function(p) { return p !== name; });
            npState.team1.push(name);
        }
    } else {
        if (npState.team2.indexOf(name) !== -1) {
            npState.team2 = npState.team2.filter(function(p) { return p !== name; });
        } else {
            npState.team1 = npState.team1.filter(function(p) { return p !== name; });
            npState.team2.push(name);
        }
    }
    renderPlayerList();
    validateForm();
}

// ── Balancear equipos por ELO (combinado desde crear-partido.js) ──
// Toma los jugadores YA asignados a algún equipo (team1 + team2) y los
// redistribuye parejos según ELO, igual que balanceTeams() en
// crear-partido.js, adaptado a la forma de npState.
function balanceTeams() {
    var combined = npState.team1.concat(npState.team2);
    if (combined.length === 0) {
        if (typeof showToast === 'function') showToast('Asigná jugadores a algún equipo primero', 'error');
        return;
    }

    var sorted = combined
        .map(function(name) {
            return npState.allPlayers.find(function(p) { return p.name === name; }) || { name: name, elo: 1000 };
        })
        .sort(function(a, b) { return (b.elo || 1000) - (a.elo || 1000); });

    npState.team1 = [];
    npState.team2 = [];
    sorted.forEach(function(player, i) {
        if (i % 2 === 0) npState.team1.push(player.name);
        else             npState.team2.push(player.name);
    });

    renderPlayerList();
    validateForm();
    if (typeof showToast === 'function') showToast('Equipos balanceados por ELO');
}

// ── Quitar jugador ──────────────────────────────────────────
function removePlayer(name) {
    npState.allPlayers = npState.allPlayers.filter(function(p) { return p.name !== name; });
    npState.team1      = npState.team1.filter(function(p) { return p !== name; });
    npState.team2      = npState.team2.filter(function(p) { return p !== name; });
    renderPlayerList();
    validateForm();
}

// ── Render ──────────────────────────────────────────────────
function renderPlayerList() {
    var container = document.getElementById('playersAssignList');
    var t1Name = (document.getElementById('npTeam1Name').value.trim() || 'Eq.1').substring(0, 7);
    var t2Name = (document.getElementById('npTeam2Name').value.trim() || 'Eq.2').substring(0, 7);

    if (npState.allPlayers.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);font-size:0.83rem;padding:1rem 0">Agregá jugadores arriba</div>';
        updateStatus();
        return;
    }

    container.innerHTML = npState.allPlayers.map(function(p) {
        var inT1     = npState.team1.indexOf(p.name) !== -1;
        var inT2     = npState.team2.indexOf(p.name) !== -1;
        var rowClass = inT1 ? 'assigned-1' : inT2 ? 'assigned-2' : '';
        var eloText  = p.elo ? 'ELO ' + p.elo : 'Nuevo';
        var safe     = p.name.replace(/'/g, "\\'");

        return '<div class="player-assign-row ' + rowClass + '">' +
            '<span class="player-assign-name">' + p.name + '</span>' +
            '<span class="player-assign-elo">' + eloText + '</span>' +
            '<div class="player-assign-btns">' +
                '<button type="button" class="assign-btn ' + (inT1 ? 'btn-t1-active' : 'btn-t1-inactive') + '" ' +
                    'onclick="assignPlayer(\'' + safe + '\', 1)">' +
                    (inT1 ? '✓ ' : '') + t1Name +
                '</button>' +
                '<button type="button" class="assign-btn ' + (inT2 ? 'btn-t2-active' : 'btn-t2-inactive') + '" ' +
                    'onclick="assignPlayer(\'' + safe + '\', 2)">' +
                    (inT2 ? '✓ ' : '') + t2Name +
                '</button>' +
                '<button type="button" class="remove-player-btn" onclick="removePlayer(\'' + safe + '\')">×</button>' +
            '</div>' +
        '</div>';
    }).join('');

    updateStatus();
}

function updateStatus() {
    var t1  = npState.team1.length;
    var t2  = npState.team2.length;
    var req = npState.format || 0;

    document.getElementById('team1Count').textContent = t1;
    document.getElementById('team2Count').textContent = t2;

    var pct = req > 0 ? Math.min(((t1 + t2) / (req * 2)) * 100, 100) : 0;
    document.getElementById('progressFill').style.width = pct + '%';

    var msg = '';
    if (!req)          msg = 'Elegí un formato primero';
    else if (t1 < req) msg = 'Faltan ' + (req - t1) + ' en equipo 1';
    else if (t2 < req) msg = 'Faltan ' + (req - t2) + ' en equipo 2';
    else               msg = '✓ ' + t1 + ' vs ' + t2 + ' — listos para jugar';
    document.getElementById('playersStatusText').textContent = msg;
}

// ── Validar ─────────────────────────────────────────────────
function validateForm() {
    var date   = document.getElementById('npDate').value;
    var cancha = getSelectedCancha();
    var fmt    = npState.format;
    var t1ok   = fmt > 0 && npState.team1.length >= fmt;
    var t2ok   = fmt > 0 && npState.team2.length >= fmt;
    var ready  = date && cancha.id && fmt && t1ok && t2ok;

    document.getElementById('npSaveBtn').disabled = !ready;

    var info = '';
    if      (!date)        info = 'Seleccioná una fecha';
    else if (!cancha.id)   info = 'Seleccioná una cancha';
    else if (!fmt)         info = 'Elegí el formato del partido';
    else if (!t1ok)        info = 'Faltan ' + (fmt - npState.team1.length) + ' jugadores en equipo 1';
    else if (!t2ok)        info = 'Faltan ' + (fmt - npState.team2.length) + ' jugadores en equipo 2';
    else                   info = '¡Todo listo para jugar!';
    document.getElementById('npCtaInfo').textContent = info;
}

// ── Guardar e iniciar ────────────────────────────────────────
// CAMBIO CLAVE de la combinación: antes redirigía directo a
// anotador.html. Ahora el partido queda guardado como pendiente
// (ya se guardaba con completed:false) y se vuelve a crear-partido.html,
// donde loadUpcomingMatches() (en crear-partido.js, sin tocar) ya lo
// va a mostrar automáticamente con sus botones de "Ver equipos" e
// "Iniciar" (este último sí lleva a anotador.html cuando corresponda).
function saveAndStart() {
    var date    = document.getElementById('npDate').value;
    var time    = document.getElementById('npTime').value;
    var cancha  = getSelectedCancha();
    var t1Name  = document.getElementById('npTeam1Name').value.trim() || 'BLANCO';
    var t2Name  = document.getElementById('npTeam2Name').value.trim() || 'NEGRO';

    var dateObj   = new Date(date + 'T12:00:00');
    var dateStr   = dateObj.toLocaleDateString('es-AR', { weekday:'short', day:'numeric', month:'short' });
    var fechaLabel = dateStr + (time ? ' ' + time : '') + ' — ' + cancha.label;

    var newMatch = {
        id:          Date.now(),
        date:        date,
        time:        time,
        venue:       cancha.label,
        canchaId:    cancha.id,
        format:      npState.format,
        fecha:       fechaLabel,
        team1Name:   t1Name,
        team2Name:   t2Name,
        whiteTeam:   npState.team1,
        blackTeam:   npState.team2,
        whiteScore:  0,
        blackScore:  0,
        completed:   false,
        events:      []
    };

    saveMatch(newMatch);

    if (typeof showToast === 'function') showToast('Partido creado, queda pendiente de iniciar');

    window.location.href = 'crear-partido.html';
}