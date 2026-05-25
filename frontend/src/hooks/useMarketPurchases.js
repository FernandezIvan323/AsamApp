import { useCallback, useEffect, useState } from 'react';

import {
  createMarketPurchase,
  deleteMarketPurchase,
  getMarketPurchases,
  updateMarketPurchase,
} from '@/services/marketPurchasesApi';

export function useMarketPurchases({ start, end } = {}) {
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMarketPurchases({ start, end });
      setPurchases(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    loadPurchases().catch(() => {});
  }, [loadPurchases]);

  const addPurchase = useCallback(async (purchase) => {
    setError(null);
    const created = await createMarketPurchase(purchase);
    setPurchases(prev => [created, ...prev].sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt)));
    return created;
  }, []);

  const editPurchase = useCallback(async (id, purchase) => {
    setError(null);
    const updated = await updateMarketPurchase(id, purchase);
    setPurchases(prev => prev
      .map(current => current.id === id ? updated : current)
      .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt)));
    return updated;
  }, []);

  const removePurchase = useCallback(async (id) => {
    setError(null);
    const previousPurchases = purchases;
    setPurchases(prev => prev.filter(purchase => purchase.id !== id));
    try {
      await deleteMarketPurchase(id);
    } catch (err) {
      setPurchases(previousPurchases);
      setError(err);
      throw err;
    }
  }, [purchases]);

  return {
    purchases,
    isLoading,
    error,
    refresh: loadPurchases,
    addPurchase,
    editPurchase,
    removePurchase,
  };
}
