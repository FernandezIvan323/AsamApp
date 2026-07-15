# Plan detallado: flujo de trabajo, registro de datos y UX de formularios — AsamApp

**Versión:** 1.1  
**Fecha:** 2026-07-15  
**Proyecto:** `ProyectoAsado` / AsamApp  
**Objetivo:** que el trabajo semanal del asador se vea y se siga de forma ordenada; que **cada dato se registre en el momento correcto**; y que **todos los formularios se sientan claros, rápidos y consistentes** (usables en mobile y en el día a día).

> **Nota v1.1:** se incorpora el eje **UX de formularios** como requisito de primer nivel. Antes de implementar, se revisa la app en local con el usuario para capturar mejoras concretas de cada pantalla.

---

## 0. Principios del plan

1. **El evento es el centro.** Todo (compras, pagos, tareas, empleados, notas, fotos) cuelga del evento o se vincula a él cuando aplica.
2. **Un solo flujo de estados.** Nadie puede saltar etapas desde el historial, el detalle o la API de forma distinta.
3. **Un solo lugar para cada dato.** Si el dato es de “cliente”, se guarda en Clientes; si es “gasto de mercado del evento X”, en Compras con `eventId`.
4. **Siguiente paso visible.** En cada pantalla del evento, la app dice *qué falta* y *dónde cargarlo*.
5. **Pensado para uso diario (toda la semana).** Agenda + pendientes > panel con 18 menús sueltos.
6. **Formularios de un solo sistema.** Mismos componentes, validación visible, botones predecibles, teclado y touch pensados para campo/oficina.
7. **No inventar features nuevas de negocio** salvo las mínimas para cerrar el círculo de datos (invitados, mano de obra en margen, estados). El grueso es pulir y unificar.
8. **Feedback del usuario en local primero.** Las mejoras de UX de forms se validan mirando la app corriendo, no solo en abstracto.

---

## 1. Flujo de trabajo del negocio (fuente de verdad)

### 1.1 Ciclo de vida de un evento de asado

```text
  [Consulta / llamada]
         │
         ▼
   ┌───────────┐     rechazo / no contesta
   │  COTIZADO │ ──────────────────────────►  CANCELADO ──► (reactivar a Cotizado)
   └─────┬─────┘
         │ cliente dice "sí" / seña
         ▼
   ┌───────────┐
   │  APROBADO │
   └─────┬─────┘
         │ hay que comprar insumos
         ▼
   ┌────────────────────┐
   │ COMPRAS PENDIENTES │
   └─────────┬──────────┘
             │ mercado hecho / stock listo
             ▼
   ┌─────────────────┐
   │ EN PREPARACIÓN  │  (menú, equipo, traslado, checklist)
   └────────┬────────┘
            │ se hizo el evento
            ▼
   ┌───────────┐
   │ REALIZADO │
   └─────┬─────┘
         │ cobro final completo
         ▼
   ┌───────────┐
   │  COBRADO  │  (cerrado — solo lectura de precio)
   └───────────┘
```

### 1.2 Estados: definición operativa y datos obligatorios

| Estado | Significado para el asador | Datos que **deben** existir al entrar / al salir | Acción principal en UI |
|--------|----------------------------|--------------------------------------------------|------------------------|
| **Cotizado** | Presupuesto armado, aún no confirmado | Entrada: título, fecha, invitados (efectivos), totalPrice ≥ 0, insumos o menú. Salida a Aprobado: ideal seña o al menos totalPrice > 0 | Editar cotización, enviar PDF, registrar seña |
| **Pendiente** | *Deprecar o unificar* (ver §1.3) | — | — |
| **Aprobado** | Cliente confirmó | `client` o `clientId`, fecha, totalPrice > 0 | Ir a lista de compras / registrar seña si falta |
| **Compras pendientes** | Hay que ir al mercado | Al menos 1 compra vinculada **o** lista de compras marcada “lista” (ver §4.3) | Registrar gastos de mercado con `eventId` |
| **En preparacion** | Armar el día del evento | Tareas de prep útiles; opcional: empleados asignados | Checklist, horas de equipo, fotos |
| **Realizado** | El asado ya se hizo | Fecha del evento ≤ hoy (validación suave) | Registrar cobro restante |
| **Cobrado** | Cerrado comercialmente | `amountPaid >= totalPrice` (o justificación de quita en notas de pago) | Solo consulta / exportar |
| **Cancelado** | No se hace | Motivo en notas del evento o nota vinculada (recomendado) | Reactivar a Cotizado |

### 1.3 Decisión de producto: eliminar ambigüedad Cotizado / Pendiente

**Problema actual:** el alta crea `Pendiente`; el README y la máquina hablan de `Cotizado`; el dashboard mezcla ambos.

**Decisión propuesta (recomendada):**

| Opción | Descripción | Recomendación |
|--------|-------------|----------------|
| **A — Unificar** | Un solo estado inicial: `Cotizado`. Migrar todos los `Pendiente` → `Cotizado`. Quitar `Pendiente` de la UI y de transiciones. | **Recomendada** |
| **B — Diferenciar** | `Cotizado` = con precio; `Pendiente` = borrador sin cerrar números. | Solo si se quiere “borrador” explícito |

Este plan asume **Opción A**.

**Migración de datos:**

```sql
-- Conceptual (script Prisma / SQL)
UPDATE Event SET status = 'Cotizado' WHERE status = 'Pendiente';
```

Default en schema: `status @default("Cotizado")`.  
Transiciones finales (frontend **y** backend):

```text
Cotizado           → Aprobado, Cancelado
Aprobado           → Compras pendientes, En preparacion, Cancelado
Compras pendientes → En preparacion, Cancelado
En preparacion     → Realizado, Cancelado
Realizado          → Cobrado
Cobrado            → (ninguno, salvo admin force — no en UI normal)
Cancelado          → Cotizado
```

Atajos permitidos con sentido de negocio (opcional, documentados):

- `Aprobado` → `En preparacion` (si ya tiene stock / no hace falta mercado).
- No permitir `Cotizado` → `Cobrado` ni `Realizado` → `Aprobado`.

### 1.4 “Siguiente paso” por estado (lo que se ve en pantalla)

Cada vista de evento muestra un bloque **Siguiente paso** con CTA:

| Estado actual | Mensaje | Botón |
|---------------|---------|--------|
| Cotizado | Confirmá con el cliente y registrá la seña | “Marcar aprobado” / “Registrar seña” |
| Aprobado | Armá la compra del evento | “Lista de compras” / “Registrar compra” |
| Compras pendientes | Cargá lo que gastaste en el mercado | “Nueva compra” (con `eventId` precargado) |
| En preparacion | Completá checklist y equipo | “Agregar tarea” / “Registrar horas” |
| Realizado | Cobrà el saldo pendiente | “Registrar pago” |
| Cobrado | Evento cerrado | “Ver finanzas” / “PDF” |
| Cancelado | Podés reabrir como cotización | “Reactivar a Cotizado” |

Reglas de bloqueo suave (advertencia, no muro rígido salvo Cobrado):

- Pasar a **Aprobado** sin `totalPrice > 0` → warning + no bloquear si el usuario confirma.
- Pasar a **Compras pendientes** sin insumos en presupuesto → warning.
- Pasar a **Cobrado** si `amountPaid < totalPrice` → **bloquear** o pedir “registrar quita / descuento” (pago con nota “ajuste”).
- Pasar a **Realizado** si la fecha del evento es futura → warning fuerte.

---

## 2. Mapa de datos: qué se registra, dónde y por qué

### 2.1 Tabla maestra de registro

| Dato de negocio | Dónde se carga | Modelo / campos | Cuándo | Validación mínima |
|-----------------|----------------|-----------------|--------|-------------------|
| Cliente (agenda) | Módulo Clientes o al crear evento | `Client` (name, phone, email, notes) | Primera vez que aparece un contratante recurrente | name required |
| Nombre en evento | Form evento | `Event.client` + `Event.clientId?` | Al cotizar | Si elige de agenda → set `clientId` + copiar name; si libre → solo `client` |
| Evento / presupuesto | Nuevo / Editar evento | `Event` + `Insumo[]` | Cotización | title, date, guests efectivos, totalPrice calculado |
| Adultos / niños | Form evento | Ver §2.2 (campos nuevos o cálculo) | Cotización | adults ≥ 0, kids ≥ 0 |
| Menú / solicitudes | Form evento | `menuNotes`, `recipeName` | Cotización | opcional |
| Insumos del presupuesto | Form evento (desde catálogo) | `Insumo` por evento | Cotización | name, qty, unit, costPerUnit, totalCost |
| Margen y extras | Form evento | `profitMargin`, `extraCosts` | Cotización | ≥ 0 |
| Precio al cliente | Calculado + editable con lock | `totalPrice` | Cotización; **locked** en Realizado/Cobrado | ≥ 0 |
| Estado | Detalle / Historial (mismas reglas) | `Event.status` | Todo el ciclo | Solo transiciones válidas (API) |
| Seña / pagos del cliente | Detalle evento → Pagos | `EventPayment` + `amountPaid` derivado | Aprobado en adelante | amount > 0, método válido |
| Tareas operativas | Detalle evento → Tareas | `EventTask` | Aprobado → Realizado | title required |
| Lista de compras | Módulo Lista (consolidado) | Derivado de eventos Aprobado / Compras pendientes | Pre-mercado | No es entidad persistente de “lista”; es vista |
| Compra de mercado | Gastos mercado / Nueva compra | `MarketPurchase` + items | Compras pendientes | store, paymentMethod, ≥1 item con precio, **eventId recomendado** |
| Proveedor | Proveedores + en compra | `Provider` | Agenda / compra | name required |
| Stock / catálogo | Inventario | `CatalogItem` + `StockMovement` | Antes de cotizar y al reponer | name, unit, price |
| Receta / combo | Recetas | `RecipeCombo` | Setup, reutilizar en cotización | name + items |
| Plantilla de cotización | Plantillas | `QuoteTemplate` | Setup | name, items, guests base |
| Horas / pago personal | Empleados → Actividades | `EmployeeActivity` | Prep y día del evento | employeeId, hours o payment, eventId recomendado |
| Gasto fijo del negocio | Gastos fijos | `FixedCost` | Mensual (no por evento) | name, amount, frequency |
| Nota / recordatorio | Notas (simple) | `Note` | Cualquier momento | title; link opcional a event/provider |
| Foto del evento | Detalle evento | `EventPhoto` | Día del evento / después | size/type ya en backend |
| Cambio de campos clave | Automático | `EventChangeLog` / `NoteChangeLog` | Update | server-side |

### 2.2 Invitados: modelo de datos correcto

**Problema:** hoy se guarda un solo `guests` y la UI miente con “niños comen mitad”.

**Decisión de datos (recomendada):**

Agregar al modelo `Event` (migración Prisma):

```prisma
adults     Int   @default(0)
kids       Int   @default(0)
// guests se mantiene como "comensales efectivos" para reportes y precio/persona
// guests = adults + ceil(kids * 0.5)  ó  round(adults + kids * 0.5)
```

Reglas:

| Campo | Uso |
|-------|-----|
| `adults` | Adultos (1 ración) |
| `kids` | Niños (0.5 ración cada uno) |
| `guests` | **Efectivos** = `adults + kids * 0.5` (redondeo documentado: `Math.ceil` o 1 decimal) |

Al editar:

- Cargar `adults` y `kids` desde DB (no meter `guests` en el campo “adultos”).
- Recalcular `guests` al guardar.
- Precio por persona = `totalPrice / max(guests, 1)` con guests **efectivos**.

Script de migración de datos legacy:

- Eventos viejos: `adults = guests`, `kids = 0`.

### 2.3 Finanzas reales: qué suma y qué resta

**Cotizado (proyección):**

```text
costo_presup = sum(insumos.totalCost) + extraCosts
precio       = totalPrice  (o costo * (1 + margen/100) al cotizar)
ganancia_proy = precio - costo_presup
```

**Real (cierre del evento):**

```text
ingresos_reales     = sum(EventPayment.amount)   // = amountPaid
costo_mercado       = sum(MarketPurchase.totalAmount where eventId)
costo_mano_obra     = sum(EmployeeActivity.payment where eventId)
costo_real          = costo_mercado + costo_mano_obra
margen_real         = ingresos_reales - costo_real
saldo_cliente       = totalPrice - ingresos_reales
variacion_insumos   = costo_mercado - costo_presup_insumos
```

**Gastos fijos:** no se prorratean al evento en v1 del plan (quedan en módulo Finanzas global). Opcional v2: prorrateo mensual / N eventos del mes.

**Implementación:**

- Extender `getEventRealFinancials` en `frontend/src/lib/finance.js`.
- Backend: endpoint `GET /api/events/:id/financials` debe incluir `laborCost` si aún no lo hace (verificar y alinear).
- UI Detalle + Finanzas: mostrar “Mercado”, “Personal”, “Margen real”.

### 2.4 Empleados y actividades — registro completo

Formulario de actividad **debe** pedir y guardar:

| Campo | Requerido | Notas |
|-------|-----------|--------|
| employeeId | sí | |
| date | sí | default now |
| hours | sí si paymentType = Por hora | |
| paymentType | sí | `Por hora` \| `Por evento` \| `Fijo` |
| payment | sí | auto = hours * hourlyRate si Por hora; editable |
| eventId | **muy recomendado** | obligatorio al registrar desde Detalle del evento |
| description | opcional | |

Desde **Detalle del evento**: botón “Registrar horas de equipo” abre el mismo form con `eventId` fijo.

### 2.5 Compras de mercado — registro adecuado

Reglas:

1. Toda compra hecha **para un evento** debe tener `eventId`.
2. Compras sin evento = gasto general (permitido) pero entran en alerta “compras sin evento”.
3. Al crear compra desde Lista de compras:
   - Si la lista es de **un** evento → `eventId` fijo.
   - Si es de **varios** → UI de reparto: elegir un evento “principal” o dividir ítems (v1: elegir evento principal + nota con lista de eventos).
4. Cada item: name, quantity > 0, unit, unitPrice ≥ 0, subtotal calculado.
5. `totalAmount` siempre = sum(subtotals), no editable a mano (o se recalcula al guardar).
6. Fotos de ticket opcionales (límite de tamaño ya en backend).

### 2.6 Pagos del cliente

| Campo | Regla |
|-------|--------|
| amount | > 0 |
| paymentMethod | enum válido (mismo que backend) |
| notes | seña / saldo / ajuste |
| paidAt | default now |

Tras cada pago:

- Recalcular `Event.amountPaid` en backend (fuente de verdad).
- Si `amountPaid >= totalPrice` y status es Realizado → sugerir “Marcar Cobrado” (no auto-forzar sin confirmación).
- Si status es Cobrado, no permitir bajar pagos por debajo del total sin reabrir (admin / confirmación fuerte).

### 2.7 Cliente dual (texto + FK)

Regla de escritura unificada (New + Edit):

```text
SI el usuario elige un Client de la agenda:
  clientId = id
  client   = client.name  (desnormalizado para PDF e historial)

SI escribe nombre libre:
  clientId = null
  client   = texto

SI borra el nombre:
  clientId = null, client = null
```

UI: combobox con “Clientes recientes” + opción “Crear cliente nuevo” (modal mínimo: nombre + teléfono).

### 2.8 Inventario vs insumos del evento

| Concepto | Persistencia | Rol |
|----------|--------------|-----|
| Catálogo | `CatalogItem` | Precios y stock del negocio |
| Línea de presupuesto | `Insumo` (por evento) | Snapshot al cotizar (no se actualiza solo si cambia el catálogo) |
| Movimiento de stock | `StockMovement` | Entrada/salida/ajuste manual |

Regla de pulido (opcional fase 3):

- Al marcar **En preparacion** o **Realizado**, ofrecer “Descontar stock según insumos del evento” (un movimiento Salida por ítem matcheado por nombre). No automático silencioso.

---

## 3. Experiencia de trabajo organizado (UI)

### 3.1 Navegación simplificada (modo asador)

Reorganizar sidebar en **3 capas**:

```text
PRINCIPAL
  · Hoy / Semana          → Dashboard rediseñado (default)
  · Eventos               → Historial (lista + filtros)
  · Calendario            → Mes + toggle Semana
  · Nuevo presupuesto     → CTA primario siempre visible

OPERAR
  · Compras (mercado)     → WeeklyExpenses renombrado
  · Lista de compras
  · Inventario
  · Equipo                → Empleados

GESTIÓN
  · Clientes
  · Finanzas
  · Más ▾                 → Recetas, Plantillas, Proveedores,
                            Gastos fijos, Notas, Cotizador rápido, Exportar
```

**Fuera del menú principal** (siguen existiendo por ruta y Command Palette ⌘K):

- Cotizador rápido, Plantillas, Recetas, Proveedores, Gastos fijos, Notas, Exportar, Operaciones (fusionar alertas en Dashboard).

### 3.2 Dashboard = centro de control semanal

Secciones fijas, en este orden:

1. **Saludo + fecha + CTA “Nuevo presupuesto”**
2. **Esta semana** — lista Lun–Dom con eventos (hora, lugar, estado, saldo). Click → detalle.
3. **Hoy** — si hay eventos hoy: checklist resumida + “Ir al evento”.
4. **Pendientes de acción** (máx 8), generados por reglas:

| Condición | Label de pendiente |
|-----------|-------------------|
| status Cotizado y date en ≤ 7 días | “Confirmar con cliente” |
| status Aprobado sin pagos | “Registrar seña” |
| status Aprobado o Compras pendientes sin purchases | “Hacer / cargar compras” |
| status En preparacion con tasks incompletas | “Completar preparación” |
| status Realizado con saldo > 0 | “Cobrar saldo” |
| stock bajo (ops) | “Reponer insumo X” |
| notas vencidas | “Notas vencidas” |

5. **KPIs** (números honestos): eventos activos, por cobrar ($), eventos esta semana, cobrados del mes.
6. Accesos: Lista compras, Nueva compra, Clientes, Inventario.

### 3.3 Detalle del evento = tablero del trabajo

Layout propuesto:

```text
[Header: título | estado (máquina) | acciones PDF/Editar/Duplicar]
[Siguiente paso — CTA grande]
[KPIs financieros: cotizado | mercado | personal | cobrado | saldo | margen real]
[Tabs o secciones]
   1. Presupuesto (insumos, extras, margen) — link Editar
   2. Dinero (pagos + barra de cobro)
   3. Compras (lista de MarketPurchase del eventId + “Nueva compra”)
   4. Equipo (actividades del eventId + registrar)
   5. Checklist (tareas)
   6. Notas / Fotos
[Historial de cambios — colapsable]
```

Todo lo que se registra “del evento” se hace **desde aquí** con el `eventId` ya puesto. Menos datos huérfanos.

### 3.4 Historial de eventos

- Tabla limpia: fecha, título, cliente, invitados efectivos, total, cobrado, estado, acciones.
- Cambio de estado: **solo** `getAllowedStatuses` (igual que detalle).
- Filtros: estado, rango de fechas, búsqueda.
- Orden default: fecha del evento desc, o próximos primero (toggle).
- Eliminar: ConfirmDialog (ya existe); no `confirm()` nativo.

### 3.5 Calendario

- Toggle **Mes | Semana**.
- Semana: 7 columnas, eventos con hora y color por estado.
- Click → detalle. Botón “+” en un día → Nuevo evento con fecha precargada.

### 3.6 Formularios unificados (estructura de código)

Un solo componente:

```text
components/events/EventForm.jsx
  props: mode = 'create' | 'edit', initialValues, onSubmit, lockedPrice?
```

Usado por `NewEvent` y `EditEvent` (páginas delgadas).

Wizard create (3 pasos) conservado pero:

- Paso 1: datos + cliente + invitados (adults/kids) + fecha/hora/lugar  
- Paso 2: receta/plantilla + insumos (búsqueda/filtro; no grilla infinita sin filtro)  
- Paso 3: extras, margen, resumen, guardar  

Validación con `validators.js` + errores en `FormField`.  
Botón guardar: `disabled={saving}` + texto “Guardando…”.

### 3.7 UX de formularios (estándar de producto)

Esta sección es el **contrato de UX** de todos los formularios de AsamApp.  
Aplica a: Nuevo/Editar evento, Cotizador rápido, Compras, Inventario, Clientes, Empleados/actividades, Pagos, Tareas, Recetas, Plantillas, Proveedores, Gastos fijos, Notas.

#### 3.7.1 Problemas actuales a corregir

| Problema | Dónde se ve hoy | Impacto |
|----------|-----------------|---------|
| 3+ estilos de input distintos | EventDetail vs NewEvent vs Inventory vs History | La app se siente “armada a pedazos” |
| Submit silencioso sin error | Inventario, algunos filters | El usuario cree que “no anda” |
| Validación solo al final o por alert modal | NewEvent (`AlertDialog` genérico) | No se sabe *qué* campo falló |
| Labels inconsistentes (`*`, required, uppercase) | Varias páginas | Lectura lenta en mobile |
| Grillas densas de números (todos los insumos) | NewEvent paso 2, QuickQuote | Imposible en teléfono / catálogo grande |
| Datalist de cliente poco confiable | New/Edit evento | `clientId` no se guarda bien |
| `confirm()` nativo del browser | Clientes, Empleados, FixedCosts | Rompe el look & feel |
| Sin estado “Guardando…” | NewEvent, varios POST | Doble click / datos duplicados |
| Campos sin hint de unidad o ejemplo | Precios, horas, margen | Errores de tipeo ($) |
| Formularios que no priorizan lo esencial | Compra multi-bloque, Notas 59KB | Frustración en uso diario |
| Responsive invertido (2 cols en mobile) | NewEvent / EditEvent | Layout roto en el teléfono del asador |
| Enter / teclado numérico no optimizado | Cantidades, montos | Tipeo lento en mobile |
| Botones de acción lejos del último campo | Varios | Scroll extra innecesario |
| Mezcla de “Crear en página” vs modal vs card expandida | Clientes/Empleados vs Inventory | Cada módulo se aprende de cero |

#### 3.7.2 Sistema único de componentes de form

Kit obligatorio (no inventar estilos por página):

```text
FormField     → label + required + hint + error + aria-invalid
Input         → text, number, date, time, email, tel
Textarea
Select
MoneyInput    → (nuevo o wrapper) number + prefijo $ + locale
QuantityInput → step según unidad (0.1 kg, 1 unidad)
Combobox      → cliente / proveedor / evento (search + elegir + crear rápido)
Button        → primary = submit, outline = cancel, destructive = delete
ConfirmDialog → nunca window.confirm
Toast         → éxito / error post-submit
```

Reglas visuales:

- Label: una sola convención (ej. sentence case o uppercase tracking corto — **elegir una y no mezclar**).
- Required: asterisco rojo vía prop `required` de `FormField`, no texto “Nombre *” a mano.
- Error: texto bajo el campo + borde invalid; el primer error hace scroll/focus al campo.
- Hint: solo cuando aporta (ej. “Niños cuentan como media ración”).
- Altura táctil mínima **44px** en mobile para inputs y botones.
- Espaciado vertical consistente (`space-y-4` entre campos, `gap-4` en grillas).
- En mobile: **1 columna**; en `md+`: 2 columnas solo cuando los campos son cortos (fecha+hora, adultos+niños).

#### 3.7.3 Comportamiento de validación (mismo en todos lados)

```text
1. Al blur del campo → validar ese campo (si ya fue touched).
2. Al submit → validar todo; si falla, NO enviar; focus al primer error.
3. Nunca “return;” sin mensaje.
4. Mensajes en español claro: “La fecha es obligatoria”, no “date required”.
5. Errores de red/API → Toast o banner arriba del form, no solo console.error.
6. Éxito → Toast corto + navegación o reset del form según el caso.
```

Usar `validators.js` como única API de reglas (`required`, `min`, `minLength`, y nuevas: `positive`, `email optional`, `dateNotEmpty`).

#### 3.7.4 Patrones de interacción por tipo de form

| Tipo de form | Patrón UX | Ejemplo en AsamApp |
|--------------|-----------|---------------------|
| **Alta larga** | Wizard por pasos + resumen sticky (desktop) / abajo (mobile) | Nuevo presupuesto |
| **Edición larga** | Una página con secciones en cards (no rehacer wizard obligatorio) | Editar presupuesto |
| **Alta corta** | Card expandible o sheet/modal en la misma lista | Cliente, Proveedor, Empleado |
| **Alta con líneas** | Cabecera + builder de ítems (agregar fila, no 20 campos vacíos) | Compra de mercado, Receta |
| **Acción del evento** | Form inline en el detalle (pago, tarea, horas) con `eventId` fijo | EventDetail |
| **Catálogo** | Form de alta arriba o drawer; edición inline o fila expandida | Inventario |
| **Cálculo en vivo** | Panel resumen que se actualiza al tipear (no hace falta “Calcular”) | Cotizador / NewEvent |

#### 3.7.5 Mejoras concretas por pantalla (checklist de implementación)

**Nuevo / Editar evento**

- [ ] Fix grid: `grid-cols-1 lg:grid-cols-[1.5fr_1fr]`
- [ ] Un solo `EventForm`; labels adults/kids honestos
- [ ] Cliente: Combobox (buscar, elegir, “+ Nuevo cliente”) — no datalist
- [ ] Paso 2 insumos: buscador + chips de seleccionados + “agregar del catálogo”; no grilla de todos los productos a la vez
- [ ] Resumen en vivo siempre visible (sticky desktop; barra inferior mobile con total + Guardar)
- [ ] Validación por campo; no solo AlertDialog genérico
- [ ] Saving state; tras crear → detalle del evento
- [ ] Enter en un input de cantidad no debe “submit” accidental del wizard

**Cotizador rápido**

- [ ] Mismos inputs/resumen que el EventForm (misma sensación)
- [ ] CTA claro: “Convertir en presupuesto” con datos precargados

**Compras (mercado)**

- [ ] Flujo “rápido en el super”: fecha, evento (si hay), tienda, método, ítems
- [ ] Agregar ítem con Enter en el último campo de la fila
- [ ] Precio y subtotal visibles por línea; total grande abajo
- [ ] `eventId` preseleccionado si se viene del evento o de la lista
- [ ] Multi-compra avanzada colapsada (“Agregar otra tienda”) — default 1 compra simple

**Detalle del evento (pagos / tareas / horas)**

- [ ] Mismos `Input`/`Select` del design system (sacar `inputClass` hardcodeado)
- [ ] Pago: monto con teclado numérico (`inputMode="decimal"`)
- [ ] Tarea: un campo + fecha opcional + botón; lista con check grande
- [ ] Horas de equipo: form corto en sección Equipo

**Inventario**

- [ ] Alta con FormField + errores visibles
- [ ] Unidad: select de comunes + “otra”
- [ ] Stock / min stock con hints
- [ ] Edición: cancelar/guardar obvios en mobile

**Clientes / Empleados / Proveedores**

- [ ] Mismo patrón: botón “Nuevo” → form en card o drawer
- [ ] ConfirmDialog para borrar
- [ ] Teléfono con `type="tel"`
- [ ] Actividad de empleado: paymentType + payment auto + event opcional/requerido según origen

**Notas**

- [ ] Crear rápido: título + fecha + guardar (3 campos)
- [ ] Resto de opciones en “Más”

**Login / Register**

- [ ] Ya más limpios; alinear solo con FormField si hace falta consistencia

#### 3.7.6 Accesibilidad y mobile (mínimo)

- Labels asociados (htmlFor / id) o FormField que lo resuelva.
- `aria-invalid` y `role="alert"` en errores (FormField ya lo soporta).
- Orden de tab lógico.
- No depender solo del color para error (texto también).
- En PWA mobile: evitar zoom raro en iOS (font-size ≥ 16px en inputs).
- Botón primario full-width en mobile en forms de una columna.

#### 3.7.7 Microcopy (textos de form)

| Mal | Bien |
|-----|------|
| “Submit” / “OK” | “Guardar presupuesto” / “Registrar compra” |
| “Error” | “No se pudo guardar. Revisá la conexión e intentá de nuevo.” |
| “Niños (Comen mitad)” si no calcula mitad | O se calcula, o el label no lo promete |
| Placeholders que repiten el label | Placeholder con ejemplo: “Ej. Cumpleaños de Juan” |
| “Total invitados” + “Niños” confusos | “Adultos” + “Niños (½ ración)” + “Equivalente: 22” en vivo |

#### 3.7.8 Criterios de aceptación UX de forms

Un formulario está “pulido” solo si:

1. Se entiende **qué** se está cargando sin leer un manual.
2. Los campos obligatorios se ven antes de fallar.
3. Un error se explica **en el campo** o con mensaje accionable.
4. En un teléfono de 390px de ancho se puede completar sin zoom horizontal.
5. Guardar da feedback (loading + éxito o error) en &lt; 100ms de respuesta percibida de UI.
6. Se ve y se comporta como el resto de la app (mismo kit).
7. Los datos correctos quedan en el modelo correcto (sin campos “fantasma” o clientId perdido).

#### 3.7.9 Sesión de revisión en local (antes de codear UX)

Con la app corriendo (`http://localhost:5173`), el usuario indica pantalla por pantalla:

| # | Ruta sugerida | Qué mirar juntos |
|---|---------------|------------------|
| 1 | `/` Dashboard | ¿Se entiende por dónde empezar? |
| 2 | `/new-event` | Wizard, insumos, resumen, mobile |
| 3 | `/history` + detalle | Estados, pagos, tareas |
| 4 | `/weekly-expenses/new` | Compra en el super |
| 5 | `/inventory` | Alta de insumo |
| 6 | `/clients` + `/employees` | Altas cortas y deletes |
| 7 | `/quick-quote` | Paridad con nuevo evento |
| 8 | `/notes` | Complejidad vs uso real |

**Salida de la sesión:** lista priorizada “UX forms — hallazgos del usuario” que se anexa a este doc (§3.7.10) y ajusta el orden de la Fase 3.

#### 3.7.10 Hallazgos de la sesión local (2026-07-15)

| # | Pantalla | Feedback del usuario | Prioridad | Acción |
|---|----------|----------------------|-----------|--------|
| 1 | Inicio / Dashboard | Bien; mejorar si aporta | P2 | Mejoras del plan (semana / pendientes) en Fase 4 |
| 2 | Calendario | Bien; se mejora con el plan | P2 | Vista semana en Fase 4 |
| 3 | Historial | Buscador con fondo negro feo; pulir pantalla | **P0** | Inputs del theme; quitar hardcodes |
| 4 | Clientes | Mejorar | **P1** | Form + ConfirmDialog + detalle |
| 5 | Empleados | Bien; falta lo del plan | P1 | paymentType / eventId (Fase 2) |
| 6 | Cotizador rápido | Formulario feo | **P0** | Rediseño + tokens de theme |
| 7 | Plantillas | Mejorar formulario | **P0** | FormField + layout claro |
| 8 | Insumos | Bien | — | Mantener |
| 9 | Recetas | Analizar mejoras | P1 | Ver análisis §3.7.11 |
| 10 | Proveedores | Bien; pulir opcional | P2 | Alineación menor |
| 11 | Gastos mercado | Muy desordenado; no se sabe qué hacer | **P0** | Flujo por pasos numerados + modo simple |
| 12 | Lista compras | ¿Está bien? | P1 | Ver análisis §3.7.11 |
| 13 | Operaciones | No se entiende el valor | P1 | Ver análisis §3.7.11 |

#### 3.7.11 Análisis rápido (Recetas · Lista compras · Operaciones)

**Recetas — ¿está bien?**  
Funciona como catálogo de combos con tags de ítems, pero: (1) los ítems se guardan como tags de texto (`quantity: 0`) sin cantidades reales del inventario; (2) al aplicar a un evento, la utilidad depende de que los nombres matcheen el catálogo; (3) el form usa inputs sueltos sin FormField. **Veredicto:** útil como “menú base”, incompleto como “receta con cantidades”. Mejora futura: ítems con qty/unidad desde inventario (como plantillas).

**Lista de compras — ¿está bien?**  
Concepto correcto (consolida insumos de eventos Aprobado / Compras pendientes → crear compra). Problemas: filtros de estado poco claros para un no-técnico; no dice “qué hacer después” si la lista está vacía; multi-evento en una sola compra es débil. **Veredicto:** se queda; hay que mejorar copy y empty-state guiado, no rehacerlo.

**Operaciones — ¿está bien?**  
Es un resumen (eventos activos, por cobrar, stock bajo, tareas) que **duplica** lo que el Dashboard y el plan de “pendientes” deberían mostrar. **Veredicto:** no borrar aún; en Fase 4 fusionar en Dashboard y dejar Operaciones como redirect o quitar del menú principal.

### 3.8 Notas (simplificar superficie)

- Vista default: lista de pendientes de **hoy / vencidas / próximas** + crear rápido.
- Modo avanzado (kanban, tags, recurrencia) detrás de “Más opciones”.
- Siempre permitir `eventId` al crear desde el evento.

---

## 4. Reglas de integridad (frontend + backend)

### 4.1 Una sola máquina de estados en el servidor

Hoy las transiciones viven solo en el frontend. **Hay que validar en backend** al `PUT /api/events/:id` y al endpoint de status:

```text
SI newStatus !== currentStatus:
  SI newStatus no está en allowedTransitions[currentStatus]:
    → 400 { error: 'Transición de estado no permitida', from, to }
```

Compartir la misma tabla de transiciones (archivo común o duplicar test-cubierto en backend).

### 4.2 Validaciones de payload (ampliar `validation.js`)

| Recurso | Reglas nuevas / reforzadas |
|---------|----------------------------|
| Event | title required; date formato; adults/kids ≥ 0; guests recalculado server-side; status en enum; totalPrice ≥ 0; insumos con qty ≥ 0 |
| Payment | amount > 0; method en enum |
| MarketPurchase | store required; items.length ≥ 1; cada item qty > 0, unitPrice ≥ 0; total = sum |
| EmployeeActivity | employeeId; paymentType en enum; payment ≥ 0; hours ≥ 0 |
| Client | name required |
| CatalogItem | name, unit, price ≥ 0 |

### 4.3 Idempotencia y doble submit

- Botones mutantes deshabilitados mientras `saving`.
- Toasts de éxito/error en **todos** los módulos (no solo Employees).
- Tras crear evento → navegar a `/history/:id` (detalle), no solo a lista, para seguir el flujo (“siguiente paso”).

### 4.4 Campos derivados (solo servidor o con recalculo único)

| Derivado | Fuente de verdad |
|----------|------------------|
| `amountPaid` | sum de payments en backend al crear/borrar pago |
| `totalAmount` compra | sum de items |
| `guests` | adults + kids * 0.5 |
| `payment` actividad por hora | hours * employee.hourlyRate (si no se override) |

El frontend puede previsualizar, pero el backend debe **recalcular o verificar** al guardar.

### 4.5 Bloqueo de precio

Ya parcialmente en EditEvent (`Realizado`, `Cobrado`). Extender:

- API rechaza cambio de `totalPrice` / insumos de costo si status ∈ {Realizado, Cobrado} salvo rol admin.
- Se permiten: pagos, fotos, notas, tareas “post-mortem”.

---

## 5. Plan de implementación por fases

Cada fase tiene **entregable**, **archivos tocados**, **criterios de aceptación** y **riesgo**.

---

### FASE 0 — Alineación y baseline (½ día)

**Objetivo:** no romper lo que funciona; medir antes de cambiar.

| Tarea | Detalle |
|-------|---------|
| 0.1 | Backup DB (`npm run backup`) |
| 0.2 | Correr tests backend + lint frontend |
| 0.3 | Documentar este plan en `docs/` (este archivo) |
| 0.4 | Lista de rutas y status actuales en un checklist manual de humo |

**Aceptación:** backup ok, tests verdes, plan revisado.

---

### FASE 1 — Motor de flujo y datos correctos (núcleo) — 2–3 días

**Objetivo:** el workflow es uno solo y los números de invitados/estado son honestos.

| # | Tarea | Archivos / capa | Criterio de aceptación |
|---|--------|-----------------|------------------------|
| 1.1 | Unificar estados: quitar `Pendiente` de UI y default | `eventStatus.js`, schema default, seed/migración SQL, History, Dashboard filtros | No aparece Pendiente; eventos viejos migrados a Cotizado |
| 1.2 | Transiciones idénticas en Historial y Detalle | `History.jsx`, `EventDetail.jsx` | Mismo dropdown; no se puede saltar a Cobrado desde Cotizado |
| 1.3 | Validar transiciones en API | `backend/server.js` o módulo `eventStatus.js` backend + tests | Test: 400 en transición ilegal |
| 1.4 | adults / kids + guests efectivos | schema + migración + NewEvent + EditEvent + quote | Label “niños ½” coincide con cálculo; edit no doble-cuenta |
| 1.5 | Status inicial al crear = Cotizado | `NewEvent.jsx`, backend default | Nuevo evento nace Cotizado |
| 1.6 | Post-create → detalle del evento | `NewEvent.jsx` | Redirect `/history/:id` |
| 1.7 | Métricas Dashboard honestas | `finance.js`, `Dashboard.jsx` | “Cerrados/cobrados” = Cobrado; por cobrar excluye cancelados |

**Riesgo:** migración de status; mitigar con backup + script idempotente.

**Tests:** unit `eventStatus` transitions; integration status 400; unit guests efectivos.

---

### FASE 2 — Registro financiero y operativo completo — 2–3 días

**Objetivo:** todo lo que cuesta y se cobra queda registrado y se ve en el evento.

| # | Tarea | Criterio de aceptación |
|---|--------|------------------------|
| 2.1 | Form actividad empleado con paymentType + payment auto | Se guarda y se lista; desde evento lleva eventId |
| 2.2 | `getEventRealFinancials` incluye laborCost | Margen real = cobrado − mercado − personal |
| 2.3 | Detalle evento: sección Compras del evento + CTA | Lista purchases filtradas; nueva compra con eventId |
| 2.4 | Detalle evento: sección Equipo | Lista activities; alta rápida |
| 2.5 | Bloqueo Cobrado si saldo > 0 (o flujo de ajuste) | No se cierra a Cobrado con deuda sin confirmación explícita de ajuste |
| 2.6 | amountPaid solo vía payments (verificar backend) | No se edita amountPaid a mano desde UI de evento |
| 2.7 | Compra: totalAmount siempre sum(items) | UI y API alineados |
| 2.8 | Alerta / badge “compra sin evento” ya existente se muestra en Dashboard | Visible en pendientes |

**Archivos clave:** `Employees.jsx`, `EventDetail.jsx`, `finance.js`, `NewMarketPurchase.jsx`, backend payments/activities.

---

### FASE 3 — UX de formularios unificada (eje principal de pulido) — 3–5 días

**Objetivo:** un solo sistema de forms; validación visible; uso cómodo en mobile y en el día a día.  
**Depende de:** sesión local §3.7.9 (hallazgos del usuario en §3.7.10).  
**Referencia completa:** §3.7.

| # | Tarea | Criterio de aceptación |
|---|--------|------------------------|
| 3.0 | Incorporar hallazgos §3.7.10 al backlog de esta fase | Prioridades P0/P1 acordadas |
| 3.1 | Extraer `EventForm` compartido + kit FormField en New/Edit | Misma UX create/edit |
| 3.2 | Validación blur+submit con validators en Event, Client, Employee, Purchase, Inventory, Payment | Errores en campo; no submits silenciosos |
| 3.3 | Reemplazar `confirm()` por ConfirmDialog | Clientes, Empleados, FixedCosts |
| 3.4 | Combobox cliente/proveedor/evento + crear rápido | clientId confiable; sin datalist frágil |
| 3.5 | Inventario y compras con feedback de error/éxito | Toast o error inline siempre |
| 3.6 | Saving states + botones disabled en todos los POST/PUT principales | No double-submit |
| 3.7 | Fix responsive + touch targets 44px + inputMode en montos | 1 col mobile; usable con el pulgar |
| 3.8 | Insumos en cotización: buscador + seleccionados (no grilla infinita) | Escala con catálogo grande |
| 3.9 | EventDetail: pagos/tareas/horas con el mismo kit de inputs | Cero `inputClass` hardcodeado |
| 3.10 | Compra “modo simple” default; multi-tienda avanzado colapsado | Flujo super en &lt; 1 min |
| 3.11 | Barra sticky de total+guardar en mobile (evento/compra) | Guardar sin scrollear al cielo |
| 3.12 | Microcopy y labels honestos (§3.7.7) | Textos de botones y hints revisados |
| 3.13 | Checklist §3.7.8 en las 8 pantallas de la sesión | Cada form cumple los 7 puntos de “pulido” |

---

### FASE 4 — Organización visual del trabajo semanal — 2–3 días

**Objetivo:** al abrir la app se entiende qué hacer esta semana.

| # | Tarea | Criterio de aceptación |
|---|--------|------------------------|
| 4.1 | Redesign Dashboard según §3.2 | Semana + pendientes + KPIs correctos |
| 4.2 | Bloque “Siguiente paso” en EventDetail | Cambia según status; CTA lleva a la acción |
| 4.3 | Sidebar reorganizado §3.1 | Nuevo presupuesto visible; menú “Más” |
| 4.4 | Calendario vista Semana | Toggle mes/semana usable en mobile |
| 4.5 | Renombrar en UI “Gastos Mercado” → “Compras” | Copy coherente (rutas pueden mantenerse) |
| 4.6 | Fusionar resumen de Operaciones en Dashboard | Menos un destino confuso |
| 4.7 | Notas: default simple | Crear recordatorio en < 10 s |

---

### FASE 5 — Limpieza y endurecimiento — 1–2 días

| # | Tarea | Criterio de aceptación |
|---|--------|------------------------|
| 5.1 | Eliminar o absorber `History.css` al theme | Sin colores hardcodeados sueltos |
| 5.2 | Mapa único de colores de status | Un export, usado en History/Detail/Dashboard/Calendar |
| 5.3 | i18n: cablear nav + estados **o** ocultar switcher EN | No mentir con un toggle vacío |
| 5.4 | Partir Notes.jsx en componentes | Archivo principal < ~300 líneas o módulos claros |
| 5.5 | Tests E2E humo del flujo feliz | Cotizar → aprobar → compra → pago → cobrado |
| 5.6 | Actualizar README + CHANGELOG + openapi status enum | Docs = realidad |

---

## 6. Flujo feliz de punta a punta (aceptación global)

Escenario de prueba manual / E2E:

```text
1. Crear cliente "Familia Pérez" (teléfono).
2. Nuevo presupuesto → fecha esta semana, 20 adultos, 4 niños
   → guests efectivos = 22 (si 0.5*4)
   → receta o insumos, margen 30%, guardar.
3. Verificar status Cotizado y redirect a detalle.
4. Registrar seña 30% → amountPaid actualizado.
5. Marcar Aprobado → Siguiente paso: compras.
6. Lista de compras incluye el evento → Crear compra → eventId seteado
   → items con precios → guardar.
7. Status → Compras pendientes → En preparacion.
8. Agregar tareas; marcar hechas.
9. Registrar 4h de ayudante vinculadas al evento → se ve en costo personal.
10. Marcar Realizado.
11. Registrar pago del saldo → sugerir Cobrado → confirmar.
12. Verificar margen real = cobrado - mercado - personal.
13. Dashboard: evento ya no en “por cobrar”; aparece en cobrados del mes.
14. Intentar en Historial pasar otro evento de Cotizado a Cobrado → debe fallar.
```

Si los 14 puntos pasan, el flujo está **organizado y los datos se registran bien**.

---

## 7. Diagrama de dependencias entre fases

```text
Fase 0 (baseline)
    │
    ▼
Fase 1 (estados + invitados + API)  ──── no empezar UI grande sin esto
    │
    ├──────────────► Fase 2 (finanzas reales + compras/equipo en evento)
    │
    └──────────────► Fase 3 (forms unificados)  [puede solaparse con 2 en paralelo]
                           │
                           ▼
                     Fase 4 (Dashboard / nav / semana)
                           │
                           ▼
                     Fase 5 (limpieza + E2E + docs)
```

**Paralelizable:** 2 y 3 tras cerrar 1.  
**No paralelizar:** 4 depende de 1 (estados) y se beneficia de 2 (pendientes reales).

---

## 8. Criterios de “hecho” del proyecto (Definition of Done)

- [x] Un solo grafo de estados en UI y API; sin `Pendiente` (legacy → Cotizado).
- [x] adults/kids/guests consistentes y documentados.
- [x] Cada compra de evento y cada hora de personal pueden cargarse **desde el evento** y aparecen en su finanza real.
- [x] **Formularios críticos** usan kit FormField/Input/Select/Toast/ConfirmDialog (EventForm, compras, equipo, gastos fijos, etc.).
- [x] No hay submit silencioso en flujos críticos; saving state en mutaciones principales.
- [x] Forms usables en mobile (grids responsive corregidos).
- [x] Checklist UX parcial en evento, compra, inventario, clientes, empleados, pagos (pulido iterativo).
- [x] Dashboard responde: “¿qué tengo esta semana y qué me falta hacer?”.
- [x] Historial no permite saltos ilegales de estado (mismas reglas que detalle + API).
- [x] Tests de transición + flujo E2E workflow en `e2e/workflow.spec.js`.
- [x] CHANGELOG y README actualizados (v2.2.0).

---

## 9. Fuera de alcance (explícito)

Para no desviar el pulido:

- App mobile nativa (PWA alcanza).
- Facturación electrónica / AFIP.
- Multi-empresa avanzada más allá del multi-tenant actual.
- Chat / WhatsApp integrado.
- Prorrateo automático de gastos fijos al evento (queda como mejora futura).
- Rediseño total de la landing.

---

## 10. Orden de ejecución sugerido al implementar

Cuando se diga “empezá a implementar”, el orden operativo es:

0. **Sesión local UX forms** (§3.7.9) — capturar hallazgos en §3.7.10 **antes** de codear forms a ciegas.  
1. **Fase 1.1–1.3** estados (más impacto en flujo con menos UI).  
2. **Fase 1.4–1.7** invitados + dashboard metrics.  
3. **Fase 2** finanzas reales en el evento.  
4. **Fase 3** UX de formularios completa (kit + EventForm + pantallas P0 de la sesión).  
5. **Fase 4.1–4.2** Dashboard + Siguiente paso (se “ve” el flujo).  
6. Resto de 4 y 5.

---

## 11. Resumen en una frase

> **Cada evento avanza por estados reales y controlados; en cada estado la app pide y guarda los datos correctos con formularios claros y del mismo sistema; y al abrir AsamApp se ve la semana y lo que falta hacer — no un menú de 18 herramientas sueltas.**

---

## 12. Entorno local de revisión

Para la sesión de UX (y desarrollo):

| Servicio | URL |
|----------|-----|
| Frontend (app) | http://localhost:5173/ |
| Login | http://localhost:5173/login |
| Backend API | http://localhost:3000/ |
| API docs | http://localhost:3000/api/docs |

Arranque típico: `INICIAR.bat` o backend `node server.js` + frontend `npm run dev`.

---

*Documento vivo: actualizar este archivo al cerrar cada fase (fecha + checkboxes del §8) y al completar §3.7.10 con hallazgos de la sesión local.*
