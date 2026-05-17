import { useEffect } from 'react';
import { useState, useMemo } from 'react';
import { useSimulator } from '../../utils/simulator';
import { formatCurrency, formatPercent } from '../../utils/helpers';
import ResearchPrices from './ResearchPrices';
import StockScreener from './StockScreener';

const TABS = ['portfolio', 'trade', 'research', 'learn'];

const TAB_LABELS = {
  portfolio: 'Cartera',
  trade: 'Comercio',
  research: 'Investigaci\u00f3n',
  learn: 'Aprender',
};

const PERF_RANGES = [
  { key: '1m', label: '1 Mes', ms: 30 * 24 * 60 * 60 * 1000 },
  { key: '3m', label: '3 Meses', ms: 90 * 24 * 60 * 60 * 1000 },
  { key: '6m', label: '6 Meses', ms: 180 * 24 * 60 * 60 * 1000 },
  { key: '1y', label: '1 A\u00f1o', ms: 365 * 24 * 60 * 60 * 1000 },
  { key: '2y', label: '2 A\u00f1os', ms: 730 * 24 * 60 * 60 * 1000 },
];

function PerformanceChart({ data }) {
  const [range, setRange] = useState('1m');

  const filtered = useMemo(() => {
    if (!data || data.length === 0) return [];
    const rangeMs = PERF_RANGES.find(r => r.key === range).ms;
    const cutoff = Date.now() - rangeMs;
    const within = data.filter(d => d.timestamp >= cutoff);
    if (within.length < 2) {
      const last = data[data.length - 1];
      return [data[0], last];
    }
    return within;
  }, [data, range]);

  if (!filtered || filtered.length < 2) {
    return <div className="sim-chart-empty">No hay datos de rendimiento disponibles a&uacute;n.</div>;
  }

  const W = 700, H = 220, PAD = 8;
  const iw = W - PAD * 2, ih = H - PAD * 2;
  const values = filtered.map(d => d.value);
  const mn = Math.min(...values) * 0.98;
  const mx = Math.max(...values) * 1.02;
  const rng = mx - mn || 1;

  function x(i) { return PAD + (i / (filtered.length - 1)) * iw; }
  function y(v) { return PAD + ih - ((v - mn) / rng) * ih; }

  const firstVal = values[0];
  const lastVal = values[values.length - 1];
  const isUp = lastVal >= firstVal;
  const color = isUp ? 'var(--yes)' : 'var(--no)';
  const path = values.map((v, i) => (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(v).toFixed(1)).join('');

  return (
    <div className="sim-chart">
      <div className="sim-chart-header">
        <span className="sim-chart-label">Rendimiento de Cartera</span>
        <span className={'sim-chart-change ' + (isUp ? 'up' : 'down')}>
          {isUp ? '+' : ''}{((lastVal - firstVal) / firstVal * 100).toFixed(1)}%
        </span>
      </div>
      <div className="sim-chart-ranges">
        {PERF_RANGES.map(r => (
          <button key={r.key} className={'range-btn' + (range === r.key ? ' active' : '')} onClick={() => setRange(r.key)}>
            {r.label}
          </button>
        ))}
      </div>
      <svg width="100%" height={H} viewBox={'0 0 ' + W + ' ' + H}>
        <defs>
          <linearGradient id="perf-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1={PAD} y1={y(100000)} x2={W - PAD} y2={y(100000)} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
        <path d={path + ' L' + x(filtered.length - 1).toFixed(1) + ',' + (H - PAD) + ' L' + x(0).toFixed(1) + ',' + (H - PAD) + 'Z'} fill="url(#perf-grad)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(filtered.length - 1)} cy={y(lastVal)} r="4" fill={color} stroke="var(--bg-card)" strokeWidth="2" />
        <text x={PAD + 4} y={y(100000) - 4} fill="var(--text-muted)" fontSize="10">{formatCurrency(100000)}</text>
      </svg>
      <div className="sim-chart-stats">
        <span>Inicio: {formatCurrency(firstVal)}</span>
        <span>Actual: {formatCurrency(lastVal)}</span>
        <span>M&aacute;ximo: {formatCurrency(Math.max(...values))}</span>
        <span>M&iacute;nimo: {formatCurrency(Math.min(...values))}</span>
      </div>
    </div>
  );
}

function PortfolioTab() {
  const { balance, usedBalance, portfolioValue, totalPnl, positions, history, closePosition, performanceHistory } = useSimulator();

  const openPositionsValue = useMemo(() => {
    return portfolioValue - balance;
  }, [portfolioValue, balance]);

  return (
    <div className="sim-tab-content">
      <div className="sim-summary-cards">
        <div className="sim-card">
          <span className="sim-card-label">Valor Cartera</span>
          <span className={'sim-card-value' + (totalPnl >= 0 ? ' up' : ' down')}>{formatCurrency(portfolioValue)}</span>
        </div>
        <div className="sim-card">
          <span className="sim-card-label">Disponible</span>
          <span className="sim-card-value">{formatCurrency(balance)}</span>
        </div>
        <div className="sim-card">
          <span className="sim-card-label">Invertido</span>
          <span className="sim-card-value">{formatCurrency(usedBalance)}</span>
        </div>
        <div className="sim-card">
          <span className="sim-card-label">Ganancia / P\u00e9rdida</span>
          <span className={'sim-card-value' + (totalPnl >= 0 ? ' up' : ' down')}>
            {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
            <span className="sim-card-sub"> ({(totalPnl / 100000 * 100).toFixed(1)}%)</span>
          </span>
        </div>
      </div>

      <PerformanceChart data={performanceHistory} />

      <h3 className="sim-section-title">Posiciones Abiertas ({positions.length})</h3>
      {positions.length === 0 ? (
        <div className="sim-empty">No tienes posiciones abiertas. Ve a la pesta\u00f1a de Comercio para apostar.</div>
      ) : (
        <div className="sim-positions-table">
          <div className="sim-positions-header">
            <span>Mercado</span>
            <span>Lado</span>
            <span>Invertido</span>
            <span>Acciones</span>
            <span>Entrada</span>
            <span>Actual</span>
            <span>Valor</span>
            <span>P&L</span>
            <span></span>
          </div>
          {positions.map(pos => (
            <PositionsRow key={pos.id} pos={pos} onClose={closePosition} />
          ))}
        </div>
      )}

      {history.length > 0 && (
        <>
          <h3 className="sim-section-title">Historial ({history.length})</h3>
          <div className="sim-positions-table">
            <div className="sim-positions-header">
              <span>Mercado</span>
              <span>Lado</span>
              <span>Invertido</span>
              <span>Entrada</span>
              <span>Cierre</span>
              <span>P&L</span>
              <span>Cerrado</span>
            </div>
            {history.map(h => (
              <div key={h.id} className="sim-positions-row">
                <span className="sim-pos-question">{h.marketQuestion}</span>
                <span className={'sim-pos-side ' + h.side.toLowerCase()}>{h.outcome || h.side}</span>
                <span>{formatCurrency(h.amount)}</span>
                <span>{formatPercent(h.entryPrice)}</span>
                <span>{formatPercent(h.closePrice)}</span>
                <span className={h.pnl >= 0 ? 'up' : 'down'}>{h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}</span>
                <span className="sim-pos-time">{new Date(h.closeTime).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PositionsRow({ pos, onClose }) {
  return (
    <div className="sim-positions-row">
      <span className="sim-pos-question">{pos.marketQuestion}</span>
      <span className={'sim-pos-side ' + pos.side.toLowerCase()}>{pos.outcome || pos.side}</span>
      <span>{formatCurrency(pos.amount)}</span>
      <span title={'Shares: ' + pos.shares}>{pos.shares.toLocaleString()}</span>
      <span>{formatPercent(pos.entryPrice)}</span>
      <PositionPriceCell pos={pos} />
      <PositionValueCell pos={pos} />
      <PositionPnLCell pos={pos} />
      <span><button className="sim-close-btn" onClick={() => onClose(pos.id)}>Cerrar</button></span>
    </div>
  );
}

function PositionPriceCell({ pos }) {
  const { portfolioValue, balance } = useSimulator();
  const price = (portfolioValue - balance) > 0 ? (portfolioValue - balance) / pos.shares : pos.entryPrice;
  return <span>{formatPercent(price)}</span>;
}

function PositionValueCell({ pos }) {
  const { portfolioValue, balance } = useSimulator();
  const currentValue = pos.shares * ((portfolioValue - balance) > 0 ? (portfolioValue - balance) / pos.shares : pos.entryPrice);
  return <span>{formatCurrency(currentValue)}</span>;
}

function PositionPnLCell({ pos }) {
  const { portfolioValue, balance } = useSimulator();
  const price = (portfolioValue - balance) > 0 ? (portfolioValue - balance) / pos.shares : pos.entryPrice;
  const currentValue = pos.shares * price;
  const pnl = currentValue - pos.amount;
  return <span className={pnl >= 0 ? 'up' : 'down'}>{pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}</span>;
}

function TradeTab() {
  return (
    <div className="sim-tab-content">
      <div className="sim-empty">
        <h3>Comercio de Mercados</h3>
        <p>Navega por los mercados desde la secci&oacute;n de Mercados y haz clic en "Bet" para abrir una posici&oacute;n. El simulador registrar&aacute; autom&aacute;ticamente tus apuestas como posiciones.</p>
        <p style={{marginTop:12,fontSize:13,color:'var(--text-muted)'}}>Las posiciones se actualizan en tiempo real seg&uacute;n los precios del mercado.</p>
      </div>
      <StockScreener />
    </div>
  );
}

function ResearchTab() {
  return (
    <div className="sim-tab-content">
      <ResearchPrices />
    </div>
  );
}

function LearnTab() {
  return (
    <div className="sim-tab-content">
      <div className="sim-empty">
        <h3>Aprende a Operar</h3>
        <div className="sim-learn-grid">
          <div className="sim-learn-card">
            <h4>Qu&eacute; son los Mercados de Predicci&oacute;n</h4>
            <p>Los mercados de predicci&oacute;n permiten apostar sobre el resultado de eventos futuros. Los precios reflejan la probabilidad estimada del evento.</p>
          </div>
          <div className="sim-learn-card">
            <h4>C&oacute;mo Funcionan las Apuestas</h4>
            <p>Compras acciones de "S&iacute;" o "No". Si aciertas, cada acci&oacute;n vale 1 USDC al resolverse. El precio de entrada determina tu beneficio potencial.</p>
          </div>
          <div className="sim-learn-card">
            <h4>Gesti&oacute;n de Riesgo</h4>
            <p>Diversifica tus apuestas en diferentes categor&iacute;as. No inviertas m&aacute;s del 5-10% de tu cartera en una sola posici&oacute;n.</p>
          </div>
          <div className="sim-learn-card">
            <h4>Usando el Simulador</h4>
            <p>Empieza con 100.000 EUR virtuales. Abre posiciones desde los mercados reales y sigue tu rendimiento en la pesta&ntilde;a de Cartera.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimulatorPage({ onClose }) {
  const [tab, setTab] = useState('portfolio');
  const { enabled, toggleSimulator } = useSimulator();

  if (!enabled) {
    return (
      <div className="sim-page">
        <div className="sim-page-header">
          <h2>Simulador de Trading</h2>
          <button className="sim-start-btn" onClick={toggleSimulator}>
            Iniciar Simulador
          </button>
          <button className="modal-close" onClick={onClose}>&#10005;</button>
        </div>
        <div className="sim-empty" style={{minHeight:300}}>
          <p>Haz clic en "Iniciar Simulador" para comenzar con 100.000 EUR virtuales y practicar tus estrategias de trading sin riesgo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sim-page">
      <div className="sim-page-header">
        <h2>Simulador de Trading</h2>
        <div className="sim-tabs">
          {TABS.map(t => (
            <button key={t} className={'sim-tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
        <button className="modal-close" onClick={onClose}>&#10005;</button>
      </div>
      {tab === 'portfolio' && <PortfolioTab />}
      {tab === 'trade' && <TradeTab />}
      {tab === 'research' && <ResearchTab />}
      {tab === 'learn' && <LearnTab />}
    </div>
  );
}
