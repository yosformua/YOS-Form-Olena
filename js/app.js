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

  function scrollToAnchor() {
    const targetId = sessionStorage.getItem('scrollToProject');
    if (!targetId) return;
    sessionStorage.removeItem('scrollToProject');
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    setTimeout(() => {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }

  function render() {
    const grid = document.getElementById('project-grid');
    if (!grid) return;
    const labels = categoryLabelKeys();

    grid.innerHTML = projects
      .filter((p) => activeFilter === 'all' || p.category === activeFilter)
      .map((p) => {
        const catLabel = window.i18n.t(labels[p.category]) || p.category;

        const images = p.gallery && p.gallery.length > 0 ? p.gallery : [p.cover];
        const imagesHtml = images
          .map((src) => `<img src="${src}" alt="${p.title}" loading="lazy">`)
          .join('');

        const hasMultiple = images.length > 1;

        return `
        <div class="project-card" id="project-${p.id}">
          <div class="thumb-carousel-wrapper">
            <div class="thumb-carousel">
              <div class="thumb-track">
                ${imagesHtml}
              </div>
            </div>
            ${hasMultiple
            ? `
                  <button class="carousel-arrow prev" aria-label="Попереднє фото">‹</button>
                  <button class="carousel-arrow next" aria-label="Наступне фото">›</button>
                  <div class="thumb-scrollbar"><div class="thumb-scrollbar-thumb"></div></div>
                  `
            : ''
          }
          </div>
          <a class="card-body" href="project.html?id=${p.id}&from=${p.id}">
            <span class="card-cat">${catLabel}</span>
            <h3 class="card-title">${p.title}</h3>
            <p class="card-meta">${p.year} · ${p.location}</p>
          </a>
        </div>`;
      })
      .join('');

    initCardSwipe();


    scrollToAnchor();
  }

  function initCardSwipe() {
    const carousels = document.querySelectorAll('.thumb-carousel');

    carousels.forEach((carousel) => {
      const wrapper = carousel.closest('.thumb-carousel-wrapper');
      const scrollThumb = wrapper ? wrapper.querySelector('.thumb-scrollbar-thumb') : null;
      const prevBtn = wrapper ? wrapper.querySelector('.carousel-arrow.prev') : null;
      const nextBtn = wrapper ? wrapper.querySelector('.carousel-arrow.next') : null;

      function updateThumb() {
        if (!scrollThumb) return;
        const scrollWidth = carousel.scrollWidth - carousel.clientWidth;
        if (scrollWidth <= 0) {
          scrollThumb.style.width = '100%';
          scrollThumb.style.transform = 'translateX(0)';
          return;
        }

        const progress = carousel.scrollLeft / scrollWidth;
        const thumbWidthPercent = (carousel.clientWidth / carousel.scrollWidth) * 100;
        scrollThumb.style.width = `${thumbWidthPercent}%`;

        const maxTranslate = (carousel.clientWidth - (carousel.clientWidth * (thumbWidthPercent / 100)));
        scrollThumb.style.transform = `translateX(${progress * maxTranslate}px)`;
      }

      carousel.addEventListener('scroll', updateThumb);
      updateThumb();

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          carousel.scrollBy({ left: -carousel.clientWidth, behavior: 'smooth' });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' });
        });
      }

      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let moved = false;

      carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        moved = false;
        carousel.classList.add('dragging');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      });

      carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('dragging');
      });

      carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('dragging');
      });

      carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 5) moved = true;
        carousel.scrollLeft = scrollLeft - walk;
      });

      carousel.addEventListener('click', (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          const card = carousel.closest('.project-card');
          const link = card ? card.querySelector('.card-body') : null;
          if (link) window.location.href = link.href;
        }
      });
    });
  }

  function initCardSwipe() {
    const carousels = document.querySelectorAll('.thumb-carousel');

    carousels.forEach((carousel) => {
      const wrapper = carousel.closest('.thumb-carousel-wrapper');
      const track = carousel.querySelector('.thumb-track');
      if (!track) return;

      const slides = Array.from(track.children);
      const originalCount = slides.length;
      if (originalCount <= 1) return;

      const scrollThumb = wrapper ? wrapper.querySelector('.thumb-scrollbar-thumb') : null;
      const prevBtn = wrapper ? wrapper.querySelector('.carousel-arrow.prev') : null;
      const nextBtn = wrapper ? wrapper.querySelector('.carousel-arrow.next') : null;


      const firstClone = slides[0].cloneNode(true);
      const lastClone = slides[originalCount - 1].cloneNode(true);

      firstClone.classList.add('clone');
      lastClone.classList.add('clone');

      track.appendChild(firstClone);
      track.insertBefore(lastClone, slides[0]);


      let isJumping = false;
      const slideWidth = carousel.clientWidth;
      carousel.scrollLeft = slideWidth;


      function updateThumb() {
        if (!scrollThumb) return;
        const currentScroll = carousel.scrollLeft;
        const width = carousel.clientWidth;
        let activeIndex = Math.round(currentScroll / width) - 1;

        if (activeIndex < 0) activeIndex = originalCount - 1;
        if (activeIndex >= originalCount) activeIndex = 0;

        const thumbWidthPercent = 100 / originalCount;
        scrollThumb.style.width = `${thumbWidthPercent}%`;
        scrollThumb.style.transform = `translateX(${activeIndex * 100}%)`;
      }


      carousel.addEventListener('scroll', () => {
        updateThumb();

        if (isJumping) return;

        const width = carousel.clientWidth;
        const currentScroll = carousel.scrollLeft;
        const totalSlides = originalCount + 2;


        if (currentScroll >= width * (totalSlides - 1) - 5) {
          isJumping = true;
          carousel.style.scrollBehavior = 'auto';
          carousel.scrollLeft = width;
          requestAnimationFrame(() => {
            carousel.style.scrollBehavior = '';
            isJumping = false;
          });
        }

        else if (currentScroll <= 5) {
          isJumping = true;
          carousel.style.scrollBehavior = 'auto';
          carousel.scrollLeft = width * originalCount;
          requestAnimationFrame(() => {
            carousel.style.scrollBehavior = '';
            isJumping = false;
          });
        }
      });


      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          carousel.scrollBy({ left: -carousel.clientWidth, behavior: 'smooth' });
        });
      }


      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' });
        });
      }


      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let moved = false;

      carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        moved = false;
        carousel.classList.add('dragging');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      });

      carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('dragging');
      });

      carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('dragging');
      });

      carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 5) moved = true;
        carousel.scrollLeft = scrollLeft - walk;
      });

      carousel.addEventListener('click', (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
        } else {
          const card = carousel.closest('.project-card');
          const link = card ? card.querySelector('.card-body') : null;
          if (link) window.location.href = link.href;
        }
      });

      updateThumb();
    });
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