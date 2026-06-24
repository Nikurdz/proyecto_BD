import oracledb from 'oracledb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { initializeDatabase, getConnection } from './db.js';

dotenv.config();

async function run() {
  let connection;
  try {
    await initializeDatabase();
    connection = await getConnection();

    console.log('Verificando usuario administrador...');

    // Verificar si el admin ya existe en la nueva tabla CLIENTE
    const sqlCheck = `SELECT CLI_CED_RUC FROM CLIENTE@link_contingencia_gyq WHERE UPPER(CLI_CORREO) = :correo`;
    const resultCheck = await connection.execute(
      sqlCheck, 
      { correo: 'ADMIN@NATURART.COM' },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    if (resultCheck.rows && resultCheck.rows.length > 0) {
      console.log('El usuario administrador ya existe. Actualizando contraseña y rol para asegurar acceso...');
      const sqlUpdate = `
        UPDATE CLIENTE@link_contingencia_gyq 
        SET CLI_PASSWORD = :password, CLI_ROL = 'admin', CLI_NOMBRE = 'Administrador'
        WHERE UPPER(CLI_CORREO) = :correo
      `;
      await connection.execute(sqlUpdate, { password: hashedPassword, correo: 'ADMIN@NATURART.COM' });
      await connection.commit();
      console.log('✅ Contraseña y rol del usuario administrador actualizados con éxito.');
      return;
    }

    const sqlInsert = `
      INSERT INTO CLIENTE@link_contingencia_gyq (CLI_CED_RUC, CLI_NOMBRE, CLI_CORREO, CLI_PASSWORD, CLI_ROL)
      VALUES (:cedula, :nombre, :correo, :password, :rol)
    `;

    const binds = {
      cedula: '0000000000000', // RUC/Cedula ficticia del admin
      nombre: 'Administrador',
      correo: 'admin@naturart.com',
      password: hashedPassword,
      rol: 'admin'
    };

    await connection.execute(sqlInsert, binds);
    await connection.commit();

    console.log('✅ Usuario administrador creado con éxito.');
    console.log('--- Credenciales de acceso ---');
    console.log('Email: admin@naturart.com');
    console.log('Contraseña: admin123');
    console.log('------------------------------');

  } catch (err) {
    console.error('❌ Error al verificar/crear el usuario administrador:', err);
    if (connection) {
      try {
        await connection.rollback();
      } catch (e) {
        console.error('Error al hacer rollback:', e);
      }
    }
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
