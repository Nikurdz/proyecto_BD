import express from 'express';
import { obtenerReporteVentas } from '../controllers/analyticsController.js';
import { verificarToken } from '../middlewares/authMiddleware.js'; // Asumiendo que el admin debe estar autenticado

const router = express.Router();

// Ruta protegida para el panel de administración
router.get('/ventas', verificarToken, obtenerReporteVentas);

export default router;
