import express from 'express';
import { obtenerReporteVentas, sincronizarDW } from '../controllers/analyticsController.js';
import { verificarToken, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas protegidas
router.get('/ventas', verificarToken, obtenerReporteVentas);
router.post('/sync', verificarToken, verificarAdmin, sincronizarDW);

export default router;
