import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Flame, Printer, Search, Trash2, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useEvents } from '@/hooks/useEvents';
import { EVENT_STATUSES, getAllowedStatuses, getStatusVariant, STATUS_COLORS } from '@/lib/eventStatus';
import { currency, getEventFinancials, getEventSubtotal } from '@/lib/finance';
import './History.css';

export default function History() {
  const { events, isLoading, error, refresh, setEventStatus, removeEvent } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const filteredEvents = events.filter(event => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      event.title.toLowerCase().includes(term) ||
      (event.client && event.client.toLowerCase().includes(term));
    const matchesStatus = !statusFilter || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      setMutationError(null);
      await setEventStatus(id, newStatus);
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    try {
      setMutationError(null);
      await removeEvent(eventToDelete.id);
      if (selectedEvent?.id === eventToDelete.id) setSelectedEvent(null);
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
    } catch (err) {
      setMutationError(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
          Historial
        </Badge>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Historial de presupuestos</h1>
          <p className="mt-2 text-muted-foreground">Buscá, revisá, cambiá estados o eliminá cotizaciones.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Presupuestos</CardTitle>
          <CardDescription>Filtrá por nombre, cliente o estado del evento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative min-w-0 flex-1 sm:max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por evento o cliente…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-52">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                {EVENT_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </div>
          </div>

          {mutationError && <p className="text-sm text-destructive">{mutationError.message}</p>}

          {isLoading ? (
            <LoadingState title="Cargando historial" description="Consultando tus presupuestos." />
          ) : error ? (
            <ErrorState description={error.message} onRetry={refresh} />
          ) : filteredEvents.length === 0 ? (
            <EmptyState title="No se encontraron presupuestos" description="Ajustá la búsqueda o creá un nuevo evento." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="h-10 px-3 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Fecha</th>
                    <th className="h-10 px-3 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Evento</th>
                    <th className="h-10 px-3 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap hidden sm:table-cell">Cliente</th>
                    <th className="h-10 px-3 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap hidden md:table-cell">Invitados</th>
                    <th className="h-10 px-3 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Total</th>
                    <th className="h-10 px-3 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Estado</th>
                    <th className="h-10 px-3 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map(event => {
                    const dateObj = event.date ? parseISO(event.date) : new Date();
                    const allowed = getAllowedStatuses(event.status);
                    return (
                      <tr key={event.id} className="border-b border-border/60 transition-colors hover:bg-secondary/40">
                        <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                          {event.date ? format(dateObj, 'dd/MM/yyyy', { locale: es }) : '—'}
                        </td>
                        <td className="p-3 whitespace-nowrap font-medium text-foreground">{event.title}</td>
                        <td className="p-3 whitespace-nowrap text-sm text-muted-foreground hidden sm:table-cell">{event.client || '—'}</td>
                        <td className="p-3 whitespace-nowrap text-sm text-muted-foreground hidden md:table-cell">{event.guests}</td>
                        <td className="p-3 whitespace-nowrap font-semibold text-foreground">${currency(event.totalPrice)}</td>
                        <td className="p-3 whitespace-nowrap">
                          <select
                            className={`appearance-none rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${STATUS_COLORS[event.status] || 'bg-muted/30 text-muted-foreground border-border'}`}
                            value={event.status}
                            onChange={(e) => handleStatusChange(event.id, e.target.value)}
                          >
                            {allowed.map(status => (
                              <option key={status} value={status} className="bg-card text-foreground">{status}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="outline" asChild className="h-8 px-2.5 text-xs">
                              <Link to={`/history/${event.id}`}>
                                <Eye className="size-3.5" />
                                Gestionar
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 px-2.5 text-xs"
                              onClick={() => { setSelectedEvent(event); setTimeout(handlePrint, 300); }}
                            >
                              <Download className="size-3.5" />
                              PDF
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(event)}
                              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                              title="Eliminar presupuesto"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEvent && (
        <div className="modal-overlay no-print">
          <div className="modal-content print-area">
            <div className="ticket-header">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="size-7 text-primary" />
                <h2 className="text-xl font-semibold text-primary">AsamApp</h2>
                <Badge variant={getStatusVariant(selectedEvent.status)} className="ml-auto">{selectedEvent.status}</Badge>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Presupuesto: {selectedEvent.title}</h3>
              <p><strong>Cliente:</strong> {selectedEvent.client || 'Consumidor Final'}</p>
              <p><strong>Fecha:</strong> {selectedEvent.date ? format(parseISO(selectedEvent.date), 'dd/MM/yyyy') : '-'} {selectedEvent.time && `a las ${selectedEvent.time}`}</p>
              <p><strong>Lugar:</strong> {selectedEvent.location || '-'}</p>
              <p><strong>Invitados totales:</strong> {selectedEvent.guests}</p>
            </div>

            <div className="ticket-section">
              <h4 className="mb-4 border-b border-border pb-2 font-semibold">Insumos necesarios</h4>
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: 'center' }}>Cant.</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEvent.insumos?.map((item) => (
                    <tr key={item.id || `${item.name}-${item.quantity}`}>
                      <td>{item.name}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                      <td style={{ textAlign: 'right' }}>${currency(item.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ticket-section ticket-financials">
              <div className="ticket-row">
                <span>Subtotal insumos:</span>
                <span>${currency((selectedEvent.insumos?.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0) || 0))}</span>
              </div>
              <div className="ticket-row">
                <span>Costos adicionales:</span>
                <span>${currency(selectedEvent.extraCosts)}</span>
              </div>
              <div className="ticket-row">
                <span>Margen de ganancia ({selectedEvent.profitMargin || 0}%):</span>
                <span>${currency(getEventFinancials(selectedEvent).profit)}</span>
              </div>
              <div className="ticket-row ticket-total">
                <span>Total general:</span>
                <span>${currency(selectedEvent.totalPrice)}</span>
              </div>
              <div className="ticket-row mt-2 text-sm text-muted-foreground">
                <span>Costo base por persona:</span>
                <span>${currency(getEventSubtotal(selectedEvent) / (selectedEvent.guests || 1))}</span>
              </div>
            </div>

            <div className="modal-actions no-print mt-8 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
                <X className="size-4" /> Cerrar
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="size-4" /> Guardar como PDF / Imprimir
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="¿Eliminar presupuesto del historial?"
        description={eventToDelete ? `Estás a punto de eliminar el presupuesto de "${eventToDelete.title}". Esta acción es irreversible.` : ''}
        confirmText="Eliminar presupuesto"
        cancelText="Cancelar"
        variant="destructive"
        note="Nota: se eliminará la cotización y sus registros financieros del historial."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setEventToDelete(null);
        }}
      />
    </div>
  );
}
