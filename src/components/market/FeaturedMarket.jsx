import FeaturedChart from './FeaturedChart';
import { formatCurrency, formatPercent, daysLeft } from '../../utils/helpers';

export default function FeaturedMarket({ market, onBet, _t, lang, trades }) {
  if (!market) return null;
  const prices = market._prices;
  const yesPrice = Number(prices[0]) || 0.5;
  const noPrice = Number(prices[1]) || 0.5;
  const outcomes = market._outcomes;
  const eventTitle = market.events?.[0]?.title;

  return (
    <div className="featured-market">
      <div className="featured-info">
        <div className="featured-image-wrap">
          {market.image ? (
            <img src={market.image} alt="" className="featured-image" />
          ) : (
            <div className="featured-image-placeholder">?</div>
          )}
        </div>
        <div className="featured-meta">
          {eventTitle && <span className="featured-tag">{eventTitle}</span>}
          <h2 className="featured-question">{market.question}</h2>
          <div className="featured-stats">
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              {' '}{formatCurrency(market.volume24hr)} {_t('market.vol')}
            </span>
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {' '}{daysLeft(market.endDate, _t, lang)}
            </span>
          </div>
          <div className="featured-prices">
            <div className="featured-outcome yes">
              <span className="fo-label">{outcomes[0] || 'YES'}</span>
              <span className="fo-price">{formatPercent(yesPrice)}</span>
            </div>
            <div className="featured-outcome no">
              <span className="fo-label">{outcomes[1] || 'NO'}</span>
              <span className="fo-price">{formatPercent(noPrice)}</span>
            </div>
          </div>
          <button className="featured-bet-btn" onClick={() => onBet(market)}>{_t('market.bet')}</button>
        </div>
      </div>
      <div className="featured-chart-wrap">
        <FeaturedChart yesPrice={yesPrice} trades={trades} />
      </div>
    </div>
  );
}
