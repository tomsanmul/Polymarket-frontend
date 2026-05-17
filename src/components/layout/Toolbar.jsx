import { t } from '../../utils/translations';

export default function Toolbar({ _t, sort, onSortChange, filterStatus, onFilterChange, category, categories, lang }) {
  const labelKey = categories.find(c => c.id === category)?.labelKey || 'toolbar.markets';

  return (
    <div className="toolbar">
      <div className="toolbar-inner">
        <h2>{t(lang, labelKey)}</h2>
        <div className="sort-group">
          <label htmlFor="filter-status">{_t('toolbar.filter')}</label>
          <select id="filter-status" value={filterStatus} onChange={onFilterChange}>
            <option value="all">{_t('toolbar.all')}</option>
            <option value="active">{_t('toolbar.active')}</option>
            <option value="closed">{_t('toolbar.closed')}</option>
          </select>
          <label htmlFor="sort">{_t('toolbar.sortBy')}</label>
          <select id="sort" value={sort} onChange={onSortChange}>
            <option value="volume24hr">{_t('toolbar.vol24h')}</option>
            <option value="volume">{_t('toolbar.volume')}</option>
            <option value="liquidity">{_t('toolbar.liquidity')}</option>
            <option value="end_date">{_t('toolbar.endDate')}</option>
            <option value="start_date">{_t('toolbar.newest')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
