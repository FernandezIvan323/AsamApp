import { useMemo, useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { currency } from '@/lib/finance';

/**
 * Selector de cantidades de insumos del catálogo con búsqueda.
 */
export default function InsumoPicker({
  inventory = [],
  selectedQuantities = {},
  onChange,
  isLoading = false,
  error = null,
  onRetry,
}) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const selectedIds = useMemo(
    () => new Set(Object.keys(selectedQuantities).filter(id => Number(selectedQuantities[id]) > 0)),
    [selectedQuantities],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = inventory;
    if (!showAll && selectedIds.size > 0) {
      list = inventory.filter(item => selectedIds.has(item.id));
    }
    if (term) list = list.filter(item => item.name.toLowerCase().includes(term));
    return list;
  }, [inventory, search, showAll, selectedIds]);

  const setQty = (id, value) => {
    onChange?.({
      ...selectedQuantities,
      [id]: value === '' ? '' : Number(value),
    });
  };

  if (isLoading) return <LoadingState title="Cargando insumos" />;
  if (error) return <ErrorState description={error.message || String(error)} onRetry={onRetry} />;
  if (inventory.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Primero agregá insumos en la sección <strong>Insumos</strong> del menú.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar insumo…"
            className="pl-9"
          />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setShowAll(v => !v)}>
          {showAll || selectedIds.size === 0 ? 'Catálogo' : 'Solo elegidos'}
        </Button>
      </div>

      {selectedIds.size === 0 && !showAll && (
        <div className="rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-8 text-center">
          <ShoppingCart className="mx-auto mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Elegí una receta arriba o abrí el catálogo para cargar cantidades.
          </p>
          <Button type="button" className="mt-3" size="sm" variant="outline" onClick={() => setShowAll(true)}>
            Ver catálogo
          </Button>
        </div>
      )}

      {(showAll || selectedIds.size > 0) && (
        <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {visible.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  ${currency(item.price)} / {item.unit}
                </p>
              </div>
              <Input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={selectedQuantities[item.id] ?? ''}
                placeholder="0"
                onChange={e => setQty(item.id, e.target.value)}
                className="h-9 w-24 text-center"
              />
            </div>
          ))}
          {visible.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">Sin resultados.</p>
          )}
        </div>
      )}
    </div>
  );
}
