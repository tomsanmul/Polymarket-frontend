import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const NotificationContext = createContext(null);
const ALERTS_BASE = '/api/alerts';

async function alertsFetch(path, options = {}) {
  const res = await fetch(`${ALERTS_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Alerts API HTTP ${res.status}`);
  if (options.method === 'DELETE') return null;
  return res.json();
}

export function NotificationProvider({ children, userId = 1 }) {
  const [toasts, setToasts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  const addToast = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, ...notification }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertsFetch(`?userId=${userId}`);
      setAlerts(data ?? []);
    } catch {}
  }, [userId]);

  const createAlert = useCallback(async (alertData) => {
    try {
      await alertsFetch('', {
        method: 'POST',
        body: JSON.stringify({ ...alertData, userId }),
      });
      await fetchAlerts();
    } catch {}
  }, [userId, fetchAlerts]);

  const updateAlert = useCallback(async (id, alertData) => {
    try {
      await alertsFetch(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(alertData),
      });
      await fetchAlerts();
    } catch {}
  }, [fetchAlerts]);

  const deleteAlert = useCallback(async (id) => {
    try {
      await alertsFetch(`/${id}`, { method: 'DELETE' });
      await fetchAlerts();
    } catch {}
  }, [fetchAlerts]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(`ws://${window.location.host}/ws/notifications?userId=${userId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        if (reconnectRef.current) {
          clearTimeout(reconnectRef.current);
          reconnectRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          addToast(notification);
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        reconnectRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [userId, addToast]);

  return (
    <NotificationContext.Provider value={{
      toasts, removeToast, connected,
      alerts, fetchAlerts, createAlert, updateAlert, deleteAlert,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
}
