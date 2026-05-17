import SimulatorBar from '../simulator/SimulatorBar';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'ca', label: 'CA' },
];

export default function Header({ page, setPage, goBack, lang, setLang, _t, toggleTheme, theme, onNavigate, onSimulatorOpen }) {
  if (page === 'profile') {
    return (
      <header className="header header-profile">
        <div className="header-inner">
          <button className="nav-btn" onClick={goBack} title="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 className="profile-title">Profile</h1>
          <div style={{width:34}}></div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo" onClick={() => onNavigate('home')} style={{cursor:'pointer'}}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#6366f1"/>
            <path d="M12 12l8 16 8-16" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1>{_t('header.title')}</h1>
        </div>
        <div className="header-right">
          <SimulatorBar onOpen={onSimulatorOpen} />
          <div className="lang-switcher">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                className={'lang-btn' + (lang === l.code ? ' active' : '')}
                onClick={() => setLang(l.code)}
              >{l.label}</button>
            ))}
          </div>
          <button className={'nav-btn' + (page === 'profile' ? ' active' : '')} onClick={() => setPage('profile')} title="Profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <button className="theme-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
