import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';
import { apiRequest } from '../lib/api';
import './Inventory.css';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', unit: '', price: '' });

  useEffect(() => {
    apiRequest('/api/inventory')
      .then(data => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(console.error);
  }, []);

  const handleDelete = async (id) => {
    try {
      await apiRequest(`/api/inventory/${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, unit: item.unit, price: item.price });
  };

  const handleEditSave = async (id) => {
    const updatedFields = {
      name: editForm.name,
      unit: editForm.unit,
      price: Number(editForm.price),
    };

    try {
      const updatedItem = await apiRequest(`/api/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields),
      });
      setItems(items.map(item => item.id === id ? updatedItem : item));
      setEditingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newName || !newUnit || !newPrice) return;

    try {
      const newItem = await apiRequest('/api/inventory', {
        method: 'POST',
        body: JSON.stringify({ name: newName, unit: newUnit, price: Number(newPrice) }),
      });

      setItems([...items, newItem]);
      setNewName('');
      setNewUnit('');
      setNewPrice('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="inventory">
      <div className="inventory-header">
        <div>
          <h1>Catálogo de Insumos</h1>
          <p>Configura los precios base para tus cotizaciones.</p>
        </div>
      </div>

      <div className="card add-insumo-form" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Añadir Nuevo Insumo</h2>
        <form onSubmit={handleAddItem} className="insumo-form-grid">
          <div className="form-group">
            <label className="form-label">Nombre del Insumo</label>
            <input type="text" className="form-input" placeholder="Ej. Platos Descartables" value={newName} onChange={e => setNewName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Unidad</label>
            <input
              type="text"
              className="form-input"
              list="unit-options"
              placeholder="Ej. kg, litro, caja"
              value={newUnit}
              onChange={e => setNewUnit(e.target.value)}
              required
            />
            <datalist id="unit-options">
              {Array.from(new Set(items.map(item => item.unit))).map(u => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>
          <div className="form-group">
            <label className="form-label">Precio ($)</label>
            <input type="number" className="form-input" placeholder="Ej. 1500" value={newPrice} onChange={e => setNewPrice(e.target.value)} required />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', height: '42px' }}>
              <Plus size={18} /> Agregar
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Unidad</th>
              <th>Precio ($)</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No hay insumos registrados. Añade uno arriba.
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  {editingId === item.id ? (
                    <>
                      <td>
                        <input type="text" className="form-input" style={{ padding: '0.4rem', fontSize: '0.9rem' }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          list="unit-options"
                          style={{ padding: '0.4rem', fontSize: '0.9rem', width: '100px' }}
                          value={editForm.unit}
                          onChange={e => setEditForm({ ...editForm, unit: e.target.value })}
                          required
                        />
                      </td>
                      <td>
                        <div className="price-input-wrapper">
                          <span>$</span>
                          <input type="number" className="form-input" style={{ padding: '0.4rem', fontSize: '0.9rem' }} value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button className="btn-icon-success" onClick={() => handleEditSave(item.id)} title="Guardar cambios">
                          <Check size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><strong>{item.name}</strong></td>
                      <td><span className="unit-badge">{item.unit}</span></td>
                      <td>
                        <strong>${Number(item.price).toLocaleString('es-AR')}</strong>
                      </td>
                      <td style={{ textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          className="btn-icon-edit"
                          onClick={() => handleEditStart(item)}
                          title="Editar insumo"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="btn-icon-danger"
                          onClick={() => handleDelete(item.id)}
                          title="Eliminar insumo"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
