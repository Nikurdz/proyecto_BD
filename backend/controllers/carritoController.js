import oracledb from 'oracledb';
import { getConnection, executeQuery } from '../db.js';

export async function agregarAlCarrito(req, res) {
  const { productoId, cantidad, bodegaId } = req.body;
  const usuarioCiRuc = req.usuario?.id;
  
  if (!usuarioCiRuc) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  let connection;
  try {
    connection = await getConnection();
    
    await connection.execute(
      `BEGIN SP_GESTIONAR_CARRITO(:ci, :prd, :cant, :bod); END;`,
      {
        ci: String(usuarioCiRuc),
        prd: String(productoId),
        cant: Number(cantidad || 1),
        bod: String(bodegaId || 'SUC1')
      }
    );

    res.status(200).json({ message: 'Producto agregado al carrito de BD exitosamente.' });

  } catch (error) {
    console.error('Error desde Thick Database (Carrito):', error);
    const oracleMessage = error.message.split('\n')[0]; 
    res.status(400).json({ error: 'Rechazado por la BD', detalle: oracleMessage });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
}

export async function obtenerCarrito(req, res) {
  const usuarioCiRuc = req.usuario?.id;
  
  if (!usuarioCiRuc) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  try {
    const sql = `
      SELECT C.PRD_CODIGO AS id, C.PCA_CANTIDAD AS cantidad, V.PRECIO AS precio, V.TITULO AS nombre, V.STOCK AS stock, V.IMAGEN_URL AS imagen_url
      FROM PROD_CARRITO C
      JOIN vw_productos_qyt V ON C.PRD_CODIGO = V.ID
      WHERE C.CRR_CED_RUC_CLI = :ci
    `;
    const result = await executeQuery(sql, { ci: String(usuarioCiRuc) });
    
    // Mapeo Explícito y Parseo de Números
    const carritoMapeado = result.rows.map(row => ({
      id: row.ID,
      nombre: row.NOMBRE || 'Producto sin nombre',
      precio: Number(row.PRECIO || 0),
      cantidad: Number(row.CANTIDAD || 0),
      stock: Number(row.STOCK || 0),
      imagen_url: row.IMAGEN_URL || ''
    }));
    
    res.status(200).json({ success: true, data: carritoMapeado });
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({ error: 'Error al obtener carrito', detalle: error.message });
  }
}

export async function eliminarDelCarrito(req, res) {
  const { productoId } = req.params;
  const usuarioCiRuc = req.usuario?.id;
  
  if (!usuarioCiRuc) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  let connection;
  try {
    connection = await getConnection();
    
    const sql = `
      DELETE FROM PROD_CARRITO 
      WHERE CRR_CED_RUC_CLI = :ci AND PRD_CODIGO = :prd
    `;
    await connection.execute(sql, { ci: String(usuarioCiRuc), prd: String(productoId) });
    await connection.commit();

    res.status(200).json({ success: true, message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar del carrito', detalle: error.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
}
