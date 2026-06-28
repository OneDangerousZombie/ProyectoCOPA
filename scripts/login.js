// ── Estado del formulario ────────────────────────────────────
let currentTab = 'login'; // 'login' | 'register'

// Buscamos el formulario en el DOM
const authForm = document.getElementById('loginForm');

if (authForm) {
    // Escuchamos el evento submit nativo del formulario (esto ya cubre el "Enter")
    authForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evitamos que la página se recargue
        
        if (currentTab === 'login') {
            handleLogin();
        } else {
            handleRegister();
        }
    });
}

// ── Cambiar entre pestañas Login / Registro ─────────────────
function switchTab(tab) {
    currentTab = tab;

    document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegister').classList.toggle('active', tab === 'register');

    const submitBtn = document.getElementById('submitBtn');
    const demoHint  = document.getElementById('demoHint');

    if (tab === 'login') {
        submitBtn.textContent = 'Ingresar';
        if(demoHint) demoHint.style.display = 'flex';
    } else {
        submitBtn.textContent = 'Crear cuenta';
        if(demoHint) demoHint.style.display = 'none';
    }

    clearError();
}

// ── Login contra la BD real ──────────────────────────────────
async function handleLogin() {
    const nombre = document.getElementById('username').value.trim();
    const clave  = document.getElementById('password').value.trim();

    if (!nombre || !clave) {
        showError('Completá usuario y contraseña');
        return;
    }

    setLoading(true);
    clearError();

    try {
        const res = await fetch('../api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre, clave: clave })
        });

        const data = await res.json();

        if (!data.ok) {
            showError(data.error || 'No se pudo iniciar sesión');
            setLoading(false);
            return;
        }

        // Guardar el jugador logueado (podés usar localStorage o sessionStorage)
        sessionStorage.setItem('copaUser', JSON.stringify(data.jugador));

        // Redirección
        window.location.href = 'league-selection.html';

    } catch (err) {
        console.error(err);
        showError('No se pudo conectar con el servidor. ¿Está corriendo XAMPP?');
        setLoading(false);
    }
}

// ── Registro de nuevo jugador ────────────────────────────────
async function handleRegister() {
    const nombre = document.getElementById('inputNombre').value.trim();
    const clave  = document.getElementById('inputClave').value.trim();

    if (!nombre || !clave) {
        showError('Completá usuario y contraseña');
        return;
    }

    if (clave.length < 3) {
        showError('La contraseña debe tener al menos 3 caracteres');
        return;
    }

    setLoading(true);
    clearError();

    try {
        const res = await fetch('../api/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre, clave: clave })
        });

        const data = await res.json();

        if (!data.ok) {
            showError(data.error || 'No se pudo registrar el usuario');
            setLoading(false);
            return;
        }

        sessionStorage.setItem('copaUser', JSON.stringify(data.jugador));
        window.location.href = 'league-selection.html';

    } catch (err) {
        console.error(err);
        showError('No se pudo conectar con el servidor. ¿Está corriendo XAMPP?');
        setLoading(false);
    }
}

// ── Helpers UI ────────────────────────────────────────────────
function showError(msg) {
    const el = document.getElementById('formError');
    if(el) {
        el.textContent = msg;
        el.classList.add('visible');
    }
}

function clearError() {
    const el = document.getElementById('formError');
    if(el) {
        el.textContent = '';
        el.classList.remove('visible');
    }
}

function setLoading(isLoading) {
    const btn = document.getElementById('submitBtn');
    if(btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading
            ? 'Cargando...'
            : (currentTab === 'login' ? 'Ingresar' : 'Crear cuenta');
    }
}