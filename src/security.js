import './security.css';
import { applyWidowProtection, t } from './i18n.js';
import { itemCopy, guidedLights } from './security-translations.js';
import { createSecurityViewer } from './security-viewer.js';

const ASSETS = '/assets/v2/';
const FACES = {
  front: { name: 'Tikal', image: `${ASSETS}front.webp`, alt: ['Cédula original: lado do templo, marca d’água do jaguar e retrato.', 'Billete original: cara del templo, marca de agua del jaguar y retrato.'] },
  back: { name: 'Quetzal', image: `${ASSETS}back.webp`, alt: ['Cédula original: lado do quetzal e da ceiba.', 'Billete original: cara del quetzal y la ceiba.'] },
};

function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function setCopy(root, selector, pt, es, attribute) {
  const element = root.querySelector(selector);
  if (!element) return;
  if (attribute) element.setAttribute(attribute, t(pt, es));
  else element.textContent = t(pt, es);
}

function initAtlas(root, sourceItems) {
  if (root.dataset.securityReady) return;
  root.dataset.securityReady = 'true';
  // The visitor starts at Tikal (the front), then crosses to Quetzal,
  // and ends with the substrate.
  const items = [
    ...sourceItems.filter(item => item.face === 'front'),
    ...sourceItems.filter(item => item.face === 'back'),
    ...sourceItems.filter(item => !item.face),
  ].map((item, index) => ({ ...item, number: String(index + 1).padStart(2, '0') }));
  root.innerHTML = `
    <div class="sec-atlas">
      <div class="sec-toolbar">
        <div class="sec-face-switch" role="group">
          <button type="button" data-sec-face="front" aria-pressed="true">Tikal</button>
          <button type="button" data-sec-face="back" aria-pressed="false">Quetzal</button>
        </div>
        <span class="sec-toolbar-hint"></span>
      </div>
      <div class="sec-layout">
        <div class="sec-exhibit">
          <div class="sec-note-stage">
            <img class="sec-note" width="4720" height="2215" loading="lazy" decoding="async">
            <span class="sec-note-loader" role="status"></span>
            <div class="sec-hotspots"></div>
          </div>
          <div class="sec-caption"><span class="sec-face-caption"></span><span class="sec-caption-hint"></span></div>
          <div class="sec-selected" aria-live="polite" aria-atomic="true">
            <div class="sec-selected-copy"><p class="sec-detail-index"></p><h3 class="sec-detail-title"></h3><p class="sec-detail-description"></p></div>
            <figure class="sec-macro"><button class="sec-macro-open" type="button" aria-haspopup="dialog"><img width="520" height="520" loading="lazy" decoding="async"><span class="sec-macro-expand" aria-hidden="true">＋</span></button><figcaption></figcaption></figure>
            <div class="sec-material-mark" hidden><span>UltraLife</span><strong>Fusion<sup>™</sup></strong><small></small></div>
          </div>
        </div>
        <nav class="sec-index"><p class="sec-index-label"></p><div class="sec-item-list"></div></nav>
      </div>
    </div>`;

  const note = root.querySelector('.sec-note');
  const hotspots = root.querySelector('.sec-hotspots');
  const list = root.querySelector('.sec-item-list');
  const detailImage = root.querySelector('.sec-macro img');
  const macroButton = root.querySelector('.sec-macro-open');
  const viewer = createSecurityViewer();
  const noteStage = root.querySelector('.sec-note-stage');
  let face = 'front';
  let selected = items.find(item => item.id === 'marca-agua') || items[0];

  note.addEventListener('load', () => { noteStage.dataset.loading = 'false'; });
  note.addEventListener('error', () => { noteStage.dataset.loading = 'error'; updateText(); });
  detailImage.addEventListener('error', () => { detailImage.hidden = true; macroButton.disabled = true; updateText(); });
  macroButton.addEventListener('click', () => viewer.open(selected, macroButton));

  const buttons = items.map(item => {
    const button = make('button', 'sec-item');
    button.type = 'button';
    button.dataset.secItem = item.id;
    button.setAttribute('aria-pressed', 'false');
    button.append(make('span', 'sec-item-number', item.number), make('span', 'sec-item-name', itemCopy(item).name), make('span', 'sec-item-arrow', '↗'));
    button.lastElementChild.setAttribute('aria-hidden', 'true');
    button.addEventListener('click', () => select(item, { revealStage: true }));
    list.append(button);
    return button;
  });

  function updateText() {
    const copy = itemCopy(selected);
    const currentFace = FACES[face];
    setCopy(root, '.sec-face-switch', 'Lado da cédula', 'Cara del billete', 'aria-label');
    setCopy(root, '.sec-toolbar-hint', 'Toque em um detalhe. Veja de perto.', 'Elige un detalle. Mira de cerca.');
    setCopy(root, '.sec-hotspots', 'Detalhes localizados na cédula', 'Detalles localizados en el billete', 'aria-label');
    setCopy(root, '.sec-caption-hint', 'Explore os pontos ou escolha um detalhe', 'Explora los puntos o elige un detalle');
    setCopy(root, '.sec-index', '12 detalhes da cédula', '12 detalles del billete', 'aria-label');
    setCopy(root, '.sec-index-label', '12 formas de olhar mais perto', '12 formas de mirar más de cerca');
    setCopy(root, '.sec-material-mark small', 'Tecnologia do substrato', 'Tecnología del sustrato');
    setCopy(root, '.sec-note-loader', noteStage.dataset.loading === 'error' ? 'Imagem indisponível. Tente novamente em instantes.' : 'Carregando a imagem original…', noteStage.dataset.loading === 'error' ? 'Imagen no disponible. Inténtalo de nuevo en unos instantes.' : 'Cargando la imagen original…');
    setCopy(root, '.sec-macro figcaption', detailImage.hidden ? 'Detalhe indisponível.' : 'Ampliar detalhe', detailImage.hidden ? 'Detalle no disponible.' : 'Ampliar detalle');
    macroButton.setAttribute('aria-label', `${t('Ampliar', 'Ampliar')}: ${copy.name}`);
    note.alt = selected.mode === 'uv' ? t('UV original do lado quetzal da cédula.', 'UV original de la cara del quetzal del billete.') : t(...currentFace.alt);
    root.querySelector('.sec-face-caption').textContent = `${currentFace.name} · ${selected.mode === 'uv' ? t('Impressão UV', 'Impresión UV') : t('A cédula', 'El billete')}`;
    root.querySelector('.sec-detail-index').textContent = `${selected.number} / ${selected.mode === 'material' ? t('O material', 'El material') : t('O detalhe', 'El detalle')}`;
    root.querySelector('.sec-detail-title').textContent = copy.name;
    root.querySelector('.sec-detail-description').textContent = copy.description;
    detailImage.alt = `${copy.name}: ${t('detalhe ampliado da cédula original.', 'detalle ampliado del billete original.')}`;
    buttons.forEach((button, index) => { button.querySelector('.sec-item-name').textContent = itemCopy(items[index]).name; });
    hotspots.querySelectorAll('[data-sec-hotspot]').forEach(dot => {
      const item = items.find(entry => entry.id === dot.dataset.secHotspot);
      dot.setAttribute('aria-label', `${item.number}. ${itemCopy(item).name}`);
    });
    applyWidowProtection(root);
  }

  function renderFace() {
    const currentFace = FACES[face];
    const nextImage = selected.mode === 'uv' ? `${ASSETS}uv.webp` : currentFace.image;
    if (note.getAttribute('src') !== nextImage) {
      noteStage.dataset.loading = 'true';
      note.src = nextImage;
    }
    note.width = face === 'front' ? 4720 : 7086;
    note.height = face === 'front' ? 2215 : 3323;
    root.querySelectorAll('[data-sec-face]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.secFace === face)));
    hotspots.replaceChildren();
    items.filter(item => item.face === face && item.position).forEach(item => {
      const dot = make('button', 'sec-hotspot', item.number);
      dot.type = 'button';
      dot.dataset.secHotspot = item.id;
      dot.style.left = `${item.position.x * 100}%`;
      dot.style.top = `${item.position.y * 100}%`;
      dot.setAttribute('aria-pressed', String(item.id === selected.id));
      dot.addEventListener('click', () => {
        select(item, { revealStage: true });
        hotspots.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
      });
      hotspots.append(dot);
    });
  }

  function revealSelection() {
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const target = root.querySelector(mobile ? '.sec-exhibit' : '.sec-atlas');
    const stageBounds = (mobile ? noteStage : target).getBoundingClientRect();
    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
    if (stageBounds.top < headerHeight || stageBounds.bottom > window.innerHeight) {
      const top = window.scrollY + target.getBoundingClientRect().top - headerHeight - (mobile ? 12 : 16);
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  function select(item, { revealStage = false } = {}) {
    selected = item;
    if (item.face) face = item.face;
    buttons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(button.dataset.secItem === item.id));
      button.classList.toggle('sec-item-other-face', items[index].face !== face && button.dataset.secItem !== 'substrato');
    });
    root.querySelector('.sec-macro').hidden = !item.macro;
    root.querySelector('.sec-material-mark').hidden = Boolean(item.macro);
    if (item.macro) {
      detailImage.hidden = false;
      macroButton.disabled = false;
      detailImage.src = item.macro;
    }
    renderFace();
    updateText();
    if (revealStage) revealSelection();
  }

  root.querySelectorAll('[data-sec-face]').forEach(button => {
    button.addEventListener('click', () => {
      face = button.dataset.secFace;
      select(items.find(item => item.face === face && item.id === (face === 'front' ? 'marca-agua' : 'fundo-seguranca')) || items.find(item => item.face === face), { revealStage: true });
    });
  });
  document.addEventListener('language:change', updateText);
  select(selected);
}

function initUV(root) {
  if (root.dataset.securityReady) return;
  root.dataset.securityReady = 'true';
  root.innerHTML = `
    <div class="uv-laboratory">
      <header class="uv-heading"><h2 class="uv-title"></h2><p class="uv-intro"></p></header>
      <div class="uv-layout">
        <div class="uv-exhibit">
          <div class="uv-window">
            <div class="uv-stage" tabindex="0" role="group" aria-describedby="uv-instructions" style="--uv-x: 51%; --uv-y: 34%; --uv-origin-x: 51%; --uv-origin-y: 34%">
              <img class="uv-normal-image" src="${ASSETS}back.webp" width="7086" height="3323" loading="lazy" decoding="async" draggable="false">
              <img class="uv-reveal-image" src="${ASSETS}uv.webp" width="7086" height="3323" loading="lazy" decoding="async" draggable="false">
              <span class="uv-lens" aria-hidden="true"><span></span></span>
            </div>
            <span class="uv-mode-label" aria-hidden="true"></span>
          </div>
          <p class="uv-instructions" id="uv-instructions"></p>
          <div class="uv-modes" role="group"><button type="button" data-uv-mode="light" aria-pressed="true"><span class="uv-mode-copy"></span><span aria-hidden="true">◎</span></button><button type="button" data-uv-mode="full" aria-pressed="false"><span class="uv-mode-copy"></span><span aria-hidden="true">↗</span></button><button type="button" class="uv-zoom-toggle" data-uv-zoom aria-pressed="false"><span class="uv-zoom-copy"></span><span class="uv-zoom-symbol" aria-hidden="true">＋</span></button></div>
        </div>
        <aside class="uv-guide">
          <p class="uv-guide-label"></p>
          <div class="uv-guide-buttons" role="group"></div>
          <div class="uv-guide-detail" aria-live="polite" aria-atomic="true"><figure class="uv-original-macro"><img width="520" height="520" loading="lazy" decoding="async"><figcaption></figcaption></figure><h3></h3><p class="uv-guide-description"></p></div>
        </aside>
      </div>
      <p class="uv-footnote"></p>
    </div>`;
  const stage = root.querySelector('.uv-stage');
  const zoomButton = root.querySelector('[data-uv-zoom]');
  const normalImage = root.querySelector('.uv-normal-image');
  const ultravioletImage = root.querySelector('.uv-reveal-image');
  let light = { x: 51, y: 34 };
  let mode = 'light';
  let animationFrame = 0;
  let isZoomed = false;
  let guidedIndex = 1;
  let activePointer = null;
  const touchQuery = window.matchMedia('(pointer: coarse)');

  function updateText() {
    setCopy(root, '.uv-title', 'Conduza a luz.', 'Guía la luz.');
    setCopy(root, '.uv-intro', 'Aproxime. Ilumine. Descubra.\nExplore a impressão ultravioleta da cédula original.', 'Acércate. Ilumina. Descubre.\nExplora la impresión ultravioleta del billete original.');
    setCopy(root, '.uv-stage', 'Explore a impressão UV com uma luz móvel', 'Explora la impresión UV con una luz móvil', 'aria-label');
    setCopy(root, '.uv-normal-image', 'Cédula original: lado do quetzal em luz normal.', 'Billete original: cara del quetzal bajo luz normal.', 'alt');
    setCopy(root, '.uv-reveal-image', 'Impressão UV original revelada pela luz móvel.', 'Impresión UV original revelada por la luz móvil.', 'alt');
    if (touchQuery.matches) {
      setCopy(root, '.uv-instructions', 'Arraste o dedo sobre a cédula para conduzir a luz. Para continuar a página, arraste fora da imagem.', 'Arrastra el dedo sobre el billete para guiar la luz. Para seguir por la página, desliza fuera de la imagen.');
    } else {
      setCopy(root, '.uv-instructions', 'Mova a luz ou toque na cédula. Com a imagem em foco, use as setas do teclado.', 'Mueve la luz o toca el billete. Con la imagen enfocada, usa las flechas del teclado.');
    }
    setCopy(root, '.uv-modes', 'Modo de exploração UV', 'Modo de exploración UV', 'aria-label');
    setCopy(root, '[data-uv-mode="light"] .uv-mode-copy', 'Explorar com luz', 'Explorar con luz');
    setCopy(root, '[data-uv-mode="full"] .uv-mode-copy', 'Revelar toda a UV', 'Revelar toda la UV');
    setCopy(root, '.uv-guide', 'Percurso guiado de impressão UV', 'Recorrido guiado por la impresión UV', 'aria-label');
    setCopy(root, '.uv-guide-label', 'Três pontos de descoberta', 'Tres puntos de descubrimiento');
    setCopy(root, '.uv-guide-buttons', 'Escolha um detalhe UV', 'Elige un detalle UV', 'aria-label');
    setCopy(root, '.uv-original-macro figcaption', 'Detalhe ampliado', 'Detalle ampliado');
    setCopy(root, '.uv-footnote', 'Impressão UV multitonal em registro com a arte da cédula.', 'Impresión UV multitonal en registro con el diseño del billete.');
    root.querySelector('.uv-mode-label').textContent = mode === 'full' ? t('UV integral', 'UV completa') : t('Luz UV', 'Luz UV');
    zoomButton.querySelector('.uv-zoom-copy').textContent = isZoomed ? t('Retornar à cédula', 'Volver al billete') : t('Ampliar área', 'Ampliar área');
    const point = guidedLights[guidedIndex];
    root.querySelector('.uv-guide-detail h3').textContent = t(...point.name);
    root.querySelector('.uv-guide-description').textContent = t(...point.text);
    root.querySelector('.uv-original-macro img').alt = `${t(...point.name)}: ${t('detalhe UV original ampliado.', 'detalle UV original ampliado.')}`;
    root.querySelectorAll('[data-uv-point]').forEach((button, index) => { button.lastElementChild.textContent = t(...guidedLights[index].name); });
    applyWidowProtection(root);
  }

  function anchorCamera(x, y) {
    stage.style.setProperty('--uv-origin-x', `${x}%`);
    stage.style.setProperty('--uv-origin-y', `${y}%`);
  }

  function updateZoom() {
    const availablePixels = Math.min(1800, normalImage.naturalWidth || 1800, ultravioletImage.naturalWidth || 1800);
    const maximumScale = Math.max(1, Math.min(2, availablePixels / Math.max(1, stage.clientWidth)));
    zoomButton.disabled = maximumScale <= 1.01;
    if (zoomButton.disabled) isZoomed = false;
    stage.style.setProperty('--uv-zoom', String(isZoomed ? maximumScale : 1));
    zoomButton.setAttribute('aria-pressed', String(isZoomed));
    zoomButton.querySelector('.uv-zoom-copy').textContent = isZoomed ? t('Retornar à cédula', 'Volver al billete') : t('Ampliar área', 'Ampliar área');
    zoomButton.querySelector('.uv-zoom-symbol').textContent = isZoomed ? '−' : '＋';
  }

  function paintLight() {
    animationFrame = 0;
    stage.style.setProperty('--uv-x', `${light.x}%`);
    stage.style.setProperty('--uv-y', `${light.y}%`);
  }

  function moveLight(x, y) {
    light = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    if (!animationFrame) animationFrame = requestAnimationFrame(paintLight);
  }

  function setMode(nextMode) {
    releasePointer();
    mode = nextMode;
    if (mode === 'full' && isZoomed) { isZoomed = false; updateZoom(); }
    stage.classList.toggle('uv-stage-full', mode === 'full');
    root.querySelectorAll('[data-uv-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.uvMode === mode)));
    root.querySelector('.uv-mode-label').textContent = mode === 'full' ? t('UV integral', 'UV completa') : t('Luz UV', 'Luz UV');
  }

  function guide(index) {
    guidedIndex = index;
    const point = guidedLights[index];
    setMode('light');
    moveLight(point.x, point.y);
    anchorCamera(point.x, point.y);
    root.querySelectorAll('[data-uv-point]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.uvPoint) === index)));
    root.querySelector('.uv-original-macro img').src = `${ASSETS}security/${point.macro}`;
    updateText();
  }

  const guideButtons = root.querySelector('.uv-guide-buttons');
  guidedLights.forEach((point, index) => {
    const button = make('button', 'uv-guide-button');
    button.type = 'button';
    button.dataset.uvPoint = index;
    button.append(make('span', '', `0${index + 1}`), make('span', '', t(...point.name)));
    button.addEventListener('click', () => guide(index));
    guideButtons.append(button);
  });

  const onPointer = event => {
    if (mode !== 'light' || !event.isPrimary) return;
    if (event.pointerType !== 'mouse' && activePointer !== event.pointerId) return;
    if (event.pointerType !== 'mouse' && event.cancelable) event.preventDefault();
    const rect = stage.getBoundingClientRect();
    moveLight(((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100);
  };
  function releasePointer() {
    if (activePointer !== null && stage.hasPointerCapture(activePointer)) stage.releasePointerCapture(activePointer);
    activePointer = null;
    stage.classList.remove('uv-stage-dragging');
  }
  stage.addEventListener('pointermove', onPointer, { passive: false });
  stage.addEventListener('pointerdown', event => {
    if (mode !== 'light' || !event.isPrimary || event.button !== 0) return;
    activePointer = event.pointerId;
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('uv-stage-dragging');
    onPointer(event);
  }, { passive: false });
  stage.addEventListener('pointerup', releasePointer);
  stage.addEventListener('pointercancel', releasePointer);
  stage.addEventListener('lostpointercapture', releasePointer);
  stage.addEventListener('dragstart', event => event.preventDefault());
  stage.addEventListener('keydown', event => {
    const movements = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -7], ArrowDown: [0, 7] };
    if (!movements[event.key]) return;
    event.preventDefault();
    if (mode === 'full') setMode('light');
    moveLight(light.x + movements[event.key][0], light.y + movements[event.key][1]);
    if (isZoomed) anchorCamera(light.x, light.y);
  });
  root.querySelectorAll('[data-uv-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.uvMode)));
  zoomButton.addEventListener('click', () => {
    isZoomed = !isZoomed;
    if (isZoomed) anchorCamera(light.x, light.y);
    updateZoom();
  });
  normalImage.addEventListener('load', updateZoom);
  ultravioletImage.addEventListener('load', updateZoom);
  new ResizeObserver(updateZoom).observe(stage);
  document.addEventListener('language:change', updateText);
  touchQuery.addEventListener('change', updateText);
  guide(1);
  updateZoom();
}

export async function initSecurity() {
  const atlas = document.querySelector('#security-root');
  const laboratory = document.querySelector('#uv-root');
  if (laboratory) initUV(laboratory);
  if (atlas && !atlas.dataset.securityReady) {
    try {
      const response = await fetch(`${ASSETS}security/security-data.json`);
      if (!response.ok) throw new Error(`Unable to load security reference data (${response.status})`);
      const data = await response.json();
      initAtlas(atlas, data);
    } catch (error) {
      console.error(error);
      const fallback = make('p', 'sec-load-message');
      const translateFallback = () => { fallback.textContent = t('Os detalhes não puderam carregar. Atualize a página para tentar novamente.', 'No se han podido cargar los detalles. Actualiza la página para volver a intentarlo.'); };
      translateFallback();
      document.addEventListener('language:change', translateFallback);
      atlas.replaceChildren(fallback);
    }
  }
}
