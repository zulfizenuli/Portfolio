// Award-level interactions (nav, smooth-scroll, a11y, and subtle motion)
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
  const form = document.querySelector('.contact-form');

  if (!navbar || !navToggle || !navMenu) return;

  // Respect user motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Navbar scroll effect (throttled via rAF) ----------
  let lastKnownScrollY = 0;
  let ticking = false;

  const updateNavbar = () => {
    const scrolled = lastKnownScrollY > 50; // uses scrollY as the vertical scroll offset [web:38]
    navbar.classList.toggle('is-scrolled', scrolled);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    lastKnownScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  });

  // Minimal inline styling fallback (keeps your current visual behavior)
  // If you want: move these into CSS under .navbar.is-scrolled
  const applyNavbarStyles = () => {
    const scrolled = window.scrollY > 50;
    navbar.style.background = scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)';
    navbar.style.boxShadow = scrolled ? '0 10px 30px rgba(0, 0, 0, 0.1)' : '0 2px 20px rgba(0, 0, 0, 0.05)';
  };
  applyNavbarStyles();
  window.addEventListener('scroll', applyNavbarStyles, { passive: true });

  // ---------- Mobile menu (a11y correct) ----------
  const setMenuOpen = (open) => {
    navToggle.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);

    // aria-expanded should reflect current state for toggle buttons [web:44]
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

    document.documentElement.style.overflow = open ? 'hidden' : '';
  };

  const isMenuOpen = () => navMenu.classList.contains('active');

  navToggle.addEventListener('click', () => setMenuOpen(!isMenuOpen()));

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen()) setMenuOpen(false);
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!isMenuOpen()) return;
    const clickedInsideMenu = navMenu.contains(e.target);
    const clickedToggle = navToggle.contains(e.target);
    if (!clickedInsideMenu && !clickedToggle) setMenuOpen(false);
  });

  // Close after selecting a link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  // ---------- Smooth scrolling (with offset-friendly behavior) ----------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // scrollIntoView supports {behavior:'smooth'} [web:43]
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });

      // Optional: improve focus for keyboard users
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    });
  });

  // ---------- Form UX (safe, clean) ----------
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;

      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';

      window.setTimeout(() => {
        btn.textContent = 'Sent!';
        form.classList.add('success');

        window.setTimeout(() => {
          form.reset();
          form.classList.remove('success');
          btn.disabled = false;
          btn.textContent = original;
        }, 1800);
      }, 900);
    });
  }

  // ---------- Section reveal (disabled if reduced motion) ----------
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('section').forEach((section) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(24px)';
      section.style.transition = 'all 700ms cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(section);
    });
  } else {
    // Reduced motion: ensure everything is visible
    document.querySelectorAll('section').forEach((section) => {
      section.style.opacity = '1';
      section.style.transform = 'none';
      section.style.transition = 'none';
    });
  }
});
