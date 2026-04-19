// Profile Modal Logic
function openProfileModal() {
    const overlay = document.getElementById("js-profile-overlay");
    const modal = document.getElementById("js-profile-holder");

    if (!overlay || !modal) return;

    // Reset edit state
    document.getElementById("profile-display-name").style.display = "block";
    document.getElementById("btn-edit-profile-name").style.display = "block";
    document.getElementById("profile-edit-name-container").style.display = "none";

    // Fetch data
    fetch('/api/profile/', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById("profile-display-name").innerText = data.username;
                document.getElementById("input-profile-name").value = data.username;
                document.getElementById("profile-course").innerText = data.curso;
            document.getElementById("profile-year").innerText = data.ano;
            if(document.getElementById("select-profile-year")) {
                document.getElementById("select-profile-year").value = data.ano_inicio_raw || "25";
            }
            document.getElementById("profile-points").innerText = data.pontos;

                document.getElementById("duck-name-display").innerText = data.patinho_nome;
                document.getElementById("input-duck-name").value = data.patinho_nome === "Qual o nome do seu patinho etap?" ? "" : data.patinho_nome;

                // Render Avatar Paper Doll
                const avatarContainer = document.querySelector('.profile-avatar-placeholder');
                if (avatarContainer && data.avatar_parts && data.avatar_parts.length > 0) {
                    avatarContainer.innerHTML = ''; // Clean previous structure
                    
                    const breatheDiv = document.createElement('div');
                    breatheDiv.className = 'duck-animated-breathe';
                    breatheDiv.style.position = 'absolute';
                    breatheDiv.style.width = '400px';
                    breatheDiv.style.height = '500px';
                    
                    // Centralize e dê Scale no container base (400x500 original do builder)
                    const cw = avatarContainer.clientWidth || 300;
                    const ch = avatarContainer.clientHeight || 340;
                    // Multiplicador aumentado para que o pato fique bem maior e mais fofo no perfil!
                    const fitScale = Math.min(cw / 400, ch / 500) * 1.35; 
                    
                    // Calcula margens para centrar o content de 400x500 escalado
                    const leftOffset = (cw - 400) / 2;
                    const topOffset = (ch - 500) / 2;
                    
                    breatheDiv.style.left = leftOffset + 'px';
                    breatheDiv.style.top = topOffset + 'px';
                    breatheDiv.style.transform = `scale(${fitScale})`;
                    breatheDiv.style.transformOrigin = 'center center';
                    breatheDiv.style.pointerEvents = 'none';

                    // Loop nas camadas e renderizar com a MESMA estrutura HTML do construtor
                    data.avatar_parts.forEach(part => {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'avatar-part-wrapper';
                        wrapper.style.position = 'absolute';
                        wrapper.style.left = part.pos_x + 'px';
                        wrapper.style.top = part.pos_y + 'px';
                        
                        // FÓRMULA IDENTICA AO PROVADOR: Base=100, Roupa=100+Z
                        wrapper.style.zIndex = part.is_base ? 100 : (parseInt(part.z_index || 0) + 100);



                        const img = document.createElement('img');
                        img.src = part.image;
                        img.dataset.label = part.label; // For Blink Logic
                        img.style.pointerEvents = 'none';
                        img.style.maxWidth = '400px';
                        img.style.maxHeight = '500px';
                        
                        const scaleNum = part.scale.toString().replace(',', '.');
                        img.style.transform = `scale(${scaleNum})`;
                        img.style.transformOrigin = 'top left';
                        
                        wrapper.appendChild(img);
                        breatheDiv.appendChild(wrapper);
                    });
                    
                    avatarContainer.appendChild(breatheDiv);

                    // --- BLINK LOGIC (PISCAR OS OLHOS) ---
                    const eyeWrappers = Array.from(breatheDiv.children).filter(wrapper => wrapper.children[0] && wrapper.children[0].dataset.label && wrapper.children[0].dataset.label.toLowerCase().includes('olho'));
                    const openEyes = eyeWrappers.filter(w => !w.children[0].dataset.label.toLowerCase().includes('fechad') && !w.children[0].dataset.label.toLowerCase().includes('pisc'));
                    const closedEyes = eyeWrappers.filter(w => w.children[0].dataset.label.toLowerCase().includes('fechad') || w.children[0].dataset.label.toLowerCase().includes('pisc'));
                    
                    if (closedEyes.length > 0) {
                        closedEyes.forEach(e => e.style.opacity = '0');
                        setInterval(() => {
                            openEyes.forEach(e => e.style.opacity = '0');
                            closedEyes.forEach(e => e.style.opacity = '1');
                            setTimeout(() => {
                                openEyes.forEach(e => e.style.opacity = '1');
                                closedEyes.forEach(e => e.style.opacity = '0');
                            }, 150);
                        }, 4000);
                    } else if (openEyes.length > 0) {
                        // Fallback vertical squash on the wrapper
                        openEyes.forEach(e => e.style.transition = 'transform 0.1s');
                        setInterval(() => {
                            openEyes.forEach(e => {
                                const currentScale = e.style.transform.includes('scaleY') ? e.style.transform : e.style.transform + ' scaleY(1)';
                                e.style.transform = currentScale.replace('scaleY(1)', 'scaleY(0.1)'); // Close
                            });
                            setTimeout(() => {
                                openEyes.forEach(e => {
                                    e.style.transform = e.style.transform.replace('scaleY(0.1)', 'scaleY(1)'); // Open
                                });
                            }, 150);
                        }, 4000);
                    }
                    // --- END BLINK LOGIC ---
                    
                    if (!document.getElementById('duckAnims')) {
                        const style = document.createElement('style');
                        style.id = 'duckAnims';
                        // Breath animation: escala o corpo base ligeiramente
                        style.innerHTML = `
                            @keyframes duckBreathe {
                                0% { transform: scale(var(--fit-scale)) scaleY(1); }
                                50% { transform: scale(var(--fit-scale)) scaleY(1.03) translateY(-1px); }
                                100% { transform: scale(var(--fit-scale)) scaleY(1); }
                            }
                            .duck-animated-breathe {
                                --fit-scale: ${fitScale};
                                animation: duckBreathe 3.5s ease-in-out infinite;
                                transform-origin: bottom center !important;
                            }
                        `;
                        document.head.appendChild(style);
                    } else {
                        // Update the var scale variable
                        const style = document.getElementById('duckAnims');
                        style.innerHTML = style.innerHTML.replace(/--fit-scale: [^;]+;/, `--fit-scale: ${fitScale};`);
                    }
                }

                overlay.classList.add("show");
                modal.classList.add("show");
                _startProfileQuack(); // 🦆 Start quacking!
            } else {
                alert("Erro ao carregar perfil: " + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Erro de conexão ao carregar perfil.");
        });
}

// Global Points Update Helper
window.updateAllPointsDisplay = function(newPoints) {
    // 1. Atualiza no Modal de Perfil
    const pts = document.getElementById("profile-points");
    if(pts) pts.innerText = newPoints;
    
    // 2. Atualiza em todos os widgets .score-display da página (topo direito, etc)
    const displays = document.querySelectorAll('.score-display');
    displays.forEach(d => {
        // Preserva o ícone e atualiza o texto (assume formato: <icon> pontos)
        const icon = d.querySelector('i');
        d.innerHTML = '';
        if(icon) d.appendChild(icon);
        d.appendChild(document.createTextNode(' ' + newPoints));
    });
}

// Year Management
window.toggleEditYear = function() {
    const view = document.getElementById("profile-year-view");
    const edit = document.getElementById("profile-year-edit");
    if(view.style.display === "none") {
        view.style.display = "flex";
        edit.style.display = "none";
    } else {
        view.style.display = "none";
        edit.style.display = "flex";
    }
}

window.saveYear = function() {
    const select = document.getElementById("select-profile-year");
    const yearValue = select.value;
    
    const formData = new FormData();
    formData.append('ano_inicio', yearValue);

        fetch('/api/profile/update/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: formData
        })
.then(res => res.json()).then(data => {
        if(data.status === 'success') {
            document.getElementById("profile-year").innerText = data.new_label;
            toggleEditYear();
            alert("Ano escolar atualizado!");
        }
    });
}




// --- QUACK SOUND ---
const _quackAudio = new Audio('/static/sounds/quack.mp3');
_quackAudio.volume = 0.6;
let _quackTimer = null;

function _playQuack() {
    _quackAudio.currentTime = 0;
    _quackAudio.play().catch(() => {}); // Browser may block if no user interaction yet
}

function _startProfileQuack() {
    if (_quackTimer) return;
    _playQuack(); // Quack immediately when duck appears!
    _quackTimer = setInterval(_playQuack, 90000); // Then every 1min 30sec
}

function _stopProfileQuack() {
    if (_quackTimer) { clearInterval(_quackTimer); _quackTimer = null; }
}

function toggleEditProfileName() {
    const display = document.getElementById("profile-display-name");
    const editBtn = document.getElementById("btn-edit-profile-name");
    const container = document.getElementById("profile-edit-name-container");

    if (display.style.display === "none") {
        display.style.display = "block";
        editBtn.style.display = "block";
        container.style.display = "none";
    } else {
        display.style.display = "none";
        editBtn.style.display = "none";
        container.style.display = "flex";
        document.getElementById("input-profile-name").focus();
    }
}

function saveProfileName() {
    const newName = document.getElementById("input-profile-name").value;
    if (!newName) return;

    const formData = new FormData();
    formData.append('username', newName);

    fetch('/api/profile/update/', {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById("profile-display-name").innerText = newName;
            toggleEditProfileName();
            // Optional: Update sidebar if name is shown there
            alert("Nome atualizado com sucesso!");
        } else {
            alert("Erro: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Erro na requisição de atualização.");
    });
}

function toggleEditDuckName() {
    const view = document.getElementById("duck-name-view");
    const edit = document.getElementById("duck-name-edit");

    if (view.style.display === "none") {
        view.style.display = "flex";
        edit.style.display = "none";
    } else {
        view.style.display = "none";
        edit.style.display = "flex";
        document.getElementById("input-duck-name").focus();
    }
}

function saveDuckName() {
    const newName = document.getElementById("input-duck-name").value;
    if (!newName) return;

    const formData = new FormData();
    formData.append('patinho_nome', newName);

    fetch('/api/profile/duck-name/update/', {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById("duck-name-display").innerText = newName;
            toggleEditDuckName();
            alert("Nome do patinho atualizado!");
        } else {
            alert("Erro: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Erro na requisição.");
    });
}

// Close logic
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById("js-profile-overlay");
    const closeBtn = document.getElementById("js-profile-close");

    if (closeBtn) {
        closeBtn.onclick = () => {
            overlay.classList.remove("show");
            document.getElementById("js-profile-holder").classList.remove("show");
            _stopProfileQuack();
        };
    }

    if (overlay) {
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("show");
                document.getElementById("js-profile-holder").classList.remove("show");
                _stopProfileQuack();
            }
        };
    }
});

// Helper function (if not already globally available)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
