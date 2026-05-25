import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

import { apiRequest } from '@/lib/api';
import { Input } from '@/components/ui/input';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      apiRequest(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then(setResults)
        .catch(() => setResults(null));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = results && (
    results.events?.length ||
    results.providers?.length ||
    results.inventory?.length ||
    results.notes?.length ||
    results.templates?.length
  );

  return (
    <div className="relative mb-4 max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Buscar eventos, insumos, proveedores…"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card p-2 shadow-lg">
          {!hasResults ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">Sin resultados para "{query}"</p>
          ) : (
            <div className="max-h-72 space-y-3 overflow-y-auto text-sm">
              {results.events?.length > 0 && (
                <div>
                  <p className="px-2 text-xs font-semibold text-muted-foreground">Eventos</p>
                  {results.events.map(e => (
                    <Link key={e.id} to={`/history/${e.id}`} className="block rounded px-2 py-1.5 hover:bg-muted">{e.title}</Link>
                  ))}
                </div>
              )}
              {results.inventory?.length > 0 && (
                <div>
                  <p className="px-2 text-xs font-semibold text-muted-foreground">Insumos</p>
                  {results.inventory.map(i => (
                    <Link key={i.id} to="/inventory" className="block rounded px-2 py-1.5 hover:bg-muted">{i.name}</Link>
                  ))}
                </div>
              )}
              {results.providers?.length > 0 && (
                <div>
                  <p className="px-2 text-xs font-semibold text-muted-foreground">Proveedores</p>
                  {results.providers.map(p => (
                    <Link key={p.id} to="/providers" className="block rounded px-2 py-1.5 hover:bg-muted">{p.name}</Link>
                  ))}
                </div>
              )}
              {results.templates?.length > 0 && (
                <div>
                  <p className="px-2 text-xs font-semibold text-muted-foreground">Plantillas</p>
                  {results.templates.map(t => (
                    <Link key={t.id} to="/templates" className="block rounded px-2 py-1.5 hover:bg-muted">{t.name}</Link>
                  ))}
                </div>
              )}
              {results.notes?.length > 0 && (
                <div>
                  <p className="px-2 text-xs font-semibold text-muted-foreground">Notas</p>
                  {results.notes.map(n => (
                    <Link key={n.id} to="/notes" className="block rounded px-2 py-1.5 hover:bg-muted">{n.title}</Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
