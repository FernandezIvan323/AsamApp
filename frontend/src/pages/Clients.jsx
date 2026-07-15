import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2, Users, Phone, Mail, Calendar, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useToast } from '@/components/ui/use-toast';
import { getClients, createClient, updateClient, deleteClient, getClient } from '@/services/clientsApi';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { currency } from '@/lib/finance';
import { getStatusVariant } from '@/lib/eventStatus';

const EMPTY_FORM = { name: '', phone: '', email: '', notes: '' };

function ClientDetail({ id, onBack }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClient(id).then(setClient).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }
  if (!client) return <p className="text-sm text-destructive">Cliente no encontrado</p>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="size-4" /> Volver a clientes</Button>
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4.5 text-primary" /> {client.name}
            </CardTitle>
            <Badge variant="outline">{client._count?.events || client.events?.length || 0} eventos</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-5">
          {client.phone ? (
            <p className="flex items-center gap-2 text-sm text-foreground">
              <Phone className="size-4 text-muted-foreground" />
              <a href={`tel:${client.phone}`} className="hover:text-primary">{client.phone}</a>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Sin teléfono</p>
          )}
          {client.email && (
            <p className="flex items-center gap-2 text-sm text-foreground">
              <Mail className="size-4 text-muted-foreground" />
              <a href={`mailto:${client.email}`} className="hover:text-primary">{client.email}</a>
            </p>
          )}
          {client.notes && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="size-4.5 text-primary" /> Eventos de este cliente
          </CardTitle>
          <CardDescription>Historial vinculado a la agenda.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          {(client.events || []).length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Calendar className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Todavía no tiene eventos asociados.</p>
              <Button size="sm" asChild>
                <Link to="/new-event">Nuevo presupuesto</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-[10px] uppercase tracking-wider">Fecha</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Evento</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Estado</TableHead>
                  <TableHead className="text-right text-[10px] uppercase tracking-wider">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.events.map(event => (
                  <TableRow key={event.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {event.date ? format(parseISO(event.date), 'dd/MM/yyyy', { locale: es }) : '—'}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      <Link to={`/history/${event.id}`} className="hover:text-primary hover:underline">
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(event.status)} className="text-[10px]">{event.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-foreground">
                      ${currency(event.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Clients() {
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    getClients().then(setClients).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (id) return <ClientDetail id={id} onBack={() => navigate('/clients')} />;

  const filtered = clients.filter(c => {
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  const nameError = (touched.name || touched.all) && !form.name.trim() ? 'El nombre es obligatorio' : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ all: true });
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateClient(editing.id, form);
        toast('Cliente actualizado');
      } else {
        await createClient(form);
        toast('Cliente creado');
      }
      setForm(EMPTY_FORM);
      setEditing(null);
      setShowForm(false);
      setTouched({});
      load();
    } catch (err) {
      toast(err.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (client) => {
    setForm({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      notes: client.notes || '',
    });
    setEditing(client);
    setShowForm(true);
    setTouched({});
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClient(deleteTarget.id);
      toast('Cliente eliminado');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err.message || 'Error al eliminar', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Clientes</Badge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Clientes</h1>
          <p className="text-muted-foreground">Agenda de contratantes y su historial de asados.</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); setTouched({}); }}>
          <Plus className="size-4" /> Nuevo cliente
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">{editing ? 'Editar cliente' : 'Nuevo cliente'}</CardTitle>
            <CardDescription>Datos de contacto para cotizar y llamar rápido.</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
              <FormField label="Nombre" required error={nameError}>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  placeholder="Ej. Familia Pérez / Empresa XYZ"
                  autoFocus
                />
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Teléfono" hint="Para WhatsApp o llamada">
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+54 11 5555-5555"
                  />
                </FormField>
                <FormField label="Email">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="cliente@email.com"
                  />
                </FormField>
              </div>
              <FormField label="Notas" hint="Dirección, preferencias, alergias…">
                <Input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Opcional"
                />
              </FormField>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving || !form.name.trim()}>
                  {saving ? 'Guardando…' : 'Guardar cliente'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); setTouched({}); }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono o email…"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {loading ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Users className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {search ? 'Sin resultados' : 'Sin clientes todavía'}
              </p>
              {!search && (
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="size-4" /> Agregar el primero
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-[10px] uppercase tracking-wider">Nombre</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider hidden sm:table-cell">Teléfono</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-center text-[10px] uppercase tracking-wider">Eventos</TableHead>
                  <TableHead className="text-right text-[10px] uppercase tracking-wider">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(client => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-secondary/40"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <TableCell className="text-sm font-medium text-foreground">{client.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                      {client.phone || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {client.email || '—'}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {client._count?.events || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(client)} title="Editar">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(client)}
                          className="text-destructive hover:text-destructive"
                          title="Eliminar"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="¿Eliminar cliente?"
        description={deleteTarget ? `Se eliminará a "${deleteTarget.name}" de la agenda.` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
