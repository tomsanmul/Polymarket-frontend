const BASE = import.meta.env.VITE_API_URL || '/api';

async function apiFetch(path, params = {}) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${BASE}${path}?${qs}`);
  if (!res.ok) throw new Error(`Backend HTTP ${res.status}`);
  return res.json();
}

function normalizeMarket(m) {
  return {
    id: m.id,
    conditionId: m.conditionId || m.id,
    question: m.question || '',
    image: m.image || '',
    volume24hr: m.volume24hr ?? 0,
    volume: m.volume ?? 0,
    liquidity: m.liquidity ?? 0,
    endDate: m.endDate || '',
    events: m.events?.length ? m.events : [{ title: '' }],
    status: m.status || 'unknown',
    _outcomes: m.outcomes?.length ? m.outcomes : ['Yes', 'No'],
    _prices: m.prices?.length ? m.prices.map(String) : ['0.5', '0.5'],
    _metadata: m._metadata || {},
    _spread: m._spread ?? null,
  };
}

export async function fetchMarkets(params = {}) {
  const qParams = { platform: 'polymarket', limit: '50', ...params };
  if (params.cursor) {
    qParams.cursor = params.cursor;
    delete qParams.limit;
  }
  const data = await apiFetch('/markets', qParams);
  const items = data.value || data.markets || data || [];
  return {
    markets: (Array.isArray(items) ? items : []).map(normalizeMarket),
    cursor: data.cursor || data.pagination?.next_cursor || null,
    hasMore: data.hasMore ?? data.pagination?.has_more ?? false,
  };
}

export async function fetchTrades(marketId, params = {}) {
  const data = await apiFetch(`/markets/${marketId}/trades`, params);
  return {
    trades: (data.trades || data || []).map(t => ({
      price: t.price,
      outcome: t.outcome,
      side: t.side,
      timestamp: t.timestamp,
      size: t.size,
    })),
    hasMore: data.pagination?.has_more ?? data.hasMore ?? false,
  };
}

export function getQueryForCategory(catId) {
  const map = {
    all: 'the',
    sports: 'nfl',
    politics: 'election',
    crypto: 'bitcoin',
    pop: 'movie',
    tech: 'spacex',
    esports: 'esports',
  };
  return map[catId] || '';
}

export function sortMarketsByVolume(markets) {
  return [...markets].sort((a, b) => (b.volume24hr || b.liquidity || 0) - (a.volume24hr || a.liquidity || 0));
}
