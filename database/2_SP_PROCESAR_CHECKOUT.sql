-- ====================================================================
-- PARTE 2: SP_PROCESAR_CHECKOUT (THICK DATABASE PATTERN)
-- ====================================================================
-- Este procedimiento almacena toda la lógica de negocio de la facturación.
-- Centraliza la creación de cabecera, iteración de carrito, cálculos de
-- totales, actualización de stock y limpieza de carrito en una sola
-- transacción atómica.
-- ====================================================================

CREATE OR REPLACE PROCEDURE SP_PROCESAR_CHECKOUT(
    p_cli_ci_ruc IN VARCHAR2,
    p_suc_codigo IN VARCHAR2,
    p_ple_cedula IN VARCHAR2,
    p_bod_codigo IN VARCHAR2,
    p_total_factura OUT NUMBER
)
AS
    v_fac_numero NUMBER;
    v_total NUMBER := 0;
    v_subtotal NUMBER;
    v_stock_actual INTEGER;
BEGIN
    -- 1. Calcular el nuevo número de factura
    SELECT NVL(MAX(FAC_NUMERO), 0) + 1 INTO v_fac_numero FROM FACTURA;

    -- 2. Crear la cabecera de la factura con estado 'V' (Vendido)
    INSERT INTO FACTURA (
        FAC_NUMERO, 
        SUC_CODIGO, 
        PLE_CEDULA, 
        CLI_CI_RUC, 
        FAC_FECHA, 
        FAC_ESTADO
    ) VALUES (
        v_fac_numero, 
        p_suc_codigo, 
        p_ple_cedula, 
        p_cli_ci_ruc, 
        SYSDATE, 
        'V'
    );

    -- 3. Iterar los productos que el cliente tiene en su carrito
    FOR item IN (
        SELECT C.PRD_CODIGO, C.PCA_CANTIDAD, P.PRD_PRECIO
        FROM PROD_CARRITO C
        JOIN PRODUCTO P ON C.PRD_CODIGO = P.PRD_CODIGO
        WHERE C.CRR_CED_RUC_CLI = p_cli_ci_ruc
    ) LOOP
        -- 3.1. Calcular subtotal de la línea y sumar al gran total
        v_subtotal := item.PCA_CANTIDAD * item.PRD_PRECIO;
        v_total := v_total + v_subtotal;

        -- 3.2. Insertar Detalle de la factura
        INSERT INTO DETALLE_FACTURA (
            FAC_NUMERO, 
            PRD_CODIGO, 
            DFA_CANTIDAD, 
            DFA_PRECIO_UNI,
            DFA_COSTO_UNI
        ) VALUES (
            v_fac_numero, 
            item.PRD_CODIGO, 
            item.PCA_CANTIDAD, 
            item.PRD_PRECIO,
            0 -- O el costo real si la arquitectura lo requiere
        );

        -- 3.3. Restar Stock mediante UPDATE directo y recuperar el nuevo saldo
        UPDATE PROD_BODGA 
        SET PRB_EXISTENCIA = PRB_EXISTENCIA - item.PCA_CANTIDAD
        WHERE PRD_CODIGO = item.PRD_CODIGO AND BOD_CODIGO = p_bod_codigo
        RETURNING PRB_EXISTENCIA INTO v_stock_actual;

        -- 3.4. Validar Stock Negativo
        IF v_stock_actual < 0 THEN
            RAISE_APPLICATION_ERROR(-20001, 'Stock insuficiente para el producto ' || item.PRD_CODIGO);
        END IF;
    END LOOP;

    -- Si el total es 0, significa que el bucle FOR no iteró (carrito vacío).
    IF v_total = 0 THEN
         RAISE_APPLICATION_ERROR(-20002, 'El carrito está vacío para el cliente ' || p_cli_ci_ruc);
    END IF;

    -- 4. Asignar el total acumulado al parámetro de salida (OUT)
    p_total_factura := v_total;

    -- 5. Insertar el Pago asociado a la factura
    INSERT INTO PAGOS (PAG_CODIGO, FAC_NUMERO, PAG_MONTO, PAG_FECHA)
    VALUES ('PAG-' || v_fac_numero, v_fac_numero, v_total, SYSDATE);

    -- 6. Limpiar el carrito del cliente
    DELETE FROM PROD_CARRITO WHERE CRR_CED_RUC_CLI = p_cli_ci_ruc;

    -- 7. Confirmar Transacción Atómica
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        -- Revertir cualquier inserción, actualización o eliminación en caso de error
        ROLLBACK;
        RAISE;
END;
/
