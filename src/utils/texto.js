// Saca emojis de un texto. El sitio ya no usa emojis (se reemplazaron
// por íconos), pero puede quedar alguno en datos viejos guardados en
// Firestore — por ejemplo un aviso enviado antes del cambio.
// (El selector de variante U+FE0F y el unidor U+200D van aparte de la
// clase: dentro de [] se combinan con el carácter anterior.)
const EMOJIS = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}]|\u{FE0F}|\u{200D}/gu

export function sinEmojis(texto) {
  return String(texto ?? '').replace(EMOJIS, '').replace(/\s{2,}/g, ' ').trim()
}
