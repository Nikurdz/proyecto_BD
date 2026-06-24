# 🍃 Naturart Foods

![Naturart Foods](https://via.placeholder.com/1200x300.png?text=Naturart+Foods+-+E-commerce+%26+Data+Warehouse)

Naturart Foods es una plataforma integral de E-commerce y Análisis de Datos (Data Warehouse) diseñada para la gestión y venta de productos naturales y orgánicos. El proyecto garantiza altos estándares de seguridad y escalabilidad, delegando la lógica de negocio y las transacciones críticas al motor de base de datos Oracle a través de la arquitectura **Thick Database**.

---

## 🏗️ Arquitectura (MVC y Flujo de Datos)

El sistema está diseñado bajo el patrón **Modelo-Vista-Controlador (MVC)**, adaptado para soportar una base de datos distribuida y un Data Warehouse:

### 1. Modelo (Base de Datos Oracle Distribuida - Thick Database)
En Naturart Foods, el modelo de datos no es una entidad pasiva. Toda la lógica relacional compleja, la agregación analítica, y las transacciones `ACID` están delegadas a Oracle mediante el uso extensivo de enlaces de base de datos (DB Links).

El almacenamiento está dividido geográficamente:
- **Nodo QYT (Local / Origen):** Almacena el catálogo de productos (`PRODUCTO`), las categorías y maneja las transacciones locales (`PAGOS`). Funciona como el puente principal de acceso para Node.js.
- **Nodo GYQ (Contingencia / Data Warehouse):** Almacena de forma remota la información sensible de `CLIENTE`, `PEDIDOCLIENTE` (y sus detalles), así como el esquema analítico del DW (`dw_admin`).

### 2. Controlador (Backend en Node.js + Express)
Sirve como puente de comunicación, capa de validación HTTP, y gestor de seguridad (JWT, encriptación Bcrypt, correos electrónicos con Nodemailer). En esta arquitectura, **Node.js es agnóstico a las tablas reales**; no contiene consultas SQL crudas complejas. Solo consume Vistas precalculadas y ejecuta *Stored Procedures* (SPs) pasando los datos en formato limpio o arreglos JSON.

### 3. Vista (Frontend en React.js + Vite)
La interfaz de usuario es una SPA (Single Page Application) encargada de consumir la API REST del backend para renderizar la tienda, el panel de clientes, el carrito de compras y el **Admin Dashboard**.

---

## 📊 Modificaciones Estructurales y Data Warehouse

A lo largo del desarrollo, la base de datos original sufrió evoluciones clave para soportar autenticación y análisis:

### Modificaciones a Tablas Originales
- **En el Nodo QYT (Script Nodo Origen QYT.sql):** Se alteró la tabla `PRODUCTO` para incluir URLs de imágenes, descripciones largas, descuentos y fechas. Se creó la tabla `CATEGORIAS` y la tabla relacional `FAVORITOS` que implementa un *Trigger* PL/SQL para validar la existencia del cliente cruzando el enlace hacia GYQ.
- **En el Nodo GYQ (Script Nodo Contingencia GYQ.sql):** Se agregaron columnas críticas de seguridad a `CLIENTE` (`CLI_PASSWORD`, `CLI_ROL`, `VERIFICADO`, `TOKEN_VERIFICACION`) y columnas operativas de direcciones y precios históricos a `PEDIDOCLIENTE` y su detalle.

### Estructura del Modelo Estrella (Estructura del Modelo Estrella.sql)
Para el módulo de analítica, se abandonó el modelo relacional tradicional en favor de un esquema OLAP (On-Line Analytical Processing):
- **Tabla de Hechos (`HECHOS_PEDIDOS`):** Centraliza las transacciones de ventas con métricas precalculadas (`PPC_CANTIDAD`, `PAG_MONTO`).
- **Dimensiones:**
  - `DIM_CLIENTE`: Descriptores demográficos del comprador.
  - `DIM_PRODUCTO`: Histórico de nombres y precios de productos.
  - `DIM_TIEMPO`: Granularidad por fechas (Día, Mes, Año) vital para los reportes financieros.

---

## 🛡️ Capa Thick Database: Vistas y Procedimientos

Para erradicar la Inyección SQL y el cómputo pesado en Node.js, se encapsuló todo en Oracle:

### Vistas Analíticas del DW (Vistas_DW_QYT.sql)
Implementadas en QYT pero apuntando a las tablas de hechos de GYQ. Node.js las consume exclusivamente en su `analyticsController.js`:
- `vw_ventas_mes_historico_gyq` y `vw_ventas_mes_anio_actual_gyq`: Usadas para renderizar los gráficos de barras de ingresos mensuales.
- `vw_top_productos_historico_gyq` y `vw_top_productos_anio_gyq`: Usadas para renderizar el gráfico tipo pastel de los productos más vendidos.

### Vistas Operacionales (Etapa1_Vistas.sql)
Remplazan todo uso de `SELECT * FROM tabla` en Node.js:
- `vw_productos_qyt` y `vw_categorias_qyt`: Consumidas por `productController.js` para renderizar el catálogo.
- `vw_clientes_gyq`: Usada en `authController.js` para login y verificación.
- `vw_mis_pedidos_gyq` y `vw_admin_pedidos_gyq`: Consumidas por `orderController.js` para mostrar el historial de compras unificando QYT y GYQ.
- `vw_favoritos_gyq`: Usada para listar la *wishlist* de productos.

### Procedimientos Almacenados (Etapa2_Procedimientos.sql)
Remplazan la lógica transaccional de escritura (`INSERT`/`UPDATE`):
- `sp_procesar_checkout`: Llamado al finalizar la compra. Inserta el pedido remoto, el pago local y parsea internamente el carrito usando `JSON_TABLE`.
- `sp_actualizar_estado_pedido`: Cambia el estado (Ej. Enviado, Entregado).
- `sp_registrar_cliente` y `sp_verificar_cliente`: Manejo de registro seguro de usuarios y confirmación de correos.

---

## 📡 Manejo de Peticiones (API REST)

- 🟢 **GET (Lectura Segura):** Consumo exclusivo de Vistas (`vw_...`) para obtener catálogos, perfiles o analíticas.
- 🟡 **POST (Transacciones):** Envío de cargas útiles (Payloads) a Procedimientos Almacenados (`sp_...`) para pagos y registros.
- 🟠 **PUT (Actualización):** Modificación atómica de roles de usuario o estados de pedido.
- 🔴 **DELETE (Eliminación):** Quitar elementos físicos o relacionales como los productos de favoritos.

---

## 🔑 Credenciales por Defecto (Administración)

> **Usuario:** `admin@naturart.com`  
> **Contraseña:** `admin123`

---

## 🚀 Guía de Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone https://github.com/Nikurdz/proyecto_BD.git
cd naturart-foods
```

### 2. Configuración del Backend (Node.js)
```bash
cd backend
npm install
cp .env.example .env
```
Edita `.env` con tus credenciales Oracle DB, Nodemailer y firma JWT.

### 3. Configuración del Frontend (React)
```bash
cd ../frontend
npm install
```

### 4. Ejecución del Entorno
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```
La aplicación web estará disponible en [http://localhost:5173](http://localhost:5173).
