import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileStack, Pencil, Plus, Search, Trash2, X } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useInventory } from '@/hooks/useInventory';
import { currency } from '@/lib/finance';
import { calculateQuote, getSelectedQuoteItems } from '@/lib/quote';
import {
  createQuoteTemplate,
  deleteQuoteTemplate,
  getQuoteTemplates,
  updateQuoteTemplate,
} from '@/services/quoteTemplatesApi';

const EMPTY_FORM = { name: '', description: '', guests: '30', extraCosts: '0', profitMargin: '30' };

export default function Templates() {
  const { items: inventory } = useInventory();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [insumoSearch, setInsumoSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setIsLoading(true);
    getQuoteTemplates()
      .then(data => setTemplates(Array.isArray(data) ? data : []))
      .catch(setError)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const buildItems = () =>
    getSelectedQuoteItems(inventory, selectedQuantities).map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      costPerUnit: item.costPerUnit,
    }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSelectedQuantities({});
    setEditingId(null);
    setFormError(null);
    setInsumoSearch('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('El nombre de la plantilla es obligatorio.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const created = await createQuoteTemplate({
        ...form,
        guests: Number(form.guests || 0),
        extraCosts: Number(form.extraCosts || 0),
        profitMargin: Number(form.profitMargin || 0),
        items: buildItems(),
      });
      setTemplates(prev => [created, ...prev]);
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'No se pudo guardar la plantilla.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditStart = (template) => {
    setEditingId(template.id);
    setShowForm(true);
    setForm({
      name: template.name,
      description: template.description || '',
      guests: String(template.guests || ''),
      extraCosts: String(template.extraCosts || ''),
      profitMargin: String(template.profitMargin || ''),
    });
    const quantities = {};
    for (const item of template.items || []) {
      const catalog = inventory.find(i => i.name.toLowerCase() === item.name.toLowerCase());
      if (catalog) quantities[catalog.id] = item.quantity;
    }
    setSelectedQuantities(quantities);
    setFormError(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('El nombre de la plantilla es obligatorio.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const updated = await updateQuoteTemplate(editingId, {
        ...form,
        guests: Number(form.guests || 0),
        extraCosts: Number(form.extraCosts || 0),
        profitMargin: Number(form.profitMargin || 0),
        items: buildItems(),
      });
      setTemplates(prev => prev.map(t => (t.id === editingId ? updated : t)));
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'No se pudo actualizar.');
    } finally {
      setSaving(false);
    }
  };

  const filteredInventory = useMemo(() => {
    const term = insumoSearch.trim().toLowerCase();
    if (!term) return inventory;
    return inventory.filter(i => i.name.toLowerCase().includes(term));
  }, [inventory, insumoSearch]);

  const selectedCount = Object.values(selectedQuantities).filter(q => Number(q) > 0).length;

  const quote = calculateQuote({
    items: getSelectedQuoteItems(inventory, selectedQuantities),
    extraCosts: form.extraCosts,
    profitMargin: form.profitMargin,
    guests: Number(form.guests || 0) || 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Plantillas</Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Plantillas de cotización</h1>
          <p className="text-muted-foreground">Guardá menús frecuentes y reutilizalos al cotizar.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="size-4" /> Nueva plantilla
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">{editingId ? 'Editar plantilla' : 'Nueva plantilla'}</CardTitle>
            <CardDescription>
              Definí nombre, invitados base, margen e insumos del catálogo.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={editingId ? handleEditSave : handleCreate} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nombre" required error={formError && !form.name.trim() ? formError : null}>
                  <Input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej. Asado 30 personas clásico"
                  />
                </FormField>
                <FormField label="Descripción">
                  <Input
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Opcional"
                  />
                </FormField>
                <FormField label="Invitados base">
                  <Input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={form.guests}
                    onChange={e => setForm({ ...form, guests: e.target.value })}
                  />
                </FormField>
                <FormField label="Margen (%)">
                  <Input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={form.profitMargin}
                    onChange={e => setForm({ ...form, profitMargin: e.target.value })}
                  />
                </FormField>
                <FormField label="Costos extra ($)">
                  <Input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={form.extraCosts}
                    onChange={e => setForm({ ...form, extraCosts: e.target.value })}
                  />
                </FormField>
                <div className="flex items-end">
                  <div className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total estimado</p>
                    <p className="text-xl font-bold text-primary">${currency(quote.finalPrice)}</p>
                    <p className="text-xs text-muted-foreground">{selectedCount} insumo{selectedCount !== 1 ? 's' : ''} con cantidad</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">Insumos del catálogo</p>
                  <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={insumoSearch}
                      onChange={e => setInsumoSearch(e.target.value)}
                      placeholder="Buscar insumo…"
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
                {inventory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay insumos. Cargalos primero en Inventario.</p>
                ) : (
                  <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
                    {filteredInventory.map(item => (
                      <div key={item.id} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.unit} · ${currency(item.price)}</p>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          inputMode="decimal"
                          className="h-9 w-20 text-center"
                          value={selectedQuantities[item.id] || ''}
                          placeholder="0"
                          onChange={e => setSelectedQuantities({
                            ...selectedQuantities,
                            [item.id]: e.target.value === '' ? '' : Number(e.target.value),
                          })}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formError && form.name.trim() && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  <Plus className="size-4" />
                  {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear plantilla'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { resetForm(); setShowForm(false); }}
                >
                  <X className="size-4" /> Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <LoadingState title="Cargando plantillas" />
      ) : error ? (
        <ErrorState description={error.message} onRetry={load} />
      ) : templates.length === 0 ? (
        <EmptyState title="Sin plantillas" description="Creá la primera para acelerar cotizaciones." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map(template => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileStack className="size-5 text-primary" /> {template.name}
                </CardTitle>
                <CardDescription>
                  {template.guests || 0} invitados · margen {template.profitMargin || 0}% · {template.items?.length || 0} insumos
                  {template.description ? ` · ${template.description}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link to="/new-event" state={{ templateId: template.id }}>Usar en cotización</Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEditStart(template)}>
                  <Pencil className="size-4" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setToDelete(template); setDeleteOpen(true); }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteOpen}
        title="Eliminar plantilla"
        description={toDelete ? `Se eliminará "${toDelete.name}".` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={async () => {
          await deleteQuoteTemplate(toDelete.id);
          setTemplates(prev => prev.filter(t => t.id !== toDelete.id));
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
