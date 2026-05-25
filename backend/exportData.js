function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function eventsToCsv(events) {
  const headers = ['id', 'title', 'client', 'date', 'time', 'status', 'guests', 'totalPrice', 'amountPaid', 'extraCosts', 'profitMargin'];
  const rows = events.map(event => [
    event.id,
    event.title,
    event.client,
    event.date,
    event.time,
    event.status,
    event.guests,
    event.totalPrice,
    event.amountPaid,
    event.extraCosts,
    event.profitMargin,
  ].map(escapeCsv).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function purchasesToCsv(purchases) {
  const headers = ['id', 'purchasedAt', 'store', 'eventId', 'paymentMethod', 'totalAmount', 'notes'];
  const rows = purchases.map(p => [
    p.id,
    p.purchasedAt,
    p.store,
    p.eventId,
    p.paymentMethod,
    p.totalAmount,
    p.notes,
  ].map(escapeCsv).join(','));
  return [headers.join(','), ...rows].join('\n');
}
