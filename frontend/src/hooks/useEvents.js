import { useCallback, useEffect, useState } from 'react';

import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEventStatus,
} from '@/services/eventsApi';

export function useEvents({ loadOnMount = true } = {}) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(loadOnMount);
  const [error, setError] = useState(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
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

    getEvents()
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [loadOnMount]);

  const addEvent = useCallback(async (event) => {
    setError(null);
    const created = await createEvent(event);
    setEvents(prev => [created, ...prev]);
    return created;
  }, []);

  const setEventStatus = useCallback(async (id, status) => {
    setError(null);
    const previousEvents = events;
    setEvents(prev => prev.map(event => event.id === id ? { ...event, status } : event));
    try {
      const updated = await updateEventStatus(id, status);
      setEvents(prev => prev.map(event => event.id === id ? updated : event));
      return updated;
    } catch (err) {
      setEvents(previousEvents);
      setError(err);
      throw err;
    }
  }, [events]);

  const removeEvent = useCallback(async (id) => {
    setError(null);
    const previousEvents = events;
    setEvents(prev => prev.filter(event => event.id !== id));
    try {
      await deleteEvent(id);
    } catch (err) {
      setEvents(previousEvents);
      setError(err);
      throw err;
    }
  }, [events]);

  return {
    events,
    isLoading,
    error,
    refresh: loadEvents,
    addEvent,
    setEventStatus,
    removeEvent,
  };
}
