export function fmt(n, d) {
  if (!n) return '$0';
  const num = Number(n), dec = d ?? (num >= 10 ? 0 : 2);
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
  return '$' + num.toFixed(dec);
}

export function pct(n) {
  const v = Number(n);
  return (v >= 0 ? '+' : '') + (v * 100).toFixed(1) + '%';
}

export function genPortfolio(markets) {
  if (!markets.length) return { invested: 0, value: 0, pnl: 0, history: [] };
  const count = Math.min(12, markets.length);
  const shuffled = [...markets].sort(() => Math.random() - 0.5).slice(0, count);
  let ti = 0, tv = 0;
  const history = shuffled.map(m => {
    const price = Number(m._prices[0]) || 0.5;
    const side = Math.random() > 0.5 ? 'YES' : 'NO';
    const ep = side === 'YES' ? Math.max(0.01, price + (Math.random() - 0.5) * 0.2) : Math.max(0.01, 1 - price + (Math.random() - 0.5) * 0.2);
    const shares = Math.floor(Math.random() * 500 + 50);
    const inv = shares * ep;
    const cp = side === 'YES' ? price : 1 - price;
    const cv = shares * cp;
    const pnl = cv - inv;
    ti += inv; tv += cv;
    const q = m.question;
    return { id: m.id, question: q.length > 50 ? q.slice(0, 50) + '...' : q, side, shares, entryPrice: ep, currentPrice: cp, invested: inv, currentValue: cv, pnl };
  });
  return { invested: ti, value: tv, pnl: tv - ti, history };
}

export function genData(period) {
  const now = new Date();
  let bal = 500;
  if (period === '1W') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6 - i));
      bal += (Math.random() - 0.45) * 60;
      return { label: d.toLocaleDateString('en',{weekday:'short'}), full: d.toLocaleDateString('en',{month:'short',day:'numeric'}), balance: Math.round(bal*100)/100 };
    });
  } else if (period === '1M') {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (29 - i));
      bal += (Math.random() - 0.45) * 30;
      return { label: String(d.getDate()), full: d.toLocaleDateString('en',{month:'short',day:'numeric'}), balance: Math.round(bal*100)/100 };
    });
  } else {
    return Array.from({ length: 52 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (51 - i) * 7);
      bal += (Math.random() - 0.45) * 50;
      return { label: d.toLocaleDateString('en',{month:'short'}), full: d.toLocaleDateString('en',{month:'short',day:'numeric'}), balance: Math.round(bal*100)/100 };
    });
  }
}

export function smooth(points, x, y) {
  if (points.length < 2) return '';
  let d = 'M' + x(0).toFixed(2) + ',' + y(points[0].balance).toFixed(2);
  for (let i = 0; i < points.length - 1; i++) {
    const x0 = i > 0 ? x(i-1) : x(0);
    const x1 = x(i);
    const x2 = x(i+1);
    const x3 = i < points.length - 2 ? x(i+2) : x(i+1);
    const y0 = i > 0 ? y(points[i-1].balance) : y(points[0].balance);
    const y1 = y(points[i].balance);
    const y2 = y(points[i+1].balance);
    const y3 = i < points.length - 2 ? y(points[i+2].balance) : y(points[i+1].balance);
    const cp1x = x1 + (x2 - x0) / 6;
    const cp1y = y1 + (y2 - y0) / 6;
    const cp2x = x2 - (x3 - x1) / 6;
    const cp2y = y2 - (y3 - y1) / 6;
    d += ' C' + cp1x.toFixed(2) + ',' + cp1y.toFixed(2) + ' ' + cp2x.toFixed(2) + ',' + cp2y.toFixed(2) + ' ' + x2.toFixed(2) + ',' + y2.toFixed(2);
  }
  return d;
}

export function genPriceHistory(yesPrice, count = 20) {
  const target = Number(yesPrice) || 0.5;
  let current = 0.5 + (Math.random() - 0.5) * 0.2;
  const result = [];
  for (let i = 0; i < count; i++) {
    current += (target - current) * (1 / count) + (Math.random() - 0.5) * 0.04;
    current = Math.max(0.01, Math.min(0.99, current));
    result.push({ yes: current, no: 1 - current });
  }
  result[result.length - 1] = { yes: target, no: 1 - target };
  return result;
}
