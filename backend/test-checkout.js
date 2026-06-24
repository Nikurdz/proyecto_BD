import { getConnection } from './db.js';
import oracledb from 'oracledb';

async function testCheckout() {
  let connection;
  try {
    const { initializeDatabase } = await import('./db.js');
    await initializeDatabase();
    connection = await getConnection();

    const usuarioId = '0999999999'; // Cédula de prueba
    const pedNumero = Math.floor(Date.now() / 10);
    const prdCodigo = 'PRD-001'; // Asumiendo que existe
    const cantidad = 1;
    const total = 10.0;

    console.log('1. Verificando o creando cliente...');
    const sqlCheckCliente = `SELECT CLI_CED_RUC FROM CLIENTE WHERE CLI_CED_RUC = :id`;
    const resultCliente = await connection.execute(sqlCheckCliente, { id: usuarioId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    if (!resultCliente.rows || resultCliente.rows.length === 0) {
      const sqlInsertCliente = `
        INSERT INTO CLIENTE (CLI_CED_RUC, CLI_NOMBRE, CLI_CORREO)
        VALUES (:id, :nombre, :correo)
      `;
      await connection.execute(sqlInsertCliente, {
        id: usuarioId,
        nombre: 'Test User',
        correo: 'test@test.com'
      });
    }

    console.log('2. Insertando cabecera de pedido...');
    const sqlPedido = `
      INSERT INTO PEDIDOCLIENTE (PED_NUMERO, CLI_CED_RUC, PED_FECHA, PED_ESTADO)
      VALUES (:ped_numero, :cli_ced_ruc, SYSDATE, 'PAGADO')
    `;
    await connection.execute(sqlPedido, { ped_numero: pedNumero, cli_ced_ruc: usuarioId });

    console.log('3. Insertando detalle de pedido...');
    // Asegurarse de que el producto exista para no fallar la llave foránea
    const checkPrd = await connection.execute(`SELECT PRD_CODIGO FROM PRODUCTO FETCH FIRST 1 ROWS ONLY`);
    const validPrd = checkPrd.rows.length > 0 ? checkPrd.rows[0][0] : 'TEST-PRD';

    const sqlDetalle = `
      INSERT INTO PRODUCTO_PEDCLI (PRD_CODIGO, PED_NUMERO, PPC_CANTIDAD)
      VALUES (:prd_codigo, :ped_numero, :cantidad)
    `;
    await connection.execute(sqlDetalle, {
      prd_codigo: validPrd,
      ped_numero: pedNumero,
      cantidad: cantidad
    });

    console.log('4. Insertando pago...');
    const pagCodigo = 'PAG-' + Math.floor(Math.random() * 100000);
    const sqlPago = `
      INSERT INTO PAGOS (PAG_CODIGO, PED_NUMERO, PAG_MONTO, PAG_FECHA)
      VALUES (:pag_codigo, :ped_numero, :pag_monto, SYSDATE)
    `;
    await connection.execute(sqlPago, { pag_codigo: pagCodigo, ped_numero: pedNumero, pag_monto: total });

    console.log('5. Commit...');
    await connection.commit();
    console.log('¡Transacción exitosa!');

  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('ERROR DB:', err);
  } finally {
    if (connection) {
      await connection.close();
    }
    process.exit(0);
  }
}

testCheckout();
