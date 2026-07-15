import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
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
  Eye,
  Image,
  Package,
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
import { useMarketPurchases } from '@/hooks/useMarketPurchases';
import { currency } from '@/lib/finance';
import { cn } from '@/lib/utils';

function getWeekBounds(date) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = addDays(endOfWeek(date, { weekStartsOn: 1 }), 1);
  return { start, end };
}

function purchaseItemCount(purchase) {
  return purchase.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0;
}

function itemPreview(purchase, max = 3) {
  const names = (purchase.items || [])
    .map(i => i.name?.trim())
    .filter(Boolean);
  if (names.length === 0) return 'Sin productos cargados';
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return rest > 0 ? `${shown.join(' · ')} · +${rest} más` : shown.join(' · ');
}

/** Group purchases by calendar day (newest day first). Within a day, newest first. */
function groupPurchasesByDay(purchases) {
  const groups = [];
  for (const purchase of purchases) {
    const day = new Date(purchase.purchasedAt);
    const existing = groups.find(g => isSameDay(g.date, day));
    if (existing) {
      existing.purchases.push(purchase);
    } else {
      groups.push({ date: day, purchases: [purchase] });
    }
  }
  return groups;
}

export default function WeeklyExpenses() {
  const navigate = useNavigate();
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

  const dayGroups = useMemo(() => groupPurchasesByDay(purchases), [purchases]);

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
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Compras semanales
          </Badge>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Gastos Mercado</h1>
            <p className="mt-2 text-muted-foreground">
              Control semanal de compras. Cada tienda es una compra aparte: tocá para ver el detalle.
            </p>
          </div>
        </div>

        {/* Semana + Agregar compra (misma fila, a la altura de los controles) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setWeekAnchor(prev => subWeeks(prev, 1))} title="Semana anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex h-9 min-w-48 flex-1 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium sm:min-w-60 sm:flex-none">
              <CalendarDays className="mr-2 size-4 shrink-0 text-primary" />
              {weekLabel}
            </div>
            <Button variant="outline" size="icon" onClick={() => setWeekAnchor(prev => addWeeks(prev, 1))} title="Semana siguiente">
              <ChevronRight className="size-4" />
            </Button>
            <Button variant={isCurrentWeek ? 'secondary' : 'outline'} onClick={() => setWeekAnchor(new Date())}>
              Semana actual
            </Button>
          </div>
          <Button asChild className="w-full shrink-0 sm:w-auto">
            <Link to="/weekly-expenses/new">
              <Plus className="size-4" />
              Agregar compra
            </Link>
          </Button>
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
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>Historial de compras</CardTitle>
              <CardDescription className="mt-1">
                Agrupadas por día. Si cargaste varias tiendas el mismo día, cada una es una tarjeta aparte.
              </CardDescription>
            </div>
            {purchases.length > 0 && (
              <Badge variant="secondary" className="tabular-nums">
                {purchases.length} {purchases.length === 1 ? 'compra' : 'compras'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState title="Cargando compras" description="Estamos consultando los gastos de la semana." />
          ) : error ? (
            <ErrorState description={error.message} onRetry={refresh} />
          ) : purchases.length === 0 ? (
            <EmptyState
              title="No hay compras en esta semana"
              description="Usa Agregar compra para registrar una o varias tiendas. Cada tienda se guarda como compra separada."
            />
          ) : (
            <div className="space-y-8">
              {dayGroups.map(group => {
                const dayTotal = group.purchases.reduce(
                  (sum, p) => sum + Number(p.totalAmount || 0),
                  0,
                );
                const multi = group.purchases.length > 1;

                return (
                  <section key={group.date.toISOString()} className="space-y-3">
                    {/* Day header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold capitalize text-foreground">
                          {format(group.date, "EEEE d 'de' MMMM", { locale: es })}
                        </h3>
                        <Badge variant="outline" className="tabular-nums text-[11px]">
                          {group.purchases.length}{' '}
                          {group.purchases.length === 1 ? 'compra' : 'compras'}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        ${currency(dayTotal)}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">del día</span>
                      </p>
                    </div>

                    {/* Purchase cards */}
                    <ul className="space-y-3">
                      {group.purchases.map((purchase, indexInDay) => {
                        const itemCount = purchase.items?.length || 0;
                        const units = purchaseItemCount(purchase);
                        const photos = purchase.receiptPhotos?.length || 0;
                        const eventTitle = purchase.event?.title;

                        return (
                          <li key={purchase.id}>
                            <div
                              role="link"
                              tabIndex={0}
                              onClick={() => navigate(`/weekly-expenses/${purchase.id}`)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  navigate(`/weekly-expenses/${purchase.id}`);
                                }
                              }}
                              className={cn(
                                'group w-full cursor-pointer rounded-xl border border-border bg-card text-left transition-colors',
                                'hover:border-primary/40 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              )}
                            >
                              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-stretch sm:gap-4">
                                <div className="flex min-w-0 flex-1 gap-3">
                                  {multi && (
                                    <div
                                      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary"
                                      title={`Compra ${indexInDay + 1} del día`}
                                    >
                                      {indexInDay + 1}
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Store className="size-4 shrink-0 text-primary" />
                                      <h4 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
                                        {purchase.store}
                                      </h4>
                                      <Badge variant="secondary" className="text-[10px] font-normal">
                                        {purchase.paymentMethod}
                                      </Badge>
                                    </div>

                                    <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                      <span className="tabular-nums">
                                        {format(new Date(purchase.purchasedAt), 'HH:mm')} hs
                                      </span>
                                      {purchase.vendorName && (
                                        <>
                                          <span className="text-border">·</span>
                                          <span className="inline-flex items-center gap-1">
                                            <UserRound className="size-3" />
                                            {purchase.vendorName}
                                          </span>
                                        </>
                                      )}
                                      {eventTitle && (
                                        <>
                                          <span className="text-border">·</span>
                                          <span className="max-w-[14rem] truncate" title={eventTitle}>
                                            Evento: {eventTitle}
                                          </span>
                                        </>
                                      )}
                                    </p>

                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                      <Package className="mr-1 inline size-3.5 -translate-y-px text-muted-foreground/80" />
                                      {itemPreview(purchase)}
                                    </p>

                                    <div className="flex flex-wrap gap-2 pt-0.5">
                                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                        <Package className="size-3" />
                                        {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                                        {units > 0 && ` · ${currency(units)} uds`}
                                      </span>
                                      {photos > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                                          <Image className="size-3" />
                                          {photos} {photos === 1 ? 'factura' : 'facturas'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border pt-3 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                                  <div className="text-right">
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                      Total
                                    </p>
                                    <p className="text-xl font-bold tabular-nums text-foreground">
                                      ${currency(purchase.totalAmount)}
                                    </p>
                                  </div>
                                  <div
                                    className="flex gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      asChild
                                      title="Ver compra"
                                      className="size-8"
                                    >
                                      <Link
                                        to={`/weekly-expenses/${purchase.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Eye className="size-4 text-primary" />
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      title="Eliminar compra"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPurchaseToDelete(purchase);
                                      }}
                                    >
                                      <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
          {mutationError && <p className="mt-4 text-sm text-destructive">{mutationError.message}</p>}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={Boolean(purchaseToDelete)}
        title="Eliminar compra"
        description={
          purchaseToDelete
            ? `Se eliminará la compra de ${purchaseToDelete.store} por $${currency(purchaseToDelete.totalAmount)}.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPurchaseToDelete(null)}
      />
    </div>
  );
}
