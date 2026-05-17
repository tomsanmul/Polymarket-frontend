import { useState, useEffect } from 'react';
import { fetchCryptoMarkets, fetchStockQuotes, loadCache } from '../../utils/prices';
import { formatCurrency } from '../../utils/helpers';

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const W = 120, H = 36, PAD = 2;
  const iw = W - PAD * 2, ih = H - PAD * 2;
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const rng = mx - mn || 1;
  const path = data.map((v, i) => (i === 0 ? 'M' : 'L') + (PAD + (i / (data.length - 1)) * iw).toFixed(1) + ',' + (PAD + ih - ((v - mn) / rng) * ih).toFixed(1)).join('');
  return (
    <svg width={W} height={H} viewBox={'0 0 ' + W + ' ' + H}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AssetCard({ name, symbol, price, change24h, sparkline, image }) {
  const isUp = change24h >= 0;
  const color = isUp ? 'var(--yes)' : 'var(--no)';
  const [imgError, setImgError] = useState(false);
  return (
    <div className="res-card">
      <div className="res-card-top">
        <div className="res-card-info">
          <div className="res-card-name-row">
            {image && !imgError && <img className="res-card-logo" src={image} alt={name} onError={() => setImgError(true)} />}
            <span className="res-card-name">{name}</span>
          </div>
          <span className="res-card-symbol">{symbol}</span>
        </div>
        <Sparkline data={sparkline} color={color} />
      </div>
      <div className="res-card-price">{formatCurrency(price)}</div>
      <div className={'res-card-change ' + (isUp ? 'up' : 'down')}>
        {isUp ? '+' : ''}{change24h?.toFixed(2)}%
      </div>
    </div>
  );
}

export default function ResearchPrices() {
  const [crypto, setCrypto] = useState(loadCache('crypto'));
  const [stocks, setStocks] = useState(loadCache('quotes'));
  const [loading, setLoading] = useState(() => !loadCache('crypto') && !loadCache('quotes'));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [c, s] = await Promise.all([fetchCryptoMarkets(), fetchStockQuotes()]);
        if (!cancelled) { setCrypto(c); setStocks(s); setLoading(false); }
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (loading && !crypto && !stocks) {
    return <div className="res-loading">Cargando datos de mercado…</div>;
  }

  return (
    <div className="res-prices">
      <div className="res-section">
        <h4 className="res-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Criptomonedas
        </h4>
        <div className="res-grid">
          {crypto?.map(c => (
            <AssetCard key={c.id} {...c} />
          ))}
        </div>
      </div>
      <div className="res-section">
        <h4 className="res-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
          Empresas
        </h4>
        <div className="res-grid">
          {stocks?.map(s => (
            <AssetCard key={s.id} {...s} />
          ))}
        </div>
      </div>
    </div>
  );
}
