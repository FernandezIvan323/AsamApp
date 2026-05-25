import { useEffect, useState } from 'react';
import { CheckCircle2, Eye, Plus, StickyNote, Trash2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

import { AlertDialog } from '@/components/feedback/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getNotes, createNote, updateNote, deleteNote } from '@/services/notesApi';

const WEEK_OPTIONS = [
  { label: 'Esta semana', value: 0 },
  { label: 'Semana pasada', value: 1 },
  { label: 'Hace 2 semanas', value: 2 },
  { label: 'Todas', value: -1 },
];

function noteInWeek(note, weeksAgo) {
  if (weeksAgo === -1) return true;
  const now = new Date();
  const ref = subWeeks(now, weeksAgo);
  const start = startOfWeek(ref, { weekStartsOn: 1 });
  const end = endOfWeek(ref, { weekStartsOn: 1 });
  return isWithinInterval(new Date(note.createdAt), { start, end });
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [weekFilter, setWeekFilter] = useState(-1);
  const [viewNote, setViewNote] = useState(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    getNotes()
      .then(setNotes)
      .catch(setError)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const note = await createNote({ title, content });
      setNotes(prev => [note, ...prev]);
      setTitle('');
      setContent('');
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (note) => {
    try {
      const updated = await updateNote(note.id, { done: !note.done });
      setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    } catch (err) {
      setError(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setError(err);
    }
  };

  const filtered = notes
    .filter(n => filter === 'pending' ? !n.done : n.done)
    .filter(n => noteInWeek(n, weekFilter));

  const pendingCount = notes.filter(n => !n.done).length;
  const doneCount = notes.filter(n => n.done).length;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Notas y pendientes
          </Badge>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Notas</h1>
            <p className="mt-2 text-muted-foreground">Apuntes, recordatorios y asuntos pendientes.</p>
          </div>
        </div>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1">
            {pendingCount} pendientes
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1">
            <CheckCircle2 className="size-3" /> {doneCount} realizadas
          </span>
        </div>
      </div>

      {/* Formulario nueva nota */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4 text-primary" /> Nueva nota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Título</label>
              <Input
                placeholder="Título de la nota o pendiente..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Descripción</label>
              <Textarea
                placeholder="Descripción o detalle (opcional)..."
                value={content}
                onChange={e => setContent(e.target.value)}
                disabled={saving}
                rows={2}
              />
            </div>
            <Button type="submit" disabled={saving || !title.trim()} className="w-full sm:w-auto">
              <Plus className="size-4" />
              {saving ? 'Guardando...' : 'Agregar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          {[['pending', 'Pendientes'], ['done', 'Realizadas']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === val
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 border-l border-border pl-2">
          {WEEK_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setWeekFilter(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                weekFilter === value
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="size-5 text-primary" />
            {filter === 'pending' ? 'Pendientes' : 'Realizadas'}
          </CardTitle>
          <CardDescription>{filtered.length} nota{filtered.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState title="Cargando notas" description="Obteniendo tus notas y pendientes." />
          ) : error ? (
            <ErrorState description={error.message} onRetry={load} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Sin notas"
              description={filter === 'done' ? 'Aún no has completado ninguna nota.' : 'Agrega tu primera nota arriba.'}
            />
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(note => (
                <div key={note.id} className="py-4">
                  <div className="flex items-center gap-3">
                    <p className={`flex-1 text-lg font-medium ${note.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {note.title}
                    </p>
                    {note.content && (
                      <button
                        onClick={() => setViewNote(note)}
                        className="shrink-0 text-muted-foreground/40 hover:text-primary transition-colors"
                        aria-label="Ver descripción"
                      >
                        <Eye className="size-6" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="size-6" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-base text-muted-foreground/60">
                      {format(new Date(note.createdAt), "d 'de' MMM, HH:mm", { locale: es })}
                    </span>
                    <button
                      onClick={() => handleToggle(note)}
                      className={`text-base font-medium transition-colors ${
                        note.done
                          ? 'text-muted-foreground hover:text-primary'
                          : 'text-primary hover:text-primary/70'
                      }`}
                    >
                      {note.done ? '↩ Marcar pendiente' : '✓ Marcar realizado'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        isOpen={!!viewNote}
        title={viewNote?.title}
        description={viewNote?.content}
        buttonText="Cerrar"
        onClose={() => setViewNote(null)}
      />
    </div>
  );
}
