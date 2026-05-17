export default function MarketSkeleton() {
  return (
    <div className="market-card skeleton">
      <div className="skeleton-img" />
      <div className="market-info">
        <div className="skeleton-tag" />
        <div className="skeleton-line w-100" />
        <div className="skeleton-line w-60" />
        <div className="market-meta">
          <div className="skeleton-line w-40" />
          <div className="skeleton-line w-30" />
        </div>
      </div>
      <div className="market-prices">
        <div className="skeleton-line w-50" />
        <div className="skeleton-line w-50" />
        <div className="skeleton-line w-30" />
      </div>
    </div>
  );
}
