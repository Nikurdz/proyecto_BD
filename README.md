# 🍃 Naturart Foods

![Naturart Foods](https://via.placeholder.com/1200x300.png?text=Naturart+Foods+-+E-commerce+%26+Data+Warehouse)

Naturart Foods es una plataforma integral de E-commerce y Análisis de Datos (Data Warehouse) diseñada para la gestión y venta de productos naturales y orgánicos. El proyecto garantiza altos estándares de seguridad y escalabilidad, delegando la lógica de negocio y las transacciones críticas al motor de base de datos Oracle a través de la arquitectura **Thick Database**.

---

## 🏗️ Arquitectura (MVC y Flujo de Datos)

El sistema está diseñado bajo el patrón **Modelo-Vista-Controlador (MVC)**, adaptado para soportar una base de datos distribuida y un Data Warehouse:

### 1. Modelo (Base de Datos Oracle Distribuida - Thick Database)
En Naturart Foods, el modelo de datos no es una entidad pasiva. Toda la lógica relacional compleja, la agregación analítica, y las transacciones `ACID` están delegadas a Oracle mediante:
- **Nodo QYT (Local):** Almacena el catálogo de productos y maneja las transacciones monetarias locales (pagos). Funciona como el puente principal de acceso.
- **Nodo GYQ (Contingencia/Data Warehouse):** Almacena de forma remota y segura la información de Clientes, Historiales de Pedido y el esquema analítico (`dw_admin`) de Modelo Estrella.
- **Vistas y Procedimientos Almacenados (PL/SQL):** Eliminan por completo el uso de consultas SQL crudas en el servidor web. Los JOINs, actualizaciones de inventario y lógicas de Checkout se ejecutan íntegramente de lado de la base de datos a través del `Database Link` (`@link_contingencia_gyq`).

### 2. Controlador (Backend en Node.js + Express)
Sirve como puente de comunicación, capa de validación HTTP, y gestor de seguridad (JWT, encriptación Bcrypt, correos electrónicos con Nodemailer). Node.js es **agnóstico a las tablas reales**; solo consume las Vistas precalculadas y ejecuta los Stored Procedures con la data limpia en formato JSON o variables de unión.

### 3. Vista (Frontend en React.js + Vite)
La interfaz de usuario es una SPA (Single Page Application) rápida y dinámica, encargada de consumir la API REST del backend para renderizar la tienda, el panel de clientes, el carrito de compras y el sofisticado **Admin Dashboard** analítico.

---

## 📡 Manejo de Peticiones (API REST)

El Backend de Naturart expone una API REST clara e intuitiva para que el Frontend solicite o modifique información utilizando los verbos estándar HTTP:

- 🟢 **GET (Lectura Segura):**
  - Solicitar el catálogo de productos y sus detalles al nodo QYT.
  - Cargar los reportes de ventas consolidados desde las vistas del Data Warehouse (GYQ).
  - Listar historiales de pedidos.
- 🟡 **POST (Creación y Transacciones):**
  - **`sp_procesar_checkout`:** Toma todo el carrito de compras serializado y procesa el pago de manera atómica.
  - Registro de usuarios con inyección segura de contraseñas.
  - Autenticación (`/api/auth/login`) para generar el Token JWT y envío de correos de recuperación.
- 🟠 **PUT (Actualización):**
  - Actualizar el estado de los pedidos (ej. "Enviado", "Cancelado") ejecutando `sp_actualizar_estado_pedido`.
  - Actualizar el rol de usuario o la verificación de su correo.
- 🔴 **DELETE (Eliminación Lógica/Física):**
  - Remover productos del carrito de favoritos.
  - Eliminar referencias de inventario del panel de administración local (catálogo QYT).

---

## 🔑 Credenciales por Defecto (Administración)

Para propósitos de evaluación y demostración, el sistema se entrega con un superadministrador precargado para acceder al **Admin Dashboard** y a las estadísticas del Data Warehouse.

> **Usuario:** `admin@naturart.com`  
> **Contraseña:** `admin123`

*(Nota: Asegúrese de iniciar los servicios de base de datos distribuidos en Oracle antes de iniciar sesión).*

---

## 🚀 Guía de Instalación Rápida

Sigue estos pasos para desplegar Naturart Foods en un entorno de desarrollo local.

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/naturart-foods.git
cd naturart-foods
```

### 2. Configuración del Backend (Node.js)
El backend requiere configurar las variables de entorno para la conexión con Oracle y JWT.

```bash
cd backend
npm install

# Crear archivo de entorno copiando el de ejemplo
cp .env.example .env
```
Abre el archivo `.env` y configura tus credenciales de Oracle DB (QYT), correo Nodemailer, y tu firma JWT secreta.

### 3. Configuración del Frontend (React)
```bash
cd ../frontend
npm install
```

### 4. Ejecución del Entorno
Con Oracle activo en los nodos correspondientes, levanta ambos servidores:

**En una terminal (Backend):**
```bash
cd backend
npm run dev
```
**En otra terminal (Frontend):**
```bash
cd frontend
npm run dev
```

La aplicación web estará disponible en [http://localhost:5173](http://localhost:5173).
