import { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { LocaleContext, t } from './utils/translations';
import { fetchMarkets as polyFetchMarkets, fetchTrades, sortMarketsByVolume, getQueryForCategory } from './utils/api';
import { SimulatorProvider } from './utils/simulator';
import { Header, Categories, Toolbar, MarketCard, MarketSkeleton, SearchBar, FeaturedMarket, BetModal, SimulatorPage } from './components';
import { HomePage, ProfilePage } from './pages';
import './App.css';

const CATEGORIES = [
  { id: 'all', labelKey: 'categories.all', icon: '\u25A6', keywords: null },
  { id: 'sports', labelKey: 'categories.sports', icon: '\u26BD', keywords: ['nfl', 'nba', 'mlb', 'nhl', 'soccer', 'tennis', 'ufc', 'boxing', 'champions league', 'super bowl', 'world cup', 'premier league', 'la liga', 'serie a', 'bundesliga', 'f1', 'formula 1', 'grand slam', 'ncaa', 'march madness', 'world series', 'nhl', 'wnba', 'cricket', 'golf', 'masters', 'nascar', 'europa league', 'championship'] },
  { id: 'politics', labelKey: 'categories.politics', icon: '\u2696', keywords: ['president', 'election', 'senate', 'congress', 'democrat', 'republican', 'vote', 'trump', 'biden', 'harris', 'governor', 'mayor', 'speaker', 'house race', 'federal', 'government', 'cabinet', 'supreme court', 'gop', 'dnc', 'foreign policy', 'tariff', 'ukraine', 'russia', 'china', 'israel', 'gaza', 'war', 'ceasefire', 'sanction'] },
  { id: 'crypto', labelKey: 'categories.crypto', icon: '\u20BF', keywords: ['bitcoin', 'ethereum', 'crypto', 'btc', 'eth', 'solana', 'defi', 'nft', 'token', 'blockchain', 'altcoin', 'web3', 'wallet', 'exchange', 'sec', 'cbdc', 'stablecoin', 'mining', 'halving', 'airdrop', 'etf', 'uniswap', 'polygon', 'base'] },
  { id: 'pop', labelKey: 'categories.pop', icon: '\u2606', keywords: ['movie', 'music', 'album', 'oscar', 'grammy', 'celebrity', 'kanye', 'taylor swift', 'beyonce', 'drake', 'netflix', 'disney', 'marvel', 'hollywood', 'billboard', 'spotify', 'youtube', 'tiktok', 'instagram', 'reality tv', 'show', 'series', 'season', 'finale', 'rapper', 'concert', 'tour'] },
  { id: 'tech', labelKey: 'categories.tech', icon: '\u26A1', keywords: ['ai', 'artificial intelligence', 'space', 'rocket', 'nasa', 'spacex', 'mars', 'gpt', 'openai', 'apple', 'google', 'microsoft', 'tesla', 'robot', 'nuclear', 'fusion', 'quantum', 'gene', 'vaccine', 'drug', 'fda', 'clinical trial', 'satellite', 'launch', 'starship'] },
  { id: 'esports', labelKey: 'categories.esports', icon: '\uD83C\uDFAE', keywords: ['esports', 'league of legends', 'lol', 'dota', 'counter strike', 'csgo', 'cs2', 'valorant', 'overwatch', 'fortnite', 'call of duty', 'cod', 'streamer', 'twitch', 'worlds', 'major', 'lcs', 'lec', 'mvp', 'kda', 'gaming'] },
];

function AppInner({ toggleTheme, theme }) {
  const { lang, setLang } = useContext(LocaleContext);
  const _t = useCallback((path, repl) => t(lang, path, repl), [lang]);

  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('volume24hr');
  const [filterStatus, setFilterStatus] = useState('active');
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('all');
  const [betMarket, setBetMarket] = useState(null);
  const [page, setPage] = useState('home');
  const [prevPage, setPrevPage] = useState('home');
  const [query, setQuery] = useState('');
  const [featuredTrades, setFeaturedTrades] = useState(null);
  const [simPage, setSimPage] = useState(null);
  const LIMIT = 25;

  useEffect(() => {
    if (page !== 'profile') {
      setPrevPage(page);
    }
  }, [page]);

  const fetchMarkets = useCallback(async (nextCursor, sortBy, append) => {
    setLoading(true);
    setError(null);
    setFeaturedTrades(null);
    try {
      const params = {};
      params.query = getQueryForCategory(category);
      if (nextCursor) params.cursor = nextCursor;
      if (filterStatus === 'active') params.status = 'open';
      else if (filterStatus === 'closed') params.status = 'resolved';
      const data = await polyFetchMarkets(params);
      if (append) {
        setMarkets(prev => [...prev, ...data.markets]);
      } else {
        setMarkets(data.markets);
      }
      setCursor(data.cursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, filterStatus]);

  useEffect(() => {
    setCursor(null);
    setMarkets([]);
    fetchMarkets(null, sort, false);
  }, [sort, fetchMarkets, category]);

  const searchedMarkets = useMemo(() => {
    let filtered = markets;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(m => (m.question || '').toLowerCase().includes(q) || (m.events?.[0]?.title || '').toLowerCase().includes(q));
    }
    if (filterStatus === 'active') {
      filtered = filtered.filter(m => m.status === 'open' || m.status === 'active');
    } else if (filterStatus === 'closed') {
      filtered = filtered.filter(m => m.status === 'resolved' || m.status === 'closed' || m.status === 'finalized');
    }
    return filtered;
  }, [markets, query, filterStatus]);

  const { featuredMarket, gridMarkets } = useMemo(() => {
    if (searchedMarkets.length === 0) return { featuredMarket: null, gridMarkets: [] };
    const sorted = sortMarketsByVolume(searchedMarkets);
    return { featuredMarket: sorted[0], gridMarkets: sorted.slice(1) };
  }, [searchedMarkets]);

  useEffect(() => {
    if (featuredMarket) {
      fetchTrades(featuredMarket.id, { limit: 50 }).then(data => {
        setFeaturedTrades(data.trades);
      }).catch(() => {});
    }
  }, [featuredMarket]);

  function handleCategorySelect(catId) {
    setCategory(catId);
    setCursor(null);
    setMarkets([]);
  }

  function goBack() {
    setPage(prevPage);
  }

  function renderMarkets() {
    return (
      <>
        <SearchBar query={query} onChange={setQuery} />
        {featuredMarket && (
          <FeaturedMarket market={featuredMarket} onBet={setBetMarket} _t={_t} lang={lang} trades={featuredTrades} />
        )}
        <Categories categories={CATEGORIES} category={category} onSelect={handleCategorySelect} lang={lang} />
        <Toolbar _t={_t} sort={sort} onSortChange={e => setSort(e.target.value)} filterStatus={filterStatus} onFilterChange={e => setFilterStatus(e.target.value)} category={category} categories={CATEGORIES} lang={lang} />
        <main className="main">
          {error && (
            <div className="error-banner">
              {_t('error.loading')} {error}
              <button onClick={() => { setCursor(null); setMarkets([]); fetchMarkets(null, sort, false); }}>{_t('error.retry')}</button>
            </div>
          )}
          <div className="markets-grid">
            {gridMarkets.map(m => (
              <MarketCard key={m.id || m.conditionId} market={m} onBet={setBetMarket} _t={_t} lang={lang} />
            ))}
            {loading && Array.from({ length: 4 }).map((_, i) => <MarketSkeleton key={`sk-${i}`} />)}
          </div>
          {!loading && gridMarkets.length === 0 && !error && (
            <div className="empty">{_t('error.empty')}</div>
          )}
          {!loading && hasMore && gridMarkets.length > 0 && (
            <div className="load-more-wrap">
              <button className="load-more" onClick={() => fetchMarkets(cursor, sort, true)}>{_t('loadMore')}</button>
            </div>
          )}
        </main>
      </>
    );
  }

  return (
    <SimulatorProvider>
      <div className="app">
        <Header page={page} setPage={setPage} goBack={goBack} lang={lang} setLang={setLang} _t={_t} toggleTheme={toggleTheme} theme={theme} onNavigate={setPage} onSimulatorOpen={setSimPage} />
        {page === 'home' && <HomePage markets={markets} onNavigate={setPage} onCategorySelect={handleCategorySelect} _t={_t} />}
        {page === 'markets' && renderMarkets()}
        {page === 'profile' && (
          <main className="main">
            <ProfilePage markets={markets} />
          </main>
        )}
        {betMarket && <BetModal market={betMarket} onClose={() => setBetMarket(null)} _t={_t} lang={lang} />}
        {simPage && <SimulatorPage onClose={() => setSimPage(null)} />}
      </div>
    </SimulatorProvider>
  );
}

export default function App() {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState(() => localStorage.getItem('pm-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pm-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  return (
    <LocaleContext.Provider value={{ lang, setLang }}>
      <AppInner toggleTheme={toggleTheme} theme={theme} />
    </LocaleContext.Provider>
  );
}
