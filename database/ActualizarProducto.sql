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

    -- Update PROD_BODGA using MERGE
    MERGE INTO PROD_BODGA pb
    USING (SELECT p_prd_codigo AS prd_codigo, 'SUC1' AS bod_codigo, p_stock AS stock FROM dual) src
    ON (pb.PRD_CODIGO = src.prd_codigo AND pb.BOD_CODIGO = src.bod_codigo)
    WHEN MATCHED THEN
        UPDATE SET pb.PRB_EXISTENCIA = src.stock
    WHEN NOT MATCHED THEN
        INSERT (PRD_CODIGO, BOD_CODIGO, PRB_EXISTENCIA)
        VALUES (src.prd_codigo, src.bod_codigo, src.stock);

    COMMIT;
END;
/
