// ==================== ESTADO ====================
let state = {
    venue: '',
    matchInfo: '',
    format: 5,
    teamA: { name: 'BLANCO', players: [] },
    teamB: { name: 'NEGRO', players: [] },
    goals: [],
    substitutions: [],
    timer: { start: null, elapsed: 0, interval: null },
    currentGoal: { team: null, scorer: null, assist: null },
    currentSubstitution: { team: null, playerEnter: null, playerExit: null }
};

// ==================== NAVEGACIÓN ====================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ==================== CONFIGURACIÓN ====================
let selectedFormat = 5;

function selectFormat(n) {
    selectedFormat = n;
    document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('selected'));
    event.target.classList.add('selected');
    document.getElementById('formatLabel').textContent = '(' + n + ' vs ' + n + ')';
    validateStart();
}

function addPlayer() {
    const name = document.getElementById('playerInput').value.trim();
    const team = document.getElementById('teamSelect').value;
    if (!name) return;

    const player = { id: Date.now() + Math.random(), name, goals: 0, assists: 0 };
    if (team === 'A') state.teamA.players.push(player);
    else state.teamB.players.push(player);

    document.getElementById('playerInput').value = '';
    document.getElementById('playerInput').focus();
    renderPlayerLists();
    validateStart();
}

function removePlayer(id, team) {
    const arr = team === 'A' ? state.teamA.players : state.teamB.players;
    const idx = arr.findIndex(p => p.id === id);
    if (idx > -1) arr.splice(idx, 1);
    renderPlayerLists();
    validateStart();
}

function renderPlayerLists() {
    const render = (players, team) => players.map(p =>
        '<div class="player-item">' +
            '<span class="player-name">' + p.name + '</span>' +
            '<button class="remove-btn" onclick="removePlayer(' + p.id + ', \'' + team + '\')">×</button>' +
        '</div>'
    ).join('') || '<div style="color:#525252; font-size:0.85rem; padding:8px 0;">Sin jugadores</div>';

    document.getElementById('listA').innerHTML = render(state.teamA.players, 'A');
    document.getElementById('listB').innerHTML = render(state.teamB.players, 'B');
    document.getElementById('listAName').textContent = state.teamA.name || 'Equipo A';
    document.getElementById('listBName').textContent = state.teamB.name || 'Equipo B';
}

function validateStart() {
    const a = state.teamA.players.length;
    const b = state.teamB.players.length;
    const btn = document.getElementById('startBtn');
    btn.disabled = !(a >= 1 && b >= 1 && selectedFormat);
}

function startMatch() {
    state.format = selectedFormat;
    state.venue = document.getElementById('venueInput').value.trim() || 'MEGA FÚTBOL';
    state.matchInfo = document.getElementById('matchInfoInput').value.trim() || '';
    state.teamA.name = document.getElementById('teamAName').value.trim() || 'EQUIPO A';
    state.teamB.name = document.getElementById('teamBName').value.trim() || 'EQUIPO B';

    document.getElementById('scoreAName').textContent = state.teamA.name;
    document.getElementById('scoreBName').textContent = state.teamB.name;
    document.getElementById('goalTeamAName').textContent = state.teamA.name;
    document.getElementById('goalTeamBName').textContent = state.teamB.name;

    state.timer.start = Date.now();
    state.timer.interval = setInterval(updateTimer, 1000);

    showScreen('screen-match');
}

// ==================== TIMER ====================
function updateTimer() {
    const elapsed = Math.floor((Date.now() - state.timer.start) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = m + ':' + s;
}

function getMatchTime() {
    const elapsed = Math.floor((Date.now() - state.timer.start) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    return m + ':' + s;
}

// ==================== REGISTRAR CAMBIO ====================
function startSubstitution() {
    state.currentSubstitution = { team: null, playerEnter: null, playerExit: null };
    showScreen('screen-substitution-team');
}

function selectSubTeam(team) {
    state.currentSubstitution.team = team;
    const players = team === 'A' ? state.teamA.players : state.teamB.players;
    const grid = document.getElementById('enterGrid');
    grid.innerHTML = players.map(p =>
        '<button class="player-btn" onclick="selectSubEnter(' + p.id + ', this)">' + p.name + '</button>'
    ).join('');
    showScreen('screen-substitution-enter');
}

function selectSubEnter(playerId, btn) {
    document.querySelectorAll('#enterGrid .player-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.currentSubstitution.playerExit = playerId;

    setTimeout(() => {
        const oppositeTeam = state.currentSubstitution.team === 'A' ? state.teamB : state.teamA;
        const grid = document.getElementById('exitGrid');
        grid.innerHTML = oppositeTeam.players.map(p =>
            '<button class="player-btn" onclick="selectSubExit(' + p.id + ', this)">' + p.name + '</button>'
        ).join('');
        showScreen('screen-substitution-exit');
    }, 150);
}

function selectSubExit(playerId, btn) {
    document.querySelectorAll('#exitGrid .player-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.currentSubstitution.playerEnter = playerId;

    setTimeout(() => {
        registerSubstitution();
    }, 150);
}

function registerSubstitution() {
    const fromTeam = state.currentSubstitution.team === 'A' ? state.teamA : state.teamB;
    const toTeam = state.currentSubstitution.team === 'A' ? state.teamB : state.teamA;

    const playerExit = fromTeam.players.find(p => p.id === state.currentSubstitution.playerExit);
    const playerEnter = toTeam.players.find(p => p.id === state.currentSubstitution.playerEnter);

    if (!playerExit || !playerEnter) {
        updateScoreboard();
        showScreen('screen-match');
        return;
    }

    // Mover objetos entre equipos para que futuros eventos usen el nuevo equipo
    fromTeam.players = fromTeam.players.filter(p => p.id !== playerExit.id);
    toTeam.players = toTeam.players.filter(p => p.id !== playerEnter.id);
    fromTeam.players.push(playerEnter);
    toTeam.players.push(playerExit);

    state.substitutions.push({
        team: state.currentSubstitution.team,
        playerEnter: playerEnter.name,
        playerEnterId: playerEnter.id,
        playerExit: playerExit.name,
        playerExitId: playerExit.id,
        time: getMatchTime()
    });

    renderPlayerLists();
    updateScoreboard();
    showScreen('screen-match');
}

// ==================== REGISTRAR GOL ====================
function startGoal() {
    state.currentGoal = { team: null, scorer: null, assist: null };
    showScreen('screen-goal-team-select');
}

function selectGoalTeam(team) {
    state.currentGoal.team = team;
    const players = team === 'A' ? state.teamA.players : state.teamB.players;
    const grid = document.getElementById('scorerGrid');
    grid.innerHTML = players.map(p =>
        '<button class="player-btn" onclick="selectScorer(' + p.id + ', this)">' + p.name + '</button>'
    ).join('');
    showScreen('screen-goal-scorer');
}

function selectScorer(playerId, btn) {
    document.querySelectorAll('#scorerGrid .player-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.currentGoal.scorer = playerId;

    setTimeout(() => {
        const team = state.currentGoal.team === 'A' ? state.teamA : state.teamB;
        const scorer = team.players.find(p => p.id === playerId);
        const others = team.players.filter(p => p.id !== playerId);

        const grid = document.getElementById('assistGrid');
        grid.innerHTML =
            '<button class="assist-btn no-assist-btn" onclick="selectAssist(null, this)">Sin asistencia</button>' +
            others.map(p =>
                '<button class="assist-btn" onclick="selectAssist(' + p.id + ', this)">' + p.name + '</button>'
            ).join('');
        showScreen('screen-goal-assist');
    }, 150);
}

function selectAssist(playerId, btn) {
    document.querySelectorAll('#assistGrid .assist-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.currentGoal.assist = playerId;

    setTimeout(() => {
        registerGoal();
    }, 150);
}

function registerGoal() {
    const team = state.currentGoal.team === 'A' ? state.teamA : state.teamB;
    const scorer = team.players.find(p => p.id === state.currentGoal.scorer);
    const assist = state.currentGoal.assist ? team.players.find(p => p.id === state.currentGoal.assist) : null;

    scorer.goals++;
    if (assist) assist.assists++;

    state.goals.push({
        team: state.currentGoal.team,
        scorer: scorer.name,
        scorerId: scorer.id,
        assist: assist ? assist.name : null,
        assistId: assist ? assist.id : null,
        time: getMatchTime()
    });

    updateScoreboard();
    showScreen('screen-match');
}

function updateScoreboard() {
    const aGoals = state.goals.filter(g => g.team === 'A').length;
    const bGoals = state.goals.filter(g => g.team === 'B').length;
    const assists = state.goals.filter(g => g.assist).length;

    document.getElementById('scoreA').textContent = aGoals;
    document.getElementById('scoreB').textContent = bGoals;
    document.getElementById('totalGoals').textContent = state.goals.length;
    document.getElementById('totalAssists').textContent = assists;

    const list = document.getElementById('summaryList');
    
    // Combinar goles y cambios ordenados por tiempo
    const allEvents = [];
    state.goals.forEach(g => {
        allEvents.push({ type: 'goal', ...g });
    });
    state.substitutions.forEach(s => {
        allEvents.push({ type: 'substitution', ...s });
    });
    allEvents.sort((a, b) => {
        const timeA = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
        const timeB = parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1]);
        return timeB - timeA;
    });

    if (allEvents.length === 0) {
        list.innerHTML = '<div style="color:#525252; text-align:center; padding:20px;">Sin eventos registrados</div>';
    } else {
        list.innerHTML = allEvents.map(e => {
            if (e.type === 'goal') {
                const teamName = e.team === 'A' ? state.teamA.name : state.teamB.name;
                const assistText = e.assist ? ' (asist: ' + e.assist + ')' : '';
                return '<div class="summary-item">' +
                    '<span class="time">' + e.time + '</span> — ' + teamName + ': <strong>' + e.scorer + ' ⚽</strong>' + assistText +
                '</div>';
            } else if (e.type === 'substitution') {
                const teamName = e.team === 'A' ? state.teamA.name : state.teamB.name;
                return '<div class="summary-item">' +
                    '<span class="time">' + e.time + '</span> — ' + teamName + ': <strong>' + e.playerEnter + '</strong> entra, sale <strong>' + e.playerExit + '</strong> 🔄' +
                '</div>';
            }
        }).join('');
    }
}

function undoLast() {
    // Encuentra el último evento (gol o cambio)
    let lastGoalTime = state.goals.length > 0 ? 
        (parseInt(state.goals[state.goals.length-1].time.split(':')[0]) * 60 + parseInt(state.goals[state.goals.length-1].time.split(':')[1])) : -1;
    let lastSubTime = state.substitutions.length > 0 ? 
        (parseInt(state.substitutions[state.substitutions.length-1].time.split(':')[0]) * 60 + parseInt(state.substitutions[state.substitutions.length-1].time.split(':')[1])) : -1;

    if (lastGoalTime === -1 && lastSubTime === -1) return;

    if (lastGoalTime >= lastSubTime) {
        // Deshacer último gol
        const last = state.goals.pop();
        const team = last.team === 'A' ? state.teamA : state.teamB;
        const scorer = team.players.find(p => p.id === last.scorerId);
        if (scorer) scorer.goals--;
        if (last.assistId) {
            const assist = team.players.find(p => p.id === last.assistId);
            if (assist) assist.assists--;
        }
    } else {
        // Deshacer último cambio y revertir los equipos
        const lastSub = state.substitutions.pop();
        if (lastSub) {
            const fromTeam = lastSub.team === 'A' ? state.teamA : state.teamB;
            const toTeam = lastSub.team === 'A' ? state.teamB : state.teamA;
            const playerEnter = fromTeam.players.find(p => p.id === lastSub.playerEnterId);
            const playerExit = toTeam.players.find(p => p.id === lastSub.playerExitId);
            if (playerEnter && playerExit) {
                fromTeam.players = fromTeam.players.filter(p => p.id !== playerEnter.id);
                toTeam.players = toTeam.players.filter(p => p.id !== playerExit.id);
                fromTeam.players.push(playerExit);
                toTeam.players.push(playerEnter);
                renderPlayerLists();
            }
        }
    }
    
    updateScoreboard();
}

// ==================== NAVEGACIÓN ATRÁS ====================
function backToMatch() {
    showScreen('screen-match');
}
function backToSubTeam() {
    showScreen('screen-substitution-team');
}
function backToSubEnter() {
    showScreen('screen-substitution-enter');
}
function backToGoalTeam() {
    showScreen('screen-goal-team-select');
}
function backToScorer() {
    showScreen('screen-goal-scorer');
}


// ==================== FINALIZAR ====================
function finishMatch() {
    clearInterval(state.timer.interval);

    document.getElementById('finalAName').textContent = state.teamA.name;
    document.getElementById('finalBName').textContent = state.teamB.name;
    document.getElementById('finalAScore').textContent = state.goals.filter(g => g.team === 'A').length;
    document.getElementById('finalBScore').textContent = state.goals.filter(g => g.team === 'B').length;

    // Stats
    const allPlayers = [...state.teamA.players, ...state.teamB.players];
    const statsHtml = allPlayers.sort((a,b) => (b.goals+b.assists) - (a.goals+a.assists)).map(p => {
        const g = p.goals > 0 ? (p.goals + 'gol' + (p.goals>1 ? 'es' : '')) : '';
        const a = p.assists > 0 ? (p.assists + 'asist') : '';
        const parts = [g,a].filter(Boolean);
        return parts.length ? '<div style="padding:6px 0; border-bottom:1px solid #262626;">' +
            '<strong>' + p.name + '</strong> <span style="color:#a3a3a3; font-size:0.85rem;">(' + parts.join(' ') + ')</span>' +
        '</div>' : '';
    }).join('') || '<div style="color:#525252;">Sin estadísticas</div>';
    document.getElementById('finalStats').innerHTML = statsHtml;

    // Summary
    const allEvents = [];
    state.goals.forEach(g => {
        allEvents.push({ type: 'goal', ...g });
    });
    state.substitutions.forEach(s => {
        allEvents.push({ type: 'substitution', ...s });
    });
    allEvents.sort((a, b) => {
        const timeA = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
        const timeB = parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1]);
        return timeA - timeB;
    });

    const summaryHtml = allEvents.map(e => {
        if (e.type === 'goal') {
            const teamName = e.team === 'A' ? state.teamA.name : state.teamB.name;
            const assistText = e.assist ? (' (' + e.assist + ' asist)') : '';
            return '<div style="padding:4px 0; font-size:0.9rem; color:#d4d4d4;">' +
                '<span style="color:#fbbf24;">' + e.time + '</span> ' + teamName + ': ' + e.scorer + ' ⚽' + assistText +
            '</div>';
        } else if (e.type === 'substitution') {
            const teamName = e.team === 'A' ? state.teamA.name : state.teamB.name;
            return '<div style="padding:4px 0; font-size:0.9rem; color:#d4d4d4;">' +
                '<span style="color:#fbbf24;">' + e.time + '</span> ' + teamName + ': ' + e.playerEnter + ' entra, sale ' + e.playerExit + ' 🔄' +
            '</div>';
        }
    }).join('') || '<div style="color:#525252;">Sin eventos</div>';
    document.getElementById('finalSummary').innerHTML = summaryHtml;

    showScreen('screen-finish');
}

// ==================== DESCARGAR TXT ====================
function downloadResult() {
    const date = new Date();
    const dateStr = date.getDate() + '/' + (date.getMonth()+1);
    const aScore = state.goals.filter(g => g.team === 'A').length;
    const bScore = state.goals.filter(g => g.team === 'B').length;

    // Header dinámico
    let txt = '';
    if (state.venue) txt += state.venue + ' ';
    if (state.matchInfo) txt += state.matchInfo + '\n';
    //if (txt) txt += ' ';

    txt += state.teamA.name + ' - ' + aScore + '\n\n';
    state.teamA.players.forEach(p => {
        if (p.goals > 0 || p.assists > 0) {
            const g = p.goals > 0 ? (p.goals + 'gol' + (p.goals>1 ? 'es' : '')) : '';
            const a = p.assists > 0 ? (p.assists + 'asist') : '';
            const parts = [g,a].filter(Boolean);
            txt += p.name + ' (' + parts.join(' ') + ')\n';
        } else {
            txt += p.name + ' (-)\n';
        }
    });

    txt += '\n' + state.teamB.name + ' - ' + bScore + '\n\n';
    state.teamB.players.forEach(p => {
        if (p.goals > 0 || p.assists > 0) {
            const g = p.goals > 0 ? (p.goals + 'gol' + (p.goals>1 ? 'es' : '')) : '';
            const a = p.assists > 0 ? (p.assists + 'asist') : '';
            const parts = [g,a].filter(Boolean);
            txt += p.name + ' (' + parts.join(' ') + ')\n';
        } else {
            txt += p.name + ' (-)\n';
        }
    });

    // Eventos cronológicos con formato de línea de tiempo
    const allEvents = [];
    state.goals.forEach(g => {
        allEvents.push({ type: 'goal', ...g });
    });
    state.substitutions.forEach(s => {
        allEvents.push({ type: 'substitution', ...s });
    });
    allEvents.sort((a, b) => {
        const timeA = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
        const timeB = parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1]);
        return timeA - timeB;
    });

    if (allEvents.length > 0) {
        txt += '================================\n' +
               '         EVENTOS DEL PARTIDO    \n' +
               '================================\n\n';

        const colWidth = 30;
        const timeWidth = 6;

        allEvents.forEach(e => {
            const timeStr = e.time + "'";
            
            if (e.type === 'goal') {
                const isA = e.team === 'A';
                const scorerText = e.scorer + ' GOL';
                const assistText = e.assist ? ('(ASISTE ' + e.assist + ')') : '';

                if (isA) {
                    const leftPad = scorerText.padEnd(colWidth, ' ');
                    const timePad = timeStr.padStart(timeWidth, ' ');
                    const rightPad = ''.padStart(colWidth, ' ');
                    txt += leftPad + ' ' + timePad + ' ' + rightPad + '\n';

                    if (assistText) {
                        const leftPad2 = assistText.padEnd(colWidth, ' ');
                        const timePad2 = ''.padStart(timeWidth, ' ');
                        const rightPad2 = ''.padStart(colWidth, ' ');
                        txt += leftPad2 + ' ' + timePad2 + ' ' + rightPad2 + '\n';
                    }
                } else {
                    const leftPad = ''.padEnd(colWidth, ' ');
                    const timePad = timeStr.padStart(timeWidth, ' ');
                    const rightPad = scorerText.padStart(colWidth, ' ');
                    txt += leftPad + ' ' + timePad + ' ' + rightPad + '\n';

                    if (assistText) {
                        const leftPad2 = ''.padEnd(colWidth, ' ');
                        const timePad2 = ''.padStart(timeWidth, ' ');
                        const rightPad2 = assistText.padStart(colWidth, ' ');
                        txt += leftPad2 + ' ' + timePad2 + ' ' + rightPad2 + '\n';
                    }
                }
            } else if (e.type === 'substitution') {
                const isA = e.team === 'A';
                const subText = e.playerEnter + ' entra, sale ' + e.playerExit;

                if (isA) {
                    const leftPad = subText.padEnd(colWidth, ' ');
                    const timePad = timeStr.padStart(timeWidth, ' ');
                    const rightPad = ''.padStart(colWidth, ' ');
                    txt += leftPad + ' ' + timePad + ' ' + rightPad + '\n';
                } else {
                    const leftPad = ''.padEnd(colWidth, ' ');
                    const timePad = timeStr.padStart(timeWidth, ' ');
                    const rightPad = subText.padStart(colWidth, ' ');
                    txt += leftPad + ' ' + timePad + ' ' + rightPad + '\n';
                }
            }
        });
        txt += '\n';
    }

    txt += '\n' + date.toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'});

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'partido_' + state.teamA.name + '_vs_' + state.teamB.name + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== NUEVO PARTIDO ====================
function newMatch() {
    state = {
        venue: '',
        matchInfo: '',
        format: 5,
        teamA: { name: 'BLANCO', players: [] },
        teamB: { name: 'NEGRO', players: [] },
        goals: [],
        substitutions: [],
        timer: { start: null, elapsed: 0, interval: null },
        currentGoal: { team: null, scorer: null, assist: null },
        currentSubstitution: { team: null, playerEnter: null, playerExit: null }
    };
    document.getElementById('venueInput').value = 'MEGA FÚTBOL - Cancha 3';
    document.getElementById('matchInfoInput').value = 'FECHA 7 Jornada 5 Apertura';
    document.getElementById('teamAName').value = 'BLANCO';
    document.getElementById('teamBName').value = 'NEGRO';
    document.getElementById('playerInput').value = '';
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('scoreA').textContent = '0';
    document.getElementById('scoreB').textContent = '0';
    document.getElementById('totalGoals').textContent = '0';
    document.getElementById('totalAssists').textContent = '0';
    document.getElementById('summaryList').innerHTML = '<div style="color:#525252; text-align:center; padding:20px;">Sin goles registrados</div>';
    document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('formatLabel').textContent = '';
    renderPlayerLists();
    validateStart();
    showScreen('screen-config');
}

// ==================== INIT ====================
selectFormat(5);
renderPlayerLists();

// Enter en input de jugador
document.getElementById('playerInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addPlayer();
});