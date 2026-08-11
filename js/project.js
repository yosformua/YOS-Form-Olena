(function () {
  let project = null;

  function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      id: params.get('id'),
      from: params.get('from')
    };
  }

  async function loadProject() {
    const { id } = getParams();
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

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const galleryImages = document.querySelectorAll('#project-gallery img');

    if (!lightbox || !lightboxImg) return;

    galleryImages.forEach((img) => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
      });
    });

    const closeLightbox = () => lightbox.classList.remove('active');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
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

    const { from } = getParams();

    document.querySelectorAll('.back-link, .project-back-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (from) {
          sessionStorage.setItem('scrollToProject', `project-${from}`);
        }
      });
    });

    initLightbox();
  }

  document.addEventListener('DOMContentLoaded', loadProject);
  document.addEventListener('i18n:changed', render);
})();