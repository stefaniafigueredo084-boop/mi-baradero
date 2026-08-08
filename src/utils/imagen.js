// Redimensiona y comprime una imagen en el navegador, devolviendo un
// data URL (base64) listo para guardar directo en un documento de Firestore.
export function comprimirImagen(archivo, { maxAncho = 900, calidad = 0.72 } = {}) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onerror = () => reject(new Error('No se pudo leer el archivo'))
    lector.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Archivo de imagen inválido'))
      img.onload = () => {
        const escala = Math.min(1, maxAncho / img.width)
        const ancho = Math.round(img.width * escala)
        const alto = Math.round(img.height * escala)
        const canvas = document.createElement('canvas')
        canvas.width = ancho
        canvas.height = alto
        canvas.getContext('2d').drawImage(img, 0, 0, ancho, alto)
        resolve(canvas.toDataURL('image/jpeg', calidad))
      }
      img.src = lector.result
    }
    lector.readAsDataURL(archivo)
  })
}
