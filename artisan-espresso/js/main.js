/* ═══════════════════════════════════════════════════════
   Tea3 — main.js
   Global: AOS, Navbar, Mobile menu, Page loader, Focus styles
═══════════════════════════════════════════════════════ */

/* ─── Global focus-visible style (accessibility) ──── */
(function injectFocusStyles() {
  const s = document.createElement('style');
  s.textContent = `
    /* ── Skip link ─────────────────────────────── */
    .skip-link {
      position:fixed; top:-100%; left:1rem; z-index:99999;
      background:var(--c-gold,#C9A84C); color:#1C0A00;
      padding:.6rem 1.2rem; border-radius:6px;
      font-weight:700; font-size:.85rem; transition:top .2s;
    }
    .skip-link:focus { top:1rem; }

    /* ── Focus visible gold ring ───────────────── */
    *:focus-visible {
      outline:2.5px solid #C9A84C !important;
      outline-offset:3px !important;
      border-radius:3px;
    }

    /* ── Page loader ───────────────────────────── */
    #page-loader {
      position:fixed; inset:0; background:#1C0A00;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      z-index:99999; transition:opacity .5s ease;
    }
    #page-loader.hiding { opacity:0; pointer-events:none; }
    .loader-cup { font-size:3.5rem; animation:loaderBounce .75s infinite alternate; }
    .loader-text {
      font-family:'DM Sans',sans-serif; color:rgba(245,230,200,.5);
      font-size:.82rem; letter-spacing:2px; text-transform:uppercase;
      margin-top:1rem;
    }
    @keyframes loaderBounce { to { transform:translateY(-18px); } }

    /* ── WhatsApp pulse (if used via FA icon) ──── */
    .whatsapp-float { animation:waPulse 2.4s ease infinite; }
    @keyframes waPulse {
      0%,100% { box-shadow:0 4px 20px rgba(37,211,102,.4); }
      50%      { box-shadow:0 4px 40px rgba(37,211,102,.75); }
    }

    /* ── AOS will-change perf hint ─────────────── */
    [data-aos] { will-change:transform,opacity; }

    /* ── Min tap target size ───────────────────── */
    button, a, [role="button"] { min-height:44px; }
  `;
  document.head.appendChild(s);
})();

/* ─── Page Loader ────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hiding');
    setTimeout(() => loader.remove(), 520);
  }, 900);
});

/* ─── AOS init ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration : 600,    // faster, snappier feel
      easing   : 'ease-out',
      once     : true,
      offset   : 70,
    });
  }

  /* ─── Navbar scroll effect ─────────────────────── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  /* ─── Mobile Menu Toggle ───────────────────────── */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', String(open));
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-times', open);
      }
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        const icon = navToggle.querySelector('i');
        if (icon) { icon.className = 'fa-solid fa-bars'; }
      });
    });

    // Close on ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        const icon = navToggle.querySelector('i');
        if (icon) { icon.className = 'fa-solid fa-bars'; }
        navToggle.focus();
      }
    });
  }

  /* ─── Footer year (shared across pages) ─────────── */
  const yearEl = document.getElementById('year') || document.getElementById('yr');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
