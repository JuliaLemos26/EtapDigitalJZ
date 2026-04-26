/*
   LOJINHA - ETAP Digital
   Lógica completa da loja de outfits/roupas do avatar
*/

// Só inicializa quando a página da lojinha é carregada pelo SPA
document.addEventListener('spaPageLoaded', function(e) {
    if (!document.getElementById('lojinha-items-grid')) return;
    lojinhaInit();
});

// Fallback: se a página já está carregada (ex: acesso direto)
if (document.getElementById('lojinha-items-grid')) { lojinhaInit(); }

function lojinhaInit() {
(function() {

    var currentOutfits = [];
    var userPoints = 0;
    var baseAvatarParts = [];
    var currentPage = 1;
    const itemsPerPage = 18;

    // --- QUACK SOUND ---
    const _quackAudio = new Audio('/static/sounds/quack.mp3');
    _quackAudio.volume = 0.6;
    function _playQuack() {
        _quackAudio.currentTime = 0;
        _quackAudio.play().catch(() => {});
    }

    function loadLojinha() {
        Promise.all([
            fetch('/api/lojinha/').then(res => res.json()),
            fetch('/api/profile/').then(res => res.json())
        ]).then(([lojinhaData, profileData]) => {
            if (lojinhaData.status === 'success') {
                currentOutfits = lojinhaData.outfits || [];
                userPoints = lojinhaData.pontos || 0;
            }
            if (profileData.status === 'success') {
                baseAvatarParts = profileData.avatar_parts || [];
            }
            renderPage(1);
        }).catch(err => {
            console.error("Erro ao carregar dados:", err);
            const grid = document.getElementById('lojinha-items-grid');
            if (grid) grid.innerHTML = '<div class="col-12 text-center" style="padding: 30px; color: #ff5e8d;">Erro de conexão. Por favor, recarregue a página.</div>';
        });
    }

    function renderPage(page) {
        try {
            currentPage = page;
            const grid = document.getElementById('lojinha-items-grid');
            if (!grid) return;
            grid.innerHTML = '';

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedItems = currentOutfits.slice(start, end);

            if (paginatedItems.length === 0) {
                grid.innerHTML = '<div class="col-12 text-center" style="padding: 30px; color: #888;">Nenhum item disponível na lojinha.</div>';
                return;
            }

            paginatedItems.forEach(outfit => {
                try {
                    const col = document.createElement('div');
                    col.className = 'col-lg-2 col-md-4 col-sm-6';

                    const boughtBadge = outfit.purchased
                        ? `<div style="position: absolute; top: 10px; right: 10px; background: #27ae60; color: white; font-size: 10px; padding: 3px 8px; border-radius: 10px; font-weight: bold; z-index: 200;"><i class='bx bx-check'></i> COMPRADO</div>`
                        : '';

                    const authorBadge = outfit.creator
                        ? `<div style='font-size: 10px; color: #666; margin-top: 8px;'>Por: <strong>${outfit.uploader}</strong> <br>c/ <strong>${outfit.creator || '---'}</strong></div>`
                        : `<div style='font-size: 10px; color: #666; margin-top: 8px;'>Por: <strong>${outfit.uploader}</strong></div>`;

                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'item-pequeno-standard';
                    itemDiv.style.cursor = 'pointer';
                    itemDiv.onclick = () => window.openProvador(outfit.id);

                    const stage = document.createElement('div');
                    stage.style.cssText = 'height:240px;width:100%;position:relative;overflow:hidden;background:rgba(255,255,255,0.05);border-radius:15px;margin-bottom:10px;';

                    if ((!outfit.parts || outfit.parts.length === 0) && outfit.preview_image) {
                        const fallbackImg = document.createElement('img');
                        fallbackImg.src = outfit.preview_image;
                        fallbackImg.style.cssText = 'width:100%;height:100%;object-fit:contain;';
                        stage.appendChild(fallbackImg);
                    } else {
                        const inner = document.createElement('div');
                        inner.style.cssText = 'width:400px;height:500px;position:absolute;top:0;left:50%;margin-left:-90px;transform:scale(0.45);transform-origin:top left;pointer-events:none;';

                        const cardParts = [...(outfit.parts || [])];
                        cardParts.sort((a, b) => parseInt(a.z_index || 0) - parseInt(b.z_index || 0));

                        cardParts.forEach(ly => {
                            if (!ly.image) return;
                            const wrapper = document.createElement('div');
                            wrapper.style.cssText = `position:absolute;left:${ly.pos_x || 0}px;top:${ly.pos_y || 0}px;z-index:${parseInt(ly.z_index || 0) + 100};`;

                            const img = document.createElement('img');
                            img.src = ly.image;
                            img.style.cssText = `max-width:none;max-height:none;border-radius:0;transform:scale(${ly.scale || 1.0});transform-origin:top left;`;

                            wrapper.appendChild(img);
                            inner.appendChild(wrapper);
                        });
                        stage.appendChild(inner);
                    }

                    itemDiv.innerHTML = boughtBadge;
                    itemDiv.appendChild(stage);
                    itemDiv.innerHTML += `
                        <div class="item-info-lojinha">
                            <h4>${outfit.name}</h4>
                            <div class="price-tag-lojinha">
                                <i class='bx bxs-star'></i> ${outfit.price}
                            </div>
                            ${authorBadge}
                        </div>`;

                    col.appendChild(itemDiv);
                    grid.appendChild(col);
                } catch (e) {
                    console.error("Erro ao renderizar card de outfit:", e);
                }
            });

            renderPagination();
        } catch (err) {
            console.error("Erro geral na vitrine:", err);
        }
    }

    function renderPagination() {
        const totalPages = Math.ceil(currentOutfits.length / itemsPerPage);
        const pagination = document.getElementById('lojinha-pagination');
        if (!pagination) return;
        if (totalPages <= 1) { pagination.innerHTML = ''; return; }

        let html = '';
        if (currentPage > 1) html += `<a class="prev page-numbers" href="javascript:;" onclick="window.renderLojinhaPage(${currentPage - 1})">prev</a>`;
        for (let i = 1; i <= totalPages; i++) {
            html += i === currentPage
                ? `<span aria-current="page" class="page-numbers current">${i}</span>`
                : `<a class="page-numbers" href="javascript:;" onclick="window.renderLojinhaPage(${i})">${i}</a>`;
        }
        if (currentPage < totalPages) html += `<a class="next page-numbers" href="javascript:;" onclick="window.renderLojinhaPage(${currentPage + 1})">next</a>`;
        pagination.innerHTML = html;
    }

    window.renderLojinhaPage = function(page) { renderPage(page); };

    window.sortOutfits = function(type) {
        if (type === 'price_asc') currentOutfits.sort((a, b) => a.price - b.price);
        else if (type === 'price_desc') currentOutfits.sort((a, b) => b.price - a.price);
        else currentOutfits.sort((a, b) => b.id - a.id);
        renderPage(1);
        const toggle = document.getElementById('dropdown-toggle');
        if (toggle) toggle.checked = false;
    };

    window.openProvador = function(outfitId) {
        _playQuack();
        const outfit = currentOutfits.find(o => o.id === outfitId);
        if (!outfit) return;

        const stage = document.getElementById('provador-stage');
        if (!stage) return;
        stage.innerHTML = '';

        const breathe = document.createElement('div');
        breathe.className = 'duck-mini-breathe';
        breathe.style.cssText = 'position:absolute;inset:0;transform-origin:bottom center;';
        stage.appendChild(breathe);

        const baseParts = (baseAvatarParts || []).map(p => ({ ...p, is_base: true }));
        const outfitParts = (outfit.parts || []).map(p => ({ ...p, is_base: false }));
        const allParts = [...baseParts, ...outfitParts].sort((a, b) => parseInt(a.z_index || 0) - parseInt(b.z_index || 0));

        allParts.forEach(p => {
            if (!p.image) return;
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `position:absolute;left:${p.pos_x || 0}px;top:${p.pos_y || 0}px;z-index:${p.is_base ? 100 : (parseInt(p.z_index || 0) + 100)};pointer-events:none;`;

            const img = document.createElement('img');
            img.src = p.image;
            img.dataset.label = p.label || '';
            img.style.cssText = `max-width:none;max-height:none;display:block;border-radius:0;transform:scale(${p.scale || 1.0});transform-origin:top left;`;

            wrapper.appendChild(img);
            breathe.appendChild(wrapper);
        });

        // Blink logic
        const eyeWrappers = Array.from(breathe.children).filter(w => {
            const img = w.querySelector('img');
            const label = (img ? img.dataset.label || '' : '').toLowerCase();
            return label.includes('olho') || label.includes('eye');
        });
        const openEyes = eyeWrappers.filter(w => {
            const label = (w.querySelector('img').dataset.label || '').toLowerCase();
            return !label.includes('fechad') && !label.includes('pisc');
        });
        const closedEyes = eyeWrappers.filter(w => {
            const label = (w.querySelector('img').dataset.label || '').toLowerCase();
            return label.includes('fechad') || label.includes('pisc');
        });

        if (closedEyes.length > 0) {
            closedEyes.forEach(e => e.style.opacity = '0');
            const blinkInterval = setInterval(() => {
                const holder = document.getElementById('js-provador-holder');
                if (!holder || !holder.classList.contains('show')) { clearInterval(blinkInterval); return; }
                openEyes.forEach(e => e.style.opacity = '0');
                closedEyes.forEach(e => e.style.opacity = '1');
                setTimeout(() => {
                    openEyes.forEach(e => e.style.opacity = '1');
                    closedEyes.forEach(e => e.style.opacity = '0');
                }, 150);
            }, 4000);
        }

        document.getElementById('provador-item-name').innerText = outfit.name;
        document.getElementById('provador-item-price').innerText = outfit.price;
        document.getElementById('provador-item-author').innerHTML = outfit.creator
            ? `Por <strong>${outfit.uploader}</strong> c/ <strong>${outfit.creator}</strong>`
            : `Por <strong>${outfit.uploader}</strong>`;

        const btn = document.getElementById('btn-comprar-outfit');
        const msg = document.getElementById('provador-msg');
        msg.innerText = '';

        if (outfit.purchased) {
            btn.style.background = '#27ae60';
            btn.innerHTML = "<i class='bx bx-check'></i> Já Possui";
            btn.disabled = true; btn.style.cursor = 'not-allowed'; btn.style.opacity = '0.8';
        } else if (userPoints < outfit.price) {
            btn.style.background = '#aaa';
            btn.innerHTML = "<i class='bx bx-block'></i> Pontos Insuficientes";
            btn.disabled = true; btn.style.cursor = 'not-allowed'; btn.style.opacity = '0.8';
        } else {
            btn.style.background = 'linear-gradient(135deg, #e75e8d 0%, #fd4a8b 100%)';
            btn.innerHTML = "<i class='bx bxs-cart-add'></i> Adquirir agora";
            btn.disabled = false; btn.style.cursor = 'pointer'; btn.style.opacity = '1';
            btn.onclick = () => window.buyOutfit(outfit.id);
        }

        document.getElementById('js-provador-overlay').classList.add('show');
        document.getElementById('js-provador-holder').classList.add('show');
    };

    window.buyOutfit = function(outfitId) {
        const formData = new FormData();
        formData.append('outfit_id', outfitId);
        const btn = document.getElementById('btn-comprar-outfit');
        btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Processando...";
        btn.disabled = true;

        fetch('/api/lojinha/buy/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            const msg = document.getElementById('provador-msg');
            if (data.status === 'success') {
                msg.style.color = '#27ae60';
                msg.innerText = data.message;
                userPoints = data.new_pontos;
                btn.style.background = '#27ae60';
                btn.innerHTML = "<i class='bx bx-check'></i> Comprado com Sucesso";
                if (window.updateAllPointsDisplay) window.updateAllPointsDisplay(userPoints);
                const outfit = currentOutfits.find(o => o.id === outfitId);
                if (outfit) outfit.purchased = true;
                setTimeout(() => {
                    renderPage(currentPage);
                    document.getElementById('js-provador-overlay').classList.remove('show');
                    document.getElementById('js-provador-holder').classList.remove('show');
                }, 1500);
            } else {
                msg.style.color = '#e74c3c';
                msg.innerText = data.message;
                btn.innerHTML = "<i class='bx bx-error'></i> Erro na Compra";
                btn.disabled = false;
            }
        }).catch(() => {
            const msg = document.getElementById('provador-msg');
            if (msg) msg.innerText = "Erro ao se conectar...";
        });
    };

    window.closeProvador = function() {
        const overlay = document.getElementById('js-provador-overlay');
        const holder = document.getElementById('js-provador-holder');
        if (overlay) overlay.classList.remove('show');
        if (holder) holder.classList.remove('show');
    };

    // Ligar botões de fechar ao abrir o provador (o modal já está no DOM)
    const _closeBtn = document.getElementById('js-provador-close');
    const _overlay = document.getElementById('js-provador-overlay');
    if (_closeBtn) _closeBtn.onclick = window.closeProvador;
    if (_overlay) _overlay.onclick = (e) => { if (e.target === _overlay) window.closeProvador(); };

    // Iniciar loja
    loadLojinha();
})();
} // fim lojinhaInit
