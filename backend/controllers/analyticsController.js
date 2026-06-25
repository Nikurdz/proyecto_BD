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

export async function sincronizarDW(req, res) {
  try {
    // 1. Cargar Dimensión Tiempo
    await executeQuery(`
        INSERT INTO DIM_TIEMPO@LINK_DW_GYQ (FECHA, DIA, MES, ANIO, DIA_SEMANA, TEMPORADA)
        SELECT DISTINCT 
            FAC_FECHA,
            EXTRACT(DAY FROM FAC_FECHA),
            EXTRACT(MONTH FROM FAC_FECHA),
            EXTRACT(YEAR FROM FAC_FECHA),
            TO_CHAR(FAC_FECHA, 'Day', 'NLS_DATE_LANGUAGE = SPANISH'),
            CASE 
                WHEN EXTRACT(MONTH FROM FAC_FECHA) = 12 THEN 'Navidad y Fin de Año'
                WHEN EXTRACT(MONTH FROM FAC_FECHA) IN (6, 7, 8) THEN 'Vacaciones de Verano'
                WHEN EXTRACT(MONTH FROM FAC_FECHA) = 5 THEN 'Temporada Día de la Madre'
                ELSE 'Regular' 
            END AS TEMPORADA
        FROM FACTURA
        WHERE FAC_FECHA NOT IN (SELECT FECHA FROM DIM_TIEMPO@LINK_DW_GYQ)
    `, [], { autoCommit: true });

    // 2. Cargar Dimensión Cliente
    await executeQuery(`
        INSERT INTO DIM_CLIENTE@LINK_DW_GYQ (CLI_ID, CLI_NOMBRE, CLI_DIRECCION, CLI_TELEFONO, CLI_CORREO)
        SELECT CLI_CI_RUC, CLI_NOMBRE, CLI_DIRECCION, CLI_TELEFONO, CLI_CORREO
        FROM CLIENTE
        WHERE CLI_CI_RUC NOT IN (SELECT CLI_ID FROM DIM_CLIENTE@LINK_DW_GYQ)
    `, [], { autoCommit: true });

    // 3. Cargar Dimensión Producto
    await executeQuery(`
        INSERT INTO DIM_PRODUCTO@LINK_DW_GYQ (PRD_ID, PRD_NOMBRE, PRD_PRECIO, CAT_NOMBRE)
        SELECT 
            p.PRD_CODIGO, 
            p.PRD_NOMBRE, 
            p.PRD_PRECIO, 
            NVL(c.NOMBRE, NVL(p.PRD_CATEGORIA, 'SIN CATEGORIA')) AS CAT_NOMBRE
        FROM PRODUCTO p
        LEFT JOIN CATEGORIA c ON p.CAT_CODIGO = c.CAT_CODIGO
        WHERE p.PRD_CODIGO NOT IN (SELECT PRD_ID FROM DIM_PRODUCTO@LINK_DW_GYQ)
    `, [], { autoCommit: true });

    // 4. Cargar Hechos Ventas
    await executeQuery(`
        INSERT INTO HECHOS_VENTAS@LINK_DW_GYQ (CLI_ID, PRD_ID, FECHA, FACTURA_NUMERO, CANTIDAD_VENDIDA, PRECIO_UNITARIO, MONTO_TOTAL_LINEA)
        SELECT 
            f.CLI_CI_RUC,
            df.PRD_CODIGO,
            f.FAC_FECHA,
            f.FAC_NUMERO,
            df.DFA_CANTIDAD,
            df.DFA_PRECIO_UNI,
            (df.DFA_CANTIDAD * df.DFA_PRECIO_UNI) AS MONTO_TOTAL_LINEA
        FROM FACTURA f
        JOIN DETALLE_FACTURA df ON f.FAC_NUMERO = df.FAC_NUMERO
        WHERE NOT EXISTS (
            SELECT 1 FROM HECHOS_VENTAS@LINK_DW_GYQ h 
            WHERE h.FACTURA_NUMERO = f.FAC_NUMERO AND h.PRD_ID = df.PRD_CODIGO
        )
    `, [], { autoCommit: true });

    return res.status(200).json({ success: true, message: 'Data Warehouse sincronizado correctamente.' });
  } catch (error) {
    console.error('Error al sincronizar DW:', error);
    return res.status(500).json({ success: false, error: 'Error al sincronizar con el Data Warehouse.' });
  }
}
