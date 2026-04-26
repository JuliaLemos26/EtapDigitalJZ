/* 
   ADMIN LOGIC - ETAP Digital
   Funções para o Painel de Administração (Utilizadores, Banners, Avisos, Avatar Builder)
*/

window.submitAjaxForm = async function(e, url, isMultipart = false) {
    if (e) e.preventDefault();
    const form = e.target;
    const formData = isMultipart ? new FormData(form) : new URLSearchParams(new FormData(form));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
        });
        const data = await response.json();
        if (data.status === 'success' || data.success) {
            if (window.showGlobalAlert) window.showGlobalAlert(data.message || 'Operação concluída', 'success');
            else alert(data.message || 'Operação concluída');
            
            await new Promise(r => setTimeout(r, 300));
            if (window.loadRoute) await window.loadRoute();
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(m => {
               const inst = bootstrap.Modal.getInstance(m);
               if (inst) inst.hide();
            });
        }
    } catch (err) {
        console.error(err);
        alert('Erro ao processar pedido.');
    }
};

window.submitDynamicAction = async function(e, type) {
    e.preventDefault();
    const form = e.target;
    const actionUrl = form.getAttribute('data-action-url');
    window.submitAjaxForm(e, actionUrl);
};

window.handleUserAction = async function(userId, action) {
    if (action === 'promote' && !confirm('Confirmar promoção a Administrador?')) return;
    
    const params = new URLSearchParams();
    params.append('action', action);
    
    try {
        const response = await fetch(`/admin-dashboard/user/${userId}/action/`, {
            method: 'POST',
            headers: { 
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: params
        });
        const data = await response.json();
        
        let finalMessage = data.message;
        if (data.temp_pass) {
            finalMessage = `<strong>Senha Resetada!</strong><br>Nova senha: <code style="background:rgba(0,0,0,0.1); padding:2px 5px; border-radius:4px;">${data.temp_pass}</code><br><small>Por favor, anote-a e entregue ao utilizador.</small>`;
        }
        
        if (window.showGlobalAlert) window.showGlobalAlert(finalMessage, data.status === 'success' ? 'success' : 'error');
        else alert(data.message);

        if (window.loadRoute) await window.loadRoute();
    } catch (err) {
        console.error(err);
        if (window.showGlobalAlert) window.showGlobalAlert('Erro na ação do utilizador', 'error');
    }
};

window.handleBannerAction = async function(bannerId, action) {
    if (action === 'delete' && !confirm('Eliminar este banner?')) return;
    const params = new URLSearchParams();
    params.append('action', action);
    params.append('banner_id', bannerId);
    
    try {
        const response = await fetch(`/admin-dashboard/banners/`, {
            method: 'POST',
            headers: { 
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: params
        });
        const data = await response.json();
        if (window.showGlobalAlert) window.showGlobalAlert(data.message, 'success');
        if (window.loadRoute) await window.loadRoute();
    } catch (e) {
        if (window.showGlobalAlert) window.showGlobalAlert('Erro ao gerir banner', 'error');
    }
};

window.handleTogglePlatform = async function() {
    if (!confirm('Alterar o estado de manutenção da plataforma?')) return;
    try {
        const response = await fetch(`/admin-dashboard/toggle-platform/`, {
            method: 'POST',
            headers: { 
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        const data = await response.json();
        if (window.showGlobalAlert) window.showGlobalAlert(data.message, 'success');
        if (window.loadRoute) await window.loadRoute();
    } catch (e) {
        if (window.showGlobalAlert) window.showGlobalAlert('Erro ao alternar plataforma', 'error');
    }
};

window.toggleAvisoFilters = function(type) {
    const filterCursoAno = document.getElementById('filter-curso-ano');
    const filterUser = document.getElementById('filter-user');
    if (filterCursoAno) filterCursoAno.style.display = (type == 'filtrado') ? 'block' : 'none';
    if (filterUser) filterUser.style.display = (type == 'particular') ? 'block' : 'none';
};

window.openAdminRelocateModal = function(userId, curso, ano) {
    const cursoEl = document.getElementById('adminRelocateCurso');
    const anoEl = document.getElementById('adminRelocateAno');
    const formEl = document.getElementById('adminRelocateForm');
    
    if (cursoEl) cursoEl.value = curso;
    if (anoEl) anoEl.value = ano;
    if (formEl) formEl.setAttribute('data-action-url', '/admin-dashboard/user/' + userId + '/relocate/');
    
    const modalEl = document.getElementById('adminRelocateModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
};

window.handleDeleteAviso = async function(avisoId) {
    if (!confirm('Eliminar este aviso permanentemente?')) return;
    try {
        const response = await fetch(`/admin-dashboard/avisos/${avisoId}/delete/`, {
            method: 'POST',
            headers: { 
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        const data = await response.json();
        if (window.showGlobalAlert) window.showGlobalAlert(data.message, 'success');
        if (window.loadRoute) await window.loadRoute();
    } catch (e) {
        if (window.showGlobalAlert) window.showGlobalAlert('Erro ao eliminar aviso', 'error');
    }
};

window.handleDeleteOutfit = async function(outfitId, outfitName) {
    if (!confirm(`Apagar o outfit "${outfitName}" permanentemente?`)) return;
    try {
        const response = await fetch(`/admin-dashboard/outfits/${outfitId}/delete/`, {
            method: 'POST',
            headers: { 
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        const data = await response.json();
        if (window.showGlobalAlert) window.showGlobalAlert(data.message, data.status === 'success' ? 'success' : 'error');
        if (window.loadRoute) await window.loadRoute();
    } catch (e) {
        if (window.showGlobalAlert) window.showGlobalAlert('Erro ao eliminar outfit', 'error');
    }
};

// --- AVATAR BUILDER DRAG LOGIC ---
window.avatarBuilderState = { isDragging: false, activeEl: null, startX: 0, startY: 0, initialX: 0, initialY: 0 };

window.initAvatarDragStart = function(e) {
    if (e.target.tagName.toLowerCase() === 'img') e.preventDefault();
    window.avatarBuilderState.activeEl = e.currentTarget;
    window.avatarBuilderState.isDragging = true;
    window.avatarBuilderState.startX = e.clientX;
    window.avatarBuilderState.startY = e.clientY;
    window.avatarBuilderState.initialX = parseInt(window.avatarBuilderState.activeEl.style.left) || 0;
    window.avatarBuilderState.initialY = parseInt(window.avatarBuilderState.activeEl.style.top) || 0;
    
    document.addEventListener('mousemove', window.avatarDrag);
    document.addEventListener('mouseup', window.avatarDragEnd);
};

window.avatarDrag = function(e) {
    const s = window.avatarBuilderState;
    if (!s.isDragging) return;
    e.preventDefault();
    const newX = s.initialX + (e.clientX - s.startX);
    const newY = s.initialY + (e.clientY - s.startY);
    s.activeEl.style.left = `${newX}px`;
    s.activeEl.style.top = `${newY}px`;
    
    const partId = s.activeEl.getAttribute('data-id');
    const lblX = document.getElementById(`lblX_${partId}`);
    const lblY = document.getElementById(`lblY_${partId}`);
    if (lblX) lblX.textContent = newX;
    if (lblY) lblY.textContent = newY;
};

window.avatarDragEnd = async function(e) {
    const s = window.avatarBuilderState;
    if (!s.isDragging) return;
    s.isDragging = false;
    document.removeEventListener('mousemove', window.avatarDrag);
    document.removeEventListener('mouseup', window.avatarDragEnd);
    
    const partId = s.activeEl.getAttribute('data-id');
    const newX = parseInt(s.activeEl.style.left) || 0;
    const newY = parseInt(s.activeEl.style.top) || 0;
    
    const formData = new FormData();
    formData.append('part_id', partId);
    formData.append('pos_x', newX);
    formData.append('pos_y', newY);
    formData.append('z_index', s.activeEl.style.zIndex || 0);
    
    try {
        await fetch('/admin-dashboard/avatar/save/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: formData
        });
    } catch (err) {}
    s.activeEl = null;
    setTimeout(() => { if (window.loadRoute) window.loadRoute(); }, 200);
};

// --- OUTFIT BUILDER DRAG LOGIC ---
window.outfitBuilderState = { isDragging: false, activeEl: null, startX: 0, startY: 0, initialX: 0, initialY: 0 };

window.initOutfitDragStart = function(e) {
    if (e.target.tagName.toLowerCase() === 'img') e.preventDefault();
    window.outfitBuilderState.activeEl = e.currentTarget;
    window.outfitBuilderState.isDragging = true;
    window.outfitBuilderState.startX = e.clientX;
    window.outfitBuilderState.startY = e.clientY;
    window.outfitBuilderState.initialX = parseInt(window.outfitBuilderState.activeEl.style.left) || 0;
    window.outfitBuilderState.initialY = parseInt(window.outfitBuilderState.activeEl.style.top) || 0;
    
    document.addEventListener('mousemove', window.outfitDrag);
    document.addEventListener('mouseup', window.outfitDragEnd);
};

window.outfitDrag = function(e) {
    const s = window.outfitBuilderState;
    if (!s.isDragging) return;
    e.preventDefault();
    const newX = s.initialX + (e.clientX - s.startX);
    const newY = s.initialY + (e.clientY - s.startY);
    s.activeEl.style.left = `${newX}px`;
    s.activeEl.style.top = `${newY}px`;
    
    const partId = s.activeEl.getAttribute('data-id');
    const lblX = document.getElementById(`lblOx_${partId}`);
    const lblY = document.getElementById(`lblOy_${partId}`);
    if (lblX) lblX.textContent = newX;
    if (lblY) lblY.textContent = newY;
};

window.outfitDragEnd = async function(e) {
    const s = window.outfitBuilderState;
    if (!s.isDragging) return;
    s.isDragging = false;
    document.removeEventListener('mousemove', window.outfitDrag);
    document.removeEventListener('mouseup', window.outfitDragEnd);
    
    const partId = s.activeEl.getAttribute('data-id');
    const newX = parseInt(s.activeEl.style.left) || 0;
    const newY = parseInt(s.activeEl.style.top) || 0;
    
    const formData = new FormData();
    formData.append('part_id', partId);
    formData.append('pos_x', newX);
    formData.append('pos_y', newY);
    const zValue = parseInt(s.activeEl.style.zIndex || 100) - 100;
    formData.append('z_index', zValue);
    
    try {
        await fetch('/admin-dashboard/outfits/parts/save/', { method: 'POST', headers: { 'X-CSRFToken': getCookie('csrftoken') }, body: formData });
    } catch (err) {}
    s.activeEl = null;
    setTimeout(() => { if (window.loadRoute) window.loadRoute(); }, 200);
};

// Global init for scales (runs after AJAX load)
function initDashboardScales() {
    document.querySelectorAll('.avatar-part-draggable, .outfit-mannequin-part, .outfit-part-draggable').forEach(el => {
        let sc = el.getAttribute('data-scale');
        if (sc) {
            sc = sc.replace(',', '.');
            let img = el.querySelector('img');
            if (img) { img.style.transform = `scale(${sc})`; img.style.transformOrigin = 'top left'; }
        }
    });
}

// Initial run
setTimeout(initDashboardScales, 200);
