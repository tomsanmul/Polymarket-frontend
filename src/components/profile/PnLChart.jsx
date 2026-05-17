import { useMemo } from 'react';
import { genData, smooth } from '../../utils/portfolio';

export default function PnLChart({ data, period, setPeriod }) {
  const W = 340, H = 160, PT = 10, PB = 28, PL = 8, PR = 8;
  const iw = W - PL - PR, ih = H - PT - PB;
  const values = data.map(d => d.balance);
  const firstVal = values[0], lastVal = values[values.length - 1];
  const change = lastVal - firstVal;
  const changePct = (change / (firstVal || 1)) * 100;
  const isUp = change >= 0;
  const mn = Math.min(...values) * 0.97;
  const mx = Math.max(...values) * 1.03;
  const rng = mx - mn || 1;

  function x(i) { return PL + (i / (data.length - 1)) * iw; }
  function y(v) { return PT + ih - ((v - mn) / rng) * ih; }

  const areaId = 'grad-' + period;
  const linePath = smooth(data, x, y);
  const lastX = x(data.length - 1);
  const firstX = x(0);
  const bottomY = H - PB;
  const areaPath = linePath + ' L' + lastX.toFixed(2) + ',' + bottomY.toFixed(2) + ' L' + firstX.toFixed(2) + ',' + bottomY.toFixed(2) + 'Z';

  function handleMouse(e) {
    const rect = e.target.closest('svg').getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let closest = 0, minDist = Infinity;
    data.forEach((d, i) => { const dist = Math.abs(x(i) - mx); if (dist < minDist) { minDist = dist; closest = i; } });
    const el = document.getElementById('chart-tip');
    if (el) {
      const d = data[closest];
      const dChange = closest > 0 ? d.balance - data[closest - 1].balance : 0;
      const isPos = dChange >= 0;
      el.innerHTML = '<div class="tip-date">' + d.full + '</div><div class="tip-val">$' + d.balance.toFixed(0) + '</div><div class="tip-chg ' + (isPos ? 'up' : 'down') + '">' + (isPos ? '+' : '') + '$' + dChange.toFixed(0) + '</div>';
      el.style.left = Math.min(Math.max(x(closest) - 55, 0), W - 110) + 'px';
      el.style.opacity = 1;
    }
  }
  function hideTip() { const el = document.getElementById('chart-tip'); if (el) el.style.opacity = 0; }

  const periods = ['1W', '1M', '1Y'];

  return (
    <div className="chart-section">
      <div className="chart-top">
        <div className="chart-pnl-display">
          <span className="chart-pnl-label">P&amp;L</span>
          <span className={'chart-pnl-val ' + (isUp ? 'up' : 'down')}>
            {isUp ? '+' : ''}${Math.abs(change).toFixed(0)}
            <span className="chart-pnl-pct">{(changePct >= 0 ? '+' : '') + changePct.toFixed(1) + '%'}</span>
          </span>
        </div>
        <div className="chart-periods">
          {periods.map(p => (
            <button key={p} className={'period-btn' + (period === p ? ' active' : '')} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>
      <div className="chart-wrap">
        <svg width="100%" height={H} viewBox={'0 0 ' + W + ' ' + H} onMouseMove={handleMouse} onMouseLeave={hideTip} style={{ display: 'block' }}>
          <defs>
            <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity="0.2" />
              <stop offset="100%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line x1={PL} y1={y(mn + rng * 0.5)} x2={W - PR} y2={y(mn + rng * 0.5)} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
          <path d={areaPath} fill={'url(#' + areaId + ')'} />
          <path d={linePath} fill="none" stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={x(data.length - 1)} cy={y(lastVal)} r="4" fill={isUp ? '#22c55e' : '#ef4444'} stroke="var(--bg-card)" strokeWidth="2.5" />
        </svg>
        <div id="chart-tip" className="chart-tip" />
      </div>
    </div>
  );
}
