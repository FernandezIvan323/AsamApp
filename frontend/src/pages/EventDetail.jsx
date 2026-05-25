import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Check,
  ClipboardList,
  DollarSign,
  Copy,
  FileDown,
  History,
  Pencil,
  Plus,
  Printer,
  ShoppingCart,
} from 'lucide-react';
import { generateEventPdf } from '@/lib/generatePdf';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllowedStatuses, getStatusVariant } from '@/lib/eventStatus';
import { currency, getEventFinancials, getEventRealFinancials, getEventSubtotal } from '@/lib/finance';
import { PAYMENT_METHODS } from '@/lib/paymentMethods';
import {
  createEventPayment,
  createEventTask,
  duplicateEvent,
  getEvent,
  updateEventStatus,
  updateEventTask,
} from '@/services/eventsApi';
import '../pages/History.css';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [taskForm, setTaskForm] = useState({ title: '', dueDate: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'Efectivo', notes: '' });

  const loadEvent = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getEvent(id)
      .then(setEvent)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleStatusChange = async (newStatus) => {
    try {
      setMutationError(null);
      const updated = await updateEventStatus(id, newStatus);
      setEvent(updated);
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    try {
      setMutationError(null);
      await createEventTask(id, { title: taskForm.title.trim(), dueDate: taskForm.dueDate || null, done: false });
      setTaskForm({ title: '', dueDate: '' });
      loadEvent();
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      setMutationError(null);
      await updateEventTask(id, task.id, {
        title: task.title,
        dueDate: task.dueDate,
        done: !task.done,
      });
      loadEvent();
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) return;
    try {
      setMutationError(null);
      await createEventPayment(id, {
        amount,
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes || null,
      });
      setPaymentForm({ amount: '', paymentMethod: 'Efectivo', notes: '' });
      loadEvent();
    } catch (err) {
      setMutationError(err);
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const name = event?.title ? `presupuesto-${event.title.replace(/\s+/g, '-').toLowerCase()}.pdf` : 'presupuesto.pdf';
      await generateEventPdf(name);
    } catch (err) {
      setMutationError(err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setMutationError(null);
      const copy = await duplicateEvent(id);
      navigate(`/history/${copy.id}/edit`);
    } catch (err) {
      setMutationError(err);
    }
  };

  if (isLoading) {
    return <LoadingState title="Cargando evento" description="Obteniendo tareas, pagos y compras." />;
  }
  if (error) {
    return <ErrorState description={error.message} onRetry={loadEvent} />;
  }
  if (!event) {
    return <EmptyState title="Evento no encontrado" description="El presupuesto puede haber sido eliminado." />;
  }

  const financials = getEventFinancials(event);
  const real = getEventRealFinancials(event);
  const paidPercent = event.totalPrice > 0 ? Math.min(100, (event.amountPaid / event.totalPrice) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center gap-3">
        <Button variant="ghost" asChild>
          <Link to="/history"><ArrowLeft className="size-4" /> Volver al historial</Link>
        </Button>
        <Button variant="secondary" onClick={handlePrint}>
          <Printer className="size-4" /> Imprimir presupuesto
        </Button>
        <Button variant="secondary" onClick={handleDownloadPdf} disabled={pdfLoading}>
          <FileDown className="size-4" /> {pdfLoading ? 'Generando...' : 'Descargar PDF'}
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/history/${id}/edit`}><Pencil className="size-4" /> Editar cotización</Link>
        </Button>
        <Button variant="outline" onClick={handleDuplicate}>
          <Copy className="size-4" /> Duplicar evento
        </Button>
      </div>

      <div className="print-area space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant={getStatusVariant(event.status)}>{event.status}</Badge>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{event.title}</h1>
            <p className="text-muted-foreground">
              {event.client || 'Sin cliente'}
              {event.date && ` · ${format(parseISO(event.date), 'dd MMM yyyy', { locale: es })}`}
              {event.time && ` ${event.time}`}
            </p>
          </div>
          <div className="no-print space-y-2">
            <Label>Estado del evento</Label>
            <select
              className="form-input h-9 min-h-9 w-48 py-1 text-sm"
              value={event.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {getAllowedStatuses(event.status).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {mutationError && <p className="no-print text-sm text-destructive">{mutationError.message}</p>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card><CardHeader className="p-4"><CardDescription>Cotizado al cliente</CardDescription><CardTitle>${currency(real.quotedPrice)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="p-4"><CardDescription>Costo presupuestado</CardDescription><CardTitle>${currency(real.quotedCost)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="p-4"><CardDescription>Ganancia proyectada</CardDescription><CardTitle>${currency(real.quotedProfit)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="p-4"><CardDescription>Gastado en compras</CardDescription><CardTitle>${currency(real.purchaseTotal)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="p-4"><CardDescription>Cobrado</CardDescription><CardTitle className="text-emerald-400">${currency(real.amountPaid)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="p-4"><CardDescription>Margen real (cobrado − compras)</CardDescription><CardTitle className={real.realProfit >= 0 ? 'text-emerald-400' : 'text-destructive'}>${currency(real.realProfit)}</CardTitle></CardHeader></Card>
        </div>
        <p className="no-print text-sm text-muted-foreground">
          {real.costVariance !== 0 && (
            <>Diferencia costo real vs presupuesto: {real.costVariance > 0 ? '+' : ''}${currency(real.costVariance)}</>
          )}
          {real.pending > 0 && (
            <>{real.costVariance !== 0 ? ' · ' : ''}Pendiente por cobrar: ${currency(real.pending)}</>
          )}
        </p>

        <div className="no-print h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${paidPercent}%` }} />
        </div>
        <p className="no-print text-xs text-muted-foreground">{paidPercent.toFixed(0)}% cobrado</p>

        <Card>
          <CardHeader><CardTitle>Presupuesto — insumos</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Item</TableHead><TableHead>Cant.</TableHead><TableHead className="text-right">Total</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {(event.insumos || []).map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell className="text-right">${currency(item.totalCost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal + extras</span><span>${currency(getEventSubtotal(event))}</span></div>
              <div className="flex justify-between"><span>Ganancia ({event.profitMargin}%)</span><span>${currency(financials.profit)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>${currency(event.totalPrice)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="no-print grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="size-5 text-primary" /> Tareas</CardTitle>
            <CardDescription>Checklist operativo del evento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddTask} className="flex flex-wrap gap-2">
              <Input className="flex-1 min-w-[12rem]" placeholder="Nueva tarea" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
              <Input type="date" className="w-36" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              <Button type="submit" size="sm"><Plus className="size-4" /> Agregar</Button>
            </form>
            {(event.tasks || []).length === 0 ? (
              <EmptyState title="Sin tareas" description="Agrega tareas para el día del evento." />
            ) : (
              <ul className="space-y-2">
                {event.tasks.map(task => (
                  <li key={task.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                    <button type="button" onClick={() => handleToggleTask(task)} className={`flex size-6 shrink-0 items-center justify-center rounded border ${task.done ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                      {task.done && <Check className="size-4" />}
                    </button>
                    <div className="flex-1">
                      <p className={task.done ? 'text-muted-foreground line-through' : 'font-medium'}>{task.title}</p>
                      {task.dueDate && <p className="text-xs text-muted-foreground">Vence: {format(parseISO(task.dueDate), 'dd/MM/yyyy')}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="size-5 text-primary" /> Pagos</CardTitle>
            <CardDescription>Registra abonos del cliente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddPayment} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Monto</Label>
                <Input type="number" min="0" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Método</Label>
                <select className="form-input h-9 w-full" value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Notas</Label>
                <Input value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} placeholder="Opcional" />
              </div>
              <Button type="submit" className="sm:col-span-2"><Plus className="size-4" /> Registrar pago</Button>
            </form>
            {(event.payments || []).length === 0 ? (
              <EmptyState title="Sin pagos" description="Los abonos aparecerán aquí." />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Método</TableHead><TableHead className="text-right">Monto</TableHead></TableRow></TableHeader>
                <TableBody>
                  {event.payments.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{format(new Date(p.paidAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell>{p.paymentMethod}</TableCell>
                      <TableCell className="text-right font-medium">${currency(p.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingCart className="size-5 text-primary" /> Compras de mercado</CardTitle>
            <CardDescription>Gastos reales vinculados a este evento.</CardDescription>
          </CardHeader>
          <CardContent>
            {(event.purchases || []).length === 0 ? (
              <div className="space-y-3">
                <EmptyState title="Sin compras vinculadas" description="Asocia una compra al crear un gasto de mercado." />
                <Button variant="outline" onClick={() => navigate('/weekly-expenses/new')}>Registrar compra</Button>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Tienda</TableHead><TableHead>Items</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {event.purchases.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{format(new Date(p.purchasedAt), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{p.store}</TableCell>
                      <TableCell>{p.items?.length || 0} productos</TableCell>
                      <TableCell className="text-right font-medium">${currency(p.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {(event.changelog || []).length > 0 && (
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="size-5 text-primary" /> Historial de cambios</CardTitle>
              <CardDescription>Cambios de precio y estado registrados automáticamente.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Fecha</TableHead><TableHead>Campo</TableHead><TableHead>Antes</TableHead><TableHead>Después</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {event.changelog.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground">{format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell className="font-medium capitalize">{log.field === 'totalPrice' ? 'Precio' : 'Estado'}</TableCell>
                      <TableCell className="text-muted-foreground">{log.field === 'totalPrice' ? `$${currency(Number(log.oldValue))}` : log.oldValue}</TableCell>
                      <TableCell>{log.field === 'totalPrice' ? `$${currency(Number(log.newValue))}` : log.newValue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
