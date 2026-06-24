-- 1. Vista: Ventas por Mes (Histórico completo)
CREATE OR REPLACE VIEW vw_ventas_mes_historico_gyq AS
SELECT 
    t.ANIO, 
    t.MES, 
    SUM(h.PAG_MONTO) AS TOTAL_INGRESOS,
    SUM(h.PPC_CANTIDAD) AS TOTAL_PRODUCTOS_VENDIDOS
FROM dw_admin.HECHOS_PEDIDOS@link_contingencia_gyq h
JOIN dw_admin.DIM_TIEMPO@link_contingencia_gyq t ON h.FECHA = t.FECHA
GROUP BY t.ANIO, t.MES;

-- 2. Vista: Ventas por Mes (Solo Año Actual)
CREATE OR REPLACE VIEW vw_ventas_mes_anio_actual_gyq AS
SELECT 
    t.ANIO, 
    t.MES, 
    SUM(h.PAG_MONTO) AS TOTAL_INGRESOS,
    SUM(h.PPC_CANTIDAD) AS TOTAL_PRODUCTOS_VENDIDOS
FROM dw_admin.HECHOS_PEDIDOS@link_contingencia_gyq h
JOIN dw_admin.DIM_TIEMPO@link_contingencia_gyq t ON h.FECHA = t.FECHA
WHERE t.ANIO = EXTRACT(YEAR FROM SYSDATE)
GROUP BY t.ANIO, t.MES;

-- 3. Vista: Top 5 Productos (Histórico completo)
CREATE OR REPLACE VIEW vw_top_productos_historico_gyq AS
SELECT prd_nombre, cantidad_vendida, ingresos_totales
FROM (
    SELECT 
        p.PRD_NOMBRE, 
        SUM(h.PPC_CANTIDAD) AS CANTIDAD_VENDIDA,
        SUM(h.PAG_MONTO) AS INGRESOS_TOTALES
    FROM dw_admin.HECHOS_PEDIDOS@link_contingencia_gyq h
    JOIN dw_admin.DIM_PRODUCTO@link_contingencia_gyq p ON h.PRD_ID = p.PRD_ID
    GROUP BY p.PRD_NOMBRE
    ORDER BY SUM(h.PPC_CANTIDAD) DESC
)
WHERE ROWNUM <= 5;

-- 4. Vista: Top 5 Productos (Solo Año Actual)
CREATE OR REPLACE VIEW vw_top_productos_anio_gyq AS
SELECT prd_nombre, cantidad_vendida, ingresos_totales
FROM (
    SELECT 
        p.PRD_NOMBRE, 
        SUM(h.PPC_CANTIDAD) AS CANTIDAD_VENDIDA,
        SUM(h.PAG_MONTO) AS INGRESOS_TOTALES
    FROM dw_admin.HECHOS_PEDIDOS@link_contingencia_gyq h
    JOIN dw_admin.DIM_PRODUCTO@link_contingencia_gyq p ON h.PRD_ID = p.PRD_ID
    JOIN dw_admin.DIM_TIEMPO@link_contingencia_gyq t ON h.FECHA = t.FECHA
    WHERE t.ANIO = EXTRACT(YEAR FROM SYSDATE)
    GROUP BY p.PRD_NOMBRE
    ORDER BY SUM(h.PPC_CANTIDAD) DESC
)
WHERE ROWNUM <= 5;