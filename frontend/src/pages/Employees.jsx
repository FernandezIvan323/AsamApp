import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Users, Clock, DollarSign, Search, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getEmployeeActivities, createEmployeeActivity, deleteEmployeeActivity } from '@/services/employeesApi';
import { getEvents } from '@/services/eventsApi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { currency } from '@/lib/finance';

const EMPTY_FORM = { name: '', phone: '', email: '', role: 'Cocinero', hourlyRate: '', notes: '' };
const ROLES = ['Cocinero', 'Ayudante', 'Parrillero', 'Mesero', 'Bartender', 'Otro'];
const EMPTY_ACTIVITY = { employeeId: '', hours: '', description: '', eventId: '', date: format(new Date(), "yyyy-MM-dd'T'HH:mm") };

export default function Employees() {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [activityForm, setActivityForm] = useState(EMPTY_ACTIVITY);
  const [savingActivity, setSavingActivity] = useState(false);
  const [tab, setTab] = useState('employees');

  const load = () => {
    setLoading(true);
    Promise.all([
      getEmployees(),
      getEmployeeActivities(),
      getEvents(),
    ]).then(([emps, acts, evs]) => {
      setEmployees(emps);
      setActivities(acts);
      setEvents(Array.isArray(evs) ? evs : []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateEmployee(editing.id, form);
        toast('Empleado actualizado');
      } else {
        await createEmployee(form);
        toast('Empleado creado');
      }
      setForm(EMPTY_FORM);
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err) {
      toast(err.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (emp) => {
    setForm({ name: emp.name, phone: emp.phone || '', email: emp.email || '', role: emp.role, hourlyRate: String(emp.hourlyRate), notes: emp.notes || '' });
    setEditing(emp);
    setShowForm(true);
  };

  const handleDelete = async (emp) => {
    if (!confirm(`¿Eliminar empleado "${emp.name}"?`)) return;
    try {
      await deleteEmployee(emp.id);
      toast('Empleado eliminado');
      load();
    } catch (err) {
      toast(err.message || 'Error al eliminar', 'error');
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    setSavingActivity(true);
    try {
      await createEmployeeActivity(activityForm);
      toast('Actividad registrada');
      setActivityForm(EMPTY_ACTIVITY);
      setShowActivity(false);
      load();
    } catch (err) {
      toast(err.message || 'Error al registrar', 'error');
    } finally {
      setSavingActivity(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    try {
      await deleteEmployeeActivity(id);
      toast('Actividad eliminada');
      load();
    } catch (err) {
      toast(err.message || 'Error al eliminar', 'error');
    }
  };

  const totalHours = activities.reduce((s, a) => s + a.hours, 0);
  const totalPayments = activities.reduce((s, a) => s + a.payment, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Empleados</Badge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Empleados</h1>
          <p className="text-muted-foreground">Gestioná tu equipo y registrá horas trabajadas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setActivityForm(EMPTY_ACTIVITY); setShowActivity(true); }}>
            <Clock className="size-4" /> Registrar actividad
          </Button>
          <Button onClick={() => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); }}>
            <Plus className="size-4" /> Nuevo empleado
          </Button>
        </div>
      </div>

      {/* Mini summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{employees.length}</p><p className="text-xs text-muted-foreground">Empleados</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{activities.length}</p><p className="text-xs text-muted-foreground">Actividades</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{totalHours}h</p><p className="text-xs text-muted-foreground">Horas totales</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-accent">${currency(totalPayments)}</p><p className="text-xs text-muted-foreground">Pagado</p></CardContent></Card>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setTab('employees')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'employees' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Empleados</button>
        <button onClick={() => setTab('activities')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'activities' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Actividades</button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">{editing ? 'Editar empleado' : 'Nuevo empleado'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <FormField label="Nombre" required>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre del empleado" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Teléfono">
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+54 11 5555-5555" />
                </FormField>
                <FormField label="Email">
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Rol">
                  <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </FormField>
                <FormField label="Pago por hora ($)">
                  <Input type="number" min="0" step="0.01" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="Notas">
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </FormField>
              <div className="flex gap-3">
                <Button type="submit" disabled={saving || !form.name.trim()}>{saving ? 'Guardando…' : 'Guardar'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); }}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showActivity && (
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">Registrar actividad</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleActivitySubmit} className="space-y-4 max-w-lg">
              <FormField label="Empleado" required>
                <Select value={activityForm.employeeId} onChange={e => setActivityForm(f => ({ ...f, employeeId: e.target.value }))}>
                  <option value="">Seleccionar empleado</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </Select>
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Fecha y hora">
                  <Input type="datetime-local" value={activityForm.date} onChange={e => setActivityForm(f => ({ ...f, date: e.target.value }))} />
                </FormField>
                <FormField label="Horas" required>
                  <Input type="number" min="0.5" step="0.5" value={activityForm.hours} onChange={e => setActivityForm(f => ({ ...f, hours: e.target.value }))} placeholder="Ej. 4" />
                </FormField>
              </div>
              <FormField label="Descripción">
                <Input value={activityForm.description} onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))} placeholder="Ej. Armado de estructura" />
              </FormField>
              <FormField label="Evento asociado (opcional)">
                <Select value={activityForm.eventId} onChange={e => setActivityForm(f => ({ ...f, eventId: e.target.value }))}>
                  <option value="">Sin evento</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </Select>
              </FormField>
              <div className="flex gap-3">
                <Button type="submit" disabled={savingActivity || !activityForm.employeeId || !activityForm.hours}>{savingActivity ? 'Guardando…' : 'Guardar'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowActivity(false); setActivityForm(EMPTY_ACTIVITY); }}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === 'employees' ? (
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar empleados..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {loading ? (
              <div className="flex min-h-[20vh] items-center justify-center"><div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10"><Users className="size-10 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">{search ? 'Sin resultados' : 'Sin empleados todavía'}</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-[10px] uppercase tracking-wider">Nombre</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider hidden sm:table-cell">Rol</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider hidden md:table-cell">Teléfono</TableHead>
                    <TableHead className="text-right text-[10px] uppercase tracking-wider">Pago/hora</TableHead>
                    <TableHead className="text-center text-[10px] uppercase tracking-wider">Actividades</TableHead>
                    <TableHead className="text-right text-[10px] uppercase tracking-wider">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell className="text-sm font-medium text-foreground">{emp.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{emp.role}</TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{emp.phone || '-'}</TableCell>
                      <TableCell className="text-right text-sm text-foreground">${currency(emp.hourlyRate)}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{emp._count?.activities || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)} title="Editar"><Pencil className="size-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(emp)} className="text-destructive hover:text-destructive" title="Eliminar"><Trash2 className="size-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4.5 text-accent" /> Historial de actividades ({activities.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10"><Clock className="size-10 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">Sin actividades registradas</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-[10px] uppercase tracking-wider">Fecha</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider">Empleado</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider hidden sm:table-cell">Descripción</TableHead>
                    <TableHead className="text-center text-[10px] uppercase tracking-wider">Horas</TableHead>
                    <TableHead className="text-right text-[10px] uppercase tracking-wider">Pago</TableHead>
                    <TableHead className="text-right text-[10px] uppercase tracking-wider"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(a.date), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{a.employee?.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">{a.description || a.event?.title || '-'}</TableCell>
                      <TableCell className="text-center text-sm text-foreground">{a.hours}h</TableCell>
                      <TableCell className="text-right text-sm font-medium text-foreground">${currency(a.payment)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteActivity(a.id)} className="text-destructive hover:text-destructive" title="Eliminar"><Trash2 className="size-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
