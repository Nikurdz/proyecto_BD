import express from 'express';
import { upload, subirImagen } from '../controllers/uploadController.js';
import { verificarToken, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta protegida para subir imágenes de productos (solo admins)
router.post('/', verificarToken, verificarAdmin, upload.single('imagen'), subirImagen);

export default router;
