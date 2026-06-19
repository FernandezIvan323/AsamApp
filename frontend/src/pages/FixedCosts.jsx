import { useEffect, useState } from 'react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { currency } from '@/lib/finance';
import { createFixedCost, deleteFixedCost, getFixedCosts, updateFixedCost } from '@/services/fixedCostsApi';

const FREQUENCIES = ['Mensual', 'Anual', 'Por evento'];
const EMPTY_FORM = { name: '', amount: '', frequency: 'Mensual', category: '', notes: '' };

function monthlyEquivalent(cost) {
  if (cost.frequency === 'Anual') return cost.amount / 12;
  if (cost.frequency === 'Por evento') return null;
  return cost.amount;
}

export default function FixedCosts() {
  const [costs, setCosts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const load = () => getFixedCosts().then(setCosts).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = { ...form, amount: Number(form.amount) };
    try {
      if (editingId) {
        await updateFixedCost(editingId, payload);
      } else {
        await createFixedCost(payload);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    }
  };

  const handleEdit = (cost) => {
    setEditingId(cost.id);
    setForm({ name: cost.name, amount: String(cost.amount), frequency: cost.frequency, category: cost.category || '', notes: cost.notes || '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este gasto fijo?')) return;
    await deleteFixedCost(id).catch(() => {});
    load();
  };

  const totalMonthly = costs.reduce((sum, c) => {
    const m = monthlyEquivalent(c);
    return m !== null ? sum + m : sum;
  }, 0);

  const totalPerEvent = costs.filter(c => c.frequency === 'Por evento').reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Estructura de costos</Badge>
        <h1 className="text-2xl font-bold tracking-tight">Gastos fijos del negocio</h1>
        <p className="text-muted-foreground">Registrá los costos recurrentes para tener una visión real de tu rentabilidad.</p>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="p-4"><CardDescription>Costo fijo mensual</CardDescription><CardTitle>${currency(totalMonthly)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="p-4"><CardDescription>Costo fijo anual</CardDescription><CardTitle>${currency(totalMonthly * 12)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="p-4"><CardDescription>Costo por evento</CardDescription><CardTitle>${currency(totalPerEvent)}</CardTitle></CardHeader></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-4" /> {editingId ? 'Editar gasto' : 'Nuevo gasto fijo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Gas, Transporte" required />
              </div>
              <div className="space-y-1">
                <Label>Monto ($) *</Label>
                <Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>
              <FormField label="Frecuencia">
                <Select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                  {FREQUENCIES.map(fr => <option key={fr} value={fr}>{fr}</option>)}
                </Select>
              </FormField>
              <div className="space-y-1">
                <Label>Categoría</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ej: Transporte, Equipamiento" />
              </div>
              <div className="space-y-1">
                <Label>Notas</Label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Opcional" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">{editingId ? 'Guardar cambios' : 'Agregar'}</Button>
                {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}>Cancelar</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="size-5 text-primary" /> Gastos registrados</CardTitle>
            <CardDescription>{costs.length} gasto{costs.length !== 1 ? 's' : ''} fijo{costs.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            {costs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay gastos fijos registrados.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Frecuencia</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">≈ Mensual</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costs.map(cost => (
                    <TableRow key={cost.id}>
                      <TableCell className="font-medium">{cost.name}</TableCell>
                      <TableCell className="text-muted-foreground">{cost.category || '—'}</TableCell>
                      <TableCell><Badge variant="outline">{cost.frequency}</Badge></TableCell>
                      <TableCell className="text-right">${currency(cost.amount)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {monthlyEquivalent(cost) !== null ? `$${currency(monthlyEquivalent(cost))}` : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(cost)}><Pencil className="size-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(cost.id)}><Trash2 className="size-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
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
