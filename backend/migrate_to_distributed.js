import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config({ override: true });

// Auto-convertir CLOB a string para evitar objetos Lob incompatibles
oracledb.fetchAsString = [ oracledb.CLOB ];

async function migrateData() {
  let oldDbConn;
  let newDbConn;

  try {
    // 1. Conexión a la BD Antigua
    console.log('Conectando a la BD Antigua...');
    oldDbConn = await oracledb.getConnection({
      user: process.env.OLD_DB_USER,
      password: process.env.OLD_DB_PASSWORD,
      connectString: `${process.env.OLD_DB_HOST}:${process.env.OLD_DB_PORT}/${process.env.OLD_DB_SERVICE_NAME}`,
    });
    console.log('✅ Conexión a la BD Antigua establecida.');

    // 2. Conexión a la Nueva BD (QYT - Nodo 1)
    console.log('Conectando a la Nueva BD (QYT)...');
    newDbConn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`,
    });
    console.log('✅ Conexión a QYT establecida.');

    // Configuración para el nuevo esquema (autoCommit manual para controlar la transacción general)
    const execOpts = { autoCommit: false };

    // --- MIGRACIÓN DE TABLAS DEL NODO 1 (QYT) ---
    console.log('\n--- Migrando tablas del Nodo 1 (QYT) ---');
    
    // Producto
    console.log('Migrando PRODUCTO...');
    const productos = await oldDbConn.execute('SELECT * FROM PRODUCTO', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    for (let p of productos.rows) {
      await newDbConn.execute(
        `INSERT INTO PRODUCTO (PRD_CODIGO, PRD_NOMBRE, PRD_CATEGORIA, PRD_PRECIO, PRD_EXISTENCIA) 
         VALUES (:1, :2, :3, :4, :5)`,
        [p.PRD_CODIGO, p.PRD_NOMBRE, p.PRD_CATEGORIA, p.PRD_PRECIO, p.PRD_EXISTENCIA],
        execOpts
      );
    }
    console.log(`✅ ${productos.rows.length} Productos migrados.`);

    // Pagos
    console.log('Migrando PAGOS...');
    const pagos = await oldDbConn.execute('SELECT * FROM PAGOS', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    for (let p of pagos.rows) {
      await newDbConn.execute(
        `INSERT INTO PAGOS (PAG_CODIGO, PED_NUMERO, PAG_MONTO, PAG_FECHA) 
         VALUES (:1, :2, :3, :4)`,
        [p.PAG_CODIGO, p.PED_NUMERO, p.PAG_MONTO, p.PAG_FECHA],
        execOpts
      );
    }
    console.log(`✅ ${pagos.rows.length} Pagos migrados.`);

    // --- MIGRACIÓN DE TABLAS DEL NODO 2 (GYQ - Vía DB Link) ---
    console.log('\n--- Migrando tablas del Nodo 2 (GYQ - Vía DB Link) ---');

    // Cliente
    console.log('Migrando CLIENTE...');
    const clientes = await oldDbConn.execute('SELECT * FROM CLIENTE', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    for (let c of clientes.rows) {
      await newDbConn.execute(
        `INSERT INTO CLIENTE@link_contingencia_gyq (CLI_CED_RUC, CLI_NOMBRE, CLI_DIRECCION, CLI_TELEFONO, CLI_CORREO) 
         VALUES (:1, :2, :3, :4, :5)`,
        [c.CLI_CED_RUC, c.CLI_NOMBRE, c.CLI_DIRECCION, c.CLI_TELEFONO, c.CLI_CORREO],
        execOpts
      );
    }
    console.log(`✅ ${clientes.rows.length} Clientes migrados.`);

    // PedidoCliente
    console.log('Migrando PEDIDOCLIENTE...');
    const pedidos = await oldDbConn.execute('SELECT * FROM PEDIDOCLIENTE', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    for (let p of pedidos.rows) {
      await newDbConn.execute(
        `INSERT INTO PEDIDOCLIENTE@link_contingencia_gyq (PED_NUMERO, CLI_CED_RUC, PED_FECHA, PED_ESTADO) 
         VALUES (:1, :2, :3, :4)`,
        [p.PED_NUMERO, p.CLI_CED_RUC, p.PED_FECHA, p.PED_ESTADO],
        execOpts
      );
    }
    console.log(`✅ ${pedidos.rows.length} Pedidos migrados.`);

    // Producto_Pedcli (Detalle)
    console.log('Migrando PRODUCTO_PEDCLI...');
    const detalles = await oldDbConn.execute('SELECT * FROM PRODUCTO_PEDCLI', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    for (let d of detalles.rows) {
      await newDbConn.execute(
        `INSERT INTO PRODUCTO_PEDCLI@link_contingencia_gyq (PRD_CODIGO, PED_NUMERO, PPC_CANTIDAD) 
         VALUES (:1, :2, :3)`,
        [d.PRD_CODIGO, d.PED_NUMERO, d.PPC_CANTIDAD],
        execOpts
      );
    }
    console.log(`✅ ${detalles.rows.length} Detalles de Pedido migrados.`);

    // Hacer commit de todas las transacciones en la nueva BD
    console.log('\nRealizando COMMIT en la Nueva BD (QYT)...');
    await newDbConn.commit();
    console.log('✅ Migración completada exitosamente.');

  } catch (error) {
    console.error('\n❌ Ocurrió un error durante la migración:', error);
    if (newDbConn) {
      try {
        console.log('Haciendo ROLLBACK en la Nueva BD...');
        await newDbConn.rollback();
      } catch (rollbackError) {
        console.error('Error al hacer rollback:', rollbackError);
      }
    }
  } finally {
    if (oldDbConn) {
      try {
        await oldDbConn.close();
      } catch (err) {
        console.error('Error al cerrar la conexión antigua:', err);
      }
    }
    if (newDbConn) {
      try {
        await newDbConn.close();
      } catch (err) {
        console.error('Error al cerrar la nueva conexión:', err);
      }
    }

    console.log('\n======================================================');
    console.log('⚠️  RECORDATORIO IMPORTANTE ⚠️');
    console.log('La migración de datos ha finalizado.');
    console.log('AHORA debes ejecutar MANUALMENTE en tu gestor de base de datos (SQL Developer/DBeaver) los scripts:');
    console.log(' - 02.sql');
    console.log(' - 03.sql');
    console.log(' - 04.sql');
    console.log(' - 05.sql');
    console.log(' - 06.sql');
    console.log('Estos scripts restaurarán los Triggers, Procedimientos (IntegrityPackage) y Vistas necesarias en el nuevo entorno.');
    console.log('======================================================\n');
  }
}

migrateData();
