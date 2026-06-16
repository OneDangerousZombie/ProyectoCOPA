let currentUser = "Brandon";

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadMatchHistory();
});

function loadProfile() {
    const playerStats = getPlayerStats(currentUser);
    if (playerStats) {
        document.getElementById('profileName').textContent = playerStats.name;
        document.getElementById('profileElo').textContent = `⚡ ELO: ${playerStats.elo}`;
        document.getElementById('profilePJ').textContent = playerStats.matches || 0;
        document.getElementById('profileGoles').textContent = playerStats.goals || 0;
        document.getElementById('profileAsistencias').textContent = playerStats.assists || 0;
        const winRate = playerStats.matches > 0
            ? ((playerStats.wins / playerStats.matches) * 100).toFixed(1)
            : '0';
        document.getElementById('profileWinRate').textContent = `${winRate}%`;
    }
}

function loadMatchHistory() {
    const matches = getMatches();
    const container = document.getElementById('matchHistoryList');
    if (!container) return;

    const userMatches = matches.filter(m =>
        m.completed && (m.whiteTeam.includes(currentUser) || m.blackTeam.includes(currentUser))
    );

    if (userMatches.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div>No hay partidos registrados</div>';
        return;
    }

    container.innerHTML = '';
    userMatches.slice(0, 5).forEach(match => {
        const isInWhite = match.whiteTeam.includes(currentUser);
        const teamName  = isInWhite ? 'BLANCO' : 'NEGRO';
        const myScore   = isInWhite ? match.whiteScore : match.blackScore;
        const theirScore= isInWhite ? match.blackScore  : match.whiteScore;
        const won  = myScore > theirScore;
        const draw = myScore === theirScore;

        const item = document.createElement('div');
        item.className = `history-item${won ? '' : draw ? ' draw' : ' loss'}`;
        item.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:0.8rem;color:var(--text-tertiary)">${match.fecha}</span>
                <span style="font-size:0.78rem;font-weight:700;color:${won ? 'var(--green-primary)' : draw ? '#f59e0b' : '#ef4444'}">
                    ${won ? '✓ Victoria' : draw ? '= Empate' : '✗ Derrota'}
                </span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.3rem">
                <span style="font-size:0.875rem;font-weight:600">${teamName}</span>
                <span style="font-size:1rem;font-weight:800;color:var(--text-primary)">${myScore} — ${theirScore}</span>
            </div>
        `;
        container.appendChild(item);
    });
}
