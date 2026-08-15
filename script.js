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
})();
