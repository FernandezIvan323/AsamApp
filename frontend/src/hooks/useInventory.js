import { useCallback, useEffect, useState } from 'react';

import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  updateInventoryItem,
} from '@/services/inventoryApi';

export function useInventory({ loadOnMount = true } = {}) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(loadOnMount);
  const [error, setError] = useState(null);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInventoryItems();
      setItems(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadOnMount) return;

    getInventoryItems()
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [loadOnMount]);

  const addItem = useCallback(async (item) => {
    setError(null);
    const created = await createInventoryItem(item);
    setItems(prev => [created, ...prev]);
    return created;
  }, []);

  const updateItem = useCallback(async (id, item) => {
    setError(null);
    const updated = await updateInventoryItem(id, item);
    setItems(prev => prev.map(current => current.id === id ? updated : current));
    return updated;
  }, []);

  const removeItem = useCallback(async (id) => {
    setError(null);
    const previousItems = items;
    setItems(prev => prev.filter(item => item.id !== id));
    try {
      await deleteInventoryItem(id);
    } catch (err) {
      setItems(previousItems);
      setError(err);
      throw err;
    }
  }, [items]);

  return {
    items,
    isLoading,
    error,
    refresh: loadItems,
    addItem,
    updateItem,
    removeItem,
  };
}
