// ── DATA ──────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '📋', title: 'Cotizador de eventos', desc: 'Calculá el precio automáticamente con insumos del catálogo, margen de ganancia y costos extra.' },
  { icon: '📅', title: 'Historial de eventos', desc: 'Seguí cada evento desde cotización hasta cobro con estados controlados y trazabilidad completa.' },
  { icon: '💰', title: 'Registro de pagos', desc: 'Registrá señas y pagos finales. El sistema calcula automáticamente el saldo pendiente.' },
  { icon: '🛒', title: 'Gastos de mercado', desc: 'Registrá cada compra con items, proveedor, método de pago y fotos de comprobante.' },
  { icon: '📦', title: 'Inventario con stock', desc: 'Controlá stock de insumos con movimientos de entrada, salida y ajuste en tiempo real.' },
  { icon: '🍖', title: 'Recetas y combos', desc: 'Guardá combinaciones de insumos reutilizables para cargar eventos en segundos.' },
  { icon: '📄', title: 'Plantillas de cotización', desc: 'Creá plantillas con precios, márgenes y menús predefinidos para agilizar presupuestos.' },
  { icon: '🏪', title: 'Proveedores', desc: 'Agenda de vendedores con historial de compras y datos de contacto.' },
  { icon: '🧾', title: 'Lista de compras', desc: 'Consolidá automáticamente los insumos de todos los eventos aprobados en una sola lista.' },
  { icon: '📊', title: 'Finanzas y rentabilidad', desc: 'Compará cotizado vs gastado vs cobrado. Ganancia real por evento y resumen global.' },
  { icon: '📆', title: 'Calendario', desc: 'Vista mensual de todos tus eventos con estado y datos clave de un vistazo.' },
  { icon: '⚡', title: 'Cotizador rápido', desc: 'Calculá el precio de un asado al instante sin crear un evento. Convertilo cuando quieras.' },
  { icon: '🏢', title: 'Gastos fijos', desc: 'Registrá costos recurrentes del negocio (gas, transporte, equipamiento) para conocer tu rentabilidad real.' },
  { icon: '🔔', title: 'Alertas inteligentes', desc: 'El dashboard te avisa de eventos sin confirmar, tareas pendientes y cobros atrasados.' },
  { icon: '📜', title: 'Historial de cambios', desc: 'Cada cambio de precio o estado queda registrado automáticamente con fecha y valor anterior.' },
  { icon: '📥', title: 'Exportar datos', desc: 'Descargá tus eventos y compras en JSON o CSV para respaldo o análisis externo.' },
  { icon: '🔍', title: 'Búsqueda global', desc: 'Encontrá eventos, insumos, proveedores y notas desde cualquier pantalla.' },
  { icon: '📝', title: 'Notas y recordatorios', desc: 'Bloc de notas integrado con checklist para ideas, pendientes y recordatorios del negocio.' },
];

const WORKFLOW = [
  { title: 'El cliente te contacta', desc: 'Cargás el evento con fecha, lugar, cantidad de invitados y menú.', badge: 'Estado: Cotizado' },
  { title: 'Generás el presupuesto', desc: 'El sistema calcula el precio con tus insumos, margen y costos extra. Descargás el PDF para enviarle al cliente.', badge: 'PDF automático' },
  { title: 'El cliente confirma y paga la seña', desc: 'Registrás el pago parcial. El estado avanza a Aprobado.', badge: 'Estado: Aprobado' },
  { title: 'Comprás los insumos', desc: 'Registrás cada compra vinculada al evento. La lista de compras se genera sola.', badge: 'Estado: Compras pendientes' },
  { title: 'Día del evento', desc: 'Tildás las tareas del checklist operativo a medida que avanzás.', badge: 'Estado: En preparación' },
  { title: 'Cobrás el saldo final', desc: 'Registrás el pago restante. El sistema muestra la ganancia real del evento.', badge: 'Estado: Cobrado ✓' },
];

const PROS = [
  { icon: '🔒', title: '100% local y privado', desc: 'Tus datos nunca salen de tu computadora. Sin servidores externos, sin suscripciones.' },
  { icon: '⚡', title: 'Rápido y sin fricción', desc: 'Instalación en minutos. Sin registro, sin configuración compleja.' },
  { icon: '💸', title: 'Gratis para siempre', desc: 'Open source bajo licencia ISC. Sin planes, sin límites de eventos.' },
  { icon: '📱', title: 'Responsive', desc: 'Funciona en desktop, tablet y celular desde el navegador.' },
  { icon: '🔄', title: 'Flujo de estados controlado', desc: 'No podés saltear pasos. El sistema guía el workflow de cada evento.' },
  { icon: '📈', title: 'Rentabilidad real', desc: 'Sabés exactamente cuánto ganás por evento, no solo cuánto cotizaste.' },
  { icon: '🗂️', title: 'Todo integrado', desc: 'Inventario, proveedores, finanzas y operaciones en una sola app coherente.' },
  { icon: '🛡️', title: 'Autenticación opcional', desc: 'Activá login con usuario y contraseña si compartís la computadora.' },
];

const STACK = [
  { icon: '⚛️', name: 'React 19', label: 'Frontend' },
  { icon: '⚡', name: 'Vite', label: 'Build tool' },
  { icon: '🎨', name: 'Tailwind CSS 4', label: 'Estilos' },
  { icon: '🟢', name: 'Node.js + Express 5', label: 'Backend' },
  { icon: '🔷', name: 'Prisma ORM', label: 'Base de datos' },
  { icon: '🗄️', name: 'SQLite', label: 'Almacenamiento' },
];

// ── RENDER ────────────────────────────────────────────────────────────────

function renderFeatures() {
  const grid = document.getElementById('features-grid');
  grid.innerHTML = FEATURES.map(f => `
    <div class="feature-card fade-in">
      <div class="feature-icon">${f.icon}</div>
      <div>
        <h3>${f.title}</h3>
        <p>${f.desc}</p>
      </div>
    </div>
  `).join('');
}

function renderWorkflow() {
  const el = document.getElementById('workflow-steps');
  el.innerHTML = WORKFLOW.map((s, i) => `
    <div class="wf-step fade-in">
      <div class="wf-num">${i + 1}</div>
      <div class="wf-content">
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <span class="wf-badge">${s.badge}</span>
      </div>
    </div>
  `).join('');
}

function renderPros() {
  const grid = document.getElementById('pros-grid');
  grid.innerHTML = PROS.map(p => `
    <div class="pro-card fade-in">
      <div class="pro-check">${p.icon}</div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
    </div>
  `).join('');
}

function renderStack() {
  const grid = document.getElementById('stack-grid');
  grid.innerHTML = STACK.map(s => `
    <div class="stack-card fade-in">
      <span class="stack-icon">${s.icon}</span>
      <div>
        <div class="stack-name">${s.name}</div>
        <div class="stack-label">${s.label}</div>
      </div>
    </div>
  `).join('');
}

// ── SCROLL ANIMATIONS ─────────────────────────────────────────────────────

function initObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ── NAV SCROLL ────────────────────────────────────────────────────────────

window.addEventListener('scroll', () => {
  document.getElementById('nav').style.background =
    window.scrollY > 40 ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.85)';
});

// ── INIT ──────────────────────────────────────────────────────────────────

renderFeatures();
renderWorkflow();
renderPros();
renderStack();
// Re-observe after dynamic render
setTimeout(initObserver, 50);
