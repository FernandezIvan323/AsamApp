import { useMemo } from 'react';
import {
  Beef,
  Calculator as CalcIcon,
  Calendar,
  Clock,
  MapPin,
  ReceiptText,
  Save,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import ClientCombobox from '@/components/events/ClientCombobox';
import InsumoPicker from '@/components/events/InsumoPicker';
import { currency } from '@/lib/finance';
import { effectiveGuests, formatGuestSummary } from '@/lib/guests';
import { calculateQuote, getSelectedQuoteItems } from '@/lib/quote';
import { getAllowedStatuses } from '@/lib/eventStatus';

/**
 * Formulario compartido de evento/presupuesto.
 *
 * mode: 'create' | 'edit'
 * create usa steps 1–3 vía prop `step`; edit muestra todo en una página.
 */
export default function EventForm({
  mode = 'create',
  step = 1,
  values,
  onChange,
  fieldErrors = {},
  onBlurField,
  clients = [],
  onClientCreated,
  recipes = [],
  inventory = [],
  isInventoryLoading = false,
  inventoryError = null,
  onRetryInventory,
  onRecipeSelect,
  statusOptionsFrom,
  isSaving = false,
  saveError = null,
  onSave,
  priceLocked = false,
  originalPrice = null,
  showStatus = false,
}) {
  const set = (patch) => onChange?.({ ...values, ...patch });

  const guests = effectiveGuests(values.adults, values.kids);
  const summaryItems = getSelectedQuoteItems(inventory, values.selectedQuantities || {});
  const quote = calculateQuote({
    items: summaryItems,
    extraCosts: values.extraCosts,
    profitMargin: values.profitMargin,
    guests,
  });
  const displayTotal = priceLocked ? originalPrice : quote.finalPrice;

  const statusList = useMemo(() => {
    if (!showStatus) return [];
    return getAllowedStatuses(statusOptionsFrom || values.eventStatus || 'Cotizado');
  }, [showStatus, statusOptionsFrom, values.eventStatus]);

  const showStep1 = mode === 'edit' || step === 1;
  const showStep2 = mode === 'edit' || step === 2;
  const showStep3 = mode === 'edit' || step === 3;
  const showConfirm = mode === 'create' && step === 3;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-4">
        {showStep1 && (
          <>
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-foreground">
                <Calendar className="size-4.5 text-primary" /> Información general
              </h2>
              <div className="space-y-4">
                <FormField label="Nombre del evento" required error={fieldErrors.eventName}>
                  <Input
                    value={values.eventName}
                    onChange={e => set({ eventName: e.target.value })}
                    onBlur={onBlurField?.('eventName')}
                    placeholder="Ej. Cumpleaños Juan"
                  />
                </FormField>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Cliente / contratante">
                    <ClientCombobox
                      clients={clients}
                      clientId={values.clientId}
                      clientName={values.clientName}
                      onChange={({ clientId, clientName }) => set({ clientId, clientName })}
                      onClientCreated={onClientCreated}
                    />
                  </FormField>
                  <FormField label="Lugar del evento">
                    <Input
                      value={values.location}
                      onChange={e => set({ location: e.target.value })}
                      placeholder="Ej. Salón Principal"
                    />
                  </FormField>
                </div>
                <div className={`grid grid-cols-1 gap-4 ${showStatus ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  <FormField label="Fecha" required error={fieldErrors.eventDate}>
                    <Input
                      type="date"
                      value={values.eventDate}
                      onChange={e => set({ eventDate: e.target.value })}
                      onBlur={onBlurField?.('eventDate')}
                    />
                  </FormField>
                  <FormField label="Hora">
                    <Input
                      type="time"
                      value={values.eventTime}
                      onChange={e => set({ eventTime: e.target.value })}
                    />
                  </FormField>
                  {showStatus && (
                    <FormField label="Estado">
                      <Select
                        value={values.eventStatus}
                        onChange={e => set({ eventStatus: e.target.value })}
                      >
                        {statusList.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </Select>
                    </FormField>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-foreground">
                <Users className="size-4.5 text-primary" /> Invitados
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Adultos" hint="1 ración cada uno" error={fieldErrors.adults}>
                  <Input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.adults}
                    onChange={e => set({ adults: e.target.value })}
                    placeholder="Ej. 20"
                  />
                </FormField>
                <FormField label="Niños (½ ración)" hint="Media ración cada uno">
                  <Input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.kids}
                    onChange={e => set({ kids: e.target.value })}
                    placeholder="Ej. 5"
                  />
                </FormField>
              </div>
              {(Number(values.adults) > 0 || Number(values.kids) > 0) && (
                <p className="mt-3 text-xs text-primary">{formatGuestSummary(values.adults, values.kids)}</p>
              )}
            </section>
          </>
        )}

        {showStep2 && (
          <>
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-foreground">
                <Beef className="size-4.5 text-primary" /> Menú
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Receta / combo base">
                  <Select
                    value={values.selectedRecipeId}
                    onChange={e => onRecipeSelect?.(e.target.value)}
                  >
                    <option value="">Sin combo predefinido</option>
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Solicitud especial / notas de menú">
                  <Input
                    value={values.menuNotes}
                    onChange={e => set({ menuNotes: e.target.value })}
                    placeholder="Ej. sopa, arroz, ensalada"
                  />
                </FormField>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Dejá claro lo cotizado: guarniciones, bebidas u otras comidas fuera del asado base.
              </p>
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                <ShoppingCart className="size-4.5 text-primary" /> Cantidades de insumos
              </h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Buscá y cargá cantidades según el catálogo de precios.
              </p>
              <InsumoPicker
                inventory={inventory}
                selectedQuantities={values.selectedQuantities}
                onChange={selectedQuantities => set({ selectedQuantities })}
                isLoading={isInventoryLoading}
                error={inventoryError}
                onRetry={onRetryInventory}
              />
            </section>
          </>
        )}

        {showStep3 && (
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-foreground">
              <CalcIcon className="size-4.5 text-primary" /> Finanzas
            </h2>
            {priceLocked && (
              <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                El precio está bloqueado (evento realizado o cobrado). Se conservan pagos e insumos de costo.
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Costos extra ($)" hint="Mozos, traslado, etc.">
                <Input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={values.extraCosts}
                  onChange={e => set({ extraCosts: e.target.value })}
                  placeholder="0"
                  disabled={priceLocked}
                />
              </FormField>
              <FormField label="Margen de ganancia (%)">
                <Input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={values.profitMargin}
                  onChange={e => set({ profitMargin: e.target.value })}
                  placeholder="30"
                  disabled={priceLocked}
                />
              </FormField>
            </div>
          </section>
        )}

        {showConfirm && (
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <MapPin className="size-4.5 text-primary" /> Confirmar datos
            </h2>
            <div className="space-y-2 text-sm">
              {[
                ['Evento', values.eventName || '—'],
                ['Cliente', values.clientName || '—'],
                ['Fecha', values.eventDate || '—'],
                ['Invitados (raciones)', String(guests || 0)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-lg bg-secondary px-4 py-3">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Resumen sticky */}
      <div className="flex flex-col gap-4">
        <div className="sticky top-6 rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ReceiptText className="size-4.5 text-primary" /> Resumen en vivo
            </h3>
          </div>
          <div className="space-y-3 px-6 py-4">
            <div className="space-y-1">
              {summaryItems.length === 0 ? (
                <p className="text-xs italic text-muted-foreground">Agregá insumos para ver el desglose.</p>
              ) : (
                summaryItems.slice(0, 6).map(item => (
                  <div key={item.id} className="flex justify-between gap-2 text-xs">
                    <span className="truncate text-muted-foreground">{item.name}</span>
                    <span className="shrink-0 font-medium text-foreground">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))
              )}
              {summaryItems.length > 6 && (
                <p className="text-[10px] text-muted-foreground">+{summaryItems.length - 6} más</p>
              )}
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ShoppingCart className="size-3.5" /> Insumos
                </span>
                <span className="font-semibold text-foreground">${currency(quote.costTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CalcIcon className="size-3.5" /> Extras
                </span>
                <span className="font-semibold text-foreground">${currency(Number(values.extraCosts || 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-3.5" /> Ganancia ({values.profitMargin || 0}%)
                </span>
                <span className="font-semibold text-primary">${currency(quote.profit)}</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {priceLocked ? 'Precio (bloqueado)' : 'Precio sugerido'}
                </span>
                <span className="text-xl font-bold text-primary">${currency(displayTotal)}</span>
              </div>
              {guests > 0 && (
                <div className="flex justify-between border-t border-border pt-2 text-xs">
                  <span className="text-muted-foreground">Por ración</span>
                  <span className="font-semibold text-foreground">
                    ${currency(Number(displayTotal || 0) / guests)}
                  </span>
                </div>
              )}
            </div>

            {onSave && (
              <Button className="w-full" size="lg" onClick={onSave} disabled={isSaving}>
                <Save className="size-4" />
                {isSaving ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Guardar presupuesto'}
              </Button>
            )}
            {saveError && (
              <p className="text-center text-xs text-destructive">
                {saveError.message || String(saveError)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

