import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Flame,
  Home,
  ReceiptText,
  ShoppingCart,
  Shield,
  TrendingUp,
} from 'lucide-react';

const DEFAULT_BULLETS = [
  { icon: CalendarDays, text: 'Eventos y cotizaciones en un solo lugar' },
  { icon: ShoppingCart, text: 'Compras de mercado y lista de insumos' },
  { icon: ReceiptText, text: 'Margen real: cobrado menos costos' },
];

const MODULE_CHIPS = [
  { icon: CalendarDays, label: 'Eventos' },
  { icon: ShoppingCart, label: 'Mercado' },
  { icon: TrendingUp, label: 'Finanzas' },
];

/** Botón volver al inicio — estilo AsamApp (mobile compacto / desktop completo) */
function BackToHomeButton({ compact = false }) {
  if (compact) {
    return (
      <Link
        to="/"
        className="group inline-flex items-center gap-1.5 rounded-full border border-[#E8834A]/35 bg-[#E8834A]/10 px-3 py-1.5 text-xs font-semibold text-[#E8834A] transition-all duration-200 hover:border-[#E8834A]/60 hover:bg-[#E8834A]/20 hover:shadow-[0_0_16px_rgba(232,131,74,0.2)]"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        Inicio
      </Link>
    );
  }

  return (
    <Link
      to="/"
      className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-[#0A1428] to-[#0F1B33] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:border-[#E8834A]/40 hover:shadow-[0_4px_24px_rgba(232,131,74,0.15)]"
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#E8834A] to-amber-500" />
      <span className="flex size-8 items-center justify-center rounded-lg border border-[#E8834A]/25 bg-[#E8834A]/10 transition-colors group-hover:bg-[#E8834A]/20">
        <Home className="size-4 text-[#E8834A]" />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8834A]/90">
          AsamApp
        </span>
        <span className="text-sm font-semibold text-white group-hover:text-[#E8834A] transition-colors">
          Volver al inicio
        </span>
      </span>
      <ArrowLeft className="ml-auto size-4 text-[#8BA0B0] transition-all group-hover:-translate-x-1 group-hover:text-[#E8834A]" />
    </Link>
  );
}

/**
 * Full-bleed split layout for Login / Register.
 * Left: gastronomic panel. Right: enriched form panel.
 */
export default function AuthSplitLayout({
  title,
  subtitle,
  badge = 'Acceso al panel',
  children,
  footer,
  bullets = DEFAULT_BULLETS,
}) {
  return (
    <div className="flex min-h-svh w-full bg-[#0A1428] text-white overflow-x-hidden">
      {/* Visual panel — desktop */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-asado.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1428]/90 via-[#0A1428]/75 to-[#E8834A]/25" />
        <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-[#E8834A]/20 blur-[100px]" />
        <div className="absolute top-1/3 -right-10 size-56 rounded-full bg-[#E8834A]/10 blur-[80px]" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <span className="flex size-10 items-center justify-center rounded-xl border border-[#E8834A]/30 bg-[#E8834A]/15 shadow-[0_0_24px_rgba(232,131,74,0.2)]">
              <Flame className="size-5 text-[#E8834A]" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#E8834A] transition-colors">
              AsamApp
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8 max-w-md">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8834A]">
              Catering a las brasas
            </p>
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight text-white">
              El fuego, los kilos y el margen bajo control
            </h2>
            <p className="text-[#8BA0B0] text-sm xl:text-base font-light leading-relaxed">
              Pensado para asados de carne y comida costeña: cotizá, comprá y cobrá sin perder plata en el camino.
            </p>
          </div>
          <ul className="space-y-3">
            {bullets.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#E8834A]/15 border border-[#E8834A]/20">
                  <Icon className="size-4 text-[#E8834A]" />
                </span>
                <span className="text-sm text-white/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-[#8BA0B0]">
          AsamApp · Sampués, Sucre · Costa Caribe
        </p>
      </aside>

      {/* Form panel — enriched */}
      <main className="relative flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-1/2 lg:px-12 xl:px-16 overflow-hidden">
        {/* Background texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(232,131,74,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(232,131,74,0.9) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute top-[-10%] right-[-10%] size-72 rounded-full bg-[#E8834A]/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-[-5%] left-[-5%] size-56 rounded-full bg-[#E8834A]/8 blur-[80px]" />

        {/* Mobile top brand strip */}
        <div className="relative z-10 mb-6 flex items-center justify-between gap-3 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2 min-w-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#E8834A]/30 bg-[#E8834A]/10">
              <Flame className="size-5 text-[#E8834A]" />
            </span>
            <span className="text-lg font-bold text-white truncate">AsamApp</span>
          </Link>
          <BackToHomeButton compact />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-md">
          {/* Desktop logo + badge */}
          <div className="mb-6 hidden lg:flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <span className="flex size-9 items-center justify-center rounded-xl border border-[#E8834A]/30 bg-[#E8834A]/10">
                <Flame className="size-4 text-[#E8834A]" />
              </span>
              <span className="text-base font-bold text-white group-hover:text-[#E8834A] transition-colors">
                AsamApp
              </span>
            </Link>
            <span className="rounded-full border border-[#E8834A]/30 bg-[#E8834A]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E8834A]">
              {badge}
            </span>
          </div>

          <div className="mb-5 space-y-2">
            <div className="lg:hidden mb-3">
              <span className="rounded-full border border-[#E8834A]/30 bg-[#E8834A]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E8834A]">
                {badge}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-[#8BA0B0] font-light leading-relaxed">{subtitle}</p>
            )}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#8BA0B0]">
              <Shield className="size-3.5 text-[#E8834A] shrink-0" />
              <span>Datos en tu servidor · multi-usuario familiar</span>
            </div>
          </div>

          {/* Form card with top accent bar */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0F1B33]/90 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E8834A] to-amber-400" />
            {children}
          </div>

          {footer && <div className="mt-5 text-center text-sm text-[#8BA0B0]">{footer}</div>}

          {/* Module chips */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {MODULE_CHIPS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] px-2 py-3"
              >
                <Icon className="size-4 text-[#E8834A]" />
                <span className="text-[11px] font-medium text-[#8BA0B0]">{label}</span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-[11px] text-[#8BA0B0]/80 leading-relaxed">
            Diseñado para asados y catering en la costa Caribe.
          </p>

          <div className="mt-5 hidden lg:block">
            <BackToHomeButton />
          </div>
        </div>
      </main>
    </div>
  );
}
