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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEvents } from '@/hooks/useEvents';
import { EVENT_STATUSES, getStatusVariant } from '@/lib/eventStatus';
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Historial de Presupuestos</h1>
          <p className="mt-2 text-muted-foreground">Visualiza todos los eventos y cotizaciones creadas.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Presupuestos</CardTitle>
          <CardDescription>Busca, revisa, cambia estados o elimina registros antiguos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[16rem] flex-1 max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                type="text"
                placeholder="Buscar por nombre de evento o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-input h-9 min-h-9 w-48 py-1 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {EVENT_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {mutationError && <p className="text-sm text-destructive">{mutationError.message}</p>}

          {isLoading ? (
            <LoadingState title="Cargando historial" description="Estamos consultando tus presupuestos." />
          ) : error ? (
            <ErrorState description={error.message} onRetry={refresh} />
          ) : filteredEvents.length === 0 ? (
            <EmptyState title="No se encontraron presupuestos" description="Ajusta la búsqueda o crea un nuevo evento." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Invitados</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map(event => {
                  const dateObj = event.date ? parseISO(event.date) : new Date();
                  return (
                    <TableRow key={event.id}>
                      <TableCell>{format(dateObj, 'dd/MM/yyyy', { locale: es })}</TableCell>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.client || '-'}</TableCell>
                      <TableCell>{event.guests}</TableCell>
                      <TableCell className="font-semibold">${currency(event.totalPrice)}</TableCell>
                      <TableCell>
                        <select
                          className="form-input h-9 min-h-9 w-36 py-1 text-sm"
                          value={event.status}
                          onChange={(e) => handleStatusChange(event.id, e.target.value)}
                        >
                          {EVENT_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" asChild>
                            <Link to={`/history/${event.id}`}>
                              <Eye className="size-4" />
                              Gestionar
                            </Link>
                          </Button>
                          <Button size="sm" onClick={() => { setSelectedEvent(event); setTimeout(handlePrint, 300); }}>
                            <Download className="size-4" />
                            PDF
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(event)} title="Eliminar presupuesto">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedEvent && (
        <div className="modal-overlay no-print">
          <div className="modal-content print-area">
            <div className="ticket-header">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="size-7 text-primary" />
                <h2 className="text-xl font-semibold text-primary">ProyectoAsado</h2>
                <Badge variant={getStatusVariant(selectedEvent.status)} className="ml-auto">{selectedEvent.status}</Badge>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Presupuesto: {selectedEvent.title}</h3>
              <p><strong>Cliente:</strong> {selectedEvent.client || 'Consumidor Final'}</p>
              <p><strong>Fecha:</strong> {selectedEvent.date ? format(parseISO(selectedEvent.date), 'dd/MM/yyyy') : '-'} {selectedEvent.time && `a las ${selectedEvent.time}`}</p>
              <p><strong>Lugar:</strong> {selectedEvent.location || '-'}</p>
              <p><strong>Invitados Totales:</strong> {selectedEvent.guests}</p>
            </div>

            <div className="ticket-section">
              <h4 className="mb-4 border-b border-border pb-2 font-semibold">Insumos Necesarios</h4>
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
                <span>Subtotal Insumos:</span>
                <span>${currency((selectedEvent.insumos?.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0) || 0))}</span>
              </div>
              <div className="ticket-row">
                <span>Costos Adicionales:</span>
                <span>${currency(selectedEvent.extraCosts)}</span>
              </div>
              <div className="ticket-row">
                <span>Margen de Ganancia ({selectedEvent.profitMargin || 0}%):</span>
                <span>${currency(getEventFinancials(selectedEvent).profit)}</span>
              </div>
              <div className="ticket-row ticket-total">
                <span>Total General:</span>
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
        note="Nota: Esta acción eliminará permanentemente la cotización y todos sus registros financieros del historial."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setEventToDelete(null);
        }}
      />
    </div>
  );
}
