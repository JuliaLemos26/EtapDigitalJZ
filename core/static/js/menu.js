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
      closeBtn.classList.replace("bx-menu-alt-right","bx-menu");
    }
  }

const routeToFileMap = {
  home: '/pages/home/',
  tarefas: '/pages/tarefas/',
  concursos: '/pages/concursos/',
  eventos: '/pages/eventos/',
  projetos: '/pages/projetos/',
  angariacoes: '/pages/angariacoes/',
  lojinha: '/pages/lojinha/'
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
        container.innerHTML = html;
        setActiveLink(route);
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
