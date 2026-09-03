# AsamApp (Proyecto Asados)

Aplicación web full-stack para gestionar **catering a las brasas**: cotización, presupuestos, inventario, compras de mercado, finanzas, equipo, notas y multi-usuario. Pensada para asadores, comida costeña y emprendedores gastronómicos.

![License](https://img.shields.io/github/license/FernandezIvan323/ProyectoEventoAsados?style=flat-square)
![Version](https://img.shields.io/github/v/release/FernandezIvan323/ProyectoEventoAsados?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/FernandezIvan323/ProyectoEventoAsados/ci.yml?style=flat-square&label=CI)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)

> **Estado:** **v2.5.1** (2026-09-02) — docs completas + tabla de releases.
> Historial completo: [`CHANGELOG.md`](./CHANGELOG.md)

---

## Qué resuelve

Un solo sistema para el ciclo real del negocio:

1. **Cotizar** el evento (adultos/niños, insumos, PDF)
2. **Comprar** en el mercado (varias tiendas, facturas, historial)
3. **Operar** (equipo, tareas, lista de compras, inventario)
4. **Cobrar** y ver el **margen real** (cobrado − compras − mano de obra)

---

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, Recharts, framer-motion, Lucide |
| Backend | Node.js, Express 5, Prisma 5, tokens HMAC, scrypt |
| Base de datos | SQLite (local) + FTS5 |
| Landing / Auth | React (misma SPA; `AuthGate` + `Landing` / `Login` / `Register`) |
| Docs API | OpenAPI 3.0 + Swagger UI (`/api/docs`) |
| Tests | `node:test` (backend) + Vitest + Playwright (E2E) |
| PWA | manifest + service worker |

---

## Inicio rápido

### Windows

```bat
INICIAR.bat
```

### Manual

```bash
# Backend
cd backend
cp .env.example .env   # o crear DATABASE_URL + AUTH_SECRET
npx prisma migrate deploy
npm run dev            # http://localhost:3000

# Frontend (otra terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

1. Abrí la app sin sesión → **landing**
2. **Registrarse** (primer usuario = admin) o **Ingresar**
3. Creá un presupuesto y registrá compras de la semana

---

## Estructura

```text
ProyectoAsado/
├── backend/                 # API REST + Prisma + SQLite
│   ├── prisma/              # Schema y migraciones (incluye índices de performance)
│   ├── scripts/             # backup, reset-password, ensure-e2e-user, migrate-to-mtr
│   ├── eventStatus.js       # Máquina de estados de eventos
│   ├── auth.js / permissions.js / alerts.js / search.js / rate-limit.js
│   ├── validation.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, eventos, compras, finanzas, landing, auth…
│   │   ├── components/      # Layout, AuthGate, auth/, events/, ui/, feedback/
│   │   ├── services/        # Clientes API
│   │   └── lib/             # finance, eventStatus, alertsUi, guests, weekUtils, i18n
│   ├── e2e/                 # Playwright (smoke + workflow + flows)
│   └── public/              # PWA + hero + especialidades
├── docs/                    # OpenAPI + plan de flujo de trabajo
├── CHANGELOG.md
├── LICENSE                  # MIT
└── README.md
```

---

## Funcionalidades principales

### Eventos y cotización
- Cotizador con insumos, margen y costos extra
- **Adultos / niños** → raciones efectivas `ceil(adults + kids × 0.5)`
- Workflow: **Cotizado → Aprobado → Compras pendientes → En preparación → Realizado → Cobrado** (Cancelado) — validado en UI y API
- `PATCH /api/events/:id/status` para cambios de estado limpios
- Detalle con **siguiente paso**, tareas, pagos, PDF y margen real
- Calendario (mes/semana) y **dashboard semanal**
- Plantillas y cotizador rápido

### Compras e inventario
- Gastos de mercado multi-tienda (varias compras por sesión)
- **Historial por cards** (agrupado por día) + **detalle de compra**
- `DELETE /api/events/:id/payments/:paymentId` con recálculo de saldo
- `DELETE /api/events/:id/tasks/:taskId`
- Lista de compras consolidada, inventario con movimientos, proveedores, recetas
- Gastos fijos (alta/edición en pantallas propias)

### Finanzas
- Pagos / señas y saldo
- Rentabilidad real: **cobrado − mercado − mano de obra − costos fijos**
- Gastos sin evento incluidos en el agregado (compras, horas, costos fijos)
- Reportes y export CSV/JSON

### Personas y operaciones
- Clientes vinculados a eventos
- Equipo + actividades (modales de alta/actividad, **registro inline en EventDetail**)
- Notas, alertas, búsqueda FTS5 multi-tenant
- Operaciones fusionadas en Dashboard (cards compactas: stock bajo, tareas pendientes)

### Multi-usuario y seguridad
- Multi-tenant por `ownerId` (aislamiento por usuario con `ownerFilter`)
- Roles: `admin` / `editor` / `viewer`
- RBAC activo en 27 endpoints de escritura
- Registro: primer usuario = `admin`, resto = `editor`
- **Rate limit**: 5 intentos de login / 15min, 3 registros / hora (en memoria)
- `AUTH_SECRET` obligatorio en producción

---

## Endpoints API principales

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/register` | Registro (primer user = admin, resto editor) |
| `POST` | `/api/auth/login` | Login (rate limit 5/15min) |
| `GET` | `/api/auth/config` | Config de auth (enabled, hasUsers) |
| `GET` | `/api/events` | Listar eventos |
| `POST` | `/api/events` | Crear evento |
| `PUT` | `/api/events/:id` | Actualizar evento (valida transición) |
| `PATCH` | `/api/events/:id/status` | Cambiar estado limpio |
| `DELETE` | `/api/events/:id` | Eliminar evento |
| `POST` | `/api/events/:id/payments` | Agregar pago |
| `DELETE` | `/api/events/:eventId/payments/:paymentId` | Eliminar pago (recalcula `amountPaid`) |
| `POST` | `/api/events/:id/tasks` | Crear tarea |
| `DELETE` | `/api/events/:eventId/tasks/:taskId` | Eliminar tarea |
| `GET` | `/api/events/:id/financials` | Resumen financiero del evento |
| `GET` | `/api/market-purchases` | Listar compras |
| `POST` | `/api/market-purchases` | Registrar compra (relaciona con evento) |
| `GET` | `/api/finance/summary` | Ganancia neta real (eventos + gastos) |
| `GET` | `/api/alerts` | Alertas (pagos atrasados, stock bajo, notas, compras sin evento) |
| `GET` | `/api/search?q=...` | Búsqueda global (FTS, multi-tenant) |
| `GET` | `/api/docs` | Swagger UI |

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `AUTH_SECRET` | Secreto HMAC para firmar tokens (**requerido en producción**) |
| `AUTH_ENABLED` | `false` para desactivar auth (default: `true`) |
| `DATABASE_URL` | Ruta SQLite (ej. `file:./dev.db`) |
| `PORT` | Puerto backend (default: `3000`) |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma |

---

## Tests

```bash
# Backend (81 tests unit + integración)
cd backend && npm test

# Frontend unit (8 tests Vitest)
cd frontend && npm test

# E2E (Playwright — levanta backend+frontend automáticamente)
cd frontend && npm run test:e2e
```

Cobertura actual:
- **Backend**: 81 tests (`node:test`) — auth, rate limit, permisos, búsqueda, alertas, eventos, compras, finanzas.
- **Frontend**: 8 tests (Vitest) — utilidades y componentes del kit `ui/`.
- **E2E**: Playwright — `smoke.spec.js` (API + landing), `workflow.spec.js` (transición de estados), `flows.spec.js` (3 flujos UI).

---

## Seguridad

- En **producción**, el backend exige `AUTH_SECRET` real (no el default de desarrollo).
- Passwords con scrypt; tokens firmados HMAC-SHA256 con TTL de 7 días.
- **Rate limit** en auth: 5 logins / 15min y 3 registros / hora por IP.
- RBAC activo en endpoints de escritura (`requirePermission`).
- Multi-tenant: cada usuario solo ve/edita sus propios recursos.

Generar secreto:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Backup

```bash
cd backend
npm run backup              # copia SQLite a backups/database/
npm run backup:schedule     # opcional, cada 24h
```

---

## Versiones recientes (Releases)

> Última versión estable: **v2.5.1** (2026-09-02). Detalle completo en [`CHANGELOG.md`](./CHANGELOG.md).

### Versiones mayores

| Versión | Fecha | Categorías | Resumen |
|---------|-------|------------|---------|
| **v2.5.1** | 2026-09-02 | `docs` | README enriquecido + tabla de releases + CHANGELOG con todos los tags |
| **v2.5.0** | 2026-09-02 | `ui` `datos` `auth` `testing` `finanzas` | Fases 1–5: workflow, UI kit, RBAC real, índices Prisma, finanzas honestas, landing nueva, E2E, rate limit |
| **v2.3.0** | 2026-07-15 | `ui` `landing` | Landing/auth en React, detalle de compras, panel full-width, UX menú y tipografía |
| **v2.1.0** | 2026 | `feature` `multi-tenant` | Empleados, clientes, multi-tenant completo + tests de aislamiento |
| **v1.0.1** | 2026 | `docs` `testing` `auth` | Lint limpio, AUTH_SECRET forzado, tests, screenshots, plantillas |
| **v1.0.0** | 2026 | `release` `pwa` | Primera versión: iconos, PWA, meta tags, paleta naranja |

### Cambios por categoría (cumulative)

**Última versión (v2.5.1):**
- Documentación completa — README con badges, releases, endpoints, seguridad y backup.
- CHANGELOG con entradas para todos los tags.

**v2.5.0 — cambios mayores:**
- **UI / UX**: bordes reforzados, kit `ui/` consolidado, landing renovada con 8 secciones, Operaciones fusionadas al Dashboard, partículas CSS en hero.
- **Auth / Seguridad**: rate limit (5 logins/15min, 3 registros/hora), `AUTH_SECRET` forzado en producción, RBAC en 27 endpoints.
- **Datos / API**: DELETE pagos/tareas, PATCH status, índices Prisma, multi-tenant coherente en búsqueda.
- **Finanzas**: margen real con gastos sin evento (compras, horas, costos fijos).
- **Testing**: 81 tests backend + 8 frontend + 11 E2E con Playwright.
- **Removido**: LocaleSwitcher (i18n no estaba activo).

**v2.3.0:**
- Landing React full-bleed con hero, especialidades y "Cómo funciona".
- Auth split layout (Login/Register con imagen + formulario).
- Detalle de compras, panel full-width, tipografía DM Sans.

**v2.1.0:**
- Empleados con actividades por evento.
- Clientes vinculados a eventos + historial.
- Multi-tenant por `ownerId` con tests de aislamiento.

**v1.0.1:**
- Lint limpio, CI en verde.
- AUTH_SECRET forzado en producción.
- Tests + screenshots + plantillas de cotización.

**v1.0.0:**
- Primera versión pública.
- Eventos, cotizaciones, inventario, compras, finanzas, notas.
- PWA, meta tags, paleta naranja/brasa (`#E8834A`).

---

## Licencia

[MIT](./LICENSE) — Iván Fernández Peñates · Sampués, Sucre, Colombia
`contacto@asamapp.com` · `+57 321 662 4399`
