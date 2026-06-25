-- ====================================================================
-- ETAPA 4: Stored Procedures Adicionales (Thick Database)
-- ====================================================================

-- 1. SP_ACTUALIZAR_TOKEN_CLIENTE
CREATE OR REPLACE PROCEDURE SP_ACTUALIZAR_TOKEN_CLIENTE(
    p_id IN VARCHAR2,
    p_token IN VARCHAR2
)
AS
BEGIN
    UPDATE CLIENTE@link_contingencia_gyq 
    SET TOKEN_VERIFICACION = p_token 
    WHERE CLI_CED_RUC = p_id;
    COMMIT;
END;
/

-- 2. SP_RESTABLECER_PASSWORD
CREATE OR REPLACE PROCEDURE SP_RESTABLECER_PASSWORD(
    p_id IN VARCHAR2,
    p_password IN VARCHAR2,
    p_token IN VARCHAR2
)
AS
BEGIN
    UPDATE CLIENTE@link_contingencia_gyq 
    SET CLI_PASSWORD = p_password, TOKEN_VERIFICACION = p_token 
    WHERE CLI_CED_RUC = p_id;
    COMMIT;
END;
/

-- 3. SP_ACTUALIZAR_ROL_CLIENTE
CREATE OR REPLACE PROCEDURE SP_ACTUALIZAR_ROL_CLIENTE(
    p_id IN VARCHAR2,
    p_rol IN VARCHAR2
)
AS
BEGIN
    UPDATE CLIENTE@link_contingencia_gyq 
    SET CLI_ROL = p_rol 
    WHERE CLI_CED_RUC = p_id;
    COMMIT;
END;
/

-- 4. SP_CREAR_PRODUCTO
CREATE OR REPLACE PROCEDURE SP_CREAR_PRODUCTO(
    p_prd_codigo IN VARCHAR2,
    p_titulo IN VARCHAR2,
    p_descripcion IN VARCHAR2,
    p_precio IN NUMBER,
    p_stock IN NUMBER,
    p_imagen_url IN VARCHAR2,
    p_categoria IN VARCHAR2,
    p_descuento_pct IN NUMBER
)
AS
BEGIN
    INSERT INTO PRODUCTO (PRD_CODIGO, PRD_NOMBRE, PRD_DESCRIPCION, PRD_PRECIO, PRD_EXISTENCIA, PRD_IMAGEN_URL, PRD_CATEGORIA, PRD_DESCUENTO_PCT)
    VALUES (p_prd_codigo, p_titulo, p_descripcion, p_precio, p_stock, p_imagen_url, p_categoria, p_descuento_pct);
    COMMIT;
END;
/

-- 5. SP_ACTUALIZAR_PRODUCTO
CREATE OR REPLACE PROCEDURE SP_ACTUALIZAR_PRODUCTO(
    p_prd_codigo IN VARCHAR2,
    p_titulo IN VARCHAR2,
    p_descripcion IN VARCHAR2,
    p_precio IN NUMBER,
    p_stock IN NUMBER,
    p_imagen_url IN VARCHAR2,
    p_categoria IN VARCHAR2,
    p_descuento_pct IN NUMBER
)
AS
BEGIN
    UPDATE PRODUCTO
    SET PRD_NOMBRE = p_titulo,
        PRD_DESCRIPCION = p_descripcion,
        PRD_PRECIO = p_precio,
        PRD_EXISTENCIA = p_stock,
        PRD_IMAGEN_URL = p_imagen_url,
        PRD_CATEGORIA = p_categoria,
        PRD_DESCUENTO_PCT = p_descuento_pct
    WHERE PRD_CODIGO = p_prd_codigo;
    COMMIT;
END;
/

-- 6. SP_ELIMINAR_PRODUCTO
CREATE OR REPLACE PROCEDURE SP_ELIMINAR_PRODUCTO(
    p_prd_codigo IN VARCHAR2
)
AS
BEGIN
    DELETE FROM PRODUCTO WHERE PRD_CODIGO = p_prd_codigo;
    COMMIT;
END;
/

-- 7. SP_AGREGAR_FAVORITO
CREATE OR REPLACE PROCEDURE SP_AGREGAR_FAVORITO(
    p_cli_ced_ruc IN VARCHAR2,
    p_prd_codigo IN VARCHAR2
)
AS
BEGIN
    INSERT INTO FAVORITOS (cli_ced_ruc, prd_codigo) 
    VALUES (p_cli_ced_ruc, p_prd_codigo);
    COMMIT;
END;
/

-- 8. SP_ELIMINAR_FAVORITO
CREATE OR REPLACE PROCEDURE SP_ELIMINAR_FAVORITO(
    p_cli_ced_ruc IN VARCHAR2,
    p_prd_codigo IN VARCHAR2
)
AS
BEGIN
    DELETE FROM FAVORITOS 
    WHERE cli_ced_ruc = p_cli_ced_ruc AND prd_codigo = p_prd_codigo;
    COMMIT;
END;
/

-- 9. SP_CREAR_CATEGORIA
CREATE OR REPLACE PROCEDURE SP_CREAR_CATEGORIA(
    p_nombre IN VARCHAR2,
    p_cat_codigo IN VARCHAR2
)
AS
BEGIN
    INSERT INTO CATEGORIA (NOMBRE, CAT_CODIGO, CAT_DESCRIPCION) 
    VALUES (p_nombre, p_cat_codigo, p_nombre);
    COMMIT;
END;
/
