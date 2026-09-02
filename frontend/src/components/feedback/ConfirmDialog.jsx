import { Info, Trash2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VARIANTS = {
  destructive: {
    icon: Trash2,
    iconClass: 'bg-destructive/10 text-destructive',
    confirmClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  warning: {
    icon: TriangleAlert,
    iconClass: 'bg-amber-500/10 text-amber-500',
    confirmClass: 'bg-amber-600 text-[#FFFFFF] hover:bg-amber-700',
  },
  default: {
    icon: Info,
    iconClass: 'bg-blue-500/10 text-blue-400',
    confirmClass: 'bg-primary text-primary-foreground hover:brightness-110',
  },
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  variant = 'destructive',
  note,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;
  const { icon: Icon, iconClass, confirmClass } = VARIANTS[variant] || VARIANTS.default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in cursor-pointer"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start gap-4">
          <div className={cn('shrink-0 rounded-full p-3', iconClass)}>
            <Icon className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm font-normal leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {note && (
          <div className="mt-4 rounded-lg border border-border bg-secondary p-3 text-xs text-muted-foreground">
            {note}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm} className={confirmClass}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AlertDialog({
  isOpen,
  title,
  description,
  buttonText = 'Entendido',
  onClose,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-full bg-blue-500/10 p-3 text-blue-400">
            <Info className="size-7" />
          </div>
          <div className="space-y-2">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-base font-normal leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>{buttonText}</Button>
        </div>
      </div>
    </div>
  );
}