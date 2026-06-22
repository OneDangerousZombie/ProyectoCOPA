function handleLogin() {
    window.location.href = 'pages/league-selection.html';
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleLogin();
});
