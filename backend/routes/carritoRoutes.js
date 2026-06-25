import express from 'express';
import { agregarAlCarrito, obtenerCarrito, eliminarDelCarrito } from '../controllers/carritoController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verificarToken, obtenerCarrito);
router.post('/', verificarToken, agregarAlCarrito);
router.delete('/:productoId', verificarToken, eliminarDelCarrito);

export default router;
