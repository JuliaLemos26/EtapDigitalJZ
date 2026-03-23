document.addEventListener('DOMContentLoaded', () => {
  let sidebar = document.querySelector(".sidebar");
  let closeBtn = document.querySelector("#btn");
  let searchBtn = document.querySelector(".bx-search");
  const container = document.querySelector('.home-section');
  if (!container) return;

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      menuBtnChange();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      menuBtnChange();
    });
  }

  function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
      closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else {
      closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
  }

  const routeToFileMap = {
    home: '/pages/home/',
    tarefas: '/pages/tarefas/',
    concursos: '/pages/concursos/',
    eventos: '/pages/eventos/',
    projetos: '/pages/projetos/',
    angariacoes: '/pages/angariacoes/',
    lojinha: '/pages/lojinha/',
    formpost: '/pages/formpost/',
    meusarquivos: '/publications/meus-arquivos/'
  };

  function normalizeRoute(hash) {
    return (hash || '').replace(/^#\/?/, '').trim() || 'home';
  }

  function loadRoute() {
    const fullRoute = (window.location.hash || '').replace(/^#\/?/, '').trim() || 'home';
    const [route, queryString] = fullRoute.split('?');
    const baseUrl = routeToFileMap[route] || routeToFileMap['home'];
    const fetchUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    fetch(fetchUrl, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Não foi possível carregar a página');
        return res.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 1. Injetar Estilos e Fontes de forma acumulativa (Final do Head)
        const headResources = doc.head.querySelectorAll('link, style');
        headResources.forEach(res => {
          const href = res.getAttribute('href');
          if (href) {
            const baseHref = href.split('?')[0];
            // Se o recurso já existe, não duplicamos
            if (!document.head.querySelector(`link[href*="${baseHref}"]`)) {
              const newRes = document.createElement('link');
              Array.from(res.attributes).forEach(attr => newRes.setAttribute(attr.name, attr.value));
              document.head.appendChild(newRes);
              console.log('📥 CSS Injetado (Acumulativo):', baseHref);
            }
          } else if (res.tagName === 'STYLE') {
            const newStyle = document.createElement('style');
            newStyle.textContent = res.textContent;
            document.head.appendChild(newStyle);
          }
        });

        // 2. Extrair e Injetar Conteúdo
        container.innerHTML = doc.body.innerHTML;
        setActiveLink(route);

        // 3. Executar Scripts
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(oldScript => {
          const src = oldScript.getAttribute('src');
          if (src) {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            document.body.appendChild(newScript);
          } else if (oldScript.innerHTML.trim()) {
            const newScript = document.createElement('script');
            newScript.text = oldScript.innerHTML;
            document.body.appendChild(newScript);
          }
        });

        console.log(`Página [${route}] sincronizada.`);
        document.dispatchEvent(new CustomEvent('spaPageLoaded', { detail: { route } }));
      })
      .catch(err => console.error(err));
  }

  function setActiveLink(route) {
    document.querySelectorAll('.nav-list a[href^="#/"]').forEach(a => {
      const hrefRoute = a.getAttribute('href').replace(/^#\/?/, '');
      a.classList.toggle('active', hrefRoute === route);
    });
  }

  function navigate(route) {
    if (window.location.hash !== `#/${route}`) {
      window.location.hash = `#/${route}`;
    } else {
      loadRoute();
    }
  }

  window.addEventListener('hashchange', loadRoute);
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-list a[href^="#/"]');
    if (link) {
      e.preventDefault();
      const route = link.getAttribute('href').replace(/^#\/?/, '');
      navigate(route);
    }
  });

  // Inicializa
  if (!window.location.hash) {
    navigate('home');
  } else {
    loadRoute();
  }
});

// Função Global para abrir o Modal de Posts
window.openPostModal = function (element) {
  const overlay = document.getElementById("js-modal-overlay");
  const modal = document.getElementById("js-modal-holder");

  if (!overlay || !modal) return;

  // Extrair dados do elemento clicado
  const title = element.getAttribute("data-title");
  const authorPrimary = element.getAttribute("data-author-primary");
  const authorSecondary = element.getAttribute("data-author-secondary");
  const content = element.getAttribute("data-content");
  const image = element.getAttribute("data-image");
  const course = element.getAttribute("data-course");
  const year = element.getAttribute("data-year");
  const start = element.getAttribute("data-start");
  const end = element.getAttribute("data-end") || element.getAttribute("data-expiry");
  const link = element.getAttribute("data-link");
  const documentPath = element.getAttribute("data-document");
  const color = element.getAttribute("data-color") || "#f8a5c2";
  const postId = element.getAttribute("data-post-id");

  // Determinar o tipo real: Priorizar data-attribute, fallback para hash
  let postType = element.getAttribute("data-post-type");
  if (!postType) {
      if (window.location.hash.includes('concursos')) postType = 'concurso';
      else if (window.location.hash.includes('eventos')) postType = 'evento';
      else if (window.location.hash.includes('projetos')) postType = 'projeto';
      else postType = 'tarefa';
  }

  // Preencher o Modal - Cabeçalho
  const header = document.querySelector(".modal__header-custom");
  if (header) {
    header.style.backgroundColor = color;
    header.style.color = (color === "#FFE29A" || color === "#A6E4B2") ? "#333" : "#222";
  }

  document.getElementById("popup-titulo").innerText = title || "Sem Título";

  let authorText = "";
  if (authorPrimary && authorSecondary && authorSecondary !== "None" && authorSecondary !== "") {
    authorText = `<i class='bx bxs-user-detail'></i> ${authorPrimary} & ${authorSecondary}`;
  } else if (authorPrimary) {
    authorText = `<i class='bx bxs-user'></i> ${authorPrimary}`;
  }
  document.getElementById("popup-autor").innerHTML = authorText;

  document.getElementById("popup-content").innerText = content || "Sem descrição disponível.";

  const imgElement = document.getElementById("popup-imagem");
  if (imgElement) imgElement.src = image || "";

  const extras = document.getElementById("popup-extras");
  let extrasHtml = "";

  if (course) {
    extrasHtml += `<div class="info-block"><label>Curso</label><div class="content-box">${course}</div></div>`;
  }
  if (year) {
    const yearLabel = (year === "todos") ? "Todos os Anos" : year + "º Ano";
    extrasHtml += `<div class="info-block"><label>Ano</label><div class="content-box">${yearLabel}</div></div>`;
  }
  if (end) {
    extrasHtml += `<div class="info-block"><label>Expira em</label><div class="content-box">${end}</div></div>`;
  }
  if (link && link !== "None" && link !== "") {
    extrasHtml += `<div class="info-block" style="grid-column: span 2;"><label>Link Externo</label><a href="${link}" target="_blank" class="content-box-link">${link}</a></div>`;
  }
  if (documentPath && documentPath !== "None" && documentPath !== "") {
    extrasHtml += `<div class="info-block" style="grid-column: span 2;"><label>Documento</label><a href="${documentPath}" target="_blank" class="content-box-link"><i class='bx bx-file'></i> Visualizar Documento</a></div>`;
  }

  // NOVA LÓGICA: Botões de Inscrição / Gerenciamento
  const authorIds = (element.getAttribute("data-author-ids") || "").split(",");
  const isAuthor = authorIds.includes(window.currentUserId);
  const isSubscribed = element.getAttribute("data-is-subscribed") === "true";
  const userRole = window.userRole || 'aluno';

  if (postType === 'tarefa' || postType === 'concurso') {
      if (isAuthor) {
          extrasHtml += `
            <div class="info-block" style="grid-column: span 2; margin-top: 15px; margin-bottom: 30px;">
              <button class="btn-manage" onclick="openManageInscriptions('${postType}', '${postId}', '${color}')" 
                style="background: transparent; color: ${color}; width: 100%; height: 45px; border-radius: 25px; font-weight: 600; border: 2px solid ${color}; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.05);"
                onmouseover="this.style.background='${color}'; this.style.color='white';" 
                onmouseout="this.style.background='transparent'; this.style.color='${color}';">
                <i class='bx bx-group'></i> Ver Inscrições Recebidas
              </button>
            </div>`;
      } else if (userRole === 'aluno' && !isAuthor) {
          const btnText = isSubscribed ? "Cancelar Minha Inscrição" : "Inscrever-se Agora";
          const btnColor = isSubscribed ? "#ff4d4d" : color;
          const actualAction = isSubscribed ? "cancelarInscricao" : "openInscriptionModal";
          
          extrasHtml += `
            <div class="info-block" style="grid-column: span 2; margin-top: 15px; margin-bottom: 30px;">
              <button class="btn-subscribe" onclick="${actualAction}('${postType}', '${postId}', '${color}')" 
                style="background: transparent; color: ${btnColor}; width: 100%; height: 45px; border-radius: 25px; font-weight: 700; border: 2px solid ${btnColor}; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.05);"
                onmouseover="this.style.background='${btnColor}'; this.style.color='white';" 
                onmouseout="this.style.background='transparent'; this.style.color='${btnColor}';">
                <i class='bx bx-edit'></i> ${btnText}
              </button>
            </div>`;
      }
  }

  extrasHtml += '<div style="height: 50px; width: 100%; grid-column: span 2;"></div>';
  extras.innerHTML = extrasHtml;
  overlay.classList.add("show");
  modal.classList.add("show");
};

// --- Inscription Flow ---

window.openInscriptionModal = function(type, id, color) {
    const mainModal = document.getElementById("js-modal-holder");
    const insOverlay = document.getElementById("js-inscription-overlay");
    const insModal = document.getElementById("js-inscription-holder");
    const header = document.getElementById("inscription-header");
    const form = document.getElementById("inscription-form");
    
    // Resetar formulário para limpar dados anteriores
    if (form) form.reset();
    
    // Cor do Modal
    if (header && color) {
        header.style.backgroundColor = color;
        const confirmBtn = form.querySelector('button[type="submit"]');
        if (confirmBtn) confirmBtn.style.backgroundColor = color;
    }
    
    // Fechar modal de detalhes
    if (mainModal) mainModal.classList.remove("show");
    
    // Preparar modal de inscrição
    document.getElementById("ins-post-id").value = id;
    document.getElementById("ins-post-type").value = type;
    
    const fileField = document.getElementById("ins-file-field");
    const fileInput = document.getElementById("ins-file-input");
    if (type === 'concurso') {
        fileField.style.display = 'block';
        fileInput.required = true;
    } else {
        fileField.style.display = 'none';
        fileInput.required = false;
    }
    
    insOverlay.classList.add("show");
    insModal.classList.add("show");
};

window.openManageInscriptions = function(type, id, color) {
    const mainModal = document.getElementById("js-modal-holder");
    const manageOverlay = document.getElementById("js-manage-overlay");
    const manageModal = document.getElementById("js-manage-holder");
    const container = document.getElementById("manage-list-container");
    const header = document.getElementById("manage-header");
    
    // Cor do Modal
    if (header && color) {
        header.style.backgroundColor = color;
    }

    if (mainModal) mainModal.classList.remove("show");
    
    container.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 40px;"><i class="bx bx-loader-alt bx-spin" style="font-size: 30px; color: #6C9FF9;"></i></div>';
    
    manageOverlay.classList.add("show");
    manageModal.classList.add("show");
    
    fetch(`/publications/listar-inscricoes/${type}/${id}/`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (data.inscricoes.length === 0) {
                    container.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 40px; color: #888;">Nenhuma inscrição recebida ainda.</div>';
                } else {
                    container.innerHTML = data.inscricoes.map(ins => `
                        <div class="ins-card" onclick="openInscriptionDetail(${ins.id}, '${color}')" style="background: #f9f9f9; padding: 15px; border-radius: 12px; border: 1px solid #eee; cursor: pointer; transition: all 0.2s;">
                            <h5 style="margin: 0; font-size: 15px; color: #333;">${ins.titulo}</h5>
                            <span style="font-size: 12px; color: #888;"><i class='bx bx-user'></i> ${ins.username}</span>
                        </div>
                    `).join('');
                }
            } else {
                container.innerHTML = `<div style="grid-column: span 2; color: red;">${data.error}</div>`;
            }
        });
};

window.openInscriptionDetail = function(id, color) {
    const detailOverlay = document.getElementById("js-ins-detail-overlay");
    const detailModal = document.getElementById("js-ins-detail-holder");
    const header = document.getElementById("ins-detail-header");
    
    if (header && color) header.style.backgroundColor = color;
    
    fetch(`/publications/detalhes-inscricao/${id}/`)
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                const d = result.data;
                document.getElementById("det-ins-titulo").innerText = d.titulo;
                document.getElementById("det-ins-user").innerText = d.username;
                document.getElementById("det-ins-desc").innerText = d.descricao;
                
                const fileContainer = document.getElementById("det-ins-file-container");
                if (d.arquivo_url) {
                    fileContainer.style.display = 'block';
                    document.getElementById("det-ins-file").innerHTML = `<a href="${d.arquivo_url}" target="_blank" style="color: ${color || '#6C9FF9'}; font-weight: 600;"><i class='bx bx-download'></i> Baixar ${d.arquivo_nome}</a>`;
                } else {
                    fileContainer.style.display = 'none';
                }
                
                detailOverlay.classList.add("show");
                detailModal.classList.add("show");
            } else {
                alert(result.error);
            }
        });
};

// Fechar todos os modais e overlays (Limpa o Blur)
window.closeAllModals = function() {
    const overlays = [
        "js-modal-overlay", "js-crud-overlay", "js-inscription-overlay", 
        "js-manage-overlay", "js-ins-detail-overlay"
    ];
    const modals = [
        "js-modal-holder", "js-crud-holder", "js-inscription-holder", 
        "js-manage-holder", "js-ins-detail-holder"
    ];

    overlays.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove("show");
    });
    modals.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove("show");
    });
};

// Listeners de Fecho
document.addEventListener('DOMContentLoaded', () => {
    // Configurações de fecho para cada par overlay/modal
    const configs = [
        { overlay: 'js-inscription-overlay', modal: 'js-inscription-holder', close: 'js-inscription-close' },
        { overlay: 'js-manage-overlay', modal: 'js-manage-holder', close: 'js-manage-close' },
        { overlay: 'js-ins-detail-overlay', modal: 'js-ins-detail-holder', close: 'js-ins-detail-close' },
        { overlay: 'js-modal-overlay', modal: 'js-modal-holder', close: 'js-close-button' },
        { overlay: 'js-crud-overlay', modal: 'js-crud-holder', close: 'js-crud-close' }
    ];
    
    configs.forEach(cfg => {
        const ov = document.getElementById(cfg.overlay);
        const md = document.getElementById(cfg.modal);
        const cl = document.getElementById(cfg.close);
        
        if (cl) cl.onclick = () => closeAllModals();
        if (ov) ov.onclick = (e) => { if (e.target === ov) closeAllModals(); };
    });

    const insForm = document.getElementById("inscription-form");
    if (insForm) {
        insForm.onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            fetch('/publications/fazer-inscricao/', {
                method: 'POST',
                body: formData,
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    closeAllModals();
                    loadRoute();
                    // Fallback se loadRoute não recarregar tudo
                    setTimeout(() => { if(window.location.hash.includes('meus_arquivos')) loadRoute(); }, 500);
                } else {
                    alert("Erro: " + data.error);
                }
            });
        };
    }
});

// --- CRUD Logic (Global Scope) ---
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

function closeCrudModal() {
  const crudOverlay = document.getElementById("js-crud-overlay");
  const crudModal = document.getElementById("js-crud-holder");
  if (crudModal) crudModal.classList.remove("show");
  if (crudOverlay) crudOverlay.classList.remove("show");
}

window.confirmDelete = (type, id) => {
  if (confirm("Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.")) {
    fetch(`/publications/delete/${type}/${id}/`, {
      method: 'POST',
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        const currentPage = window.location.hash.substring(1) || 'home';
        if (typeof loadRoute === 'function') loadRoute(currentPage);
        else window.location.reload();
      } else {
        alert("Erro: " + data.error);
      }
    });
  }
};

window.openEditModal = (type, id) => {
  const crudOverlay = document.getElementById("js-crud-overlay");
  const crudModal = document.getElementById("js-crud-holder");
  if (!crudOverlay || !crudModal) return;

  crudOverlay.classList.add("show");
  crudModal.classList.add("show");
  const container = document.getElementById("crud-form-content");
  container.innerHTML = '<div style="text-align:center;padding:40px;"><i class="bx bx-loader-alt bx-spin" style="font-size:30px;color:#6C9FF9;"></i></div>';
  
  document.getElementById("edit-post-id").value = id;
  document.getElementById("edit-post-type").value = type;

  fetch(`/publications/get-data/${type}/${id}/`)
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        renderEditForm(type, result.data);
      } else {
        container.innerHTML = `<p style="color:red;text-align:center;">${result.error}</p>`;
      }
    });
};

function renderEditForm(type, data) {
  const container = document.getElementById("crud-form-content");
  let html = `
    <div style="margin-bottom:15px;">
      <label style="display:block;margin-bottom:5px;font-weight:600;color:#555;">Título</label>
      <input type="text" name="title" value="${data.title}" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;" required>
    </div>
    <div style="margin-bottom:15px;">
      <label style="display:block;margin-bottom:5px;font-weight:600;color:#555;">Descrição</label>
      <textarea name="content" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;min-height:120px;" required>${data.content}</textarea>
    </div>
  `;

  if (type === 'tarefa' || type === 'concurso' || type === 'projeto' || type === 'evento') {
     html += `
       <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">
          <div>
              <label style="display:block;margin-bottom:5px;font-weight:600;color:#555;">Curso</label>
              <select name="course" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;">
                  <option value="GPSI" ${data.course === 'GPSI' ? 'selected' : ''}>Sistemas Informáticos</option>
                  <option value="MULT" ${data.course === 'MULT' ? 'selected' : ''}>Multimédia</option>
                  <option value="AG" ${data.course === 'AG' ? 'selected' : ''}>Artes Gráficas</option>
                  <option value="SJ" ${data.course === 'SJ' ? 'selected' : ''}>Jurídicos</option>
                  <option value="CAB" ${data.course === 'CAB' ? 'selected' : ''}>Cabeleireiro</option>
                  <option value="nenhum" ${data.course === 'nenhum' ? 'selected' : ''}>Todos</option>
              </select>
          </div>
          <div>
              <label style="display:block;margin-bottom:5px;font-weight:600;color:#555;">Ano</label>
              <select name="school_year" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;">
                  <option value="10" ${data.school_year === '10' ? 'selected' : ''}>10º Ano</option>
                  <option value="11" ${data.school_year === '11' ? 'selected' : ''}>11º Ano</option>
                  <option value="12" ${data.school_year === '12' ? 'selected' : ''}>12º Ano</option>
                  <option value="todos" ${data.school_year === 'todos' ? 'selected' : ''}>Todos</option>
              </select>
          </div>
       </div>
     `;
  }

  if (data.end_date !== undefined) {
      html += `
        <div style="margin-bottom:15px;">
          <label style="display:block;margin-bottom:5px;font-weight:600;color:#555;">Data Limite</label>
          <input type="datetime-local" name="end_date" value="${data.end_date || ''}" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;">
        </div>
      `;
  }

  if (data.link !== undefined) {
      html += `
        <div style="margin-bottom:15px;">
          <label style="display:block;margin-bottom:5px;font-weight:600;color:#555;">Link Externo</label>
          <input type="url" name="link" value="${data.link || ''}" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;">
        </div>
      `;
  }

  html += `
    <div style="margin-bottom:10px;">
      <label style="display:block;margin-bottom:5px;font-weight:600;color:#555;">Atualizar Imagem (Opcional)</label>
      <input type="file" name="image" accept="image/*" style="font-size:13px;">
    </div>
  `;

  container.innerHTML = html;
}

// Inicializar listeners de fecho globais
document.addEventListener('DOMContentLoaded', () => {
    const crudOverlay = document.getElementById("js-crud-overlay");
    const crudClose = document.getElementById("js-crud-close");
    const crudCancel = document.getElementById("js-crud-cancel");
    const crudForm = document.getElementById("crud-form");

    [crudClose, crudCancel, crudOverlay].forEach(btn => {
        if (btn) btn.addEventListener('click', (e) => {
            if (e.target === btn || btn !== crudOverlay) closeCrudModal();
        });
    });

    if (crudForm) {
        crudForm.onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const type = document.getElementById("edit-post-type").value;
            const id = document.getElementById("edit-post-id").value;

            fetch(`/publications/edit/${type}/${id}/`, {
                method: 'POST',
                body: formData,
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    closeCrudModal();
                    const currentPage = window.location.hash.substring(1) || 'home';
                    if (typeof loadRoute === 'function') loadRoute(currentPage);
                    else window.location.reload();
                } else {
                    alert("Erro ao salvar: " + data.error);
                }
            });
        };
    }
});
