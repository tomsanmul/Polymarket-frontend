const BASE = '/api';

async function apiFetch(path, params = {}) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${BASE}${path}?${qs}`);
  if (!res.ok) throw new Error(`Backend HTTP ${res.status}`);
  return res.json();
}

function normalizeMarket(m) {
  const outcomes = m.outcomes || [];
  const outcomeNames = outcomes.map(o => o.name || o.outcomeName || '');
  const prices = outcomes.map(o => {
    const p = o.price ?? o.currentPrice ?? o.lastPrice ?? 0.5;
    return String(p);
  });
  return {
    id: m.id,
    conditionId: m.conditionId || m.id,
    question: m.question || m.title,
    image: m.image || m.imageUrl || m.image_url,
    volume24hr: m.volume24h ?? m.volume_24h ?? 0,
    volume: m.volumeTotal ?? m.volume_total ?? 0,
    liquidity: m.liquidity ?? 0,
    endDate: m.endDate || m.trading_end_at || m.resolution_date,
    events: m.events?.length ? m.events : [{ title: m.eventName || m.event_name || '' }],
    status: m.status,
    _outcomes: outcomeNames.length ? outcomeNames : ['Yes', 'No'],
    _prices: prices.length ? prices : ['0.5', '0.5'],
    _metadata: m.metadata || m._metadata || {},
    _spread: m.spread ?? m._spread ?? null,
  };
}

export async function fetchMarkets(params = {}) {
  const qParams = { limit: '50', ...params };
  if (params.cursor) {
    qParams.cursor = params.cursor;
    delete qParams.limit;
  }
  const data = await apiFetch('/markets', qParams);
  return {
    markets: (data.markets || data || []).map(normalizeMarket),
    cursor: data.pagination?.next_cursor || data.cursor || null,
    hasMore: data.pagination?.has_more ?? data.hasMore ?? false,
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
