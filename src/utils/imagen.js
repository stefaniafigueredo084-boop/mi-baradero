// Tope del data URL resultante (en caracteres). Las fotos se guardan
// adentro del documento de Firestore, que no puede pasar de 1 MB en
// total, y las Reglas rechazan una foto de reclamo de más de 700.000
// caracteres — este tope deja margen para el resto de los campos.
export const MAX_CARACTERES_IMAGEN = 650000

// Redimensiona y comprime una imagen en el navegador, devolviendo un
// data URL (base64) listo para guardar directo en un documento de Firestore.
// Limita ancho Y alto (una foto vertical de celular también entra) y, si
// aun así queda muy pesada, baja la calidad de a poco hasta que entre.
export function comprimirImagen(archivo, { maxAncho = 900, maxAlto = 900, calidad = 0.72 } = {}) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onerror = () => reject(new Error('No se pudo leer el archivo'))
    lector.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Archivo de imagen inválido'))
      img.onload = () => {
        const escala = Math.min(1, maxAncho / img.width, maxAlto / img.height)
        const ancho = Math.round(img.width * escala)
        const alto = Math.round(img.height * escala)
        const canvas = document.createElement('canvas')
        canvas.width = ancho
        canvas.height = alto
        canvas.getContext('2d').drawImage(img, 0, 0, ancho, alto)

        let q = calidad
        let resultado = canvas.toDataURL('image/jpeg', q)
        while (resultado.length > MAX_CARACTERES_IMAGEN && q > 0.3) {
          q -= 0.1
          resultado = canvas.toDataURL('image/jpeg', q)
        }
        if (resultado.length > MAX_CARACTERES_IMAGEN) {
          reject(new Error('La foto es demasiado pesada. Probá con otra.'))
          return
        }
        resolve(resultado)
      }
      img.src = lector.result
    }
    lector.readAsDataURL(archivo)
  })
}
