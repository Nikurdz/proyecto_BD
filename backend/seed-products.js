import oracledb from 'oracledb';
import dotenv from 'dotenv';
import { initializeDatabase, getConnection } from './db.js';

dotenv.config();

const sampleProducts = [
  {
    codigo: 'P10001',
    nombre: 'Manzanas Orgánicas',
    descripcion: 'Manzanas frescas, crujientes y cultivadas sin pesticidas.',
    precio: 2.50,
    existencia: 100,
    imagen_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?auto=format&fit=crop&q=80&w=600',
    categoria: 'Frutas'
  },
  {
    codigo: 'P10002D', // Tiene descuento
    nombre: 'Leche de Almendras',
    descripcion: 'Leche de almendras natural, sin azúcar añadida y rica en vitaminas.',
    precio: 3.20,
    existencia: 50,
    imagen_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=600',
    categoria: 'Lácteos Veganos'
  },
  {
    codigo: 'P10003',
    nombre: 'Pan Integral Artesanal',
    descripcion: 'Pan horneado con masa madre e ingredientes 100% orgánicos.',
    precio: 4.00,
    existencia: 30,
    imagen_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
    categoria: 'Panadería'
  },
  {
    codigo: 'P10004',
    nombre: 'Miel de Abeja Pura',
    descripcion: 'Miel cruda y orgánica, extraída artesanalmente.',
    precio: 8.50,
    existencia: 40,
    imagen_url: 'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?auto=format&fit=crop&q=80&w=600',
    categoria: 'Endulzantes'
  },
  {
    codigo: 'P10005',
    nombre: 'Café de Especialidad',
    descripcion: 'Café en grano tostado medio, cultivado a gran altitud.',
    precio: 12.00,
    existencia: 20,
    imagen_url: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=600',
    categoria: 'Bebidas'
  },
  {
    codigo: 'P10006D', // Tiene descuento
    nombre: 'Té Verde Matcha',
    descripcion: 'Té matcha ceremonial importado de Japón, rico en antioxidantes.',
    precio: 18.00,
    existencia: 15,
    imagen_url: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?auto=format&fit=crop&q=80&w=600',
    categoria: 'Bebidas'
  },
  {
    codigo: 'P10007',
    nombre: 'Avena Integral',
    descripcion: 'Avena en hojuelas ricas en fibra, ideales para un desayuno saludable.',
    precio: 3.50,
    existencia: 80,
    imagen_url: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80&w=600',
    categoria: 'Cereales'
  },
  {
    codigo: 'P10008D', // Tiene descuento
    nombre: 'Yogur de Coco',
    descripcion: 'Yogur probiótico a base de coco, sin lactosa.',
    precio: 4.50,
    existencia: 45,
    imagen_url: 'https://images.unsplash.com/photo-1571212515416-fef01b402bfd?auto=format&fit=crop&q=80&w=600',
    categoria: 'Lácteos Veganos'
  }
];

async function run() {
  let connection;
  try {
    await initializeDatabase();
    connection = await getConnection();

    console.log('Insertando productos de prueba en el catálogo...');

    // Primero borremos todo para que queden solo estos si el usuario corre el script (opcional, pero ayuda a limpiar)
    await connection.execute(`DELETE FROM PRODUCTO`);
    await connection.commit();

    for (const prod of sampleProducts) {
      const sqlInsert = `
        INSERT INTO PRODUCTO (PRD_CODIGO, PRD_NOMBRE, PRD_DESCRIPCION, PRD_PRECIO, PRD_EXISTENCIA, PRD_IMAGEN_URL, PRD_CATEGORIA)
        VALUES (:codigo, :nombre, :descripcion, :precio, :existencia, :imagen_url, :categoria)
      `;

      await connection.execute(sqlInsert, {
        codigo: prod.codigo,
        nombre: prod.nombre,
        descripcion: prod.descripcion,
        precio: prod.precio,
        existencia: prod.existencia,
        imagen_url: prod.imagen_url,
        categoria: prod.categoria
      });
      console.log(`✅ Producto insertado: ${prod.nombre}`);
    }

    await connection.commit();
    console.log('🎉 Población de catálogo completada exitosamente.');

  } catch (err) {
    console.error('❌ Error al poblar el catálogo:', err);
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
