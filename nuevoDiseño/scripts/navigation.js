document.addEventListener('DOMContentLoaded', () => {
    const navItems   = document.querySelectorAll('.nav-item');
    const pathname   = window.location.pathname;
    const currentPage = pathname.split('/').pop().replace('.html', '');

    // Si estamos en /pages/, el prefijo es vacío (mismo directorio)
    // Si estamos en la raíz (index, league-selection), el prefijo es pages/
    const inPages = pathname.includes('/pages/');
    const prefix  = inPages ? '' : 'pages/';

    navItems.forEach(item => {
        const page = item.getAttribute('data-page');

        // Marcar activo
        if (page === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }

        // Navegar
        item.addEventListener('click', () => {
            window.location.href = prefix + page + '.html';
        });
    });
});

function goBack() {
    window.history.back();
}
