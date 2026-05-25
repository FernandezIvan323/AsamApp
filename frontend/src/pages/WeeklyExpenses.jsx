import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isSameWeek,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Image,
  Plus,
  ReceiptText,
  Store,
  Trash2,
  UserRound,
} from 'lucide-react';

import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMarketPurchases } from '@/hooks/useMarketPurchases';
import { currency } from '@/lib/finance';

function getWeekBounds(date) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = addDays(endOfWeek(date, { weekStartsOn: 1 }), 1);
  return { start, end };
}

function purchaseItemCount(purchase) {
  return purchase.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0;
}

export default function WeeklyExpenses() {
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [mutationError, setMutationError] = useState(null);

  const weekBounds = useMemo(() => getWeekBounds(weekAnchor), [weekAnchor]);
  const startParam = weekBounds.start.toISOString();
  const endParam = weekBounds.end.toISOString();
  const { purchases, isLoading, error, refresh, removePurchase } = useMarketPurchases({
    start: startParam,
    end: endParam,
  });

  const isCurrentWeek = isSameWeek(weekAnchor, new Date(), { weekStartsOn: 1 });
  const weekLabel = `${format(weekBounds.start, "d 'de' MMM", { locale: es })} - ${format(addDays(weekBounds.end, -1), "d 'de' MMM", { locale: es })}`;

  const summary = useMemo(() => {
    const total = purchases.reduce((acc, purchase) => acc + Number(purchase.totalAmount || 0), 0);
    const average = purchases.length ? total / purchases.length : 0;
    const stores = purchases.reduce((acc, purchase) => {
      acc[purchase.store] = (acc[purchase.store] || 0) + Number(purchase.totalAmount || 0);
      return acc;
    }, {});
    const topStore = Object.entries(stores).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      average,
      topStore: topStore ? { name: topStore[0], amount: topStore[1] } : null,
    };
  }, [purchases]);

  const handleDeleteConfirm = async () => {
    if (!purchaseToDelete) return;
    try {
      setMutationError(null);
      await removePurchase(purchaseToDelete.id);
      setPurchaseToDelete(null);
    } catch (err) {
      setMutationError(err);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              Compras semanales
            </Badge>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Gastos Mercado</h1>
              <p className="mt-2 text-muted-foreground">Control semanal de compras, facturas, vendedores y pagos.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setWeekAnchor(prev => subWeeks(prev, 1))} title="Semana anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex h-9 min-w-60 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium">
              <CalendarDays className="mr-2 size-4 text-primary" />
              {weekLabel}
            </div>
            <Button variant="outline" size="icon" onClick={() => setWeekAnchor(prev => addWeeks(prev, 1))} title="Semana siguiente">
              <ChevronRight className="size-4" />
            </Button>
            <Button variant={isCurrentWeek ? 'secondary' : 'default'} onClick={() => setWeekAnchor(new Date())}>
              Semana actual
            </Button>
            <Button asChild>
              <Link to="/weekly-expenses/new">
                <Plus className="size-4" />
                Agregar compra
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="p-6">
              <CardDescription className="flex items-center gap-2">
                <ReceiptText className="size-4 text-primary" />
                Total gastado
              </CardDescription>
              <CardTitle className="text-2xl">${currency(summary.total)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-6">
              <CardDescription className="flex items-center gap-2">
                <Store className="size-4 text-primary" />
                Tienda principal
              </CardDescription>
              <CardTitle className="text-xl">{summary.topStore?.name || 'Sin datos'}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {summary.topStore ? `$${currency(summary.topStore.amount)} acumulados` : 'Aparece cuando registres compras'}
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-6">
              <CardDescription className="flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                Promedio por compra
              </CardDescription>
              <CardTitle className="text-2xl">${currency(summary.average)}</CardTitle>
              <p className="text-xs text-muted-foreground">{purchases.length} compras en la semana</p>
            </CardHeader>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Historial de compras</CardTitle>
          <CardDescription>Compras registradas en la semana seleccionada, de la mas reciente a la mas antigua.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState title="Cargando compras" description="Estamos consultando los gastos de la semana." />
          ) : error ? (
            <ErrorState description={error.message} onRetry={refresh} />
          ) : purchases.length === 0 ? (
            <EmptyState title="No hay compras en esta semana" description="Usa Agregar compra para registrar tienda, productos, vendedor y facturas." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tienda</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Facturas</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map(purchase => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="font-medium">{format(new Date(purchase.purchasedAt), 'dd MMM yyyy', { locale: es })}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(purchase.purchasedAt), 'HH:mm')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{purchase.store}</div>
                      <div className="text-xs text-muted-foreground">{purchase.paymentMethod}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserRound className="size-4 text-muted-foreground" />
                        <span>{purchase.vendorName || 'Sin vendedor'}</span>
                      </div>
                      {purchase.vendorPhone && <div className="text-xs text-muted-foreground">{purchase.vendorPhone}</div>}
                    </TableCell>
                    <TableCell>{purchase.items?.length || 0} items · {currency(purchaseItemCount(purchase))} unidades</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                        <Image className="mr-1 size-3" />
                        {purchase.receiptPhotos?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">${currency(purchase.totalAmount)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setPurchaseToDelete(purchase)} title="Eliminar compra">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {mutationError && <p className="mt-4 text-sm text-destructive">{mutationError.message}</p>}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={Boolean(purchaseToDelete)}
        title="Eliminar compra"
        description={purchaseToDelete ? `Se eliminara la compra de ${purchaseToDelete.store} por $${currency(purchaseToDelete.totalAmount)}.` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPurchaseToDelete(null)}
      />
    </div>
  );
}
