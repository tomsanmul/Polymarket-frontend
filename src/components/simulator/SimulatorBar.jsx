import { useState, useRef, useEffect } from 'react';
import { useSimulator } from '../../utils/simulator';
import { useNotifications } from '../../utils/notifications';
import { formatCurrency } from '../../utils/helpers';

export default function SimulatorBar({ onOpen }) {
  const { enabled, balance, portfolioValue, totalPnl, positions, toggleSimulator } = useSimulator();
  const { connected } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!enabled) {
    return (
      <div className="sim-bar" ref={ref}>
        <button className="sim-toggle-btn" onClick={toggleSimulator}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Simulator
        </button>
      </div>
    );
  }

  return (
    <div className={'sim-bar' + (open ? ' open' : '')} ref={ref}>
      <div className="ws-indicator" title={connected ? 'Conectado' : 'Desconectado'}>
        <span className={'ws-dot ' + (connected ? 'online' : 'offline')} />
      </div>
      <button className="sim-toggle-btn sim-active" onClick={() => setOpen(!open)}>
        <span className="sim-porftolio-label">Portfolio</span>
        <span className={'sim-porftolio-value' + (totalPnl >= 0 ? ' up' : ' down')}>
          {formatCurrency(portfolioValue)}
        </span>
        <span className={'sim-pnl' + (totalPnl >= 0 ? ' up' : ' down')}>
          {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sim-chevron">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="sim-dropdown">
          <button className="sim-dropdown-item" onClick={() => { setOpen(false); onOpen('portfolio'); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            Cartera
          </button>
          <button className="sim-dropdown-item" onClick={() => { setOpen(false); onOpen('trade'); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            Comercio
          </button>
          <button className="sim-dropdown-item" onClick={() => { setOpen(false); onOpen('research'); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            Investigación
          </button>
          <button className="sim-dropdown-item" onClick={() => { setOpen(false); onOpen('learn'); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            Aprender
          </button>
          <div className="sim-dropdown-divider" />
          <button className="sim-dropdown-item sim-stop" onClick={() => { setOpen(false); toggleSimulator(); }}>
            Parar Simulador
          </button>
        </div>
      )}
    </div>
  );
}
