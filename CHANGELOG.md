# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.

Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

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
- **sistema visual unificado**: Tokens CSS consolidados, 90+ hex literales eliminados en Landing.

### Fixed
- **Registro**: rol correcto en registro (primer usuario = admin, resto = editor).
- **Multi-tenant en búsqueda**: FTS filtraba inconsistentemente; ahora usa `$queryRaw` con parámetros.
- **Finanzas honestas**: compras sin evento, horas sin evento y costos fijos incluidos en el margen real.

### Removed
- **LocaleSwitcher**: eliminado el botón de cambio de idioma (i18n no estaba activo).

---

## [2.3.0] — 2026-09-02

### Added
- Fase 1-3 del plan de mejora (workflow, UI, datos, permisos, alertas).

---

## [2.0.0] — versiones prior

Versión inicial con soporte base para eventos, stock, pagos y multi-tenancy básico.
