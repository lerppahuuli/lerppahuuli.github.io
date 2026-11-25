const menu = document.querySelector('#mobilenav');
const toggle = document.querySelector('#menubtn');
const headerDropdowns = [...document.querySelectorAll('header details')];
function setMenu(open) {
  menu.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Sulje valikko' : 'Avaa valikko');
  if (!open) {
    for (const dropdown of menu.querySelectorAll('details[open]')) dropdown.open = false;
  }
}
toggle.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const dropdown = event.target.closest('header details[open]')
    || headerDropdowns.find(item => item.open && item.getClientRects().length);
  if (dropdown) {
    dropdown.open = false;
    dropdown.querySelector('summary').focus();
  } else if (!menu.hidden) {
    setMenu(false);
    toggle.focus();
  }
});
document.addEventListener('click', event => {
  for (const dropdown of headerDropdowns) {
    if (dropdown.open && !dropdown.contains(event.target)) dropdown.open = false;
  }
  if (!event.target.closest('header') && !menu.hidden) setMenu(false);
});
const campaign = document.querySelector('.campaign');
if (campaign) {
  const today = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Helsinki',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  campaign.hidden = today < '2026-11-19' || today > '2026-11-30';
}
const compare = document.querySelector('#compare');
document.querySelector('#opencompare')?.addEventListener('click', () => compare.showModal());
for (const modal of document.querySelectorAll('dialog')) {
  modal.querySelector('.close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    const b = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom)) modal.close();
  });
}
const video = document.querySelector('#video');
if (video) {
  const stage = document.querySelector('#videostage'), play = document.querySelector('#loadvideo');
  for (const trigger of document.querySelectorAll('[data-video]')) {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      video.dataset.id = trigger.dataset.video;
      document.querySelector('#videotitle').textContent = trigger.dataset.title;
      document.querySelector('#youtube').href = trigger.href;
      const poster = new Image();
      poster.src = 'assets/' + trigger.dataset.poster + '.webp';
      poster.alt = trigger.dataset.title;
      stage.replaceChildren(poster);
      play.hidden = false;
      video.showModal();
    });
  }
  play.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + video.dataset.id + '?autoplay=1';
    iframe.title = document.querySelector('#videotitle').textContent;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    stage.replaceChildren(iframe);
    play.hidden = true;
    document.querySelector('#youtube').focus();
  });
  video.addEventListener('close', () => stage.replaceChildren());
}
for (const gallery of document.querySelectorAll('.gallery')) {
  const photo = gallery.querySelector('.bigproduct');
  const thumbs = gallery.querySelectorAll('[data-image]');
  for (const thumb of thumbs) thumb.addEventListener('click', () => {
    photo.src = 'assets/' + thumb.dataset.image + '.webp';
    photo.alt = thumb.dataset.alt;
    for (const item of thumbs) item.setAttribute('aria-pressed', String(item === thumb));
  });
}

for (const summary of document.querySelectorAll('[data-fit-sticky]')) {
  const updateSticky = () => {
    summary.dataset.fitSticky = String(summary.offsetHeight <= window.innerHeight - 48);
  };
  updateSticky();
  new ResizeObserver(updateSticky).observe(summary);
  window.addEventListener('resize', updateSticky);

  const link = summary.querySelector('[data-open-details]');
  const disclosure = document.getElementById(link.dataset.openDetails);
  link.addEventListener('click', () => {
    disclosure.open = true;
    updateSticky();
  });

  for (const item of summary.querySelectorAll('.product-disclosure')) {
    item.addEventListener('toggle', () => {
      const heading = item.querySelector('summary');
      if (item.open && document.activeElement === heading && heading.getBoundingClientRect().bottom < 24) {
        heading.scrollIntoView({ block: 'start' });
      }
    });
  }
}

const hero = document.querySelector('.hero');
if (hero) {
  const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  let frame = null;

  function positionHeroImage() {
    frame = null;
    const {top, bottom, height} = hero.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (bottom <= 0 || top >= viewportHeight || height === 0) return;
    const progress = (viewportHeight - top) / (viewportHeight + height);
    const offset = (progress - 0.5) * height * 0.16;
    hero.style.setProperty('--hero-offset', `${offset}px`);
  }

  function scheduleHeroPosition() {
    if (frame === null) frame = window.requestAnimationFrame(positionHeroImage);
  }

  function updateHeroMotion() {
    hero.classList.toggle('parallax-active', motion.matches);
    if (motion.matches) {
      window.addEventListener('scroll', scheduleHeroPosition, {passive: true});
      window.addEventListener('resize', scheduleHeroPosition);
      scheduleHeroPosition();
    } else {
      window.removeEventListener('scroll', scheduleHeroPosition);
      window.removeEventListener('resize', scheduleHeroPosition);
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      hero.style.removeProperty('--hero-offset');
    }
  }

  motion.addEventListener('change', updateHeroMotion);
  updateHeroMotion();
}

const reviewCarousel = document.querySelector('.review-carousel');
if (reviewCarousel) {
  const slides = [...reviewCarousel.querySelectorAll('.review-slide')];
  const pagination = reviewCarousel.querySelector('.review-dots');
  const dots = [...pagination.querySelectorAll('.review-dot')];
  const status = reviewCarousel.querySelector('.review-status');

  function showReview(index) {
    slides.forEach((slide, slideIndex) => {
      const isCurrent = slideIndex === index;
      slide.inert = !isCurrent;
      if (isCurrent) {
        dots[slideIndex].setAttribute('aria-current', 'true');
      } else {
        dots[slideIndex].removeAttribute('aria-current');
      }
    });
  }

  if (slides.length > 1) {
    showReview(0);
    reviewCarousel.classList.add('is-ready');
    pagination.hidden = false;
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (dot.hasAttribute('aria-current')) return;
        showReview(index);
        const quote = slides[index].querySelector('blockquote').textContent;
        const author = slides[index].querySelector('figcaption').textContent;
        status.textContent = `Arvostelu ${index + 1} / ${slides.length}. ${quote} ${author}`;
      });
    });
  }
}

for (const carousel of document.querySelectorAll('.product-reviews')) {
  const pages = [...carousel.querySelectorAll('.product-review-page')];
  const pagination = carousel.querySelector('.review-dots');
  const dots = [...pagination.querySelectorAll('.review-dot')];
  const status = carousel.querySelector('.product-review-status');

  function showPage(index) {
    pages.forEach((page, pageIndex) => {
      const isCurrent = pageIndex === index;
      page.hidden = !isCurrent;
      if (isCurrent) dots[pageIndex].setAttribute('aria-current', 'true');
      else dots[pageIndex].removeAttribute('aria-current');
    });
  }

  showPage(0);
  carousel.classList.add('is-ready');
  pagination.hidden = false;
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      if (dot.hasAttribute('aria-current')) return;
      showPage(index);
      status.textContent = `${pages[index].getAttribute('aria-label')}, sivu ${index + 1} / ${pages.length}.`;
    });
  });
}

// The accessory module previews selections in the redesign without changing
// the actual Poimu webshop cart or initiating a purchase.
for (const panel of document.querySelectorAll('.upsell-panel')) {
  const choices = [...panel.querySelectorAll('.upsell-add')];
  const status = panel.querySelector('.upsell-selection');
  const euros = new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' });
  for (const choice of choices) {
    choice.addEventListener('click', () => {
      const selected = choice.getAttribute('aria-pressed') !== 'true';
      choice.setAttribute('aria-pressed', String(selected));
      choice.innerHTML = selected ? '<span aria-hidden="true">✓</span> Lisätty' : '<span aria-hidden="true">+</span> Lisää';
      const active = choices.filter(item => item.getAttribute('aria-pressed') === 'true');
      const total = active.reduce((sum, item) => sum + Number(item.dataset.price), 0);
      status.textContent = active.length
        ? `Valittu: ${active.map(item => item.dataset.name).join(', ')} · Esikatselun yhteensä ${euros.format(total / 100)}`
        : 'Ei valittuja lisätuotteita.';
    });
  }
}

// Static-site contact form: prepare a customer-reviewed email draft rather
// than claiming that a question has been submitted to a backend.
for (const form of document.querySelectorAll('.faq-form')) {
  const question = form.querySelector('textarea');
  const status = form.querySelector('.faq-form-status');
  question.addEventListener('input', () => question.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const message = question.value.trim();
    if (!message) {
      question.setCustomValidity('Kirjoita kysymyksesi.');
      question.reportValidity();
      return;
    }
    const subject = encodeURIComponent(`Kysymys tuotteesta: ${form.dataset.product}`);
    const body = encodeURIComponent(message);
    status.textContent = 'Lähetä kysymys avautuvasta sähköpostiluonnoksesta tai ota yhteyttä osoitteeseen info@poimu.eu.';
    window.location.href = `mailto:info@poimu.eu?subject=${subject}&body=${body}`;
  });
}

// One shared selection state keeps image hotspots and the feature list in sync.
for (const section of document.querySelectorAll('.structure-section')) {
  const controls = [...section.querySelectorAll('[data-structure-feature]')];
  const panels = [...section.querySelectorAll('[data-structure-panel]')];
  const status = section.querySelector('.structure-status');
  if (!controls.length || !panels.length) continue;
  let selected = '';
  function showFeature(key, announce = true) {
    const current = panels.find(panel => panel.dataset.structurePanel === key);
    if (!current || selected === key) return;
    selected = key;
    for (const control of controls) {
      control.setAttribute('aria-pressed', String(control.dataset.structureFeature === key));
    }
    for (const panel of panels) {
      const active = panel === current;
      panel.classList.toggle('is-active', active);
      panel.inert = !active;
      if (active) panel.removeAttribute('aria-hidden');
      else panel.setAttribute('aria-hidden', 'true');
    }
    if (announce) status.textContent = `Valittu ominaisuus: ${current.querySelector('h3').textContent}`;
  }
  showFeature(controls[0].dataset.structureFeature, false);
  section.classList.add('structure-ready');
  for (const control of controls) {
    const key = control.dataset.structureFeature;
    control.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') showFeature(key, false);
    });
    control.addEventListener('focus', () => showFeature(key));
    control.addEventListener('click', () => {
      showFeature(key);
      if (!window.matchMedia('(max-width: 900px)').matches) return;
      const current = panels.find(panel => panel.dataset.structurePanel === key);
      const bounds = current.getBoundingClientRect();
      if (bounds.top >= window.innerHeight || bounds.bottom <= 0) current.scrollIntoView({block: 'start', behavior: 'auto'});
    });
  }
}
