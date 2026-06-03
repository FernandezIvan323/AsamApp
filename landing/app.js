// ── DATA ──────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: 'clipboard', title: 'Cotizador de eventos', desc: 'Calculá el precio automáticamente con insumos del catálogo, margen de ganancia y costos extra.' },
  { icon: 'calendar', title: 'Historial de eventos', desc: 'Seguí cada evento desde cotización hasta cobro con estados controlados y trazabilidad completa.' },
  { icon: 'dollar', title: 'Registro de pagos', desc: 'Registrá señas y pagos finales. El sistema calcula automáticamente el saldo pendiente.' },
  { icon: 'cart', title: 'Gastos de mercado', desc: 'Registrá cada compra con items, proveedor, método de pago y fotos de comprobante.' },
  { icon: 'package', title: 'Inventario con stock', desc: 'Controlá stock de insumos con movimientos de entrada, salida y ajuste en tiempo real.' },
  { icon: 'utensils', title: 'Recetas y combos', desc: 'Guardá combinaciones de insumos reutilizables para cargar eventos en segundos.' },
  { icon: 'file', title: 'Plantillas de cotización', desc: 'Creá plantillas con precios, márgenes y menús predefinidos para agilizar presupuestos.' },
  { icon: 'store', title: 'Proveedores', desc: 'Agenda de vendedores con historial de compras y datos de contacto.' },
  { icon: 'list', title: 'Lista de compras', desc: 'Consolidá automáticamente los insumos de todos los eventos aprobados en una sola lista.' },
  { icon: 'chart', title: 'Finanzas y rentabilidad', desc: 'Compará cotizado vs gastado vs cobrado. Ganancia real por evento y resumen global.' },
  { icon: 'calendar-days', title: 'Calendario', desc: 'Vista mensual de todos tus eventos con estado y datos clave de un vistazo.' },
  { icon: 'zap', title: 'Cotizador rápido', desc: 'Calculá el precio de un asado al instante sin crear un evento. Convertilo cuando quieras.' },
  { icon: 'building', title: 'Gastos fijos', desc: 'Registrá costos recurrentes del negocio (gas, transporte, equipamiento) para conocer tu rentabilidad real.' },
  { icon: 'bell', title: 'Alertas inteligentes', desc: 'El dashboard te avisa de eventos sin confirmar, tareas pendientes y cobros atrasados.' },
  { icon: 'history', title: 'Historial de cambios', desc: 'Cada cambio de precio o estado queda registrado automáticamente con fecha y valor anterior.' },
  { icon: 'download', title: 'Exportar datos', desc: 'Descargá tus eventos y compras en JSON o CSV para respaldo o análisis externo.' },
  { icon: 'search', title: 'Búsqueda global', desc: 'Encontrá eventos, insumos, proveedores y notas desde cualquier pantalla.' },
  { icon: 'sticky', title: 'Notas y recordatorios', desc: 'Bloc de notas integrado con checklist para ideas, pendientes y recordatorios del negocio.' },
];

const WORKFLOW = [
  { title: 'El cliente te contacta', desc: 'Cargás el evento con fecha, lugar, cantidad de invitados y menú.', badge: 'Cotizado' },
  { title: 'Generás el presupuesto', desc: 'El sistema calcula el precio con tus insumos, margen y costos extra. Descargás el PDF.', badge: 'PDF automático' },
  { title: 'El cliente confirma y paga la seña', desc: 'Registrás el pago parcial. El estado avanza a Aprobado.', badge: 'Aprobado' },
  { title: 'Comprás los insumos', desc: 'Registrás cada compra vinculada al evento. La lista se genera sola.', badge: 'Compras' },
  { title: 'Día del evento', desc: 'Tildás las tareas del checklist operativo a medida que avanzás.', badge: 'Preparación' },
  { title: 'Cobrás el saldo final', desc: 'Registrás el pago restante. El sistema muestra la ganancia real del evento.', badge: 'Cobrado' },
];

const PROS = [
  { icon: 'lock', title: '100% local y privado', desc: 'Tus datos nunca salen de tu computadora. Sin servidores externos, sin suscripciones.' },
  { icon: 'zap', title: 'Rápido y sin fricción', desc: 'Instalación en minutos. Sin registro, sin configuración compleja.' },
  { icon: 'heart', title: 'Gratis para siempre', desc: 'Open source bajo licencia ISC. Sin planes, sin límites de eventos.' },
  { icon: 'mobile', title: 'Responsive', desc: 'Funciona en desktop, tablet y celular desde el navegador.' },
  { icon: 'shield', title: 'Flujo de estados controlado', desc: 'No podés saltear pasos. El sistema guía el workflow de cada evento.' },
  { icon: 'trending', title: 'Rentabilidad real', desc: 'Sabés exactamente cuánto ganás por evento, no solo cuánto cotizaste.' },
  { icon: 'layers', title: 'Todo integrado', desc: 'Inventario, proveedores, finanzas y operaciones en una sola app coherente.' },
  { icon: 'key', title: 'Autenticación opcional', desc: 'Activá login con usuario y contraseña si compartís la computadora.' },
];

const STACK = [
  { icon: 'react', name: 'React 19', label: 'Frontend' },
  { icon: 'vite', name: 'Vite', label: 'Build tool' },
  { icon: 'tailwind', name: 'Tailwind CSS 4', label: 'Estilos' },
  { icon: 'node', name: 'Node.js + Express', label: 'Backend' },
  { icon: 'prisma', name: 'Prisma ORM', label: 'Base de datos' },
  { icon: 'db', name: 'SQLite', label: 'Almacenamiento' },
  { icon: 'docker', name: 'Docker', label: 'Contenedores' },
  { icon: 'gh', name: 'GitHub Actions', label: 'CI/CD' },
];

const FAQ = [
  { q: '¿Necesito conexión a internet para usar AsamApp?', a: 'No. AsamApp corre completamente en tu computadora. Solo necesitás internet para la instalación inicial y para acceder desde otro dispositivo en tu red local.' },
  { q: '¿Hay límite de eventos que puedo crear?', a: 'No hay ningún límite. AsamApp es completamente gratuito y podés crear todos los eventos que quieras sin restricciones.' },
  { q: '¿Puedo compartir la app con mi equipo?', a: 'Sí. Cualquier persona en tu red local puede acceder desde el navegador. También podés activar la autenticación opcional si querés proteger el acceso.' },
  { q: '¿Cómo se guarda mi información?', a: 'Todos los datos se almacenan localmente en una base de datos SQLite dentro de tu computadora. No hay servidores externos ni sincronización en la nube.' },
  { q: '¿Puedo exportar mis datos?', a: 'Sí. Podés descargar tus eventos y compras en formato JSON o CSV para respaldo o para analizarlos en otras herramientas.' },
  { q: '¿AsamApp funciona en celular o tablet?', a: 'Sí. La interfaz es responsive y se adapta a cualquier tamaño de pantalla. Accedés desde el navegador de tu dispositivo.' },
];

const ICONS = {
  clipboard: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>',
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
  'calendar-days': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
  dollar: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  cart: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>',
  package: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  utensils: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
  file: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  store: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>',
  list: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
  chart: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>',
  zap: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  building: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>',
  bell: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  history: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
  download: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>',
  sticky: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><polyline points="14 2 14 8 20 8"/></svg>',
  lock: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  mobile: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>',
  shield: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
  trending: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  layers: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>',
  key: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>',
  react: '⚛️',
  vite: '⚡',
  tailwind: '🎨',
  node: '🟢',
  prisma: '🔷',
  db: '🗄️',
  docker: '🐳',
  gh: '🤖',
};

// ── RENDER ────────────────────────────────────────────────────────────────

function icon(name) {
  return ICONS[name] || '';
}

function renderFeatures() {
  const grid = document.getElementById('features-grid');
  grid.innerHTML = FEATURES.map(f => `
    <div class="feature-card fade-in" tabindex="0">
      <div class="feature-icon">${icon(f.icon)}</div>
      <h3>${f.title}</h3>
      <div class="feature-desc"><p>${f.desc}</p></div>
    </div>
  `).join('');
  grid.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', function() {
      const was = this.classList.contains('expanded');
      grid.querySelectorAll('.feature-card.expanded').forEach(c => c.classList.remove('expanded'));
      if (!was) this.classList.add('expanded');
    });
    card.addEventListener('mouseleave', function() {
      this.classList.remove('expanded');
    });
  });
}

function renderWorkflow() {
  const el = document.getElementById('workflow-steps');
  let html = '';
  WORKFLOW.forEach((s, i) => {
    html += `
      <div class="wf-step fade-in">
        <div class="wf-num">${i + 1}</div>
        <div class="wf-content">
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
          <span class="wf-badge">${s.badge}</span>
        </div>
      </div>`;
    if (i < WORKFLOW.length - 1) {
      html += `<div class="wf-connector"></div>`;
    }
  });
  el.innerHTML = html;
}

function renderPros() {
  const grid = document.getElementById('pros-grid');
  grid.innerHTML = PROS.map(p => `
    <div class="pro-card fade-in">
      <div class="pro-icon">${icon(p.icon)}</div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
    </div>
  `).join('');
}

function renderStack() {
  const grid = document.getElementById('stack-grid');
  grid.innerHTML = STACK.map(s => `
    <div class="stack-card fade-in">
      <div class="stack-icon">${icon(s.icon) || s.icon}</div>
      <div class="stack-name">${s.name}</div>
      <div class="stack-label">${s.label}</div>
    </div>
  `).join('');
}

function renderFAQ() {
  const list = document.getElementById('faq-list');
  list.innerHTML = FAQ.map(item => `
    <div class="faq-item fade-in">
      <details>
        <summary>${item.q}</summary>
        <div class="faq-answer">${item.a}</div>
      </details>
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

// ── NAV ───────────────────────────────────────────────────────────────────

window.addEventListener('scroll', () => {
  document.getElementById('nav').style.background =
    window.scrollY > 40 ? 'rgba(10,14,26,0.97)' : 'rgba(10,14,26,0.8)';
});

document.getElementById('nav-toggle').addEventListener('click', () => {
  document.getElementById('nav-mobile').classList.toggle('open');
});

// ── INIT ──────────────────────────────────────────────────────────────────

renderFeatures();
renderWorkflow();
renderPros();
renderStack();
renderFAQ();
setTimeout(initObserver, 50);
