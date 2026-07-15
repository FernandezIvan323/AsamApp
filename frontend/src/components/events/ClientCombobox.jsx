import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Plus, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { createClient } from '@/services/clientsApi';

/**
 * Combobox de cliente: buscar, elegir de agenda, o nombre libre.
 * onChange({ clientId, clientName })
 */
export default function ClientCombobox({
  clients = [],
  clientId = '',
  clientName = '',
  onChange,
  onClientCreated,
  placeholder = 'Buscar o escribir nombre…',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(clientName || '');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    setQuery(clientName || '');
  }, [clientName]);

  useEffect(() => {
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return clients.slice(0, 12);
    return clients
      .filter(c =>
        c.name.toLowerCase().includes(term)
        || (c.phone && c.phone.includes(term))
        || (c.email && c.email.toLowerCase().includes(term)),
      )
      .slice(0, 12);
  }, [clients, query]);

  const selected = clients.find(c => c.id === clientId);

  const pick = (client) => {
    onChange?.({ clientId: client.id, clientName: client.name });
    setQuery(client.name);
    setOpen(false);
    setCreateError(null);
  };

  const applyFreeText = () => {
    const name = query.trim();
    onChange?.({ clientId: '', clientName: name });
    setOpen(false);
  };

  const handleInputChange = (value) => {
    setQuery(value);
    setOpen(true);
    // Mientras escribe, no forzamos clientId hasta elegir
    onChange?.({ clientId: '', clientName: value });
  };

  const handleCreateQuick = async () => {
    const name = query.trim();
    if (!name) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createClient({ name, phone: '', email: '', notes: '' });
      onClientCreated?.(created);
      pick(created);
    } catch (err) {
      setCreateError(err.message || 'No se pudo crear el cliente');
    } finally {
      setCreating(false);
    }
  };

  const clear = () => {
    setQuery('');
    onChange?.({ clientId: '', clientName: '' });
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          disabled={disabled}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filtered[0]) pick(filtered[0]);
              else applyFreeText();
            }
          }}
          placeholder={placeholder}
          className="pl-9 pr-16"
          autoComplete="off"
        />
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {query && (
            <button
              type="button"
              onClick={clear}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Limpiar"
            >
              <X className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Abrir lista"
          >
            <ChevronsUpDown className="size-3.5" />
          </button>
        </div>
      </div>

      {selected && clientId && (
        <p className="mt-1 text-[11px] text-primary">
          Cliente de agenda · {selected.phone || selected.email || 'sin contacto'}
        </p>
      )}
      {!clientId && query.trim() && (
        <p className="mt-1 text-[11px] text-muted-foreground">Nombre libre (no vinculado a agenda)</p>
      )}

      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Sin coincidencias en la agenda</p>
          ) : (
            filtered.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => pick(c)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary',
                  c.id === clientId && 'bg-primary/10 text-primary',
                )}
              >
                {c.id === clientId ? <Check className="size-3.5 shrink-0" /> : <span className="size-3.5" />}
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">{c.name}</span>
                {c.phone && <span className="shrink-0 text-xs text-muted-foreground">{c.phone}</span>}
              </button>
            ))
          )}
          <div className="border-t border-border p-1.5 space-y-1">
            {query.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={applyFreeText}
              >
                Usar “{query.trim()}” como texto libre
              </Button>
            )}
            {query.trim() && !clients.some(c => c.name.toLowerCase() === query.trim().toLowerCase()) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={creating}
                onClick={handleCreateQuick}
              >
                <Plus className="size-3.5" />
                {creating ? 'Creando…' : `Crear cliente “${query.trim()}”`}
              </Button>
            )}
          </div>
          {createError && <p className="px-3 pb-2 text-xs text-destructive">{createError}</p>}
        </div>
      )}
    </div>
  );
}
