export const DEFAULT_SHOPPING_STATUSES = ['Aprobado', 'Compras pendientes'];

export function buildShoppingList(events, statuses = DEFAULT_SHOPPING_STATUSES) {
  const allowed = new Set(statuses);
  const filtered = events.filter(event => allowed.has(event.status));

  const itemMap = new Map();

  for (const event of filtered) {
    for (const insumo of event.insumos || []) {
      const key = `${insumo.name}::${insumo.unit}`;
      const existing = itemMap.get(key) || {
        name: insumo.name,
        unit: insumo.unit,
        quantity: 0,
        eventTitles: [],
      };
      existing.quantity += Number(insumo.quantity || 0);
      if (!existing.eventTitles.includes(event.title)) {
        existing.eventTitles.push(event.title);
      }
      itemMap.set(key, existing);
    }
  }

  const items = [...itemMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));

  return {
    items,
    events: filtered.map(event => ({
      id: event.id,
      title: event.title,
      status: event.status,
      date: event.date,
      client: event.client,
    })),
  };
}

export function getEventFinancialSummary(event) {
  const quotedCost = (event.insumos || []).reduce((sum, item) => sum + Number(item.totalCost || 0), 0)
    + Number(event.extraCosts || 0);
  const quotedPrice = Number(event.totalPrice || 0);
  const purchaseTotal = (event.purchases || []).reduce((sum, purchase) => sum + Number(purchase.totalAmount || 0), 0);
  const laborCost = (event.employeeActivities || []).reduce((sum, a) => sum + Number(a.payment || 0), 0);
  const amountPaid = Number(event.amountPaid || 0);
  const quotedProfit = quotedPrice - quotedCost;
  const realCost = purchaseTotal + laborCost;
  const realProfit = amountPaid - realCost;
  const projectedMargin = quotedPrice > 0 ? ((realProfit / quotedPrice) * 100) : 0;

  return {
    quotedCost,
    quotedPrice,
    quotedProfit,
    purchaseTotal,
    laborCost,
    amountPaid,
    pending: Math.max(0, quotedPrice - amountPaid),
    realProfit,
    realCost,
    projectedMargin,
    costVariance: purchaseTotal - quotedCost,
  };
}
