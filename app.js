// ============================================================
//  Lase Bypass — app.js
//  Cheat product landing page scripts
// ============================================================

// ── Undetected streak timer ───────────────────────────────────
// Set the date your cheat was last detected (or start date).
// Format: 'YYYY-MM-DDTHH:MM:SSZ'
const STREAK_START = new Date('2026-07-04T00:00:00Z');

function updateStreak() {
  const now  = new Date();
  const diff = Math.max(0, now - STREAK_START);

  const totalSecs = Math.floor(diff / 1000);
  const secs  = totalSecs % 60;
  const mins  = Math.floor(totalSecs / 60) % 60;
  const hours = Math.floor(totalSecs / 3600) % 24;
  const days  = Math.floor(totalSecs / 86400);

  document.getElementById('sStreakDays').textContent = String(days).padStart(3, '0');
  document.getElementById('sDays').textContent        = String(days).padStart(3, '0');
  document.getElementById('sHours').textContent = String(hours).padStart(2, '0');
  document.getElementById('sMins').textContent  = String(mins).padStart(2, '0');
  document.getElementById('sSecs').textContent  = String(secs).padStart(2, '0');
}

updateStreak();
setInterval(updateStreak, 1000);

// ── FAQ accordion ─────────────────────────────────────────────
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ── Smooth scroll for nav links ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Header shrink on scroll ───────────────────────────────────
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Cheat UI interactivity ────────────────────────────────────

// Toggles click on/off
document.querySelectorAll('.cui-toggle').forEach(toggle => {
  toggle.style.cursor = 'pointer';
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('on');
  });
});

// Dots removed — all options now use cui-toggle

// Sidebar nav — Visuals stays active, others don't switch
document.querySelectorAll('.cui-nav-item').forEach(item => {
  item.style.cursor = 'default';
});

// Draggable sliders
document.querySelectorAll('.cui-slider').forEach(slider => {
  slider.style.cursor = 'ew-resize';
  const fill = slider.querySelector('.cui-slider-fill');
  const row  = slider.closest('.cui-row');
  const val  = row ? row.querySelector('.cui-val') : null;

  let dragging = false;

  function setFromEvent(e) {
    const rect = slider.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    fill.style.width = (pct * 100) + '%';

    // Update the value label if present
    if (val) {
      const currentText = val.textContent;
      // Detect if it's a decimal (1.0 style) or integer (300 m style)
      if (currentText.includes('m')) {
        val.textContent = Math.round(pct * 500) + ' m';
      } else if (currentText.includes('.')) {
        val.textContent = (pct * 5).toFixed(1);
      } else {
        val.textContent = Math.round(pct * 200).toFixed(1);
      }
    }
  }

  slider.addEventListener('mousedown', e => {
    dragging = true;
    setFromEvent(e);
    e.preventDefault();
  });

  slider.addEventListener('touchstart', e => {
    dragging = true;
    setFromEvent(e);
  }, { passive: true });

  window.addEventListener('mousemove', e => { if (dragging) setFromEvent(e); });
  window.addEventListener('touchmove', e => { if (dragging) setFromEvent(e); }, { passive: true });
  window.addEventListener('mouseup',  () => { dragging = false; });
  window.addEventListener('touchend', () => { dragging = false; });
});

// ── Proof gallery lightbox ────────────────────────────────────
function openLightbox(src) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  img.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

// Lightbox close listeners — set up once on load
(function () {
  const lb    = document.getElementById('lightbox');
  const close = document.getElementById('lightboxClose');
  if (!lb) return;

  close.addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });
  lb.addEventListener('click', e => { if (e.target === lb || e.target === document.getElementById('lightboxImg') === false) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
})();

// Close with Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ── Particle system ───────────────────────────────────────────
(function () {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles, mouse = { x: null, y: null };

  const CONFIG = {
    count:       110,
    minSize:     1,
    maxSize:     2.5,
    speed:       0.35,
    lineDistance: 130,
    mouseRadius:  120,
    color:       '255,255,255',
  };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createParticle() {
    return {
      x:   rand(0, W),
      y:   rand(0, H),
      vx:  rand(-CONFIG.speed, CONFIG.speed),
      vy:  rand(-CONFIG.speed, CONFIG.speed),
      r:   rand(CONFIG.minSize, CONFIG.maxSize),
      a:   rand(0.2, 0.7),
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update + draw dots
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Mouse repel
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius * 0.04;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          // Clamp speed
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > CONFIG.speed * 4) {
            p.vx = (p.vx / spd) * CONFIG.speed * 4;
            p.vy = (p.vy / spd) * CONFIG.speed * 4;
          }
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.color},${p.a})`;
      ctx.fill();

      // Draw connecting lines
      for (let j = i + 1; j < particles.length; j++) {
        const q    = particles[j];
        const dx   = p.x - q.x;
        const dy   = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.lineDistance) {
          const alpha = (1 - dist / CONFIG.lineDistance) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${CONFIG.color},${alpha})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  init();
  draw();
})();

// ── UI preview — fluid wave overlay ──────────────────────────
(function () {
  const canvas = document.getElementById('uiWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
  }

  // Fluid streamlines using layered sine-based flow field
  const LINES = 18;
  const lines = [];

  function initLines() {
    lines.length = 0;
    for (let i = 0; i < LINES; i++) {
      lines.push({
        points: [],
        offset: Math.random() * Math.PI * 2,
        speed:  0.004 + Math.random() * 0.006,
        amp1:   0.12 + Math.random() * 0.2,
        amp2:   0.06 + Math.random() * 0.12,
        freq1:  1.5  + Math.random() * 2,
        freq2:  2.5  + Math.random() * 3,
        yBase:  0.05 + (i / LINES) * 0.9,
        alpha:  0.06 + Math.random() * 0.12,
        width:  0.5  + Math.random() * 1.5,
      });
    }
  }

  let t = 0;

  function draw() {
    t += 0.01;
    ctx.clearRect(0, 0, W, H);

    for (const l of lines) {
      ctx.beginPath();
      const steps = 120;
      for (let s = 0; s <= steps; s++) {
        const px = (s / steps) * W;
        const nx = s / steps;

        // Layered sine flow — creates organic looping curl
        const wave =
          Math.sin(nx * Math.PI * l.freq1 + t * 1.2 + l.offset) * l.amp1 * H +
          Math.sin(nx * Math.PI * l.freq2 - t * 0.8 + l.offset * 1.4) * l.amp2 * H +
          Math.sin(nx * Math.PI * 0.7 + t * 0.5) * 0.04 * H;

        const py = l.yBase * H + wave;

        s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }

      // Brightness varies with position for depth
      const bright = 180 + Math.round(Math.sin(t + l.offset) * 40);
      ctx.strokeStyle = `rgba(${bright},${bright},${bright},${l.alpha})`;
      ctx.lineWidth   = l.width;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  resize(); initLines(); draw();
  window.addEventListener('resize', () => { resize(); initLines(); });
})();



// ── Scroll reveal ─────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Lamp / light mode toggle ──────────────────────────────────
(function () {
  const btn  = document.getElementById('lampBtn');
  const body = document.body;
  const KEY  = 'lase-lightmode';

  function setMode(light) {
    body.classList.toggle('light-mode', light);
    btn.classList.toggle('lit', light);
    localStorage.setItem(KEY, light ? '1' : '0');
  }

  // Restore saved preference
  if (localStorage.getItem(KEY) === '1') setMode(true);

  btn.addEventListener('click', () => setMode(!body.classList.contains('light-mode')));
})();

// ── Custom cursor ─────────────────────────────────────────────
// Using default browser cursor

// ── Floating nav lamp indicator ───────────────────────────────
(function () {
  const nav   = document.getElementById('floatNav');
  const lamp  = document.getElementById('fnLamp');
  const items = nav ? nav.querySelectorAll('.fn-item:not(.fn-cta)') : [];
  if (!nav || !lamp || !items.length) return;

  function moveLamp(el) {
    const navRect  = nav.getBoundingClientRect();
    const elRect   = el.getBoundingClientRect();
    lamp.style.left   = (elRect.left - navRect.left) + 'px';
    lamp.style.top    = (elRect.top  - navRect.top)  + 'px';
    lamp.style.width  = elRect.width  + 'px';
    lamp.style.height = elRect.height + 'px';
    lamp.style.opacity = '1';
    items.forEach(i => i.classList.remove('fn-active'));
    el.classList.add('fn-active');
  }

  // Set initial active on first item
  moveLamp(items[0]);

  items.forEach(item => {
    item.addEventListener('click', () => moveLamp(item));
  });

  // Scroll spy
  const sections = ['features','pricing','preview','status','team','faq'];
  window.addEventListener('scroll', () => {
    let current = sections[0];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 200) current = id;
    });
    const match = Array.from(items).find(i => i.getAttribute('href') === '#' + current);
    if (match) moveLamp(match);
  }, { passive: true });
})();
