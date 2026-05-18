import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BASE } from './api';

const SimulatorContext = createContext(null);

const SIM_BASE = BASE + '/simulator';
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
    console.log('Fetching simulator state');

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

      console.log('Simulator state updated', data);
    } catch {
      console.log('Failed to fetch simulator state');
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  useEffect(() => {
    if (!state.enabled) return;
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [state.enabled, fetchState]);

  const toggleSimulator = useCallback(async () => {
    console.log(state.enabled ? 'Stopping' : 'Starting', 'simulator');
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
        console.log('Simulator stopped');
      } else {
        await simFetch('/start', { method: 'POST' });
        await fetchState();
        console.log('Simulator started');
      }
    } catch {
      console.log('Failed to toggle simulator');
    }
  }, [state.enabled, fetchState]);

  const addPosition = useCallback(async ({ marketId, marketQuestion, side, amount, entryPrice, outcome }) => {
    try {
      console.log('Adding position', { marketId, side, amount, entryPrice, outcome });

      await simFetch('/positions', {
        method: 'POST',
        body: JSON.stringify({ marketId, marketQuestion, side, amount, entryPrice, outcome }),
      });
      await fetchState();
    } catch {
      console.log('Failed to add position');
    }
  }, [fetchState]);

  const closePosition = useCallback(async (positionId) => {
    console.log('Closing position', positionId);

    try {
      await simFetch(`/positions/${positionId}`, { method: 'DELETE' });
      await fetchState();
    } catch {
      console.log('Failed to close position');
    }
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
