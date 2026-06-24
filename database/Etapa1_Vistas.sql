-- ETAPA 1: Vistas Analíticas y Operacionales (Solo Lectura)
-- Reemplazo total de sentencias SELECT en Node.js (Patrón Thick Database)
-- Nodo: QYT (Local) | Apunta a: GYQ (Contingencia) vía @link_contingencia_gyq

-- ==========================================
-- 1. Catálogo y Productos (Tablas Locales QYT)
-- ==========================================
CREATE OR REPLACE VIEW vw_productos_qyt AS
SELECT 
    PRD_CODIGO AS id, 
    PRD_NOMBRE AS titulo, 
    PRD_DESCRIPCION AS descripcion, 
    PRD_PRECIO AS precio, 
    PRD_EXISTENCIA AS stock, 
    PRD_IMAGEN_URL AS imagen_url, 
    FECHA_CREACION AS fecha_creacion, 
    PRD_CATEGORIA AS categoria, 
    PRD_DESCUENTO_PCT AS descuento_pct
FROM PRODUCTO;

CREATE OR REPLACE VIEW vw_categorias_qyt AS
SELECT NOMBRE FROM CATEGORIAS;

-- ==========================================
-- 2. Usuarios y Clientes (Remoto GYQ)
-- ==========================================
CREATE OR REPLACE VIEW vw_clientes_gyq AS
SELECT * FROM CLIENTE@link_contingencia_gyq;

-- ==========================================
-- 3. Pedidos (Mixto: Remoto GYQ + Local QYT)
-- ==========================================
-- Vista para el panel de usuario (mis pedidos) con el detalle del carrito
CREATE OR REPLACE VIEW vw_mis_pedidos_gyq AS
SELECT 
    p.PED_NUMERO, 
    p.CLI_CED_RUC, 
    p.PED_ESTADO, 
    pag.PAG_MONTO,
    d.PRD_CODIGO, 
    d.PPC_CANTIDAD, 
    pr.PRD_PRECIO, 
    pr.PRD_NOMBRE
FROM PEDIDOCLIENTE@link_contingencia_gyq p
LEFT JOIN PAGOS pag ON p.PED_NUMERO = pag.PED_NUMERO
LEFT JOIN PRODUCTO_PEDCLI@link_contingencia_gyq d ON p.PED_NUMERO = d.PED_NUMERO
LEFT JOIN PRODUCTO pr ON d.PRD_CODIGO = pr.PRD_CODIGO;

-- Vista para el panel de administración (todos los pedidos)
CREATE OR REPLACE VIEW vw_admin_pedidos_gyq AS
SELECT 
    p.PED_NUMERO, 
    c.CLI_NOMBRE, 
    c.CLI_CORREO, 
    p.PED_FECHA, 
    pag.PAG_MONTO, 
    p.PED_ESTADO
FROM PEDIDOCLIENTE@link_contingencia_gyq p
JOIN CLIENTE@link_contingencia_gyq c ON p.CLI_CED_RUC = c.CLI_CED_RUC
LEFT JOIN PAGOS pag ON p.PED_NUMERO = pag.PED_NUMERO;

-- ==========================================
-- 4. Favoritos (Remoto GYQ + Local QYT)
-- ==========================================
CREATE OR REPLACE VIEW vw_favoritos_gyq AS
SELECT 
    f.CLI_CED_RUC,
    f.FECHA_AGREGADO,
    p.PRD_CODIGO, 
    p.PRD_NOMBRE, 
    p.PRD_DESCRIPCION, 
    p.PRD_PRECIO, 
    p.PRD_IMAGEN_URL, 
    p.PRD_CATEGORIA, 
    p.PRD_DESCUENTO_PCT, 
    p.FECHA_CREACION, 
    p.PRD_EXISTENCIA
FROM FAVORITOS f
JOIN PRODUCTO p ON f.PRD_CODIGO = p.PRD_CODIGO;
