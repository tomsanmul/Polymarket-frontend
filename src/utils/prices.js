const CG_BASE = 'https://api.coingecko.com/api/v3';

const CRYPTO_IDS = ['bitcoin', 'ethereum', 'solana', 'ripple', 'cardano'];
const CRYPTO_NAMES = { bitcoin: 'Bitcoin', ethereum: 'Ethereum', solana: 'Solana', ripple: 'XRP', cardano: 'Cardano' };
const CRYPTO_SYMBOLS = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', ripple: 'XRP', cardano: 'ADA' };

const STOCK_SYMBOLS = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'TSM', 'V', 'JPM', 'WMT', 'XOM', 'JNJ', 'PG', 'KO', 'ORCL'];
const STOCK_NAMES = {
  AAPL: 'Apple', NVDA: 'Nvidia', MSFT: 'Microsoft', GOOGL: 'Google',
  AMZN: 'Amazon', META: 'Meta', TSLA: 'Tesla', TSM: 'TSMC',
  V: 'Visa', JPM: 'JPMorgan', WMT: 'Walmart', XOM: 'ExxonMobil',
  JNJ: 'Johnson & Johnson', PG: 'Procter & Gamble', KO: 'Coca-Cola', ORCL: 'Oracle'
};
const STOCK_LOGOS = {
  AAPL: 'https://www.google.com/s2/favicons?domain=apple.com&sz=32',
  NVDA: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=32',
  MSFT: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=32',
  GOOGL: 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
  AMZN: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
  META: 'https://www.google.com/s2/favicons?domain=meta.com&sz=32',
  TSLA: 'https://www.google.com/s2/favicons?domain=tesla.com&sz=32',
  TSM: 'https://www.google.com/s2/favicons?domain=tsmc.com&sz=32',
  V: 'https://www.google.com/s2/favicons?domain=visa.com&sz=32',
  JPM: 'https://www.google.com/s2/favicons?domain=jpmorganchase.com&sz=32',
  WMT: 'https://www.google.com/s2/favicons?domain=walmart.com&sz=32',
  XOM: 'https://www.google.com/s2/favicons?domain=exxonmobil.com&sz=32',
  JNJ: 'https://www.google.com/s2/favicons?domain=jnj.com&sz=32',
  PG: 'https://www.google.com/s2/favicons?domain=pg.com&sz=32',
  KO: 'https://www.google.com/s2/favicons?domain=coca-cola.com&sz=32',
  ORCL: 'https://www.google.com/s2/favicons?domain=oracle.com&sz=32',
};

const STOCK_FUNDAMENTALS = {
  AAPL: { peRatio: 34.5, eps: 8.45, marketCap: 3800000000000, sector: 'Tecnolog\u00eda', industry: 'Electr\u00f3nica de Consumo' },
  NVDA: { peRatio: 52.3, eps: 5.60, marketCap: 3300000000000, sector: 'Tecnolog\u00eda', industry: 'Semiconductores' },
  MSFT: { peRatio: 33.1, eps: 8.85, marketCap: 3200000000000, sector: 'Tecnolog\u00eda', industry: 'Software' },
  GOOGL: { peRatio: 22.8, eps: 6.90, marketCap: 2200000000000, sector: 'Tecnolog\u00eda', industry: 'Internet' },
  AMZN: { peRatio: 38.2, eps: 4.92, marketCap: 2100000000000, sector: 'Consumo', industry: 'Comercio Electr\u00f3nico' },
  META: { peRatio: 25.4, eps: 15.20, marketCap: 1600000000000, sector: 'Tecnolog\u00eda', industry: 'Redes Sociales' },
  TSLA: { peRatio: 68.5, eps: 3.92, marketCap: 1200000000000, sector: 'Automotriz', industry: 'Veh\u00edculos El\u00e9ctricos' },
  TSM: { peRatio: 24.8, eps: 6.50, marketCap: 900000000000, sector: 'Tecnolog\u00eda', industry: 'Semiconductores' },
  V: { peRatio: 30.2, eps: 9.80, marketCap: 620000000000, sector: 'Financiero', industry: 'Pagos Digitales' },
  JPM: { peRatio: 12.5, eps: 16.50, marketCap: 600000000000, sector: 'Financiero', industry: 'Banca' },
  WMT: { peRatio: 30.8, eps: 2.45, marketCap: 580000000000, sector: 'Consumo', industry: 'Minorista' },
  XOM: { peRatio: 14.2, eps: 8.30, marketCap: 520000000000, sector: 'Energ\u00eda', industry: 'Petr\u00f3leo y Gas' },
  JNJ: { peRatio: 16.5, eps: 10.20, marketCap: 390000000000, sector: 'Salud', industry: 'Farmac\u00e9utica' },
  PG: { peRatio: 26.4, eps: 6.50, marketCap: 380000000000, sector: 'Consumo', industry: 'Productos del Hogar' },
  KO: { peRatio: 27.1, eps: 2.80, marketCap: 290000000000, sector: 'Consumo', industry: 'Bebidas' },
  ORCL: { peRatio: 32.6, eps: 4.25, marketCap: 380000000000, sector: 'Tecnolog\u00eda', industry: 'Software Empresarial' },
};

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const CACHE_TTL = 120000;
export function loadCache(key) {
  try {
    const raw = localStorage.getItem('pm-cache-' + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.data;
  } catch { return null; }
}
export function saveCache(key, data) {
  try { localStorage.setItem('pm-cache-' + key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

export async function fetchCryptoMarkets() {
  const cached = loadCache('crypto');
  if (cached) return cached;
  const fresh = await fetchCryptoMarketsFresh();
  saveCache('crypto', fresh);
  return fresh;
}

async function fetchCryptoMarketsFresh() {
  const ids = CRYPTO_IDS.join(',');
  const data = await fetchJson(
    `${CG_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`
  );
  const mapped = data.map(c => ({
    id: c.id,
    name: CRYPTO_NAMES[c.id] || c.name,
    symbol: CRYPTO_SYMBOLS[c.id] || c.symbol?.toUpperCase(),
    price: c.current_price,
    change24h: c.price_change_percentage_24h ?? 0,
    sparkline: (c.sparkline_in_7d?.price || []).slice(-48),
    high24h: c.high_24h,
    low24h: c.low_24h,
    marketCap: c.market_cap,
    image: c.image,
  }));
  saveCache('crypto', mapped);
  return mapped;
}

async function fetchStockChart(sym, range = '7d') {
  const data = await fetchJson(`/yf/v8/finance/chart/${sym}?range=${range}&interval=30m`);
  const result = data.chart?.result?.[0];
  if (!result) return null;
  const meta = result.meta;
  const quotes = result.indicators?.quote?.[0];
  const closes = quotes?.close?.filter(c => c !== null) || [];
  const price = meta.regularMarketPrice ?? closes[closes.length - 1] ?? 0;
  const prevClose = meta.chartPreviousClose ?? closes[0] ?? price;
  return { meta, quotes, closes, price, prevClose };
}

export async function fetchStockQuotes() {
  const cached = loadCache('quotes');
  if (cached) return cached;
  const fresh = await fetchStockQuotesFresh();
  saveCache('quotes', fresh);
  return fresh;
}

async function fetchStockQuotesFresh() {
  const results = [];
  for (let i = 0; i < STOCK_SYMBOLS.length; i += 4) {
    const batch = STOCK_SYMBOLS.slice(i, i + 4);
    const data = await Promise.all(batch.map(sym =>
      fetchStockChart(sym).then(r => r ? { ...r, sym } : null).catch(() => null)
    ));
    for (const item of data) {
      if (!item) continue;
      const change24h = item.prevClose ? ((item.price - item.prevClose) / item.prevClose) * 100 : 0;
      results.push({
        id: item.sym,
        name: STOCK_NAMES[item.sym] || item.sym,
        symbol: item.sym,
        price: item.price,
        change24h,
        sparkline: item.closes.slice(-48),
        image: STOCK_LOGOS[item.sym],
      });
    }
    if (i + 4 < STOCK_SYMBOLS.length) await new Promise(r => setTimeout(r, 1000));
  }
  saveCache('quotes', results);
  return results;
}

export async function fetchStockFundamentals() {
  const cached = loadCache('stocks');
  if (cached) return cached;
  return fetchStockFundamentalsFresh();
}

async function fetchStockFundamentalsFresh() {
  const results = [];
  for (let i = 0; i < STOCK_SYMBOLS.length; i += 4) {
    const batch = STOCK_SYMBOLS.slice(i, i + 4);
    const data = await Promise.all(batch.map(sym =>
      fetchStockChart(sym, '5d').then(r => r ? { ...r, sym } : null).catch(() => null)
    ));
    for (const item of data) {
      if (!item) continue;
      const change = item.price - item.prevClose;
      const changePercent = item.prevClose ? ((item.price - item.prevClose) / item.prevClose) * 100 : 0;
      const volume = item.meta?.regularMarketVolume ?? item.quotes?.volume?.filter(v => v !== null).pop() ?? 0;
      const fund = STOCK_FUNDAMENTALS[item.sym] || {};
      results.push({
        id: item.sym,
        name: STOCK_NAMES[item.sym] || item.sym,
        symbol: item.sym,
        image: STOCK_LOGOS[item.sym],
        price: item.price,
        change,
        changePercent,
        volume,
        avgVolume: volume,
        marketCap: fund.marketCap || 0,
        peRatio: fund.peRatio || null,
        eps: fund.eps || null,
        sector: fund.sector || '',
        industry: fund.industry || '',
        targetPrice: null,
        recommendation: null,
        dividendYield: null,
        epsForward: null,
        earningsDate: null,
      });
    }
    if (i + 4 < STOCK_SYMBOLS.length) await new Promise(r => setTimeout(r, 1000));
  }
  saveCache('stocks', results);
  return results;
}

export { CRYPTO_IDS, CRYPTO_NAMES, CRYPTO_SYMBOLS, STOCK_SYMBOLS, STOCK_NAMES, STOCK_LOGOS };
