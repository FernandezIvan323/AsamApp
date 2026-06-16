# Changelog

Todos los cambios relevantes del proyecto se documentan aqui.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/)
y el versionado sigue [Semantic Versioning](https://semver.org/lang/es/).

## [2.1.0] - 2026-06-16

### Agregado
- **Módulo de Empleados**: página `Employees.jsx` con CRUD completo (nombre, teléfono, email, rol, tarifa por hora, estado activo). Registro de actividades por empleado con horas trabajadas, descripción, tipo de pago (Por hora / Por evento / Fijo) y cálculo automático de total. Vinculación a eventos.
- **Módulo de Clientes**: página `Clients.jsx` con CRUD (nombre, teléfono, email, notas). Lista de eventos asociados a cada cliente.
- **Integración Cliente-Evento**: los formularios de nuevo/editar evento ahora incluyen un combobox con búsqueda de clientes existentes. El evento guarda `clientId` como FK a la tabla Client. Vista de eventos por cliente en la página de clientes.
- **Aislamiento multi-tenant verificado**: 10 tests de integración que confirman que cada usuario ve solo sus propios datos (eventos, inventario, proveedores, notas, recetas, compras, gastos fijos, plantillas) y que el admin puede ver todo.
- **Componentes UI reutilizables**: `FormField`, `Select`, `Toast` — componentes base con diseño consistente Tailwind CSS.
- **Librería de validación frontend**: `validators.js` con validadores reutilizables para formularios.
- **Script de migración multi-tenant**: `migrate-to-mtr.js` — migra datos huérfanos (ownerId IS NULL) al admin fundador. Idempotente, crea backup automático antes de ejecutar.

### Mejorado
- **Rediseño completo de páginas**: NewEvent, EditEvent, EventDetail, NewMarketPurchase, QuickQuote, FixedCosts, Login, Register — modernizadas con Tailwind CSS V4, diseño responsive, mejor UX.
- **CSS limpiado**: eliminados 6 CSS legacy (App.css, Layout.css, Dashboard.css, Finance.css, Inventory.css, NewEvent.css). Todo el estilo unificado en `index.css` con variables CSS del theme.
- **Layout responsive**: sidebar colapsable en mobile con menú hamburguesa. Topbar adaptativa.
- **Buscador global mejorado**: `search.js` con FTS5 + fallback LIKE, mejor tokenización.
- **Alertas inteligentes**: 6 tipos de alerta (Proveedores sin uso, Stock bajo, Eventos próximos, Compras sin evento, Presupuestos sin margen, Eventos sin precio). Sistema de severidades (info/warn/error).
- **Paleta de colores Stripe-style**: migración de verde → naranja (#f97316) como color primario. Tema coherente en toda la app.
- **Dashboard con widgets**: CTA de eventos que necesitan atención, margen real destacado con badge "Cerrado" en eventos cobrados.
- **Multi-proveedor en compras**: soporte para registrar múltiples compras en una misma sesión.
- **PWA**: theme color naranja, service worker con estrategia network-first, iconos rediseñados.
- **Landing page**: banner OG rediseñado, meta tags para redes sociales, licencia MIT.
- **Registro público**: nuevos usuarios se crean con role 'user' por defecto (sin permisos de admin).

### Corregido
- `pendingRevenue` excluye correctamente eventos cobrados y cancelados.
- Botón 'Volver al inicio' del login apunta a /landing/ (no a /app/).
- Buscador alineado con notificaciones e idioma en la topbar.
- Contexto de notas corregido en sidebar.
- 44 errores de lint eliminados (CI ahora pasa con 0 errores/warnings).
- Atributos SVG kebab-case → camelCase en Login/Register (eliminan warnings de React).

### Seguridad
- `AUTH_SECRET` se valida al arranque: servidor rechaza iniciar en producción si está vacío o con valor por defecto.
- Multi-tenant: ownerId en todos los modelos, middleware `ownerFilter()` en cada query, endpoints protegidos por usuario.
- Roles vía `permissions.js`: admin (todo), editor (CRUD sin borrar usuarios), viewer (solo lectura).
- Tests de permisos: 12 tests que verifican matriz de permisos por rol.

## [1.0.1] - 2026-06-05

### Mejorado
- Lint pasa con 0 errores y 0 warnings (antes tenia 44 errores pre-existentes). CI ahora corre lint como paso bloqueante.
- `AUTH_SECRET` se valida al arranque: el server rechaza iniciar en produccion si esta vacio o con el valor por defecto. En desarrollo imprime un warning. Nuevo helper `validateSecret()` exportado.
- 25 tests unitarios nuevos para features "Deseable": `permissions.test.js` (12 tests), `search.test.js` (8 tests), `alerts.test.js` (5 tests). Total: 50 unit tests + 3 integration = 53 tests, todos pasando.
- README reescrito con badges (license, version, CI, Node, React), capturas de pantalla en `docs/screenshots/`, seccion destacada sobre `AUTH_SECRET` en produccion y enlaces a las plantillas de Issues/PRs.
- Capturas de pantalla de las pantallas principales agregadas en `docs/screenshots/` (landing, login, register, dashboard desktop y mobile, new-event, calendar, finance, notes, inventory, operations).
- Plantillas de Issues y PRs en `.github/ISSUE_TEMPLATE/` y `.github/PULL_REQUEST_TEMPLATE.md`.
- Atributos SVG corregidos en `Login.jsx` y `Register.jsx` (kebab-case → camelCase, eliminan warnings de React en consola).

### Seguridad
- `getSecret()` ahora retorna el default silenciosamente solo cuando `AUTH_ENABLED=false`. Si auth esta habilitada, exige un secreto real o falla con instruccion de como generar uno.

## [1.0.0] - 2026-06-04

### Agregado
- Backend API REST con Node.js, Express 5 y Prisma sobre SQLite.
- 13 modelos de datos: User, Event, Insumo, CatalogItem, MarketPurchase,
  MarketPurchaseItem, Provider, RecipeCombo, EventTask, EventPayment,
  StockMovement, Note, NoteChangeLog, QuoteTemplate, EventChangeLog, FixedCost.
- 17 paginas React (Dashboard, Calendario, Nuevo evento, Historial, Detalle,
  Edicion, Lista de compras, Insumos, Recetas, Proveedores, Gastos de mercado,
  Operaciones, Finanzas, Notas, Plantillas, Cotizador rapido, Gastos fijos,
  Exportar, Login, Register).
- Code splitting con React.lazy + Suspense (bundle principal: 399 kB).
- Autenticacion local con tokens HMAC-SHA256 y scrypt para hashing.
- Sistema de notas con recurrencia, etiquetas, archivado, prioridad y vinculacion.
- Sistema de busqueda global en /api/search.
- Exportacion de datos en JSON y CSV (eventos, compras, notas).
- Landing page estatica con secciones hero, nicho, funcionalidades,
  workflow, ventajas, stack, FAQ y CTA.
- Logging estructurado en backend con niveles y archivos rotados.
- Manejo global de errores HTTP (404 + 500 handler).
- Sistema de backup automatico del .db con rotacion configurable.
- Migraciones Prisma versionadas (13 migraciones).
- Tests unitarios (quote, finance, auth, logger) y de integracion del backend.
- Tests E2E con Playwright (smoke tests de la API y la landing).
- CI/CD con GitHub Actions (backend + frontend en cada push/PR).
- Internacionalizacion (i18n) con i18next y traducciones es/en.
- Interruptor de idioma en el sidebar.

### Seguridad
- Tokens firmados con HMAC-SHA256 y TTL de 7 dias.
- Passwords hasheados con scrypt + salt aleatorio de 16 bytes.
- Validacion de payloads en todos los endpoints.

## [0.9.0] - 2026-05-30

### Agregado
- Modulo de notas completo (cambio de status, prioridad, archivado).
- Recurrencia de notas (diaria, semanal, mensual).
- Changelog automatico para eventos y notas.

## [0.5.0] - 2026-05-20

### Agregado
- Sistema de cotizaciones con plantillas y cotizador rapido.
- Gestion de recetas y combos reutilizables.
- Modulo de finanzas con dashboard mensual y anual.

## [0.1.0] - 2026-05-19

### Agregado
- Version inicial del proyecto.
- Backend con Express, Prisma y modelos basicos (Event, Insumo, CatalogItem).
- Frontend con React, Vite y Tailwind.
