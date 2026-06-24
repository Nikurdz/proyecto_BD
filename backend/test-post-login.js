import { executeQuery, initializeDatabase } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await initializeDatabase();
  const res = await executeQuery(`SELECT CLI_CED_RUC, CLI_NOMBRE, CLI_CORREO, CLI_ROL FROM CLIENTE FETCH FIRST 1 ROWS ONLY`);
  if (res.rows.length === 0) {
    console.error('No hay usuarios en la BD.');
    process.exit(1);
  }
  const u = res.rows[0];
  const token = jwt.sign(
    {
      id: u.CLI_CED_RUC,
      nombre: u.CLI_NOMBRE,
      correo: u.CLI_CORREO,
      rol: u.CLI_ROL
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const checkoutRes = await fetch('http://127.0.0.1:5000/api/pedidos/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      items: [
        { id: 'P10001', cantidad: 1 }
      ]
    })
  });

  const checkoutData = await checkoutRes.json();
  console.log('Respuesta de Checkout:', checkoutData);
  process.exit(0);
}

run().catch(console.error);
