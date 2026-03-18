/* Modal Control Logic */

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

  // Preencher o Modal - Conteúdo Principal
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
    extrasHtml += `
      <div class="info-block" style="grid-column: span 2;">
        <label><i class='bx bx-file'></i> Documento de Apoio</label>
        <div class="content-box" style="background: linear-gradient(135deg, #fff5d1 0%, #ffefba 100%); border-color: #ffe29a;">
          <a href="${documentPath}" target="_blank" style="color: #664d03; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <i class='bx bxs-file-pdf'></i> Baixar / Ver Arquivo Enviado
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
