# Proyecto Asados (AsamApp)

Aplicación web full-stack para gestionar eventos gastronómicos: cotización, presupuestos, inventario, compras de mercado, finanzas y checklist operativo. Enfocada en catering, asadores y emprendedores gastronómicos.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Recharts |
| Backend | Node.js, Express 5, Prisma |
| Base de datos | SQLite (local) |
| Landing page | HTML + CSS + JS vanilla (sin framework) |

## Estructura

```text
ProyectoAsado/
├── backend/          # API REST + Prisma + SQLite
│   ├── prisma/       # Schema y migraciones
│   └── server.js     # Servidor Express
├── frontend/         # SPA React
│   ├── src/          # Componentes, páginas, hooks
│   └── package.json
├── landing/          # Landing page estática
│   ├── index.html    # Página principal
│   ├── features.html # Detalle de funcionalidades
│   ├── styles.css    # Estilos CSS
│   └── app.js        # Lógica y renderizado
└── README.md
```

## Landing Page

El sitio promocional (`/`) es HTML+CSS+JS estático servido por Vite. Incluye:

- **Hero** — título con gradiente, badge, call-to-action, estadísticas
- **Para quién es** — cards por perfil (catering, emprendedor, asador)
- **Funcionalidades** — carrusel horizontal interactivo con iconos, expandible al hover/click, con botón "Ver todas" que lleva a `/features.html` con el detalle completo de las 18 funcionalidades
- **Flujo de trabajo** — timeline horizontal con conectores entre pasos (responsive: se apila en mobile)
- **Ventajas** — cards con barra de acento verde izquierdo
- **Stack tecnológico** — grid de 4×2 con logos del stack
- **FAQ** — sección con `<details>/<summary>` nativos, 6 preguntas frecuentes
- **CTA** — llamada a la acción final
- **Footer** — rejilla wireframe (vortex) con enlace a GitHub

## Dashboard (app React)

El dashboard principal en `/app/` incluye:

- **Greeting header** — saludo personalizado con fecha
- **Métricas** — 4 cards con borde izquierdo de colores (eventos activos, ingresos, rentabilidad, por cobrar)
- **Alerta de eventos sin confirmar** — banner con acción rápida
- **Acciones rápidas** — botones para crear evento, ver checklist, calendario
- **Próximos eventos** — lista con fecha en badge y estado
- **Sidebar** — pagos pendientes y tareas activas

## Funcionalidades

### Gestión de eventos
- **Cotizador** — calcula precio automático con insumos del catálogo, margen de ganancia y costos extra
- **Cotizador rápido** — calcula precio al instante sin crear evento, convertible después
- **Historial de eventos** — workflow completo con estados: Cotizado → Aprobado → Compras → Preparación → Cobrado
- **Plantillas de cotización** — menús predefinidos con precios y márgenes para presupuestos rápidos
- **Calendario** — vista mensual de todos los eventos con estado y datos clave

### Compras e inventario
- **Lista de compras** — consolida insumos de todos los eventos aprobados en una sola lista
- **Gastos de mercado** — registra compras con items, proveedor, método de pago y fotos (base64)
- **Inventario con stock** — movimientos de entrada, salida y ajuste en tiempo real
- **Proveedores** — agenda con historial de compras y datos de contacto
- **Recetas y combos** — combinaciones reutilizables de insumos para cargar eventos en segundos
- **Gastos fijos** — costos recurrentes del negocio (gas, transporte, equipamiento)

### Finanzas
- **Registro de pagos** — señas y pagos finales con cálculo automático de saldo pendiente
- **Dashboard financiero** — cotizado vs gastado vs cobrado por evento y resumen global
- **Rentabilidad real** — ganancia neta por evento considerando todos los gastos

### Operaciones
- **Alertas inteligentes** — notifica eventos sin confirmar, tareas pendientes, cobros atrasados
- **Notas y recordatorios** — bloc integrado con checklist, prioridades, tipos y fechas de vencimiento
- **Búsqueda global** — encuentra eventos, insumos, proveedores y notas desde cualquier pantalla
- **Historial de cambios** — cada modificación de precio o estado queda registrada con fecha y valor anterior
- **Exportar datos** — descarga en JSON o CSV para respaldo o análisis externo

### Notas
- Bloc de notas completo con checklist, campos de estado (pendiente/en progreso/completada), prioridad (baja/media/alta), tipo (idea/tarea/recordatorio), fecha de vencimiento, y la posibilidad de fijar notas importantes
- Vista de lista y detalle, con botón "Volver" en mobile
- Búsqueda y filtros integrados

## Code Splitting

La app React usa `React.lazy` + `Suspense` para carga diferida de las 17 páginas, reduciendo el bundle principal de 1,181 kB a 399 kB.

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

## Variables de entorno

Ver `backend/.env.example` y `frontend/.env.example`.

## Licencia

ISC
