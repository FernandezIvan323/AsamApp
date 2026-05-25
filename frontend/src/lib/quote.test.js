import { describe, expect, it } from 'vitest';
import { calculateQuote, getSelectedQuoteItems, toEventInsumos } from './quote.js';

describe('quote', () => {
  const inventory = [
    { id: '1', name: 'Carne', unit: 'kg', price: 1000 },
    { id: '2', name: 'Carbon', unit: 'bolsa', price: 500 },
  ];

  it('calcula total con margen y costos extra', () => {
    const items = getSelectedQuoteItems(inventory, { 1: 2 });
    const quote = calculateQuote({ items, extraCosts: 1000, profitMargin: 20, guests: 10 });
    expect(quote.costTotal).toBe(2000);
    expect(quote.finalPrice).toBe(3600);
  });

  it('convierte items a formato de evento', () => {
    const items = getSelectedQuoteItems(inventory, { 1: 3 });
    const insumos = toEventInsumos(items);
    expect(insumos[0]).toMatchObject({ name: 'Carne', quantity: 3, totalCost: 3000 });
  });
});
