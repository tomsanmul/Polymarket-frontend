export default function SearchBar({ query, onChange }) {
  return (
    <div className="search-bar">
      <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        className="search-input"
        type="text"
        placeholder="Search markets by name ..."
        value={query}
        onChange={e => onChange(e.target.value)}
      />
      {query && (
        <button className="search-clear" onClick={() => onChange('')}>&#10005;</button>
      )}
    </div>
  );
}
