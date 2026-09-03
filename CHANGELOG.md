# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.

Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

---

## [2.5.1] — 2026-09-02

### Documentation
- **README.md enriquecido**: badges, sección "Qué resuelve", stack completo, funcionalidades principales, endpoints API, variables de entorno, seguridad, backup, testing.
- **Tabla de releases**: "Versiones recientes" con todas las versiones (`2.5.1`, `2.5.0`, `2.3.0`, `2.1.0`, `1.0.1`, `1.0.0`) y resumen de cada una.
- **CHANGELOG.md completo**: entradas para todos los tags existentes (faltan `1.0.0`, `1.0.1`, `2.1.0` que ahora se documentan).

### Notes
Esta versión es un parche de documentación: el código de `v2.5.0` ya está taggeado y publicado. Solo se actualizan los archivos de docs.

---

## [2.5.0] — 2026-09-02

### Added
- **Landing page renovada**: nuevas secciones — "Para quién es" (3 perfiles), "El sistema en un vistazo" (4 pantallas), "Métricas que importan", FAQ, y footer extendido con links útiles.
- **Tests E2E con Playwright**: 3 flujos críticos — registro+login, cotización→evento, y protección de rutas.
- **Rate limiting en auth**: bloqueo tras 5 intentos de login / 3 registros por hora (en memoria, sin dependencias).
- **Centro de notificaciones unificado**: helpers compartidos (`alertsUi.js`) ordenan por severidad y normalizan iconos.
- **Índices Prisma**: 14 índices nuevos en tablas principales (Event, MarketPurchase, Note, etc.).
- **DELETE pagos/tareas + PATCH `/api/events/:id/status`**: endpoints limpios y validados.
- **Alertas de compras sin evento**: nuevo tipo de alerta que detecta compras sin asignar a un evento.

### Changed
- **Bordes y contraste reforzados**: `--border` de 0.06→0.16, `--border2` de 0.10→0.26, `--input-bg` añadido (fondo `#1B2A47` más oscuro). NewMarketPurchase usa secciones con bordes dashed-tinted y cards más visibles.
- **Code splitting**: manualChunks por dependencia (React, router, PDF, charts, motion, dates, icons, i18n).
- **Sistema visual unificado**: tokens CSS consolidados, 90+ hex literales eliminados en Landing.

### Fixed
- **Registro**: rol correcto en registro (primer usuario = admin, resto = editor).
- **Multi-tenant en búsqueda**: FTS filtraba inconsistentemente; ahora usa `$queryRaw` con parámetros.
- **Finanzas honestas**: compras sin evento, horas sin evento y costos fijos incluidos en el margen real.

### Removed
- **LocaleSwitcher**: eliminado el botón de cambio de idioma (i18n no estaba activo).

---

## [2.3.0] — 2026-07-15

### Added
- **Landing React full-bleed**: hero, especialidades con fotos, "Cómo funciona" unificado en 3 pasos.
- **Auth split layout**: Login / Register con imagen + formulario enriquecido.
- **Detalle de compras**: pantalla `MarketPurchaseDetail` con header, lista de productos, totales y fotos del ticket.
- **Panel full-width**: calendario y dashboard mensuales más anchos.
- **Tipografía DM Sans** + jerarquía visual consistente.

### Changed
- **UX menú lateral**: rediseñado con mejor jerarquía y estado activo.
- **Listas y tablas**: rediseñadas con tokens del theme.

### Removed
- **Landing estática**: ya no se sirve desde `landing/`. Ahora es una SPA React servida en `/`.

---

## [2.1.0] — 2026

### Added
- **Empleados**: CRUD + actividades por evento (registro de horas, costo).
- **Clientes**: vinculación con eventos, historial.
- **Multi-tenant completo**: campo `ownerId` en todas las tablas, `ownerFilter(req)` aplicado en endpoints.
- **Tests de aislamiento**: `backend/isolation.test.js` verifica que un usuario no vea/edite datos de otro.

---

## [1.0.1] — 2026

### Added
- **AUTH_SECRET forzado en producción**: error explícito si falta o es el default.
- **Plantillas de cotización**: reutilizar ofertas frecuentes.
- **Screenshots**: capturas del dashboard y pantallas clave.

### Fixed
- **Lint limpio**: CI pasa sin warnings.
- **Test runner**: configuración correcta de `node:test` para backend.

---

## [1.0.0] — 2026

### Added
- **Primera versión pública**: eventos, cotizaciones, inventario, compras, finanzas, notas.
- **PWA**: manifest + service worker para uso offline parcial.
- **Iconos rediseñados** con Lucide.
- **Meta tags** y OG banner para compartir en redes.
- **Paleta naranja/brasa** (`#E8834A`) como color de marca.
