# 📖 Manual Técnico de Base de Datos - Naturart Foods

Este documento detalla exhaustivamente toda la arquitectura, configuración, evolución y consumo del modelo de base de datos de Naturart Foods. Se consolida aquí toda la información referente a la estructura distribuida, los patrones de seguridad (Thick Database) y la capa analítica (Data Warehouse).

---

## 🏗️ 1. Topología y Diseño Base (Scripts Originales)

El sistema nació de una topología distribuida clásica (Taller 6.1) dividida en dos nodos principales que se comunican mediante un Database Link (`@link_contingencia_gyq`).

### Nodo QYT (192.168.56.81) - `Script QYT creador taller 6.1.sql`
Este es el servidor principal que enfrenta las peticiones de los usuarios. Originalmente alojaba:
- **`PRODUCTO`**: El catálogo inicial, aunque carecía de campos esenciales para E-commerce.
- **`PAGOS`**: Tabla que registra la facturación y los montos pagados. Depende de las ventas generadas y aprobadas.
- **`IntegrityPackage`**: Paquete PL/SQL para manejar el nivel de anidación de *triggers* y mantener la integridad relacional de forma manual.

### Nodo GYQ - `Script GYQ creador taller 6.1.sql`
Servidor de contingencia y almacenamiento de historiales.
- **`CLIENTE`**: Almacenaba únicamente datos demográficos crudos (Cédula, nombre, correo).
- **`PEDIDOCLIENTE`** y **`PRODUCTO_PEDCLI`**: La cabecera y el detalle de los pedidos, almacenados aquí por políticas de respaldo histórico.

---

## 🛠️ 2. Evolución del Esquema (Modificaciones para E-Commerce)

Para convertir la base de datos cruda en una plataforma de comercio electrónico funcional y moderna, se aplicaron *ALTER TABLES* y se crearon nuevos objetos.

### En QYT (Origen) - `Script Nodo Origen QYT.sql`
1. **Actualización de Productos**: Se inyectaron a la tabla `PRODUCTO` campos visuales (URL de imagen, descripción larga, porcentaje de descuento y fecha de creación). Se cambió el tipo de dato de categoría a `VARCHAR2(50)`.
2. **Normalización de Categorías**: Se creó la tabla `CATEGORIAS` para listar las opciones dinámicamente.
3. **Módulo de Favoritos**: Se creó la tabla `FAVORITOS` (ID Cliente, ID Producto). Debido a que Cliente reside en GYQ, se implementó un **Disparador (Trigger) `TIB_FAVORITOS_CLIENTE`** que valida de forma síncrona si el usuario existe consultando el DB Link antes de permitir la inserción.

### En GYQ (Contingencia) - `Script Nodo Contingencia (GYQ).sql`
1. **Seguridad y Autenticación**: La tabla `CLIENTE` recibió una fuerte actualización agregando `CLI_PASSWORD` (para hashes Bcrypt), `CLI_ROL` (administrador/cliente), y flags para la validación por correo (`VERIFICADO`, `TOKEN_VERIFICACION`).
2. **Logística Operativa**: Se añadieron campos en `PEDIDOCLIENTE` para la dirección de envío real, y en `PRODUCTO_PEDCLI` para registrar el precio unitario exacto en el momento de la venta, previniendo alteraciones de precio futuro.

---

## 🛡️ 3. Arquitectura "Thick Database" (Migración Anti Inyección SQL)

Por motivos de seguridad (Erradicación de sentencias crudas en Node.js), se desarrollaron abstracciones completas en el nodo principal (QYT).

### Vistas Operacionales - `Etapa1_Vistas.sql`
Estas vistas funcionan como la capa de lectura (GET requests) de Node.js, aislando la complejidad de red.
- **`vw_productos_qyt`** y **`vw_categorias_qyt`**: Consultan el catálogo local normalizando el nombre de columnas para el Frontend.
- **`vw_clientes_gyq`**: Abstracción del usuario que vive en Guayas.
- **`vw_mis_pedidos_gyq` / `vw_admin_pedidos_gyq`**: Son la joya de la lectura relacional. Hacen un *JOIN* distribuyendo carga: cruzan `PEDIDOCLIENTE` (en GYQ) con `PAGOS` (en QYT) y devuelven una sábana de datos procesada para Node.js.
- **`vw_favoritos_gyq`**: Cruza la tabla relacional local con los detalles enriquecidos del producto.

### Procedimientos Almacenados (PL/SQL) - `Etapa2_Procedimientos.sql`
Asumen el rol activo en las operaciones POST, PUT y DELETE transaccionales. Node.js se limita a invocar `BEGIN sp_nombre_procedimiento(); END;`.
- **`sp_procesar_checkout`**: El procedimiento más complejo. Inserta el pedido remoto, valida el cliente, procesa un arreglo JSON (`CLOB`) enviado por Node usando `JSON_TABLE` nativo de Oracle, para descontar iterativamente el stock localmente e insertar el detalle remoto en una sola transacción `ACID` que soporta `ROLLBACK` seguro.
- **`sp_actualizar_estado_pedido`**: Encapsula el `UPDATE` sobre la tabla remota previniendo bloqueos prolongados.
- **`sp_registrar_cliente` / `sp_verificar_cliente`**: Proveen inserción y validación de tokens manejando las excepciones de violaciones únicas de forma segura.

---

## 📉 4. Data Warehouse: El Modelo Estrella Analítico

Para no saturar las tablas transaccionales (OLTP) durante la generación de reportes financieros del Admin Dashboard, se desplegó un esquema OLAP (`dw_admin`).

### El Esquema (OLAP) - `Estructura del Modelo Estrella.sql`
- **`DIM_CLIENTE`**, **`DIM_PRODUCTO`**, **`DIM_TIEMPO`**: Dimensiones estáticas y de lenta variación (SCD) que pre-calculan atributos demográficos, características de producto y extracciones de fechas (meses, años, días de la semana).
- **`HECHOS_PEDIDOS`**: La tabla central que une las llaves primarias de las dimensiones y concentra las métricas agregables de forma ultra-rápida (`PPC_CANTIDAD` y `PAG_MONTO`).

### Las Vistas Analíticas - `Vistas_DW_QYT.sql`
Alojadas en QYT, estas vistas hacen el cómputo final sobre el Modelo Estrella (ubicado en GYQ) garantizando que ninguna lógica de agrupamiento (`GROUP BY`, `SUM`) exista en JavaScript.
1. **`vw_ventas_mes_historico_gyq`**: Devuelve los ingresos y cantidad vendida de todos los años disponibles (Data histórica total).
2. **`vw_ventas_mes_anio_actual_gyq`**: Filtra mediante `EXTRACT(YEAR FROM SYSDATE)` los resultados analíticos únicamente al año en curso.
3. **`vw_top_productos_historico_gyq`** / **`vw_top_productos_anio_gyq`**: Pre-ordenan y extraen de forma sub-consultada (`ROWNUM <= 5`) los 5 artículos más vendidos para pintar directamente el diagrama de pastel en React.

---
*Este manual sirve como constancia técnica de diseño y debe entregarse a cualquier nuevo DBA o desarrollador Backend que ingrese al equipo de Naturart Foods.*
