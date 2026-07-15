import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Image,
  Package,
  Plus,
  Save,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from 'lucide-react';

import { AlertDialog } from '@/components/feedback/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { currency } from '@/lib/finance';
import { cn } from '@/lib/utils';
import { getEvents } from '@/services/eventsApi';
import { createMarketPurchase } from '@/services/marketPurchasesApi';
import { getProviders } from '@/services/providersApi';

const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro'];
const COMMON_UNITS = ['unidad', 'kg', 'g', 'lb', 'litro', 'paquete', 'bandeja', 'caja'];

function toDatetimeInputValue(date = new Date()) {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 16);
}

function createBlankItem() {
  return {
    localId: crypto.randomUUID(),
    name: '',
    quantity: '1',
    unit: 'unidad',
    unitPrice: '',
  };
}

function createBlankPurchase() {
  return {
    localId: crypto.randomUUID(),
    store: '',
    providerId: '',
    paymentMethod: 'Efectivo',
    notes: '',
    receiptPhotos: [],
    items: [],
  };
}

function itemSubtotal(item) {
  return Number(item.quantity || 0) * Number(item.unitPrice || 0);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function StepBadge({ n }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
      {n}
    </span>
  );
}

function PurchaseBlock({
  purchase,
  providers,
  index,
  total,
  onChange,
  onRemove,
  showAdvanced,
  collapsed,
  onToggleCollapse,
}) {
  const [productDraft, setProductDraft] = useState(createBlankItem);
  const [blockError, setBlockError] = useState(null);

  const totalAmount = useMemo(
    () => purchase.items.reduce((sum, item) => sum + itemSubtotal(item), 0),
    [purchase.items],
  );

  const selectedProvider = useMemo(
    () => providers.find(p => p.id === purchase.providerId),
    [providers, purchase.providerId],
  );

  const updateField = (field, value) => {
    onChange({ ...purchase, [field]: value });
  };

  const handleProviderChange = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    onChange({
      ...purchase,
      providerId,
      store: provider ? provider.name : purchase.store,
    });
  };

  const addItem = () => {
    if (!productDraft.name.trim() || Number(productDraft.quantity) <= 0) {
      setBlockError('Ingresá el producto y una cantidad mayor a cero.');
      return;
    }
    setBlockError(null);
    onChange({
      ...purchase,
      items: [...purchase.items, { ...productDraft, localId: crypto.randomUUID() }],
    });
    setProductDraft(createBlankItem());
  };

  const handleDraftKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const removeItem = (localId) => {
    onChange({ ...purchase, items: purchase.items.filter(item => item.localId !== localId) });
  };

  const summaryLabel = purchase.store?.trim() || `Compra ${index + 1}`;
  const itemCount = purchase.items.length;

  return (
    <Card className={cn(collapsed && 'border-border/80 bg-card/80')}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border pb-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="min-w-0 flex-1 text-left"
        >
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <ShoppingBag className="size-4.5 shrink-0 text-primary" />
            <span className="truncate">
              {total > 1 ? `Compra ${index + 1} de ${total}` : 'Detalle de la compra'}
            </span>
            {collapsed && (
              <Badge variant="outline" className="font-normal">
                {summaryLabel}
              </Badge>
            )}
          </CardTitle>
          {collapsed ? (
            <CardDescription className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{itemCount} producto{itemCount !== 1 ? 's' : ''}</span>
              <span className="font-semibold text-foreground">${currency(totalAmount)}</span>
              <span className="text-primary">· Tocá para expandir</span>
            </CardDescription>
          ) : (
            <CardDescription className="mt-1">
              ¿Dónde compraste y qué productos llevaste?
            </CardDescription>
          )}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expandir' : 'Minimizar'}
          >
            {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </Button>
          {total > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
              title="Quitar esta compra"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-5 pt-5">
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Store className="size-3.5" /> Dónde y cómo pagaste
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Tienda / establecimiento" required hint="Ej. Carnicería del barrio">
                <Input
                  value={purchase.store}
                  onChange={e => updateField('store', e.target.value)}
                  placeholder="Nombre del local"
                  disabled={!!selectedProvider && !showAdvanced}
                />
              </FormField>
              <FormField label="Método de pago">
                <Select
                  value={purchase.paymentMethod}
                  onChange={e => updateField('paymentMethod', e.target.value)}
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </Select>
              </FormField>
            </div>
            {showAdvanced && (
              <FormField label="Proveedor de la agenda" hint="Opcional">
                <Select value={purchase.providerId} onChange={e => handleProviderChange(e.target.value)}>
                  <option value="">Sin proveedor registrado</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </Select>
              </FormField>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Package className="size-3.5" /> Productos
            </p>
            <p className="text-xs text-muted-foreground">
              Completá una fila y tocá <strong className="text-foreground">Agregar</strong> (o Enter).
            </p>

            <div className="rounded-xl border border-border bg-secondary/30 p-3 sm:p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
                <FormField label="Producto" className="sm:col-span-4">
                  <Input
                    value={productDraft.name}
                    onChange={e => setProductDraft({ ...productDraft, name: e.target.value })}
                    onKeyDown={handleDraftKeyDown}
                    placeholder="Ej. Asado de tira"
                  />
                </FormField>
                <FormField label="Cant." className="sm:col-span-2">
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={productDraft.quantity}
                    onChange={e => setProductDraft({ ...productDraft, quantity: e.target.value })}
                    onKeyDown={handleDraftKeyDown}
                  />
                </FormField>
                <FormField label="Unidad" className="sm:col-span-2">
                  <Select
                    value={productDraft.unit}
                    onChange={e => setProductDraft({ ...productDraft, unit: e.target.value })}
                  >
                    {COMMON_UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Precio unit. $" className="sm:col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={productDraft.unitPrice}
                    onChange={e => setProductDraft({ ...productDraft, unitPrice: e.target.value })}
                    onKeyDown={handleDraftKeyDown}
                    placeholder="0"
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <Button type="button" onClick={addItem} className="w-full">
                    <Plus className="size-4" /> Agregar
                  </Button>
                </div>
              </div>
              {blockError && <p className="mt-2 text-sm text-destructive">{blockError}</p>}
            </div>

            {purchase.items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                Todavía no hay productos en esta compra.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="hidden grid-cols-12 gap-2 border-b border-border bg-secondary/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                  <div className="col-span-5">Producto</div>
                  <div className="col-span-2 text-right">Cant.</div>
                  <div className="col-span-2 text-right">P. unit.</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                  <div className="col-span-1" />
                </div>
                <ul className="divide-y divide-border">
                  {purchase.items.map((item, i) => (
                    <li
                      key={item.localId}
                      className={cn(
                        'grid grid-cols-1 gap-1 px-3 py-3 sm:grid-cols-12 sm:items-center sm:gap-2',
                        i % 2 === 1 && 'bg-secondary/20',
                      )}
                    >
                      <div className="sm:col-span-5 min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground sm:hidden">
                          {item.quantity} {item.unit} × ${currency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="hidden text-right text-sm text-muted-foreground sm:col-span-2 sm:block">
                        {item.quantity} <span className="text-xs">{item.unit}</span>
                      </div>
                      <div className="hidden text-right text-sm text-muted-foreground sm:col-span-2 sm:block">
                        ${currency(item.unitPrice)}
                      </div>
                      <div className="flex items-center justify-between sm:col-span-2 sm:justify-end">
                        <span className="text-xs text-muted-foreground sm:hidden">Subtotal</span>
                        <span className="text-sm font-bold text-foreground">${currency(itemSubtotal(item))}</span>
                      </div>
                      <div className="flex justify-end sm:col-span-1">
                        <button
                          type="button"
                          onClick={() => removeItem(item.localId)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                          title="Quitar producto"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-3 py-2.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {itemCount} ítem{itemCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-sm font-bold text-primary">${currency(totalAmount)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-border pt-3">
            <span className="text-sm font-medium text-muted-foreground">Subtotal de esta compra</span>
            <span className="text-lg font-bold text-foreground">${currency(totalAmount)}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function NewMarketPurchase() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [saveError, setSaveError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [events, setEvents] = useState([]);
  const [providers, setProviders] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [session, setSession] = useState({
    purchasedAt: toDatetimeInputValue(),
    eventId: '',
    purchases: [createBlankPurchase()],
  });
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionPhotos, setSessionPhotos] = useState([]);
  /** localId → collapsed */
  const [collapsedMap, setCollapsedMap] = useState({});

  useEffect(() => {
    getEvents().then(data => setEvents(Array.isArray(data) ? data : [])).catch(() => setEvents([]));
    getProviders().then(data => setProviders(Array.isArray(data) ? data : [])).catch(() => setProviders([]));
  }, []);

  useEffect(() => {
    const draft = routerLocation.state?.purchaseDraft;
    if (!draft) return;
    setSession(prev => {
      const next = { ...prev };
      if (draft.eventId) next.eventId = draft.eventId;
      if (draft.items?.length) {
        next.purchases = [{
          ...createBlankPurchase(),
          items: draft.items.map(item => ({
            localId: crypto.randomUUID(),
            name: item.name || '',
            quantity: String(item.quantity ?? '1'),
            unit: item.unit || 'unidad',
            unitPrice: item.unitPrice != null ? String(item.unitPrice) : '',
          })),
          notes: draft.notes || '',
        }];
      }
      return next;
    });
    if (draft.notes) setSessionNotes(draft.notes);
  }, [routerLocation.state]);

  const grandTotal = useMemo(
    () => session.purchases.reduce((sum, p) => sum + p.items.reduce((s, i) => s + itemSubtotal(i), 0), 0),
    [session.purchases],
  );

  const productCount = useMemo(
    () => session.purchases.reduce((sum, p) => sum + p.items.length, 0),
    [session.purchases],
  );

  const updatePurchase = (index, updated) => {
    setSession(prev => ({
      ...prev,
      purchases: prev.purchases.map((p, i) => (i === index ? updated : p)),
    }));
  };

  const addPurchaseBlock = () => {
    setShowAdvanced(true);
    // Minimizar todas las compras existentes y dejar abierta la nueva
    setSession(prev => {
      const nextBlank = createBlankPurchase();
      const nextMap = {};
      for (const p of prev.purchases) {
        nextMap[p.localId] = true;
      }
      nextMap[nextBlank.localId] = false;
      setCollapsedMap(nextMap);
      return {
        ...prev,
        purchases: [...prev.purchases, nextBlank],
      };
    });
  };

  const removePurchaseBlock = (index) => {
    setSession(prev => {
      const removed = prev.purchases[index];
      setCollapsedMap(m => {
        const next = { ...m };
        if (removed) delete next[removed.localId];
        return next;
      });
      return {
        ...prev,
        purchases: prev.purchases.filter((_, i) => i !== index),
      };
    });
  };

  const toggleCollapse = (localId) => {
    setCollapsedMap(prev => ({ ...prev, [localId]: !prev[localId] }));
  };

  const triggerAlert = (title, description) => {
    setAlertTitle(title);
    setAlertDescription(description);
    setAlertOpen(true);
  };

  const handleSessionPhotosUpload = async (event) => {
    const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('image/'));
    if (!files.length) return;
    try {
      const remainingSlots = Math.max(0, 6 - sessionPhotos.length);
      const selectedFiles = files.slice(0, remainingSlots);
      const photos = await Promise.all(selectedFiles.map(readFileAsDataUrl));
      setSessionPhotos(prev => [...prev, ...photos]);
    } catch {
      triggerAlert('Error', 'No se pudieron leer una o más imágenes.');
    } finally {
      event.target.value = '';
    }
  };

  const removeSessionPhoto = (index) => {
    setSessionPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (session.purchases.length === 0) {
      triggerAlert('Sin compras', 'Agregá al menos una compra para guardar.');
      return;
    }
    for (let i = 0; i < session.purchases.length; i++) {
      const p = session.purchases[i];
      if (!p.store.trim()) {
        setCollapsedMap(m => ({ ...m, [p.localId]: false }));
        triggerAlert('Falta la tienda', `Ingresá el establecimiento de la compra${session.purchases.length > 1 ? ` #${i + 1}` : ''}.`);
        return;
      }
      const validItems = p.items.filter(item => item.name.trim() && Number(item.quantity) > 0);
      if (validItems.length === 0) {
        setCollapsedMap(m => ({ ...m, [p.localId]: false }));
        triggerAlert('Faltan productos', `Agregá al menos un producto${session.purchases.length > 1 ? ` a la compra #${i + 1}` : ''}.`);
        return;
      }
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      for (let i = 0; i < session.purchases.length; i++) {
        const p = session.purchases[i];
        const validItems = p.items.filter(item => item.name.trim() && Number(item.quantity) > 0);
        const allPhotos = [...p.receiptPhotos, ...sessionPhotos];
        const payload = {
          purchasedAt: new Date(session.purchasedAt).toISOString(),
          store: p.store,
          eventId: session.eventId || null,
          providerId: p.providerId || null,
          paymentMethod: p.paymentMethod,
          notes: sessionNotes || p.notes,
          receiptPhotos: allPhotos,
          items: validItems.map(({ name, quantity, unit, unitPrice }) => ({
            name,
            quantity: Number(quantity),
            unit,
            unitPrice: Number(unitPrice || 0),
          })),
        };
        await createMarketPurchase(payload);
      }
      navigate('/weekly-expenses');
    } catch (err) {
      setSaveError(err);
      triggerAlert('Error de guardado', 'No se pudieron guardar las compras. Revisá los datos e intentá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Nueva compra</Badge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Registrar compra de mercado</h1>
          <p className="max-w-xl text-muted-foreground">
            Podés cargar varias tiendas: al agregar otra, la anterior se minimiza sola.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/weekly-expenses')} className="w-full sm:w-auto">
          <ArrowLeft className="size-4" /> Volver
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-medium text-primary">
          <StepBadge n={1} /> Evento y fecha
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
          <StepBadge n={2} /> Tienda y productos
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
          <StepBadge n={3} /> Guardar
        </span>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <StepBadge n={1} />
                ¿Para qué evento es?
              </CardTitle>
              <CardDescription>
                Si es gasto general del negocio, dejá “Sin evento”.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Evento asociado" hint="Recomendado para el margen real del asado">
                <Select
                  value={session.eventId}
                  onChange={e => setSession({ ...session, eventId: e.target.value })}
                >
                  <option value="">Sin evento (gasto general)</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title}{event.date ? ` · ${event.date}` : ''}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Fecha y hora de la compra" required>
                <Input
                  type="datetime-local"
                  value={session.purchasedAt}
                  onChange={e => setSession({ ...session, purchasedAt: e.target.value })}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Extras (opcional)</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => setShowAdvanced(v => !v)}
                >
                  {showAdvanced ? 'Ocultar avanzado' : 'Más opciones'}
                </Button>
              </div>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-4">
                <FormField label="Notas">
                  <textarea
                    value={sessionNotes}
                    onChange={e => setSessionNotes(e.target.value)}
                    placeholder="Ej. Compra para el asado del sábado"
                    className="border-border bg-secondary placeholder:text-muted-foreground/50 flex min-h-20 w-full resize-y rounded-lg border px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                </FormField>
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Fotos del ticket
                  </p>
                  <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 p-4 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
                    <Image className="mb-1.5 size-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Subir fotos</span>
                    <span className="text-xs text-muted-foreground">Hasta 6 imágenes</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleSessionPhotosUpload} />
                  </label>
                  {sessionPhotos.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {sessionPhotos.map((photo, photoIndex) => (
                        <div key={photo.slice(0, 40)} className="relative overflow-hidden rounded-lg border border-border">
                          <img src={photo} alt={`Ticket ${photoIndex + 1}`} className="h-20 w-full object-cover" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-1 top-1 size-6"
                            onClick={() => removeSessionPhoto(photoIndex)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          <Card className="border-primary/25 hidden lg:block">
            <CardContent className="space-y-4 pt-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total a registrar</p>
                <p className="text-2xl font-bold text-primary">${currency(grandTotal)}</p>
                <p className="text-xs text-muted-foreground">
                  {productCount} producto{productCount !== 1 ? 's' : ''} · {session.purchases.length} compra{session.purchases.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button className="w-full" size="lg" onClick={handleSave} disabled={isSaving}>
                <Save className="size-4" />
                {isSaving ? 'Guardando…' : 'Guardar compra'}
              </Button>
              {saveError && <p className="text-center text-sm text-destructive">{saveError.message}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <StepBadge n={2} />
            Cargá lo que compraste
          </div>

          {session.purchases.map((purchase, index) => (
            <PurchaseBlock
              key={purchase.localId}
              purchase={purchase}
              providers={providers}
              index={index}
              total={session.purchases.length}
              onChange={(updated) => updatePurchase(index, updated)}
              onRemove={() => removePurchaseBlock(index)}
              showAdvanced={showAdvanced || session.purchases.length > 1}
              collapsed={Boolean(collapsedMap[purchase.localId])}
              onToggleCollapse={() => toggleCollapse(purchase.localId)}
            />
          ))}

          <Button variant="outline" onClick={addPurchaseBlock} className="w-full">
            <Plus className="size-4" /> Agregar otra tienda / compra
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Al agregar otra, las anteriores se minimizan. Expandilas con la flecha del encabezado.
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase text-muted-foreground">Total</p>
            <p className="truncate text-lg font-bold text-primary">${currency(grandTotal)}</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="shrink-0">
            <Save className="size-4" />
            {isSaving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>

      <AlertDialog
        isOpen={alertOpen}
        title={alertTitle}
        description={alertDescription}
        buttonText="Entendido"
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}
