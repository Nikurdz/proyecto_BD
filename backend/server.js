import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, executeQuery, isDbConnected } from './db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import carritoRoutes from './routes/carritoRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { obtenerPedidos } from './controllers/orderController.js';
import { verificarToken } from './middlewares/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ override: true });
const app = express();
const PORT = process.env.PORT || 5000;

// Configuración explícita de CORS para permitir al frontend de Vite acceder a la API desde otros dispositivos
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Estricto para Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Servir archivos estáticos de imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware Catcher de Base de Datos: Bloquea si Oracle está caído
app.use((req, res, next) => {
  if (!isDbConnected() && req.path.startsWith('/api')) {
    return res.status(503).json({ error: "Base de datos temporalmente desconectada. Reintentando..." });
  }
  next();
});

// Ruta de prueba para verificar conectividad con la máquina virtual Oracle en 192.168.56.81
app.get('/api/test-db', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Consulta SQL de Oracle con paginación estricta
    const query = `
      SELECT * FROM PRODUCTO 
      ORDER BY 1 
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;
    
    // Pasamos los parámetros de paginación
    const result = await executeQuery(query, { offset, limit });
    
    return res.json({
      success: true,
      message: 'Conexión a Oracle DB exitosa en 192.168.56.81',
      rowsCount: result.rows ? result.rows.length : 0,
      data: result.rows,
      page,
      limit
    });
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      details: err
    });
  }
});

// Rutas de autenticación, productos y uploads
app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/pedidos', orderRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin/reportes', analyticsRoutes);
app.get('/api/mis-pedidos', verificarToken, obtenerPedidos);

// Inicializar base de datos y arrancar servidor
async function startServer() {
  try {
    await initializeDatabase();
    
    if (!isDbConnected()) {
      console.error('⚠️ Servidor corriendo, pero sin conexión a BD.');
    }

    app.listen(PORT, () => {
      console.log(`Servidor de desarrollo corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error inesperado al arrancar el servidor:', err);
  }
}

startServer();
