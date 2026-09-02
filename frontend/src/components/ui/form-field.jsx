import { Children, cloneElement } from 'react';
import { cn } from '@/lib/utils';

function FormField({ label, error, hint, required, children, className, labelClassName, errorClassName, ...props }) {
  const enhanced = Children.map(children, child => {
    if (!child || !error) return child;
    return cloneElement(child, { 'aria-invalid': true, 'data-invalid': true });
  });

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {label && (
        <label className={cn('block text-xs font-semibold tracking-wide text-foreground/85 uppercase', labelClassName)}>
          {label}{required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}
      {enhanced}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className={cn('text-xs font-medium text-destructive', errorClassName)} role="alert">{error}</p>
      )}
    </div>
  );
}

export { FormField };
