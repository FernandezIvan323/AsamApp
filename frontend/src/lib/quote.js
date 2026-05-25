export function getSelectedQuoteItems(inventory, selectedQuantities) {
  return inventory
    .filter(item => Number(selectedQuantities[item.id] || 0) > 0)
    .map(item => {
      const quantity = Number(selectedQuantities[item.id]);
      const costPerUnit = Number(item.price);

      return {
        ...item,
        quantity,
        costPerUnit,
        totalCost: quantity * costPerUnit,
      };
    });
}

export function calculateQuote({ items, extraCosts, profitMargin, guests }) {
  const costTotal = items.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0);
  const subtotal = costTotal + Number(extraCosts || 0);
  const profit = subtotal * (Number(profitMargin || 0) / 100);
  const finalPrice = subtotal + profit;
  const pricePerPerson = finalPrice / (Number(guests || 0) || 1);

  return {
    costTotal,
    subtotal,
    profit,
    finalPrice,
    pricePerPerson,
  };
}

export function toEventInsumos(items) {
  return items.map(item => ({
    name: item.name,
    quantity: Number(item.quantity),
    unit: item.unit,
    costPerUnit: Number(item.costPerUnit ?? item.price),
    totalCost: Number(item.totalCost),
  }));
}
