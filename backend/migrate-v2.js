import oracledb from 'oracledb';
import dotenv from 'dotenv';
import { initializeDatabase, getConnection } from './db.js';

dotenv.config();

async function run() {
  let connection;
  try {
    await initializeDatabase();
    connection = await getConnection();

    console.log('Aplicando migraciones V2 a Oracle DB (Nuevas Columnas y Favoritos)...');

    // 1. Añadir columnas faltantes a CLIENTE
    try {
      console.log('Intentando agregar CLI_PASSWORD y CLI_ROL a CLIENTE...');
      await connection.execute(`ALTER TABLE CLIENTE ADD (CLI_PASSWORD VARCHAR2(255), CLI_ROL VARCHAR2(20) DEFAULT 'cliente')`);
      console.log('✅ Columnas agregadas a CLIENTE.');
    } catch (err) {
      if (err.message && err.message.includes('ORA-01430')) {
        console.log('⚠️ Las columnas ya existen en CLIENTE.');
      } else {
        throw err;
      }
    }

    // 2. Añadir columnas faltantes a PRODUCTO
    try {
      console.log('Intentando agregar PRD_IMAGEN_URL, PRD_DESCRIPCION, PRD_CATEGORIA, fecha_creacion a PRODUCTO...');
      await connection.execute(`
        ALTER TABLE PRODUCTO ADD (
          PRD_IMAGEN_URL VARCHAR2(255),
          PRD_DESCRIPCION VARCHAR2(1000),
          PRD_CATEGORIA VARCHAR2(50),
          fecha_creacion DATE DEFAULT SYSDATE
        )
      `);
      console.log('✅ Columnas agregadas a PRODUCTO.');
    } catch (err) {
      if (err.message && err.message.includes('ORA-01430')) {
        console.log('⚠️ Las columnas ya existen en PRODUCTO.');
      } else {
        throw err;
      }
    }

    // 3. Añadir columnas faltantes a PRODUCTO_PEDCLI
    try {
      console.log('Intentando agregar PPC_PRECIO_UNITARIO a PRODUCTO_PEDCLI...');
      await connection.execute(`ALTER TABLE PRODUCTO_PEDCLI ADD (PPC_PRECIO_UNITARIO NUMBER(12,2))`);
      console.log('✅ Columna agregada a PRODUCTO_PEDCLI.');
    } catch (err) {
      if (err.message && err.message.includes('ORA-01430')) {
        console.log('⚠️ La columna ya existe en PRODUCTO_PEDCLI.');
      } else {
        throw err;
      }
    }

    // 4. Crear tabla FAVORITOS (V2)
    try {
      console.log('Intentando crear tabla FAVORITOS para el nuevo esquema...');
      const createTableSql = `
        CREATE TABLE FAVORITOS (
            cli_ced_ruc VARCHAR2(13) NOT NULL,
            prd_codigo VARCHAR2(10) NOT NULL,
            fecha_agregado DATE DEFAULT SYSDATE,
            CONSTRAINT pk_favoritos PRIMARY KEY (cli_ced_ruc, prd_codigo),
            CONSTRAINT fk_fav_cliente FOREIGN KEY (cli_ced_ruc) REFERENCES CLIENTE(CLI_CED_RUC) ON DELETE CASCADE,
            CONSTRAINT fk_fav_producto FOREIGN KEY (prd_codigo) REFERENCES PRODUCTO(PRD_CODIGO) ON DELETE CASCADE
        )
      `;
      await connection.execute(createTableSql);
      console.log('✅ Tabla FAVORITOS creada exitosamente.');
    } catch (err) {
      if (err.message && err.message.includes('ORA-00955')) {
        console.log('⚠️ La tabla FAVORITOS ya existe en la base de datos.');
      } else {
        throw err;
      }
    }

    console.log('🎉 Migraciones V2 completadas.');

  } catch (err) {
    console.error('❌ Error al ejecutar las migraciones:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar la conexión:', err);
      }
    }
    process.exit(0);
  }
}

run();
