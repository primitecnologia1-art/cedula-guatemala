import './film.css';
import { t } from './i18n.js';

const FILM_URL = '/assets/v2/cedula-final.mp4';
const FILM_STATUS = {
  preparing: ['Preparando o filme…', 'Preparando la película…'],
  loading: ['Carregando o filme…', 'Cargando la película…'],
  buffering: ['Carregando…', 'Cargando…'],
  connection: ['Aguardando a conexão…', 'Esperando la conexión…'],
  play: ['Toque em reproduzir para começar.', 'Pulsa reproducir para empezar.'],
  error: ['O filme não pôde ser carregado. Você pode baixar o arquivo abaixo.', 'No se pudo cargar la película. Puedes descargar el archivo a continuación.'],
  fullscreenRetry: ['Inicie a reprodução e tente abrir a tela cheia novamente.', 'Inicia la reproducción y vuelve a intentar abrir la pantalla completa.'],
};
let activeFilm;

/** Mount once; every .film-open button can open the same native cinema dialog. */
export function initFilm() {
  if (activeFilm) return activeFilm;

  const dialog = document.createElement('dialog');
  dialog.className = 'film-dialog';
  dialog.setAttribute('aria-labelledby', 'film-dialog-title');
  dialog.innerHTML = `
    <div class="film-shell">
      <header class="film-header">
        <h2 class="film-title" id="film-dialog-title">Guatemala <span>/ O filme</span></h2>
        <div class="film-actions">
          <button class="film-fullscreen film-button" type="button" aria-label="Assistir ao filme em tela cheia">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/></svg>
            <span>Tela cheia</span>
          </button>
          <button class="film-close film-button" type="button" aria-label="Fechar filme e voltar à experiência" autofocus>
            <span>Fechar</span>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>
          </button>
        </div>
      </header>
      <div class="film-stage">
        <video class="film-video" width="1920" height="1080" controls controlslist="nofullscreen" playsinline preload="none" poster="/assets/v2/finale-wide.webp" aria-label="Filme Guatemala" tabindex="0">
          <source src="${FILM_URL}" type="video/mp4">
          <span class="film-unsupported">Seu navegador não consegue reproduzir este filme.</span>
        </video>
      </div>
      <footer class="film-footer">
        <p class="film-caption">Como guardar a grandeza de um país?</p>
        <p class="film-status" role="status" aria-live="polite" aria-atomic="true"></p>
        <a class="film-download" href="${FILM_URL}" download="Guatemala-filme.mp4" hidden><span class="film-download-label">Baixar o filme</span> <span aria-hidden="true">↗</span></a>
      </footer>
    </div>
  `;
  document.body.append(dialog);

  const video = dialog.querySelector('video');
  const shell = dialog.querySelector('.film-shell');
  const stage = dialog.querySelector('.film-stage');
  const closeButton = dialog.querySelector('.film-close');
  const fullscreenButton = dialog.querySelector('.film-fullscreen');
  const status = dialog.querySelector('.film-status');
  const download = dialog.querySelector('.film-download');
  const body = document.body;
  const lockedProperties = ['overflow', 'position', 'top', 'left', 'right', 'width', 'padding-right', 'box-sizing'];
  let previousFocus;
  let scrollPosition;
  let savedBodyStyles;
  let openSession = 0;
  let failed = false;
  let statusKey = '';
  let fittingFrame = 0;

  function setStatus(key, loading = false) {
    statusKey = key;
    status.textContent = key ? t(...FILM_STATUS[key]) : '';
    status.classList.toggle('film-status-loading', loading);
  }

  function updateTexts() {
    const fullscreen = document.fullscreenElement === shell;
    dialog.querySelector('.film-title span').textContent = t('/ O filme', '/ La película');
    closeButton.querySelector('span').textContent = t('Fechar', 'Cerrar');
    closeButton.setAttribute('aria-label', t('Fechar filme e voltar à experiência', 'Cerrar la película y volver a la experiencia'));
    fullscreenButton.querySelector('span').textContent = fullscreen ? t('Sair da tela cheia', 'Salir de pantalla completa') : t('Tela cheia', 'Pantalla completa');
    fullscreenButton.setAttribute('aria-label', fullscreen ? t('Sair da tela cheia', 'Salir de pantalla completa') : t('Assistir ao filme em tela cheia', 'Ver la película en pantalla completa'));
    fullscreenButton.setAttribute('aria-pressed', String(fullscreen));
    video.setAttribute('aria-label', t('Filme Guatemala', 'Película Guatemala'));
    dialog.querySelector('.film-unsupported').textContent = t('Seu navegador não consegue reproduzir este filme.', 'Tu navegador no puede reproducir esta película.');
    dialog.querySelector('.film-caption').textContent = t('Como guardar a grandeza de um país?', '¿Cómo guardar la grandeza de un país?');
    dialog.querySelector('.film-download-label').textContent = t('Baixar o filme', 'Descargar la película');
    status.textContent = statusKey ? t(...FILM_STATUS[statusKey]) : '';
    scheduleFit();
  }

  // Fit the actual 16:9 image inside both stage bounds. Native controls occupy
  // their own black strip below the picture, keeping the burned-in captions clear.
  function fitFilm() {
    fittingFrame = 0;
    if (!dialog.open || document.fullscreenElement === video) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    const ratio = video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 16 / 9;
    const controlsSpace = Math.min(64, height * .25);
    const pictureWidth = Math.max(1, Math.min(width, (height - controlsSpace) * ratio));
    video.style.setProperty('--film-width', `${pictureWidth}px`);
    video.style.setProperty('--film-height', `${pictureWidth / ratio + controlsSpace}px`);
  }

  function scheduleFit() {
    if (!fittingFrame) fittingFrame = requestAnimationFrame(fitFilm);
  }

  const stageObserver = new ResizeObserver(scheduleFit);
  stageObserver.observe(stage);
  video.addEventListener('loadedmetadata', scheduleFit);
  document.addEventListener('language:change', updateTexts);
  updateTexts();

  function lockScroll() {
    scrollPosition = { x: window.scrollX, y: window.scrollY };
    savedBodyStyles = lockedProperties.map((name) => ({
      name,
      value: body.style.getPropertyValue(name),
      priority: body.style.getPropertyPriority(name),
    }));
    const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    Object.assign(body.style, {
      overflow: 'hidden',
      position: 'fixed',
      top: `${-scrollPosition.y}px`,
      left: `${-scrollPosition.x}px`,
      right: '0',
      width: '100%',
      paddingRight: `${padding + scrollbar}px`,
      boxSizing: 'border-box',
    });
  }

  function unlockScroll() {
    if (!savedBodyStyles) return;
    for (const { name, value, priority } of savedBodyStyles) {
      if (value) body.style.setProperty(name, value, priority);
      else body.style.removeProperty(name);
    }
    savedBodyStyles = null;
    // An authored smooth-scroll rule must not animate the return from the cinema.
    const rootStyle = document.documentElement.style;
    const behavior = rootStyle.getPropertyValue('scroll-behavior');
    const priority = rootStyle.getPropertyPriority('scroll-behavior');
    rootStyle.setProperty('scroll-behavior', 'auto', 'important');
    window.scrollTo(scrollPosition.x, scrollPosition.y);
    if (behavior) rootStyle.setProperty('scroll-behavior', behavior, priority);
    else rootStyle.removeProperty('scroll-behavior');
  }

  function open(trigger = document.activeElement) {
    if (dialog.open) return;
    previousFocus = trigger;
    failed = false;
    download.hidden = true;
    setStatus('preparing', true);
    const session = ++openSession;
    lockScroll();
    dialog.showModal();
    fitFilm();
    document.dispatchEvent(new CustomEvent('film:open'));
    // Keep play inside the original user gesture for Safari and mobile browsers.
    if (video.error) video.load();
    try { video.currentTime = 0; } catch { /* A newly opened source begins at zero. */ }
    video.play()?.catch(() => {
      if (!dialog.open || session !== openSession || failed) return;
      setStatus('play');
    });
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  function restoreFocusAfterFullscreen() {
    if (dialog.open || document.fullscreenElement) return;
    requestAnimationFrame(() => {
      if (!dialog.open && previousFocus?.isConnected && (document.activeElement === document.body || dialog.contains(document.activeElement))) {
        previousFocus.focus({ preventScroll: true });
      }
    });
  }

  function onTrigger(event) {
    const trigger = event.target instanceof Element ? event.target.closest('.film-open') : null;
    if (!trigger || trigger.hasAttribute('disabled')) return;
    event.preventDefault();
    open(trigger);
  }

  function onMediaError() {
    if (!dialog.open) return;
    failed = true;
    setStatus('error');
    download.hidden = false;
  }

  document.addEventListener('click', onTrigger);
  document.addEventListener('fullscreenchange', restoreFocusAfterFullscreen);
  document.addEventListener('fullscreenchange', updateTexts);
  video.addEventListener('webkitendfullscreen', restoreFocusAfterFullscreen);
  closeButton.addEventListener('click', close);
  dialog.addEventListener('close', () => {
    ++openSession;
    video.pause();
    if (document.fullscreenElement && dialog.contains(document.fullscreenElement)) {
      document.exitFullscreen?.().catch(() => {});
    }
    if (video.webkitDisplayingFullscreen) video.webkitExitFullscreen?.();
    setStatus('');
    unlockScroll();
    if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
      previousFocus.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        if (!dialog.open && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      });
    }
    document.dispatchEvent(new CustomEvent('film:close'));
  });

  // showModal supplies the focus trap, including the browser's own media controls.
  // Escape uses the dialog's native cancel/close behavior.
  if (!shell.requestFullscreen && !video.webkitEnterFullscreen) fullscreenButton.hidden = true;
  fullscreenButton.addEventListener('click', () => {
    try {
      if (document.fullscreenElement === shell) {
        document.exitFullscreen().catch(() => setStatus('fullscreenRetry'));
      } else if (shell.requestFullscreen) {
        shell.requestFullscreen().catch(() => setStatus('fullscreenRetry'));
      } else {
        video.webkitEnterFullscreen();
      }
    } catch {
      setStatus('fullscreenRetry');
    }
  });

  video.addEventListener('loadstart', () => {
    if (dialog.open && !failed) setStatus('loading', true);
  });
  video.addEventListener('waiting', () => {
    if (dialog.open && !failed) setStatus('buffering', true);
  });
  video.addEventListener('stalled', () => {
    if (dialog.open && !video.paused && !failed) setStatus('connection', true);
  });
  video.addEventListener('playing', () => {
    failed = false;
    download.hidden = true;
    setStatus('');
  });
  video.addEventListener('canplay', () => {
    if (!failed) setStatus('');
  });
  video.addEventListener('pause', () => {
    if (!failed) setStatus('');
  });
  video.addEventListener('error', onMediaError);
  video.querySelector('source').addEventListener('error', onMediaError);

  activeFilm = {
    open,
    close,
    dialog,
    video,
    destroy() {
      close();
      // A close event is queued by the browser; also release synchronously on teardown.
      video.pause();
      unlockScroll();
      document.removeEventListener('click', onTrigger);
      document.removeEventListener('fullscreenchange', restoreFocusAfterFullscreen);
      document.removeEventListener('fullscreenchange', updateTexts);
      document.removeEventListener('language:change', updateTexts);
      video.removeEventListener('webkitendfullscreen', restoreFocusAfterFullscreen);
      video.removeEventListener('loadedmetadata', scheduleFit);
      stageObserver.disconnect();
      cancelAnimationFrame(fittingFrame);
      dialog.remove();
      activeFilm = null;
    },
  };
  return activeFilm;
}
