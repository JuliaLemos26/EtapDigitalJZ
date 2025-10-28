let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");

closeBtn.addEventListener("click", ()=>{
  sidebar.classList.toggle("open");
  menuBtnChange();//calling the function(optional)
});

if (searchBtn) {
  searchBtn.addEventListener("click", ()=>{ // Sidebar open when you click on the search iocn
    sidebar.classList.toggle("open");
    menuBtnChange(); //calling the function(optional)
  });
}

// following are the code to change sidebar button(optional)
function menuBtnChange() {
 if(sidebar.classList.contains("open")){
   closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");//replacing the iocns class
 }else {
   closeBtn.classList.replace("bx-menu-alt-right","bx-menu");//replacing the iocns class
 }
}

// --------- Simple hash router to load pages inside .home-section ---------
(function initRouter() {
  const container = document.querySelector('.home-section');
  if (!container) return;

  const routeToFileMap = {
    home: 'home.html',
    browse: 'browse.html',
    details: 'details.html',
    streams: 'streams.html',
    profile: 'profile.html',
    menu: 'menu.html'
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
    const file = routeToFileMap[route] || `${route}.html`;

    setActiveLink(route);

    const frame = ensureFrame();
    frame.src = file;
  }

  function setActiveLink(route) {
    document.querySelectorAll('.nav-list a[href^="#/"]').forEach(a => {
      const hrefRoute = a.getAttribute('href').replace(/^#\/?/, '');
      if (hrefRoute === route) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  function navigate(route) {
    if (window.location.hash !== `#/${route}`) {
      window.location.hash = `#/${route}`;
    } else {
      // Force reload same route
      loadRoute();
    }
  }

  window.addEventListener('hashchange', loadRoute);
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-list a[href^="#/\"]');
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