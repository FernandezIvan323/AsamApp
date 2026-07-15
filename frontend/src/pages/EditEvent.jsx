import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { AlertDialog } from '@/components/feedback/ConfirmDialog';
import { ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { Button } from '@/components/ui/button';
import EventForm from '@/components/events/EventForm';
import { useInventory } from '@/hooks/useInventory';
import { applyRecipeToForm, insumosToSelectedQuantities } from '@/lib/eventQuote';
import { EMPTY_EVENT_FORM, buildEventPayload } from '@/lib/eventFormUtils';
import { validateEventForm } from '@/lib/validators';
import { getEvent, updateEvent } from '@/services/eventsApi';
import { getRecipes } from '@/services/recipesApi';
import { getClients } from '@/services/clientsApi';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items: inventory, isLoading: isInventoryLoading, error: inventoryError, refresh: refreshInventory } = useInventory();

  const [isEventLoading, setIsEventLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [originalStatus, setOriginalStatus] = useState('Cotizado');
  const [values, setValues] = useState(EMPTY_EVENT_FORM);
  const [clients, setClients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [touched, setTouched] = useState({});
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
    setIsEventLoading(true);
    setLoadError(null);
    getEvent(id)
      .then(event => {
        setOriginalStatus(event.status);
        setOriginalPrice(event.totalPrice);
        const adults = event.adults != null || event.kids != null
          ? String(event.adults ?? 0)
          : String(event.guests || '');
        const kids = event.adults != null || event.kids != null
          ? String(event.kids ?? 0)
          : '0';
        setValues({
          ...EMPTY_EVENT_FORM,
          eventName: event.title || '',
          clientName: event.client || '',
          clientId: event.clientRef?.id || event.clientId || '',
          eventDate: event.date || '',
          eventTime: event.time || '',
          location: event.location || '',
          menuNotes: event.menuNotes || '',
          recipeName: event.recipeName || '',
          adults,
          kids,
          profitMargin: String(event.profitMargin ?? ''),
          extraCosts: String(event.extraCosts ?? ''),
          eventStatus: event.status || 'Cotizado',
          selectedQuantities: {},
          selectedRecipeId: '',
        });
        setInitialized(false);
      })
      .catch(setLoadError)
      .finally(() => setIsEventLoading(false));
  }, [id]);

  useEffect(() => {
    if (initialized || isEventLoading || isInventoryLoading || inventory.length === 0) return;
    getEvent(id).then(event => {
      const quantities = insumosToSelectedQuantities(event.insumos, inventory);
      const match = recipes.find(r => r.name === event.recipeName);
      setValues(prev => ({
        ...prev,
        selectedQuantities: quantities,
        selectedRecipeId: match?.id || '',
      }));
      setInitialized(true);
    });
  }, [id, initialized, isEventLoading, isInventoryLoading, inventory, recipes]);

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

  const priceLocked = ['Realizado', 'Cobrado'].includes(originalStatus);

  const handleSave = () => {
    setTouched({ all: true });
    const errors = validateEventForm(values);
    if (Object.keys(errors).length) {
      triggerAlert('Información requerida', 'Nombre del evento y fecha son obligatorios.');
      return;
    }

    const payload = buildEventPayload(values, inventory, {
      status: values.eventStatus,
      totalPrice: priceLocked ? originalPrice : undefined,
    });

    setSaveError(null);
    setIsSaving(true);
    updateEvent(id, payload)
      .then(() => navigate(`/history/${id}`))
      .catch(err => {
        setSaveError(err);
        triggerAlert('Error al guardar', err.message || 'No se pudo actualizar el presupuesto.');
      })
      .finally(() => setIsSaving(false));
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
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" asChild>
          <Link to={`/history/${id}`}><ArrowLeft className="size-4" /> Volver al evento</Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Editar presupuesto</h1>
          <p className="text-sm text-muted-foreground">
            Modificá cantidades, costos y datos. Los pagos registrados se conservan.
          </p>
        </div>
      </div>

      <EventForm
        mode="edit"
        values={values}
        onChange={setValues}
        fieldErrors={fieldErrors}
        onBlurField={(field) => () => setTouched(prev => ({ ...prev, [field]: true }))}
        clients={clients}
        onClientCreated={c => setClients(prev => [c, ...prev])}
        recipes={recipes}
        inventory={inventory}
        isInventoryLoading={isInventoryLoading}
        inventoryError={inventoryError}
        onRetryInventory={refreshInventory}
        onRecipeSelect={handleRecipeSelect}
        showStatus
        statusOptionsFrom={originalStatus}
        isSaving={isSaving}
        saveError={saveError}
        onSave={handleSave}
        priceLocked={priceLocked}
        originalPrice={originalPrice}
      />

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
