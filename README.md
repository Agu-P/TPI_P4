#  Food Store - Aplicación Web 

Sistema de gestión y venta de comidas, desarrollado con arquitectura en capas desacoplada: **Backend en FastAPI + SQLModel** con patrón **Unit of Work** y autenticación JWT mediante cookie `HttpOnly`, y **Frontend en React + TypeScript (Vite + Tailwind CSS 4)** con arquitectura modular por **features**, **TanStack Query** para el estado del servidor y **Zustand** para el estado del cliente.

---

## Requisitos Previos

- **Python**: 3.11 a 3.13 
- **Node.js**: v20.19 o superior.
- **pnpm**: v9 o superior (`pnpm -v`).
- **Git**

---

## Arquitectura del Sistema

El sistema implementa una separación de responsabilidades en dos proyectos independientes:

### Backend (`/backend`)
- **Arquitectura en Capas**: Router ➔ Service ➔ Unit of Work ➔ Repository ➔ Model.
- **Patrón Unit of Work**: Todo `commit` ocurre en el `__exit__` del UoW. Ningún Service ni Router llama a `session.commit()`. Si ocurre una excepción dentro del bloque `with self.uow as uow:`, se realiza `rollback` automático.
- **Seguridad**: JWT firmado con HMAC SHA-256 viajando exclusivamente en la cookie `HttpOnly` (`access_token`), con expiración configurable (30 minutos por defecto).
- **Control de Acceso**: Roles `user` (cliente) y `admin` (administrador) mediante dependencias `get_current_active_user` y `require_role`.
- **Reglas de Negocio Transaccionales**:
  - **RN-01 (Creación de Pedido)**: Validación de stock, descuento inmediato y copia histórica inmutable de nombre y precio en `DetallePedido`.
  - **RN-02 (Máquina de Estados)**: Transiciones estrictas (`PENDIENTE` ➔ `EN_PREPARACION` ➔ `ENTREGADO` / `CANCELADO`). Estados `ENTREGADO` y `CANCELADO` terminales.
  - **RN-03 (Cancelación con Restitución)**: Al cancelar un pedido, las cantidades de cada línea se devuelven al stock en la misma transacción.
  - **RN-04 (Permisos)**: El cliente solo puede ver sus propios pedidos y cancelarlos únicamente en estado `PENDIENTE`. El admin puede ver todos y avanzar o cancelar desde cualquier estado no terminal.
  - **RN-05 (Inmutabilidad)**: Las líneas y el total del pedido nunca cambian tras su creación; los pedidos no se borran físicamente.
  - **RN-06 (Validación de Datos)**: Forma de pago (`EFECTIVO` o `TRANSFERENCIA`) y dirección de entrega (entre 5 y 200 caracteres).

### Frontend (`/frontend`)
- **Arquitectura por Features**: Organización por dominios (`auth`, `categorias`, `productos`, `pedidos`, `usuarios`). Cada feature encapsula sus páginas, componentes, hooks, llamadas a la API y tipos TypeScript.
- **Separación del Estado**:
  - **TanStack Query**: Manejo del estado del servidor (fetching, caché, skeleton, estado de error e invalidación reactiva tras mutaciones).
  - **Zustand con persist**: Estado local del cliente (`authStore` para sesión con `partialize` que nunca guarda el token, y `cartStore` para el carrito persistente).
- **Axios con Interceptor**: Instancia con `withCredentials: true`. Si recibe `401` fuera del login o `400` con `"Cuenta de usuario desactivada"`, limpia automáticamente la sesión.
- **Rutas Protegidas**: Componente `ProtectedRoute` con redirección condicional a `/login` o `/unauthorized`.
- **TypeScript Strict**: Tipado estricto (`strict: true`) sin ningún tipo `any`.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Backend
Desde la raíz del proyecto o entrando a `/backend`:

```bash
# Crear y activar entorno virtual
python -m venv .venv

# En Windows:
.\.venv\Scripts\Activate.ps1
# En Linux / macOS:
# source .venv/bin/activate

# Instalar dependencias fijadas
pip install -r backend/requirements.txt

# Ejecutar el Seed 
cd backend
python -m app.db.seed

# Iniciar servidor FastAPI 
uvicorn app.main:app --reload --port 8000
```

> **API Documentada**: Accede a Swagger UI en [http://localhost:8000/docs](http://localhost:8000/docs) o ReDoc en [http://localhost:8000/redoc](http://localhost:8000/redoc).

### 2. Frontend
En otra terminal:

```bash
cd frontend

# Instalar dependencias
pnpm install

# Comprobar tipos y build de producción
pnpm build

# Iniciar servidor de desarrollo Vite
pnpm dev
```

> Accede a la aplicación web en [http://localhost:5173](http://localhost:5173).

---

## Usuarios del Seed

| Rol | Usuario | Contraseña | Permisos |
|---|---|---|---|
| **Admin** | `admin` | `Admin1234!` | CRUD de categorías y productos, ajuste rápido de stock/disponibilidad, gestión y avance de pedidos, métricas del resumen del negocio, activación/desactivación de usuarios. |
| **Cliente** | `cliente` | `Cliente1234!` | Navegación del catálogo, armado de carrito, checkout con validación de dirección y pago, consulta de pedidos propios y cancelación en estado `PENDIENTE`. |

---

## URL del Repositorio

- **Repositorio**: `https://github.com/Agu-P/TPI_Prog4`

## Link del video

- **Video**: `https://youtu.be/K05R5gHzNLg`