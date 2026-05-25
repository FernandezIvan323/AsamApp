import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, History, Pencil, Plus, Trash2, X } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useInventory } from '@/hooks/useInventory';
import { currency } from '@/lib/finance';
import { STOCK_MOVEMENT_TYPES } from '@/lib/paymentMethods';
import { createStockMovement, getStockMovements } from '@/services/inventoryApi';

export default function Inventory() {
  const { items, isLoading, error, refresh, addItem, updateItem, removeItem } = useInventory();
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newMinStock, setNewMinStock] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', unit: '', price: '', stock: '', minStock: '' });
  const [mutationError, setMutationError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [stockPanelItem, setStockPanelItem] = useState(null);
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [stockForm, setStockForm] = useState({ type: 'Entrada', quantity: '', notes: '' });

  const [showNewUnitDropdown, setShowNewUnitDropdown] = useState(false);
  const [showEditUnitDropdown, setShowEditUnitDropdown] = useState(false);
  const newUnitContainerRef = useRef(null);
  const editUnitContainerRef = useRef(null);

  const COMMON_UNITS = ['kg', 'g', 'lb', 'litro', 'unidad', 'paquete', 'bandeja', 'pote', 'caja'];

  const uniqueUnits = Array.from(
    new Set([
      ...COMMON_UNITS,
      ...items.map(item => item.unit?.toLowerCase()).filter(Boolean),
    ])
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (newUnitContainerRef.current && !newUnitContainerRef.current.contains(event.target)) {
        setShowNewUnitDropdown(false);
      }
      if (editUnitContainerRef.current && !editUnitContainerRef.current.contains(event.target)) {
        setShowEditUnitDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetNewForm = () => {
    setNewName('');
    setNewUnit('');
    setNewPrice('');
    setNewStock('');
    setNewMinStock('');
  };

  const handleAddItem = async (event) => {
    event.preventDefault();
    if (!newName || !newUnit || !newPrice) return;

    try {
      setMutationError(null);
      await addItem({ name: newName, unit: newUnit, price: Number(newPrice), stock: Number(newStock || 0), minStock: Number(newMinStock || 0) });
      resetNewForm();
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, unit: item.unit, price: item.price, stock: item.stock || 0, minStock: item.minStock || 0 });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({ name: '', unit: '', price: '', stock: '', minStock: '' });
  };

  const handleEditSave = async (id) => {
    try {
      setMutationError(null);
      await updateItem(id, {
        name: editForm.name,
        unit: editForm.unit,
        price: Number(editForm.price),
        stock: Number(editForm.stock || 0),
        minStock: Number(editForm.minStock || 0),
      });
      handleEditCancel();
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const openStockPanel = (item) => {
    setStockPanelItem(item);
    setStockForm({ type: 'Entrada', quantity: '', notes: '' });
    setMovementsLoading(true);
    getStockMovements(item.id)
      .then(data => setMovements(Array.isArray(data) ? data : []))
      .catch(() => setMovements([]))
      .finally(() => setMovementsLoading(false));
  };

  const handleStockMovement = async (e) => {
    e.preventDefault();
    if (!stockPanelItem || !stockForm.quantity) return;
    try {
      setMutationError(null);
      const result = await createStockMovement(stockPanelItem.id, {
        type: stockForm.type,
        quantity: Number(stockForm.quantity),
        notes: stockForm.notes || null,
      });
      setStockPanelItem(result.item);
      setStockForm({ type: 'Entrada', quantity: '', notes: '' });
      await refresh();
      const updatedMovements = await getStockMovements(stockPanelItem.id);
      setMovements(Array.isArray(updatedMovements) ? updatedMovements : []);
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setMutationError(null);
      await removeItem(itemToDelete.id);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setMutationError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
          Inventario
        </Badge>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Catálogo de Insumos</h1>
          <p className="mt-2 text-muted-foreground">Configura precios base para tus cotizaciones.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Añadir Nuevo Insumo</CardTitle>
          <CardDescription>Los cambios se guardan directamente en la base de datos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="grid gap-4 lg:grid-cols-[1.4fr_.8fr_.8fr_.8fr_.8fr_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nombre del Insumo</Label>
              <Input id="new-name" placeholder="Ej. Platos descartables" value={newName} onChange={e => setNewName(e.target.value)} required />
            </div>
            <div ref={newUnitContainerRef} className="relative space-y-2">
              <Label htmlFor="new-unit">Unidad</Label>
              <div className="relative">
                <Input
                  id="new-unit"
                  placeholder="Ej. kg, litro, caja"
                  value={newUnit}
                  onChange={e => {
                    setNewUnit(e.target.value);
                    setShowNewUnitDropdown(true);
                  }}
                  onFocus={() => setShowNewUnitDropdown(true)}
                  autoComplete="off"
                  required
                  className="pr-8"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-muted-foreground">
                  <ChevronDown className="size-4 opacity-50" />
                </div>
              </div>
              {showNewUnitDropdown && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-card shadow-2xl p-1 animate-in fade-in slide-in-from-top-1 duration-150 scrollbar-thin">
                  {uniqueUnits
                    .filter(unit => unit.toLowerCase().includes(newUnit.toLowerCase()))
                    .map(unit => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          setNewUnit(unit);
                          setShowNewUnitDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer capitalize"
                      >
                        {unit}
                      </button>
                    ))}
                  {uniqueUnits.filter(unit => unit.toLowerCase().includes(newUnit.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground italic">
                      Usar "{newUnit}"
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-price">Precio ($)</Label>
              <Input id="new-price" type="number" min="0" placeholder="Ej. 1500" value={newPrice} onChange={e => setNewPrice(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-stock">Stock</Label>
              <Input id="new-stock" type="number" min="0" placeholder="0" value={newStock} onChange={e => setNewStock(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-min-stock">Minimo</Label>
              <Input id="new-min-stock" type="number" min="0" placeholder="0" value={newMinStock} onChange={e => setNewMinStock(e.target.value)} />
            </div>
            <Button type="submit" className="w-full lg:w-auto">
              <Plus className="size-4" />
              Agregar
            </Button>
          </form>
          {mutationError && <p className="mt-4 text-sm text-destructive">{mutationError.message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Insumos</CardTitle>
          <CardDescription>{items.length} insumos registrados.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState title="Cargando inventario" description="Estamos consultando el catálogo." />
          ) : error ? (
            <ErrorState description={error.message} onRetry={refresh} />
          ) : items.length === 0 ? (
            <EmptyState title="No hay insumos registrados" description="Añade insumos para poder cotizar eventos." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Minimo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    {editingId === item.id ? (
                      <>
                        <TableCell>
                          <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                        </TableCell>
                        <TableCell>
                          <div ref={editUnitContainerRef} className="relative">
                            <Input
                              className="w-32 pr-8"
                              value={editForm.unit}
                              onChange={e => {
                                setEditForm({ ...editForm, unit: e.target.value });
                                setShowEditUnitDropdown(true);
                              }}
                              onFocus={() => setShowEditUnitDropdown(true)}
                              autoComplete="off"
                            />
                            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-muted-foreground">
                              <ChevronDown className="size-4 opacity-50" />
                            </div>
                            {showEditUnitDropdown && (
                              <div className="absolute left-0 z-50 mt-1 w-40 max-h-48 overflow-y-auto rounded-md border border-border bg-card shadow-2xl p-1 animate-in fade-in slide-in-from-top-1 duration-150 scrollbar-thin">
                                {uniqueUnits
                                  .filter(unit => unit.toLowerCase().includes(editForm.unit.toLowerCase()))
                                  .map(unit => (
                                    <button
                                      key={unit}
                                      type="button"
                                      onClick={() => {
                                        setEditForm({ ...editForm, unit });
                                        setShowEditUnitDropdown(false);
                                      }}
                                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-sm hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer capitalize"
                                    >
                                      {unit}
                                    </button>
                                  ))}
                                {uniqueUnits.filter(unit => unit.toLowerCase().includes(editForm.unit.toLowerCase())).length === 0 && (
                                  <div className="px-2.5 py-1.5 text-xs text-muted-foreground italic">
                                    Usar "{editForm.unit}"
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input className="w-32" type="number" min="0" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                        </TableCell>
                        <TableCell>
                          <Input className="w-24" type="number" min="0" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} />
                        </TableCell>
                        <TableCell>
                          <Input className="w-24" type="number" min="0" value={editForm.minStock} onChange={e => setEditForm({ ...editForm, minStock: e.target.value })} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="secondary" onClick={() => handleEditSave(item.id)} title="Guardar cambios">
                              <Check className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleEditCancel} title="Cancelar edición">
                              <X className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-medium rounded-md px-2.5 py-0.5 text-xs uppercase tracking-wide">
                            {item.unit}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">${currency(item.price)}</TableCell>
                        <TableCell>{currency(item.stock)} {item.unit}</TableCell>
                        <TableCell>{currency(item.minStock)} {item.unit}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => openStockPanel(item)} title="Movimientos de stock">
                              <History className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleEditStart(item)} title="Editar insumo">
                              <Pencil className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(item)} title="Eliminar insumo">
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {stockPanelItem && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Movimientos: {stockPanelItem.name}</CardTitle>
              <CardDescription>Stock actual: {currency(stockPanelItem.stock)} {stockPanelItem.unit}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setStockPanelItem(null)}><X className="size-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleStockMovement} className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select className="form-input h-9 w-full" value={stockForm.type} onChange={e => setStockForm({ ...stockForm, type: e.target.value })}>
                  {STOCK_MOVEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input type="number" min="0" step="0.01" value={stockForm.quantity} onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Notas</Label>
                <Input value={stockForm.notes} onChange={e => setStockForm({ ...stockForm, notes: e.target.value })} placeholder="Opcional" />
              </div>
              <Button type="submit" className="sm:col-span-4 w-fit"><Plus className="size-4" /> Registrar movimiento</Button>
            </form>
            {movementsLoading ? (
              <LoadingState title="Cargando historial" />
            ) : movements.length === 0 ? (
              <EmptyState title="Sin movimientos" description="Registra entradas, salidas o ajustes." />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Tipo</TableHead><TableHead>Cantidad</TableHead><TableHead>Notas</TableHead></TableRow></TableHeader>
                <TableBody>
                  {movements.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>{new Date(m.createdAt).toLocaleString('es-AR')}</TableCell>
                      <TableCell><Badge variant="outline">{m.type}</Badge></TableCell>
                      <TableCell>{m.quantity}</TableCell>
                      <TableCell className="text-muted-foreground">{m.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="¿Eliminar insumo del catálogo?"
        description={itemToDelete ? `Estás a punto de eliminar "${itemToDelete.name}". Esta acción es permanente y afectará a las recetas o inventarios vinculados.` : ''}
        confirmText="Eliminar insumo"
        cancelText="Cancelar"
        variant="destructive"
        note="Nota: Los datos históricos de compras no se borrarán, pero el insumo ya no estará disponible para selección."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}
