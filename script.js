(() => {
  document.documentElement.classList.add('js');

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-navigation]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && navigation) {
    let returnFocus = null;

    const focusableSelector = 'a[href], button:not([disabled])';

    const setMenu = (open) => {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      navigation.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);

      if (open) {
        returnFocus = document.activeElement;
        navigation.querySelector(focusableSelector)?.focus();
      } else if (returnFocus instanceof HTMLElement) {
        returnFocus.focus();
      }
    };

    menuButton.addEventListener('click', () => {
      setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    navigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      if (!open) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = [menuButton, ...navigation.querySelectorAll(focusableSelector)];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 900 && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
      }
    });
  }

  const revealItems = document.querySelectorAll('[data-reveal]');

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -7% 0px' }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  document.querySelectorAll('[data-video-gallery]').forEach((gallery) => {
    const videos = [...gallery.querySelectorAll('video')];
    const button = gallery.querySelector('[data-video-toggle]');
    let userPaused = reducedMotion.matches;
    let inView = false;

    const pauseAll = () => videos.forEach((video) => video.pause());
    const playAll = () => {
      if (userPaused || document.hidden || !inView) return;
      videos.forEach((video) => video.play().catch(() => {}));
    };

    const updateButton = () => {
      if (!button) return;
      button.textContent = userPaused ? 'Play loops' : 'Pause loops';
      button.setAttribute('aria-label', userPaused ? 'Play experiment videos' : 'Pause experiment videos');
    };

    if (button) {
      button.addEventListener('click', () => {
        userPaused = !userPaused;
        updateButton();
        if (userPaused) pauseAll();
        else playAll();
      });
    }

    updateButton();

    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          if (inView) playAll();
          else pauseAll();
        },
        { threshold: 0.25 }
      );
      videoObserver.observe(gallery);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseAll();
      else playAll();
    });

    const onMotionPreferenceChange = (event) => {
      userPaused = event.matches;
      updateButton();
      if (userPaused) pauseAll();
      else playAll();
    };

    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', onMotionPreferenceChange);
    }
  });

  const newsFilter = document.querySelector('[data-news-filter]');
  if (newsFilter) {
    const buttons = newsFilter.querySelectorAll('button');
    const items = document.querySelectorAll('.news-item[data-type]');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const type = button.dataset.type;
        buttons.forEach((b) => {
          const active = b === button;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        items.forEach((item) => {
          item.hidden = type !== 'all' && item.dataset.type !== type;
        });
      });
    });
  }
})();

// Show a round avatar above a mentor's name on hover or keyboard focus; the link itself opens their homepage.
(() => {
  const names = document.querySelectorAll("a.prof");
  if (!names.length) return;
  const pop = document.createElement("span");
  pop.className = "prof-pop";
  pop.setAttribute("aria-hidden", "true");
  document.body.appendChild(pop);
  const photos = new Map();
  names.forEach((a) => {
    const src = a.dataset.photo;
    if (!src) return;
    const img = new Image();
    img.onload = () => photos.set(a, src);
    img.src = src;
  });
  let current = null;
  const show = (a) => {
    current = a;
    const photo = photos.get(a);
    pop.classList.toggle("has-photo", Boolean(photo));
    pop.style.backgroundImage = photo ? `url("${photo}")` : "";
    pop.textContent = a.dataset.initials || "";
    const rects = a.getClientRects();
    const r = rects[0] || a.getBoundingClientRect();
    pop.style.left = `${r.left + r.width / 2 + window.scrollX}px`;
    pop.style.top = `${r.top + window.scrollY - 76 - 12}px`;
    requestAnimationFrame(() => pop.classList.add("show"));
  };
  const hide = (a) => {
    if (current === a) {
      pop.classList.remove("show");
      current = null;
    }
  };
  names.forEach((a) => {
    a.addEventListener("mouseenter", () => show(a));
    a.addEventListener("mouseleave", () => hide(a));
    a.addEventListener("focus", () => show(a));
    a.addEventListener("blur", () => hide(a));
  });
  window.addEventListener("scroll", () => current && hide(current), { passive: true });
})();
