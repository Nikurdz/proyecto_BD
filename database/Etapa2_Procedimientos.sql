-- ============================================================================
-- ETAPA 2: Procedimientos Almacenados (Thick Database) - Corregidos
-- Nodo: QYT (Local) | Conecta a: GYQ vía @link_contingencia_gyq
-- ============================================================================

-- 1. Procesar Checkout (Transacción Compleja)
CREATE OR REPLACE PROCEDURE sp_procesar_checkout (
    p_cli_ced_ruc   IN VARCHAR2,
    p_cli_nombre    IN VARCHAR2,
    p_cli_correo    IN VARCHAR2,
    p_direccion     IN VARCHAR2,
    p_total         IN NUMBER,
    p_pag_codigo    IN VARCHAR2,
    p_ped_numero    IN NUMBER,
    p_detalles_json IN CLOB
) AS
    v_count NUMBER;
BEGIN
    -- 1. Asegurar la existencia del cliente
    SELECT COUNT(*) INTO v_count FROM CLIENTE@link_contingencia_gyq WHERE CLI_CED_RUC = p_cli_ced_ruc;
    IF v_count = 0 THEN
        INSERT INTO CLIENTE@link_contingencia_gyq (CLI_CED_RUC, CLI_NOMBRE, CLI_CORREO)
        VALUES (p_cli_ced_ruc, p_cli_nombre, p_cli_correo);
    END IF;

    -- 2. Insertar Cabecera de Pedido (GYQ)
    INSERT INTO PEDIDOCLIENTE@link_contingencia_gyq (PED_NUMERO, CLI_CED_RUC, PED_FECHA, PED_ESTADO, PED_DIRECCION)
    VALUES (p_ped_numero, p_cli_ced_ruc, SYSDATE, 'Pendiente', p_direccion);

    -- 3. Parsear JSON de detalles
    FOR item IN (
        SELECT jt.productoId, jt.cantidad, jt.nuevoStock
        FROM JSON_TABLE(p_detalles_json, '$[*]'
            COLUMNS (
                productoId VARCHAR2(50) PATH '$.productoId',
                cantidad NUMBER PATH '$.cantidad',
                nuevoStock NUMBER PATH '$.nuevoStock'
            )
        ) jt
    ) LOOP
        -- Insertar detalle (GYQ)
        INSERT INTO PRODUCTO_PEDCLI@link_contingencia_gyq (PRD_CODIGO, PED_NUMERO, PPC_CANTIDAD)
        VALUES (item.productoId, p_ped_numero, item.cantidad);

        -- Actualizar stock local (QYT)
        UPDATE PRODUCTO 
        SET PRD_EXISTENCIA = item.nuevoStock 
        WHERE PRD_CODIGO = item.productoId;
    END LOOP;

    -- 4. Insertar Pago (QYT local)
    INSERT INTO PAGOS (PAG_CODIGO, PED_NUMERO, PAG_MONTO, PAG_FECHA)
    VALUES (p_pag_codigo, p_ped_numero, p_total, SYSDATE);

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- 2. Actualizar Estado de Pedido
CREATE OR REPLACE PROCEDURE sp_actualizar_estado_pedido (
    p_ped_numero IN NUMBER,
    p_estado     IN VARCHAR2
) AS
BEGIN
    UPDATE PEDIDOCLIENTE@link_contingencia_gyq 
    SET PED_ESTADO = p_estado 
    WHERE PED_NUMERO = p_ped_numero;
    
    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Pedido no encontrado para actualizar.');
    END IF;
    
    COMMIT;
END;
/

-- 3. Gestión de Usuarios: Registro (Se mapearon los nombres correctos de las columnas)
CREATE OR REPLACE PROCEDURE sp_registrar_cliente (
    p_ced_ruc         IN VARCHAR2,
    p_nombre          IN VARCHAR2,
    p_correo          IN VARCHAR2,
    p_hash_contrasena IN VARCHAR2,
    p_token           IN VARCHAR2
) AS
BEGIN
    INSERT INTO CLIENTE@link_contingencia_gyq 
    (CLI_CED_RUC, CLI_NOMBRE, CLI_CORREO, CLI_PASSWORD, TOKEN_VERIFICACION, VERIFICADO, CLI_ROL)
    VALUES (p_ced_ruc, p_nombre, p_correo, p_hash_contrasena, p_token, 0, 'cliente');
    COMMIT;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20002, 'El cliente ya se encuentra registrado.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- 4. Gestión de Usuarios: Verificación (Se corrigió TOKEN_VERIFICACION)
CREATE OR REPLACE PROCEDURE sp_verificar_cliente (
    p_token IN VARCHAR2
) AS
BEGIN
    UPDATE CLIENTE@link_contingencia_gyq
    SET VERIFICADO = 1, TOKEN_VERIFICACION = NULL
    WHERE TOKEN_VERIFICACION = p_token;
    
    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Token inválido o expirado.');
    END IF;
    COMMIT;
END;
/