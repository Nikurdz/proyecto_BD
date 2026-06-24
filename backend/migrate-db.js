import oracledb from 'oracledb';
import dotenv from 'dotenv';
import { initializeDatabase, getConnection } from './db.js';

dotenv.config();

async function run() {
  let connection;
  try {
    await initializeDatabase();
    connection = await getConnection();

    console.log('Aplicando migraciones a Oracle DB...');

    // 1. Agregar columna fecha_creacion a PRODUCTOS
    try {
      console.log('Intentando agregar columna fecha_creacion a PRODUCTOS...');
      await connection.execute(`ALTER TABLE PRODUCTOS ADD (fecha_creacion DATE DEFAULT SYSDATE)`);
      console.log('✅ Columna fecha_creacion agregada exitosamente.');
    } catch (err) {
      if (err.message && err.message.includes('ORA-01430')) {
        console.log('⚠️ La columna fecha_creacion ya existe en la tabla PRODUCTOS.');
      } else {
        throw err;
      }
    }

    // 2. Crear tabla FAVORITOS
    try {
      console.log('Intentando crear tabla FAVORITOS...');
      const createTableSql = `
        CREATE TABLE FAVORITOS (
            usuario_id NUMBER NOT NULL,
            producto_id NUMBER NOT NULL,
            fecha_agregado DATE DEFAULT SYSDATE,
            CONSTRAINT pk_favoritos PRIMARY KEY (usuario_id, producto_id),
            CONSTRAINT fk_fav_usuario FOREIGN KEY (usuario_id) REFERENCES USUARIOS(id) ON DELETE CASCADE,
            CONSTRAINT fk_fav_producto FOREIGN KEY (producto_id) REFERENCES PRODUCTOS(id) ON DELETE CASCADE
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

    console.log('🎉 Migraciones completadas.');

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
