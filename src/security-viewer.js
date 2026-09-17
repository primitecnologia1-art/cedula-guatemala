import { applyWidowProtection, t } from './i18n.js';
import { itemCopy } from './security-translations.js';

/** A native modal keeps the enlarged detail and its explanation in one view. */
export function createSecurityViewer() {
  const dialog = document.createElement('dialog');
  dialog.className = 'sec-detail-dialog';
  dialog.setAttribute('aria-labelledby', 'sec-viewer-title');
  dialog.setAttribute('aria-describedby', 'sec-viewer-description');
  dialog.innerHTML = `
    <div class="sec-viewer-shell">
      <header class="sec-viewer-header">
        <span class="sec-viewer-label"></span>
        <button class="sec-viewer-close" type="button" autofocus><span></span><span aria-hidden="true">×</span></button>
      </header>
      <div class="sec-viewer-content">
        <figure class="sec-viewer-image"><img width="520" height="520" decoding="async"><figcaption role="status" hidden></figcaption></figure>
        <div class="sec-viewer-copy"><p class="sec-detail-index"></p><h2 class="sec-detail-title" id="sec-viewer-title"></h2><p class="sec-detail-description" id="sec-viewer-description"></p></div>
      </div>
    </div>`;
  document.body.append(dialog);

  const image = dialog.querySelector('img');
  const imageStatus = dialog.querySelector('figcaption');
  const closeButton = dialog.querySelector('.sec-viewer-close');
  const body = document.body;
  const lockedProperties = ['overflow', 'position', 'top', 'left', 'right', 'width', 'padding-right', 'box-sizing'];
  let selected;
  let previousFocus;
  let scrollPosition;
  let savedBodyStyles;
  let backdropPressed = false;

  function updateText() {
    closeButton.firstElementChild.textContent = t('Fechar', 'Cerrar');
    closeButton.setAttribute('aria-label', t('Fechar detalhe ampliado', 'Cerrar detalle ampliado'));
    dialog.querySelector('.sec-viewer-label').textContent = t('A cédula · de perto', 'El billete · de cerca');
    imageStatus.textContent = t('Não foi possível carregar a imagem.', 'No se pudo cargar la imagen.');
    if (!selected) return;
    const copy = itemCopy(selected);
    dialog.querySelector('.sec-detail-index').textContent = `${selected.number} / ${selected.face === 'front' ? t('Tikal · Frente', 'Tikal · Anverso') : t('Quetzal · Verso', 'Quetzal · Reverso')}`;
    dialog.querySelector('.sec-detail-title').textContent = copy.name;
    dialog.querySelector('.sec-detail-description').textContent = copy.description;
    image.alt = `${copy.name}: ${t('detalhe ampliado da cédula original.', 'detalle ampliado del billete original.')}`;
    applyWidowProtection(dialog);
  }

  // Preserve the same body properties as the cinema, including iOS's fixed-body
  // scroll lock. Native modal focus isolation prevents competing open controls.
  function lockScroll() {
    scrollPosition = { x: window.scrollX, y: window.scrollY };
    savedBodyStyles = lockedProperties.map(name => ({ name, value: body.style.getPropertyValue(name), priority: body.style.getPropertyPriority(name) }));
    const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    Object.assign(body.style, {
      overflow: 'hidden', position: 'fixed', top: `${-scrollPosition.y}px`,
      left: `${-scrollPosition.x}px`, right: '0', width: '100%',
      paddingRight: `${padding + scrollbar}px`, boxSizing: 'border-box',
    });
  }

  function unlockScroll() {
    if (!savedBodyStyles) return;
    for (const { name, value, priority } of savedBodyStyles) {
      if (value) body.style.setProperty(name, value, priority);
      else body.style.removeProperty(name);
    }
    savedBodyStyles = null;
    const rootStyle = document.documentElement.style;
    const behavior = rootStyle.getPropertyValue('scroll-behavior');
    const priority = rootStyle.getPropertyPriority('scroll-behavior');
    rootStyle.setProperty('scroll-behavior', 'auto', 'important');
    window.scrollTo(scrollPosition.x, scrollPosition.y);
    if (behavior) rootStyle.setProperty('scroll-behavior', behavior, priority);
    else rootStyle.removeProperty('scroll-behavior');
  }

  function open(item, trigger) {
    if (dialog.open || !item.macro) return;
    selected = item;
    previousFocus = trigger || document.activeElement;
    image.hidden = false;
    imageStatus.hidden = true;
    image.src = item.macro;
    updateText();
    lockScroll();
    dialog.showModal();
    dialog.scrollTop = 0;
    document.dispatchEvent(new CustomEvent('security:open'));
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  const outsideDialog = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  closeButton.addEventListener('click', close);
  // A drag that starts over the image must not accidentally close the modal.
  dialog.addEventListener('pointerdown', event => { backdropPressed = event.target === dialog && outsideDialog(event); });
  dialog.addEventListener('click', event => {
    if (backdropPressed && event.target === dialog && outsideDialog(event)) close();
    backdropPressed = false;
  });
  dialog.addEventListener('close', () => {
    unlockScroll();
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('security:close'));
  });
  image.addEventListener('error', () => { image.hidden = true; imageStatus.hidden = false; });
  document.addEventListener('language:change', updateText);
  updateText();
  return { open, close };
}
