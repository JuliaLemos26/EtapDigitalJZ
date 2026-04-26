/* 
   AVATAR EDITOR LOGIC - ETAP Digital
   Lógica para o Configurador de Avatar (Arraste, Z-index e Salvamento)
*/

let parts = [];
let selectedId = null;
let draggingPart = null;
let offset = { x: 0, y: 0 };

function initAvatarEditor() {
    const items = document.querySelectorAll('.layer-item');
    items.forEach(item => {
        const config = {
            id: item.dataset.id,
            x: parseInt(item.dataset.x) || 100,
            y: parseInt(item.dataset.y) || 100,
            z: parseInt(item.dataset.z) || 10,
            scale: parseFloat(item.dataset.scale) || 1.0,
            img: item.dataset.img
        };
        parts.push(config);
        renderPart(config);
    });
}

function renderPart(config) {
    const stage = document.getElementById('avatar-stage');
    if (!stage) return;
    
    let img = document.getElementById(`part-${config.id}`);
    
    if (!img) {
        img = document.createElement('img');
        img.id = `part-${config.id}`;
        img.src = config.img;
        img.className = 'avatar-part-rendered';
        img.setAttribute('draggable', 'false');
        
        img.addEventListener('mousedown', (e) => {
            e.preventDefault();
            draggingPart = config;
            offset.x = e.clientX - config.x;
            offset.y = e.clientY - config.y;
            selectLayer(config.id);
        });
        
        stage.appendChild(img);
    }
    
    img.style.left = config.x + 'px';
    img.style.top = config.y + 'px';
    img.style.zIndex = config.z;
    img.style.transform = `scale(${config.scale})`;
}

function selectLayer(id) {
    selectedId = id;
    document.querySelectorAll('.layer-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.avatar-part-rendered').forEach(el => el.classList.remove('selected'));
    
    const item = document.querySelector(`.layer-item[data-id="${id}"]`);
    if (item) item.classList.add('active');
    
    const img = document.getElementById(`part-${id}`);
    if (img) img.classList.add('selected');
    
    const config = parts.find(p => p.id == id);
    if (config) {
        const panel = document.getElementById('controls-panel');
        if (panel) panel.style.display = 'block';
        
        const ctrlX = document.getElementById('ctrl-x');
        const ctrlY = document.getElementById('ctrl-y');
        const ctrlScale = document.getElementById('ctrl-scale');
        
        if (ctrlX) ctrlX.value = config.x;
        if (ctrlY) ctrlY.value = config.y;
        if (ctrlScale) ctrlScale.value = config.scale;
    }
}

function updatePartFromInputs() {
    if (!selectedId) return;
    const config = parts.find(p => p.id == selectedId);
    if (config) {
        config.x = parseInt(document.getElementById('ctrl-x').value);
        config.y = parseInt(document.getElementById('ctrl-y').value);
        config.scale = parseFloat(document.getElementById('ctrl-scale').value);
        renderPart(config);
    }
}

window.addEventListener('mousemove', (e) => {
    if (draggingPart) {
        draggingPart.x = e.clientX - offset.x;
        draggingPart.y = e.clientY - offset.y;
        renderPart(draggingPart);
        
        if (selectedId == draggingPart.id) {
            const ctrlX = document.getElementById('ctrl-x');
            const ctrlY = document.getElementById('ctrl-y');
            if (ctrlX) ctrlX.value = draggingPart.x;
            if (ctrlY) ctrlY.value = draggingPart.y;
        }
    }
});

window.addEventListener('mouseup', () => { draggingPart = null; });

function changeZ(id, delta) {
    const config = parts.find(p => p.id == id);
    if (config) {
        config.z += delta;
        renderPart(config);
        const item = document.querySelector(`.layer-item[data-id="${id}"] .z-val`);
        if (item) item.innerText = config.z;
    }
}

function deletePart(id, csrfToken) {
    if (confirm("Tem certeza que deseja apagar permanentemente esta peça?")) {
        fetch(`/admin-dashboard/avatar/${id}/delete/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': csrfToken }
        }).then(res => res.json()).then(data => {
            if (data.status === 'success') location.reload();
            else alert("Erro ao apagar");
        });
    }
}

function saveAllAvatarConfig(csrfToken) {
    fetch('/admin-dashboard/avatar/save/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({ parts: parts })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') alert("Configurações salvas!");
        else alert("Erro ao salvar");
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('avatar-stage')) {
        initAvatarEditor();
    }
});
