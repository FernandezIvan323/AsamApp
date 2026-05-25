import { AlertCircle, LoaderCircle, SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function ResourceState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center', className)}>
      <Icon className="mb-3 size-8 text-muted-foreground" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ title = 'Cargando datos', description = 'Estamos consultando la información del sistema.' }) {
  return (
    <ResourceState
      icon={(props) => <LoaderCircle {...props} className={cn(props.className, 'animate-spin')} />}
      title={title}
      description={description}
    />
  );
}

export function ErrorState({ title = 'No se pudieron cargar los datos', description, onRetry }) {
  return (
    <ResourceState
      icon={AlertCircle}
      title={title}
      description={description || 'Revisa que el backend esté corriendo y vuelve a intentar.'}
      className="border-destructive/40 bg-destructive/5"
      action={onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    />
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <ResourceState
      icon={SearchX}
      title={title}
      description={description}
      action={action}
    />
  );
}
