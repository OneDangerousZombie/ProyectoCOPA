document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterPlayers);
    }
});

var ligaPlayers = []; // Jugadores de la liga actual

function loadPlayers() {
    // Traer jugadores de la liga activa desde la API
    fetch('../api/traerJugadores.php', { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
            if (data.ok && Array.isArray(data.jugadores)) {
                ligaPlayers = data.jugadores.map(player => ({
                    id: player.id,
                    name: player.nombre,
                    elo: player.valor_elo,
                    role: player.rol,
                    avatar: player.avatar || ''
                }));
            } else {
                console.error('Error al cargar jugadores:', data.error);
                ligaPlayers = [];
            }
            renderPlayers(ligaPlayers);
        })
        .catch(err => {
            console.error('Error fetching players:', err);
            ligaPlayers = [];
        });
}

function renderPlayers(playersToRender) {
    const stats = getStats();
    const container = document.getElementById('playersContainer');
    if (!container) return;

    container.innerHTML = '<div class="players-grid"></div>';
    const grid = container.querySelector('.players-grid');

    playersToRender.forEach(player => {
        const playerStats = stats.find(s => s.playerId === player.id);
        grid.appendChild(buildCard(player, playerStats));
    });
}

function filterPlayers() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = ligaPlayers.filter(p => p.name.toLowerCase().includes(term));
    renderPlayers(filtered);
}

function buildCard(player, playerStats) {
    const avatarHtml = player.avatar
        ? `<img src="${player.avatar}" alt="Avatar de ${player.name}">`
        : '<i class="fa-solid fa-user"></i>';

    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
        <div class="player-avatar">${avatarHtml}</div>
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