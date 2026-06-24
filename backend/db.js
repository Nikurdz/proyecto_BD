import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config({ override: true });

// Auto-convertir CLOB a string para evitar objetos Lob incompatibles con JSON
oracledb.fetchAsString = [ oracledb.CLOB ];

// REGLA ESTRICTA DE ARQUITECTURA DISTRIBUIDA:
// Este sistema se conectará ÚNICA Y EXCLUSIVAMENTE al nodo principal (QYT - Producción).
// No debe existir NINGUNA conexión a GYQ desde Node.js. 
// Las operaciones hacia GYQ se harán a través del DB Link a nivel de base de datos.
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`,
};

let pool;

export const isDbConnected = () => !!pool;

export async function initializeDatabase() {
  try {
    pool = await oracledb.createPool({
      ...dbConfig,
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1,
    });
    console.log('Pool de conexiones de Oracle DB inicializado en modo Thin.');
  } catch (err) {
    console.error('⚠️ Error al inicializar el pool de conexiones de Oracle:', err.message);
    // Ya no arrojamos el error para no crashear Node.js
  }
}

export async function getConnection() {
  if (!pool) {
    throw new Error('El pool de base de datos no ha sido inicializado.');
  }
  return await pool.getConnection();
}

export async function executeQuery(sql, binds = [], options = {}) {
  if (!pool) {
    throw new Error('El pool de base de datos no ha sido inicializado.');
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const opt = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: false,
      ...options,
    };
    const result = await connection.execute(sql, binds, opt);
    return result;
  } catch (err) {
    console.error('Error ejecutando consulta:', sql, err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar la conexión:', err);
      }
    }
  }
}
