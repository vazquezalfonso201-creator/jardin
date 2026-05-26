/* ══════════════════════════════════════════════
   JARDÍN BOTÁNICO COBACH 01 BCS — script.js
══════════════════════════════════════════════ */

/* ── bajar con la barra de navegacion de forma bonita ───────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Hamburguesa /(tengo hambre) ───────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
function closeMobile() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
}

/* ── Cosa para que se mire bonito el bajar, no lo toquen, no se como funciona realmente, esto lo tome de GitHub y seguro alguien tomara esto para su propio proyecto, de echo de que sirve todo esto, actualmente estoy entregando esto para un trabajo escolar pero estoy ahaciendolo con calidad para que la usen realmente, que triste ───────────────────────────── */
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.07 + 's';
  revealObserver.observe(el);
});

/* ══════════════════════════════════════════════
   TEXT-TO-SPEECH tipo loquendo (loquendo city no aprueba esto)
   esto es una "Carta" que puedes encontrar la familia en el resto del codigo .tts-btn (🎧 emoji button).
   darle click hace que lea la información de la planta en esa carta, si le vuelves a dar click mientras esta leyendo se detiene, si le das click a otra carta mientras una esta leyendo se detiene la primera y empieza a leer la nueva.
   el boton funciona con magia, es una libreria que tome por ahi, nisiquiera se quien la hizo como para dar creditos xd, pero funciona bastante bien, el texto que lee se compone del titulo de la carta, la descripción y los datos curiosos (si es que tiene), el volumen se puede controlar con el slider que esta en cada carta, y si cambias el volumen mientras esta leyendo se actualiza al instante, si cambias de pestaña o recargas la pagina mientras esta leyendo se detiene automaticamente para no seguir hablando a lo loco, en fin, es una función bastante completa y util para personas con discapacidad visual o para los que prefieren escuchar en lugar de leer, espero que les guste y le saquen provecho, saludos.
══════════════════════════════════════════════ */

let currentUtterance = null;  // utterance currently speaking
let currentBtn       = null;  // button currently active

/**
 * Build the full text to read from a card:
 *   • card title (h3)
 *   • paragraph description (.plant-desc)
 *   • every <li> inside details
 */
function buildCardText(card) {
  const title = card.querySelector('h3')?.textContent?.trim() ?? '';
  const desc  = card.querySelector('.plant-desc')?.textContent?.trim() ?? '';

  // collect curiosities from the <li> elements inside <details>
  const items = Array.from(card.querySelectorAll('details li'))
    .map(li => li.textContent.trim())
    .filter(Boolean);

  let text = title + '. ' + desc;
  if (items.length) {
    text += '. Datos curiosos: ' + items.join('. ');
  }
  return text;
}

/**
 * Called by each 🎧 button's onclick="ttsPlay(this)"
 * Stops any ongoing speech first; if a different card was
 * playing it just stops. If this same card was playing, stops
 * (toggle off). Otherwise starts reading this card.
 * wooow no tengo ni la menor idea de como comprar estos parametros ME ESTOY VOLVIENDO LOKO
 */
function ttsPlay(btn) {
  const isSameBtn = (btn === currentBtn);

  // always stop whatever is playing
  stopTTS();

  // if we clicked the same button that was already playing → toggle off, done No tocar, lo aprendi a la mala :c
  if (isSameBtn) return;

  // find the parent card osea que solo la busca para leer
  const card = btn.closest('.plant-card');
  if (!card) return;

  const text = buildCardText(card);
  if (!text) return;

  // respect the volume slider that lives in this card "esto no funciona, de echo me quiero dar 20 tiros"
  const volInput = card.querySelector('.tts-vol');
  const volume   = volInput ? parseFloat(volInput.value) : 1;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang   = 'es-MX';
  utter.volume = volume;
  utter.rate   = 0.95;
  utter.pitch  = 1;

  utter.onstart = () => {
    currentBtn = btn;
    btn.classList.add('playing');
    btn.title = 'Pausar lectura';
  };

  utter.onend = utter.onerror = () => {
    clearBtnState(btn);
    currentUtterance = null;
    currentBtn       = null;
  };

  currentUtterance = utter;
  window.speechSynthesis.speak(utter);
}

function stopTTS() {
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }
  if (currentBtn) {
    clearBtnState(currentBtn);
    currentBtn = null;
  }
  currentUtterance = null;
}

function clearBtnState(btn) {
  btn.classList.remove('playing');
  btn.title = 'Escuchar descripción';
}

/**
 * Volume slider — live update while speaking "Gracias desconocido por hacer el codigo que robe y que otro me robara eventualmente"
 */
function setVol(rangeInput) {
  if (currentUtterance && currentBtn) {
    // find if this slider belongs to the currently speaking card
    const card = rangeInput.closest('.plant-card');
    if (card && card.contains(currentBtn)) {
      currentUtterance.volume = parseFloat(rangeInput.value);
    }
  }
}

// Stop TTS if user navigates away
window.addEventListener('beforeunload', () => window.speechSynthesis.cancel());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopTTS();
});

/* ══════════════════════════════════════════════
   Carrusel sin la API de bloobstrap por que me dio flojera abrir el navegador
══════════════════════════════════════════════ */
(function initCarousel() {
  const track    = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  if (!slides.length) return;

  let current  = 0;
  let autoTimer = null;
  const total  = slides.length;

  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
    dotsWrap.appendChild(dot);
  });

  function goTo(n) {
    current = (n + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  document.getElementById('prevBtn')?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  document.getElementById('nextBtn')?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 4500); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }
  startAuto();

  // tocar para deslizar en móviles, inspirado en https://stackoverflow.com/a/23230280
  let tx = 0;
  const carousel = document.getElementById('carousel');
  carousel?.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  carousel?.addEventListener('touchend', e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
  });
})();

/* ══════════════════════════════════════════════
   Barra buscadora inspirado en la de google, con autocompletado y todo, cada carta tiene un atributo data-search con palabras clave para buscar esa carta, también se puede buscar por el título de la carta, al hacer click en un resultado se hace scroll suave hacia esa carta y se resalta con un borde verde por unos segundos, si se presiona enter en el input de búsqueda se busca la primera coincidencia y se va hacia ella, si no hay coincidencias se muestra un mensaje de "Sin resultados", al hacer click fuera del input o los resultados se cierra el desplegable de resultados, también se puede cerrar con escape, es una función bastante completa para ser una barra de búsqueda local sin usar librerías ni nada, espero que les guste y le saquen provecho, saludos.
══════════════════════════════════════════════ */
const searchData = [];
document.querySelectorAll('.plant-card').forEach(card => {
  const keywords = card.getAttribute('data-search') ?? '';
  const name     = card.querySelector('h3')?.textContent ?? '';
  searchData.push({ name, keywords, card });
});

const searchInput   = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchInput?.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = '';
  if (!q) { searchResults.classList.remove('open'); return; }

  const matches = searchData.filter(item =>
    item.keywords.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
  );

  if (!matches.length) {
    searchResults.innerHTML = '<li style="color:var(--text-muted)">Sin resultados</li>';
  } else {
    matches.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.name;
      li.addEventListener('click', () => jumpTo(item.card));
      searchResults.appendChild(li);
    });
  }
  searchResults.classList.add('open');
});

document.addEventListener('click', e => {
  if (!searchInput?.contains(e.target) && !searchResults?.contains(e.target)) {
    searchResults?.classList.remove('open');
  }
});

searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
  if (e.key === 'Escape') { searchResults?.classList.remove('open'); searchInput.blur(); }
});

function doSearch() {
  const q = searchInput?.value.trim().toLowerCase();
  if (!q) return;
  const match = searchData.find(item =>
    item.keywords.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
  );
  if (match) { searchResults?.classList.remove('open'); jumpTo(match.card); }
}

function jumpTo(card) {
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.style.outline = '2.5px solid var(--green-light)';
  card.style.outlineOffset = '4px';
  setTimeout(() => { card.style.outline = ''; card.style.outlineOffset = ''; }, 2400);
  if (searchInput) searchInput.value = '';
  searchResults?.classList.remove('open');
}

/* ══════════════════════════════════════════════
   formato de contacto, solo visual, en realidad no esta conectado a nada xdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdxxdxdxdxdxdxdxdx
══════════════════════════════════════════════ */
function submitForm(e) {
  e.preventDefault();
  const note = document.getElementById('formNote');
  const btn  = e.target.querySelector('.submit-btn span');
  if (!btn) return;
  btn.textContent = 'Enviando…';
  setTimeout(() => {
    btn.textContent = 'Enviar mensaje';
    note.textContent = '✓ Mensaje enviado. ¡Gracias por contactarnos!';
    e.target.reset();
    setTimeout(() => { note.textContent = ''; }, 4000);
  }, 1200);
}
