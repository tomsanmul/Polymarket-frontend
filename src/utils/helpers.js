export function formatCurrency(n) {
  if (!n) return '$0';
  const num = Number(n);
  if (num >= 1_000_000_000) return '$' + (num / 1_000_000_000).toFixed(2) + 'B';
  if (num >= 1_000_000) return '$' + (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return '$' + (num / 1_000).toFixed(1) + 'K';
  if (num >= 1) return '$' + num.toFixed(2);
  return '$' + num.toFixed(4);
}

export function formatCompactCurrency(n) {
  if (!n) return '$0';
  const num = Number(n);
  if (num >= 1_000_000_000_000) return '$' + (num / 1_000_000_000_000).toFixed(2) + 'T';
  if (num >= 1_000_000_000) return '$' + (num / 1_000_000_000).toFixed(2) + 'B';
  if (num >= 1_000_000) return '$' + (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return '$' + (num / 1_000).toFixed(1) + 'K';
  return '$' + num.toFixed(2);
}

export function formatPercent(n) {
  return (Number(n) * 100).toFixed(1) + '%';
}

export function daysLeft(dateStr, t, lang) {
  if (!dateStr) return '';
  const end = new Date(dateStr);
  const now = new Date();
  const diff = end - now;
  if (diff <= 0) return t('market.ended');
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (d === 0) return t('market.today');
  if (lang === 'es') return d + ' d restantes';
  if (lang === 'ca') return d + ' d restants';
  return d + 'd left';
}

export function safeJsonParse(str, fallback) {
  if (Array.isArray(str)) return str;
  if (typeof str === 'string') {
    try { return JSON.parse(str); } catch { return fallback; }
  }
  return fallback;
}

export function matchCategory(market, keywords) {
  if (!keywords) return true;
  const text = (market.question + ' ' + (market.events?.[0]?.title || '')).toLowerCase();
  return keywords.some(kw => text.includes(kw));
}
