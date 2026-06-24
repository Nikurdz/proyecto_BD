import oracledb from 'oracledb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { initializeDatabase, getConnection } from './db.js';

dotenv.config();

async function run() {
  let connection;
  try {
    await initializeDatabase();
    connection = await getConnection();

    console.log('Running 04_create_categorias.sql...');
    const sql4 = fs.readFileSync(path.join(process.cwd(), '../database/04_create_categorias.sql'), 'utf8');
    for (const statement of sql4.split(';').filter(s => s.trim())) {
      if(statement.trim().toUpperCase() !== 'COMMIT') {
        try {
          await connection.execute(statement.trim());
        } catch(e) { console.error('Ignored:', e.message) }
      }
    }

    console.log('Running 05_add_discount.sql...');
    const sql5 = fs.readFileSync(path.join(process.cwd(), '../database/05_add_discount.sql'), 'utf8');
    for (const statement of sql5.split(';').filter(s => s.trim())) {
      if(statement.trim().toUpperCase() !== 'COMMIT') {
        try {
          await connection.execute(statement.trim());
        } catch(e) { console.error('Ignored:', e.message) }
      }
    }
    
    await connection.commit();
    console.log('Migration successful');

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) {}
    }
  }
}
run();
