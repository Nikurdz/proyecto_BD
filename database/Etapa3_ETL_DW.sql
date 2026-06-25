-- ============================================================================
-- ETAPA 3: Extracción, Transformación y Carga (ETL) para Data Warehouse
-- Nodo de Ejecución: QYT (Local)
-- Destino: Esquema dw_admin en GYQ vía @link_contingencia_gyq
-- ============================================================================

CREATE OR REPLACE PROCEDURE sp_etl_carga_dw AS
BEGIN
    -- =======================================================
    -- 1. CARGA DE DIMENSIONES (Carga Delta / Merge)
    -- =======================================================
    
    -- 1.1 Dimensión Tiempo (Se insertan solo las fechas nuevas de los pedidos)
    FOR rec IN (
        SELECT DISTINCT TRUNC(PED_FECHA) AS FECHA,
               EXTRACT(DAY FROM PED_FECHA) AS DIA,
               EXTRACT(MONTH FROM PED_FECHA) AS MES,
               EXTRACT(YEAR FROM PED_FECHA) AS ANIO,
               TO_CHAR(PED_FECHA, 'Day') AS DIA_SEMANA
        FROM PEDIDOCLIENTE@link_contingencia_gyq
        WHERE TRUNC(PED_FECHA) NOT IN (SELECT FECHA FROM dw_admin.DIM_TIEMPO@link_contingencia_gyq)
    ) LOOP
        INSERT INTO dw_admin.DIM_TIEMPO@link_contingencia_gyq (FECHA, DIA, MES, ANIO, DIA_SEMANA)
        VALUES (rec.FECHA, rec.DIA, rec.MES, rec.ANIO, rec.DIA_SEMANA);
    END LOOP;

    -- 1.2 Dimensión Producto (Actualiza los existentes, inserta los nuevos)
    FOR rec IN (
        SELECT PRD_CODIGO, PRD_NOMBRE, PRD_PRECIO 
        FROM PRODUCTO
        WHERE PRD_NOMBRE IS NOT NULL AND TRIM(PRD_NOMBRE) IS NOT NULL
    ) LOOP
        UPDATE dw_admin.DIM_PRODUCTO@link_contingencia_gyq 
        SET PRD_NOMBRE = rec.PRD_NOMBRE, PRD_PRECIO = rec.PRD_PRECIO
        WHERE PRD_ID = rec.PRD_CODIGO;
        
        IF SQL%ROWCOUNT = 0 THEN
            INSERT INTO dw_admin.DIM_PRODUCTO@link_contingencia_gyq (PRD_ID, PRD_NOMBRE, PRD_PRECIO)
            VALUES (rec.PRD_CODIGO, rec.PRD_NOMBRE, rec.PRD_PRECIO);
        END IF;
    END LOOP;

    -- 1.3 Dimensión Cliente
    FOR rec IN (
        SELECT CLI_CED_RUC, CLI_NOMBRE, 'No especificada' AS CLI_DIRECCION, 'No especificado' AS CLI_TELEFONO, CLI_CORREO 
        FROM CLIENTE@link_contingencia_gyq
    ) LOOP
        UPDATE dw_admin.DIM_CLIENTE@link_contingencia_gyq
        SET CLI_NOMBRE = rec.CLI_NOMBRE, CLI_CORREO = rec.CLI_CORREO
        WHERE CLI_ID = rec.CLI_CED_RUC;

        IF SQL%ROWCOUNT = 0 THEN
            INSERT INTO dw_admin.DIM_CLIENTE@link_contingencia_gyq (CLI_ID, CLI_NOMBRE, CLI_DIRECCION, CLI_TELEFONO, CLI_CORREO)
            VALUES (rec.CLI_CED_RUC, rec.CLI_NOMBRE, rec.CLI_DIRECCION, rec.CLI_TELEFONO, rec.CLI_CORREO);
        END IF;
    END LOOP;

    -- =======================================================
    -- 2. CARGA DE TABLA DE HECHOS (Full Load o Delta)
    -- =======================================================
    
    -- Para este esquema y evitar duplicados sin romper la PK Identity, 
    -- usamos una lógica UPSERT (Update or Insert) sobre la tabla de Hechos.
    
    FOR rec IN (
        SELECT 
            pc.CLI_CED_RUC,
            pc.PED_NUMERO,
            pp.PRD_CODIGO,
            pp.PPC_CANTIDAD,
            (pp.PPC_CANTIDAD * pr.PRD_PRECIO) AS PAG_MONTO,
            TRUNC(pc.PED_FECHA) AS FECHA
        FROM PEDIDOCLIENTE@link_contingencia_gyq pc
        JOIN PRODUCTO_PEDCLI@link_contingencia_gyq pp ON pc.PED_NUMERO = pp.PED_NUMERO
        JOIN PRODUCTO pr ON pp.PRD_CODIGO = pr.PRD_CODIGO
        WHERE pc.PED_ESTADO = 'PAGADO' 
    ) LOOP
        -- Intenta actualizar el registro si ya existe
        UPDATE dw_admin.HECHOS_PEDIDOS@link_contingencia_gyq
        SET PPC_CANTIDAD = rec.PPC_CANTIDAD, PAG_MONTO = rec.PAG_MONTO
        WHERE PED_ID = rec.PED_NUMERO AND PRD_ID = rec.PRD_CODIGO;
        
        -- Si no existía, lo inserta
        IF SQL%ROWCOUNT = 0 THEN
            INSERT INTO dw_admin.HECHOS_PEDIDOS@link_contingencia_gyq 
            (CLI_ID, PED_ID, PRD_ID, PPC_CANTIDAD, PAG_MONTO, FECHA)
            VALUES 
            (rec.CLI_CED_RUC, rec.PED_NUMERO, rec.PRD_CODIGO, rec.PPC_CANTIDAD, rec.PAG_MONTO, rec.FECHA);
        END IF;
    END LOOP;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/
