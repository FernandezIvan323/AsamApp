import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const FIELD_BASE =
  'flex h-10 w-full min-w-0 rounded-lg border-2 px-3.5 py-2 text-sm text-foreground shadow-xs transition-all duration-200 outline-none ' +
  'placeholder:text-muted-foreground/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50';

const Input = forwardRef(function Input({ className, type, ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        FIELD_BASE,
        'border-[var(--border2)] bg-[var(--input-bg)]',
        'focus:border-primary focus:ring-4 focus:ring-primary/30 focus:shadow-[0_0_18px_rgba(232,131,74,0.18)]',
        'aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/25',
        className,
      )}
      {...props}
    />
  );
});

export { Input };
