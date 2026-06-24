import http from 'http';

async function run() {
  // 1. Register a new user to get a token
  const registerRes = await fetch('http://localhost:5000/api/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cedula: '1234567890',
      nombre: 'Tester',
      email: 'test' + Date.now() + '@test.com',
      password: 'password123'
    })
  });
  const registerData = await registerRes.json();
  const token = registerData.token;
  if (!token) {
    console.error('Fallo al registrar:', registerData);
    process.exit(1);
  }

  // 2. Add an item to checkout
  const checkoutRes = await fetch('http://localhost:5000/api/pedidos/checkout', {
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
}

run().catch(console.error);
