import { effectiveGuests } from '@/lib/guests';
import { calculateQuote, getSelectedQuoteItems, toEventInsumos } from '@/lib/quote';

export const EMPTY_EVENT_FORM = {
  eventName: '',
  clientName: '',
  clientId: '',
  eventDate: '',
  eventTime: '',
  location: '',
  menuNotes: '',
  recipeName: '',
  selectedRecipeId: '',
  adults: '',
  kids: '',
  profitMargin: '',
  extraCosts: '',
  selectedQuantities: {},
  eventStatus: 'Cotizado',
};

export function buildEventPayload(values, inventory, { status = 'Cotizado', totalPrice } = {}) {
  const guests = effectiveGuests(values.adults, values.kids);
  const summaryItems = getSelectedQuoteItems(inventory, values.selectedQuantities || {});
  const quote = calculateQuote({
    items: summaryItems,
    extraCosts: values.extraCosts,
    profitMargin: values.profitMargin,
    guests,
  });
  return {
    title: values.eventName,
    client: values.clientName,
    clientId: values.clientId || null,
    date: values.eventDate,
    time: values.eventTime,
    location: values.location,
    menuNotes: values.menuNotes,
    recipeName: values.recipeName,
    adults: Number(values.adults) || 0,
    kids: Number(values.kids) || 0,
    guests,
    status,
    totalPrice: totalPrice ?? quote.finalPrice,
    insumos: toEventInsumos(summaryItems),
    extraCosts: Number(values.extraCosts) || 0,
    profitMargin: Number(values.profitMargin) || 0,
  };
}
