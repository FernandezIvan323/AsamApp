/** Shared dark form field styles for auth pages (Login / Register). */
export function authInputClassName(extra = '') {
  return [
    'w-full rounded-lg border border-white/10 bg-[#0A1428] px-4 py-3 text-sm text-white',
    'placeholder:text-white/25 focus:border-[#E8834A] focus:outline-none focus:ring-1 focus:ring-[#E8834A]/40',
    'transition-colors duration-200',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}
