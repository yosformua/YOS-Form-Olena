(function () {
  let projects = [];
  let activeFilter = 'all';

  async function loadProjects() {
    const res = await fetch('data/projects.json');
    projects = await res.json();
    render();
  }

  function categoryLabelKeys() {
    return {
      architecture: 'categories.architecture_label',
      residential: 'categories.residential_label',
      commercial: 'categories.commercial_label',
    };
  }

  function render() {
    const grid = document.getElementById('project-grid');
    if (!grid) return;
    const lang = window.i18n.getLang();
    const labels = categoryLabelKeys();

    grid.innerHTML = projects
      .filter((p) => activeFilter === 'all' || p.category === activeFilter)
      .map((p) => {
        const catLabel = window.i18n.t(labels[p.category]) || p.category;
        return `
        <a class="project-card" href="project.html?id=${p.id}">
          <div class="thumb"><img src="${p.cover}" alt="${p.title}" loading="lazy"></div>
          <div class="card-body">
            <span class="card-cat">${catLabel}</span>
            <h3 class="card-title">${p.title}</h3>
            <p class="card-meta">${p.year} · ${p.location}</p>
          </div>
        </a>`;
      })
      .join('');
  }

  function initFilters() {
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        render();
      });
    });
  }

  function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initNavToggle();
    loadProjects();
  });

  document.addEventListener('i18n:changed', render);
})();
