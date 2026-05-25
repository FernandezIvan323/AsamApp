import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Camera,
  Image,
  Plus,
  ReceiptText,
  Save,
  Store,
  Trash2,
  UserRound,
} from 'lucide-react';

import { AlertDialog } from '@/components/feedback/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { currency } from '@/lib/finance';
import { getEvents } from '@/services/eventsApi';
import { createMarketPurchase } from '@/services/marketPurchasesApi';
import { getProviders } from '@/services/providersApi';
import './NewEvent.css';

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
  const [form, setForm] = useState({
    purchasedAt: toDatetimeInputValue(),
    store: '',
    vendorName: '',
    vendorPhone: '',
    eventId: '',
    providerId: '',
    paymentMethod: 'Efectivo',
    notes: '',
    receiptPhotos: [],
    items: [],
  });

  useEffect(() => {
    getEvents().then(data => setEvents(Array.isArray(data) ? data : [])).catch(() => setEvents([]));
    getProviders().then(data => setProviders(Array.isArray(data) ? data : [])).catch(() => setProviders([]));
  }, []);

  useEffect(() => {
    const draft = routerLocation.state?.purchaseDraft;
    if (!draft) return;
    setForm(prev => ({
      ...prev,
      eventId: draft.eventId || prev.eventId,
      notes: draft.notes || prev.notes,
      items: (draft.items || []).map(item => ({
        localId: crypto.randomUUID(),
        name: item.name || '',
        quantity: String(item.quantity ?? '1'),
        unit: item.unit || 'unidad',
        unitPrice: item.unitPrice != null ? String(item.unitPrice) : '',
      })),
    }));
  }, [routerLocation.state]);
  const [productDraft, setProductDraft] = useState(createBlankItem);

  const totalAmount = useMemo(
    () => form.items.reduce((total, item) => total + itemSubtotal(item), 0),
    [form.items],
  );

  const triggerAlert = (title, description) => {
    setAlertTitle(title);
    setAlertDescription(description);
    setAlertOpen(true);
  };

  const updateProductDraft = (field, value) => {
    setProductDraft(current => ({ ...current, [field]: value }));
  };

  const addItem = () => {
    if (!productDraft.name.trim() || Number(productDraft.quantity) <= 0) {
      triggerAlert('Producto incompleto', 'Ingresa el nombre del producto y una cantidad mayor a cero.');
      return;
    }

    setForm(current => ({
      ...current,
      items: [...current.items, { ...productDraft, localId: crypto.randomUUID() }],
    }));
    setProductDraft(createBlankItem());
  };

  const removeItem = (localId) => {
    setForm(current => ({
      ...current,
      items: current.items.filter(item => item.localId !== localId),
    }));
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('image/'));
    if (!files.length) return;

    try {
      const remainingSlots = Math.max(0, 6 - form.receiptPhotos.length);
      const selectedFiles = files.slice(0, remainingSlots);
      const photos = await Promise.all(selectedFiles.map(readFileAsDataUrl));
      setForm(current => ({ ...current, receiptPhotos: [...current.receiptPhotos, ...photos] }));
    } catch {
      triggerAlert('Error al cargar fotos', 'No se pudieron leer una o mas imagenes de la factura.');
    } finally {
      event.target.value = '';
    }
  };

  const removePhoto = (index) => {
    setForm(current => ({
      ...current,
      receiptPhotos: current.receiptPhotos.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.store.trim()) {
      triggerAlert('Informacion requerida', 'Ingresa el establecimiento o tienda de la compra.');
      return;
    }

    const validItems = form.items.filter(item => item.name.trim() && Number(item.quantity) > 0);
    if (!validItems.length) {
      triggerAlert('Productos requeridos', 'Agrega al menos un producto con nombre y cantidad.');
      return;
    }

    const payload = {
      purchasedAt: new Date(form.purchasedAt).toISOString(),
      store: form.store,
      vendorName: form.vendorName,
      vendorPhone: form.vendorPhone,
      eventId: form.eventId || null,
      providerId: form.providerId || null,
      paymentMethod: form.paymentMethod,
      notes: form.notes,
      receiptPhotos: form.receiptPhotos,
      items: validItems.map(({ name, quantity, unit, unitPrice }) => ({
        name,
        quantity: Number(quantity),
        unit,
        unitPrice: Number(unitPrice || 0),
      })),
    };

    try {
      setIsSaving(true);
      setSaveError(null);
      await createMarketPurchase(payload);
      navigate('/weekly-expenses');
    } catch (err) {
      setSaveError(err);
      triggerAlert('Error de guardado', 'Hubo un error al guardar la compra. Revisa los datos e intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="new-event-page">
      <div className="ne-header">
        <Button variant="ghost" onClick={() => navigate('/weekly-expenses')} className="mb-4">
          <ArrowLeft className="size-4" />
          Volver a gastos
        </Button>
        <div>
          <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/10 text-primary">
            Nueva compra
          </Badge>
          <h1>Registrar Compra de Mercado</h1>
          <p>Guarda productos, vendedor, contacto, metodo de pago y fotos de facturas.</p>
        </div>
      </div>

      <div className="ne-grid">
        <div className="ne-form-container">
          <div className="card ne-section">
            <h2 className="section-title"><Calendar size={20} /> Informacion general</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha y hora *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={form.purchasedAt}
                  onChange={event => setForm({ ...form, purchasedAt: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Metodo de pago</label>
                <select
                  className="form-input"
                  value={form.paymentMethod}
                  onChange={event => setForm({ ...form, paymentMethod: event.target.value })}
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Establecimiento / Tienda *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Supermercado, Carniceria, Tienda local"
                value={form.store}
                onChange={event => setForm({ ...form, store: event.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Asociar a evento</label>
                <select className="form-input" value={form.eventId} onChange={event => setForm({ ...form, eventId: event.target.value })}>
                  <option value="">Gasto general</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Proveedor registrado</label>
                <select className="form-input" value={form.providerId} onChange={event => setForm({ ...form, providerId: event.target.value })}>
                  <option value="">Sin proveedor</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card ne-section">
            <h2 className="section-title"><UserRound size={20} /> Datos del vendedor</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre del vendedor</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre de quien vendio"
                  value={form.vendorName}
                  onChange={event => setForm({ ...form, vendorName: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Numero de celular</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Ej. 300 123 4567"
                  value={form.vendorPhone}
                  onChange={event => setForm({ ...form, vendorPhone: event.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="card ne-section">
            <div className="section-header-flex">
              <h2 className="section-title" style={{ borderBottom: 'none', padding: 0, margin: 0 }}>
                <ReceiptText size={20} /> Productos / Items
              </h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-background/50 p-4 md:grid-cols-12 md:items-end">
                <div className="form-group mb-0 md:col-span-5">
                  <label className="form-label">Producto</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Carne, arroz, verduras"
                    value={productDraft.name}
                    onChange={event => updateProductDraft('name', event.target.value)}
                  />
                </div>
                <div className="form-group mb-0 md:col-span-2">
                  <label className="form-label">Cantidad</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="form-input"
                    value={productDraft.quantity}
                    onChange={event => updateProductDraft('quantity', event.target.value)}
                  />
                </div>
                <div className="form-group mb-0 md:col-span-2">
                  <label className="form-label">Unidad</label>
                  <select
                    className="form-input"
                    value={productDraft.unit}
                    onChange={event => updateProductDraft('unit', event.target.value)}
                  >
                    {COMMON_UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-0 md:col-span-3">
                  <label className="form-label">Precio unitario</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    value={productDraft.unitPrice}
                    onChange={event => updateProductDraft('unitPrice', event.target.value)}
                  />
                </div>
                <div className="flex justify-end md:col-span-12">
                  <Button type="button" variant="outline" onClick={addItem}>
                    <Plus className="size-4" />
                    Agregar al resumen
                  </Button>
                </div>
              </div>

            </div>
          </div>

          <div className="card ne-section">
            <h2 className="section-title"><Camera size={20} /> Facturas y notas</h2>
            <div className="form-group">
              <label className="form-label">Fotos de facturas</label>
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-background/50 p-6 text-center transition-colors hover:border-primary/60 hover:bg-primary/5">
                <Image className="mb-3 size-7 text-primary" />
                <span className="text-sm font-semibold">Subir fotos de facturas</span>
                <span className="mt-1 text-xs text-muted-foreground">Hasta 6 imagenes por compra</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>

            {form.receiptPhotos.length > 0 && (
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.receiptPhotos.map((photo, index) => (
                  <div key={photo.slice(0, 40)} className="relative overflow-hidden rounded-md border border-border bg-background">
                    <img src={photo} alt={`Factura ${index + 1}`} className="h-32 w-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 size-8"
                      onClick={() => removePhoto(index)}
                      title="Quitar foto"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notas u observaciones</label>
              <textarea
                className="form-input min-h-28 resize-y"
                placeholder="Detalles opcionales de la compra"
                value={form.notes}
                onChange={event => setForm({ ...form, notes: event.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="ne-summary-container">
          <div className="card summary-sticky">
            <h2 className="section-title"><ReceiptText size={20} /> Resumen de compra</h2>
            <div className="summary-list">
              <h3>Productos registrados</h3>
              {form.items.filter(item => item.name.trim()).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Agrega productos a la izquierda para ver el resumen.
                </p>
              ) : (
                form.items.filter(item => item.name.trim()).map(item => (
                  <div key={item.localId} className="summary-item items-start gap-3">
                    <span>
                      <span className="block text-foreground">{item.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {item.quantity} {item.unit} x ${currency(item.unitPrice)}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span>${currency(itemSubtotal(item))}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => removeItem(item.localId)}
                        title="Quitar producto"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="summary-financials">
              <div className="fin-row">
                <span>Establecimiento:</span>
                <span>{form.store || 'Sin definir'}</span>
              </div>
              <div className="fin-row">
                <span>Vendedor:</span>
                <span>{form.vendorName || 'Sin definir'}</span>
              </div>
              <div className="fin-row">
                <span>Facturas:</span>
                <span>{form.receiptPhotos.length}</span>
              </div>
              <div className="fin-row total-row">
                <span>Total compra:</span>
                <span>${currency(totalAmount)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-primary btn-full" onClick={handleSave} disabled={isSaving} style={{ marginTop: '1.5rem' }}>
                <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar compra'}
              </button>
              {saveError && (
                <p style={{ fontSize: '0.85rem', textAlign: 'center', color: 'var(--destructive)' }}>
                  {saveError.message}
                </p>
              )}
            </div>
          </div>
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
