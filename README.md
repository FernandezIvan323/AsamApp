# AsamApp (Proyecto Asados)

Aplicación web full-stack para gestionar **catering a las brasas**: cotización, presupuestos, inventario, compras de mercado, finanzas, equipo, notas y multi-usuario. Pensada para asadores, comida costeña y emprendedores gastronómicos.

![License](https://img.shields.io/github/license/FernandezIvan323/AsamApp?style=flat-square)
![Version](https://img.shields.io/github/v/release/FernandezIvan323/AsamApp?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/FernandezIvan323/AsamApp/ci.yml?style=flat-square&label=CI)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)

> **Estado:** **v2.3.0** (2026-07-15) — landing y auth renovados, detalle de compras, panel full-width, flujo de eventos y margen real.  
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
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7, Recharts, i18next, framer-motion, Lucide |
| Backend | Node.js, Express 5, Prisma 5, tokens HMAC, scrypt |
| Base de datos | SQLite (local) + FTS5 |
| Landing / Auth | React (misma SPA; `AuthGate` + `Landing` / `Login` / `Register`) |
| Docs API | OpenAPI 3.0 + Swagger UI (`/api/docs`) |
| Tests | `node:test` (backend) + Vitest + Playwright (E2E) |
| PWA | manifest + service worker |

---


## Estructura

```text
ProyectoAsado/
├── backend/                 # API REST + Prisma + SQLite
│   ├── prisma/              # Schema y migraciones
│   ├── scripts/             # backup, reset-password, ensure-e2e-user, migrate-to-mtr
│   ├── eventStatus.js       # Máquina de estados de eventos
│   ├── auth.js / permissions.js / alerts.js / search.js
│   ├── validation.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, eventos, compras, finanzas, landing, auth…
│   │   ├── components/      # Layout, AuthGate, auth/, events/, ui/
│   │   ├── services/        # Clientes API
│   │   └── lib/             # finance, eventStatus, guests, weekUtils, i18n
│   ├── e2e/                 # Playwright (workflow de estados)
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
- Detalle con **siguiente paso**, tareas, pagos, PDF y margen real  
- Calendario (mes/semana) y **dashboard semanal**  
- Plantillas y cotizador rápido  

### Compras e inventario
- Gastos de mercado multi-tienda  
- **Historial por cards** (agrupado por día) + **detalle de compra**  
- Lista de compras consolidada, inventario con movimientos, proveedores, recetas  
- Gastos fijos (alta/edición en pantallas propias)  

### Finanzas
- Pagos / señas y saldo  
- Rentabilidad real: **cobrado − mercado − mano de obra**  
- Reportes y export CSV/JSON  

### Personas y operaciones
- Clientes vinculados a eventos  
- Equipo + actividades (modales de alta/actividad)  
- Notas, alertas, búsqueda FTS5, operaciones  

### Multi-usuario
- Multi-tenant por `ownerId`  
- Roles: admin / editor / viewer  
- Aislamiento cubierto con tests de integración  

---

## Landing y autenticación (v2.3)

- Landing **full-bleed**: hero, especialidades con fotos, “Cómo funciona” unificado  
- Login / Register en **layout split** (imagen + formulario enriquecido)  
- Sin dependencia de carpeta `landing/` estática (todo en React)

---


## Versiones recientes

| Versión | Resumen |
|---------|---------|
| **2.3.0** | Landing/auth, detalle de compras, panel full-width, UX menú y tipografía |
| **2.2.0** | Dashboard semanal, estados, adults/kids, EventForm, margen + labor, E2E |
| **2.1.0** | Empleados, clientes, multi-tenant tests, rediseño UI |

Detalle: [`CHANGELOG.md`](./CHANGELOG.md)

---

## Licencia

[MIT](./LICENSE) — Iván Fernández Peñates · Sampués, Sucre, Colombia
