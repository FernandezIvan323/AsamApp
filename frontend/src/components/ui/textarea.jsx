import { cn } from '@/lib/utils';

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input bg-background ring-offset-background placeholder:text-muted-foreground flex min-h-[60px] w-full rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
