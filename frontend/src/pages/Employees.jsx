import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Plus, Trash2, Users, Clock, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { currency } from '@/lib/finance';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeActivities,
  createEmployeeActivity,
  deleteEmployeeActivity,
} from '@/services/employeesApi';
import { getEvents } from '@/services/eventsApi';

const EMPTY_FORM = { name: '', phone: '', email: '', role: 'Cocinero', hourlyRate: '', notes: '' };
const ROLES = ['Cocinero', 'Ayudante', 'Parrillero', 'Mesero', 'Bartender', 'Otro'];
const PAYMENT_TYPES = ['Por hora', 'Por evento', 'Fijo'];
const EMPTY_ACTIVITY = {
  employeeId: '',
  hours: '',
  description: '',
  eventId: '',
  paymentType: 'Por hora',
  payment: '',
  date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
};

function OverlayModal({ title, subtitle, onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-border shadow-2xl',
          maxWidth,
        )}
        style={{ background: 'var(--card, #0F1B33)' }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export default function Employees() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'activities' ? 'activities' : 'employees';

  const [employees, setEmployees] = useState([]);
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [empModal, setEmpModal] = useState(null); // null | 'create' | employee
  const [empForm, setEmpForm] = useState(EMPTY_FORM);
  const [empSaving, setEmpSaving] = useState(false);
  const [empError, setEmpError] = useState(null);

  const [actModal, setActModal] = useState(false);
  const [actForm, setActForm] = useState(EMPTY_ACTIVITY);
  const [actSaving, setActSaving] = useState(false);
  const [actError, setActError] = useState(null);

  const [deleteEmp, setDeleteEmp] = useState(null);
  const [deleteActId, setDeleteActId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([getEmployees(), getEmployeeActivities(), getEvents()])
      .then(([emps, acts, evs]) => {
        setEmployees(Array.isArray(emps) ? emps : []);
        setActivities(Array.isArray(acts) ? acts : []);
        setEvents(Array.isArray(evs) ? evs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  const totalHours = activities.reduce((s, a) => s + a.hours, 0);
  const totalPayments = activities.reduce((s, a) => s + a.payment, 0);

  const setTab = (next) => {
    if (next === 'activities') setSearchParams({ tab: 'activities' });
    else setSearchParams({});
  };

  const openCreateEmp = () => {
    setEmpForm(EMPTY_FORM);
    setEmpError(null);
    setEmpModal('create');
  };

  const openEditEmp = (emp) => {
    setEmpForm({
      name: emp.name || '',
      phone: emp.phone || '',
      email: emp.email || '',
      role: emp.role || 'Cocinero',
      hourlyRate: String(emp.hourlyRate ?? ''),
      notes: emp.notes || '',
    });
    setEmpError(null);
    setEmpModal(emp);
  };

  const openAct = () => {
    setActForm(EMPTY_ACTIVITY);
    setActError(null);
    setActModal(true);
  };

  const selectedEmployee = useMemo(
    () => employees.find(e => e.id === actForm.employeeId),
    [employees, actForm.employeeId],
  );

  const suggestedPayment = useMemo(() => {
    if (actForm.paymentType !== 'Por hora') return Number(actForm.payment) || 0;
    return (Number(actForm.hours) || 0) * (Number(selectedEmployee?.hourlyRate) || 0);
  }, [actForm.paymentType, actForm.hours, actForm.payment, selectedEmployee]);

  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    if (!empForm.name.trim()) {
      setEmpError('El nombre es obligatorio');
      return;
    }
    setEmpSaving(true);
    setEmpError(null);
    try {
      const payload = { ...empForm, hourlyRate: Number(empForm.hourlyRate) || 0 };
      if (empModal === 'create') {
        await createEmployee(payload);
        toast('Empleado creado');
      } else {
        await updateEmployee(empModal.id, payload);
        toast('Empleado actualizado');
      }
      setEmpModal(null);
      load();
    } catch (err) {
      setEmpError(err.message || 'Error al guardar');
      toast(err.message || 'Error al guardar', 'error');
    } finally {
      setEmpSaving(false);
    }
  };

  const handleActSubmit = async (e) => {
    e.preventDefault();
    if (!actForm.employeeId) {
      setActError('Elegí un empleado');
      return;
    }
    if (actForm.paymentType === 'Por hora' && !(Number(actForm.hours) > 0)) {
      setActError('Indicá las horas trabajadas');
      return;
    }
    setActSaving(true);
    setActError(null);
    try {
      const payment = actForm.paymentType === 'Por hora'
        ? (Number(actForm.payment) > 0 ? Number(actForm.payment) : suggestedPayment)
        : Number(actForm.payment) || 0;
      await createEmployeeActivity({
        ...actForm,
        hours: Number(actForm.hours) || 0,
        payment,
        eventId: actForm.eventId || null,
      });
      toast('Actividad registrada');
      setActModal(false);
      setTab('activities');
      load();
    } catch (err) {
      setActError(err.message || 'Error al registrar');
      toast(err.message || 'Error al registrar', 'error');
    } finally {
      setActSaving(false);
    }
  };

  const confirmDeleteEmp = async () => {
    if (!deleteEmp) return;
    try {
      await deleteEmployee(deleteEmp.id);
      toast('Empleado eliminado');
      setDeleteEmp(null);
      load();
    } catch (err) {
      toast(err.message || 'Error al eliminar', 'error');
    }
  };

  const confirmDeleteAct = async () => {
    if (!deleteActId) return;
    try {
      await deleteEmployeeActivity(deleteActId);
      toast('Actividad eliminada');
      setDeleteActId(null);
      load();
    } catch (err) {
      toast(err.message || 'Error al eliminar', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Equipo</Badge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Equipo</h1>
          <p className="text-muted-foreground">Personal y horas. Los formularios se abren sobre esta página.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={openAct}>
            <Clock className="size-4" /> Registrar actividad
          </Button>
          <Button onClick={openCreateEmp}>
            <Plus className="size-4" /> Nuevo empleado
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{employees.length}</p><p className="text-xs text-muted-foreground">Empleados</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{activities.length}</p><p className="text-xs text-muted-foreground">Actividades</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{totalHours}h</p><p className="text-xs text-muted-foreground">Horas totales</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">${currency(totalPayments)}</p><p className="text-xs text-muted-foreground">Pagado</p></CardContent></Card>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button type="button" onClick={() => setTab('employees')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'employees' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Empleados</button>
        <button type="button" onClick={() => setTab('activities')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'activities' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Actividades</button>
      </div>

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
              <div className="flex flex-col items-center gap-3 py-10">
                <Users className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{search ? 'Sin resultados' : 'Sin empleados todavía'}</p>
                {!search && <Button size="sm" onClick={openCreateEmp}><Plus className="size-4" /> Agregar el primero</Button>}
              </div>
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
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{emp.phone || '—'}</TableCell>
                      <TableCell className="text-right text-sm text-foreground">${currency(emp.hourlyRate)}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{emp._count?.activities || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditEmp(emp)} title="Editar"><Pencil className="size-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteEmp(emp)} className="text-destructive hover:text-destructive" title="Eliminar"><Trash2 className="size-4" /></Button>
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
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4.5 text-primary" /> Historial de actividades ({activities.length})
            </CardTitle>
            <Button size="sm" onClick={openAct}><Plus className="size-4" /> Nueva actividad</Button>
          </CardHeader>
          <CardContent className="pt-5">
            {loading ? (
              <div className="flex min-h-[20vh] items-center justify-center"><div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <Clock className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Sin actividades registradas</p>
                <Button size="sm" onClick={openAct}><Plus className="size-4" /> Registrar la primera</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-[10px] uppercase tracking-wider">Fecha</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider">Empleado</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider hidden sm:table-cell">Descripción</TableHead>
                    <TableHead className="text-center text-[10px] uppercase tracking-wider">Horas</TableHead>
                    <TableHead className="text-right text-[10px] uppercase tracking-wider">Pago</TableHead>
                    <TableHead className="text-right text-[10px] uppercase tracking-wider" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(a.date), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{a.employee?.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground hidden sm:table-cell">{a.description || a.event?.title || '—'}</TableCell>
                      <TableCell className="text-center text-sm text-foreground">{a.hours}h</TableCell>
                      <TableCell className="text-right text-sm font-medium text-foreground">${currency(a.payment)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setDeleteActId(a.id)} className="text-destructive hover:text-destructive" title="Eliminar"><Trash2 className="size-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal empleado */}
      {empModal && (
        <OverlayModal
          title={empModal === 'create' ? 'Nuevo empleado' : 'Editar empleado'}
          subtitle="Se guarda sobre esta misma pantalla."
          onClose={() => setEmpModal(null)}
        >
          <form onSubmit={handleEmpSubmit} className="space-y-4">
            <FormField label="Nombre" required error={empError && !empForm.name.trim() ? empError : null}>
              <Input value={empForm.name} onChange={e => setEmpForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre del empleado" autoFocus />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Teléfono">
                <Input type="tel" value={empForm.phone} onChange={e => setEmpForm(f => ({ ...f, phone: e.target.value }))} placeholder="+54 11 …" />
              </FormField>
              <FormField label="Email">
                <Input type="email" value={empForm.email} onChange={e => setEmpForm(f => ({ ...f, email: e.target.value }))} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Rol">
                <Select value={empForm.role} onChange={e => setEmpForm(f => ({ ...f, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </Select>
              </FormField>
              <FormField label="Pago por hora ($)">
                <Input type="number" min="0" step="0.01" inputMode="decimal" value={empForm.hourlyRate} onChange={e => setEmpForm(f => ({ ...f, hourlyRate: e.target.value }))} />
              </FormField>
            </div>
            <FormField label="Notas">
              <Input value={empForm.notes} onChange={e => setEmpForm(f => ({ ...f, notes: e.target.value }))} />
            </FormField>
            {empError && empForm.name.trim() && <p className="text-sm text-destructive">{empError}</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" disabled={empSaving || !empForm.name.trim()}>{empSaving ? 'Guardando…' : 'Guardar'}</Button>
              <Button type="button" variant="outline" onClick={() => setEmpModal(null)}>Cancelar</Button>
            </div>
          </form>
        </OverlayModal>
      )}

      {/* Modal actividad */}
      {actModal && (
        <OverlayModal
          title="Registrar actividad"
          subtitle="Horas y pago del personal, sobre esta página."
          onClose={() => setActModal(false)}
        >
          {employees.length === 0 ? (
            <div className="space-y-3 text-center py-4">
              <p className="text-sm text-muted-foreground">Primero creá un empleado.</p>
              <Button onClick={() => { setActModal(false); openCreateEmp(); }}>Nuevo empleado</Button>
            </div>
          ) : (
            <form onSubmit={handleActSubmit} className="space-y-4">
              <FormField label="Empleado" required>
                <Select value={actForm.employeeId} onChange={e => setActForm(f => ({ ...f, employeeId: e.target.value }))}>
                  <option value="">Seleccionar empleado</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </Select>
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Fecha y hora">
                  <Input type="datetime-local" value={actForm.date} onChange={e => setActForm(f => ({ ...f, date: e.target.value }))} />
                </FormField>
                <FormField label="Horas" required={actForm.paymentType === 'Por hora'}>
                  <Input type="number" min="0.5" step="0.5" inputMode="decimal" value={actForm.hours} onChange={e => setActForm(f => ({ ...f, hours: e.target.value }))} placeholder="4" />
                </FormField>
              </div>
              <FormField label="Descripción">
                <Input value={actForm.description} onChange={e => setActForm(f => ({ ...f, description: e.target.value }))} placeholder="Ej. Armado de parrilla" />
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Tipo de pago">
                  <Select value={actForm.paymentType} onChange={e => setActForm(f => ({ ...f, paymentType: e.target.value, payment: '' }))}>
                    {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormField>
                <FormField label="Monto ($)" hint={actForm.paymentType === 'Por hora' ? `Sugerido: $${currency(suggestedPayment)}` : undefined}>
                  <Input type="number" min="0" step="0.01" inputMode="decimal" value={actForm.payment} onChange={e => setActForm(f => ({ ...f, payment: e.target.value }))} placeholder={actForm.paymentType === 'Por hora' ? String(suggestedPayment || '') : '0'} />
                </FormField>
              </div>
              <FormField label="Evento asociado" hint="Recomendado para el margen del asado">
                <Select value={actForm.eventId} onChange={e => setActForm(f => ({ ...f, eventId: e.target.value }))}>
                  <option value="">Sin evento</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </Select>
              </FormField>
              {actError && <p className="text-sm text-destructive">{actError}</p>}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" disabled={actSaving || !actForm.employeeId}>{actSaving ? 'Guardando…' : 'Guardar actividad'}</Button>
                <Button type="button" variant="outline" onClick={() => setActModal(false)}>Cancelar</Button>
              </div>
            </form>
          )}
        </OverlayModal>
      )}

      <ConfirmDialog
        isOpen={!!deleteEmp}
        title="¿Eliminar empleado?"
        description={deleteEmp ? `Se eliminará a "${deleteEmp.name}".` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteEmp}
        onCancel={() => setDeleteEmp(null)}
      />
      <ConfirmDialog
        isOpen={!!deleteActId}
        title="¿Eliminar actividad?"
        description="Se borrará el registro de horas/pago."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteAct}
        onCancel={() => setDeleteActId(null)}
      />
    </div>
  );
}
