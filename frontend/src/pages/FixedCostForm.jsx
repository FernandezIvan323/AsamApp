import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createFixedCost, getFixedCosts, updateFixedCost } from '@/services/fixedCostsApi';

const FREQUENCIES = ['Mensual', 'Anual', 'Por evento'];
const EMPTY = { name: '', amount: '', frequency: 'Mensual', category: '', notes: '' };

export default function FixedCostForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getFixedCosts()
      .then(list => {
        const cost = (Array.isArray(list) ? list : []).find(c => c.id === id);
        if (!cost) {
          setError('Gasto no encontrado');
          return;
        }
        setForm({
          name: cost.name || '',
          amount: String(cost.amount ?? ''),
          frequency: cost.frequency || 'Mensual',
          category: cost.category || '',
          notes: cost.notes || '',
        });
      })
      .catch(err => setError(err.message || 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!(Number(form.amount) >= 0) || form.amount === '') {
      setError('Indicá un monto válido');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = { ...form, amount: Number(form.amount) };
    try {
      if (isEdit) {
        await updateFixedCost(id, payload);
        toast('Gasto actualizado');
      } else {
        await createFixedCost(payload);
        toast('Gasto fijo creado');
      }
      navigate('/fixed-costs');
    } catch (err) {
      setError(err.message || 'Error al guardar');
      toast(err.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/fixed-costs"><ArrowLeft className="size-4" /> Volver a gastos fijos</Link>
      </Button>

      <div>
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Estructura de costos</Badge>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {isEdit ? 'Editar gasto fijo' : 'Nuevo gasto fijo'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Un gasto a la vez. Al guardar volvés a la lista.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">Datos del gasto</CardTitle>
          <CardDescription>Nombre, monto y frecuencia.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre" required>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej. Gas, Alquiler, Transporte"
                autoFocus
              />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Monto ($)" required>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0"
                />
              </FormField>
              <FormField label="Frecuencia">
                <Select
                  value={form.frequency}
                  onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                >
                  {FREQUENCIES.map(fr => <option key={fr} value={fr}>{fr}</option>)}
                </Select>
              </FormField>
            </div>
            <FormField label="Categoría" hint="Opcional">
              <Input
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="Ej. Transporte, Equipamiento"
              />
            </FormField>
            <FormField label="Notas" hint="Opcional">
              <Input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Detalle extra"
              />
            </FormField>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={saving || !form.name.trim()}>
                {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear gasto'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/fixed-costs')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
