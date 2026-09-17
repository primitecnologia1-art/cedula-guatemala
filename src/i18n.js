const STORAGE_KEY = 'guatemala-language';
let language = 'pt';
try { language = localStorage.getItem(STORAGE_KEY) === 'es' ? 'es' : 'pt'; } catch { /* The language switch also works without storage. */ }

export const getLanguage = () => language;
export const t = (portuguese, spanish) => language === 'es' ? spanish : portuguese;

// Translate text nodes in place: animation targets, icons, links and listeners stay intact.
const copy = [
  ['.skip-link', ['Ir al contenido']],
  ['.header-film > span', ['Ver la película']],
  ['#hero-title > span:nth-child(1)', ['¿Cómo guardar']],
  ['#hero-title > span:nth-child(2)', ['LA GRANDEZA']],
  ['#hero-title > span:nth-child(3)', ['DE UN PAÍS?']],
  ['.hero-copy > p', ['Una historia atraviesa mundos.', 'Y encuentra una nueva forma.']],
  ['.portal-copy > span:nth-child(1)', ['UNA HISTORIA']],
  ['.portal-copy > span:nth-child(2)', ['ATRAVIESA']],
  ['.portal-copy > span:nth-child(3)', ['MUNDOS.']],
  ['.scroll-cue > span', ['Desliza para descubrir']],
  ['.hero-film small', ['UNA EXPERIENCIA DE CINE · 52 S']],
  ['.hero-film strong', ['Ver la película']],
  ['.origin-continuation .chapter-label', ['DE LAS RAÍCES A LA LUZ']],
  ['.origin-continuation h2', ['UNA HISTORIA', 'ATRAVIESA', 'MUNDOS.']],
  ['.journey-intro .chapter-label', ['01 — EL VIAJE']],
  ['#journey-title', ['Antes del papel,', 'un país entero.']],
  ['.journey-intro > p', ['Libertad. Resistencia. Memoria.', 'La identidad que inspira cada línea comienza mucho más allá de la superficie.']],
  ['#quetzal-title', ['LIBERTAD.']],
  ['.story-quetzal .story-copy p', ['La fuerza de ir más allá.', 'La identidad alza el vuelo.']],
  ['#tecun-title', ['RESISTENCIA.']],
  ['.story-tecun .story-copy p', ['En el valor de quienes resistieron,', 'la fuerza de un pueblo para continuar.']],
  ['#tikal-title', ['MEMORIA.']],
  ['.story-tikal .story-copy p', ['Una historia que sigue en pie.', 'Generación tras generación.']],
  ['.jaguar-copy .chapter-label', ['02 — LA TRANSFORMACIÓN']],
  ['#matter-title', ['UNA MIRADA.', 'OTRA MATERIA.']],
  ['.jaguar-copy > p', ['Todo esto nos inspira a dar', 'a la historia una nueva forma.']],
  ['.paper-copy .chapter-label', ['DE LA HISTORIA AL PAPEL']],
  ['.paper-copy h2', ['IDENTIDAD EN', 'SEGURIDAD.']],
  ['.security-section .section-heading .chapter-label', ['03 — LA PRECISIÓN']],
  ['#security-title', ['Cada detalle', 'tiene una razón.']],
  ['.security-section .section-heading > p', ['Acerca la mirada. Explora el papel, la impresión y los elementos de seguridad que dan forma a la identidad.']],
  ['#security-root > .module-loading', ['Preparando la exploración de los elementos de seguridad…']],
  ['.light-title-wrap .chapter-label', ['04 — LO INVISIBLE']],
  ['#light-title', ['NO TODO', 'ESTÁ A LA VISTA.']],
  ['.light-title-wrap > p', ['La misma superficie.', 'Otra capa de identidad.']],
  ['#uv-root > .module-loading', ['Preparando la inspección UV…']],
  ['.finale-copy .chapter-label', ['05 — LO QUE VIENE DESPUÉS']],
  ['#finale-title', ['PARA SEGUIR', 'ADELANTE.']],
  ['.finale-copy > p', ['En manos de quienes escribirán', 'lo que viene después.']],
  ['.finale-film > span:last-child', ['Descubre la historia completa', 'La película · 52 segundos']],
  ['.footer-row > p', ['Billete conceptual. Identidad, arte e impresión de seguridad.', 'Las escenas son interpretaciones artísticas del universo de la película. El billete presentado es ficticio, sin valor monetario.']],
];

const attributes = [
  ['.brand', 'aria-label', 'Guatemala, inicio'],
  ['.language-switcher', 'aria-label', 'Seleccionar idioma'],
  ['.back-top', 'aria-label', 'Volver al inicio'],
  ['.hero-image img', 'alt', 'Raíces y luz azul en el universo subterráneo de Xibalbá creado para la película'],
  ['.hero-daylight img', 'alt', 'La ceiba encuentra la luz sobre el bosque'],
  ['.origin-continuation img', 'alt', 'Las raíces de la ceiba se abren a la luz del bosque, en la continuación visual de Xibalbá'],
  ['.story-quetzal img', 'alt', 'Quetzal de larga cola entre el bosque y Tikal, en una escena del universo visual de la película'],
  ['.story-tecun img', 'alt', 'Interpretación artística de Tecún Umán desarrollada para la película'],
  ['.story-tikal img', 'alt', 'Tikal emerge sobre las copas del bosque a la luz del amanecer'],
  ['.jaguar-scene img', 'alt', 'Un jaguar entre las hojas y las sombras del bosque, en el universo visual de la película'],
  ['.matter-banknote', 'alt', 'Arte original del billete conceptual Guatemala, cara de Tikal, sin alteración de sus elementos'],
  ['.finale > picture img', 'alt', 'El sol ilumina Tikal y el bosque'],
  ['meta[name="description"]', 'content', '¿Cómo guardar la grandeza de un país? Una experiencia cinematográfica por la identidad, la luz y la impresión de seguridad del billete conceptual Guatemala.'],
];

function textNodes(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue.trim()) nodes.push(node);
  }
  return nodes;
}

const widowProtectedSelectors = [
  '#hero-title > span',
  '.hero-copy > p',
  '.portal-copy > span',
  '.origin-continuation h2',
  '.journey-intro h2',
  '.journey-intro > p',
  '.story-copy h3',
  '.story-copy p',
  '.jaguar-copy h2',
  '.jaguar-copy > p',
  '.paper-copy h2',
  '.section-heading h2',
  '.section-heading > p',
  '.sec-index-label',
  '.sec-caption-hint',
  '.sec-detail-title',
  '.sec-detail-description',
  '.light-title-wrap h2',
  '.light-title-wrap > p',
  '.uv-title',
  '.uv-intro',
  '.uv-instructions',
  '.uv-guide-label',
  '.uv-guide-description',
  '.finale-copy h2',
  '.finale-copy > p',
  '.footer-row p',
].join(',');

/** Keep the final two words together without changing the visible copy. */
export function applyWidowProtection(root = document) {
  root.querySelectorAll(widowProtectedSelectors).forEach(element => {
    const nodes = textNodes(element);
    nodes.forEach(node => {
      const value = node.nodeValue.replace(/\u00a0/g, ' ');
      node.nodeValue = value.replace(/(\S+)\s+(\S+)(\s*)$/, '$1\u00a0$2$3');
    });
    // Long final pairs may not fit a narrow detail column. Let CSS balance
    // those words instead of overflowing into the circular image.
    if (element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1) {
      nodes.forEach(node => { node.nodeValue = node.nodeValue.replace(/\u00a0/g, ' '); });
    }
  });
}

let initialized = false;

export function initLanguage() {
  if (initialized) return;
  initialized = true;
  const originalTitle = document.title;
  const entries = copy.flatMap(([selector, spanish]) => [...document.querySelectorAll(selector)].map(element => {
    const nodes = textNodes(element);
    return { nodes, portuguese: nodes.map(node => node.nodeValue), spanish };
  }));
  // Small new pieces of copy can declare their Spanish text without changing this module.
  document.querySelectorAll('[data-i18n-es]').forEach(element => {
    const nodes = textNodes(element);
    entries.push({ nodes, portuguese: nodes.map(node => node.nodeValue), spanish: element.dataset.i18nEs.split('|') });
  });
  const attributeEntries = attributes.flatMap(([selector, name, spanish]) => [...document.querySelectorAll(selector)].map(element => ({ element, name, spanish, portuguese: element.getAttribute(name) || '' })));
  const buttons = [...document.querySelectorAll('button[data-language]')];

  function apply(nextLanguage) {
    language = nextLanguage === 'es' ? 'es' : 'pt';
    document.documentElement.lang = language === 'es' ? 'es' : 'pt-BR';
    document.documentElement.dataset.language = language;
    document.title = t(originalTitle, 'Guatemala — Una historia atraviesa mundos');
    entries.forEach(({ nodes, portuguese, spanish }) => {
      const values = language === 'es' ? spanish : portuguese;
      nodes.forEach((node, index) => {
        // Joining surplus lines also supports a two-line title before a layout refresh.
        node.nodeValue = index === nodes.length - 1 && values.length > nodes.length ? values.slice(index).join(' ') : values[index] ?? '';
      });
    });
    attributeEntries.forEach(({ element, name, portuguese, spanish }) => element.setAttribute(name, t(portuguese, spanish)));
    buttons.forEach(button => {
      const active = button.dataset.language === language;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-label', button.dataset.language === 'pt' ? 'Português' : 'Español');
      button.title = button.dataset.language === 'pt' ? 'Português' : 'Español';
    });
    try { localStorage.setItem(STORAGE_KEY, language); } catch { /* Keep the current session preference available. */ }
    document.dispatchEvent(new CustomEvent('language:change', { detail: { language } }));
  }

  buttons.forEach(button => button.addEventListener('click', () => apply(button.dataset.language)));
  apply(language);
}
