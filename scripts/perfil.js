document.addEventListener('DOMContentLoaded', () => {
    console.log('🟢 DOM cargado. Iniciando script de perfil...');
    
    loadProfileData();
    loadMatchHistory(); 
});

function loadProfileData() {
    console.log('📋 PASO 1 (Perfil): Iniciando petición a perfil.php...');
    
    fetch('../api/perfil.php')
        .then(response => {
            console.log('📋 PASO 2 (Perfil): Respuesta recibida del servidor. Verificando estado...');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} al conectar con el servidor`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📋 PASO 3 (Perfil): Datos JSON obtenidos correctamente.', data);
            
            if (data.success) {
                console.log('✅ PASO 4 (Perfil): La respuesta indica éxito (data.success = true).');
                const sesion = data.sesion;
                const stats = data.estadisticas;

                console.log('📋 PASO 5 (Perfil): Inyectando datos de sesión en el DOM...');
                document.getElementById('profileName').textContent = sesion.NOMBRE;
                console.log(`   - Nombre de usuario "${sesion.NOMBRE}" inyectado.`);
                
                const avatarImg = document.getElementById('profileAvatar');
                if (avatarImg && sesion.AVATAR_URL) {
                    avatarImg.src = sesion.AVATAR_URL;
                    console.log('   - Avatar de usuario inyectado correctamente.');
                } else {
                    console.log('   - ⚠️ No se encontró avatar en los datos o el elemento no existe en el HTML.');
                }

                console.log('📋 PASO 6 (Perfil): Inyectando estadísticas base...');
                document.getElementById('profilePJ').textContent = stats.PARTIDOS_JUGADOS || 0;
                document.getElementById('profileGoles').textContent = stats.GOLES || 0;
                document.getElementById('profileAsistencias').textContent = stats.ASISTENCIAS || 0;
                console.log('   - Partidos jugados, goles y asistencias inyectados.');

                if(document.getElementById('profileRacha')) {
                    document.getElementById('profileRacha').textContent = stats.RACHA || 0;
                    console.log('   - Racha inyectada.');
                }

                console.log('📋 PASO 7 (Perfil): Calculando WinRate...');
                const jugados = parseInt(stats.PARTIDOS_JUGADOS) || 0;
                const ganados = parseInt(stats.PARTIDOS_GANADOS) || 0;
                
                const winRate = jugados > 0 
                    ? ((ganados / jugados) * 100).toFixed(1) 
                    : '0';
                document.getElementById('profileWinRate').textContent = `${winRate}%`;
                console.log(`✅ RESULTADO (Perfil): WinRate calculado en ${winRate}% (${ganados} victorias de ${jugados} partidos).`);

            } else {
                console.warn('⚠️ ADVERTENCIA (Perfil): El servidor conectó, pero devolvió un error lógico:', data.error);
                if (data.error === 'Usuario no autenticado') {
                    console.log('❌ ACCIÓN: Redirigiendo al usuario a login.html porque no hay sesión activa.');
                    window.location.href = 'login.html'; 
                }
            }
        })
        .catch(error => {
            console.error('🛑 ERROR CRÍTICO (Perfil): Hubo un problema en el flujo de loadProfileData:', error);
        });
}

function loadMatchHistory() {
    console.log('⚽ PASO 1 (Historial): Iniciando carga de historial de partidos...');
    
    const matches = typeof getMatches === 'function' ? getMatches() : [];
    console.log(`   - Se encontraron ${matches.length} partidos en total en la función getMatches().`);
    
    const container = document.getElementById('matchHistoryList');
    if (!container) {
        console.warn('⚠️ ADVERTENCIA (Historial): No se encontró el contenedor "matchHistoryList" en el DOM. Abortando historial.');
        return;
    }

    const userName = document.getElementById('profileName').textContent;
    console.log(`⚽ PASO 2 (Historial): Buscando partidos completados para el jugador: "${userName}"...`);

    const userMatches = matches.filter(m =>
        m.completed && (m.whiteTeam.includes(userName) || m.blackTeam.includes(userName))
    );
    console.log(`   - Filtrado exitoso: El jugador participó en ${userMatches.length} partidos completados.`);

    if (userMatches.length === 0) {
        console.log('✅ RESULTADO (Historial): El usuario no tiene partidos. Inyectando estado vacío.');
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div>No hay partidos registrados</div>';
        return;
    }

    console.log('⚽ PASO 3 (Historial): Generando tarjetas en el DOM (máximo 5)...');
    container.innerHTML = '';
    
    userMatches.slice(0, 5).forEach((match, index) => {
        const isInWhite = match.whiteTeam.includes(userName);
        const teamName  = isInWhite ? 'BLANCO' : 'NEGRO';
        const myScore   = isInWhite ? match.whiteScore : match.blackScore;
        const theirScore= isInWhite ? match.blackScore  : match.whiteScore;
        const won  = myScore > theirScore;
        const draw = myScore === theirScore;

        console.log(`   - Renderizando partido #${index + 1}: Equipo ${teamName} | Resultado: ${myScore}-${theirScore} | ¿Ganó?: ${won ? 'Sí' : (draw ? 'Empate' : 'No')}`);

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
    
    console.log('✅ FINAL: ¡Carga del historial de partidos completada con éxito!');
}