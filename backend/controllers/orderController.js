import oracledb from 'oracledb';
import nodemailer from 'nodemailer';
import { getConnection, executeQuery } from '../db.js';

export async function crearPedido(req, res) {
  const { items, direccionEnvio, cedula, nombreFacturacion, telefono } = req.body; // Se espera [{ id, cantidad }, ...]
  const usuarioId = req.usuario.id; // En el nuevo schema es CLI_CED_RUC

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El carrito no tiene productos válidos.' });
  }

  let connection;
  try {
    connection = await getConnection();

    let total = 0;
    const detallesAInsertar = [];
    const detallesCorreo = [];

    // 1. Validar productos, stock y calcular total con bloqueo de filas (FOR UPDATE)
    for (const item of items) {
      const cantidadNum = Number(item.cantidad);
      if (isNaN(cantidadNum)) throw new Error(`Cantidad inválida para el producto ${item.id}`);

      const sqlProducto = `
        SELECT PRD_NOMBRE, PRD_PRECIO, PRD_EXISTENCIA 
        FROM PRODUCTO 
        WHERE PRD_CODIGO = :id 
        FOR UPDATE
      `;
      
      const resultProd = await connection.execute(
        sqlProducto, 
        { id: String(item.id) }, 
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!resultProd.rows || resultProd.rows.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: `El producto con ID ${item.id} no existe en el catálogo.` });
      }

      const producto = resultProd.rows[0];
      const stockActual = Number(producto.PRD_EXISTENCIA);
      
      // Aplicar descuento simulado si la longitud del codigo > 5
      const precioOriginal = Number(producto.PRD_PRECIO);
      const tieneDescuento = String(item.id).length > 5;
      const precioUnitario = tieneDescuento ? Number((precioOriginal * 0.85).toFixed(2)) : precioOriginal;



      const subtotal = precioUnitario * cantidadNum;
      total += subtotal;

      detallesAInsertar.push({
        productoId: String(item.id),
        cantidad: cantidadNum,
        nuevoStock: stockActual - cantidadNum
      });

      detallesCorreo.push({
        titulo: producto.PRD_NOMBRE,
        cantidad: cantidadNum,
        precioUnitario: precioUnitario,
        subtotal: subtotal
      });
    }

    // Generar ID de pedido de máximo 12 dígitos
    const pedNumero = Math.floor(Date.now() / 10);
    const pagCodigo = 'PAG-' + Math.floor(Math.random() * 1000000);
    const correoDestino = req.usuario?.correo || 'cliente@naturart.com';
    const nombreCliente = req.usuario?.nombre || 'Cliente Web';

    const sqlCheckout = `
      BEGIN
        sp_procesar_checkout(
          :cli_ced_ruc,
          :cli_nombre,
          :cli_correo,
          :direccion,
          :total,
          :pag_codigo,
          :ped_numero,
          :detalles_json
        );
      END;
    `;

    const bindsCheckout = {
      cli_ced_ruc: String(usuarioId),
      cli_nombre: nombreCliente,
      cli_correo: correoDestino,
      direccion: String(direccionEnvio || 'No especificada'),
      total: Number(total),
      pag_codigo: pagCodigo,
      ped_numero: Number(pedNumero),
      detalles_json: JSON.stringify(detallesAInsertar)
    };

    await connection.execute(sqlCheckout, bindsCheckout);
    // El SP ya hace el COMMIT internamente

    // 6. Enviar Correo de Confirmación/Factura con Nodemailer
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // Debe ser false para el puerto 587
          requireTLS: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
          }
        });

        // Construir tabla de productos en HTML
        let tablaProductosHtml = '';
        detallesCorreo.forEach(prod => {
          tablaProductosHtml += `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600;">${prod.titulo}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; text-align: center;">${prod.cantidad}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; text-align: right;">$${prod.precioUnitario.toFixed(2)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold; text-align: right;">$${prod.subtotal.toFixed(2)}</td>
            </tr>
          `;
        });

        const fechaActual = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

        const htmlCorreo = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <!-- Cabecera -->
            <div style="background-color: #059669; padding: 30px 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">NATURART FOODS</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Confirmación de tu Compra</p>
            </div>

            <div style="padding: 30px;">
              <p style="font-size: 18px; color: #1f2937; margin-bottom: 25px;">¡Gracias por tu compra, <strong>${nombreFacturacion || 'Cliente'}</strong>!</p>
              
              <!-- Detalles principales -->
              <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 30px; background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #f3f4f6;">
                <div style="margin-bottom: 10px;">
                  <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Número de Pedido</p>
                  <p style="margin: 5px 0 0 0; font-size: 16px; color: #111827; font-weight: 900;">#${pedNumero}</p>
                </div>
                <div>
                  <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Fecha</p>
                  <p style="margin: 5px 0 0 0; font-size: 16px; color: #111827; font-weight: 600;">${fechaActual}</p>
                </div>
              </div>

              <!-- Dos columnas: Facturación y Envío -->
              <div style="display: flex; flex-wrap: wrap; margin-bottom: 30px; gap: 20px;">
                <div style="flex: 1; min-width: 250px;">
                  <h3 style="color: #059669; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #34d399; padding-bottom: 5px; margin-bottom: 15px;">Datos de Facturación</h3>
                  <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>Razón Social:</strong> ${nombreFacturacion}</p>
                  <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>Cédula/RUC:</strong> ${cedula}</p>
                  <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>Teléfono:</strong> ${telefono}</p>
                </div>
                <div style="flex: 1; min-width: 250px;">
                  <h3 style="color: #059669; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #34d399; padding-bottom: 5px; margin-bottom: 15px;">Dirección de Envío</h3>
                  <p style="margin: 5px 0; font-size: 14px; color: #4b5563; line-height: 1.5;">${direccionEnvio || 'No especificada'}</p>
                </div>
              </div>

              <!-- Tabla de Productos -->
              <h3 style="color: #059669; font-size: 14px; text-transform: uppercase; margin-bottom: 15px;">Resumen del Pedido</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 12px 10px; text-align: left; color: #374151; font-size: 12px; text-transform: uppercase;">Producto</th>
                    <th style="padding: 12px 10px; text-align: center; color: #374151; font-size: 12px; text-transform: uppercase;">Cant.</th>
                    <th style="padding: 12px 10px; text-align: right; color: #374151; font-size: 12px; text-transform: uppercase;">Precio Un.</th>
                    <th style="padding: 12px 10px; text-align: right; color: #374151; font-size: 12px; text-transform: uppercase;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${tablaProductosHtml}
                </tbody>
              </table>

              <!-- Totales -->
              <div style="width: 100%; max-width: 250px; margin-left: auto; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Subtotal:</span>
                  <span style="color: #374151; font-size: 14px; font-weight: bold;">$${total.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                  <span style="color: #111827; font-size: 16px; font-weight: bold;">Total Pagado:</span>
                  <span style="color: #059669; font-size: 18px; font-weight: 900;">$${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- Pie de página -->
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #4b5563; font-size: 14px; font-weight: 500;">¡Gracias por apoyar el consumo de productos 100% naturales!</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Si tienes alguna duda con tu pedido, contáctanos a soporte@naturartfoods.com</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Naturart Foods" <${process.env.EMAIL_USER}>`,
          to: correoDestino,
          subject: `Pedido Realizado con Éxito #${pedNumero} - Naturart Foods`,
          html: htmlCorreo
        });
        
        console.log('Factura/Confirmación enviada con éxito a:', correoDestino);
      } else {
        console.warn('Correo de confirmación no enviado. Faltan EMAIL_USER / EMAIL_PASS en .env');
      }
    } catch (emailError) {
      console.error('Error enviando el correo de factura (Checkout):', emailError);
      // No lanzamos error para no interrumpir el flujo del cliente, el pedido ya está guardado
    }

    return res.status(201).json({
      message: 'Pedido procesado exitosamente.',
      pedidoId: pedNumero,
      total,
      estado: 'PAGADO'
    });

  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error('Error al hacer rollback de la transacción:', rollbackErr);
      }
    }
    if (err.message && err.message.includes('ORA-20')) {
      const match = err.message.match(/ORA-20\d{3}:\s*(.*)/);
      const customError = match ? match[1] : err.message;
      return res.status(400).json({ error: customError });
    }
    console.error('ERROR DB:', err);
    return res.status(500).json({ error: 'Error interno del servidor al procesar el pedido.', detalle: err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error al cerrar la conexión en checkout:', closeErr);
      }
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
    // Consulta para obtener los pedidos del usuario con sus detalles unidos
    const sql = `
      SELECT PED_NUMERO AS pedido_id, PAG_MONTO AS total, PED_ESTADO AS estado, 
             PRD_CODIGO AS producto_id, PPC_CANTIDAD AS cantidad, PRD_PRECIO AS precio_unitario,
             PRD_NOMBRE AS producto_titulo
      FROM vw_mis_pedidos_gyq
      WHERE CLI_CED_RUC = :usuario_id
      ORDER BY PED_NUMERO DESC
    `;

    const result = await executeQuery(sql, { usuario_id: String(usuarioId) });

    // Agrupar filas por pedido_id
    const pedidosMap = {};

    result.rows.forEach(row => {
      const pId = row.PEDIDO_ID;
      if (!pedidosMap[pId]) {
        pedidosMap[pId] = {
          id: pId,
          total: Number(row.TOTAL),
          estado: row.ESTADO,
          items: []
        };
      }

      // Si el pedido tiene detalles, los añadimos
      if (row.PRODUCTO_ID) {
        pedidosMap[pId].items.push({
          productoId: row.PRODUCTO_ID,
          titulo: row.PRODUCTO_TITULO,
          cantidad: Number(row.CANTIDAD),
          precioUnitario: Number(row.PRECIO_UNITARIO)
        });
      }
    });

    const listadoPedidos = Object.values(pedidosMap);

    return res.json({
      success: true,
      data: listadoPedidos
    });

  } catch (err) {
    console.error('Error al obtener historial de pedidos:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al obtener el historial de pedidos.',
      details: err.message 
    });
  }
}

// NUEVO ENDPOINT PARA ADMINISTRADOR: Obtener todas las órdenes
export async function obtenerTodosLosPedidosAdmin(req, res) {
  try {
    const sql = `
      SELECT 
        PED_NUMERO AS ID, 
        CLI_NOMBRE AS CLIENTE, 
        CLI_CORREO AS CORREO, 
        PED_FECHA AS FECHA, 
        PAG_MONTO AS TOTAL, 
        PED_ESTADO AS ESTADO
      FROM vw_admin_pedidos_gyq
      ORDER BY PED_FECHA DESC
    `;

    const result = await executeQuery(sql);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error al obtener pedidos para el admin:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno al cargar la lista de pedidos.' 
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
