/* ── CURSOR GLOW ── */
const glow = document.getElementById('cursorGlow');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let glowX = mouseX, glowY = mouseY;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Smooth cursor follow
function animateCursor() {
  glowX += (mouseX - glowX) * 0.1;
  glowY += (mouseY - glowY) * 0.1;
  if (glow) {
    glow.style.left = `${glowX}px`;
    glow.style.top  = `${glowY}px`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

/* ── NAVBAR SCROLL STATE ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

/* ── MAGNETIC BUTTONS ── */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px) scale(1.03)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0) scale(1)';
  });
});

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Unobserve after first reveal for performance
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const text = el.textContent;
  // Skip if it has symbols we can't easily count up
  if (text.includes('<') || text.includes('%')) return;

  const isMPlus   = text.includes('M+');
  const isKPlus   = text.includes('K+');
  const hasPlus   = text.includes('+');
  const cleanNum  = parseFloat(text.replace(/[^0-9.]/g, ''));
  if (isNaN(cleanNum)) return;

  const duration = 1800;
  const steps    = 60;
  const stepTime = duration / steps;
  let current    = 0;

  const timer = setInterval(() => {
    current += cleanNum / steps;
    if (current >= cleanNum) {
      current = cleanNum;
      clearInterval(timer);
    }

    let display;
    if (isMPlus) {
      display = current.toFixed(0) + 'M+';
    } else if (isKPlus) {
      display = Math.round(current) + 'K+';
    } else if (hasPlus) {
      display = Math.round(current) + '+';
    } else {
      display = current.toFixed(cleanNum % 1 !== 0 ? 1 : 0);
    }
    el.textContent = display;
  }, stepTime);
}

// Trigger counters on scroll
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-band-num, .stat-num').forEach(el => {
  counterObserver.observe(el);
});

/* ── NAV ACTIVE LINK ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}`
          ? 'rgba(255,255,255,0.95)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ── FEATURE CARD TILT ── */
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-8px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ── HERO CARD TILT ── */
const heroCard = document.querySelector('.hero-card');
if (heroCard) {
  heroCard.addEventListener('mousemove', e => {
    const rect = heroCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    heroCard.style.transform = `rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
  });
  heroCard.addEventListener('mouseleave', () => {
    heroCard.style.transform = '';
  });
}

// ── DEMO SHORTENER ──
const demoSlugs = ['launch', 'promo', 'drop', 'sale', 'beta', 'news', 'v2', 'collab'];

const shortenBtn = document.getElementById('shortenBtn');
const copyBtn = document.getElementById('copyBtn');
const demoInput = document.getElementById('demoInput');
const linkResult = document.getElementById('linkResult');
const shortUrlEl = document.getElementById('shortUrl');
const clickCountEl = document.getElementById('clickCount');

shortenBtn.addEventListener('click', function () {
  if (!demoInput.value.trim()) {
    demoInput.focus();
    return;
  }

  shortenBtn.textContent = '...';
  shortenBtn.style.opacity = '0.6';
  shortenBtn.disabled = true;

  setTimeout(function () {
    const slug = demoSlugs[Math.floor(Math.random() * demoSlugs.length)];

    shortUrlEl.textContent = 'lnkfg.io/' + slug;
    clickCountEl.textContent = 'Click tracking available';

    copyBtn.textContent = 'Copy';
    copyBtn.style.color = '';
    copyBtn.style.borderColor = '';

    linkResult.style.transition = 'opacity 0.25s, transform 0.25s';
    linkResult.style.opacity = '0';
    linkResult.style.transform = 'translateY(6px)';
    linkResult.style.display = 'flex';

    requestAnimationFrame(function () {
      linkResult.style.opacity = '1';
      linkResult.style.transform = 'translateY(0)';
    });

    shortenBtn.textContent = '✓ Done';
    shortenBtn.style.opacity = '1';
    shortenBtn.disabled = false;

    setTimeout(function () {
      shortenBtn.textContent = 'Shorten →';
    }, 2000);
  }, 600);
});

copyBtn.addEventListener('click', function () {
  const url = 'https://' + shortUrlEl.textContent;

  navigator.clipboard.writeText(url).catch(function () {});

  copyBtn.textContent = '✓ Copied!';
  copyBtn.style.color = '#34d399';
  copyBtn.style.borderColor = 'rgba(52,209,153,0.4)';

  setTimeout(function () {
    copyBtn.textContent = 'Copy';
    copyBtn.style.color = '';
    copyBtn.style.borderColor = '';
  }, 2000);
});

// ── MOBILE MENU TOGGLE ──
const menuToggle = document.getElementById("menuToggle");
const mobileNavLinks = document.querySelector(".nav-links");
const mobileNavActions = document.querySelector(".nav-actions");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    mobileNavLinks.classList.toggle("active");
    mobileNavActions.classList.toggle("active");
  });
}