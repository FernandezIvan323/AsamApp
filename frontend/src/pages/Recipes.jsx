import { useEffect, useState } from 'react';
import { Check, Pencil, Plus, Trash2, Utensils, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { currency } from '@/lib/finance';
import { createRecipe, deleteRecipe, getRecipes, updateRecipe } from '@/services/recipesApi';

function parseItemsFromText(itemText) {
  return itemText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => ({ name: line, quantity: 0, unit: 'unidad' }));
}

function itemsToText(items) {
  return (items || []).map(i => i.name).join('\n');
}

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', servings: '', basePrice: '', description: '' });
  const [itemText, setItemText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', servings: '', basePrice: '', description: '' });
  const [editItemText, setEditItemText] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const loadRecipes = () => {
    setIsLoading(true);
    setError(null);
    getRecipes()
      .then(data => setRecipes(Array.isArray(data) ? data : []))
      .catch(setError)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      setMutationError(null);
      const created = await createRecipe({
        ...form,
        servings: Number(form.servings || 0),
        basePrice: Number(form.basePrice || 0),
        items: parseItemsFromText(itemText),
      });
      setRecipes(prev => [created, ...prev]);
      setForm({ name: '', category: '', servings: '', basePrice: '', description: '' });
      setItemText('');
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleEditStart = (recipe) => {
    setEditingId(recipe.id);
    setEditForm({
      name: recipe.name,
      category: recipe.category || '',
      servings: String(recipe.servings || ''),
      basePrice: String(recipe.basePrice || ''),
      description: recipe.description || '',
    });
    setEditItemText(itemsToText(recipe.items));
  };

  const handleEditSave = async (id) => {
    try {
      setMutationError(null);
      const updated = await updateRecipe(id, {
        ...editForm,
        servings: Number(editForm.servings || 0),
        basePrice: Number(editForm.basePrice || 0),
        items: parseItemsFromText(editItemText),
      });
      setRecipes(prev => prev.map(r => (r.id === id ? updated : r)));
      setEditingId(null);
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;
    try {
      setMutationError(null);
      await deleteRecipe(recipeToDelete.id);
      setRecipes(prev => prev.filter(r => r.id !== recipeToDelete.id));
      setDeleteConfirmOpen(false);
      setRecipeToDelete(null);
    } catch (err) {
      setMutationError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Recetas y combos</Badge>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Menus, recetas y combos</h1>
          <p className="mt-2 text-muted-foreground">Registra combos reutilizables y aplicalos al crear un presupuesto.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crear receta o combo</CardTitle>
          <CardDescription>Define que incluye y usalo en Nuevo Presupuesto.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2"><Label>Nombre</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej. Asado familiar + sopa" required /></div>
            <div className="space-y-2"><Label>Categoria</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Premium, almuerzo, ejecutivo" /></div>
            <div className="space-y-2"><Label>Porciones</Label><Input type="number" min="0" value={form.servings} onChange={e => setForm({ ...form, servings: e.target.value })} /></div>
            <div className="space-y-2"><Label>Precio base</Label><Input type="number" min="0" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} /></div>
            <div className="space-y-2 lg:col-span-2"><Label>Descripcion</Label><textarea className="form-input min-h-24" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2 lg:col-span-2"><Label>Incluye (una linea por item)</Label><textarea className="form-input min-h-28" value={itemText} onChange={e => setItemText(e.target.value)} placeholder={'Sopa de costilla\nArroz de cerdo\nCarne asada'} /></div>
            <div className="lg:col-span-2"><Button type="submit"><Plus className="size-4" /> Guardar receta</Button></div>
          </form>
          {mutationError && <p className="mt-4 text-sm text-destructive">{mutationError.message}</p>}
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingState title="Cargando recetas" description="Consultando menus registrados." />
      ) : error ? (
        <ErrorState description={error.message} onRetry={loadRecipes} />
      ) : recipes.length === 0 ? (
        <EmptyState title="Sin recetas registradas" description="Crea el primer combo para reutilizarlo en cotizaciones." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map(recipe => (
            <Card key={recipe.id}>
              {editingId === recipe.id ? (
                <CardContent className="space-y-3 pt-6">
                  <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  <Input value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} placeholder="Categoria" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" value={editForm.servings} onChange={e => setEditForm({ ...editForm, servings: e.target.value })} placeholder="Porciones" />
                    <Input type="number" value={editForm.basePrice} onChange={e => setEditForm({ ...editForm, basePrice: e.target.value })} placeholder="Precio base" />
                  </div>
                  <textarea className="form-input min-h-24" value={editItemText} onChange={e => setEditItemText(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditSave(recipe.id)}><Check className="size-4" /> Guardar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="size-4" /></Button>
                  </div>
                </CardContent>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Utensils className="size-5 text-primary" /> {recipe.name}</CardTitle>
                    <CardDescription>{recipe.category || 'Sin categoria'} · {recipe.servings} porciones · ${currency(recipe.basePrice)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recipe.description && <p className="text-sm text-muted-foreground">{recipe.description}</p>}
                    <div className="flex flex-wrap gap-1">
                      {recipe.items?.map(item => <Badge key={item.name} variant="outline" className="mr-1">{item.name}</Badge>)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/new-event" state={{ recipeId: recipe.id }}>Usar en cotizacion</Link>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEditStart(recipe)}><Pencil className="size-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setRecipeToDelete(recipe); setDeleteConfirmOpen(true); }}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Eliminar receta"
        description={recipeToDelete ? `Se eliminara "${recipeToDelete.name}".` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteConfirmOpen(false); setRecipeToDelete(null); }}
      />
    </div>
  );
}
