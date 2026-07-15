import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  ExternalLink,
  Image as ImageIcon,
  Package,
  Phone,
  ReceiptText,
  StickyNote,
  Store,
  Trash2,
  UserRound,
  X,
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
import { currency } from '@/lib/finance';
import { cn } from '@/lib/utils';
import { deleteMarketPurchase, getMarketPurchase } from '@/services/marketPurchasesApi';

function itemUnits(items = []) {
  return items.reduce((total, item) => total + Number(item.quantity || 0), 0);
}

export default function MarketPurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const loadPurchase = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getMarketPurchase(id)
      .then(setPurchase)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    loadPurchase();
  }, [loadPurchase]);

  const items = purchase?.items || [];
  const photos = Array.isArray(purchase?.receiptPhotos) ? purchase.receiptPhotos : [];
  const totalUnits = useMemo(() => itemUnits(purchase?.items || []), [purchase]);
  const itemsSubtotal = useMemo(
    () => (purchase?.items || []).reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    [purchase],
  );

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setMutationError(null);
      await deleteMarketPurchase(id);
      navigate('/weekly-expenses');
    } catch (err) {
      setMutationError(err);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingState
        title="Cargando compra"
        description="Obteniendo productos, tienda y facturas."
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/weekly-expenses">
            <ArrowLeft className="size-4" /> Volver al historial
          </Link>
        </Button>
        <ErrorState description={error.message} onRetry={loadPurchase} />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/weekly-expenses">
            <ArrowLeft className="size-4" /> Volver al historial
          </Link>
        </Button>
        <EmptyState
          title="Compra no encontrada"
          description="Puede haber sido eliminada o no tenés acceso."
        />
      </div>
    );
  }

  const purchasedDate = new Date(purchase.purchasedAt);

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" asChild>
          <Link to="/weekly-expenses">
            <ArrowLeft className="size-4" /> Volver
          </Link>
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="size-3.5" /> Eliminar
        </Button>
      </div>

      {/* Header */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              Detalle de compra
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {purchase.store}
            </h1>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {format(purchasedDate, "EEEE d 'de' MMMM yyyy", { locale: es })}
              </span>
              <span className="text-border">·</span>
              <span>{format(purchasedDate, 'HH:mm')} hs</span>
              {purchase.paymentMethod && (
                <>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CreditCard className="size-3.5" />
                    {purchase.paymentMethod}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              Total de la compra
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              ${currency(purchase.totalAmount)}
            </p>
          </div>
        </div>

        {mutationError && (
          <p className="text-sm text-destructive">{mutationError.message}</p>
        )}

        {/* KPI strip */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 pt-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Package className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Productos
                </p>
                <p className="text-lg font-bold text-foreground">
                  {items.length}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    · {currency(totalUnits)} uds
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <ReceiptText className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Subtotal ítems
                </p>
                <p className="text-lg font-bold text-foreground">
                  ${currency(itemsSubtotal || purchase.totalAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <ImageIcon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Facturas / fotos
                </p>
                <p className="text-lg font-bold text-foreground">
                  {photos.length}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    {photos.length === 1 ? 'archivo' : 'archivos'}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column: products */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-4 text-primary" />
                Productos comprados
              </CardTitle>
              <CardDescription>
                Detalle de cada ítem con cantidad, unidad y precio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  Esta compra no tiene productos cargados.
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-hidden rounded-xl border border-border sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                          <TableHead className="w-10 text-center">#</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">P. unitario</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow
                            key={item.id || `${item.name}-${index}`}
                            className={index % 2 === 1 ? 'bg-secondary/15' : undefined}
                          >
                            <TableCell className="text-center text-xs text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.unit}</p>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {Number(item.quantity)}{' '}
                              <span className="text-xs text-muted-foreground">{item.unit}</span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                              ${currency(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right font-semibold tabular-nums">
                              ${currency(item.subtotal)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-4 py-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Total ({items.length} productos)
                      </span>
                      <span className="text-base font-bold text-foreground">
                        ${currency(purchase.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Mobile list */}
                  <div className="space-y-2 sm:hidden">
                    {items.map((item, index) => (
                      <div
                        key={item.id || `${item.name}-${index}`}
                        className="rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">#{index + 1}</p>
                            <p className="truncate font-semibold text-foreground">{item.name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {Number(item.quantity)} {item.unit} × ${currency(item.unitPrice)}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-bold tabular-nums">
                            ${currency(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                      <span className="text-sm font-medium text-primary">Total</span>
                      <span className="text-base font-bold text-foreground">
                        ${currency(purchase.totalAmount)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Receipt photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="size-4 text-primary" />
                Facturas y comprobantes
              </CardTitle>
              <CardDescription>
                Tocá una foto para verla en grande.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {photos.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  No se adjuntaron fotos de factura en esta compra.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {photos.map((src, index) => (
                    <button
                      key={`${index}-${String(src).slice(0, 24)}`}
                      type="button"
                      onClick={() => setLightboxPhoto(src)}
                      className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <img
                        src={src}
                        alt={`Comprobante ${index + 1}`}
                        className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2 text-left text-[10px] font-medium text-white">
                        Foto {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side column: meta */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Store className="size-4 text-primary" />
                Tienda y pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Tienda" value={purchase.store} />
              <InfoRow label="Método de pago" value={purchase.paymentMethod || '—'} />
              <InfoRow
                label="Fecha y hora"
                value={format(purchasedDate, "dd/MM/yyyy · HH:mm", { locale: es })}
              />
              {purchase.provider && (
                <InfoRow
                  label="Proveedor"
                  value={
                    <span className="flex flex-col items-end gap-0.5">
                      <span>{purchase.provider.name}</span>
                      {purchase.provider.category && (
                        <span className="text-xs font-normal text-muted-foreground">
                          {purchase.provider.category}
                        </span>
                      )}
                    </span>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="size-4 text-primary" />
                Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                label="Nombre"
                value={purchase.vendorName || 'Sin vendedor registrado'}
              />
              {purchase.vendorPhone && (
                <InfoRow
                  label="Teléfono"
                  value={
                    <a
                      href={`tel:${purchase.vendorPhone}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Phone className="size-3.5" />
                      {purchase.vendorPhone}
                    </a>
                  }
                />
              )}
              {!purchase.vendorName && !purchase.vendorPhone && (
                <p className="text-sm text-muted-foreground">
                  No se cargaron datos del vendedor.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-4 text-primary" />
                Evento asociado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {purchase.event ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">{purchase.event.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {purchase.event.client || 'Sin cliente'}
                      {purchase.event.date &&
                        ` · ${format(new Date(purchase.event.date), 'dd MMM yyyy', { locale: es })}`}
                    </p>
                    {purchase.event.status && (
                      <Badge variant="outline" className="mt-2">
                        {purchase.event.status}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={`/history/${purchase.event.id}`}>
                      Ver evento <ExternalLink className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Compra general (sin evento vinculado).
                </p>
              )}
            </CardContent>
          </Card>

          {purchase.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <StickyNote className="size-4 text-primary" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {purchase.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Eliminar compra"
        description={`Se eliminará la compra de ${purchase.store} por $${currency(purchase.totalAmount)}. Esta acción no se puede deshacer.`}
        confirmText={deleting ? 'Eliminando…' : 'Eliminar'}
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => !deleting && setConfirmDelete(false)}
      />

      {/* Photo lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Vista de comprobante"
          onClick={() => setLightboxPhoto(null)}
          onKeyDown={(e) => e.key === 'Escape' && setLightboxPhoto(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={() => setLightboxPhoto(null)}
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
          <img
            src={lightboxPhoto}
            alt="Comprobante ampliado"
            className={cn(
              'max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl',
            )}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="max-w-[65%] text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
