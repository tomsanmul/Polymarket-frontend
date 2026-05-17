import { useState, useEffect, useMemo } from 'react';
import { formatPercent } from '../../utils/helpers';
import { fetchTrades } from '../../utils/api';
import { useSimulator } from '../../utils/simulator';

const RANGES = [
  { key: '30m', label: '30m', ms: 30 * 60 * 1000 },
  { key: '1h', label: '1h', ms: 60 * 60 * 1000 },
  { key: '24h', label: '24H', ms: 24 * 60 * 60 * 1000 },
  { key: '7d', label: '7D', ms: 7 * 24 * 60 * 60 * 1000 },
  { key: 'all', label: 'All', ms: Infinity },
];

function ModalChart({ yesPrice, trades, loading }) {
  const [range, setRange] = useState('24h');

  const data = useMemo(() => {
    if (!trades || trades.length === 0) return null;
    const rangeMs = RANGES.find(r => r.key === range).ms;
    const now = Date.now();
    const yesTrades = trades
      .filter(t => t.outcome === 'Yes' && (range === 'all' || (now - t.timestamp * 1000) <= rangeMs))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (yesTrades.length < 2) return null;

    const pts = 50;
    const step = Math.max(1, Math.floor(yesTrades.length / pts));
    const sampled = [];
    for (let i = 0; i < yesTrades.length; i += step) {
      sampled.push({ price: yesTrades[i].price * 100, ts: yesTrades[i].timestamp });
    }
    const last = yesTrades[yesTrades.length - 1];
    if (sampled.length && sampled[sampled.length - 1].price !== yesPrice * 100) {
      sampled.push({ price: yesPrice * 100, ts: last.timestamp });
    }
    return sampled;
  }, [yesPrice, trades, range]);

  const W = 400, H = 160, PAD = 8;
  const iw = W - PAD * 2, ih = H - PAD * 2;
  const mn = data ? Math.min(...data.map(d => d.price)) * 0.96 : 48;
  const mx = data ? Math.max(...data.map(d => d.price)) * 1.04 : 52;
  const rng = mx - mn || 1;

  function x(i) { return PAD + (i / ((data?.length || 1) - 1)) * iw; }
  function y(v) { return PAD + ih - ((v - mn) / rng) * ih; }

  const lastVal = data ? data[data.length - 1].price : 50;
  const firstVal = data ? data[0].price : 50;
  const isUp = lastVal >= firstVal;
  const color = isUp ? 'var(--yes)' : 'var(--no)';

  return (
    <div className="modal-chart">
      <div className="modal-chart-header">
        <span className="modal-chart-label">YES Price History</span>
        <div className="modal-chart-ranges">
          {RANGES.map(r => (
            <button key={r.key} className={'range-btn' + (range === r.key ? ' active' : '')} onClick={() => setRange(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
        <span className={'modal-chart-change ' + (isUp ? 'up' : 'down')}>
          {isUp ? '+' : ''}{(lastVal - firstVal).toFixed(1)}%
        </span>
      </div>
      {loading ? (
        <div className="modal-chart-loading">Loading chart data…</div>
      ) : data ? (
        <>
          <svg width="100%" height={H} viewBox={'0 0 ' + W + ' ' + H}>
            <defs>
              <linearGradient id="modal-chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <line x1={PAD} y1={y(50)} x2={W - PAD} y2={y(50)} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
            <path d={data.map((d, i) => (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(d.price).toFixed(1)).join('') + ' L' + x(data.length - 1).toFixed(1) + ',' + (H - PAD) + ' L' + x(0).toFixed(1) + ',' + (H - PAD) + 'Z'} fill="url(#modal-chart-grad)" />
            <path d={data.map((d, i) => (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(d.price).toFixed(1)).join('')} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={x(data.length - 1)} cy={y(lastVal)} r="4" fill={color} stroke="var(--bg-card)" strokeWidth="2" />
          </svg>
          <div className="modal-chart-prices">
            <span>Low: {(mn / 100).toFixed(1)}%</span>
            <span>Current: {(lastVal / 100).toFixed(1)}%</span>
            <span>High: {(mx / 100).toFixed(1)}%</span>
          </div>
        </>
      ) : (
        <div className="modal-chart-loading">No trade data for this range.</div>
      )}
    </div>
  );
}

export default function BetModal({ market, onClose, _t, lang }) {
  const [side, setSide] = useState('YES');
  const [amount, setAmount] = useState('');
  const [placed, setPlaced] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [trades, setTrades] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);
  const { enabled, addPosition } = useSimulator();

  useEffect(() => {
    if (market) {
      setChartLoading(true);
      setTrades(null);
      fetchTrades(market.id, { limit: 200 }).then(data => {
        setTrades(data.trades);
      }).catch(() => {}).finally(() => {
        setChartLoading(false);
      });
    }
  }, [market]);

  if (!market) return null;

  const prices = market._prices;
  const price = side === 'YES' ? Number(prices[0]) || 0.5 : Number(prices[1]) || 0.5;
  const outcomes = market._outcomes;
  const outcomeLabel = side === 'YES' ? (outcomes[0] || 'YES') : (outcomes[1] || 'NO');

  function handlePlace() {
    const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setTxHash(hash);
    setPlaced(true);
    if (enabled) {
      addPosition({
        marketId: market.id,
        marketQuestion: market.question,
        side,
        amount: Number(amount),
        entryPrice: price,
        outcome: outcomeLabel,
      });
    }
  }

  function resetAndClose() {
    setSide('YES');
    setAmount('');
    setPlaced(false);
    setTxHash('');
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div className="modal modal-bet" onClick={e => e.stopPropagation()}>
        {!placed ? (
          <div className="modal-bet-layout">
            <div className="modal-bet-chart">
              <ModalChart yesPrice={Number(prices[0]) || 0.5} trades={trades} loading={chartLoading} />
            </div>
            <div className="modal-bet-form">
              <div className="modal-header">
                <h2>{_t('modal.placeBet')}</h2>
                <button className="modal-close" onClick={resetAndClose}>&#10005;</button>
              </div>
              <p className="modal-question">{market.question}</p>
              <div className="side-toggle">
                <button className={'side-btn yes' + (side === 'YES' ? ' active' : '')} onClick={() => setSide('YES')}>
                  {outcomes[0] || 'YES'}
                </button>
                <button className={'side-btn no' + (side === 'NO' ? ' active' : '')} onClick={() => setSide('NO')}>
                  {outcomes[1] || 'NO'}
                </button>
              </div>
              <div className="price-info">
                {_t('modal.pricePerShare')} <strong>{formatPercent(price)}</strong>
              </div>
              <input
                className="amount-input"
                type="number"
                placeholder={_t('modal.amount')}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
              />
              {amount > 0 && (
                <div className="shares-preview">
                  {_t('modal.sharesPreview', { n: Math.floor(Number(amount) / price), label: outcomeLabel })}
                  {amount >= 10 && <div className="bonus-tag">{_t('modal.bonus')}</div>}
                </div>
              )}
              <button className="place-btn" onClick={handlePlace} disabled={!amount || amount <= 0}>
                {_t('modal.placeOrder')}
              </button>
              <p className="modal-disclaimer">{_t('modal.disclaimer')}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>{_t('modal.submitted')}</h2>
              <button className="modal-close" onClick={resetAndClose}>&#10005;</button>
            </div>
            <div className="receipt">
              <div className="receipt-row">
                <span>{_t('modal.market')}</span>
                <span>{market.question}</span>
              </div>
              <div className="receipt-row">
                <span>{_t('modal.side')}</span>
                <span className={'side-color ' + side.toLowerCase()}>{outcomeLabel}</span>
              </div>
              <div className="receipt-row">
                <span>{_t('modal.amount')}</span>
                <span>{Number(amount).toFixed(2)} USDC</span>
              </div>
              <div className="receipt-row">
                <span>{_t('modal.avgPrice')}</span>
                <span>{formatPercent(price)}</span>
              </div>
              <div className="receipt-row">
                <span>{_t('modal.shares')}</span>
                <span>~{Math.floor(Number(amount) / price)}</span>
              </div>
              <div className="receipt-row">
                <span>{_t('modal.status')}</span>
                <span className="status-filled">{_t('modal.filled')}</span>
              </div>
              <div className="receipt-row tx">
                <span>{_t('modal.txHash')}</span>
                <span className="tx-hash">{txHash.slice(0, 18)}&hellip;</span>
              </div>
            </div>
            <button className="place-btn" onClick={resetAndClose}>{_t('modal.done')}</button>
          </>
        )}
      </div>
    </div>
  );
}
