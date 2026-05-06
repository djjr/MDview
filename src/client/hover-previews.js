const card = document.createElement('aside');
card.className = 'hover-card';
card.setAttribute('role', 'tooltip');
document.body.appendChild(card);

let indexPromise;
function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(`${window.MDVIEW_BASE || '/'}documents.json`).then((r) => r.json()).catch(() => ({}));
  }
  return indexPromise;
}

function positionCard(event) {
  const pad = 16;
  const width = 352;
  const left = Math.min(event.clientX + pad, window.innerWidth - width - pad);
  const top = Math.min(event.clientY + pad, window.innerHeight - 180);
  card.style.transform = `translate(${Math.max(pad, left)}px, ${Math.max(pad, top)}px)`;
}

async function show(event) {
  const link = event.currentTarget;
  const slug = link.dataset.previewSlug;
  const index = await loadIndex();
  const doc = index[slug];
  if (!doc) return;
  card.innerHTML = `<h3>${doc.title}</h3><p>${doc.excerpt || 'No preview available yet.'}</p>`;
  positionCard(event);
  card.dataset.visible = 'true';
}

function hide() {
  card.dataset.visible = 'false';
}

document.querySelectorAll('a[data-preview-slug]').forEach((link) => {
  link.addEventListener('mouseenter', show);
  link.addEventListener('mousemove', positionCard);
  link.addEventListener('mouseleave', hide);
  link.addEventListener('focus', show);
  link.addEventListener('blur', hide);
});
