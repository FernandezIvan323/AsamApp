import { HelpCircle, Info, Trash2, TriangleAlert } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  variant = 'destructive', // 'destructive' | 'default' | 'warning'
  note,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const getIconContainer = () => {
    switch (variant) {
      case 'destructive':
        return (
          <div className="rounded-full bg-red-500/10 p-3 text-red-500 shrink-0">
            <Trash2 className="h-6 w-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="rounded-full bg-amber-500/10 p-3 text-amber-500 shrink-0">
            <TriangleAlert className="h-6 w-6" />
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-blue-500/10 p-3 text-blue-400 shrink-0">
            <Info className="h-6 w-6" />
          </div>
        );
    }
  };

  const getConfirmButtonStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer';
      case 'warning':
        return 'h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer';
      default:
        return 'h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer';
    }
  };

  const getConfirmButtonIcon = () => {
    switch (variant) {
      case 'destructive':
        return <Trash2 className="h-4 w-4" />;
      case 'warning':
        return <TriangleAlert className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in cursor-pointer"
        onClick={onCancel}
      />
      
      {/* Centered Dialog Content */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Encabezado con Icono y Título */}
        <div className="flex items-start gap-4">
          {getIconContainer()}
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
              {title}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-normal">
              {description}
            </p>
          </div>
        </div>

        {/* Zona de Advertencia Secundaria (Opcional) */}
        {note && (
          <div className="mt-4 rounded-lg bg-zinc-900/50 border border-zinc-850 p-3 text-xs text-zinc-500">
            {note}
          </div>
        )}

        {/* Acciones */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button 
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg border border-zinc-800 bg-transparent px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 cursor-pointer"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            className={getConfirmButtonStyles()}
          >
            {getConfirmButtonIcon()}
            {confirmText}
          </button>
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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in cursor-pointer"
        onClick={onClose}
      />
      
      {/* Centered Dialog Content */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800 p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Encabezado con Icono y Título */}
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-500/10 p-3 text-blue-400 shrink-0">
            <Info className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-zinc-50 flex items-center gap-2">
              {title}
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed font-normal">
              {description}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex justify-end gap-2">
          <button 
            type="button"
            onClick={onClose}
            className="h-12 rounded-lg bg-primary px-6 py-2 text-base font-medium text-white transition-colors hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            {buttonText}
          </button>
        </div>

      </div>
    </div>
  );
}
