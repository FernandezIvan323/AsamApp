import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Beef, Calculator as CalcIcon, Calendar, ReceiptText, Save, Users } from 'lucide-react';

import { AlertDialog } from '@/components/feedback/ConfirmDialog';
import { ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/hooks/useInventory';
import { getAllowedStatuses } from '@/lib/eventStatus';
import { applyRecipeToForm, insumosToSelectedQuantities } from '@/lib/eventQuote';
import { currency } from '@/lib/finance';
import { calculateQuote, getSelectedQuoteItems, toEventInsumos } from '@/lib/quote';
import { getEvent, updateEvent } from '@/services/eventsApi';
import { getRecipes } from '@/services/recipesApi';
import './NewEvent.css';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items: inventory, isLoading: isInventoryLoading, error: inventoryError, refresh: refreshInventory } = useInventory();
  const [isEventLoading, setIsEventLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [eventStatus, setEventStatus] = useState('Pendiente');
  const [originalPrice, setOriginalPrice] = useState(null);
  const [originalStatus, setOriginalStatus] = useState('Pendiente');
  const [saveError, setSaveError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');

  const [eventName, setEventName] = useState('');
  const [clientName, setClientName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [menuNotes, setMenuNotes] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [adults, setAdults] = useState('');
  const [kids, setKids] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [extraCosts, setExtraCosts] = useState('');
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [initialized, setInitialized] = useState(false);

  const triggerAlert = (title, desc) => {
    setAlertTitle(title);
    setAlertDescription(desc);
    setAlertOpen(true);
  };

  useEffect(() => {
    getRecipes().then(data => setRecipes(Array.isArray(data) ? data : [])).catch(() => setRecipes([]));
  }, []);

  useEffect(() => {
    setIsEventLoading(true);
    setLoadError(null);
    getEvent(id)
      .then(event => {
        setEventStatus(event.status);
        setOriginalStatus(event.status);
        setOriginalPrice(event.totalPrice);
        setEventName(event.title || '');
        setClientName(event.client || '');
        setEventDate(event.date || '');
        setEventTime(event.time || '');
        setLocation(event.location || '');
        setMenuNotes(event.menuNotes || '');
        setRecipeName(event.recipeName || '');
        setAdults(String(event.guests || ''));
        setKids('');
        setProfitMargin(String(event.profitMargin ?? ''));
        setExtraCosts(String(event.extraCosts ?? ''));
        setInitialized(false);
      })
      .catch(setLoadError)
      .finally(() => setIsEventLoading(false));
  }, [id]);

  useEffect(() => {
    if (initialized || isEventLoading || isInventoryLoading || inventory.length === 0) return;
    getEvent(id).then(event => {
      setSelectedQuantities(insumosToSelectedQuantities(event.insumos, inventory));
      const match = recipes.find(r => r.name === event.recipeName);
      if (match) setSelectedRecipeId(match.id);
      setInitialized(true);
    });
  }, [id, initialized, isEventLoading, isInventoryLoading, inventory, recipes]);

  const handleRecipeSelect = (recipeId) => {
    setSelectedRecipeId(recipeId);
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) {
      setRecipeName('');
      return;
    }
    applyRecipeToForm(recipe, inventory, {
      setRecipeName,
      setMenuNotes,
      setSelectedQuantities,
      setServings: (v) => setAdults(v),
    });
  };

  const handleQuantityChange = (itemId, value) => {
    setSelectedQuantities(prev => ({ ...prev, [itemId]: Number(value) }));
  };

  const guests = Number(adults) + Number(kids);
  const summaryItems = getSelectedQuoteItems(inventory, selectedQuantities);
  const quote = calculateQuote({ items: summaryItems, extraCosts, profitMargin, guests });

  const handleSave = () => {
    if (!eventName || !eventDate) {
      triggerAlert('Información requerida', 'Nombre del evento y fecha son obligatorios.');
      return;
    }

    const LOCKED_STATUSES = ['Realizado', 'Cobrado'];
    const priceIsLocked = LOCKED_STATUSES.includes(originalStatus);

    setSaveError(null);
    updateEvent(id, {
      title: eventName,
      client: clientName,
      date: eventDate,
      time: eventTime,
      location,
      menuNotes,
      recipeName,
      guests,
      status: eventStatus,
      totalPrice: priceIsLocked ? originalPrice : quote.finalPrice,
      insumos: toEventInsumos(summaryItems),
      extraCosts: Number(extraCosts),
      profitMargin: Number(profitMargin),
    })
      .then(() => navigate(`/history/${id}`))
      .catch(err => {
        setSaveError(err);
        triggerAlert('Error al guardar', err.message || 'No se pudo actualizar el presupuesto.');
      });
  };

  if (isEventLoading || (isInventoryLoading && !initialized)) {
    return <LoadingState title="Cargando presupuesto" description="Preparando datos para editar." />;
  }
  if (loadError) {
    return <ErrorState description={loadError.message} onRetry={() => window.location.reload()} />;
  }
  if (inventoryError) {
    return <ErrorState description={inventoryError.message} onRetry={refreshInventory} />;
  }

  return (
    <div className="new-event-page">
      <div className="ne-header">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to={`/history/${id}`}><ArrowLeft className="size-4" /> Volver al evento</Link>
          </Button>
          <div>
            <h1>Editar presupuesto</h1>
            <p>Modifica cantidades, costos y datos del evento. Los pagos registrados se conservan.</p>
          </div>
        </div>
      </div>

      <div className="ne-grid">
        <div className="ne-form-container">
          <div className="card ne-section">
            <h2 className="section-title"><Calendar size={20} /> Información general</h2>
            <div className="form-group">
              <label className="form-label">Nombre del evento *</label>
              <input type="text" className="form-input" value={eventName} onChange={e => setEventName(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <input type="text" className="form-input" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Lugar</label>
                <input type="text" className="form-input" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha *</label>
                <input type="date" className="form-input" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Hora</label>
                <input type="time" className="form-input" value={eventTime} onChange={e => setEventTime(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select className="form-input" value={eventStatus} onChange={e => setEventStatus(e.target.value)}>
                  {getAllowedStatuses(originalStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card ne-section">
            <h2 className="section-title"><Users size={20} /> Invitados</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Total invitados</label>
                <input type="number" className="form-input" min="0" value={adults} onChange={e => setAdults(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Niños (opcional)</label>
                <input type="number" className="form-input" min="0" value={kids} onChange={e => setKids(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card ne-section">
            <h2 className="section-title"><Beef size={20} /> Menú</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Receta / combo</label>
                <select className="form-input" value={selectedRecipeId} onChange={e => handleRecipeSelect(e.target.value)}>
                  <option value="">Sin combo</option>
                  {recipes.map(recipe => (
                    <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notas de menú</label>
                <input type="text" className="form-input" value={menuNotes} onChange={e => setMenuNotes(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card ne-section">
            <h2 className="section-title"><Beef size={20} /> Cantidades de insumos</h2>
            <div className="insumos-grid">
              {inventory.map(item => (
                <div key={item.id} className="insumo-input-group">
                  <label className="insumo-label">{item.name} ({item.unit})</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    step="0.1"
                    value={selectedQuantities[item.id] || ''}
                    placeholder="0"
                    onChange={e => handleQuantityChange(item.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card ne-section">
            <h2 className="section-title"><CalcIcon size={20} /> Finanzas</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Costos extra ($)</label>
                <input type="number" className="form-input" value={extraCosts} onChange={e => setExtraCosts(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Margen (%)</label>
                <input type="number" className="form-input" value={profitMargin} onChange={e => setProfitMargin(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="ne-summary-container">
          <div className="card summary-sticky">
            <h2 className="section-title"><ReceiptText size={20} /> Resumen</h2>
            <div className="summary-list">
              {summaryItems.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.name}</span>
                  <span>{item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>
            <div className="summary-financials">
              <div className="fin-row"><span>Total:</span><span>${currency(quote.finalPrice)}</span></div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleSave} style={{ marginTop: '1.5rem' }}>
              <Save size={18} /> Guardar cambios
            </button>
            {saveError && <p style={{ color: 'var(--destructive)', fontSize: '0.85rem', textAlign: 'center' }}>{saveError.message}</p>}
          </div>
        </div>
      </div>

      <AlertDialog isOpen={alertOpen} title={alertTitle} description={alertDescription} buttonText="Entendido" onClose={() => setAlertOpen(false)} />
    </div>
  );
}
