import { t } from '../../utils/translations';

export default function Categories({ categories, category, onSelect, lang }) {
  return (
    <nav className="categories">
      {categories.map(cat => (
        <button
          key={cat.id}
          className={'cat-btn' + (category === cat.id ? ' active' : '')}
          onClick={() => onSelect(cat.id)}
        >
          <span className="cat-icon">{cat.icon}</span>
          {t(lang, cat.labelKey)}
        </button>
      ))}
    </nav>
  );
}
