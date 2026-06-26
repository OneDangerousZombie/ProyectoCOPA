// Datos precargados de jugadores
const PLAYERS_LIST = [
    "Brandon", "Rama", "Chanchi", "Loto", "Chapa", "Nico", "Chiwi", "Pipi",
    "Árbol", "Mateo", "Goofy", "Juanchi", "ByViruzz", "ColoPerez", "TobilED",
    "MyM", "Dylan", "Santi", "Diego", "Almidonte", "R1", "R2", "BautiTwink"
];

// Inicializar localStorage
function initLocalStorage() {
    if (!localStorage.getItem('players')) {
        const players = PLAYERS_LIST.map((name, index) => ({
            id: index,
            name: name,
            elo: 1200 + Math.floor(Math.random() * 500),
            stats: {
                matches: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goals: 0,
                assists: 0,
                points: 0
            },
            lastMatch: null
        }));
        localStorage.setItem('players', JSON.stringify(players));
    }
    
    if (!localStorage.getItem('matches')) {
        const exampleMatches = [
            {
                id: 1,
                date: "2024-03-15",
                venue: "Mega Fútbol",
                format: 6,
                fecha: "Fecha 7 Apertura",
                whiteTeam: ["Brandon", "Rama", "Chanchi", "Loto", "Chapa", "Nico"],
                blackTeam: ["Chiwi", "Pipi", "Árbol", "Mateo", "Goofy", "Juanchi"],
                whiteScore: 11,
                blackScore: 7,
                completed: true,
                events: [
                    { minute: 4, type: 'goal', player: 'Brandon', assist: 'Rama', team: 'white' },
                    { minute: 12, type: 'goal', player: 'Chanchi', assist: null, team: 'white' },
                    { minute: 18, type: 'goal', player: 'ByViruzz', assist: null, team: 'black' }
                ]
            }
        ];
        localStorage.setItem('matches', JSON.stringify(exampleMatches));
    }
    
    if (!localStorage.getItem('stats')) {
        const players = JSON.parse(localStorage.getItem('players'));
        const stats = players.map(player => ({
            playerId: player.id,
            playerName: player.name,
            goals: Math.floor(Math.random() * 30),
            assists: Math.floor(Math.random() * 20),
            matches: Math.floor(Math.random() * 30),
            wins: Math.floor(Math.random() * 15),
            draws: Math.floor(Math.random() * 5),
            losses: Math.floor(Math.random() * 10),
            points: Math.floor(Math.random() * 45),
            streak: Math.floor(Math.random() * 5) - 2
        }));
        localStorage.setItem('stats', JSON.stringify(stats));
    }
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
        // Simplificado: en producción se filtrarían estadísticas por fecha
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
initLocalStorage();