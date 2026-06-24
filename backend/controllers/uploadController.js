import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio donde se guardarán las imágenes convertidas a WEBP
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Asegurarse de que el directorio exista
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configuración de multer: almacenamiento en memoria para procesar con sharp
const storage = multer.memoryStorage();

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/webp',
    'image/svg+xml',
    'image/avif'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, GIF, BMP, TIFF, WEBP, AVIF).'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Máximo 10MB
  }
});

/**
 * Controlador para subir una imagen, convertirla a WEBP y devolver la URL pública.
 */
export async function subirImagen(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo de imagen.'
      });
    }

    // Generar un nombre único para el archivo
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const filename = `producto_${timestamp}_${uniqueId}.webp`;
    const outputPath = path.join(UPLOADS_DIR, filename);

    // Convertir la imagen a formato WEBP con sharp
    await sharp(req.file.buffer)
      .webp({ quality: 85 }) // Calidad 85% — buen balance entre tamaño y calidad
      .resize({
        width: 800,
        height: 800,
        fit: 'inside',           // Mantener proporción, no recortar
        withoutEnlargement: true // No agrandar imágenes pequeñas
      })
      .toFile(outputPath);

    // Construir la URL pública para acceder a la imagen usando req.hostname
    const publicUrl = `http://${req.hostname}:5000/uploads/${filename}`;

    return res.status(200).json({
      success: true,
      message: 'Imagen subida y convertida a WEBP exitosamente.',
      url: publicUrl,
      filename
    });

  } catch (err) {
    console.error('Error al procesar la imagen:', err);

    // Manejar error específico de multer
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: 'El archivo excede el tamaño máximo permitido de 10MB.'
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Error al procesar la imagen.',
      details: err.message
    });
  }
}
