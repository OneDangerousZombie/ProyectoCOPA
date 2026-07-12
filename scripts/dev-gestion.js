// scripts/dev-gestion.js — v2
// Actualizado para la nueva base copatres:
//   - Usuarios: ELO desde liga_miembros, columna LIGAS, campo MAIL
//   - Canchas: columna ID_LIGA con nombre de liga, campo id_liga en form
//   - Ligas: implementación real (ya no es placeholder)
//   - Inhabilitar: ahora funciona para usuarios (ACTIVO=0 en liga_miembros)

var devGestion = {
    tab:       'usuarios',
    selection: [],
    data: { usuarios: [], canchas: [], ligas: [] },
    membresias: [],
    mtab: 'inhabilitar'
};

function devToast(msg, type) {
    var t = document.createElement('div');
    t.className = 'dev-toast ' + (type || 'success');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 2800);
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.dev-tab-btn[data-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () { switchTab(btn.dataset.tab); });
});

document.querySelectorAll('#modalMembresias .dev-tab-btn[data-mtab]').forEach(function(btn){
    btn.addEventListener('click', function(){
        document.querySelectorAll('#modalMembresias .dev-tab-btn[data-mtab]').forEach(function(b){ b.classList.toggle('active', b === btn); });
        devGestion.mtab = btn.dataset.mtab;
        renderMembresiasTab();
    });
});

document.getElementById('membresiasConfirmBtn').addEventListener('click', confirmMembresias);

    document.getElementById('devActionBar').addEventListener('click', function (e) {
        var btn = e.target.closest('.dev-action-btn');
        if (!btn || btn.disabled) return;
        handleAction(btn.dataset.action);
    });

    document.querySelectorAll('.dev-modal').forEach(function (modal) {
        modal.addEventListener('click', function (e) { if (e.target === modal) closeAllModals(); });
    });
    document.querySelectorAll('.dev-modal-close').forEach(function (btn) {
        btn.addEventListener('click', closeAllModals);
    });

    var form = document.getElementById('modForm');
    if (form) form.addEventListener('submit', function(e){ e.preventDefault(); submitModificar(); });

    switchTab('usuarios');
});

// ── Tabs ──────────────────────────────────────────────────────
function switchTab(tab) {
    devGestion.tab = tab;
    devGestion.selection = [];

    document.querySelectorAll('.dev-tab-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.tab === tab); });
    document.querySelectorAll('.dev-tab-panel').forEach(function(p){ p.style.display = p.dataset.tab === tab ? 'block' : 'none'; });

    // Botón "Nueva cancha" solo en tab canchas; "Nueva liga" solo en tab ligas
    var btnCancha = document.getElementById('btnNuevaCancha');
    var btnLiga   = document.getElementById('btnNuevaLiga');
    var btnUsuario = document.getElementById('btnNuevoUsuario');
    var btnInhabilitar = document.querySelector('.dev-action-btn.inhabilitar');
    if (btnInhabilitar) btnInhabilitar.style.display = tab === 'canchas' ? 'none' : 'inline-flex';
    if (btnUsuario) btnUsuario.style.display = tab === 'usuarios' ? 'inline-flex' : 'none';
    if (btnCancha) btnCancha.style.display = tab === 'canchas' ? 'inline-flex' : 'none';
    if (btnLiga)   btnLiga.style.display   = tab === 'ligas'   ? 'inline-flex' : 'none';

    updateActionBar();
    loadTabData(tab);
}

function loadTabData(tab) {
    var endpoints = { usuarios:'../api/dev/jugadores.php', canchas:'../api/dev/canchas.php', ligas:'../api/dev/ligas.php' };
    var loadingId = { usuarios:'loadingUsuarios', canchas:'loadingCanchas', ligas:'loadingLigas' };
    var loading   = document.getElementById(loadingId[tab]);
    if (loading) loading.style.display = 'table-row';

    fetch(endpoints[tab], { credentials:'same-origin' })
        .then(function(r){ return r.json(); })
        .then(function(json){
            if (!json.ok) throw new Error(json.error || 'Error');
            if (tab === 'usuarios') { devGestion.data.usuarios = json.jugadores || []; renderUsuarios(); }
            else if (tab === 'canchas') { devGestion.data.canchas = json.canchas || []; renderCanchas(); }
            else if (tab === 'ligas') { devGestion.data.ligas = json.ligas || []; renderLigas(); }
        })
        .catch(function(err){
            var tbody = document.getElementById('tbody' + tab.charAt(0).toUpperCase() + tab.slice(1));
            if (tbody) tbody.innerHTML = '<tr><td colspan="99"><div class="dev-empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Error: ' + err.message + '</div></td></tr>';
        })
        .finally(function(){ if (loading) loading.style.display = 'none'; });
}

// ── Render Usuarios ───────────────────────────────────────────
function renderUsuarios() {
    var tbody = document.getElementById('tbodyUsuarios');
    var data  = devGestion.data.usuarios;
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="8"><div class="dev-empty-state"><i class="fa-solid fa-users"></i>Sin jugadores registrados</div></td></tr>';
        return;
    }
    tbody.innerHTML = data.map(function(j) {
        var rolClass = String(j.rol) === '9' ? 'dev' : 'jugador';
        var rolLabel = String(j.rol) === '9' ? 'DEV' : 'JUGADOR';
        var elo = j.elo ? j.elo : '—';
        return '<tr data-id="' + j.id + '">' +
            '<td class="cb-col"><input type="checkbox" class="dev-cb row-cb" data-id="' + j.id + '" onchange="onCbChange()"></td>' +
            '<td class="id-col">#' + j.id + '</td>' +
            '<td class="primary-col">' + escHtml(j.nombre) + '</td>' +
            '<td><span class="dev-badge-rol ' + rolClass + '">' + rolLabel + '</span></td>' +
            '<td class="dev-elo-chip">' + elo + '</td>' +
            '<td>' + (j.pj || 0) + '</td>' +
            '<td>' + (j.goles || 0) + '</td>' +
            '<td>' + (j.ligas || 0) + '</td>' +
        '</tr>';
    }).join('');
    attachSelectAll('selectAllUsuarios', 'tbodyUsuarios');

    document.querySelectorAll('#tbodyUsuarios td.cb-col').forEach(function(td) {
    td.addEventListener('click', function(e) {
        if (e.target.type !== 'checkbox') {
            e.preventDefault();
            e.stopPropagation();
        }
    });
});
}



// ── Render Canchas ────────────────────────────────────────────
function renderCanchas() {
    var tbody = document.getElementById('tbodyCanchas');
    var data  = devGestion.data.canchas;
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="dev-empty-state"><i class="fa-solid fa-location-dot"></i>Sin canchas registradas</div></td></tr>';
        return;
    }
    tbody.innerHTML = data.map(function(c) {
        return '<tr data-id="' + c.id + '">' +
            '<td class="cb-col"><input type="checkbox" class="dev-cb row-cb" data-id="' + c.id + '" onchange="onCbChange()"></td>' +
            '<td class="id-col">#' + c.id + '</td>' +
            '<td class="primary-col">' + escHtml(c.nombre) + '</td>' +
            '<td>' + escHtml(c.direccion) + '</td>' +
            '<td>' + escHtml(c.localidad) + '</td>' +
            '<td>' + escHtml(c.liga_nombre || '—') + '</td>' +
            '<td>' + (c.partidos_jugados || 0) + ' partidos</td>' +
        '</tr>';
    }).join('');
    attachSelectAll('selectAllCanchas', 'tbodyCanchas');

    document.querySelectorAll('#tbodyCanchas td.cb-col').forEach(function(td) {
    td.addEventListener('click', function(e) {
        if (e.target.type !== 'checkbox') {
            e.preventDefault();
            e.stopPropagation();
        }
    });
});
}

// ── Render Ligas (ahora real) ─────────────────────────────────
function renderLigas() {
    var notice = document.getElementById('ligasPlaceholderNotice');
    if (notice) notice.style.display = 'none';

    var tbody = document.getElementById('tbodyLigas');
    var data  = devGestion.data.ligas;
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="8"><div class="dev-empty-state"><i class="fa-solid fa-trophy"></i>Sin ligas registradas</div></td></tr>';
        return;
    }
    tbody.innerHTML = data.map(function(l) {
        var estadoBadge = parseInt(l.estado) === 1
            ? '<span class="dev-badge-rol jugador">ACTIVA</span>'
            : '<span class="dev-badge-rol" style="background:rgba(239,68,68,0.1);color:#f87171;border-color:rgba(239,68,68,0.25)">INACTIVA</span>';
        var privBadge = parseInt(l.privada) === 1
            ? '<span class="dev-badge-rol" style="background:rgba(251,191,36,0.1);color:#fbbf24;border-color:rgba(251,191,36,0.25)"><i class="fa-solid fa-lock" style="font-size:0.6rem"></i></span>'
            : '';
        return '<tr data-id="' + l.id + '">' +
            '<td class="cb-col"><input type="checkbox" class="dev-cb row-cb" data-id="' + l.id + '" onchange="onCbChange()"></td>' +
            '<td class="id-col">#' + l.id + '</td>' +
            '<td class="primary-col">' + escHtml(l.nombre) + ' ' + privBadge + '</td>' +
            '<td>' + escHtml(l.creador || '—') + '</td>' +
            '<td>' + (l.miembros || 0) + '</td>' +
            '<td>' + (l.partidos || 0) + '</td>' +
            '<td style="font-family:\'Courier New\',monospace;font-size:0.8rem;letter-spacing:0.08em">' + (l.codigo || '—') + '</td>' +
            '<td>' + estadoBadge + '</td>' +
        '</tr>';
    }).join('');
    attachSelectAll('selectAllLigas', 'tbodyLigas');

    document.querySelectorAll('#tbodyLigas td.cb-col').forEach(function(td) {
    td.addEventListener('click', function(e) {
        if (e.target.type !== 'checkbox') {
            e.preventDefault();
            e.stopPropagation();
        }
    });
});
}

// ── Checkbox ──────────────────────────────────────────────────
function onCbChange() {
    var checked = document.querySelectorAll('#panel-' + devGestion.tab + ' .row-cb:checked');
    devGestion.selection = Array.from(checked).map(function(cb){ return parseInt(cb.dataset.id, 10); });
    document.querySelectorAll('#panel-' + devGestion.tab + ' tr[data-id]').forEach(function(row) {
        row.classList.toggle('row-selected', devGestion.selection.indexOf(parseInt(row.dataset.id,10)) !== -1);
    });
    updateActionBar();
}

function attachSelectAll(checkAllId, tbodyId) {
    var el = document.getElementById(checkAllId); if (!el) return;
    el.onchange = function() {
        document.querySelectorAll('#' + tbodyId + ' .row-cb').forEach(function(cb){ cb.checked = el.checked; });
        onCbChange();
    };
}

function updateActionBar() {
    var n = devGestion.selection.length;
    var active = n > 0;
    var bar    = document.getElementById('devActionBar');
    var count  = document.getElementById('devSelectionCount');
    bar.classList.toggle('abm-active', active);
    if (count) { count.textContent = active ? n + ' seleccionado' + (n!==1?'s':'') : ''; count.classList.toggle('has-selection', active); }
    document.querySelectorAll('.dev-action-btn[data-requires-selection]').forEach(function(btn) {
        btn.disabled          = !active;
        btn.style.opacity     = active ? '1'    : '0.38';
        btn.style.pointerEvents= active ? 'auto' : 'none';
    });
}

// ── Acciones ──────────────────────────────────────────────────
function handleAction(action) {
    if (!devGestion.selection.length) return;
    var ids = devGestion.selection.slice();
    var tab = devGestion.tab;
    if (action === 'inspeccionar') {
        if (ids.length > 1) { devToast('Inspeccioná de a uno', 'warn'); return; }
        openInspeccionar(ids[0], tab); return;
    }
    if (action === 'modificar') {
        if (ids.length > 1) { devToast('Modificá de a uno', 'warn'); return; }
        openModificar(ids[0], tab); return;
    }
    if (action === 'inhabilitar') {
    if (tab === 'usuarios') { openMembresias(ids); } else { openInhabilitar(ids, tab); }
    return;
}
    if (action === 'eliminar')    { openEliminar(ids, tab);    return; }
}

// ── Modal: Inspeccionar ───────────────────────────────────────
function openInspeccionar(id, tab) {
    var endpoints = { usuarios:'../api/dev/jugadores.php', canchas:'../api/dev/canchas.php', ligas:'../api/dev/ligas.php' };
    fetch(endpoints[tab] + '?id=' + id, { credentials:'same-origin' })
        .then(function(r){ return r.json(); })
        .then(function(json) {
            var obj = json.jugador || json.cancha || json.liga;
            var modal = document.getElementById('modalInspeccionar');
            var grid  = document.getElementById('inspectGrid');
            var title = document.getElementById('inspectTitle');
            if (!obj || !grid) return;
            title.textContent = 'Inspeccionando ' + tab.slice(0,-1) + ' #' + id;
            grid.innerHTML = Object.keys(obj).map(function(key) {
                return '<div class="dev-inspect-item"><div class="dev-inspect-label">' + key + '</div>' +
                    '<div class="dev-inspect-value">' + (obj[key]!=null ? escHtml(String(obj[key])) : '—') + '</div></div>';
            }).join('');
            modal.classList.add('active');
        })
        .catch(function(){ devToast('Error al cargar datos', 'error'); });
}

function hideModFields() {
    ['modFieldsUsuario','modFieldsCancha','modFieldsLiga'].forEach(function(fid){
        var e = document.getElementById(fid);
        if (!e) return;
        e.style.display = 'none';
        e.querySelectorAll('input,select').forEach(function(i){ i.disabled = true; });
    });
}

// ── Modal: Modificar ──────────────────────────────────────────
function openModificar(id, tab) {
    var modal = document.getElementById('modalModificar');
    if (!modal) return;
    document.getElementById('modId').value  = id;
    document.getElementById('modTab').value = tab;

    // Mostrar solo el bloque de campos que corresponde
    hideModFields();
    var fieldMap = { usuarios:'modFieldsUsuario', canchas:'modFieldsCancha', ligas:'modFieldsLiga' };
    var fieldsEl = document.getElementById(fieldMap[tab]);
    if (fieldsEl) {
    fieldsEl.style.display = 'block';
    fieldsEl.querySelectorAll('input,select').forEach(function(i){ i.disabled = false; });
}

    var endpoints = { usuarios:'../api/dev/jugadores.php', canchas:'../api/dev/canchas.php', ligas:'../api/dev/ligas.php' };
    fetch(endpoints[tab] + '?id=' + id, { credentials:'same-origin' })
        .then(function(r){ return r.json(); })
        .then(function(json){
            var obj = json.jugador || json.cancha || json.liga;
            if (!obj) return;
            if (tab === 'usuarios') {
                setVal('modNombre', obj.NOMBRE || '');
                setVal('modRol',    obj.ROL    || '1');
                setVal('modMail',   obj.MAIL   || '');
            } else if (tab === 'canchas') {
                setVal('modCanchaNombre', obj.NOMBRE    || '');
                setVal('modDireccion',    obj.DIRECCION || '');
                setVal('modLocalidad',    obj.LOCALIDAD || '');
                setVal('modIdLiga',       obj.ID_LIGA   || '');
                // Cargar selector de ligas
                loadLigasSelect('modIdLiga', obj.ID_LIGA);
            } else if (tab === 'ligas') {
                setVal('modLigaNombre',  obj.NOMBRE      || '');
                setVal('modDescripcion', obj.DESCRIPCION || '');
                setVal('modFormato',     obj.FORMATO_DEFAULT || 'F5');
                setVal('modPrivada',     obj.PRIVADA     || '0');
                setVal('modEstado',      obj.ESTADO      || '1');
            }
            document.getElementById('modTitle').textContent = 'Modificar ' + tab.slice(0,-1) + ' #' + id;
            modal.classList.add('active');
        })
        .catch(function(){ devToast('No se pudo cargar', 'error'); });
}

function loadLigasSelect(selectId, currentVal) {
    fetch('../api/dev/ligas.php', { credentials:'same-origin' })
        .then(function(r){ return r.json(); })
        .then(function(json){
            var sel = document.getElementById(selectId);
            if (!sel || !json.ok) return;
            sel.innerHTML = (json.ligas || []).map(function(l){
                return '<option value="' + l.id + '"' + (String(l.id) === String(currentVal) ? ' selected' : '') + '>' + escHtml(l.nombre) + '</option>';
            }).join('');
        }).catch(function(){});
}

function submitModificar() {
    var id  = parseInt(document.getElementById('modId').value, 10);
    var tab = document.getElementById('modTab').value;
    var body, endpoint;

    if (tab === 'usuarios') {
        body     = { id:id, nombre:getVal('modNombre'), rol:parseInt(getVal('modRol'),10), mail:getVal('modMail'), clave:getVal('modClave') };
        endpoint = '../api/dev/jugadores.php';
    } else if (tab === 'canchas') {
        body     = { id:id, nombre:getVal('modCanchaNombre'), direccion:getVal('modDireccion'), localidad:getVal('modLocalidad'), id_liga:parseInt(getVal('modIdLiga'),10) };
        endpoint = '../api/dev/canchas.php';
    } else if (tab === 'ligas') {
        body     = { id:id, nombre:getVal('modLigaNombre'), descripcion:getVal('modDescripcion'), formato:getVal('modFormato'), privada:parseInt(getVal('modPrivada'),10), estado:parseInt(getVal('modEstado'),10) };
        endpoint = '../api/dev/ligas.php';
    }

    if (!id && (tab === 'canchas' || tab === 'ligas' || tab === 'usuarios')) {
        // Crear nuevo
        submitCrear(tab, body);
        return;
    }

    fetch(endpoint, { method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify(body) })
        .then(function(r){ return r.json(); })
        .then(function(json){
            if (!json.ok) throw new Error(json.error);
            devToast('Guardado correctamente');
            closeAllModals();
            loadTabData(tab);
        })
        .catch(function(err){ devToast('Error: ' + err.message, 'error'); });
}

function submitCrear(tab, body) {
    var endpoint = tab === 'canchas' ? '../api/dev/canchas.php'
                 : tab === 'ligas'   ? '../api/dev/ligas.php'
                 : '../api/dev/jugadores.php?crear=1';
    fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify(body) })
        .then(function(r){ return r.json(); })
        .then(function(json){
            if (!json.ok) throw new Error(json.error);
            devToast(tab === 'canchas' ? 'Cancha creada' : tab === 'ligas' ? 'Liga creada' : 'Usuario creado');
            closeAllModals();
            loadTabData(tab);
        })
        .catch(function(err){ devToast('Error: ' + err.message, 'error'); });
}
// ── Crear nueva cancha / liga ─────────────────────────────────
function openCrearUsuario() {
    var modal = document.getElementById('modalModificar');
    document.getElementById('modId').value  = '';
    document.getElementById('modTab').value = 'usuarios';
    hideModFields();

    document.getElementById('modFieldsUsuario').style.display = 'block';
    document.getElementById('modFieldsUsuario').querySelectorAll('input,select').forEach(function(i){ i.disabled = false; });
    setVal('modNombre',''); setVal('modRol','1'); setVal('modMail',''); setVal('modClave','');
    document.getElementById('modTitle').textContent = 'Nuevo usuario';
    modal.classList.add('active');
}

function openCrearCancha() {
    var modal = document.getElementById('modalModificar');
    document.getElementById('modId').value  = '';
    document.getElementById('modTab').value = 'canchas';
    hideModFields();

    document.getElementById('modFieldsCancha').style.display = 'block';
    document.getElementById('modFieldsCancha').querySelectorAll('input,select').forEach(function(i){ i.disabled = false; });
    setVal('modCanchaNombre',''); setVal('modDireccion',''); setVal('modLocalidad','');
    loadLigasSelect('modIdLiga', null);
    document.getElementById('modTitle').textContent = 'Nueva cancha';
    modal.classList.add('active');
}

function openCrearLiga() {
    var modal = document.getElementById('modalModificar');
    document.getElementById('modId').value  = '';
    document.getElementById('modTab').value = 'ligas';
    hideModFields();

    document.getElementById('modFieldsLiga').style.display = 'block';
    document.getElementById('modFieldsLiga').querySelectorAll('input,select').forEach(function(i){ i.disabled = false; });
    setVal('modLigaNombre',''); setVal('modDescripcion',''); setVal('modFormato','F5'); setVal('modPrivada','0'); setVal('modEstado','1');
    document.getElementById('modTitle').textContent = 'Nueva liga';
    modal.classList.add('active');
}

// ── Modal: Inhabilitar (ahora real para usuarios) ─────────────
function openInhabilitar(ids, tab) {
    var modal = document.getElementById('modalInhabilitar');
    var msg   = document.getElementById('inhabilitarMsg');
    var btn   = document.getElementById('inhabilitarConfirmBtn');
    if (!modal) return;

    if (tab === 'usuarios') {
        var entity = ids.length > 1 ? ids.length + ' jugadores' : '1 jugador';
        msg.innerHTML = 'Pondrá en <strong>ACTIVO = 0</strong> a ' + entity + ' en todas sus ligas. Seguirán existiendo como usuarios pero no aparecerán como miembros activos.';
        btn.style.display = 'inline-flex';
        btn.onclick = function() {
            fetch('../api/dev/jugadores.php', {
                method:'POST', headers:{'Content-Type':'application/json'},
                credentials:'same-origin', body:JSON.stringify({ids:ids})
            })
            .then(function(r){ return r.json(); })
            .then(function(json){
                if (!json.ok) throw new Error(json.error);
                devToast('Inhabilitado' + (ids.length>1?'s':'') + ' en todas las ligas');
                closeAllModals(); devGestion.selection = []; updateActionBar(); loadTabData(tab);
            })
            .catch(function(err){ devToast('Error: '+err.message,'error'); });
        };
        modal.classList.add('active');

    } else if (tab === 'ligas') {
        var estados = ids.map(function(id){
            var l = devGestion.data.ligas.find(function(x){ return x.id == id; });
            return l ? parseInt(l.estado) : null;
        });
        var mixto = estados.some(function(e){ return e !== estados[0]; });
        if (mixto) {
            devToast('Seleccioná ligas con el mismo estado (todas activas o todas inactivas)', 'warn');
            return;
        }
        var estadoActual = estados[0];
        var nuevoEstado   = estadoActual === 1 ? 0 : 1;
        var accionTexto   = nuevoEstado === 0 ? 'Deshabilitar' : 'Habilitar';
        msg.innerHTML = accionTexto + ' <strong>' + ids.length + ' liga' + (ids.length>1?'s':'') + '</strong>?';
        btn.style.display = 'inline-flex';
        btn.onclick = function() {
            fetch('../api/dev/ligas.php?inhabilitar=1', {
                method:'POST', headers:{'Content-Type':'application/json'},
                credentials:'same-origin', body:JSON.stringify({ids:ids, estado:nuevoEstado})
            })
            .then(function(r){ return r.json(); })
            .then(function(json){
                if (!json.ok) throw new Error(json.error || 'Error desconocido');
                devToast(accionTexto + ' correctamente');
                closeAllModals(); devGestion.selection = []; updateActionBar(); loadTabData(tab);
            })
            .catch(function(err){ devToast('Error: '+err.message,'error'); });
        };
        modal.classList.add('active');

    } else {
        msg.innerHTML = 'Inhabilitar <strong>' + tab + '</strong> no está disponible para esta entidad.';
        btn.style.display = 'none';
        modal.classList.add('active');
    }
}

function openMembresias(ids) {
    var modal = document.getElementById('modalMembresias');
    fetch('../api/dev/jugadores.php?membresias=1', {
        method:'POST', headers:{'Content-Type':'application/json'},
        credentials:'same-origin', body:JSON.stringify({ids:ids})
    })
    .then(function(r){ return r.json(); })
    .then(function(json){
        if (!json.ok) throw new Error(json.error || 'Error');
        devGestion.membresias = json.membresias || [];
        devGestion.mtab = 'inhabilitar';
        document.querySelectorAll('#modalMembresias .dev-tab-btn[data-mtab]').forEach(function(b){
            b.classList.toggle('active', b.dataset.mtab === 'inhabilitar');
        });
        var empty   = document.getElementById('membresiasEmpty');
        var content = document.getElementById('membresiasContent');
        if (!devGestion.membresias.length) {
            empty.style.display   = 'block';
            content.style.display = 'none';
        } else {
            empty.style.display   = 'none';
            content.style.display = 'block';
            renderMembresiasTab();
        }
        modal.classList.add('active');
    })
    .catch(function(err){ devToast('Error: ' + err.message, 'error'); });
}

function renderMembresiasTab() {
    var estadoFiltro = devGestion.mtab === 'inhabilitar' ? 1 : 0;
    var rows = devGestion.membresias.filter(function(m){ return parseInt(m.ACTIVO) === estadoFiltro; });
    var tbody = document.getElementById('tbodyMembresias');

    if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:1rem;color:var(--text-tertiary)">Sin registros en esta pestaña</td></tr>';
        return;
    }

    tbody.innerHTML = rows.map(function(m){
        return '<tr>' +
            '<td class="cb-col"><input type="checkbox" class="dev-cb mem-cb" data-usuario="' + m.ID_USUARIO + '" data-liga="' + m.ID_LIGA + '"></td>' +
            '<td>' + escHtml(m.usuario_nombre) + '</td>' +
            '<td>' + escHtml(m.liga_nombre) + '</td>' +
        '</tr>';
    }).join('');

    var selectAll = document.getElementById('selectAllMembresias');
    selectAll.checked = false;
    selectAll.onchange = function(){
        document.querySelectorAll('#tbodyMembresias .mem-cb').forEach(function(cb){ cb.checked = selectAll.checked; });
    };
}

function confirmMembresias() {
    var checked = document.querySelectorAll('#tbodyMembresias .mem-cb:checked');
    if (!checked.length) { devToast('Seleccioná al menos una liga', 'warn'); return; }

    var pares = Array.from(checked).map(function(cb){
        return { id_usuario: parseInt(cb.dataset.usuario,10), id_liga: parseInt(cb.dataset.liga,10) };
    });
    var estado = devGestion.mtab === 'inhabilitar' ? 0 : 1;

    fetch('../api/dev/jugadores.php?actualizar_membresias=1', {
        method:'POST', headers:{'Content-Type':'application/json'},
        credentials:'same-origin', body:JSON.stringify({pares:pares, estado:estado})
    })
    .then(function(r){ return r.json(); })
    .then(function(json){
        if (!json.ok) throw new Error(json.error || 'Error');
        devToast(estado === 0 ? 'Inhabilitado correctamente' : 'Habilitado correctamente');
        closeAllModals(); devGestion.selection = []; updateActionBar(); loadTabData('usuarios');
    })
    .catch(function(err){ devToast('Error: ' + err.message, 'error'); });
}

// ── Modal: Eliminar ───────────────────────────────────────────
function openEliminar(ids, tab) {
    var modal = document.getElementById('modalEliminar');
    var msg   = document.getElementById('eliminarMsg');
    var btn   = document.getElementById('eliminarConfirmBtn');
    if (!modal) return;

    var entityLabels = { usuarios:'jugador', canchas:'cancha', ligas:'liga' };
    var entity = (entityLabels[tab] || tab) + (ids.length > 1 ? 's' : '');
    msg.innerHTML = '¿Eliminar <strong>' + ids.length + ' ' + entity + '</strong> de la base de datos? Esta acción <strong>no se puede deshacer</strong>.';

    var endpoints = { usuarios:'../api/dev/jugadores.php', canchas:'../api/dev/canchas.php', ligas:'../api/dev/ligas.php' };
    btn.onclick = function() {
        fetch(endpoints[tab], {
            method:'DELETE', headers:{'Content-Type':'application/json'},
            credentials:'same-origin', body:JSON.stringify({ids:ids})
        })
        .then(function(r){ return r.json(); })
        .then(function(json){
            if (!json.ok) throw new Error(json.error);
            devToast('Eliminado' + (ids.length>1?'s':'') + ' correctamente');
            closeAllModals(); devGestion.selection = []; updateActionBar(); loadTabData(tab);
        })
        .catch(function(err){ devToast('Error: '+err.message,'error'); });
    };
    modal.classList.add('active');
}

// ── Utilidades ────────────────────────────────────────────────
function closeAllModals() {
    document.querySelectorAll('.dev-modal').forEach(function(m){ m.classList.remove('active'); });
}

function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setVal(id, val) { var e=document.getElementById(id); if(e) e.value=val; }
function getVal(id) { var e=document.getElementById(id); return e?e.value.trim():''; }
