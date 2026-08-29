/* =============================================================================
   Le Paradis du Spa — interactions
   Vanilla, sans dépendance, ~9 Ko non minifié.
   Toute animation est désactivée si l'utilisateur a demandé un mouvement réduit.
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  document.documentElement.setAttribute('data-js-ok', '');   // désamorce le garde-fou du <head>
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* --- 1. Thème clair / sombre ------------------------------------------- */
  const THEME_KEY = 'pds-theme';
  const applyTheme = (t) => {
    if (t) document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  };
  try { applyTheme(localStorage.getItem(THEME_KEY)); } catch (_) {}

  $$('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const now = document.documentElement.getAttribute('data-theme') || (sysDark ? 'dark' : 'light');
      const next = now === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
      btn.setAttribute('aria-label', next === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre');
    });
  });

  /* --- 2. Barre de progression, en-tête, retour en haut ------------------- */
  const header  = $('.header');
  const bar     = $('.progress');
  const toTop   = $('.totop');
  const actions = $('.actionbar');
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    if (bar) bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (header) {
      header.classList.toggle('is-stuck', y > 24);
      // On masque l'en-tête à la descente, on le rend à la montée : plus d'espace pour lire.
      header.classList.toggle('is-hidden', y > 420 && y > lastY && !document.body.classList.contains('nav-open'));
    }
    if (toTop)   toTop.classList.toggle('is-on', y > 700);
    if (actions) actions.classList.toggle('is-on', y > 240);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: motionOK ? 'smooth' : 'auto' });
  });

  /* --- 3. Menu mobile ----------------------------------------------------- */
  const burger = $('.burger');
  const menu   = $('.menu');
  if (burger && menu) {
    const setMenu = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('nav-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) menu.querySelector('a')?.focus({ preventScroll: true });
    };
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* --- 4. Apparition au défilement ---------------------------------------- */
  const rises = $$('[data-rise], .sec-title');
  if (rises.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    // Décalage automatique entre frères et sœurs : effet d'escalier sans balisage manuel
    rises.forEach((el) => {
      if (!el.style.getPropertyValue('--d') && el.parentElement) {
        const sibs = Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-rise'));
        const i = sibs.indexOf(el);
        if (i > 0) el.style.setProperty('--d', Math.min(i, 6) * 90);
      }
      io.observe(el);
    });
  } else {
    rises.forEach((el) => el.classList.add('is-in'));
  }

  /* --- 5. Cartes inclinées + reflet spéculaire ---------------------------- */
  if (finePointer && motionOK) {
    $$('.tilt').forEach((card) => {
      let raf = 0;
      const move = (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.style.setProperty('--ry', ((px - 0.5) * 11).toFixed(2) + 'deg');
          card.style.setProperty('--rx', ((0.5 - py) * 9).toFixed(2) + 'deg');
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          raf = 0;
        });
      };
      card.addEventListener('pointerenter', () => card.classList.add('is-live'));
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-live');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });

    /* --- 6. Boutons magnétiques ------------------------------------------ */
    $$('[data-magnet]').forEach((el) => {
      const strength = parseFloat(el.dataset.magnet) || 0.28;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x.toFixed(1)}px, ${(y - 3).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    /* --- 7. Halo de lumière suivant le pointeur -------------------------- */
    const glow = document.createElement('div');
    glow.className = 'glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    let graf = 0;
    window.addEventListener('pointermove', (e) => {
      document.body.classList.add('has-pointer');
      if (graf) return;
      graf = requestAnimationFrame(() => {
        glow.style.setProperty('--gx', e.clientX + 'px');
        glow.style.setProperty('--gy', e.clientY + 'px');
        graf = 0;
      });
    }, { passive: true });
  }

  /* --- 8. Compteurs animés ------------------------------------------------ */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        cio.unobserve(el);
        const target = parseFloat(el.dataset.count);
        const dec = (el.dataset.count.split('.')[1] || '').length;
        const suffix = el.dataset.suffix || '';
        if (!motionOK) { el.textContent = target.toLocaleString('fr-FR', { minimumFractionDigits: dec }) + suffix; return; }
        const dur = 1400, t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toLocaleString('fr-FR', {
            minimumFractionDigits: dec, maximumFractionDigits: dec
          }) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  }

  /* --- 9. Onglets --------------------------------------------------------- */
  $$('[data-tabs]').forEach((group) => {
    const btns = $$('[role="tab"]', group);
    const pill = $('.tabs__pill', group);
    const movePill = (btn) => {
      if (!pill) return;
      pill.style.width = btn.offsetWidth + 'px';
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
    };
    const select = (btn) => {
      btns.forEach((b) => {
        const on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(b.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      movePill(btn);
    };
    btns.forEach((b) => b.addEventListener('click', () => select(b)));
    // Navigation au clavier, comme l'attend le motif ARIA « tabs »
    group.addEventListener('keydown', (e) => {
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      let n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % btns.length;
      if (e.key === 'ArrowLeft')  n = (i - 1 + btns.length) % btns.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End')  n = btns.length - 1;
      if (n === null) return;
      e.preventDefault();
      btns[n].focus(); select(btns[n]);
    });
    const active = btns.find((b) => b.getAttribute('aria-selected') === 'true') || btns[0];
    if (active) { select(active); requestAnimationFrame(() => movePill(active)); }
    window.addEventListener('resize', () => {
      const cur = btns.find((b) => b.getAttribute('aria-selected') === 'true');
      if (cur) movePill(cur);
    }, { passive: true });
  });

  /* --- 10. Accordéon ------------------------------------------------------ */
  $$('.acc__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.acc__item');
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('is-open', !open);
    });
  });

  /* --- 11. Horaires : état ouvert/fermé en direct ------------------------
     Le calendrier voyage dans l'attribut data-schedule de la pastille, si bien
     que le calcul fonctionne sur toutes les pages. Le tableau des horaires,
     lui, n'existe que sur la page contact : il ne sert qu'au surlignage. */
  const now  = new Date();
  const today = now.getDay();                      // 0 = dimanche
  const mins = now.getHours() * 60 + now.getMinutes();
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

  const badges = $$('[data-openstate]');
  if (badges.length) {
    let openNow = false, info = '';
    (badges[0].dataset.schedule || '').split(';').forEach((part) => {
      const cut = part.indexOf(':');
      if (cut < 0) return;
      const days  = part.slice(0, cut).split(',').map(Number);
      const range = part.slice(cut + 1);
      if (!days.includes(today) || !range) return;
      const [from, to] = range.split('-');
      if (mins >= toMin(from) && mins < toMin(to)) {
        openNow = true; info = "jusqu'à " + to.replace(':', 'h');
      } else if (mins < toMin(from)) {
        info = 'ouvre à ' + from.replace(':', 'h');
      }
    });
    badges.forEach((el) => {
      el.classList.add(openNow ? 'is-open' : 'is-closed');
      const label = el.querySelector('span');
      if (label) label.textContent = openNow
        ? 'Ouvert' + (info ? ' · ' + info : '')
        : (info ? 'Fermé · ' + info : 'Fermé aujourd\'hui');
    });
  }

  // Surlignage du jour courant, là où le tableau des horaires est affiché.
  $$('[data-hours] [data-day]').forEach((row) => {
    if (row.dataset.day.split(',').map(Number).includes(today)) row.setAttribute('data-today', '');
  });

  /* --- 12. Carte chargée à la demande (aucun cookie tiers avant clic) ----- */
  $$('[data-map]').forEach((box) => {
    const btn = $('[data-map-load]', box);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = box.dataset.map;
      f.title = "Plan d'accès à l'institut";
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.allowFullscreen = true;
      $('.map__load', box)?.remove();
      box.appendChild(f);
    });
  });

  /* --- 13. Vapeur du héros (canvas très léger) ---------------------------- */
  const canvas = $('.hero__steam');
  if (canvas && motionOK && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, running = true, raf = 0;
    const N = window.innerWidth < 700 ? 10 : 20;
    const puffs = [];

    const seed = () => {
      puffs.length = 0;
      for (let i = 0; i < N; i++) {
        puffs.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 60 + Math.random() * 190,
          v: 0.09 + Math.random() * 0.3,
          drift: (Math.random() - 0.5) * 0.22,
          a: 0.04 + Math.random() * 0.1,
          ph: Math.random() * Math.PI * 2
        });
      }
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6); // on plafonne : inutile au-delà pour du flou
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!puffs.length) seed();
    };

    const draw = (t) => {
      if (!running) { raf = 0; return; }
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of puffs) {
        p.y -= p.v;
        p.x += p.drift + Math.sin(t / 2600 + p.ph) * 0.22;
        if (p.y + p.r < 0) { p.y = h + p.r; p.x = Math.random() * w; }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(233,222,203,${p.a})`);
        g.addColorStop(1, 'rgba(233,222,203,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    raf = requestAnimationFrame(draw);

    // On arrête net dès que le héros sort de l'écran ou que l'onglet passe en arrière-plan.
    const pause = (state) => {
      running = state;
      if (running && !raf) raf = requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', () => pause(!document.hidden));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => pause(e.isIntersecting && !document.hidden), { threshold: 0 })
        .observe(canvas);
    }
  }

  /* --- 14. Année courante dans le pied de page ---------------------------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
