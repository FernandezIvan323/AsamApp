import { describe, expect, it } from 'vitest';
import { getEventRealFinancials, getMonthlyFinance } from './finance.js';

describe('finance', () => {
  it('calcula margen real con compras y cobros', () => {
    const event = {
      totalPrice: 100000,
      extraCosts: 5000,
      profitMargin: 20,
      amountPaid: 80000,
      insumos: [{ totalCost: 40000 }],
      purchases: [{ totalAmount: 35000 }],
    };
    const real = getEventRealFinancials(event);
    expect(real.quotedCost).toBe(45000);
    expect(real.realProfit).toBe(45000);
    expect(real.pending).toBe(20000);
    expect(real.laborCost).toBe(0);
  });

  it('resta mano de obra del margen real', () => {
    const event = {
      totalPrice: 100000,
      extraCosts: 0,
      amountPaid: 100000,
      insumos: [{ totalCost: 40000 }],
      purchases: [{ totalAmount: 30000 }],
      employeeActivities: [{ payment: 15000 }, { payment: 5000 }],
    };
    const real = getEventRealFinancials(event);
    expect(real.laborCost).toBe(20000);
    expect(real.realProfit).toBe(50000);
  });

  it('agrega gastos reales al resumen mensual', () => {
    const events = [{
      date: '2026-05-15',
      status: 'Aprobado',
      totalPrice: 50000,
      extraCosts: 0,
      profitMargin: 0,
      amountPaid: 50000,
      insumos: [{ totalCost: 30000 }],
      purchases: [{ totalAmount: 25000 }],
    }];
    const monthly = getMonthlyFinance(events, 2026);
    const mayo = monthly[4];
    expect(mayo.gastosReales).toBe(25000);
    expect(mayo.gananciaReal).toBe(25000);
  });
});
