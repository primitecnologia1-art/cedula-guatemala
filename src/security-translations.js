import { t } from './i18n.js';

// The technical copy retains the supplied feature claims.
const spanish = {
  'fundo-seguranca': ['Fondo de seguridad', 'Líneas, microimágenes y patrones geométricos componen el fondo de seguridad impreso en offset.'],
  'modulacao-linha': ['Modulación del ancho de línea', 'La variación del ancho de las líneas construye la imagen de la ceiba y sus detalles.'],
  'tinta-iridescente-uv': ['Tinta iridiscente reactiva a la luz UV', 'Los elementos geométricos de la franja lateral llevan tinta iridiscente que reacciona a la luz ultravioleta.'],
  'micro-numero-laser': ['Micronumeración grabada con láser', 'Una numeración a pequeña escala está grabada con láser entre las líneas de la hoja, en el lado derecho del billete.'],
  'uv-multitonal': ['Impresión UV multitonal', 'Bajo luz ultravioleta, la impresión revela distintos matices de color en registro con las imágenes visibles, incluido el quetzal.'],
  'marca-agua': ['Marca de agua multitonal', 'Múltiples tonos y gradaciones, del claro al oscuro, definen la marca de agua del jaguar.'],
  iris: ['Impresión en iris de máquina', 'Una transición continua entre colores recorre el fondo de líneas, impresa con una única matriz, sin tramas ni puntos.'],
  'numero-laser': ['Numeración grabada con láser', 'La numeración grabada con láser utiliza caracteres de alturas alternadas, como se aprecia en el detalle.'],
  intaglio: ['Calcografía / Intaglio', 'La impresión calcográfica combina riqueza de detalles, complejidad gráfica y un relieve perceptible al tacto en la pieza física.'],
  'serigrafia-iridescente': ['Serigrafía iridiscente reactiva a la luz UV', 'La serigrafía iridiscente del motivo circular reacciona a la luz ultravioleta. La capa de tinta también produce un relieve perceptible al tacto en la pieza física.'],
  'numero-perfurado': ['Numeración perforada con láser', 'La numeración también aparece en microperforaciones láser, sobre la palabra GUATEMALA.'],
  substrato: ['El papel también protege', 'Desarrollado por Blendpaper con fibras de algodón procedentes del reciclaje controlado de residuos de papel moneda. La tecnología UltraLife Fusion™ combina cohesión interna de las fibras y protección externa, conservando el tacto del papel de algodón.'],
};

export function itemCopy(item) {
  const translated = spanish[item.id];
  return { name: t(item.name, translated?.[0] || item.name), description: t(item.description, translated?.[1] || item.description) };
}

export const guidedLights = [
  { name: ['Quetzal', 'Quetzal'], x: 18, y: 25, macro: 'folder-uv-quetzal.png', text: ['A impressão UV acompanha o quetzal em registro com a imagem visível.', 'La impresión UV acompaña al quetzal en registro con la imagen visible.'] },
  { name: ['Ceiba', 'Ceiba'], x: 51, y: 34, macro: 'folder-uv-ceiba.png', text: ['O detalhe revela diferentes nuances de cor na impressão UV da ceiba.', 'El detalle revela distintos matices de color en la impresión UV de la ceiba.'] },
  { name: ['Grafismos', 'Grafismos'], x: 68, y: 47, macro: 'folder-uv-geometrias.png', text: ['Os elementos geométricos da faixa lateral aparecem na impressão UV.', 'Los elementos geométricos de la franja lateral aparecen en la impresión UV.'] },
];
