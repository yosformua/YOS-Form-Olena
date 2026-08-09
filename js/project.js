(function () {
  let project = null;

  function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  async function loadProject() {
    const id = getIdFromUrl();
    const res = await fetch('data/projects.json');
    const projects = await res.json();
    project = projects.find((p) => p.id === id) || projects[0];
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
    if (!project) return;
    const lang = window.i18n.getLang();
    const labels = categoryLabelKeys();

    document.getElementById('project-cover').src = project.cover;
    document.getElementById('project-cover').alt = project.title;
    document.getElementById('project-title').textContent = project.title;
    document.getElementById('project-year').textContent = project.year;
    document.getElementById('project-location').textContent = project.location;
    document.getElementById('project-category').textContent = window.i18n.t(labels[project.category]) || project.category;
    document.getElementById('project-description').textContent = project.description[lang] || project.description.uk;

    const gallery = document.getElementById('project-gallery');
    gallery.innerHTML = project.gallery
      .map((src) => `<img src="${src}" alt="${project.title}" loading="lazy">`)
      .join('');

    document.title = `${project.title} — Olena Sychova`;
  }

  document.addEventListener('DOMContentLoaded', loadProject);
  document.addEventListener('i18n:changed', render);
})();
