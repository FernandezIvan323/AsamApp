import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileStack, Pencil, Plus, Trash2, X } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInventory } from '@/hooks/useInventory';
import { currency } from '@/lib/finance';
import { calculateQuote, getSelectedQuoteItems } from '@/lib/quote';
import {
  createQuoteTemplate,
  deleteQuoteTemplate,
  getQuoteTemplates,
  updateQuoteTemplate,
} from '@/services/quoteTemplatesApi';

export default function Templates() {
  const { items: inventory } = useInventory();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', guests: '', extraCosts: '', profitMargin: '' });
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [editingId, setEditingId] = useState(null);
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

  const handleCreate = async (e) => {
    e.preventDefault();
    const created = await createQuoteTemplate({
      ...form,
      guests: Number(form.guests || 0),
      extraCosts: Number(form.extraCosts || 0),
      profitMargin: Number(form.profitMargin || 0),
      items: buildItems(),
    });
    setTemplates(prev => [created, ...prev]);
    setForm({ name: '', description: '', guests: '', extraCosts: '', profitMargin: '' });
    setSelectedQuantities({});
  };

  const handleEditStart = (template) => {
    setEditingId(template.id);
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
  };

  const handleEditSave = async (id) => {
    const updated = await updateQuoteTemplate(id, {
      ...form,
      guests: Number(form.guests || 0),
      extraCosts: Number(form.extraCosts || 0),
      profitMargin: Number(form.profitMargin || 0),
      items: buildItems(),
    });
    setTemplates(prev => prev.map(t => (t.id === id ? updated : t)));
    setEditingId(null);
    setSelectedQuantities({});
  };

  const quote = calculateQuote({
    items: getSelectedQuoteItems(inventory, selectedQuantities),
    extraCosts: form.extraCosts,
    profitMargin: form.profitMargin,
    guests: Number(form.guests || 0) || 1,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Plantillas</Badge>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Plantillas de cotización</h1>
        <p className="text-muted-foreground">Guarda configuraciones frecuentes y reutilízalas al crear presupuestos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Editar plantilla' : 'Nueva plantilla'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingId ? (e) => { e.preventDefault(); handleEditSave(editingId); } : handleCreate} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2"><Label>Nombre</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Descripción</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>Invitados base</Label><Input type="number" min="0" value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} /></div>
              <div className="space-y-2"><Label>Margen %</Label><Input type="number" min="0" value={form.profitMargin} onChange={e => setForm({ ...form, profitMargin: e.target.value })} /></div>
              <div className="space-y-2"><Label>Costos extra</Label><Input type="number" min="0" value={form.extraCosts} onChange={e => setForm({ ...form, extraCosts: e.target.value })} /></div>
              <div className="space-y-2 flex items-end"><p className="text-sm text-muted-foreground">Total estimado: <strong>${currency(quote.finalPrice)}</strong></p></div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto">
              {inventory.map(item => (
                <label key={item.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="form-input h-8 w-20"
                    value={selectedQuantities[item.id] || ''}
                    placeholder="0"
                    onChange={e => setSelectedQuantities({ ...selectedQuantities, [item.id]: Number(e.target.value) })}
                  />
                  <span className="truncate">{item.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="submit"><Plus className="size-4" /> {editingId ? 'Guardar' : 'Crear plantilla'}</Button>
              {editingId && <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setSelectedQuantities({}); }}><X className="size-4" /></Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? <LoadingState title="Cargando plantillas" /> : error ? <ErrorState description={error.message} onRetry={load} /> : templates.length === 0 ? (
        <EmptyState title="Sin plantillas" description="Crea la primera para acelerar cotizaciones." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map(template => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileStack className="size-5 text-primary" /> {template.name}</CardTitle>
                <CardDescription>{template.guests} invitados · margen {template.profitMargin}% · {template.items?.length || 0} insumos</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" asChild><Link to="/new-event" state={{ templateId: template.id }}>Usar en cotización</Link></Button>
                <Button size="sm" variant="outline" onClick={() => handleEditStart(template)}><Pencil className="size-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => { setToDelete(template); setDeleteOpen(true); }}><Trash2 className="size-4 text-destructive" /></Button>
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
