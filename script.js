/* ═══════════════════════════════════════════════════════
   PORTFOLIO — MASTER SCRIPT
   Bidirectional scroll · Particles · Typewriter · 3D Tilt
   Card Glow · Counters · Cursor · Form · Back-to-top
═══════════════════════════════════════════════════════ */

/* ── 1. PAGE FADE IN (Disabled for instant visibility) ── */
// document.documentElement.style.opacity = '0';
// window.addEventListener('load', () => {
//   document.documentElement.style.transition = 'opacity 0.7s ease';
//   document.documentElement.style.opacity    = '1';
// });

/* ── 2. CUSTOM CURSOR ── */
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});
(function trackFollower() {
  fx += (mx - fx) * 0.12;
  fy += (my - fy) * 0.12;
  follower.style.left = fx + 'px';
  follower.style.top  = fy + 'px';
  requestAnimationFrame(trackFollower);
})();

const hoverSel = 'a, button, .card, .floating-badge, .proj-link';
document.querySelectorAll(hoverSel).forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = cursor.style.height = '18px';
    cursor.style.background = 'rgba(233,30,140,0.5)';
    follower.style.width = follower.style.height = '58px';
    follower.style.borderColor = '#e91e8c';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = cursor.style.height = '10px';
    cursor.style.background = '#e91e8c';
    follower.style.width = follower.style.height = '36px';
    follower.style.borderColor = 'rgba(233,30,140,0.5)';
  });
});

/* ── 3. CARD GLOW — mouse-tracking radial light ── */
document.querySelectorAll('.card').forEach(card => {
  const glow = card.querySelector('.card-glow');
  if (!glow) return;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    glow.style.left = (e.clientX - r.left) + 'px';
    glow.style.top  = (e.clientY - r.top)  + 'px';
  });
});

/* ── 4. NAVBAR ── */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', onScroll, { passive: true });
function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  let cur = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) cur = s.id;
  });
  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  updateBackToTop();
  animateHeroScene();
}

/* ── 5. HAMBURGER ── */
const hamburger    = document.getElementById('hamburger');
const navLinksWrap = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const open = navLinksWrap.classList.toggle('open');
  const sp = hamburger.querySelectorAll('span');
  sp[0].style.transform = open ? 'translateY(7px) rotate(45deg)'  : '';
  sp[1].style.opacity   = open ? '0' : '';
  sp[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)': '';
});
navLinksWrap.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinksWrap.classList.remove('open');
  hamburger.querySelectorAll('span').forEach(s => { s.style.transform=''; s.style.opacity=''; });
}));

/* ═══════════════════════════════════════════════════════
   6. BIDIRECTIONAL SCROLL ANIMATION ENGINE
   Cards animate IN when entering viewport (down or up),
   animate OUT when leaving viewport (down or up).
═══════════════════════════════════════════════════════ */
const scrollEls = [...document.querySelectorAll('[data-scroll]')];
// Track previous bounding rect top for each element
const prevTops = new WeakMap();

scrollEls.forEach(el => {
  prevTops.set(el, el.getBoundingClientRect().top);
});

const scrollObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const el = entry.target;
    const delay = parseInt(el.getAttribute('data-scroll-delay') || 0);
    const rect  = el.getBoundingClientRect();
    const prevTop = prevTops.get(el) ?? rect.top;

    if (entry.isIntersecting) {
      /* ── ENTER: element is coming into view ── */
      el.classList.remove('exit-down', 'exit-up');
      setTimeout(() => el.classList.add('is-visible'), delay);
    } else {
      /* ── EXIT: element is leaving view ── */
      el.classList.remove('is-visible');
      // Determine direction of exit
      if (rect.top > 0) {
        // Leaving towards bottom (user scrolled back up)
        el.classList.add('exit-down');
      } else {
        // Leaving towards top (user scrolled down past it)
        el.classList.add('exit-up');
      }
    }
    prevTops.set(el, rect.top);
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px'
});

scrollEls.forEach(el => scrollObs.observe(el));

/* ═══════════════════════════════════════════════════════
   7. HERO — PARTICLE CANVAS
═══════════════════════════════════════════════════════ */
(function heroParticles() {
  const hero   = document.querySelector('.hero');
  const canvas = document.createElement('canvas');
  canvas.id    = 'particleCanvas';
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 90;
  const pts = Array.from({length: COUNT}, () => ({
    x: Math.random() * 1920, y: Math.random() * 900,
    r: Math.random() * 1.6 + 0.3,
    dx: (Math.random() - .5) * .4, dy: (Math.random() - .5) * .4,
    a: Math.random() * .45 + .08
  }));

  let hx = W / 2, hy = H / 2;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    hx = e.clientX - r.left;
    hy = e.clientY - r.top;
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      const dx = p.x - hx, dy = p.y - hy, d = Math.hypot(dx, dy);
      if (d < 130) { p.x += dx / d * .9; p.y += dy / d * .9; }
      p.x = (p.x + p.dx + W) % W;
      p.y = (p.y + p.dy + H) % H;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(233,30,140,${p.a})`;
      ctx.fill();
    });
    // Draw connecting lines
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(233,30,140,${.09 * (1 - d / 110)})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── 8. TYPEWRITER ── */
(function typewriter() {
  const el = document.querySelector('.hero-role');
  if (!el) return;
  const roles = ['AI & ML Developer', 'Full Stack Engineer', 'Creative Problem Solver'];
  let ri = 0, ci = 0, del = false;
  el.innerHTML = '<span class="type-text"></span><span class="type-cursor">|</span>';
  const txt = el.querySelector('.type-text');
  function tick() {
    const w = roles[ri];
    if (!del) {
      txt.textContent = w.slice(0, ++ci);
      if (ci === w.length) { del = true; return setTimeout(tick, 1800); }
    } else {
      txt.textContent = w.slice(0, --ci);
      if (ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(tick, del ? 50 : 90);
  }
  setTimeout(tick, 1000);
})();

/* ── 9. ANIMATED COUNTERS ── */
function countUp(el) {
  const target = +el.getAttribute('data-target');
  let cur = 0;
  const step = target / 80;
  const id = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = Math.floor(cur);
    if (cur >= target) clearInterval(id);
  }, 18);
}
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); statObs.unobserve(e.target); } });
}, { threshold: .6 });
document.querySelectorAll('.stat-num').forEach(el => statObs.observe(el));

/* ── 10. PROJECT CARD 3D TILT ── */
document.querySelectorAll('.project-card').forEach(card => {
  card.style.transformStyle = 'preserve-3d';
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform = `translateY(-8px) rotateX(${-y*10}deg) rotateY(${x*10}deg) scale(1.02)`;
    const acc = card.querySelector('.project-accent');
    if (acc) acc.style.transform = `translate(${x*25}px,${y*25}px) scale(1.4)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    const acc = card.querySelector('.project-accent');
    if (acc) acc.style.transform = '';
  });
});

/* ── 11. ABOUT CARD TILT ── */
document.querySelectorAll('.about-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform = `translateY(-6px) rotateX(${-y*7}deg) rotateY(${x*7}deg)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

/* ── 12. SKILL TAG STAGGER HOVER ── */
document.querySelectorAll('.skill-category').forEach(cat => {
  const tags = [...cat.querySelectorAll('.tag')];
  cat.addEventListener('mouseenter', () =>
    tags.forEach((t, i) => setTimeout(() => {
      t.style.cssText = 'background:rgba(233,30,140,.18);border-color:rgba(233,30,140,.5);color:#fff;transform:translateY(-3px) scale(1.07);transition:all .25s ease';
    }, i * 38))
  );
  cat.addEventListener('mouseleave', () =>
    tags.forEach(t => t.style.cssText = '')
  );
});

/* ── 13. EDU CARD TILT ── */
document.querySelectorAll('.edu-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform = `translateY(-8px) rotateX(${-y*8}deg) rotateY(${x*8}deg)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

/* ── 14. SECTION TITLE CLIP-PATH REVEAL ── */
const titleObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.clipPath = 'inset(0 0% 0 0)';
      titleObs.unobserve(e.target);
    }
  });
}, { threshold: .4 });
document.querySelectorAll('.section-title').forEach(t => {
  t.style.cssText += ';clip-path:inset(0 100% 0 0);transition:clip-path 0.9s cubic-bezier(0.77,0,0.175,1)';
  titleObs.observe(t);
});

/* ── 15. HERO PARALLAX SLASHES ── */
const heroScene = document.querySelector('.hero');
const heroPortrait = document.querySelector('.hero-portrait-shell');
const heroStripes = [...document.querySelectorAll('.hero .diagonal-stripe')];

function animateHeroScene() {
  if (!heroScene) return;
  const sy = window.scrollY;
  heroStripes.forEach((stripe, i) => {
    const drift = sy * (0.025 + i * 0.006);
    stripe.style.transform = `skewX(-22deg) translateY(${drift}px)`;
  });
}

if (heroScene && heroPortrait) {
  heroScene.addEventListener('mousemove', e => {
    const rect = heroScene.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    heroPortrait.style.transform = `translate3d(${px * 14}px, ${py * 10}px, 0)`;
  });

  heroScene.addEventListener('mouseleave', () => {
    heroPortrait.style.transform = '';
  });
}

/* ── 16. CONTACT FORM ── */
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    let err = false;
    form.querySelectorAll('input, textarea').forEach(f => {
      if (!f.value.trim()) {
        f.classList.add('shake');
        f.addEventListener('animationend', () => f.classList.remove('shake'), { once: true });
        err = true;
      }
    });
    if (err) return;
    const btn = form.querySelector('.form-btn');
    btn.innerHTML = '<span>Sending…</span><i class="fas fa-spinner fa-spin"></i>';
    btn.disabled  = true;
    setTimeout(() => {
      btn.innerHTML = '<span>Sent! 🎉</span><i class="fas fa-check"></i>';
      btn.style.background = 'linear-gradient(135deg,#0ea870,#05c97a)';
      formSuccess.style.display = 'block';
      form.reset();
      setTimeout(() => {
        btn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
        btn.style.background = '';
        btn.disabled = false;
        formSuccess.style.display = 'none';
      }, 4000);
    }, 1600);
  });
}

/* ── 17. CONTACT SOCIAL RIPPLE ── */
document.querySelectorAll('.contact-social a, .hero-socials a').forEach(a => {
  a.style.position = 'relative';
  a.style.overflow = 'hidden';
  a.addEventListener('click', function() {
    const r = document.createElement('span');
    Object.assign(r.style, {
      position:'absolute', borderRadius:'50%', width:'60px', height:'60px',
      background:'rgba(233,30,140,.3)', animation:'rippleAnim .6s ease forwards',
      top:'50%', left:'50%', marginTop:'-30px', marginLeft:'-30px', pointerEvents:'none'
    });
    this.appendChild(r);
    setTimeout(() => r.remove(), 700);
  });
});

/* ── 18. BACK-TO-TOP ── */
const btn = document.createElement('button');
btn.id = 'backToTop';
btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
document.body.appendChild(btn);
function updateBackToTop() {
  btn.classList.toggle('visible', window.scrollY > 500);
}
btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── 19. SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ── 20. FOOTER NAME GLOW ── */
const fn = document.querySelector('.footer .pink');
if (fn) {
  fn.addEventListener('mouseenter', () => fn.style.cssText += ';text-shadow:0 0 22px rgba(233,30,140,.8);letter-spacing:.04em;transition:all .3s ease');
  fn.addEventListener('mouseleave', () => { fn.style.textShadow=''; fn.style.letterSpacing=''; });
}
