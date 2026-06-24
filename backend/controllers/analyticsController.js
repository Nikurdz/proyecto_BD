import oracledb from 'oracledb';
import { executeQuery } from '../db.js';

/**
 * Módulo de Estadísticas y Reportes (OLAP - Data Warehouse)
 * 
 * REGLA ESTRICTA DE SOLO LECTURA:
 * Todas las operaciones en este controlador utilizan el esquema dw_admin
 * y están estrictamente limitadas a sentencias SELECT. No se realizarán
 * operaciones DML (INSERT, UPDATE, DELETE) sobre estas tablas.
 */

export async function obtenerReporteVentas(req, res) {
  try {
    const { periodo } = req.query; // 'historico' o 'anio_actual'
    
    let sqlVentasPorMes = '';
    let sqlTopProductos = '';

    // Cero SQL Complejo: Delegamos toda la lógica a las vistas precalculadas de Oracle
    if (periodo === 'anio_actual') {
      sqlVentasPorMes = `SELECT * FROM vw_ventas_mes_anio_actual_gyq`;
      sqlTopProductos = `SELECT * FROM vw_top_productos_anio_gyq`;
    } else {
      sqlVentasPorMes = `SELECT * FROM vw_ventas_mes_historico_gyq`;
      sqlTopProductos = `SELECT * FROM vw_top_productos_historico_gyq`;
    }

    // Ejecutar consultas OLAP
    const [resultVentasMes, resultTopProductos] = await Promise.all([
      executeQuery(sqlVentasPorMes, {}),
      executeQuery(sqlTopProductos, {})
    ]);

    // Mapeo amigable para el frontend
    const resumenVentas = resultVentasMes.rows.map(row => ({
      anio: row.ANIO,
      mes: row.MES,
      totalIngresos: Number(row.TOTAL_INGRESOS),
      totalProductos: Number(row.TOTAL_PRODUCTOS_VENDIDOS)
    }));

    const topProductos = resultTopProductos.rows.map(row => ({
      nombre: row.PRD_NOMBRE,
      cantidadVendida: Number(row.CANTIDAD_VENDIDA),
      ingresosTotales: Number(row.INGRESOS_TOTALES)
    }));

    return res.status(200).json({
      success: true,
      data: {
        ventasPorMes: resumenVentas,
        topProductos: topProductos
      }
    });

  } catch (error) {
    console.error('Error al obtener el reporte analítico del DW:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al consultar el Data Warehouse.'
    });
  }
}
