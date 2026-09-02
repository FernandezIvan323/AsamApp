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
  BarChart3,
  Bell,
  LayoutDashboard,
  ShieldCheck,
  Wallet,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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

const audiences = [
  {
    icon: Flame,
    title: 'Parrillero particular',
    pain: 'Hacés cotizaciones en papel y nunca sabés si un asado dejó plata.',
    solution: 'Cotizá, comprá y cobrá con el margen real de cada evento, todo en un solo lugar.',
    points: ['Cotización en PDF', 'Kilos por invitado', 'Margen real'],
  },
  {
    icon: Store,
    title: 'Catering en crecimiento',
    pain: 'Varios eventos por semana y se te escapan las compras y los cobros.',
    solution: 'Un calendario con cada evento, su lista de compras y los pagos al día.',
    points: ['Calendario de eventos', 'Lista de compras', 'Control de cobros'],
  },
  {
    icon: Building2,
    title: 'Catering empresarial',
    pain: 'Clientes corporativos y equipos de trabajo que exigen orden y reportes.',
    solution: 'Presupuestos profesionales, registro de horas del equipo y exportación de reportes.',
    points: ['Reportes Excel/PDF', 'Equipo y horas', 'Historial por cliente'],
  },
];

const productScreenshots = [
  {
    icon: LayoutDashboard,
    title: 'Panel de control',
    desc: 'Próximos eventos, cobros pendientes, stock bajo y tareas en una sola pantalla.',
    items: ['3 próximos eventos', '2 cobros pendientes', 'Stock crítico'],
  },
  {
    icon: Calculator,
    title: 'Cotizador veloz',
    desc: 'Invitados + menú = presupuesto en PDF, listo para mandar al cliente.',
    items: ['Insumos por kilos', 'Margen configurable', 'PDF en un clic'],
  },
  {
    icon: ShoppingCart,
    title: 'Compras de mercado',
    desc: 'Registrá cada compra con su costo real y asignala al evento correspondiente.',
    items: ['Por tienda', 'Fotos del ticket', 'Costo por ítem'],
  },
  {
    icon: BarChart3,
    title: 'Finanzas claras',
    desc: 'Ganancia neta por evento y del negocio, con costos fijos incluidos.',
    items: ['Margen real', 'Costos fijos', 'Balance mensual'],
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

const metrics = [
  {
    icon: Wallet,
    stat: 'Margen real',
    title: 'Sabés cuánto dejó cada asado',
    desc: 'Cobrado menos compras, horas y costos fijos: la ganancia de verdad, no un estimado.',
  },
  {
    icon: Bell,
    stat: 'Alertas automáticas',
    title: 'Nada se te escapa',
    desc: 'Cobros atrasados, stock bajo y compras sin asignar: te avisamos antes de que duela.',
  },
  {
    icon: ShieldCheck,
    stat: 'Todo en orden',
    title: 'Equipo y cobros, coordinados',
    desc: 'Horas del personal, tareas del evento y pagos de clientes en un mismo lugar.',
  },
];

const faqs = [
  {
    q: '¿Necesito saber de finanzas para usar AsamApp?',
    a: 'No. Ingresás invitados, kilos y precios, y AsamApp calcula el margen por vos. Solo tenés que mirar el resultado final.',
  },
  {
    q: '¿Cuántos eventos puedo cargar?',
    a: 'Ilimitados. Cada evento guarda su propia cotización, lista de compras, equipo y pagos, sin mezclar los números.',
  },
  {
    q: '¿Funciona para otros menús que no sean asado?',
    a: 'Sí. Sancocho, pescado, mariscos y acompañamientos: armás tu propio inventario e insumos por receta.',
  },
  {
    q: '¿Puedo exportar los presupuestos y reportes?',
    a: 'Sí. Cada cotización se genera en PDF para enviar al cliente, y los reportes financieros se exportan a Excel.',
  },
  {
    q: '¿Cómo arranco?',
    a: 'Te registrás gratis, creás tu primer evento en minutos y probás todo el flujo: cotizar, comprar y cobrar.',
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
    <div className="min-h-svh w-full overflow-x-hidden bg-background font-sans text-foreground selection:bg-primary selection:text-primary-foreground">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>

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

        @keyframes ember-rise {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-340px) translateX(30px) scale(0.3); opacity: 0; }
        }
        .ember {
          position: absolute;
          bottom: -10px;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #F59E0B;
          box-shadow: 0 0 12px 2px rgba(232, 131, 74, 0.8);
          animation: ember-rise linear infinite;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-left,
          .animate-marquee-left-slow,
          .ember { animation: none !important; }
        }
      `}</style>

      {/* ── NAVBAR full-bleed ── */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-[var(--border2)] bg-background/85 backdrop-blur-md">
        <div className={`${PAD} ${CONTAINER} flex h-16 items-center justify-between sm:h-20`}>
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl border-2 border-primary/30 bg-primary/10 shadow-[0_0_20px_rgba(232,131,74,0.15)]">
              <Flame className="size-6 text-primary" />
            </span>
            <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-xl font-bold tracking-tight text-transparent">
              AsamApp
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Ingresar
            </Button>
            <Button onClick={() => navigate('/register')}>
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO full viewport ── */}
      <section className="relative flex w-full min-h-[calc(100svh-4rem)] items-center sm:min-h-[calc(100svh-5rem)]" id="contenido">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-asado.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <span className="ember" style={{ left: '12%', animationDuration: '7s', animationDelay: '0s' }} />
          <span className="ember" style={{ left: '28%', animationDuration: '9s', animationDelay: '1.5s' }} />
          <span className="ember" style={{ left: '44%', animationDuration: '8s', animationDelay: '3s' }} />
          <span className="ember" style={{ left: '61%', animationDuration: '10s', animationDelay: '0.8s' }} />
          <span className="ember" style={{ left: '78%', animationDuration: '7.5s', animationDelay: '2.4s' }} />
          <span className="ember" style={{ left: '90%', animationDuration: '9.5s', animationDelay: '4s' }} />
        </div>

        <div className={`relative z-10 w-full ${PAD} ${CONTAINER} py-16 md:py-20`}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-10"
          >
            <div className="flex flex-col justify-center space-y-7 lg:col-span-7">
              <motion.div
                variants={itemVariants}
                className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/15 px-3 py-1"
              >
                <span className="flex size-2 animate-pulse rounded-full bg-primary" />
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Asados · Comida costeña · Catering
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl xl:text-6xl"
              >
                Hecho para quien vive del fuego:{' '}
                <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
                  cotizá, comprá y cobrá
                </span>{' '}
                sabiendo si dejó plata.
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="max-w-2xl text-lg font-light leading-relaxed text-muted-foreground sm:text-xl"
              >
                AsamApp es el panel de control para parrilleros y caterings: presupuestos en PDF, kilos exactos,
                compras asignadas y el margen real de cada asado — sin Excel eterno.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button size="lg" onClick={() => navigate('/register')} className="shadow-[0_4px_24px_rgba(232,131,74,0.35)]">
                  Probar gratis
                  <ChevronRight className="size-5" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#especialidades">Ver especialidades</a>
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="size-4 text-primary" /> Sin tarjeta de crédito</span>
                <span className="flex items-center gap-1.5"><Check className="size-4 text-primary" /> Cargás tu primer evento en minutos</span>
              </motion.div>
            </div>

            {/* Mock presupuesto */}
            <motion.div variants={itemVariants} className="relative flex justify-center lg:col-span-5 lg:justify-end">
              <div className="w-full max-w-md rounded-2xl border-2 border-[var(--border2)] bg-card/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md">
                <div className="absolute left-0 right-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-primary to-amber-400" />
                <div className="flex items-center justify-between border-b-2 border-[var(--border2)] pb-4">
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Presupuesto activo
                  </span>
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-sm font-medium text-emerald-400">
                    Rentable
                  </span>
                </div>
                <div className="space-y-4 py-4">
                  <div>
                    <span className="block text-sm uppercase text-muted-foreground">
                      Asado corporativo · 120 invitados
                    </span>
                    <span className="mt-1 block text-2xl font-bold tracking-tight text-foreground">$4.850.000</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border-2 border-[var(--border2)] bg-secondary/80 p-3">
                      <span className="block text-xs uppercase text-muted-foreground">Carne / carbón</span>
                      <span className="mt-1 block text-base font-semibold text-foreground">54,5 kg</span>
                    </div>
                    <div className="rounded-xl border-2 border-[var(--border2)] bg-secondary/80 p-3">
                      <span className="block text-xs uppercase text-muted-foreground">Equipo</span>
                      <span className="mt-1 block text-base font-semibold text-foreground">2 parrilleros</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                      <span>Materia prima</span>
                      <span className="font-semibold text-foreground">35% del total</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-background">
                      <div className="h-full rounded-full bg-primary" style={{ width: '35%' }} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 border-t-2 border-[var(--border2)] pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vacío / asado de tira</span>
                    <span className="font-medium text-foreground">36 kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carbón quebracho</span>
                    <span className="font-medium text-foreground">4 bolsas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compras registradas</span>
                    <span className="font-medium text-emerald-400">Al día</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PARA QUIÉN ES ── */}
      <section className={`w-full bg-background py-12 md:py-16 ${PAD}`}>
        <div className={CONTAINER}>
          <div className="mb-8 max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Para quién es</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Un sistema, tres formas de vivir del asado
            </h2>
            <p className="mt-3 text-lg font-light leading-relaxed text-muted-foreground">
              No importa si hacés un asado por fin de semana o diez eventos en simultáneo: AsamApp se adapta a tu escala.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {audiences.map((a) => {
              const Icon = a.icon;
              return (
                <article key={a.title} className="flex flex-col rounded-2xl border-2 border-[var(--border2)] bg-card p-6 transition-colors hover:border-primary/40">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl border-2 border-primary/25 bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{a.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-destructive">Hoy:</span> {a.pain}
                  </p>
                  <p className="mt-2 text-sm text-foreground/85">
                    <span className="font-semibold text-emerald-400">Con AsamApp:</span> {a.solution}
                  </p>
                  <ul className="mt-4 space-y-1.5 border-t-2 border-[var(--border2)] pt-4">
                    {a.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="size-4 shrink-0 text-primary" /> {p}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SISTEMA EN UN VISTAZO ── */}
      <section className={`w-full border-y-2 border-[var(--border2)] bg-card/40 py-12 md:py-16 ${PAD}`}>
        <div className={CONTAINER}>
          <div className="mb-8 max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-widest text-primary">El sistema, de un vistazo</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Cuatro pantallas que hacen el trabajo pesado
            </h2>
            <p className="mt-3 text-lg font-light leading-relaxed text-muted-foreground">
              Todo lo que necesitás para llevar tu catering está acá, sin manuales ni pantallas de más.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {productScreenshots.map((s) => {
              const Icon = s.icon;
              return (
                <article key={s.title} className="flex flex-col rounded-2xl border-2 border-[var(--border2)] bg-card p-5 transition-transform hover:-translate-y-1">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg border-2 border-primary/20 bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                  </div>
                  <p className="text-sm font-light leading-relaxed text-muted-foreground">{s.desc}</p>
                  <ul className="mt-4 space-y-1.5 border-t-2 border-[var(--border2)] pt-3">
                    {s.items.map((i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Sparkles className="size-3.5 shrink-0 text-primary" /> {i}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ESPECIALIDADES ── */}
      <section id="especialidades" className={`w-full bg-background py-12 md:py-16 ${PAD}`}>
        <div className={CONTAINER}>
          <div className="mb-8 max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Especialidades</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              De la parrilla a la mesa costeña
            </h2>
            <p className="mt-3 text-lg font-light leading-relaxed text-muted-foreground">
              Un mismo sistema para asados de carne, olla costeña y eventos grandes: kilos, compras y cobros sin perder el hilo.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specialties.map((s) => {
              const Icon = s.icon;
              return (
                <article
                  key={s.title}
                  className="group relative overflow-hidden rounded-2xl border-2 border-[var(--border2)] bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(232,131,74,0.1)]"
                >
                  {s.image && (
                    <div className="relative h-36 overflow-hidden sm:h-40">
                      <img
                        src={s.image}
                        alt={s.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                      <span className="absolute right-3 top-3 rounded-md border-2 border-[var(--border2)] bg-background/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-foreground backdrop-blur-sm">
                        {s.tag}
                      </span>
                    </div>
                  )}
                  <div className="p-4 pt-3 sm:p-5">
                    <div className="mb-2 flex items-center gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-primary/15 bg-primary/10">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold leading-snug text-foreground">{s.title}</h3>
                    </div>
                    <p className="text-[15px] font-light leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section
        id="como-funciona"
        className={`w-full border-y-2 border-[var(--border2)] bg-card/40 py-12 md:py-16 ${PAD}`}
      >
        <div className={CONTAINER}>
          <div className="mb-8 md:mb-10 max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-widest text-primary">
              Cómo funciona
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Del presupuesto al cobro, con el margen claro
            </h2>
            <p className="mt-3 text-lg font-light leading-relaxed text-muted-foreground">
              Un solo flujo: cotizás, comprás y cobrás — sin Excel eterno ni margen a ciegas.
            </p>
          </div>

          <ol className="grid grid-cols-1 gap-0 md:grid-cols-3 md:gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              return (
                <li key={step.n} className="relative flex gap-4 md:flex-col md:gap-0">
                  {!isLast && (
                    <div className="absolute left-[1.15rem] bottom-0 top-11 w-px bg-primary/25 md:hidden" aria-hidden />
                  )}
                  <div className="relative z-10 flex shrink-0 items-center gap-2 md:mb-4">
                    <span className="flex size-10 items-center justify-center rounded-full border-2 border-primary/50 bg-background text-sm font-bold tabular-nums text-primary shadow-[0_0_20px_rgba(232,131,74,0.15)] md:size-11 md:text-[15px]">
                      {step.n}
                    </span>
                    {!isLast && (
                      <div className="ml-1 hidden h-px flex-1 bg-gradient-to-r from-primary/50 to-primary/10 md:block" aria-hidden />
                    )}
                    {!isLast && (
                      <ChevronRight className="hidden size-4 shrink-0 text-primary/45 md:block" aria-hidden />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pb-7 last:pb-0 md:pb-0">
                    <div className="h-full rounded-2xl border-2 border-[var(--border2)] bg-card p-5 transition-colors hover:border-primary/30 md:p-5">
                      <div className="mb-2.5 flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-primary/15 bg-primary/10">
                          <Icon className="size-4 text-primary" />
                        </span>
                        <h3 className="text-lg font-semibold leading-snug text-foreground">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-[15px] font-light leading-relaxed text-muted-foreground">
                        {step.desc}
                      </p>
                      <div className="mt-3 rounded-lg border-2 border-primary/20 bg-primary/[0.07] px-3 py-2.5">
                        <p className="text-xs font-bold uppercase tracking-wide text-primary">
                          Por qué importa
                        </p>
                        <p className="mt-1 text-[15px] leading-snug text-foreground/90">
                          {step.benefit}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 flex justify-center border-t-2 border-[var(--border2)] pt-8 md:mt-10">
            <Button size="lg" onClick={() => navigate('/register')} className="shadow-[0_4px_20px_rgba(232,131,74,0.3)]">
              Probar gratis
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── MÉTRICAS ── */}
      <section className={`w-full bg-background py-12 md:py-16 ${PAD}`}>
        <div className={CONTAINER}>
          <div className="mb-8 max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Métricas que importan</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Lo que te devuelve AsamApp
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <article key={m.stat} className="rounded-2xl border-2 border-[var(--border2)] bg-card p-6">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl border-2 border-primary/25 bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wide text-primary">{m.stat}</span>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">{m.title}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">{m.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES MARQUEE ── */}
      <section className="w-full overflow-hidden border-y-2 border-[var(--border2)] bg-card/30 py-12 md:py-14">
        <div className={`${PAD} ${CONTAINER} mb-6`}>
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Todo el evento en un solo lugar
          </h2>
          <p className="max-w-2xl text-lg font-light text-muted-foreground">
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
                  className="flex w-80 shrink-0 items-center gap-3.5 rounded-xl border-2 border-[var(--border2)] bg-card p-4 transition-all hover:border-primary/30"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-primary/10 bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-base font-semibold text-foreground">{f.title}</h4>
                    <p className="mt-0.5 truncate text-sm font-light text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative mt-2 w-full overflow-hidden py-3">
          <div className="animate-marquee-left-slow flex gap-4">
            {[...featuresRow2, ...featuresRow2].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={`r2-${idx}`}
                  className="flex w-80 shrink-0 items-center gap-3.5 rounded-xl border-2 border-[var(--border2)] bg-card p-4 transition-all hover:border-primary/30"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-primary/10 bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-base font-semibold text-foreground">{f.title}</h4>
                    <p className="mt-0.5 truncate text-sm font-light text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section className={`w-full bg-background py-12 md:py-16 ${PAD}`}>
        <div className={CONTAINER}>
          <div className="mb-8 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Empezá hoy</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Gratis para probar todo el flujo
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground">
              Registrate y cargá tus eventos reales. Para necesidades empresariales, hablanos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <div className="flex flex-col rounded-2xl border-2 border-primary/40 bg-primary/[0.05] p-6 sm:p-8">
              <span className="text-sm font-bold uppercase tracking-wide text-primary">Gratis</span>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-foreground">$0</p>
              <p className="mt-1 text-sm text-muted-foreground">Para arrancar sin compromiso</p>
              <ul className="mt-6 space-y-2.5">
                {['Eventos ilimitados', 'Cotizador con PDF', 'Compras y finanzas', 'Inventario y notas'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground/85">
                    <Check className="size-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button size="lg" className="mt-8" onClick={() => navigate('/register')}>
                Registrarse gratis
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <div className="flex flex-col rounded-2xl border-2 border-[var(--border2)] bg-card p-6 sm:p-8">
              <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Empresas</span>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-foreground">A medida</p>
              <p className="mt-1 text-sm text-muted-foreground">Para equipos y catering en crecimiento</p>
              <ul className="mt-6 space-y-2.5">
                {['Múltiples usuarios y roles', 'Reportes y exportación', 'Soporte prioritario', 'Capacitación para tu equipo'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground/85">
                    <Check className="size-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="outline" className="mt-8" asChild>
                <a href="#contacto">Hablar con nosotros</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={`w-full border-y-2 border-[var(--border2)] bg-card/40 py-12 md:py-16 ${PAD}`}>
        <div className={CONTAINER}>
          <div className="mb-8 max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Preguntas frecuentes</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Lo que suelen preguntar
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border-2 border-[var(--border2)] bg-card p-5 transition-colors open:border-primary/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground">
                  {f.q}
                  <ChevronRight className="size-5 shrink-0 text-primary transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACTO full-bleed ── */}
      <section id="contacto" className={`w-full bg-background py-12 md:py-16 ${PAD}`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 xl:gap-12">
            <div className="space-y-8 lg:col-span-5">
              <div>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
                  Conversemos sobre tu negocio
                </h2>
                <p className="text-base font-light leading-relaxed text-muted-foreground">
                  ¿Consultas comerciales o ayuda para usar AsamApp en tu catering? Escribinos por el formulario o por correo.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--border2)] bg-card p-6">
                <div className="absolute right-0 top-0 size-24 rounded-full bg-primary/5 blur-xl" />
                <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-primary">
                  Desarrollo y soporte
                </span>
                <h4 className="text-lg font-semibold text-foreground">Iván Fernández Peñates</h4>
                <p className="mt-1 text-base text-muted-foreground">Fundador & desarrollador principal</p>
                <div className="mt-5 space-y-3.5 border-t-2 border-[var(--border2)] pt-4">
                  <div className="flex items-center gap-3 text-base text-muted-foreground">
                    <MapPin className="size-4 shrink-0 text-primary" />
                    <span>Sampués · Sucre, Colombia</span>
                  </div>
                  <div className="flex items-center gap-3 text-base text-muted-foreground">
                    <Mail className="size-4 shrink-0 text-primary" />
                    <span>contacto@asamapp.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-base text-muted-foreground">
                    <Phone className="size-4 shrink-0 text-primary" />
                    <span>+57 321 662 4399</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-[var(--border2)] bg-card p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)] sm:p-8 lg:col-span-7">
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                    <CheckCircle2 className="size-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">¡Mensaje recibido!</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Gracias por escribirnos. Nos pondremos en contacto a la brevedad.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="mb-2 border-b-2 border-[var(--border2)] pb-3 text-xl font-semibold text-foreground">
                    Escribinos un mensaje
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label htmlFor="name" className="block space-y-2">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-foreground/85">Nombre completo</span>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ej. Juan Pérez" />
                    </label>
                    <label htmlFor="email" className="block space-y-2">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-foreground/85">Correo electrónico</span>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="juan@ejemplo.com" />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label htmlFor="location" className="block space-y-2">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-foreground/85">¿De dónde escribís?</span>
                      <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required placeholder="Ej. Sincelejo, Sucre" />
                    </label>
                    <label htmlFor="referrer" className="block space-y-2">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-foreground/85">¿Cómo nos encontraste?</span>
                      <Select id="referrer" name="referrer" value={formData.referrer} onChange={handleInputChange}>
                        <option value="Búsqueda en Google">Búsqueda en Google</option>
                        <option value="Recomendación">Recomendación o amigo</option>
                        <option value="Redes Sociales">Redes sociales</option>
                        <option value="Otro">Otro</option>
                      </Select>
                    </label>
                  </div>
                  <label htmlFor="message" className="block space-y-2">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-foreground/85">Mensaje</span>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required rows={4} placeholder="Contanos sobre tu negocio de asados o catering..." className="resize-none" />
                  </label>
                  <Button type="submit" size="lg" className="w-full shadow-[0_4px_15px_rgba(232,131,74,0.25)]">
                    Enviar mensaje
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER full-bleed ── */}
      <footer className={`w-full border-t-2 border-[var(--border2)] bg-card/40 py-10 ${PAD}`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl border-2 border-primary/25 bg-primary/10">
                  <Flame className="size-5 text-primary" />
                </span>
                <span className="text-lg font-bold tracking-tight text-foreground">AsamApp</span>
              </div>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                El panel de control para parrilleros y caterings: cotizá, comprá, cobrá y medí el margen real de cada evento.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">Producto</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="#especialidades" className="hover:text-foreground">Especialidades</a></li>
                <li><a href="#como-funciona" className="hover:text-foreground">Cómo funciona</a></li>
                <li><a href="#contacto" className="hover:text-foreground">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">Cuenta</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><button type="button" onClick={() => navigate('/login')} className="hover:text-foreground">Ingresar</button></li>
                <li><button type="button" onClick={() => navigate('/register')} className="hover:text-foreground">Registrarse</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t-2 border-[var(--border2)] pt-6 text-sm text-muted-foreground sm:flex-row">
            <span>&copy; {new Date().getFullYear()} AsamApp. Todos los derechos reservados.</span>
            <span className="flex items-center gap-1.5 text-primary"><Flame className="size-4" /> Catering a las brasas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}