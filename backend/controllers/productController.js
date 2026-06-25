import oracledb from 'oracledb';
import { executeQuery, getConnection } from '../db.js';

const formatImageUrl = (req, url) => {
  if (!url) return url;
  return url.replace('http://localhost:5000', `http://${req.hostname}:5000`);
};

export async function obtenerProductos(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const { categoria, search, minPrice, maxPrice, descuento } = req.query;

    const filterBinds = {};
    const whereClauses = [];

    // Filtro por categoría
    if (categoria) {
      whereClauses.push('UPPER(p.categoria) = UPPER(:categoria_nombre)');
      filterBinds.categoria_nombre = categoria;
    }

    // Filtro por búsqueda (Búsqueda en título o descripción)
    if (search) {
      whereClauses.push('(UPPER(p.titulo) LIKE UPPER(:search_val) OR UPPER(p.descripcion) LIKE UPPER(:search_val))');
      filterBinds.search_val = `%${search}%`;
    }

    // Filtro por precio mínimo
    if (minPrice && !isNaN(minPrice)) {
      whereClauses.push('p.precio >= :min_price');
      filterBinds.min_price = parseFloat(minPrice);
    }

    // Filtro por precio máximo
    if (maxPrice && !isNaN(maxPrice)) {
      whereClauses.push('p.precio <= :max_price');
      filterBinds.max_price = parseFloat(maxPrice);
    }

    // Filtro por descuentos (Simulado con productos que terminen en D)
    if (descuento === 'true') {
      whereClauses.push("p.descuento_pct > 0"); 
    }

    const whereClauseStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 1. Obtener el total de productos que coinciden con los filtros
    const countSql = `
      SELECT COUNT(*) AS TOTAL 
      FROM vw_productos_qyt p 
      ${whereClauseStr}
    `;
    const countResult = await executeQuery(countSql, filterBinds);
    const totalRecords = countResult.rows[0]?.TOTAL || 0;

    // 2. Obtener los productos paginados
    const sql = `
      SELECT p.id, p.titulo, p.descripcion, p.precio, p.imagen_url, p.fecha_creacion, p.categoria, p.descuento_pct,
             b.PRB_EXISTENCIA AS bodega_stock
      FROM vw_productos_qyt p
      LEFT JOIN PROD_BODGA b ON p.id = b.PRD_CODIGO AND b.BOD_CODIGO = 'SUC1'
      ${whereClauseStr}
      ORDER BY p.id ASC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const queryBinds = {
      ...filterBinds,
      offset,
      limit
    };

    const result = await executeQuery(sql, queryBinds);

    // Mapear campos de mayúsculas (Oracle por defecto) al formato esperado por el frontend
    const productos = result.rows.map(row => {
      const precioOriginal = Number(row.PRECIO);
      const descuentoPorcentaje = Number(row.DESCUENTO_PCT || 0);
      const tieneDescuento = descuentoPorcentaje > 0;
      const precioFinal = tieneDescuento ? Number((precioOriginal * (1 - descuentoPorcentaje / 100)).toFixed(2)) : precioOriginal;

      return {
        id: row.ID, 
        titulo: row.TITULO,
        descripcion: row.DESCRIPCION,
        precio: precioFinal,
        precioOriginal: tieneDescuento ? precioOriginal : null,
        descuentoPorcentaje: descuentoPorcentaje,
        stock: Number(row.BODEGA_STOCK || 0),
        imagen_url: formatImageUrl(req, row.IMAGEN_URL),
        categoria: row.CATEGORIA,
        fecha_creacion: row.FECHA_CREACION
      };
    });

    return res.json({
      success: true,
      data: productos,
      pagination: {
        total: totalRecords,
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit)
      }
    });

  } catch (err) {
    console.error('Error al obtener productos con filtros:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al obtener los productos del catálogo.',
      details: err.message 
    });
  }
}

// --- FUNCIONES CRUD DE ADMINISTRADOR ---

export async function crearProducto(req, res) {
  const { titulo, descripcion_detallada, precio, stock, imagen_url, categoria, descuentoPct } = req.body;

  if (!titulo || !descripcion_detallada || precio === undefined || stock === undefined || !categoria) {
    return res.status(400).json({ error: 'Título, descripción, precio, stock y categoría son obligatorios.' });
  }

  let connection;
  try {
    connection = await getConnection();

    // Generar un código aleatorio para PRD_CODIGO (VARCHAR2(10))
    const prdCodigo = 'P' + Math.floor(100000000 + Math.random() * 900000000).toString();

    const sql = `
      BEGIN
        SP_CREAR_PRODUCTO(:prdCodigo, :titulo, :descripcion_detallada, :precio, :stock, :imagen_url, :categoria, :descuentoPct);
      END;
    `;

    const binds = {
      prdCodigo,
      titulo,
      descripcion_detallada,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      imagen_url: imagen_url || '',
      categoria: categoria,
      descuentoPct: parseFloat(descuentoPct || 0)
    };

    await connection.execute(sql, binds);
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente.',
      producto: {
        id: prdCodigo,
        titulo,
        descripcion: descripcion_detallada,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen_url: formatImageUrl(req, imagen_url),
        categoria: 'Alimentos Orgánicos'
      }
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error al crear producto:', err);
    return res.status(500).json({ error: 'Error al insertar el producto en la base de datos.', details: err.message });
  } finally {
    if (connection) await connection.close();
  }
}

export async function actualizarProducto(req, res) {
  const { id } = req.params; // id ahora es el PRD_CODIGO
  const { titulo, descripcion_detallada, precio, imagen_url, categoria, descuentoPct, stockAgregar } = req.body;

  if (!titulo || !descripcion_detallada || precio === undefined || !categoria) {
    return res.status(400).json({ error: 'Título, descripción, precio y categoría son obligatorios.' });
  }

  let connection;
  try {
    connection = await getConnection();

    // Obtener el stock actual para sumarle stockAgregar
    const sqlStock = `SELECT NVL(PRD_EXISTENCIA, 0) AS CURRENT_STOCK FROM PRODUCTO WHERE PRD_CODIGO = :id`;
    // Add outFormat so we can access CURRENT_STOCK by name
    const resultStock = await connection.execute(sqlStock, { id }, { outFormat: 4002 }); // 4002 is OUT_FORMAT_OBJECT
    const currentStock = resultStock.rows && resultStock.rows.length > 0 ? Number(resultStock.rows[0].CURRENT_STOCK) : 0;
    const nuevoStock = currentStock + parseInt(stockAgregar || 0);

    const sql = `
      BEGIN
        SP_ACTUALIZAR_PRODUCTO(:id, :titulo, :descripcion_detallada, :precio, :nuevoStock, :imagen_url, :categoria, :descuentoPct);
      END;
    `;

    const binds = {
      id: id,
      titulo,
      descripcion_detallada,
      precio: parseFloat(precio),
      imagen_url: imagen_url || '',
      categoria,
      descuentoPct: parseFloat(descuentoPct || 0),
      nuevoStock: nuevoStock
    };

    const result = await connection.execute(sql, binds);


    await connection.commit();

    return res.json({
      success: true,
      message: 'Producto actualizado exitosamente.',
      producto: { id, titulo, descripcion: descripcion_detallada, precio, imagen_url: formatImageUrl(req, imagen_url) }
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error al actualizar producto:', err);
    return res.status(500).json({ error: 'Error al actualizar el producto.', details: err.message });
  } finally {
    if (connection) await connection.close();
  }
}

export async function eliminarProducto(req, res) {
  const { id } = req.params;

  let connection;
  try {
    connection = await getConnection();

    const sql = `
      BEGIN
        SP_ELIMINAR_PRODUCTO(:id);
      END;
    `;
    const binds = { id: id };

    await connection.execute(sql, binds);

    await connection.commit();

    return res.json({ success: true, message: 'Producto eliminado exitosamente.' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error al eliminar producto:', err);
    return res.status(500).json({ error: 'Error al eliminar el producto.', details: err.message });
  } finally {
    if (connection) await connection.close();
  }
}

// --- FAVORITOS ---

export async function obtenerFavoritos(req, res) {
  try {
    const cliCedRuc = req.usuario.id; 

    const sql = `
      SELECT PRD_CODIGO, PRD_NOMBRE, PRD_DESCRIPCION, PRD_PRECIO, PRD_IMAGEN_URL, PRD_CATEGORIA, PRD_DESCUENTO_PCT, FECHA_CREACION, PRD_EXISTENCIA, FECHA_AGREGADO
      FROM vw_favoritos_gyq
      WHERE CLI_CED_RUC = :cliCedRuc
      ORDER BY FECHA_AGREGADO DESC
    `;

    const result = await executeQuery(sql, { cliCedRuc });

    const favoritos = result.rows.map(row => ({
      id: row.PRD_CODIGO,
      titulo: row.PRD_NOMBRE,
      descripcion: row.PRD_DESCRIPCION,
      precio: Number(row.PRD_PRECIO),
      stock: Number(row.PRD_EXISTENCIA),
      imagen_url: formatImageUrl(req, row.PRD_IMAGEN_URL),
      categoria: row.PRD_CATEGORIA,
      descuentoPorcentaje: Number(row.PRD_DESCUENTO_PCT || 0),
      fecha_creacion: row.FECHA_CREACION,
      fechaAgregado: row.FECHA_AGREGADO
    }));

    return res.json({ success: true, data: favoritos });
  } catch (err) {
    console.error('Error al obtener favoritos:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
  }
}

export async function agregarFavorito(req, res) {
  const cliCedRuc = req.usuario.id;
  const { id: prdCodigo } = req.params;

  let connection;
  try {
    connection = await getConnection();
    
    const insertSql = `
      BEGIN
        SP_AGREGAR_FAVORITO(:cliCedRuc, :prdCodigo);
      END;
    `;
    await connection.execute(insertSql, { cliCedRuc, prdCodigo });
    await connection.commit();

    return res.status(201).json({ success: true, message: 'Producto agregado a favoritos.' });
  } catch (err) {
    if (connection) await connection.rollback();
    if (err.message && err.message.includes('ORA-20')) {
      const match = err.message.match(/ORA-20\d{3}:\s*(.*)/);
      const customError = match ? match[1] : err.message;
      return res.status(400).json({ success: false, error: customError });
    }
    console.error('Error al agregar favorito:', err);
    return res.status(500).json({ success: false, error: 'No se pudo agregar a favoritos.' });
  } finally {
    if (connection) await connection.close();
  }
}

export async function eliminarFavorito(req, res) {
  const cliCedRuc = req.usuario.id;
  const { id: prdCodigo } = req.params;

  let connection;
  try {
    connection = await getConnection();
    
    const sql = `
      BEGIN
        SP_ELIMINAR_FAVORITO(:cliCedRuc, :prdCodigo);
      END;
    `;
    await connection.execute(sql, { cliCedRuc, prdCodigo });

    await connection.commit();

    return res.json({ success: true, message: 'Producto eliminado de favoritos.' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error al eliminar favorito:', err);
    return res.status(500).json({ success: false, error: 'No se pudo eliminar de favoritos.' });
  } finally {
    if (connection) await connection.close();
  }
}

export async function obtenerCategorias(req, res) {
  try {
    const sql = `
      SELECT DISTINCT NOMBRE 
      FROM vw_categorias_qyt 
      ORDER BY NOMBRE ASC
    `;
    const result = await executeQuery(sql, {});
    
    // Mapear a un formato con id y nombre para el frontend
    const categorias = result.rows.map((row, index) => ({
      id: index + 1,
      nombre: row.NOMBRE
    }));

    return res.json({
      success: true,
      data: categorias
    });
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    return res.status(500).json({ success: false, error: 'Error al obtener categorías.' });
  }
}

export async function crearCategoria(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
  }

  let connection;
  try {
    connection = await getConnection();

    // Generar un código rápido para CAT_CODIGO que es requerido en el nuevo modelo
    const randomId = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    const catCodigo = `C${randomId}`;

    const sql = `
      BEGIN
        SP_CREAR_CATEGORIA(:nombre, :catCodigo);
      END;
    `;
    await connection.execute(sql, { nombre, catCodigo });
    await connection.commit();

    return res.status(201).json({ success: true, message: 'Categoría creada exitosamente.', categoria: { nombre } });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error al crear categoría:', err);
    // Si viola unique constraint (código de error Oracle 1)
    if (err.errorNum === 1) {
      return res.status(400).json({ error: 'La categoría ya existe.' });
    }
    return res.status(500).json({ error: 'Error al crear la categoría.', details: err.message });
  } finally {
    if (connection) await connection.close();
  }
}
