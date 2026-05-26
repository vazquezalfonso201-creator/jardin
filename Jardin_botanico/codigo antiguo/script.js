/* ══════════════════════════════════════════════
   JARDÍN BOTÁNICO COBACH 01 BCS — script.js
══════════════════════════════════════════════ */

/* ── Custom cursor (por que esta bien bonito asi xdxdxd)───────────────────────── */
document.addEventListener('mousemove', e => {
  document.documentElement.style.setProperty('--cx', e.clientX + 'px');
  document.documentElement.style.setProperty('--cy', e.clientY + 'px');
});

/* ── Navbar scroll behavior ─────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Hamburger / mobile menu ─────────────── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

function closeMobile() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
}

/* ── Scroll reveal ───────────────────────── */
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + 's';
  revealObserver.observe(el);
});

/* ── Carousel (este esta mas bonito que el de broopstrap o como se escriba???) ────────────────────────────── */
(function initCarousel() {
  const track   = document.getElementById('carouselTrack');
  const slides  = track ? track.querySelectorAll('.carousel-slide') : [];
  const dotsWrap = document.getElementById('carouselDots');
  if (!slides.length) return;

  let current  = 0;
  let autoTimer = null;
  const total  = slides.length;

  // Build dots (libreria por que ni se hacer esto)
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(n) {
    current = (n + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  document.getElementById('prevBtn').addEventListener('click', () => {
    goTo(current - 1);
    resetAuto();
  });
  document.getElementById('nextBtn').addEventListener('click', () => {
    goTo(current + 1);
    resetAuto();
  });

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }
  startAuto();

  // Touch / swipe
  let touchStartX = 0;
  const carousel = document.getElementById('carousel');
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
      resetAuto();
    }
  });
})();

/* ── Search ──────────────────────────────── */
const searchData = [];
document.querySelectorAll('.plant-card').forEach(card => {
  const keywords = card.getAttribute('data-search') || '';
  const name     = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
  searchData.push({ name, keywords, card });
});

const searchInput   = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = '';
  if (!q) { searchResults.classList.remove('open'); return; }

  const matches = searchData.filter(item =>
    item.keywords.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
  );

  if (!matches.length) {
    searchResults.innerHTML = '<li style="color:var(--text-muted)">Sin resultados</li>';
    searchResults.classList.add('open');
    return;
  }

  matches.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    li.addEventListener('click', () => {
      searchResults.classList.remove('open');
      searchInput.value = '';
      item.card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      item.card.style.outline = '2.5px solid var(--green-light)';
      item.card.style.outlineOffset = '4px';
      setTimeout(() => { item.card.style.outline = ''; item.card.style.outlineOffset = ''; }, 2200);
    });
    searchResults.appendChild(li);
  });
  searchResults.classList.add('open');
});

document.addEventListener('click', e => {
  if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
    searchResults.classList.remove('open');
  }
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
  if (e.key === 'Escape') { searchResults.classList.remove('open'); searchInput.blur(); }
});

function doSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return;
  const match = searchData.find(item =>
    item.keywords.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
  );
  if (match) {
    searchResults.classList.remove('open');
    match.card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    match.card.style.outline = '2.5px solid var(--green-light)';
    match.card.style.outlineOffset = '4px';
    setTimeout(() => { match.card.style.outline = ''; match.card.style.outlineOffset = ''; }, 2200);
  }
}

/* ── Contact form (UI only) ──────────────── */
function submitForm(e) {
  e.preventDefault();
  const note = document.getElementById('formNote');
  const btn  = e.target.querySelector('.submit-btn span');
  btn.textContent = 'Enviando…';
  setTimeout(() => {
    btn.textContent = 'Enviar mensaje';
    note.textContent = '✓ Mensaje enviado. ¡Gracias por contactarnos!';
    e.target.reset();
    setTimeout(() => { note.textContent = ''; }, 4000);
  }, 1200);
}
