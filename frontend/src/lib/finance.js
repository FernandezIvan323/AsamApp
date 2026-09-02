import { getMonth, getYear, parseISO } from 'date-fns';

export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function currency(value) {
  return Number(value || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

export function getEventSubtotal(event) {
  const itemsTotal = event.insumos?.reduce((total, item) => total + Number(item.totalCost || 0), 0) || 0;
  return itemsTotal + Number(event.extraCosts || 0);
}

export function getEventFinancials(event) {
  const final = Number(event.totalPrice || 0);
  const subtotal = getEventSubtotal(event);
  const cost = subtotal || final / (1 + (Number(event.profitMargin || 0) / 100));
  const profit = final - cost;

  return { final, profit, cost };
}

export function getEventPurchaseTotal(event) {
  return (event.purchases || []).reduce((sum, purchase) => sum + Number(purchase.totalAmount || 0), 0);
}

export function getEventLaborCost(event) {
  return (event.employeeActivities || []).reduce((sum, a) => sum + Number(a.payment || 0), 0);
}

export function getEventRealFinancials(event) {
  const quotedCost = getEventSubtotal(event);
  const quotedPrice = Number(event.totalPrice || 0);
  const purchaseTotal = getEventPurchaseTotal(event);
  const laborCost = getEventLaborCost(event);
  const amountPaid = Number(event.amountPaid || 0);
  const quotedProfit = quotedPrice - quotedCost;
  const realCost = purchaseTotal + laborCost;
  const realProfit = amountPaid - realCost;

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
    costVariance: purchaseTotal - quotedCost,
    isClosed: event.status === 'Cobrado',
  };
}

export function getAvailableYears(events, fallbackYear = new Date().getFullYear()) {
  const years = events
    .filter(event => event.date)
    .map(event => getYear(parseISO(event.date)));

  const uniqueYears = [...new Set(years)].sort((a, b) => b - a);

  if (!uniqueYears.includes(fallbackYear)) {
    uniqueYears.unshift(fallbackYear);
  }

  return uniqueYears;
}

export function getYearlyEvents(events, year) {
  return events.filter(event => {
    if (!event.date || event.status === 'Cancelado') return false;
    return getYear(parseISO(event.date)) === year;
  });
}

export function getMonthlyFinance(events, year) {
  const yearlyEvents = getYearlyEvents(events, year);

  return MONTHS.map((name, index) => {
    const monthEvents = yearlyEvents.filter(event => getMonth(parseISO(event.date)) === index);
    const totals = monthEvents.reduce((acc, event) => {
      const financials = getEventFinancials(event);
      const real = getEventRealFinancials(event);
      return {
        ingresos: acc.ingresos + financials.final,
        ganancia: acc.ganancia + financials.profit,
        costos: acc.costos + financials.cost,
        gastosReales: acc.gastosReales + real.purchaseTotal,
        cobrado: acc.cobrado + real.amountPaid,
        gananciaReal: acc.gananciaReal + real.realProfit,
      };
    }, { ingresos: 0, ganancia: 0, costos: 0, gastosReales: 0, cobrado: 0, gananciaReal: 0 });

    return {
      name,
      count: monthEvents.length,
      ...totals,
    };
  });
}

const OPEN_STATUSES = new Set([
  'Cotizado',
  'Pendiente', // legacy
  'Aprobado',
  'Compras pendientes',
  'En preparacion',
  'Realizado',
]);

export function getDashboardSummary(events) {
  return {
    totalEvents: events.length,
    totalGuests: events.reduce((total, event) => total + Number(event.guests || 0), 0),
    pendingEvents: events.filter(event => OPEN_STATUSES.has(event.status) && event.status !== 'Realizado').length,
    closedEvents: events.filter(event => event.status === 'Cobrado').length,
  };
}

/**
 * Gastos sin evento vinculados al año: compras (sin eventId),
 * horas del equipo (sin eventId), y costos fijos prorrateados por mes.
 * Devuelve un array mensual con { name, count, gastos }.
 */
export function getUnassignedMonthlyFinance({
  purchases = [],
  activities = [],
  fixedCosts = [],
  year,
}) {
  return MONTHS.map((name, index) => {
    const monthPurchases = purchases.filter((p) => {
      const d = p.purchasedAt ? new Date(p.purchasedAt) : null;
      return !p.eventId && d && d.getFullYear() === year && d.getMonth() === index;
    });
    const monthActivities = activities.filter((a) => {
      const d = a.date ? new Date(a.date) : null;
      return !a.eventId && d && d.getFullYear() === year && d.getMonth() === index;
    });
    const purchaseTotal = monthPurchases.reduce((s, p) => s + Number(p.totalAmount || 0), 0);
    const laborTotal = monthActivities.reduce((s, a) => s + Number(a.payment || 0), 0);

    const monthlyFixed = fixedCosts.reduce((sum, cost) => {
      const amount = Number(cost.amount || 0);
      if (cost.frequency === 'Mensual') return sum + amount;
      if (cost.frequency === 'Anual') return sum + amount / 12;
      return sum;
    }, 0);

    return {
      name,
      purchaseTotal,
      laborTotal,
      monthlyFixed,
      total: purchaseTotal + laborTotal + monthlyFixed,
      purchaseCount: monthPurchases.length,
      activityCount: monthActivities.length,
    };
  });
}
