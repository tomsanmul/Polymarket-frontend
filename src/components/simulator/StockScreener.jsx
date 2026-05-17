import { useState, useEffect } from 'react';
import { fetchStockFundamentals, STOCK_LOGOS, loadCache } from '../../utils/prices';
import { formatCurrency, formatCompactCurrency } from '../../utils/helpers';

function strengthClass(val) {
  if (val == null) return '';
  if (val >= 3.5) return 'strong-buy';
  if (val >= 2.5) return 'buy';
  if (val >= 1.5) return 'hold';
  return 'sell';
}

function strengthLabel(rec) {
  if (!rec) return '—';
  const map = {
    'strong_buy': 'Compra Fuerte',
    'buy': 'Comprar',
    'hold': 'Mantener',
    'sell': 'Vender',
    'strong_sell': 'Venta Fuerte',
  };
  return map[rec] || rec;
}

export default function StockScreener() {
  const [data, setData] = useState(() => loadCache('stocks'));
  const [loading, setLoading] = useState(() => !loadCache('stocks'));
  const [sortKey, setSortKey] = useState('marketCap');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const d = await fetchStockFundamentals();
        if (!cancelled) {
          setData(d.length > 0 ? d : null);
          setLoading(false);
        }
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 120000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const sorted = data
    ? [...data].sort((a, b) => {
        const av = a[sortKey] ?? 0;
        const bv = b[sortKey] ?? 0;
        return sortDir === 'asc' ? av - bv : bv - av;
      })
    : [];

  return (
    <div className="stock-screener">
      <div className="stock-screener-header">
        <h3>Mercado de Valores en Tiempo Real</h3>
        <span className="stock-screener-sub">
          Datos actualizados cada 2 minutos
          {loading && <span className="stock-screener-loading"> Actualizando...</span>}
        </span>
      </div>
      {!data ? (
        <div className="stock-screener-empty">Cargando datos del mercado...</div>
      ) : (
        <div className="stock-screener-table-wrap">
          <table className="stock-screener-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th className="sortable" onClick={() => handleSort('price')}>
                  Valor {sortKey === 'price' ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('changePercent')}>
                  Cambio % {sortKey === 'changePercent' ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('change')}>
                  Cambio \u20AC {sortKey === 'change' ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
                </th>
                <th>Fortaleza</th>
                <th className="sortable" onClick={() => handleSort('volume')}>
                  Volumen {sortKey === 'volume' ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('avgVolume')}>
                  Vol. Precio {sortKey === 'avgVolume' ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('marketCap')}>
                  MKT CAP {sortKey === 'marketCap' ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('peRatio')}>
                  P/E {sortKey === 'peRatio' ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('eps')}>
                  EPS (TTM) {sortKey === 'eps' ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
                </th>
                <th>Sector</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(s => (
                <tr key={s.id}>
                  <td className="stock-name-cell">
                    {s.image && <img src={s.image} alt="" className="stock-logo" />}
                    <div>
                      <div className="stock-name">{s.name}</div>
                      <div className="stock-symbol">{s.symbol}</div>
                    </div>
                  </td>
                  <td className="stock-price">{formatCurrency(s.price)}</td>
                  <td className={s.changePercent >= 0 ? 'up' : 'down'}>
                    {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                  </td>
                  <td className={s.change >= 0 ? 'up' : 'down'}>
                    {s.change >= 0 ? '+' : ''}{formatCurrency(s.change)}
                  </td>
                  <td>
                    <span className={'strength-badge ' + strengthClass(s.recommendation === 'strong_buy' ? 4.5 : s.recommendation === 'buy' ? 3.5 : s.recommendation === 'hold' ? 2.5 : s.recommendation === 'sell' ? 1.5 : 0)}>
                      {strengthLabel(s.recommendation)}
                    </span>
                  </td>
                  <td>{formatCompactCurrency(s.volume)}</td>
                  <td>{formatCompactCurrency(s.avgVolume)}</td>
                  <td>{formatCompactCurrency(s.marketCap)}</td>
                  <td>{s.peRatio != null ? s.peRatio.toFixed(2) : '—'}</td>
                  <td>{s.eps != null ? formatCurrency(s.eps) : '—'}</td>
                  <td className="stock-sector">{s.sector || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
