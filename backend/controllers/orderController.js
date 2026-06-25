import oracledb from 'oracledb';
import nodemailer from 'nodemailer';
import { getConnection, executeQuery } from '../db.js';

export async function crearPedido(req, res) {
  const usuarioCiRuc = req.usuario.id; // Del JWT
  const sucursalWeb = 'WEB';
  const empleadoBot = 'SISTEMA';
  const bodegaInventario = 'SUC1'; 
  
  let connection;
  try {
    connection = await getConnection();

    // Node.js no sabe NADA de los productos que se van a comprar.
    // Simplemente dispara el evento al motor PL/SQL.
    const result = await connection.execute(
      `BEGIN SP_PROCESAR_CHECKOUT(:ci, :suc, :emp, :bod, :out_total); END;`,
      {
        ci: String(usuarioCiRuc),
        suc: sucursalWeb,
        emp: empleadoBot,
        bod: bodegaInventario,
        out_total: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const totalCalculado = result.outBinds.out_total;

    // Enviar respuesta exitosa inmediatamente, sin procesar SELECTs ni totales en Node
    return res.status(200).json({ 
      success: true,
      message: '¡Checkout atómico exitoso!', 
      total_facturado: totalCalculado 
    });

  } catch (error) {
    // Si Oracle se queja de que falta stock, de que el carrito está vacío, etc.
    // cae aquí automáticamente gracias al RAISE_APPLICATION_ERROR.
    console.error('Error desde Thick Database (Checkout):', error);
    
    // Extraemos el mensaje limpio de Oracle (ORA-20001, ORA-20002, etc.)
    let oracleMessage = error.message.split('\n')[0]; 
    
    // Manejar el caso de que el usuario tenga una cédula inválida heredada
    if (oracleMessage.includes('ORA-20001') && oracleMessage.includes('cédula')) {
      oracleMessage = 'Tu cuenta fue registrada con una cédula inválida. Por favor, crea una cuenta nueva para poder facturar.';
    }
    
    return res.status(400).json({ 
      success: false,
      error: 'Transacción Abortada', 
      detalle: oracleMessage 
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
}

export async function obtenerPedidos(req, res) {
  const usuarioId = req.usuario?.id; // CLI_CED_RUC

  if (!usuarioId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Sesión inválida o expirada. Por favor, cierra sesión e inicia sesión nuevamente.' 
    });
  }

  try {
    // Consulta usando la nueva vista, filtrando por el email del token (que coincide con URA_USUARIO)
    const sql = `
      SELECT FAC_NUMERO, FAC_FECHA, FAC_ESTADO, 
             PRD_CODIGO, DFA_CANTIDAD, DFA_PRECIO_UNI,
             PRD_NOMBRE
      FROM vw_historial_mis_pedidos
      WHERE IDENTIFICADOR_SESION = :id_del_token
      ORDER BY FAC_FECHA DESC, FAC_NUMERO DESC
    `;

    // Usamos req.usuario.id as IDENTIFICADOR_SESION assuming URA_USUARIO stores the email
    const result = await executeQuery(sql, { id_del_token: String(req.usuario.id) });

    if (!result.rows || result.rows.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Agrupar filas por FAC_NUMERO
    const facturasMap = {};

    result.rows.forEach(row => {
      const fId = row.FAC_NUMERO;
        if (!facturasMap[fId]) {
          facturasMap[fId] = {
            id: fId,
            fecha: row.FAC_FECHA,
            estado: row.FAC_ESTADO === 'V' ? 'COMPLETADO' : 'ANULADO',
            total: 0,
            items: []
          };
        }
  
        // Si tiene detalle, lo agregamos y sumamos al total
        if (row.PRD_CODIGO) {
          const cantidad = Number(row.DFA_CANTIDAD || 0);
          const precio = Number(row.DFA_PRECIO_UNI || 0);
          facturasMap[fId].total += (cantidad * precio);
          
          facturasMap[fId].items.push({
            productoId: row.PRD_CODIGO,
            titulo: row.PRD_NOMBRE || 'Producto sin nombre',
            cantidad: cantidad,
            precioUnitario: precio
          });
        }
    });

    const listadoPedidos = Object.values(facturasMap);

    return res.status(200).json({
      success: true,
      data: listadoPedidos
    });

  } catch (err) {
    console.error('Error al obtener historial de pedidos:', err);
    return res.status(200).json({ 
      success: true, 
      data: [] 
    });
  }
}

// NUEVO ENDPOINT PARA ADMINISTRADOR: Obtener todas las órdenes
export async function obtenerTodosLosPedidosAdmin(req, res) {
  try {
    const sql = `
      SELECT id, cliente, correo, fecha, estado, total
      FROM vw_admin_pedidos
      ORDER BY fecha DESC, id DESC
    `;

    const result = await executeQuery(sql);

    const dataMapeada = result.rows.map(row => ({
      id: row.ID,
      cliente: row.CLIENTE,
      correo: row.CORREO,
      fecha: row.FECHA,
      total: Number(row.TOTAL || 0),
      estado: row.ESTADO === 'V' ? 'Completado' : (row.ESTADO === 'A' ? 'Anulado' : row.ESTADO)
    }));

    return res.status(200).json({
      success: true,
      data: dataMapeada
    });
  } catch (err) {
    console.error('Error al obtener pedidos para el admin:', err);
    return res.status(200).json({ 
      success: true, 
      data: [] 
    });
  }
}

// NUEVO ENDPOINT PARA ADMINISTRADOR: Actualizar estado del pedido
export async function actualizarEstadoPedido(req, res) {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ success: false, error: 'El estado es requerido.' });
  }

  let connection;
  try {
    connection = await getConnection();
    const sql = `
      BEGIN
        sp_actualizar_estado_pedido(:id, :estado);
      END;
    `;
    const result = await connection.execute(sql, { estado: String(estado), id: Number(id) });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado.' });
    }

    return res.status(200).json({ success: true, message: `Estado del pedido actualizado a '${estado}'.` });
  } catch (err) {
    console.error('Error al actualizar estado del pedido:', err);
    return res.status(500).json({ success: false, error: 'Error interno al actualizar el estado.' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error cerrando conexión:', err);
      }
    }
  }
}
