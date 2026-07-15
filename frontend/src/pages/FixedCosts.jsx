import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';

import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { currency } from '@/lib/finance';
import { deleteFixedCost, getFixedCosts } from '@/services/fixedCostsApi';

function monthlyEquivalent(cost) {
  if (cost.frequency === 'Anual') return cost.amount / 12;
  if (cost.frequency === 'Por evento') return null;
  return cost.amount;
}

export default function FixedCosts() {
  const navigate = useNavigate();
  const toast = useToast();
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    getFixedCosts()
      .then(data => setCosts(Array.isArray(data) ? data : []))
      .catch(() => setCosts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const totalMonthly = costs.reduce((sum, c) => {
    const m = monthlyEquivalent(c);
    return m !== null ? sum + m : sum;
  }, 0);
  const totalPerEvent = costs.filter(c => c.frequency === 'Por evento').reduce((sum, c) => sum + c.amount, 0);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteFixedCost(toDelete.id);
      toast('Gasto eliminado');
      setToDelete(null);
      load();
    } catch (err) {
      toast(err.message || 'No se pudo eliminar', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Estructura de costos</Badge>
          <h1 className="text-2xl font-bold tracking-tight">Gastos fijos del negocio</h1>
          <p className="text-muted-foreground">
            Costos recurrentes (gas, local, transporte…) para ver la rentabilidad real del mes.
          </p>
        </div>
        <Button onClick={() => navigate('/fixed-costs/new')}>
          <Plus className="size-4" /> Nuevo gasto fijo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="p-4">
            <CardDescription>Costo fijo mensual</CardDescription>
            <CardTitle className="text-2xl text-primary">${currency(totalMonthly)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription>Equivalente anual</CardDescription>
            <CardTitle className="text-2xl">${currency(totalMonthly * 12)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription>Costo por evento</CardDescription>
            <CardTitle className="text-2xl">${currency(totalPerEvent)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="size-5 text-primary" /> Gastos registrados
          </CardTitle>
          <CardDescription>
            {costs.length} gasto{costs.length !== 1 ? 's' : ''} fijo{costs.length !== 1 ? 's' : ''}. El alta se hace en pantalla aparte.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          {loading ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          ) : costs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Building2 className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No hay gastos fijos registrados.</p>
              <Button size="sm" onClick={() => navigate('/fixed-costs/new')}>
                <Plus className="size-4" /> Agregar el primero
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right hidden md:table-cell">≈ Mensual</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map(cost => (
                  <TableRow key={cost.id}>
                    <TableCell className="font-medium">{cost.name}</TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">{cost.category || '—'}</TableCell>
                    <TableCell><Badge variant="outline">{cost.frequency}</Badge></TableCell>
                    <TableCell className="text-right">${currency(cost.amount)}</TableCell>
                    <TableCell className="text-right text-muted-foreground hidden md:table-cell">
                      {monthlyEquivalent(cost) !== null ? `$${currency(monthlyEquivalent(cost))}` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" asChild title="Editar">
                          <Link to={`/fixed-costs/${cost.id}/edit`}><Pencil className="size-4" /></Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setToDelete(cost)}
                          title="Eliminar"
                        >
                          <Trash2 className="size-4 text-destructive" />
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
        isOpen={!!toDelete}
        title="¿Eliminar gasto fijo?"
        description={toDelete ? `Se eliminará "${toDelete.name}".` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
