import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardCheck, DollarSign, Store, Users } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { currency } from '@/lib/finance';
import { getOperationsSummary } from '@/services/operationsApi';

export default function Operations() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSummary = () => {
    setIsLoading(true);
    setError(null);
    getOperationsSummary()
      .then(setSummary)
      .catch(setError)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (isLoading) return <LoadingState title="Cargando centro operativo" description="Estamos reuniendo eventos, compras, stock y tareas." />;
  if (error) return <ErrorState description={error.message} onRetry={loadSummary} />;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Operaciones</Badge>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Centro Operativo</h1>
          <p className="mt-2 text-muted-foreground">Vista unificada de eventos activos, cobros, compras reales, proveedores y alertas de stock.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardHeader className="p-6"><CardDescription className="flex gap-2"><Users className="size-4 text-primary" /> Eventos activos</CardDescription><CardTitle className="text-2xl">{summary.activeEvents}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="p-6"><CardDescription className="flex gap-2"><DollarSign className="size-4 text-primary" /> Pendiente por cobrar</CardDescription><CardTitle className="text-2xl">${currency(summary.pendingRevenue)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="p-6"><CardDescription className="flex gap-2"><Store className="size-4 text-primary" /> Costos reales</CardDescription><CardTitle className="text-2xl">${currency(summary.actualCosts)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="p-6"><CardDescription className="flex gap-2"><ClipboardCheck className="size-4 text-primary" /> Tareas abiertas</CardDescription><CardTitle className="text-2xl">{summary.openTasks.length}</CardTitle></CardHeader></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="size-5 text-primary" /> Alertas de stock</CardTitle>
            <CardDescription>Insumos por debajo o al limite del minimo configurado.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.lowStock.length === 0 ? (
              <EmptyState title="Stock sin alertas" description="No hay insumos por debajo del minimo." />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Insumo</TableHead><TableHead>Stock</TableHead><TableHead>Minimo</TableHead></TableRow></TableHeader>
                <TableBody>
                  {summary.lowStock.map(item => (
                    <TableRow key={item.id}><TableCell className="font-medium">{item.name}</TableCell><TableCell>{item.stock} {item.unit}</TableCell><TableCell>{item.minStock} {item.unit}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tareas pendientes</CardTitle>
            <CardDescription>Checklist operativo agrupado desde los eventos.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.openTasks.length === 0 ? (
              <EmptyState title="Sin tareas abiertas" description="Las tareas de eventos apareceran aqui." />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Tarea</TableHead><TableHead>Evento</TableHead><TableHead>Vence</TableHead></TableRow></TableHeader>
                <TableBody>
                  {summary.openTasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        {task.eventId ? (
                          <Link to={`/history/${task.eventId}`} className="text-primary hover:underline">{task.eventTitle}</Link>
                        ) : task.eventTitle}
                      </TableCell>
                      <TableCell>{task.dueDate || 'Sin fecha'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
