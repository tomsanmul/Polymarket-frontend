import { useMemo } from 'react';
import { genPriceHistory } from '../../utils/portfolio';

export default function FeaturedChart({ yesPrice, trades }) {
  const data = useMemo(() => {
    if (trades && trades.length > 5) {
      const yesTrades = trades.filter(t => t.outcome === 'Yes').sort((a, b) => a.timestamp - b.timestamp);
      if (yesTrades.length > 3) {
        const pts = 30;
        const step = Math.max(1, Math.floor(yesTrades.length / pts));
        const sampled = [];
        for (let i = 0; i < yesTrades.length; i += step) {
          sampled.push({ label: '', full: '', balance: yesTrades[i].price * 100 });
        }
        if (sampled[sampled.length - 1]?.balance !== yesPrice * 100) {
          sampled.push({ label: '', full: '', balance: yesPrice * 100 });
        }
        return sampled;
      }
    }
    return genPriceHistory(yesPrice, 24).map(d => ({ label: '', full: '', balance: d.yes * 100 }));
  }, [yesPrice, trades]);

  const W = 220, H = 100, PAD = 4;
  const iw = W - PAD * 2, ih = H - PAD * 2;
  const values = data.map(d => d.balance);
  const mn = Math.min(...values) * 0.97;
  const mx = Math.max(...values) * 1.03;
  const rng = mx - mn || 1;

  function x(i) { return PAD + (i / (data.length - 1)) * iw; }
  function y(v) { return PAD + ih - ((v - mn) / rng) * ih; }

  const path = data.map((d, i) => (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(d.balance).toFixed(1)).join('');
  const lastVal = values[values.length - 1];
  const firstVal = values[0];
  const isUp = lastVal >= firstVal;
  const color = isUp ? 'var(--yes)' : 'var(--no)';

  return (
    <div className="featured-chart">
      <div className="fc-label">YES Price</div>
      <div className="fc-legend">
        <span className="fc-legend-item">
          <span className="fc-dot" style={{background: color}} />
          {(lastVal / 100).toFixed(1)}%
        </span>
      </div>
      <svg width="100%" height={H} viewBox={'0 0 ' + W + ' ' + H}>
        <line x1={PAD} y1={y(50)} x2={W - PAD} y2={y(50)} stroke="var(--border)" strokeWidth="1" strokeDasharray="2 2" />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(data.length - 1)} cy={y(lastVal)} r="3" fill={color} />
      </svg>
    </div>
  );
}
