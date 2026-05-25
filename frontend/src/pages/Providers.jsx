import { useEffect, useState } from 'react';
import { Check, Pencil, Phone, Plus, Store, Trash2, X } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createProvider, deleteProvider, getProviders, updateProvider } from '@/services/providersApi';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', category: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', category: '', notes: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);

  const loadProviders = () => {
    setIsLoading(true);
    setError(null);
    getProviders()
      .then(data => setProviders(Array.isArray(data) ? data : []))
      .catch(setError)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      setMutationError(null);
      const created = await createProvider(form);
      setProviders(prev => [created, ...prev]);
      setForm({ name: '', phone: '', category: '', notes: '' });
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleEditStart = (provider) => {
    setEditingId(provider.id);
    setEditForm({
      name: provider.name,
      phone: provider.phone || '',
      category: provider.category || '',
      notes: provider.notes || '',
    });
  };

  const handleEditSave = async (id) => {
    try {
      setMutationError(null);
      const updated = await updateProvider(id, editForm);
      setProviders(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
      setEditingId(null);
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!providerToDelete) return;
    try {
      setMutationError(null);
      await deleteProvider(providerToDelete.id);
      setProviders(prev => prev.filter(p => p.id !== providerToDelete.id));
      setDeleteConfirmOpen(false);
      setProviderToDelete(null);
    } catch (err) {
      setMutationError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Proveedores</Badge>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Agenda de proveedores</h1>
          <p className="mt-2 text-muted-foreground">Controla vendedores, categorias y telefonos para compras recurrentes.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Registrar proveedor</CardTitle><CardDescription>Luego podras asociarlo a compras de mercado.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2"><Label>Nombre</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Celular</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Categoria</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Carniceria, verduras, bebidas" /></div>
            <div className="flex items-end"><Button type="submit" className="w-full"><Plus className="size-4" /> Agregar</Button></div>
          </form>
          {mutationError && <p className="mt-4 text-sm text-destructive">{mutationError.message}</p>}
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingState title="Cargando proveedores" description="Consultando agenda." />
      ) : error ? (
        <ErrorState description={error.message} onRetry={loadProviders} />
      ) : providers.length === 0 ? (
        <EmptyState title="Sin proveedores" description="Agrega proveedores para asociarlos a compras." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {providers.map(provider => (
            <Card key={provider.id}>
              {editingId === provider.id ? (
                <CardContent className="space-y-3 pt-6">
                  <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Telefono" />
                  <Input value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} placeholder="Categoria" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditSave(provider.id)}><Check className="size-4" /> Guardar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="size-4" /></Button>
                  </div>
                </CardContent>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Store className="size-5 text-primary" /> {provider.name}</CardTitle>
                    <CardDescription>{provider.category || 'Sin categoria'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {provider.phone && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="size-4" /> {provider.phone}</p>}
                    <p className="text-sm text-muted-foreground">{provider.purchases?.length || 0} compras asociadas</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditStart(provider)}><Pencil className="size-4" /> Editar</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setProviderToDelete(provider); setDeleteConfirmOpen(true); }}>
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
        title="Eliminar proveedor"
        description={providerToDelete ? `Se eliminara "${providerToDelete.name}". Las compras historicas conservaran el nombre de la tienda.` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteConfirmOpen(false); setProviderToDelete(null); }}
      />
    </div>
  );
}
