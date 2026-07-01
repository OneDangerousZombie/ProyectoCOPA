document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterPlayers);
    }
});

function loadPlayers() {
    const players  = getPlayers();
    const stats    = getStats();
    const container = document.getElementById('playersContainer');
    if (!container) return;

    container.innerHTML = '<div class="players-grid"></div>';
    const grid = container.querySelector('.players-grid');

    players.forEach(player => {
        const playerStats = stats.find(s => s.playerId === player.id);
        grid.appendChild(buildCard(player, playerStats));
    });
}

function filterPlayers() {
    const term     = document.getElementById('searchInput').value.toLowerCase();
    const players  = getPlayers();
    const stats    = getStats();
    const container = document.getElementById('playersContainer');
    if (!container) return;

    container.innerHTML = '<div class="players-grid"></div>';
    const grid = container.querySelector('.players-grid');

    players
        .filter(p => p.name.toLowerCase().includes(term))
        .forEach(p => {
            const playerStats = stats.find(s => s.playerId === p.id);
            grid.appendChild(buildCard(p, playerStats));
        });
}

function buildCard(player, playerStats) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
        <div class="player-avatar"><i class="fa-solid fa-user"></i></div>
        <div class="player-info">
            <div class="player-name">${player.name}</div>
            <div class="player-elo">ELO: ${player.elo}</div>
            <div class="player-last-match">${player.lastMatch || 'Sin partidos recientes'}</div>
        </div>
        <div class="player-stats-mini">
            <div class="player-games">${playerStats?.matches || 0}</div>
            <div class="player-games-label">PJ</div>
        </div>
    `;
    return card;
}