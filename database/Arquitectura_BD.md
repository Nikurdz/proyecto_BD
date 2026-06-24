# Especificación de Arquitectura de Base de Datos Distribuida (Oracle)
**Documento de Contexto y Directivas de Desarrollo para Antigravity IDE (AI Assistant)**

Este documento define la arquitectura, esquemas, conexiones y lógica de negocio (PL/SQL) implementada en un entorno de base de datos Oracle distribuida. 

**REGLA DE ORO PARA LA IA GENERATIVA:** El sistema a desarrollar debe construirse respetando estrictamente la delegación de procesamiento a la base de datos (Pushdown Computation). Queda terminantemente prohibido realizar filtrados, ordenamientos, búsquedas o validaciones de integridad referencial en la memoria del backend. **Todo** debe ejecutarse mediante consultas SQL directas y apoyarse en los disparadores (triggers) ya existentes en la base de datos.

---

## 1. Topología y Parámetros de Conexión

El entorno consta de dos nodos. **El sistema debe conectarse ÚNICA Y EXCLUSIVAMENTE al Nodo 1 (QYT)**. El acceso a los datos del Nodo 2 se realizará a través de enlaces de red de la base de datos (Database Links), siendo transparente para el código del aplicativo.

### Nodo 1: Producción y Origen (Punto de Conexión Único del Sistema)
* **Locación:** QYT (Quito)
* **Host / IP:** `192.168.56.81`
* **Puerto:** `1521`
* **Esquemas:** Este nodo contiene la información de Productos y Pagos.

### Nodo 2: Contingencia y Operaciones (Destino)
* **Locación:** GYQ (Guayas)
* **Host / IP:** `192.168.56.95`
* **Esquemas:** Este nodo contiene la información de Clientes, Pedidos y el detalle de los Pedidos.

---

## 2. Esquemas y Diccionario de Datos Distribuido

La base de datos está fragmentada. La IA debe formular los `JOINs` considerando esta distribución espacial.

### 2.1. Tablas en el Nodo 1 (QYT - Local)
Estas tablas residen en la IP de conexión principal:

* [cite_start]**`PRODUCTO`** [cite: 170]
  * [cite_start]`PRD_CODIGO` (VARCHAR2(10), PRIMARY KEY) [cite: 170]
  * [cite_start]`PRD_NOMBRE` (CHAR(30)) [cite: 170]
  * [cite_start]`PRD_CATEGORIA` (NUMBER(10), NOT NULL) [cite: 170]
  * [cite_start]`PRD_PRECIO` (NUMBER(12,2)) [cite: 170]
  * [cite_start]`PRD_EXISTENCIA` (NUMBER(10), CHECK >= 0) [cite: 170]

* [cite_start]**`PAGOS`** [cite: 168]
  * [cite_start]`PAG_CODIGO` (VARCHAR2(15), PRIMARY KEY) [cite: 168]
  * [cite_start]`PED_NUMERO` (NUMBER(12), NOT NULL) [cite: 168]
  * [cite_start]`PAG_MONTO` (NUMBER(12,2)) [cite: 168]
  * [cite_start]`PAG_FECHA` (DATE) [cite: 168]

### 2.2. Tablas en el Nodo 2 (GYQ - Remoto)
Para acceder a estas tablas desde el sistema (conectado a QYT), la IA debe utilizar el sufijo `@link_contingencia_gyq` en sus consultas SQL.

* [cite_start]**`CLIENTE`** [cite: 155]
  * [cite_start]`CLI_CED_RUC` (VARCHAR2(13), PRIMARY KEY) [cite: 155]
  * [cite_start]`CLI_NOMBRE` (VARCHAR2(60)) [cite: 155]
  * [cite_start]`CLI_DIRECCION` (VARCHAR2(60)) [cite: 155]
  * [cite_start]`CLI_TELEFONO` (VARCHAR2(10)) [cite: 155]
  * [cite_start]`CLI_CORREO` (VARCHAR2(60)) [cite: 155]

* [cite_start]**`PEDIDOCLIENTE`** [cite: 156]
  * [cite_start]`PED_NUMERO` (NUMBER(12), PRIMARY KEY) [cite: 156]
  * [cite_start]`CLI_CED_RUC` (VARCHAR2(13), NOT NULL) [cite: 156]
  * [cite_start]`PED_FECHA` (DATE) [cite: 156]
  * [cite_start]`PED_ESTADO` (VARCHAR2(20)) [cite: 156]

* [cite_start]**`PRODUCTO_PEDCLI`** (Detalle de Pedidos) [cite: 158]
  * `PRD_CODIGO` (VARCHAR2(10), NOT NULL) [cite: 158]
  * [cite_start]`PED_NUMERO` (NUMBER(12), NOT NULL) [cite: 158]
  * `PPC_CANTIDAD` (NUMBER(12,2)) [cite: 158]

---

## 3. Transaccionalidad y Disparadores (Triggers) Críticos

La base de datos maneja su propia integridad referencial simulada y replicación asíncrona mediante PL/SQL. **El aplicativo backend no debe intentar emular reglas de foreign keys ni actualizar múltiples bases de datos.** El aplicativo debe emitir el comando DML básico y dejar que los Triggers actúen. 

Si el Trigger detecta una violación, arrojará un error `raise_application_error` que el backend debe capturar (`try/catch`).

### 3.1. Gestión de Mutaciones (IntegrityPackage)
La base de datos utiliza un paquete PL/SQL llamado `IntegrityPackage` para manejar el nivel de anidamiento de los disparadores y evitar errores de tabla mutante durante actualizaciones complejas (`NestLevel`)[cite: 161, 162].

### 3.2. Disparador de Replicación Transparente (QYT -> GYQ)
El sistema backend nunca debe insertar manualmente en `PRODUCTO_PEDCLI` cuando se crea un producto. Existe el siguiente disparador activo en QYT que replica las operaciones DML hacia GYQ automáticamente mediante el DB Link:

```sql
CREATE OR REPLACE TRIGGER trg_replicacion_producto
AFTER INSERT OR UPDATE OR DELETE ON producto
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO producto_pedcli@link_contingencia_gyq (prd_codigo, ped_numero, ppc_cantidad)
        VALUES (:NEW.prd_codigo, 0, :NEW.prd_existencia);
        
    ELSIF UPDATING THEN
        UPDATE producto_pedcli@link_contingencia_gyq
        SET ppc_cantidad = :NEW.prd_existencia
        WHERE prd_codigo = :OLD.prd_codigo;
        
    ELSIF DELETING THEN
        DELETE FROM producto_pedcli@link_contingencia_gyq
        WHERE prd_codigo = :OLD.prd_codigo;
    END IF;
END;