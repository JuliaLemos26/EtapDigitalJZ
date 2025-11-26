let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");


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

// --------- Simple hash router to load pages inside .home-section ---------
(function initRouter() {
  const container = document.querySelector('.home-section');
  if (!container) return;

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
    const cleaned = (hash || '').replace(/^#\/?/, '').trim();
    return cleaned || 'home';
  }

  function ensureFrame() {
    let frame = container.querySelector('#router-frame');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'router-frame';
      frame.setAttribute('title', 'Conteúdo');
      frame.style.width = '100%';
      frame.style.height = '100vh';
      frame.style.border = '0';
      frame.style.display = 'block';
      container.innerHTML = '';
      container.appendChild(frame);
    }
    return frame;
  }

  function loadRoute() {
    const route = normalizeRoute(window.location.hash);
    const file = routeToFileMap[route] || routeToFileMap['home'];
    const frame = ensureFrame();
    frame.src = file;
    setActiveLink(route);
  }

  function setActiveLink(route) {
    document.querySelectorAll('.nav-list a[href^="#/"]').forEach(a => {
      const hrefRoute = a.getAttribute('href').replace(/^#\/?/, '');
      //if (hrefRoute === route) {
        //a.classList.add('active');
      //} else {
        //a.classList.remove('active');
      //}
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

  // Initial navigation
  if (!window.location.hash) {
    navigate('home');
  } else {
    loadRoute();
  }
})();