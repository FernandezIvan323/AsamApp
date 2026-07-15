import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Minus, Plus, Search, ShoppingCart, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useInventory } from '@/hooks/useInventory';
import { applyRecipeToForm, applyTemplateToForm } from '@/lib/eventQuote';
import { currency } from '@/lib/finance';
import { calculateQuote, getSelectedQuoteItems } from '@/lib/quote';
import { getRecipes } from '@/services/recipesApi';
import { getQuoteTemplates } from '@/services/quoteTemplatesApi';

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
  const [insumoSearch, setInsumoSearch] = useState('');
  const [showAllCatalog, setShowAllCatalog] = useState(false);

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
    setShowAllCatalog(false);
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
    setShowAllCatalog(false);
  };

  const summaryItems = getSelectedQuoteItems(inventory, selectedQuantities);
  const quote = calculateQuote({ items: summaryItems, extraCosts, profitMargin, guests });

  const selectedIds = useMemo(
    () => new Set(Object.keys(selectedQuantities).filter(id => Number(selectedQuantities[id]) > 0)),
    [selectedQuantities],
  );

  const visibleInventory = useMemo(() => {
    const term = insumoSearch.trim().toLowerCase();
    let list = inventory;
    if (!showAllCatalog && selectedIds.size > 0) {
      list = inventory.filter(item => selectedIds.has(item.id));
    }
    if (term) {
      list = list.filter(item => item.name.toLowerCase().includes(term));
    }
    return list;
  }, [inventory, insumoSearch, showAllCatalog, selectedIds]);

  const handleCreateEvent = () => {
    const params = new URLSearchParams({
      guests: guests || '',
      extraCosts: extraCosts || '0',
      profitMargin: profitMargin || '30',
      recipeName: recipeName || '',
      menuNotes: menuNotes || '',
    });
    if (selectedTemplateId) params.set('templateId', selectedTemplateId);
    if (selectedRecipeId) params.set('recipeId', selectedRecipeId);
    navigate(`/new-event?${params}`, {
      state: {
        templateId: selectedTemplateId || undefined,
        recipeId: selectedRecipeId || undefined,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Cotizador rápido</Badge>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Calculá sin crear evento</h1>
        <p className="text-muted-foreground">
          Elegí una plantilla o receta, ajustá invitados y margen, y mirá el precio al instante.
        </p>
      </div>

      {/* Steps hint */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border bg-card px-3 py-1">1. Base</span>
        <span className="rounded-full border border-border bg-card px-3 py-1">2. Parámetros</span>
        <span className="rounded-full border border-border bg-card px-3 py-1">3. Insumos</span>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">4. Total → evento</span>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">1</span>
                <Zap className="size-4 text-primary" />
                ¿Desde qué partís?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Plantilla de cotización" hint="Menú + precios guardados">
                  <Select value={selectedTemplateId} onChange={e => handleTemplateSelect(e.target.value)}>
                    <option value="">Sin plantilla</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </FormField>
                <FormField label="Receta / combo" hint="Combo de menú reutilizable">
                  <Select value={selectedRecipeId} onChange={e => handleRecipeSelect(e.target.value)}>
                    <option value="">Sin receta</option>
                    {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </Select>
                </FormField>
              </div>
              {!selectedRecipeId && !selectedTemplateId && (
                <p className="mt-3 text-xs text-muted-foreground">
                  También podés cargar insumos a mano más abajo (mostrá el catálogo completo).
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">2</span>
                <Calculator className="size-4 text-primary" />
                Parámetros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField label="Invitados">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGuests(v => Math.max(0, Number(v || 0) - 1).toString())}
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      aria-label="Menos invitados"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <Input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={guests}
                      onChange={e => setGuests(e.target.value)}
                      placeholder="30"
                      className="text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setGuests(v => (Number(v || 0) + 1).toString())}
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      aria-label="Más invitados"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </FormField>
                <FormField label="Costos extra ($)" hint="Mozos, traslado…">
                  <Input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={extraCosts}
                    onChange={e => setExtraCosts(e.target.value)}
                    placeholder="0"
                  />
                </FormField>
                <FormField label="Margen (%)" hint="Ganancia sobre costo">
                  <Input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={profitMargin}
                    onChange={e => setProfitMargin(e.target.value)}
                    placeholder="30"
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">3</span>
                  <ShoppingCart className="size-4 text-primary" />
                  Insumos
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAllCatalog(v => !v)}
                >
                  {showAllCatalog || selectedIds.size === 0 ? 'Catálogo completo' : 'Solo seleccionados'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Primero agregá insumos en <strong>Insumos</strong> del menú lateral.
                </p>
              ) : (
                <>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={insumoSearch}
                      onChange={e => setInsumoSearch(e.target.value)}
                      placeholder="Buscar insumo…"
                      className="pl-9"
                    />
                  </div>

                  {selectedIds.size === 0 && !showAllCatalog && (
                    <div className="rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        Elegí una plantilla/receta arriba, o tocá <strong className="text-foreground">Catálogo completo</strong> para cargar cantidades a mano.
                      </p>
                      <Button type="button" className="mt-4" variant="outline" size="sm" onClick={() => setShowAllCatalog(true)}>
                        Ver catálogo
                      </Button>
                    </div>
                  )}

                  {(showAllCatalog || selectedIds.size > 0) && (
                    <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                      {visibleInventory.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              ${currency(item.price)} / {item.unit}
                            </p>
                          </div>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            inputMode="decimal"
                            value={selectedQuantities[item.id] || ''}
                            placeholder="0"
                            onChange={e => setSelectedQuantities(prev => ({
                              ...prev,
                              [item.id]: e.target.value === '' ? '' : Number(e.target.value),
                            }))}
                            className="h-9 w-24 text-center"
                          />
                        </div>
                      ))}
                      {visibleInventory.length === 0 && (
                        <p className="col-span-full text-sm text-muted-foreground">Sin resultados para esa búsqueda.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6">
          <Card className="border-primary/20">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">4</span>
                <Calculator className="size-4 text-primary" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {summaryItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Cuando cargues insumos, acá vas a ver el desglose y el precio final.
                </p>
              ) : (
                <div className="space-y-1.5 text-sm">
                  {summaryItems.slice(0, 6).map(item => (
                    <div key={item.id} className="flex justify-between gap-2">
                      <span className="truncate text-muted-foreground">{item.name} × {item.quantity}</span>
                      <span className="shrink-0 font-medium text-foreground">${currency(item.totalCost)}</span>
                    </div>
                  ))}
                  {summaryItems.length > 6 && (
                    <p className="text-xs text-muted-foreground">+{summaryItems.length - 6} insumos más</p>
                  )}
                </div>
              )}

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Costo insumos</span>
                  <span className="font-semibold text-foreground">${currency(quote.costTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Extras</span>
                  <span className="font-semibold text-foreground">${currency(Number(extraCosts || 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ganancia ({profitMargin || 0}%)</span>
                  <span className="font-semibold text-primary">${currency(quote.profit)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-border pt-3 text-lg font-bold text-foreground">
                  <span>Total sugerido</span>
                  <span className="text-primary">${currency(quote.finalPrice)}</span>
                </div>
                {Number(guests) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Por persona</span>
                    <span className="font-semibold text-foreground">${currency(quote.pricePerPerson)}</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCreateEvent}
                disabled={summaryItems.length === 0}
              >
                <Plus className="size-4" />
                Convertir en presupuesto
              </Button>
              {summaryItems.length === 0 && (
                <p className="text-center text-[11px] text-muted-foreground">
                  Necesitás al menos un insumo con cantidad &gt; 0.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
