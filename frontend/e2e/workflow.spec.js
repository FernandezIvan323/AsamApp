import { test, expect } from '@playwright/test';
import { createAuthedApiContext } from './authHelper.js';

/**
 * Flujo feliz de negocio vía API (con auth):
 * Cotizado → Aprobado → Compras pendientes → En preparacion → Realizado → Cobrado
 * + adults/kids y rechazo de transición ilegal.
 */
test.describe('Workflow de evento', () => {
  test('flujo feliz de estados + adults/kids + transición ilegal 400', async () => {
    const ctx = await createAuthedApiContext();

    const create = await ctx.post('/api/events', {
      data: {
        title: 'E2E Workflow Asado',
        client: 'Cliente Flujo',
        date: '2026-12-15',
        time: '13:00',
        adults: 20,
        kids: 4,
        status: 'Cotizado',
        extraCosts: 1000,
        profitMargin: 30,
        insumos: [
          { name: 'Carne', quantity: 10, unit: 'kg', costPerUnit: 5000, totalCost: 50000 },
        ],
      },
    });
    expect(create.status()).toBe(201);
    const event = await create.json();
    expect(event.status).toBe('Cotizado');
    expect(event.guests).toBe(22);
    expect(event.adults).toBe(20);
    expect(event.kids).toBe(4);

    const illegal = await ctx.put(`/api/events/${event.id}`, {
      data: { status: 'Cobrado' },
    });
    expect(illegal.status()).toBe(400);
    const illegalBody = await illegal.json();
    expect(String(illegalBody.error || '')).toMatch(/no permitida|Transición/i);

    const path = [
      'Aprobado',
      'Compras pendientes',
      'En preparacion',
      'Realizado',
      'Cobrado',
    ];

    let current = event;
    for (const next of path) {
      const res = await ctx.put(`/api/events/${current.id}`, {
        data: { status: next },
      });
      expect(res.status(), `falló al pasar a ${next}`).toBe(200);
      current = await res.json();
      expect(current.status).toBe(next);
    }

    const stuck = await ctx.put(`/api/events/${current.id}`, {
      data: { status: 'Aprobado' },
    });
    expect(stuck.status()).toBe(400);

    await ctx.delete(`/api/events/${current.id}`);
    await ctx.dispose();
  });

  test('pago y compra con eventId alimentan financials', async () => {
    const ctx = await createAuthedApiContext();

    const create = await ctx.post('/api/events', {
      data: {
        title: 'E2E Finanzas',
        date: '2026-11-01',
        adults: 10,
        kids: 0,
        status: 'Cotizado',
        profitMargin: 0,
        extraCosts: 0,
        insumos: [
          { name: 'Carne', quantity: 5, unit: 'kg', costPerUnit: 2000, totalCost: 10000 },
        ],
      },
    });
    expect(create.status()).toBe(201);
    const event = await create.json();
    const eventId = event.id;

    const toApproved = await ctx.put(`/api/events/${eventId}`, { data: { status: 'Aprobado' } });
    expect(toApproved.status()).toBe(200);

    const pay = await ctx.post(`/api/events/${eventId}/payments`, {
      data: { amount: 5000, paymentMethod: 'Efectivo', notes: 'Seña E2E' },
    });
    expect(pay.status()).toBe(201);

    const purchase = await ctx.post('/api/market-purchases', {
      data: {
        store: 'Carnicería E2E',
        paymentMethod: 'Efectivo',
        eventId,
        items: [
          { name: 'Carne', quantity: 5, unit: 'kg', unitPrice: 1800 },
        ],
      },
    });
    expect(purchase.status()).toBe(201);

    const fin = await ctx.get(`/api/events/${eventId}/financials`);
    expect(fin.ok()).toBeTruthy();
    const summary = await fin.json();
    expect(summary.amountPaid).toBeGreaterThanOrEqual(5000);
    expect(summary.purchaseTotal).toBeGreaterThanOrEqual(9000);
    expect(summary.laborCost).toBeDefined();

    await ctx.delete(`/api/events/${eventId}`);
    await ctx.dispose();
  });
});
