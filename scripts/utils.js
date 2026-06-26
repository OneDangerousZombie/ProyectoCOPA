// Funciones utilitarias generales

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? 'var(--green-primary)' : '#ff4444'};
        color: black;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-md);
        font-weight: 600;
        z-index: 2000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Función para calcular ELO después de un partido
function calculateELO(playerElo, opponentElo, score, expectedScore) {
    const K = 32;
    return playerElo + K * (score - expectedScore);
}

// Función para obtener el ranking formateado
function getFormattedRanking(limit = 10) {
    const ranking = getRanking();
    return ranking.slice(0, limit);
}

// Función para validar que un partido está completo
function isMatchComplete(match) {
    const requiredPlayers = match.format * 2;
    const totalPlayers = match.whiteTeam.length + match.blackTeam.length;
    return totalPlayers === requiredPlayers;
}

// Función para obtener estadísticas de un equipo
function getTeamStats(teamPlayers, match) {
    const stats = {
        goals: 0,
        assists: 0,
        players: []
    };
    
    match.events.forEach(event => {
        if (event.type === 'goal') {
            if (teamPlayers.includes(event.player)) {
                stats.goals++;
                if (event.assist && teamPlayers.includes(event.assist)) {
                    stats.assists++;
                }
            }
        }
    });
    
    return stats;
}