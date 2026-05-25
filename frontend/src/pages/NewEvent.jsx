import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calculator as CalcIcon, ReceiptText, Users, Save, Calendar, Beef } from 'lucide-react';
import { ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { AlertDialog } from '@/components/feedback/ConfirmDialog';
import { useInventory } from '@/hooks/useInventory';
import { currency } from '@/lib/finance';
import { applyRecipeToForm, applyTemplateToForm } from '@/lib/eventQuote';
import { calculateQuote, getSelectedQuoteItems, toEventInsumos } from '@/lib/quote';
import { createEvent } from '@/services/eventsApi';
import { getRecipes } from '@/services/recipesApi';
import { getQuoteTemplates } from '@/services/quoteTemplatesApi';
import './NewEvent.css';

export default function NewEvent() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { items: inventory, isLoading: isInventoryLoading, error: inventoryError, refresh: refreshInventory } = useInventory();
  const [saveError, setSaveError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');

  const triggerAlert = (title, desc) => {
    setAlertTitle(title);
    setAlertDescription(desc);
    setAlertOpen(true);
  };
  
  // Event Details State
  const [eventName, setEventName] = useState('');
  const [clientName, setClientName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [menuNotes, setMenuNotes] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [recipes, setRecipes] = useState([]);

  // Form State
  const [adults, setAdults] = useState('');
  const [kids, setKids] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [extraCosts, setExtraCosts] = useState('');

  // Insumos seleccionados (cantidades) - Diccionario: { id_insumo: cantidad }
  const [selectedQuantities, setSelectedQuantities] = useState({});

  useEffect(() => {
    getRecipes()
      .then(data => setRecipes(Array.isArray(data) ? data : []))
      .catch(() => setRecipes([]));
  }, []);

  useEffect(() => {
    const recipeId = routerLocation.state?.recipeId;
    if (!recipeId || recipes.length === 0 || inventory.length === 0) return;
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      setSelectedRecipeId(recipeId);
      applyRecipeToForm(recipe, inventory, {
        setRecipeName,
        setMenuNotes,
        setSelectedQuantities,
        setServings: (v) => setAdults(v),
      });
    }
  }, [routerLocation.state?.recipeId, recipes, inventory]);

  useEffect(() => {
    const templateId = routerLocation.state?.templateId;
    if (!templateId || inventory.length === 0) return;
    getQuoteTemplates()
      .then(all => {
        const template = (Array.isArray(all) ? all : []).find(t => t.id === templateId);
        if (template) {
          applyTemplateToForm(template, inventory, {
            setRecipeName,
            setMenuNotes,
            setSelectedQuantities,
            setExtraCosts,
            setProfitMargin,
            setServings: (v) => setAdults(v),
          });
        }
      })
      .catch(() => {});
  }, [routerLocation.state?.templateId, inventory]);

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

  const handleQuantityChange = (id, value) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [id]: Number(value)
    }));
  };

  const guests = Number(adults) + Number(kids);
  const summaryItems = getSelectedQuoteItems(inventory, selectedQuantities);
  const quote = calculateQuote({ items: summaryItems, extraCosts, profitMargin, guests });

  const handleSaveEvent = () => {
    if (!eventName || !eventDate) {
      triggerAlert(
        "Información requerida",
        "Por favor, ingresa al menos el Nombre del Evento y la Fecha para poder guardar el presupuesto."
      );
      return;
    }
    
    const formattedInsumos = toEventInsumos(summaryItems);

    const newEvent = {
      title: eventName,
      client: clientName,
      date: eventDate,
      time: eventTime,
      location: location,
      menuNotes,
      recipeName,
      guests,
      status: 'Pendiente',
      totalPrice: quote.finalPrice,
      insumos: formattedInsumos,
      extraCosts: Number(extraCosts),
      profitMargin: Number(profitMargin)
    };

    setSaveError(null);
    createEvent(newEvent)
    .then(() => {
      navigate('/history');
    })
    .catch(err => {
      console.error("Error saving event:", err);
      setSaveError(err);
      triggerAlert(
        "Error de guardado",
        "Hubo un error al intentar guardar el presupuesto. Por favor, intenta de nuevo."
      );
    });
  };

  return (
    <div className="new-event-page">
      <div className="ne-header">
        <div>
          <h1>Nuevo Presupuesto / Evento</h1>
          <p>Configura las cantidades exactas y calcula la cotización del evento.</p>
        </div>
      </div>

      <div className="ne-grid">
        {/* Lado Izquierdo: Formulario */}
        <div className="ne-form-container">
          
          <div className="card ne-section">
            <h2 className="section-title"><Calendar size={20} /> Información General</h2>
            <div className="form-group">
              <label className="form-label">Nombre del Evento *</label>
              <input type="text" className="form-input" placeholder="Ej. Cumpleaños Juan" value={eventName} onChange={e => setEventName(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contratante / Cliente</label>
                <input type="text" className="form-input" placeholder="Nombre del cliente" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Lugar del Evento</label>
                <input type="text" className="form-input" placeholder="Ej. Salón Principal" value={location} onChange={e => setLocation(e.target.value)} />
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
            </div>
          </div>

          <div className="card ne-section">
            <h2 className="section-title"><Users size={20} /> Invitados</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Adultos</label>
                <input type="number" className="form-input" placeholder="Ej. 20" value={adults} onChange={e => setAdults(e.target.value)} min="0"/>
              </div>
              <div className="form-group">
                <label className="form-label">Niños (Comen mitad)</label>
                <input type="number" className="form-input" placeholder="Ej. 5" value={kids} onChange={e => setKids(e.target.value)} min="0"/>
              </div>
            </div>
          </div>

          <div className="card ne-section">
            <h2 className="section-title"><Beef size={20} /> Menu y comidas especiales</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Receta / combo base</label>
                <select className="form-input" value={selectedRecipeId} onChange={e => handleRecipeSelect(e.target.value)}>
                  <option value="">Sin combo predefinido</option>
                  {recipes.map(recipe => (
                    <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Solicitud especial del cliente</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. sopa, arroz de cerdo, ensalada, yuca"
                  value={menuNotes}
                  onChange={e => setMenuNotes(e.target.value)}
                />
              </div>
            </div>
            <p className="section-desc">Usa este campo para dejar claro que se cotizo: sopas, arroz de cerdo, guarniciones, bebidas u otras comidas fuera del asado base.</p>
          </div>

          <div className="card ne-section">
            <div className="section-header-flex">
              <h2 className="section-title" style={{ borderBottom: 'none', padding: 0, margin: 0 }}>
                <Beef size={20} /> Cantidades de Insumos
              </h2>
            </div>
            <p className="section-desc">Ingresa las cantidades para el evento basado en tu catálogo.</p>
            
            <div className="insumos-grid">
              {isInventoryLoading ? (
                <LoadingState title="Cargando insumos" description="Estamos consultando el catálogo." />
              ) : inventoryError ? (
                <ErrorState description={inventoryError.message} onRetry={refreshInventory} />
              ) : inventory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Primero debes agregar insumos en la sección "Insumos" del menú lateral.</p>
              ) : (
                inventory.map(item => (
                  <div key={item.id} className="insumo-input-group">
                    <label className="insumo-label">{item.name} <span style={{ textTransform: 'capitalize' }}>({item.unit})</span></label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0" step="0.1"
                      value={selectedQuantities[item.id] || ''}
                      placeholder="0"
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card ne-section">
            <h2 className="section-title"><CalcIcon size={20} /> Finanzas Adicionales</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Costos Extra ($) (Mozos, Traslado)</label>
                <input type="number" className="form-input" placeholder="Ej. 15000" value={extraCosts} onChange={e => setExtraCosts(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Margen de Ganancia (%)</label>
                <input type="number" className="form-input" placeholder="Ej. 30" value={profitMargin} onChange={e => setProfitMargin(e.target.value)} />
              </div>
            </div>
          </div>

        </div>

        {/* Lado Derecho: Resumen Dinámico */}
        <div className="ne-summary-container">
          <div className="card summary-sticky">
            <h2 className="section-title"><ReceiptText size={20} /> Resumen en Vivo</h2>
            
            <div className="summary-list">
              <h3>Cantidades a Comprar</h3>
              {summaryItems.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Añade insumos a la izquierda para ver el resumen.
                </p>
              ) : (
                summaryItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <span>{item.name}</span> 
                    <span>{item.quantity} {item.unit}</span>
                  </div>
                ))
              )}
            </div>

            <div className="summary-financials">
              <div className="fin-row">
                <span>Costo Insumos:</span>
                <span>${currency(quote.costTotal)}</span>
              </div>
              <div className="fin-row">
                <span>Costos Extra:</span>
                <span>${currency(extraCosts)}</span>
              </div>
              <div className="fin-row margin-row">
                <span>Ganancia ({profitMargin}%):</span>
                <span>${currency(quote.profit)}</span>
              </div>
              <div className="fin-row total-row">
                <span>Presupuesto Total:</span>
                <span>${currency(quote.finalPrice)}</span>
              </div>
              <div className="fin-row total-per-person">
                <span>Precio Sugerido por Persona:</span>
                <span>${guests > 0 ? currency(quote.pricePerPerson) : '0'}</span>
              </div>
            </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn btn-primary btn-full" onClick={handleSaveEvent} style={{ marginTop: '1.5rem' }}>
              <Save size={18} /> Guardar Presupuesto
            </button>
            {saveError && (
              <p style={{ fontSize: '0.85rem', textAlign: 'center', color: 'var(--destructive)' }}>
                {saveError.message}
              </p>
            )}
            <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            </p>
          </div>
        </div>

        </div>
      </div>

      <AlertDialog
        isOpen={alertOpen}
        title={alertTitle}
        description={alertDescription}
        buttonText="Entendido"
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}
