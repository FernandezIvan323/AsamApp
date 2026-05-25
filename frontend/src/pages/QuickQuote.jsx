import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Plus, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';
import { applyRecipeToForm, applyTemplateToForm } from '@/lib/eventQuote';
import { currency } from '@/lib/finance';
import { calculateQuote, getSelectedQuoteItems } from '@/lib/quote';
import { getRecipes } from '@/services/recipesApi';
import { getQuoteTemplates } from '@/services/quoteTemplatesApi';
import './NewEvent.css';

export default function QuickQuote() {
  const navigate = useNavigate();
  const { items: inventory } = useInventory();
  const [recipes, setRecipes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [guests, setGuests] = useState('');
  const [extraCosts, setExtraCosts] = useState('0');
  const [profitMargin, setProfitMargin] = useState('30');
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [recipeName, setRecipeName] = useState('');
  const [menuNotes, setMenuNotes] = useState('');

  useEffect(() => {
    getRecipes().then(d => setRecipes(Array.isArray(d) ? d : [])).catch(() => {});
    getQuoteTemplates().then(d => setTemplates(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const handleRecipeSelect = (id) => {
    setSelectedRecipeId(id);
    setSelectedTemplateId('');
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    applyRecipeToForm(recipe, inventory, {
      setRecipeName,
      setMenuNotes,
      setSelectedQuantities,
      setServings: v => setGuests(v),
    });
  };

  const handleTemplateSelect = (id) => {
    setSelectedTemplateId(id);
    setSelectedRecipeId('');
    const tpl = templates.find(t => t.id === id);
    if (!tpl) return;
    applyTemplateToForm(tpl, inventory, {
      setRecipeName,
      setMenuNotes,
      setSelectedQuantities,
      setExtraCosts,
      setProfitMargin,
      setServings: v => setGuests(v),
    });
  };

  const summaryItems = getSelectedQuoteItems(inventory, selectedQuantities);
  const quote = calculateQuote({ items: summaryItems, extraCosts, profitMargin, guests });

  const handleCreateEvent = () => {
    const params = new URLSearchParams({
      guests: guests || '',
      extraCosts: extraCosts || '0',
      profitMargin: profitMargin || '30',
      recipeName: recipeName || '',
      menuNotes: menuNotes || '',
    });
    navigate(`/new-event?${params}`);
  };

  return (
    <div className="new-event-page">
      <div className="ne-header">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Cotizador rápido</Badge>
          <h1>Calculá sin crear evento</h1>
          <p>Estimá el precio de un asado al instante. Si querés guardarlo, convertilo en evento.</p>
        </div>
      </div>

      <div className="ne-grid">
        <div className="ne-form-container space-y-4">

          <div className="card ne-section">
            <h2 className="section-title"><Zap size={18} /> Cargar desde plantilla o receta</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Plantilla</label>
                <select className="form-input" value={selectedTemplateId} onChange={e => handleTemplateSelect(e.target.value)}>
                  <option value="">Sin plantilla</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Receta / combo</label>
                <select className="form-input" value={selectedRecipeId} onChange={e => handleRecipeSelect(e.target.value)}>
                  <option value="">Sin receta</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card ne-section">
            <h2 className="section-title"><Calculator size={18} /> Parámetros</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Invitados</label>
                <input type="number" className="form-input" min="1" value={guests} onChange={e => setGuests(e.target.value)} placeholder="30" />
              </div>
              <div className="form-group">
                <label className="form-label">Costos extra ($)</label>
                <input type="number" className="form-input" min="0" value={extraCosts} onChange={e => setExtraCosts(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Margen (%)</label>
                <input type="number" className="form-input" min="0" value={profitMargin} onChange={e => setProfitMargin(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card ne-section">
            <h2 className="section-title">Cantidades de insumos</h2>
            <div className="insumos-grid">
              {inventory.map(item => (
                <div key={item.id} className="insumo-input-group">
                  <label className="insumo-label">{item.name} ({item.unit}) — ${currency(item.price)}</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    step="0.1"
                    value={selectedQuantities[item.id] || ''}
                    placeholder="0"
                    onChange={e => setSelectedQuantities(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ne-summary-container">
          <div className="card summary-sticky space-y-4">
            <h2 className="section-title">Resumen</h2>

            {summaryItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Seleccioná insumos para ver el cálculo.</p>
            ) : (
              <div className="space-y-1 text-sm">
                {summaryItems.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} × {item.quantity} {item.unit}</span>
                    <span>${currency(item.totalCost)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Costo total</span><span>${currency(quote.costTotal)}</span></div>
              <div className="flex justify-between"><span>Extras</span><span>${currency(Number(extraCosts || 0))}</span></div>
              <div className="flex justify-between"><span>Ganancia ({profitMargin}%)</span><span>${currency(quote.profit)}</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
                <span>Total</span><span>${currency(quote.finalPrice)}</span>
              </div>
              {Number(guests) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Por persona</span><span>${currency(quote.pricePerPerson)}</span>
                </div>
              )}
            </div>

            <Button className="w-full" onClick={handleCreateEvent} disabled={summaryItems.length === 0}>
              <Plus size={16} /> Convertir en evento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
