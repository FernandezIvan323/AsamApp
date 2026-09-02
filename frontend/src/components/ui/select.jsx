import { cn } from '@/lib/utils';

function Select({ className, children, ...props }) {
  return (
    <select
      data-slot="select"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-lg border-2 px-3.5 py-2 text-sm text-foreground shadow-xs transition-all duration-200 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'border-[var(--border2)] bg-[var(--input-bg)]',
        'focus:border-primary focus:ring-4 focus:ring-primary/30 focus:shadow-[0_0_18px_rgba(232,131,74,0.18)]',
        'aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/25',
        'appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23E8834A%22%3E%3Cpath%20d%3D%22M5.23%207.23a.75.75%200%20011.06%200L10%2010.94l3.71-3.71a.75.75%200%20111.06%201.06l-4.24%204.24a.75.75%200%2001-1.06%200L5.23%208.29a.75.75%200%20010-1.06z%22%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
