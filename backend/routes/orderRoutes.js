import express from 'express';
import { crearPedido, obtenerPedidos, obtenerTodosLosPedidosAdmin, actualizarEstadoPedido } from '../controllers/orderController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// El checkout y el historial requieren que el usuario esté autenticado
router.post('/checkout', verificarToken, crearPedido);
router.get('/', verificarToken, obtenerPedidos);

// Rutas de administración
// Asumiendo que obtenerTodosLosPedidosAdmin está registrada aquí o en adminRoutes.js
// Si está en adminRoutes.js lo dejamos, pero si queremos protegerlo con admin:
import { verificarAdmin } from '../middlewares/authMiddleware.js';
router.get('/admin', verificarToken, verificarAdmin, obtenerTodosLosPedidosAdmin);
router.put('/admin/:id/estado', verificarToken, verificarAdmin, actualizarEstadoPedido);

export default router;
