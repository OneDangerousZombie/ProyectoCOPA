// Eliminamos la constante PLAYERS_LIST estática.
const DB_PLAYERS_API = '../api/traerJugadores.php';

function fetchPlayersFromDb() {
    return fetch(DB_PLAYERS_API, { cache: 'no-store' })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Error al cargar jugadores desde el servidor: ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            if (!data.ok || !Array.isArray(data.jugadores)) {
                throw new Error('Respuesta de jugadores inválida');
            }
            return data.jugadores.map(function(player) {
                return {
                    name: player.nombre,
                    elo: parseInt(player.valor_elo, 10) || 1200
                };
            });
        });
}

function normalizePlayersFromDb(dbPlayers) {
    const existingPlayers = getPlayers();
    const existingByName = {};
    existingPlayers.forEach(function(player) {
        existingByName[player.name] = player;
    });

    const nextIdBase = existingPlayers.reduce(function(max, player) {
        return Math.max(max, typeof player.id === 'number' ? player.id : -1);
    }, -1) + 1;

    return dbPlayers.map(function(player, index) {
        const existing = existingByName[player.name];
        return {
            id: existing ? existing.id : nextIdBase + index,
            name: player.name,
            elo: player.elo || 1200,
            stats: existing && existing.stats ? existing.stats : {
                matches: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goals: 0,
                assists: 0,
                points: 0
            },
            lastMatch: existing ? existing.lastMatch : null
        };
    });
}

function ensureStatsForPlayers(players) {
    const stats = JSON.parse(localStorage.getItem('stats')) || [];
    const statsById = {};
    stats.forEach(function(stat) {
        statsById[stat.playerId] = stat;
    });

    const normalizedStats = players.map(function(player) {
        const existing = statsById[player.id];
        if (existing) {
            existing.playerName = player.name;
            return existing;
        }
        return {
            playerId: player.id,
            playerName: player.name,
            goals: 0,
            assists: 0,
            matches: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            points: 0,
            streak: 0
        };
    });

    localStorage.setItem('stats', JSON.stringify(normalizedStats));
}

function initLocalStorageFallback() {
    // Ya no inyectamos jugadores ni estadísticas falsas.
    // Solo aseguramos que las estructuras de datos existan para no romper el código.
    if (!localStorage.getItem('matches')) {
        localStorage.setItem('matches', JSON.stringify([]));
    }

    if (!localStorage.getItem('stats')) {
        localStorage.setItem('stats', JSON.stringify([]));
    }
}

function initializePlayerData() {
    initLocalStorageFallback();

    return fetchPlayersFromDb()
        .then(function(dbPlayers) {
            if (!Array.isArray(dbPlayers) || dbPlayers.length === 0) {
                throw new Error('Lista de jugadores vacía desde el servidor');
            }
            const players = normalizePlayersFromDb(dbPlayers);
            localStorage.setItem('players', JSON.stringify(players));
            ensureStatsForPlayers(players);

            return players;
        })
        .catch(function(error) {
            console.error('CRÍTICO: No se pudo cargar jugadores desde la base de datos:', error);
            // Retornamos el caché local (si existe) en caso de caída de red
            return getPlayers();
        });
}

// Obtener jugadores
function getPlayers() {
    return JSON.parse(localStorage.getItem('players')) || [];
}

// Actualizar jugador
function updatePlayer(playerId, updates) {
    const players = getPlayers();
    const index = players.findIndex(p => p.id === playerId);
    if (index !== -1) {
        players[index] = { ...players[index], ...updates };
        localStorage.setItem('players', JSON.stringify(players));
    }
}

// Obtener partidos
function getMatches() {
    return JSON.parse(localStorage.getItem('matches')) || [];
}

// Guardar partido
function saveMatch(match) {
    const matches = getMatches();
    match.id = Date.now();
    matches.unshift(match);
    localStorage.setItem('matches', JSON.stringify(matches));
}

// Obtener estadísticas
function getStats() {
    return JSON.parse(localStorage.getItem('stats')) || [];
}

// Actualizar estadísticas después de un partido
function updateStatsAfterMatch(match) {
    const stats = getStats();
    const players = getPlayers();
    
    // Actualizar estadísticas del equipo blanco
    match.whiteTeam.forEach(playerName => {
        const player = players.find(p => p.name === playerName);
        if (player) {
            const playerStats = stats.find(s => s.playerId === player.id);
            if (playerStats) {
                playerStats.matches++;
                if (match.whiteScore > match.blackScore) {
                    playerStats.wins++;
                    playerStats.points += 3;
                } else if (match.whiteScore === match.blackScore) {
                    playerStats.draws++;
                    playerStats.points += 1;
                } else {
                    playerStats.losses++;
                }
                
                // Contar goles del jugador en este partido
                const playerGoals = match.events.filter(e => e.player === playerName && e.type === 'goal').length;
                playerStats.goals += playerGoals;
                
                // Contar asistencias
                const playerAssists = match.events.filter(e => e.assist === playerName).length;
                playerStats.assists += playerAssists;
            }
        }
    });
    
    // Actualizar estadísticas del equipo negro
    match.blackTeam.forEach(playerName => {
        const player = players.find(p => p.name === playerName);
        if (player) {
            const playerStats = stats.find(s => s.playerId === player.id);
            if (playerStats) {
                playerStats.matches++;
                if (match.blackScore > match.whiteScore) {
                    playerStats.wins++;
                    playerStats.points += 3;
                } else if (match.blackScore === match.whiteScore) {
                    playerStats.draws++;
                    playerStats.points += 1;
                } else {
                    playerStats.losses++;
                }
                
                const playerGoals = match.events.filter(e => e.player === playerName && e.type === 'goal').length;
                playerStats.goals += playerGoals;
                
                const playerAssists = match.events.filter(e => e.assist === playerName).length;
                playerStats.assists += playerAssists;
            }
        }
    });
    
    localStorage.setItem('stats', JSON.stringify(stats));
    localStorage.setItem('players', JSON.stringify(players));
}

// Obtener estadísticas de un jugador específico
function getPlayerStats(playerName) {
    const players = getPlayers();
    const stats = getStats();
    const player = players.find(p => p.name === playerName);
    if (player) {
        const playerStats = stats.find(s => s.playerId === player.id);
        return { ...player, ...playerStats };
    }
    return null;
}

// Calcular puntos totales de un jugador
function calculatePlayerPoints(playerStats) {
    return (playerStats.wins * 3) + playerStats.draws;
}

// Obtener ranking ordenado
function getRanking(statType = 'points', fecha = 'all') {
    let stats = getStats();
    
    // Filtrar por fecha si es necesario
    if (fecha !== 'all') {
        const matches = getMatches();
        const fechaMatches = matches.filter(m => m.fecha === `Fecha ${fecha} Apertura`);
    }
    
    switch(statType) {
        case 'goals':
            stats.sort((a, b) => b.goals - a.goals);
            break;
        case 'assists':
            stats.sort((a, b) => b.assists - a.assists);
            break;
        case 'won':
            stats.sort((a, b) => b.wins - a.wins);
            break;
        case 'lost':
            stats.sort((a, b) => b.losses - a.losses);
            break;
        case 'draw':
            stats.sort((a, b) => b.draws - a.draws);
            break;
        case 'streak':
            stats.sort((a, b) => b.streak - a.streak);
            break;
        default:
            stats.sort((a, b) => b.points - a.points);
    }
    
    return stats;
}

// Inicializar datos
const dataReady = initializePlayerData();
window.dataReady = dataReady;