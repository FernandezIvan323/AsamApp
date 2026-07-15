import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Beef,
  Calendar,
  TrendingUp,
  Users,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Store,
  Calculator,
  FileStack,
  Download,
  StickyNote,
  Fish,
  UtensilsCrossed,
  Soup,
  Building2,
  ShoppingCart,
  FileText,
} from 'lucide-react';
import { useState } from 'react';

const PAD = 'px-6 md:px-10 xl:px-16';
const CONTAINER = 'mx-auto w-full max-w-screen-2xl';

const specialties = [
  {
    title: 'Asado de tira y vacío',
    desc: 'Controlá los kilos de carne por invitado y evitá sobras o faltantes en la parrilla.',
    icon: Beef,
    tag: 'Brasas',
    image: '/specialties/asado-tira.jpg',
  },
  {
    title: 'Mix parrillero',
    desc: 'Achuras, chorizo, pollo y más: armá la lista de compra del evento en minutos.',
    icon: Flame,
    tag: 'Parrilla',
    image: '/specialties/mix-parrillero.jpg',
  },
  {
    title: 'Sancocho y olla costeña',
    desc: 'Porciones de adultos y niños para platos de olla típicos de la costa.',
    icon: Soup,
    tag: 'Costeño',
    image: '/specialties/sancocho.jpg',
  },
  {
    title: 'Pescado y mariscos',
    desc: 'Costos de pesca o mercado y margen real cuando el menú es de mar.',
    icon: Fish,
    tag: 'Costa',
    image: '/specialties/pescado.jpg',
  },
  {
    title: 'Acompañamientos',
    desc: 'Arroz de coco, yuca, ensaladas e insumos: inventario y compras juntos.',
    icon: UtensilsCrossed,
    tag: 'Mesa',
    image: '/specialties/acompanamientos.jpg',
  },
  {
    title: 'Eventos corporativos',
    desc: 'Cotización en PDF, equipo y cobros para empresas, bodas y fiestas familiares.',
    icon: Building2,
    tag: 'Catering',
    image: '/specialties/evento.jpg',
  },
];

const featuresRow1 = [
  { title: 'Cálculo de insumos', desc: 'Kilos de carne, embutidos y carbón.', icon: Beef },
  { title: 'Calendario de eventos', desc: 'Fechas sin solapamientos.', icon: Calendar },
  { title: 'Cotizador veloz', desc: 'Presupuestos listos en PDF.', icon: Calculator },
  { title: 'Plantillas', desc: 'Reutilizá ofertas frecuentes.', icon: FileStack },
  { title: 'Logística', desc: 'Tareas y tiempos del evento.', icon: ClipboardList },
  { title: 'Clientes', desc: 'Historial corporativo y privado.', icon: Users },
];

const featuresRow2 = [
  { title: 'Lista de compras', desc: 'Mercado consolidado por eventos.', icon: ShoppingCart },
  { title: 'Inventario', desc: 'Existencias e insumos en vivo.', icon: Store },
  { title: 'Finanzas', desc: 'Ganancia neta por evento.', icon: TrendingUp },
  { title: 'Costos fijos', desc: 'Alquiler, leña y servicios.', icon: FileText },
  { title: 'Notas', desc: 'Recordatorios del cliente.', icon: StickyNote },
  { title: 'Exportación', desc: 'Reportes Excel y PDF.', icon: Download },
];

const steps = [
  {
    n: '01',
    title: 'Cotizá el evento',
    desc: 'Invitados, menú e insumos → presupuesto en PDF listo para el cliente.',
    benefit: 'Cerrás el trato sin Excel eterno',
    icon: FileText,
  },
  {
    n: '02',
    title: 'Comprá y organizá',
    desc: 'Mercado, kilos, equipo y tareas del día del asado en un solo flujo.',
    benefit: 'Kilos y costos reales, sin sobras ni faltantes',
    icon: ShoppingCart,
  },
  {
    n: '03',
    title: 'Cobrás y medís',
    desc: 'Pagos, costos fijos y margen del evento: cobrado menos lo que salió.',
    benefit: 'Sabés si el asado dejó plata de verdad',
    icon: TrendingUp,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 16 },
  },
};

export default function Landing() {
  const navigate = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    referrer: 'Búsqueda en Google',
    message: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setFormData({
          name: '',
          email: '',
          location: '',
          referrer: 'Búsqueda en Google',
          message: '',
        });
      }, 5000);
    }
  };

  return (
    <div className="min-h-svh w-full bg-[#0A1428] text-white selection:bg-[#E8834A] selection:text-[#0A1428] overflow-x-hidden font-sans">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-left {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .animate-marquee-left:hover { animation-play-state: paused; }
        .animate-marquee-left-slow {
          display: flex;
          width: max-content;
          animation: marquee 38s linear infinite;
        }
        .animate-marquee-left-slow:hover { animation-play-state: paused; }
      `}</style>

      {/* ── NAVBAR full-bleed ── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A1428]/85 backdrop-blur-md">
        <div className={`${PAD} ${CONTAINER} flex h-16 sm:h-20 items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl border border-[#E8834A]/20 bg-[#E8834A]/10 shadow-[0_0_20px_rgba(232,131,74,0.15)]">
              <Flame className="size-6 text-[#E8834A]" />
            </span>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-[#E8834A] bg-clip-text text-transparent">
              AsamApp
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="rounded-lg bg-[#E8834A] px-4 py-2.5 text-sm font-bold text-[#0A1428] hover:bg-[#D4733A] transition-colors shadow-[0_4px_16px_rgba(232,131,74,0.25)]"
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO full viewport ── */}
      <section className="relative w-full min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-5rem)] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-asado.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1428] via-[#0A1428]/90 to-[#0A1428]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1428] via-transparent to-[#0A1428]/40" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A1428] to-transparent" />

        <div className={`relative z-10 w-full ${PAD} ${CONTAINER} py-16 md:py-20`}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-10"
          >
            <div className="lg:col-span-7 flex flex-col justify-center space-y-7">
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8834A]/15 border border-[#E8834A]/30 w-fit"
              >
                <span className="flex size-2 rounded-full bg-[#E8834A] animate-pulse" />
                <span className="text-sm font-semibold uppercase tracking-wider text-[#E8834A]">
                  Asados · Comida costeña · Catering
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.08]"
              >
                El arte del fuego bajo un{' '}
                <span className="bg-gradient-to-r from-[#E8834A] to-amber-400 bg-clip-text text-transparent">
                  control absoluto
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-[#B8C5D0] max-w-2xl font-light leading-relaxed"
              >
                AsamApp es para quien vive de la parrilla y la mesa costeña: cotizá eventos, controlá kilos y compras,
                y conocé el margen real de cada asado — sin Excel eterno.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="flex items-center justify-center gap-2 bg-[#E8834A] text-[#0A1428] hover:bg-[#D4733A] font-bold px-8 py-4 rounded-xl shadow-[0_4px_24px_rgba(232,131,74,0.35)] transition-all hover:-translate-y-0.5"
                >
                  Probar gratis
                  <ChevronRight className="size-5" />
                </button>
                <a
                  href="#especialidades"
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold px-8 py-4 rounded-xl transition-all backdrop-blur-sm"
                >
                  Ver especialidades
                </a>
              </motion.div>
            </div>

            {/* Mock presupuesto */}
            <motion.div variants={itemVariants} className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-[#0F1B33]/90 border border-white/10 rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md">
                <div className="absolute top-0 left-0 w-full h-[3px] rounded-t-2xl bg-gradient-to-r from-[#E8834A] to-amber-400" />
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <span className="text-sm text-[#8BA0B0] tracking-wider uppercase font-semibold">
                    Presupuesto activo
                  </span>
                  <span className="text-sm px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Rentable
                  </span>
                </div>
                <div className="py-4 space-y-4">
                  <div>
                    <span className="text-sm text-[#8BA0B0] uppercase block">
                      Asado corporativo · 120 invitados
                    </span>
                    <span className="text-2xl font-bold tracking-tight text-white mt-1 block">$4.850.000</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#132240]/80 p-3 rounded-xl border border-white/5">
                      <span className="text-xs text-[#8BA0B0] uppercase block">Carne / carbón</span>
                      <span className="text-base font-semibold text-white mt-1 block">54,5 kg</span>
                    </div>
                    <div className="bg-[#132240]/80 p-3 rounded-xl border border-white/5">
                      <span className="text-xs text-[#8BA0B0] uppercase block">Equipo</span>
                      <span className="text-base font-semibold text-white mt-1 block">2 parrilleros</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-[#8BA0B0] mb-1">
                      <span>Materia prima</span>
                      <span className="font-semibold text-white">35% del total</span>
                    </div>
                    <div className="w-full h-2 bg-[#0A1428] rounded-full overflow-hidden">
                      <div className="h-full bg-[#E8834A] rounded-full" style={{ width: '35%' }} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 border-t border-white/5 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8BA0B0]">Vacío / asado de tira</span>
                    <span className="text-white font-medium">36 kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BA0B0]">Carbón quebracho</span>
                    <span className="text-white font-medium">4 bolsas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BA0B0]">Compras registradas</span>
                    <span className="text-emerald-400 font-medium">Al día</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── ESPECIALIDADES ── */}
      <section id="especialidades" className={`w-full py-12 md:py-16 bg-[#0A1428] ${PAD}`}>
        <div className={CONTAINER}>
          <div className="max-w-3xl mb-8">
            <span className="text-sm font-bold text-[#E8834A] uppercase tracking-widest">Especialidades</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              De la parrilla a la mesa costeña
            </h2>
            <p className="mt-3 text-lg text-[#8BA0B0] font-light leading-relaxed">
              Un mismo sistema para asados de carne, olla costeña y eventos grandes: kilos, compras y cobros sin perder el hilo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialties.map((s) => {
              const Icon = s.icon;
              return (
                <article
                  key={s.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#0F1B33] transition-all duration-300 hover:border-[#E8834A]/40 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,131,74,0.1)]"
                >
                  {s.image && (
                    <div className="relative h-36 sm:h-40 overflow-hidden">
                      <img
                        src={s.image}
                        alt={s.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B33] via-[#0F1B33]/40 to-transparent" />
                      <span className="absolute top-3 right-3 text-xs font-bold uppercase tracking-wider text-white bg-[#0A1428]/70 border border-white/10 backdrop-blur-sm px-2.5 py-1 rounded-md">
                        {s.tag}
                      </span>
                    </div>
                  )}
                  <div className="p-4 sm:p-5 pt-3">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="size-9 rounded-lg bg-[#E8834A]/10 border border-[#E8834A]/15 flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-[#E8834A]" />
                      </div>
                      <h3 className="text-lg font-semibold text-white leading-snug">{s.title}</h3>
                    </div>
                    <p className="text-[15px] text-[#8BA0B0] font-light leading-relaxed">{s.desc}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA (pasos + beneficios unificados) ── */}
      <section
        id="como-funciona"
        className={`w-full py-12 md:py-16 bg-[#0F1B33]/40 border-y border-white/5 ${PAD}`}
      >
        <div className={CONTAINER}>
          <div className="max-w-2xl mb-8 md:mb-10">
            <span className="text-sm font-bold text-[#E8834A] uppercase tracking-widest">
              Cómo funciona
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Del presupuesto al cobro, con el margen claro
            </h2>
            <p className="mt-3 text-lg text-[#8BA0B0] font-light leading-relaxed">
              Un solo flujo: cotizás, comprás y cobrás — sin Excel eterno ni margen a ciegas.
            </p>
          </div>

          {/* Desktop: 3 steps · Mobile: vertical timeline */}
          <ol className="grid grid-cols-1 gap-0 md:grid-cols-3 md:gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              return (
                <li key={step.n} className="relative flex gap-4 md:flex-col md:gap-0">
                  {/* Mobile vertical connector */}
                  {!isLast && (
                    <div
                      className="absolute left-[1.15rem] top-11 bottom-0 w-px bg-[#E8834A]/25 md:hidden"
                      aria-hidden
                    />
                  )}

                  {/* Step header: number + optional arrow */}
                  <div className="relative z-10 flex shrink-0 items-center gap-2 md:mb-4">
                    <span className="flex size-10 items-center justify-center rounded-full border-2 border-[#E8834A]/50 bg-[#0A1428] text-sm font-bold tabular-nums text-[#E8834A] shadow-[0_0_20px_rgba(232,131,74,0.15)] md:size-11 md:text-[15px]">
                      {step.n}
                    </span>
                    {!isLast && (
                      <div
                        className="ml-1 hidden h-px flex-1 bg-gradient-to-r from-[#E8834A]/50 to-[#E8834A]/10 md:block"
                        aria-hidden
                      />
                    )}
                    {!isLast && (
                      <ChevronRight className="hidden size-4 shrink-0 text-[#E8834A]/45 md:block" aria-hidden />
                    )}
                  </div>

                  {/* Card */}
                  <div className="min-w-0 flex-1 pb-7 last:pb-0 md:pb-0">
                    <div className="h-full rounded-2xl border border-white/8 bg-[#0F1B33] p-5 transition-colors hover:border-[#E8834A]/30 md:p-5">
                      <div className="mb-2.5 flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#E8834A]/15 bg-[#E8834A]/10">
                          <Icon className="size-4 text-[#E8834A]" />
                        </span>
                        <h3 className="text-lg font-semibold leading-snug text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-[15px] font-light leading-relaxed text-[#8BA0B0]">
                        {step.desc}
                      </p>
                      <div className="mt-3 rounded-lg border border-[#E8834A]/20 bg-[#E8834A]/[0.07] px-3 py-2.5">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#E8834A]">
                          Por qué importa
                        </p>
                        <p className="mt-1 text-[15px] leading-snug text-white/90">
                          {step.benefit}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* CTA footer */}
          <div className="mt-8 md:mt-10 flex justify-center border-t border-white/5 pt-8">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8834A] px-8 py-3.5 text-base font-bold text-[#0A1428] shadow-[0_4px_20px_rgba(232,131,74,0.3)] transition-all hover:bg-[#D4733A]"
            >
              Probar gratis
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES MARQUEE full width ── */}
      <section className="w-full py-12 md:py-14 overflow-hidden bg-[#0F1B33]/30 border-y border-white/5">
        <div className={`${PAD} ${CONTAINER} mb-6`}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Todo el evento en un solo lugar
          </h2>
          <p className="text-[#8BA0B0] text-lg font-light max-w-2xl">
            Módulos pensados para trabajar rápido el día del mercado y el día del asado.
          </p>
        </div>

        <div className="relative w-full overflow-hidden py-3">
          <div className="animate-marquee-left flex gap-4">
            {[...featuresRow1, ...featuresRow1].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={`r1-${idx}`}
                  className="w-80 shrink-0 bg-[#0F1B33] border border-white/5 rounded-xl p-4 flex items-center gap-3.5 hover:border-[#E8834A]/30 transition-all"
                >
                  <div className="size-10 rounded-lg bg-[#E8834A]/10 flex items-center justify-center shrink-0 border border-[#E8834A]/10">
                    <Icon className="size-5 text-[#E8834A]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold text-white truncate">{f.title}</h4>
                    <p className="text-sm text-[#8BA0B0] truncate mt-0.5 font-light">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative w-full overflow-hidden py-3 mt-2">
          <div className="animate-marquee-left-slow flex gap-4">
            {[...featuresRow2, ...featuresRow2].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={`r2-${idx}`}
                  className="w-80 shrink-0 bg-[#0F1B33] border border-white/5 rounded-xl p-4 flex items-center gap-3.5 hover:border-[#E8834A]/30 transition-all"
                >
                  <div className="size-10 rounded-lg bg-[#E8834A]/10 flex items-center justify-center shrink-0 border border-[#E8834A]/10">
                    <Icon className="size-5 text-[#E8834A]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold text-white truncate">{f.title}</h4>
                    <p className="text-sm text-[#8BA0B0] truncate mt-0.5 font-light">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CONTACTO full-bleed ── */}
      <section id="contacto" className={`w-full py-12 md:py-16 bg-[#0F1B33]/40 ${PAD}`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
                  Conversemos sobre tu negocio
                </h2>
                <p className="text-base text-[#8BA0B0] font-light leading-relaxed">
                  ¿Consultas comerciales o ayuda para usar AsamApp en tu catering? Escribinos por el formulario o por correo.
                </p>
              </div>

              <div className="bg-[#0F1B33] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 size-24 bg-[#E8834A]/5 rounded-full blur-xl" />
                <span className="text-xs font-bold text-[#E8834A] uppercase tracking-wider block mb-3">
                  Desarrollo y soporte
                </span>
                <h4 className="text-lg font-semibold text-white">Iván Fernández Peñates</h4>
                <p className="text-base text-[#8BA0B0] mt-1">Fundador & desarrollador principal</p>
                <div className="mt-5 space-y-3.5 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-3 text-base text-[#8BA0B0]">
                    <MapPin className="size-4 text-[#E8834A] shrink-0" />
                    <span>Sampués · Sucre, Colombia</span>
                  </div>
                  <div className="flex items-center gap-3 text-base text-[#8BA0B0]">
                    <Mail className="size-4 text-[#E8834A] shrink-0" />
                    <span>contacto@asamapp.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-base text-[#8BA0B0]">
                    <Phone className="size-4 text-[#E8834A] shrink-0" />
                    <span>+57 321 662 4399</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#0F1B33] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="size-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">¡Mensaje recibido!</h3>
                  <p className="text-sm text-[#8BA0B0] max-w-sm">
                    Gracias por escribirnos. Nos pondremos en contacto a la brevedad.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-xl font-semibold text-white mb-2 border-b border-white/5 pb-3">
                    Escribinos un mensaje
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-bold text-[#8BA0B0] uppercase tracking-wider block">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-[#0A1428] border border-white/5 rounded-lg px-4 py-3 text-base text-white placeholder-white/20 focus:border-[#E8834A] focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-bold text-[#8BA0B0] uppercase tracking-wider block">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="juan@ejemplo.com"
                        className="w-full bg-[#0A1428] border border-white/5 rounded-lg px-4 py-3 text-base text-white placeholder-white/20 focus:border-[#E8834A] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="location" className="text-xs font-bold text-[#8BA0B0] uppercase tracking-wider block">
                        ¿De dónde escribís?
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        placeholder="Ej. Sincelejo, Sucre"
                        className="w-full bg-[#0A1428] border border-white/5 rounded-lg px-4 py-3 text-base text-white placeholder-white/20 focus:border-[#E8834A] focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="referrer" className="text-xs font-bold text-[#8BA0B0] uppercase tracking-wider block">
                        ¿Cómo nos encontraste?
                      </label>
                      <select
                        id="referrer"
                        name="referrer"
                        value={formData.referrer}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A1428] border border-white/5 rounded-lg px-4 py-3 text-base text-white focus:border-[#E8834A] focus:outline-none transition-colors"
                      >
                        <option value="Búsqueda en Google">Búsqueda en Google</option>
                        <option value="Recomendación">Recomendación o amigo</option>
                        <option value="Redes Sociales">Redes sociales</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-bold text-[#8BA0B0] uppercase tracking-wider block">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Contanos sobre tu negocio de asados o catering..."
                      className="w-full bg-[#0A1428] border border-white/5 rounded-lg px-4 py-3 text-base text-white placeholder-white/20 focus:border-[#E8834A] focus:outline-none transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#E8834A] hover:bg-[#D4733A] text-[#0A1428] font-bold py-3.5 px-6 rounded-lg text-base shadow-[0_4px_15px_rgba(232,131,74,0.25)] transition-all"
                  >
                    Enviar mensaje
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER full-bleed ── */}
      <footer className={`w-full border-t border-white/5 bg-[#0A1428] py-8 ${PAD}`}>
        <div className={`${CONTAINER} flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#8BA0B0]`}>
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-[#E8834A]" />
            <span className="font-semibold text-white">AsamApp</span>
            <span className="hidden sm:inline">· Catering a las brasas</span>
          </div>
          <span>&copy; {new Date().getFullYear()} AsamApp. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
