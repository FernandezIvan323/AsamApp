export function findCatalogMatch(inventory, itemName) {
  const needle = itemName.toLowerCase().trim();
  return inventory.find(i => {
    const hay = i.name.toLowerCase();
    return hay === needle || hay.includes(needle) || needle.includes(hay);
  });
}

export function insumosToSelectedQuantities(insumos, inventory) {
  const quantities = {};
  for (const insumo of insumos || []) {
    const catalogItem = findCatalogMatch(inventory, insumo.name);
    if (catalogItem) {
      quantities[catalogItem.id] = Number(insumo.quantity || 0);
    }
  }
  return quantities;
}

export function applyRecipeToForm(recipe, inventory, setters) {
  if (!recipe) return;
  const { setRecipeName, setMenuNotes, setSelectedQuantities, setServings } = setters;
  setRecipeName(recipe.name);
  const itemsList = (recipe.items || []).map(i => i.name).join(', ');
  setMenuNotes([recipe.description, itemsList].filter(Boolean).join(' — '));
  if (recipe.servings > 0 && setServings) {
    setServings(String(recipe.servings));
  }
  const quantities = {};
  for (const item of recipe.items || []) {
    const catalogItem = findCatalogMatch(inventory, item.name);
    if (catalogItem) {
      quantities[catalogItem.id] = item.quantity > 0 ? item.quantity : 1;
    }
  }
  setSelectedQuantities(prev => ({ ...prev, ...quantities }));
}

export function applyTemplateToForm(template, inventory, setters) {
  if (!template) return;
  const {
    setRecipeName,
    setMenuNotes,
    setSelectedQuantities,
    setExtraCosts,
    setProfitMargin,
    setServings,
  } = setters;

  if (setRecipeName) setRecipeName(template.recipeName || '');
  if (setMenuNotes) setMenuNotes(template.menuNotes || template.description || '');
  if (setExtraCosts) setExtraCosts(String(template.extraCosts ?? ''));
  if (setProfitMargin) setProfitMargin(String(template.profitMargin ?? ''));
  if (setServings) setServings(String(template.guests || ''));

  const quantities = {};
  for (const item of template.items || []) {
    const catalogItem = findCatalogMatch(inventory, item.name);
    if (catalogItem) {
      quantities[catalogItem.id] = item.quantity > 0 ? item.quantity : 1;
    }
  }
  setSelectedQuantities(prev => ({ ...prev, ...quantities }));
}
