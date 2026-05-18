import { useState, useMemo } from 'react';
import { formatCurrency, formatPercent } from '../utils/helpers';
import { useSimulator } from '../utils/simulator';

const HOME_CATS = [
  { id: 'sports', icon: '\u26BD', labelKey: 'categories.sports' },
  { id: 'politics', icon: '\u2696', labelKey: 'categories.politics' },
  { id: 'crypto', icon: '\u20BF', labelKey: 'categories.crypto' },
  { id: 'pop', icon: '\u2606', labelKey: 'categories.pop' },
  { id: 'tech', icon: '\u26A1', labelKey: 'categories.tech' },
  { id: 'esports', icon: '\uD83C\uDFAE', labelKey: 'categories.esports' },
];

const PERF_RANGES = [
  { key: '1m', label: '1 Mes', ms: 30 * 24 * 60 * 60 * 1000 },
  { key: '3m', label: '3 Meses', ms: 90 * 24 * 60 * 60 * 1000 },
  { key: '6m', label: '6 Meses', ms: 180 * 24 * 60 * 60 * 1000 },
  { key: '1y', label: '1 A\u00f1o', ms: 365 * 24 * 60 * 60 * 1000 },
  { key: '2y', label: '2 A\u00f1os', ms: 730 * 24 * 60 * 60 * 1000 },
];

function PortfolioChart({ data }) {
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
          <linearGradient id="home-perf-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1={PAD} y1={y(100000)} x2={W - PAD} y2={y(100000)} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
        <path d={path + ' L' + x(filtered.length - 1).toFixed(1) + ',' + (H - PAD) + ' L' + x(0).toFixed(1) + ',' + (H - PAD) + 'Z'} fill="url(#home-perf-grad)" />
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

function PositionCarouselCard({ pos }) {
  const pnl = pos.currentValue - pos.amount;
  const pnlPct = pos.amount > 0 ? (pnl / pos.amount) * 100 : 0;
  const isUp = pnl >= 0;

  return (
    <div className="home-pos-card">
      <div className="hpc-header">
        <span className="hpc-tag">{pos.outcome || pos.side}</span>
        <span className={'hpc-pnl ' + (isUp ? 'up' : 'down')}>
          {isUp ? '+' : ''}{formatCurrency(pnl)}
        </span>
      </div>
      <p className="hpc-question">{pos.marketQuestion}</p>
      <div className="hpc-details">
        <span>Inv: {formatCurrency(pos.amount)}</span>
        <span>Acc: {pos.shares.toLocaleString()}</span>
      </div>
      <div className="hpc-details">
        <span>Entrada: {formatPercent(pos.entryPrice)}</span>
        <span className={isUp ? 'up' : 'down'}>
          {isUp ? '+' : ''}{pnlPct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function HomePage({ markets, onNavigate, onCategorySelect, _t }) {
  const totalVolume = useMemo(() => {
    return markets.reduce((sum, m) => sum + (Number(m.volume24hr) || 0), 0);
  }, [markets]);

  const trending = useMemo(() => {
    return [...markets].sort((a, b) => (b.volume24hr || 0) - (a.volume24hr || 0)).slice(0, 3);
  }, [markets]);

  const { enabled, positions, performanceHistory } = useSimulator();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-logo">
            <svg width="52" height="52" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#6366f1"/>
              <path d="M12 12l8 16 8-16" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="hero-title">Violeta Explorer</h1>
          <p className="hero-subtitle">Plataforma interactiva para explorar y simular inversiones en mercados de predicci&oacute;n descentralizados.</p>
          <button className="hero-cta" onClick={() => onNavigate('markets')}>
            {_t('home.explore')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </section>

      <section className="home-stats">
        <div className="stat-card">
          <span className="hs-label">{_t('home.totalVolume')}</span>
          <span className="hs-value">{formatCurrency(totalVolume)}</span>
        </div>
        <div className="stat-card">
          <span className="hs-label">{_t('home.activeMarkets')}</span>
          <span className="hs-value">{markets.length}</span>
        </div>
        <div className="stat-card">
          <span className="hs-label">{_t('home.categories')}</span>
          <span className="hs-value">{HOME_CATS.length}</span>
        </div>
      </section>

      {enabled && performanceHistory.length > 0 && (
        <section className="home-sim-section">
          <h2 className="section-title">Rendimiento Simulador</h2>
          <PortfolioChart data={performanceHistory} />
        </section>
      )}

      {enabled && positions.length > 0 && (
        <section className="home-positions-section">
          <h2 className="section-title">Mis Posiciones ({positions.length})</h2>
          <div className="home-pos-carousel">
            <div className="home-pos-track">
              {positions.map(pos => (
                <PositionCarouselCard key={pos.id} pos={pos} />
              ))}
            </div>
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section className="home-trending">
          <h2 className="section-title">{_t('home.trending')}</h2>
          <div className="trending-grid">
            {trending.map(m => (
              <div key={m.id || m.conditionId} className="trending-card">
                <div className="tc-image-wrap">
                  {m.image ? <img src={m.image} alt="" /> : <div className="tc-placeholder">?</div>}
                </div>
                <div className="tc-info">
                  {m.events?.[0]?.title && <span className="tc-tag">{m.events[0].title}</span>}
                  <h3 className="tc-question">{m.question}</h3>
                  <div className="tc-prices">
                    <span className="tc-yes">{formatPercent(m._prices[0] || 0.5)}</span>
                    <span className="tc-no">{formatPercent(m._prices[1] || 0.5)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="home-categories">
        <h2 className="section-title">{_t('home.browseBy')}</h2>
        <div className="category-grid">
          {HOME_CATS.map(cat => (
            <button
              key={cat.id}
              className="home-cat-btn"
              onClick={() => { onCategorySelect(cat.id); onNavigate('markets'); }}
            >
              <span className="hcb-icon">{cat.icon}</span>
              <span className="hcb-label">{_t(cat.labelKey)}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
