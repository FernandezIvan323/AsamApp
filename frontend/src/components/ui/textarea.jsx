import { cn } from '@/lib/utils';

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border-2 px-3.5 py-2 text-sm text-foreground shadow-xs transition-all outline-none placeholder:text-muted-foreground/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'border-[var(--border2)] bg-[var(--input-bg)]',
        'focus:border-primary focus:ring-4 focus:ring-primary/30 focus:shadow-[0_0_18px_rgba(232,131,74,0.18)]',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-destructive/25',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
