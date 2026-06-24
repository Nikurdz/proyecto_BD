import express from 'express';
import { 
  obtenerProductos, 
  crearProducto, 
  actualizarProducto, 
  eliminarProducto,
  obtenerCategorias,
  crearCategoria,
  obtenerFavoritos,
  agregarFavorito,
  eliminarFavorito 
} from '../controllers/productController.js';
import { verificarToken, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta pública para ver catálogo
router.get('/', obtenerProductos);

// Rutas públicas de categorías
router.get('/categorias', obtenerCategorias);

// Rutas protegidas de favoritos
router.get('/favoritos', verificarToken, obtenerFavoritos);
router.post('/favoritos/:id', verificarToken, agregarFavorito);
router.delete('/favoritos/:id', verificarToken, eliminarFavorito);

// Rutas de administración protegidas
router.post('/', verificarToken, verificarAdmin, crearProducto);
router.post('/categorias', verificarToken, verificarAdmin, crearCategoria);
router.put('/:id', verificarToken, verificarAdmin, actualizarProducto);
router.delete('/:id', verificarToken, verificarAdmin, eliminarProducto);

export default router;
