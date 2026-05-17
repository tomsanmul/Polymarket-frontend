import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SimulatorContext = createContext(null);

const SIM_BASE = '/api/simulator';
const START_BALANCE = 100000;

async function simFetch(path, options = {}) {
  const res = await fetch(`${SIM_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Simulator API HTTP ${res.status}`);
  if (options.method === 'DELETE') return null;
  return res.json();
}

export function SimulatorProvider({ children }) {
  const [state, setState] = useState({
    enabled: false,
    balance: START_BALANCE,
    usedBalance: 0,
    positions: [],
    history: [],
    performanceHistory: [],
    portfolioValue: START_BALANCE,
    totalPnl: 0,
  });

  const fetchState = useCallback(async () => {
    try {
      const data = await simFetch('/state');
      setState(prev => ({
        ...prev,
        enabled: data.enabled ?? false,
        balance: data.balance ?? START_BALANCE,
        usedBalance: data.usedBalance ?? 0,
        positions: data.positions ?? [],
        history: data.history ?? [],
        performanceHistory: data.performanceHistory ?? [],
        portfolioValue: data.portfolioValue ?? data.balance ?? START_BALANCE,
        totalPnl: data.totalPnl ?? 0,
      }));
    } catch {}
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  useEffect(() => {
    if (!state.enabled) return;
    const interval = setInterval(fetchState, 30000);
    return () => clearInterval(interval);
  }, [state.enabled, fetchState]);

  const toggleSimulator = useCallback(async () => {
    try {
      if (state.enabled) {
        await simFetch('/stop', { method: 'POST' });
        setState({
          enabled: false,
          balance: START_BALANCE,
          usedBalance: 0,
          positions: [],
          history: [],
          performanceHistory: [],
          portfolioValue: START_BALANCE,
          totalPnl: 0,
        });
      } else {
        await simFetch('/start', { method: 'POST' });
        await fetchState();
      }
    } catch {}
  }, [state.enabled, fetchState]);

  const addPosition = useCallback(async ({ marketId, marketQuestion, side, amount, entryPrice, outcome }) => {
    try {
      await simFetch('/positions', {
        method: 'POST',
        body: JSON.stringify({ marketId, marketQuestion, side, amount, entryPrice, outcome }),
      });
      await fetchState();
    } catch {}
  }, [fetchState]);

  const closePosition = useCallback(async (positionId) => {
    try {
      await simFetch(`/positions/${positionId}`, { method: 'DELETE' });
      await fetchState();
    } catch {}
  }, [fetchState]);

  return (
    <SimulatorContext.Provider value={{ ...state, toggleSimulator, addPosition, closePosition }}>
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error('useSimulator must be inside SimulatorProvider');
  return ctx;
}
