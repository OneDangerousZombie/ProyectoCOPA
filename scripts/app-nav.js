// scripts/app-nav.js
// ============================================================================
// Drawer mobile genérico para TODAS las páginas de la Aplicación (carpeta
// pages/): login.html, home.html, liga.html, perfil.html, etc.
//
// Un solo archivo compartido — igual que data.js o utils.js — en vez de un
// script por página. Cualquier página nueva que necesite este drawer solo
// tiene que:
//   1) incluir el HTML con estos 3 IDs exactos (ver más abajo);
//   2) cargar este script (<script src="../scripts/app-nav.js">);
//   3) cargar el CSS correspondiente (clases .app-nav-* documentadas en
//      cada hoja de estilo de página, ej. login.css).
// No hace falta escribir JS nuevo por página.
//
// IDs esperados en el HTML (mismo patrón que ya usa la Landing en
// index.js, para que todo el proyecto sea consistente):
//   #navHamburger  → botón que abre/cierra el drawer
//   #navDrawer     → el panel que se desliza desde la izquierda
//   #navBackdrop   → el fondo oscuro que cubre el resto de la página
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.getElementById('navHamburger');
    var drawer = document.getElementById('navDrawer');
    var backdrop = document.getElementById('navBackdrop');

    if (!hamburger || !drawer || !backdrop) return;

    function closeDrawer() {
        drawer.classList.remove('active');
        backdrop.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    function openDrawer() {
        drawer.classList.add('active');
        backdrop.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
    }

    hamburger.addEventListener('click', function () {
        var isOpen = drawer.classList.contains('active');
        if (isOpen) closeDrawer();
        else openDrawer();
    });

    backdrop.addEventListener('click', closeDrawer);

    drawer.querySelectorAll('a, button').forEach(function (el) {
        el.addEventListener('click', closeDrawer);
    });
});
