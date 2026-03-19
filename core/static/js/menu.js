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
  const end = element.getAttribute("data-end");
  const link = element.getAttribute("data-link");
  const documentPath = element.getAttribute("data-document");
  const expiry = element.getAttribute("data-expiry");
  const color = element.getAttribute("data-color") || "#f8a5c2";

  // Preencher o Modal - Cabeçalho
  const header = document.querySelector(".modal__header-custom");
  if (header) {
    header.style.backgroundColor = color;
    if (color === "#FFE29A") {
        header.style.color = "#333";
    } else {
        header.style.color = "#222";
    }
  }

  document.getElementById("popup-titulo").innerText = title || "Sem Título";

  let authorText = "";
  if (authorPrimary && authorSecondary && authorSecondary !== "None" && authorSecondary !== "") {
    authorText = `<i class='bx bxs-user-detail'></i> ${authorPrimary} & ${authorSecondary}`;
  } else if (authorPrimary) {
    authorText = `<i class='bx bxs-user'></i> ${authorPrimary}`;
  } else if (authorSecondary && authorSecondary !== "None") {
    authorText = `<i class='bx bxs-user'></i> ${authorSecondary}`;
  }
  document.getElementById("popup-autor").innerHTML = authorText;

  // Preencher o Modal - Conteúdo Principal (Usando innerText para preservar quebras de linha com white-space: pre-wrap no CSS)
  document.getElementById("popup-content").innerText = content || "Sem descrição disponível.";

  // Imagem
  const imgElement = document.getElementById("popup-imagem");
  const imgContainer = document.getElementById("popup-imagem-container");
  if (imgElement) imgElement.src = image || "";

  // Info Extra
  const extras = document.getElementById("popup-extras");
  let extrasHtml = "";

  if (course && course !== "None") {
    extrasHtml += `
      <div class="info-block">
        <label><i class='bx bx-category-alt'></i> Categoria</label>
        <div class="content-box"><i class='bx bx-book-bookmark'></i> ${course}</div>
      </div>`;
  }
  if (year && year !== "None") {
    extrasHtml += `
      <div class="info-block">
        <label><i class='bx bx-graduation'></i> Ano Escolar</label>
        <div class="content-box"><i class='bx bx-user-voice'></i> ${year}</div>
      </div>`;
  }
  if (start && start !== "None") {
    extrasHtml += `
      <div class="info-block">
        <label><i class='bx bx-calendar-event'></i> Início</label>
        <div class="content-box"><i class='bx bx-time-five'></i> ${start}</div>
      </div>`;
  }
  if (end && end !== "None") {
    extrasHtml += `
      <div class="info-block">
        <label><i class='bx bx-calendar-check'></i> Prazo / Fim</label>
        <div class="content-box"><i class='bx bx-alarm-exclamation'></i> ${end}</div>
      </div>`;
  }
  if (expiry && expiry !== "None") {
    extrasHtml += `
      <div class="info-block">
        <label><i class='bx bx-time'></i> Expiração</label>
        <div class="content-box"><i class='bx bx-error-circle'></i> ${expiry}</div>
      </div>`;
  }
  if (link && link !== "" && link !== "None") {
    extrasHtml += `
      <div class="info-block" style="grid-column: span 2;">
        <label><i class='bx bx-link-external'></i> Recurso Externo</label>
        <div class="content-box">
          <a href="${link}" target="_blank" style="color: #444; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <i class='bx bx-globe'></i> Aceder à ligação oficial
          </a>
        </div>
      </div>`;
  }
  if (documentPath && documentPath !== "" && documentPath !== "None") {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const fileExt = documentPath.split('.').pop().toLowerCase();
    const isDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt);
    
    // Se for um documento do Office e não estiver rodando localmente, usamos o Google Docs Viewer
    let finalUrl = documentPath;
    if (isDoc && !isLocal) {
        const absoluteUrl = window.location.origin + documentPath;
        finalUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
    }

    extrasHtml += `
      <div class="info-block" style="grid-column: span 2;">
        <label><i class='bx bx-file'></i> Documento de Apoio</label>
        <div class="content-box">
          <a href="${finalUrl}" target="_blank" style="color: #444; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <i class='bx bx-show'></i> Visualizar Documento Online
          </a>
        </div>
      </div>`;
  }
  extras.innerHTML = extrasHtml;

  // Mostrar Modal
  overlay.classList.add("show");
  modal.classList.add("show");
};

// Event Listeners para fechar o Modal
document.addEventListener('spaPageLoaded', () => {
    // Re-bind listeners se necessário, mas como são triggers fixos no index, 
    // os de fecho podem ficar globais
});

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById("js-modal-overlay");
  const modal = document.getElementById("js-modal-holder");
  const closeBtn = document.getElementById("js-close-button");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("show");
      overlay.classList.remove("show");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        modal.classList.remove("show");
        overlay.classList.remove("show");
      }
    });
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

  if (type === 'tarefa' || type === 'concurso' || type === 'projeto') {
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
