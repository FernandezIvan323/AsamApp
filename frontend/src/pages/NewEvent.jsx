import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Beef, Calendar, ChevronLeft, ChevronRight, PartyPopper, Save } from 'lucide-react';
import { AlertDialog } from '@/components/feedback/ConfirmDialog';
import EventForm from '@/components/events/EventForm';
import { useInventory } from '@/hooks/useInventory';
import { applyRecipeToForm, applyTemplateToForm } from '@/lib/eventQuote';
import { EMPTY_EVENT_FORM, buildEventPayload } from '@/lib/eventFormUtils';
import { validateEventForm } from '@/lib/validators';
import { createEvent } from '@/services/eventsApi';
import { getRecipes } from '@/services/recipesApi';
import { getQuoteTemplates } from '@/services/quoteTemplatesApi';
import { getClients } from '@/services/clientsApi';

const steps = [
  { num: 1, label: 'Información base', icon: Calendar },
  { num: 2, label: 'Menú e insumos', icon: Beef },
  { num: 3, label: 'Finanzas', icon: PartyPopper },
];

export default function NewEvent() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { items: inventory, isLoading: isInventoryLoading, error: inventoryError, refresh: refreshInventory } = useInventory();

  const [values, setValues] = useState(EMPTY_EVENT_FORM);
  const [clients, setClients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [step, setStep] = useState(1);
  const [touched, setTouched] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');

  const triggerAlert = (title, desc) => {
    setAlertTitle(title);
    setAlertDescription(desc);
    setAlertOpen(true);
  };

  const fieldErrors = useMemo(() => {
    if (!touched.all && !Object.keys(touched).length) return {};
    const all = validateEventForm(values);
    if (touched.all) return all;
    const partial = {};
    for (const k of Object.keys(touched)) {
      if (all[k]) partial[k] = all[k];
    }
    return partial;
  }, [touched, values]);

  useEffect(() => {
    getRecipes().then(data => setRecipes(Array.isArray(data) ? data : [])).catch(() => setRecipes([]));
    getClients().then(data => setClients(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    const recipeId = routerLocation.state?.recipeId;
    if (!recipeId || recipes.length === 0 || inventory.length === 0) return;
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    applyRecipeToForm(recipe, inventory, {
      setRecipeName: (v) => setValues(prev => ({ ...prev, recipeName: v, selectedRecipeId: recipeId })),
      setMenuNotes: (v) => setValues(prev => ({ ...prev, menuNotes: v })),
      setSelectedQuantities: (v) => setValues(prev => ({ ...prev, selectedQuantities: typeof v === 'function' ? v(prev.selectedQuantities) : v })),
      setServings: (v) => setValues(prev => ({ ...prev, adults: v })),
    });
  }, [routerLocation.state?.recipeId, recipes, inventory]);

  useEffect(() => {
    const templateId = routerLocation.state?.templateId;
    if (!templateId || inventory.length === 0) return;
    getQuoteTemplates()
      .then(all => {
        const template = (Array.isArray(all) ? all : []).find(t => t.id === templateId);
        if (!template) return;
        applyTemplateToForm(template, inventory, {
          setRecipeName: (v) => setValues(prev => ({ ...prev, recipeName: v })),
          setMenuNotes: (v) => setValues(prev => ({ ...prev, menuNotes: v })),
          setSelectedQuantities: (v) => setValues(prev => ({ ...prev, selectedQuantities: typeof v === 'function' ? v(prev.selectedQuantities) : v })),
          setExtraCosts: (v) => setValues(prev => ({ ...prev, extraCosts: v })),
          setProfitMargin: (v) => setValues(prev => ({ ...prev, profitMargin: v })),
          setServings: (v) => setValues(prev => ({ ...prev, adults: v })),
        });
      })
      .catch(() => {});
  }, [routerLocation.state?.templateId, inventory]);

  const handleRecipeSelect = (recipeId) => {
    if (!recipeId) {
      setValues(prev => ({ ...prev, selectedRecipeId: '', recipeName: '' }));
      return;
    }
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    applyRecipeToForm(recipe, inventory, {
      setRecipeName: (v) => setValues(prev => ({ ...prev, recipeName: v, selectedRecipeId: recipeId })),
      setMenuNotes: (v) => setValues(prev => ({ ...prev, menuNotes: v })),
      setSelectedQuantities: (v) => setValues(prev => ({ ...prev, selectedQuantities: typeof v === 'function' ? v(prev.selectedQuantities) : v })),
      setServings: (v) => setValues(prev => ({ ...prev, adults: v })),
    });
  };

  const handleSave = () => {
    setTouched({ all: true });
    const errors = validateEventForm(values);
    if (Object.keys(errors).length) {
      triggerAlert('Información requerida', 'Completá el nombre del evento y la fecha.');
      setStep(1);
      return;
    }

    const payload = buildEventPayload(values, inventory, { status: 'Cotizado' });
    setSaveError(null);
    setIsSaving(true);
    createEvent(payload)
      .then((created) => navigate(created?.id ? `/history/${created.id}` : '/history'))
      .catch(err => {
        setSaveError(err);
        triggerAlert('Error de guardado', err.message || 'No se pudo guardar el presupuesto.');
      })
      .finally(() => setIsSaving(false));
  };

  const canGoNext = () => {
    if (step === 1) return Boolean(values.eventName?.trim() && values.eventDate);
    return true;
  };

  const onBlurField = (field) => () => setTouched(prev => ({ ...prev, [field]: true }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-0">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={`flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                step === s.num
                  ? 'border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20'
                  : step > s.num
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-transparent text-muted-foreground'
              }`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-[11px] font-medium uppercase tracking-wider ${
                step === s.num ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-4 mb-6 h-px w-16 sm:w-28 ${step > s.num ? 'bg-primary/50' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <EventForm
        mode="create"
        step={step}
        values={values}
        onChange={setValues}
        fieldErrors={fieldErrors}
        onBlurField={onBlurField}
        clients={clients}
        onClientCreated={c => setClients(prev => [c, ...prev])}
        recipes={recipes}
        inventory={inventory}
        isInventoryLoading={isInventoryLoading}
        inventoryError={inventoryError}
        onRetryInventory={refreshInventory}
        onRecipeSelect={handleRecipeSelect}
        isSaving={isSaving}
        saveError={saveError}
        onSave={handleSave}
      />

      <div className="flex items-center justify-between pt-2">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <ChevronLeft className="size-4" /> Anterior
            </button>
          )}
        </div>
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={!canGoNext()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente <ChevronRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:brightness-110 disabled:opacity-50"
          >
            <Save className="size-4" /> {isSaving ? 'Guardando…' : 'Guardar presupuesto'}
          </button>
        )}
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
