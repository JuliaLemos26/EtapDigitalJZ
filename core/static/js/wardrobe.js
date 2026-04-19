/**
 * Wardrobe Modal Logic (Camarim Style)
 */

let purchasedOutfits = [];
let baseAvatarParts = [];
let activeOutfitId = null;

function openWardrobeModal() {
    const overlay = document.getElementById("js-wardrobe-overlay");
    const modal = document.getElementById("js-wardrobe-holder");
    const profileModal = document.getElementById("js-profile-holder");
    const profileOverlay = document.getElementById("js-profile-overlay");

    if (!overlay || !modal) return;

    // Fechar Modal de Perfil se estiver aberto
    if (profileModal) profileModal.classList.remove("show");
    if (profileOverlay) profileOverlay.classList.remove("show");

    // Mostrar Modal de Guarda-Roupa
    overlay.classList.add("show");
    modal.classList.add("show");

    // Injetar estrutura base se estiver vazia
    const content = document.getElementById("wardrobe-modal-content");
    content.innerHTML = `
        <div class="px-4 py-4" style="background: #fff; border-radius: 20px;">
            <div class="row">
                <div class="col-lg-5">
                    <div class="wardrobe-stage-container">
                        <div class="text-center mb-4">
                            <h2 style="color: #6C9FF9; font-weight: 800; text-transform: uppercase; margin: 0; font-size: 24px; letter-spacing: 2px;">
                                PERSONALIZAR 🦆
                            </h2>
                            <p style="color: #888; font-size: 13px; margin-top: 5px;">Veste o teu patinho com os itens adquiridos</p>
                        </div>
                        <div class="preview-box-wardrobe">
                            <div id="wardrobe-preview-stage-modal" class="wardrobe-preview-stage">
                                <div class="text-center py-5"><div class="spinner-border text-info"></div></div>
                            </div>
                        </div>
                        <div id="wardrobe-active-info" class="text-center mt-4" style="width: 100%;">
                            <div style="font-size: 10px; text-transform: uppercase; color: #aaa; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 8px;">Outfit Atual</div>
                            <div style="background: #f9fbff; padding: 10px; border-radius: 15px; border: 1px solid #ddecff;">
                                <span id="active-outfit-name-modal" style="color: #6C9FF9; font-size: 17px; font-weight: 700;">Pato Básico</span>
                            </div>
                            <div id="unequip-btn-container-modal" style="display: none; margin-top: 15px;">
                                <button onclick="equipOutfitModal('')" class="btn-unequip-modal">
                                    <i class='bx bx-log-out-circle'></i> Remover Roupa Atual
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-7">
                    <div class="wardrobe-collection-card">
                        <h4 class="mb-4" style="color: #e75e8d; font-size: 18px; text-transform: uppercase;">Minha Coleção</h4>
                        <div id="wardrobe-items-grid-modal" class="row gy-3">
                            <div class="col-12 text-center py-5"><div class="spinner-border text-pink"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Carregar Dados
    initWardrobeData();
}

function initWardrobeData() {
    Promise.all([
        fetch('/api/wardrobe/').then(res => res.json()),
        fetch('/api/profile/').then(res => res.json())
    ]).then(([wData, pData]) => {
        purchasedOutfits = wData.outfits || [];
        activeOutfitId = wData.active_id;
        baseAvatarParts = (pData.avatar_parts || []).filter(p => p.is_base);
        
        renderWardrobeModal();
        renderPreviewModal();
    }).catch(err => {
        console.error("Erro no guarda-roupa:", err);
    });
}

function renderWardrobeModal() {
    const grid = document.getElementById('wardrobe-items-grid-modal');
    if(!grid) return;
    grid.innerHTML = '';

    if(purchasedOutfits.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class='bx bx-ghost' style="font-size: 50px; color: #444;"></i>
                <p style="color: #666; margin-top: 10px;">Ainda não tens roupas na tua coleção.</p>
                <div class="mt-4">
                    <a href="#/lojinha" onclick="closeWardrobeModal()" class="btn-use-now-modal" style="display: inline-block; width: auto; padding: 10px 30px;">Ir às Compras</a>
                </div>
            </div>
        `;
        return;
    }

    purchasedOutfits.forEach(outfit => {
        const isActive = outfit.id === activeOutfitId;
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';
        
        col.innerHTML = `
            <div class="wardrobe-item-card ${isActive ? 'active' : ''}" onclick="equipOutfitModal(${outfit.id})">
                ${isActive ? '<div class="equipped-badge-modal"><i class="bx bx-check"></i> EM USO</div>' : ''}
                <div class="item-preview-thumb-modal">
                    <img src="${outfit.preview_image || ''}" alt="${outfit.name}">
                </div>
                <h5 style="color: #fff; font-size: 14px; margin: 0;">${outfit.name}</h5>
                ${isActive ? '' : '<button class="btn-use-now-modal">Usar Agora</button>'}
            </div>
        `;
        grid.appendChild(col);
    });

    const activeName = purchasedOutfits.find(o => o.id === activeOutfitId)?.name || "Pato Básico";
    document.getElementById('active-outfit-name-modal').textContent = activeName;
    document.getElementById('unequip-btn-container-modal').style.display = activeOutfitId ? 'block' : 'none';
}

function renderPreviewModal() {
    const stage = document.getElementById('wardrobe-preview-stage-modal');
    if(!stage) return;
    stage.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'duck-preview-wrapper-modal';
    
    const breathe = document.createElement('div');
    breathe.className = 'duck-mini-breathe';
    breathe.style.position = 'absolute';
    breathe.style.inset = '0';
    breathe.style.transformOrigin = 'bottom center';
    wrapper.appendChild(breathe);

    const activeOutfit = purchasedOutfits.find(o => o.id === activeOutfitId);
    const outfitParts = (activeOutfit?.parts || []).map(p => ({ ...p, is_base: false }));
    const currentBaseParts = baseAvatarParts.map(p => ({ ...p, is_base: true }));
    
    const allParts = [...currentBaseParts, ...outfitParts].sort((a,b) => parseInt(a.z_index||0) - parseInt(b.z_index||0));

    allParts.forEach(p => {
        const layer = document.createElement('div');
        layer.style.position = 'absolute';
        layer.style.left = (p.pos_x || 0) + 'px';
        layer.style.top = (p.pos_y || 0) + 'px';
        layer.style.zIndex = p.is_base ? 100 : (parseInt(p.z_index || 0) + 100);
        
        const img = document.createElement('img');
        img.src = p.image;
        img.dataset.label = p.label || '';
        img.style.maxWidth = 'none';
        img.style.maxHeight = 'none';
        img.style.transform = `scale(${p.scale || 1.0})`;
        img.style.transformOrigin = 'top left';
        
        layer.appendChild(img);
        breathe.appendChild(layer);
    });

    stage.appendChild(wrapper);
    initWardrobeBlinkModal(breathe);
}

window.equipOutfitModal = function(outfitId) {
    const formData = new FormData();
    formData.append('outfit_id', outfitId);

    fetch('/api/wardrobe/equip/', {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
        body: formData
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') {
            activeOutfitId = outfitId || null;
            renderWardrobeModal();
            renderPreviewModal();
            if(window.refreshProfileData) window.refreshProfileData();
        }
    });
};

function initWardrobeBlinkModal(container) {
    const eyeImages = Array.from(container.querySelectorAll('img')).filter(img => {
        const lbl = (img.dataset.label || '').toLowerCase();
        return lbl.includes('olho') || lbl.includes('eye');
    });
    if(eyeImages.length === 0) return;

    const blinkInterval = setInterval(() => {
        if(!document.body.contains(container)) {
            clearInterval(blinkInterval);
            return;
        }
        eyeImages.forEach(img => {
            const originalSrc = img.src;
            if(originalSrc.includes('pisc')) return; 
            const blinkSrc = originalSrc.replace(/\.(png|jpg|jpeg|webp)/, '_pisc.$1');
            img.src = blinkSrc;
            setTimeout(() => { img.src = originalSrc; }, 150);
        });
    }, 4000 + Math.random() * 3000);
}

function closeWardrobeModal() {
    const overlay = document.getElementById("js-wardrobe-overlay");
    const modal = document.getElementById("js-wardrobe-holder");
    if (overlay) overlay.classList.remove("show");
    if (modal) modal.classList.remove("show");
}

// Bind Close Event
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById("js-wardrobe-close");
    const overlay = document.getElementById("js-wardrobe-overlay");
    if (closeBtn) closeBtn.onclick = closeWardrobeModal;
    if (overlay) overlay.onclick = (e) => { if (e.target === overlay) closeWardrobeModal(); };
});
