// ===== THEME TOGGLE =====
(function () {
  const html = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');

  // Default to dark for aerospace aesthetic
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = prefersDark ? 'dark' : 'light';
  html.setAttribute('data-theme', initial);

  const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  function updateToggle(theme) {
    if (!toggle) return;
    toggle.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
    toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }

  updateToggle(initial);

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      updateToggle(next);
      // theme preference stored in memory only
    });
  }
})();

// ===== MOBILE NAV =====
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', !isOpen);
    mobileToggle.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.setAttribute('aria-hidden', String(isOpen));
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

// ===== STAR FIELD CANVAS =====
(function () {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stars = [];
  let animId;
  let w, h;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function createStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        opacity: Math.random() * 0.7 + 0.1,
        speed: Math.random() * 0.015 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    stars.forEach(star => {
      const twinkle = 0.5 + 0.5 * Math.sin(t * star.speed + star.phase);
      const alpha = star.opacity * (0.4 + 0.6 * twinkle);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(200, 220, 255, ${alpha})`
        : `rgba(60, 100, 180, ${alpha * 0.3})`;
      ctx.fill();
    });

    // Occasional bright star
    if (stars.length > 0) {
      const brightIdx = Math.floor(t / 30) % Math.min(5, stars.length);
      const bs = stars[brightIdx];
      const glow = ctx.createRadialGradient(bs.x, bs.y, 0, bs.x, bs.y, bs.r * 8);
      glow.addColorStop(0, isDark ? 'rgba(150, 210, 255, 0.4)' : 'rgba(60, 100, 200, 0.15)');
      glow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(bs.x, bs.y, bs.r * 8, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }
  }

  function tick(t) {
    draw(t);
    animId = requestAnimationFrame(tick);
  }

  function init() {
    resize();
    createStars(180);
    if (animId) cancelAnimationFrame(animId);
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => {
    resize();
    createStars(180);
  });

  init();
})();

// ===== NAV SCROLL BEHAVIOR =====
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;

  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) {
      nav.style.boxShadow = '0 2px 16px rgba(0,0,0,0.3)';
    } else {
      nav.style.boxShadow = 'none';
    }
    lastY = y;
  }, { passive: true });
})();

// ===== ACTIVE NAV LINK =====
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.style.color = 'var(--color-text)';
          }
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => observer.observe(s));
})();

// ===== SMOOTH COUNT-UP FOR STATS =====
(function () {
  function countUp(el, target, duration) {
    const isFloat = target.toString().includes('.');
    const start = performance.now();
    const update = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = isFloat ? (eased * target).toFixed(1) : Math.floor(eased * target);
      el.textContent = value + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const statsSection = document.querySelector('.hero-stats');
  if (!statsSection) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      statsSection.querySelectorAll('.stat-num').forEach(el => {
        const raw = el.textContent.replace(/[^0-9.]/g, '');
        const suffix = el.textContent.replace(/[0-9.]/g, '');
        el.dataset.suffix = suffix;
        countUp(el, parseFloat(raw), 1200);
      });
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(statsSection);
})();
