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
    formpost: '/pages/formpost/'
  };

  function normalizeRoute(hash) {
    return (hash || '').replace(/^#\/?/, '').trim() || 'home';
  }

  function loadRoute() {
    const route = normalizeRoute(window.location.hash);
    const url = routeToFileMap[route] || routeToFileMap['home'];

    fetch(url, { credentials: 'include' })
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
