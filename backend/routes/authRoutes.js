import express from 'express';
import { registrarUsuario, iniciarSesion, verificarCorreo, listarUsuarios, reenviarVerificacionPublico, reenviarVerificacionAdmin, cambiarRolUsuario } from '../controllers/authController.js';
import { obtenerTodosLosPedidosAdmin } from '../controllers/orderController.js';
import { verificarToken, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);
router.get('/verificar/:token', verificarCorreo);
router.post('/reenviar-verificacion', reenviarVerificacionPublico);

// Ruta protegida de prueba/perfil
router.get('/perfil', verificarToken, (req, res) => {
  res.json({ message: 'Acceso autorizado', usuario: req.usuario });
});

// Rutas de Administrador
router.get('/admin/usuarios', verificarToken, verificarAdmin, listarUsuarios);
router.get('/admin/pedidos', verificarToken, verificarAdmin, obtenerTodosLosPedidosAdmin);
router.post('/admin/usuarios/:id/reenviar-verificacion', verificarToken, verificarAdmin, reenviarVerificacionAdmin);
router.put('/admin/usuarios/:id/rol', verificarToken, verificarAdmin, cambiarRolUsuario);

export default router;
