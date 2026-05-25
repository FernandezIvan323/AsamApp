# Proyecto Asados (AsamApp)

Aplicación web full-stack para cotizar y operar eventos de asado: presupuestos, inventario, compras de mercado, finanzas y checklist operativo.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router |
| Backend | Node.js, Express 5, Prisma |
| Base de datos | SQLite (local) |

## Estructura

```text
ProyectoAsado/
├── backend/          # API REST + Prisma + SQLite
├── frontend/         # SPA React
└── README.md
```

## Instalación rápida (desarrollo)

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

API en `http://localhost:3000`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App en `http://localhost:5173`

### 3. Prisma Studio (opcional)

```bash
cd backend
npx prisma studio
```

## Producción local (un solo puerto)

```bash
cd frontend && npm run build
cd ../backend
# En .env: SERVE_FRONTEND=true
npm run start:prod
```

Abre `http://localhost:3000` — el backend sirve la API y el frontend compilado.

## Autenticación (opcional)

Por defecto la API está abierta (`AUTH_ENABLED=false`).

Para activar login local, en `backend/.env`:

```env
AUTH_ENABLED=true
AUTH_USERNAME=admin
AUTH_PASSWORD=tu-clave-segura
AUTH_SECRET=un-secreto-largo-aleatorio
```

Reinicia el backend. El frontend mostrará pantalla de login.

## Tests

```bash
# Validación y módulos (backend)
cd backend && npm run test:unit

# API con base de datos temporal (backend)
cd backend && npm run test:integration

# Lógica de cotización y finanzas (frontend)
cd frontend && npm test
```

## Funcionalidades

- **Cotizador** — insumos del catálogo, margen, costos extra
- **Historial** — estados de workflow, detalle, edición, duplicar, imprimir
- **Lista de compras** — insumos consolidados de eventos aprobados
- **Gastos de mercado** — compras reales con comprobantes (base64)
- **Inventario** — stock y movimientos entrada/salida/ajuste
- **Recetas y plantillas** — combos reutilizables
- **Proveedores** — agenda de vendedores
- **Operaciones** — KPIs, tareas, alertas de stock
- **Finanzas** — cotizado vs gastado vs cobrado
- **Calendario** — vista mensual de eventos
- **Exportar** — JSON/CSV de respaldo
- **Búsqueda global** — eventos, insumos, proveedores, notas

## Variables de entorno

Ver `backend/.env.example` y `frontend/.env.example`.

## Licencia

ISC
