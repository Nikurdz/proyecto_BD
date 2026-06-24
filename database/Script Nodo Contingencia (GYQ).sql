-- ==============================================================
-- ACTUALIZACIONES EN GYQ (192.168.56.95)
-- ==============================================================

-- 1. Añadir columnas a CLIENTE (Autenticación y Node.js Token)
ALTER TABLE CLIENTE ADD (
    CLI_PASSWORD VARCHAR2(255),
    CLI_ROL VARCHAR2(20) DEFAULT 'cliente',
    VERIFICADO NUMBER(1) DEFAULT 0 NOT NULL,
    TOKEN_VERIFICACION VARCHAR2(255)
);

COMMENT ON COLUMN CLIENTE.VERIFICADO IS '0: No verificado, 1: Verificado';
COMMENT ON COLUMN CLIENTE.TOKEN_VERIFICACION IS 'Token generado desde backend (Node.js/crypto)';

-- 2. Añadir columnas a PEDIDOCLIENTE
ALTER TABLE PEDIDOCLIENTE ADD (
    PED_DIRECCION VARCHAR2(255)
);

-- 3. Añadir columnas al detalle de pedidos
ALTER TABLE PRODUCTO_PEDCLI ADD (
    PPC_PRECIO_UNITARIO NUMBER(12,2)
);