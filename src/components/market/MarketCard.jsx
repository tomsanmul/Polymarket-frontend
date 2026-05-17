import { useMemo } from 'react';
import { formatCurrency, formatPercent, daysLeft } from '../../utils/helpers';

function genSparkData(yesPrice) {
  const target = Number(yesPrice) || 0.5;
  const pts = 8;
  let cur = 0.5 + (Math.random() - 0.5) * 0.15;
  const step = (target - cur) / pts;
  return Array.from({ length: pts }, (_, i) => {
    cur += step + (Math.random() - 0.5) * 0.025;
    cur = Math.max(0.01, Math.min(0.99, cur));
    return cur;
  });
}

function MiniSpark({ data, isUp }) {
  const W = 60, H = 24, PAD = 1;
  const iw = W - PAD * 2, ih = H - PAD * 2;
  const mn = Math.min(...data) * 0.97;
  const mx = Math.max(...data) * 1.03;
  const rng = mx - mn || 1;
  function x(i) { return PAD + (i / (data.length - 1)) * iw; }
  function y(v) { return PAD + ih - ((v - mn) / rng) * ih; }
  const path = data.map((d, i) => (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(d).toFixed(1)).join('');
  const color = isUp ? 'var(--yes)' : 'var(--no)';

  return (
    <svg width={W} height={H} viewBox={'0 0 ' + W + ' ' + H}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="2" fill={color} />
    </svg>
  );
}

export default function MarketCard({ market, onBet, _t, lang }) {
  const prices = market._prices;
  const yesPrice = Number(prices[0]) || 0.5;
  const noPrice = Number(prices[1]) || 0.5;
  const outcomes = market._outcomes;
  const eventTitle = market.events?.[0]?.title;

  const sparkData = useMemo(() => genSparkData(yesPrice), [yesPrice]);
  const startPrice = sparkData[0];
  const changePct = yesPrice > 0 ? ((yesPrice - startPrice) / startPrice) * 100 : 0;
  const isUp = changePct >= 0;

  return (
    <div className="market-card">
      <div className="market-image-wrap">
        {market.image ? (
          <img src={market.image} alt="" className="market-image" />
        ) : (
          <div className="market-image-placeholder">?</div>
        )}
      </div>
      <div className="market-info">
        {eventTitle && <span className="market-tag">{eventTitle}</span>}
        <h3 className="market-question">{market.question}</h3>
        <div className="market-meta">
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            {formatCurrency(market.volume24hr)} {_t('market.vol')}
          </span>
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {daysLeft(market.endDate, _t, lang)}
          </span>
        </div>
      </div>
      <div className="market-prices">
        <div className="outcome yes">
          <span className="outcome-label">{outcomes[0] || 'YES'}</span>
          <span className="outcome-price">{formatPercent(yesPrice)}</span>
        </div>
        <div className="outcome no">
          <span className="outcome-label">{outcomes[1] || 'NO'}</span>
          <span className="outcome-price">{formatPercent(noPrice)}</span>
        </div>
        <div className="mc-bottom-row">
          <div className="mc-spark-wrap">
            <MiniSpark data={sparkData} isUp={isUp} />
            <span className={'mc-change ' + (isUp ? 'up' : 'down')}>
              {isUp ? '+' : ''}{changePct.toFixed(1)}%
            </span>
          </div>
          <button className="bet-btn" onClick={() => onBet(market)}>{_t('market.bet')}</button>
        </div>
      </div>
    </div>
  );
}
