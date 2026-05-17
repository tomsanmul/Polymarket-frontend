import { useMemo } from 'react';
import { formatCurrency, formatPercent } from '../utils/helpers';

const HOME_CATS = [
  { id: 'sports', icon: '\u26BD', labelKey: 'categories.sports' },
  { id: 'politics', icon: '\u2696', labelKey: 'categories.politics' },
  { id: 'crypto', icon: '\u20BF', labelKey: 'categories.crypto' },
  { id: 'pop', icon: '\u2606', labelKey: 'categories.pop' },
  { id: 'tech', icon: '\u26A1', labelKey: 'categories.tech' },
  { id: 'esports', icon: '\uD83C\uDFAE', labelKey: 'categories.esports' },
];

export default function HomePage({ markets, onNavigate, onCategorySelect, _t }) {
  const totalVolume = useMemo(() => {
    return markets.reduce((sum, m) => sum + (Number(m.volume24hr) || 0), 0);
  }, [markets]);

  const trending = useMemo(() => {
    return [...markets].sort((a, b) => (b.volume24hr || 0) - (a.volume24hr || 0)).slice(0, 3);
  }, [markets]);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-logo">
            <svg width="52" height="52" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#6366f1"/>
              <path d="M12 12l8 16 8-16" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="hero-title">{_t('header.title')}</h1>
          <p className="hero-subtitle">{_t('header.subtitle')}</p>
          <button className="hero-cta" onClick={() => onNavigate('markets')}>
            {_t('home.explore')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </section>

      <section className="home-stats">
        <div className="stat-card">
          <span className="hs-label">{_t('home.totalVolume')}</span>
          <span className="hs-value">{formatCurrency(totalVolume)}</span>
        </div>
        <div className="stat-card">
          <span className="hs-label">{_t('home.activeMarkets')}</span>
          <span className="hs-value">{markets.length}</span>
        </div>
        <div className="stat-card">
          <span className="hs-label">{_t('home.categories')}</span>
          <span className="hs-value">{HOME_CATS.length}</span>
        </div>
      </section>

      {trending.length > 0 && (
        <section className="home-trending">
          <h2 className="section-title">{_t('home.trending')}</h2>
          <div className="trending-grid">
            {trending.map(m => (
              <div key={m.id || m.conditionId} className="trending-card">
                <div className="tc-image-wrap">
                  {m.image ? <img src={m.image} alt="" /> : <div className="tc-placeholder">?</div>}
                </div>
                <div className="tc-info">
                  {m.events?.[0]?.title && <span className="tc-tag">{m.events[0].title}</span>}
                  <h3 className="tc-question">{m.question}</h3>
                  <div className="tc-prices">
                    <span className="tc-yes">{formatPercent(m._prices[0] || 0.5)}</span>
                    <span className="tc-no">{formatPercent(m._prices[1] || 0.5)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="home-categories">
        <h2 className="section-title">{_t('home.browseBy')}</h2>
        <div className="category-grid">
          {HOME_CATS.map(cat => (
            <button
              key={cat.id}
              className="home-cat-btn"
              onClick={() => { onCategorySelect(cat.id); onNavigate('markets'); }}
            >
              <span className="hcb-icon">{cat.icon}</span>
              <span className="hcb-label">{_t(cat.labelKey)}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
