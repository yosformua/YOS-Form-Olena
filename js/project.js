(function () {
  let project = null;
  let currentIndex = 0;

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

  function goToSlide(index) {
    const track = document.getElementById('project-gallery');
    const slides = Array.from(track.children);
    const dotsContainer = document.getElementById('carousel-dots');
    
    if (!slides.length) return;

    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    if (dotsContainer) {
      const dots = Array.from(dotsContainer.children);
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }
  }

  function initCarousel() {
    const track = document.getElementById('project-gallery');
    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');
    const dotsContainer = document.getElementById('carousel-dots');
    
    if (!track) return;
    const slides = Array.from(track.children);
    if (slides.length === 0) return;

    currentIndex = 0;

    
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Слайд ${index + 1}`);
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
      });
    }

    
    if (prevBtn) {
      const newPrev = prevBtn.cloneNode(true);
      prevBtn.parentNode.replaceChild(newPrev, prevBtn);
      newPrev.addEventListener('click', () => goToSlide(currentIndex - 1));
    }

    if (nextBtn) {
      const newNext = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNext, nextBtn);
      newNext.addEventListener('click', () => goToSlide(currentIndex + 1));
    }

    
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let deltaY = 0;
    let isTouch = false;
    let isDragging = false;
    let wasSwiping = false;

    
    slides.forEach((img) => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
    });

    function handleStart(e) {
      isTouch = e.type === 'touchstart';
      const point = isTouch ? e.touches[0] : e;
      
      startX = point.clientX;
      startY = point.clientY;
      deltaX = 0;
      deltaY = 0;
      isDragging = true;
      wasSwiping = false;
    }

    function handleMove(e) {
      if (!isDragging) return;

      const point = isTouch ? e.touches[0] : e;
      deltaX = point.clientX - startX;
      deltaY = point.clientY - startY;

      
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        wasSwiping = true;
        
        if (e.cancelable) e.preventDefault();
      }
    }

    
    function handleEnd() {
      if (!isDragging) return;
      isDragging = false;

      const threshold = 50;

      if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1); 
        }
      }
    }


    track.addEventListener('touchstart', handleStart, { passive: true });
    track.addEventListener('touchmove', handleMove, { passive: false });
    track.addEventListener('touchend', handleEnd);


    track.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    track.dataset.wasSwiping = 'false';
    track.addEventListener('click', (e) => {
      if (wasSwiping) {
        e.stopImmediatePropagation();
      }
    }, true);

    goToSlide(0);
  }

  // Полноэкранный просмотр
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const galleryImages = document.querySelectorAll('#project-gallery img');

    if (!lightbox || !lightboxImg) return;

    galleryImages.forEach((img) => {
      img.addEventListener('click', (e) => {
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

    initCarousel();
    initLightbox();
  }

  document.addEventListener('DOMContentLoaded', loadProject);
  document.addEventListener('i18n:changed', render);
})();