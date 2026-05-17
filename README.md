# Violeta Explorer — Polymarket Dashboard

Interactive dashboard for exploring **Polymarket** prediction markets with an integrated trading simulator, real-time cryptocurrency and stock research, and multilingual support (EN/ES/CA).

## Features

- **Market exploration** — Browse, filter, and search live prediction markets with Polymarket data.
- **Trading simulator** — Virtual 100 000 € portfolio to practice strategies risk-free. Includes portfolio, trade, research, and learn tabs.
- **Live research** — Real-time quotes for cryptocurrencies (CoinGecko) and stocks (Yahoo Finance) with sparklines and fundamental screening.
- **Profile & portfolio** — Simulated investment history, P&L chart with adjustable time range, and wallet modal.
- **Multi-language** — English, Spanish, and Catalan.
- **Dark/Light theme** — Toggle with `localStorage` persistence.

## Project structure

```
src/
├── App.jsx                        # Entry point, global state & routing
├── main.jsx                       # React mount
├── components/
│   ├── index.js                   # Re-exports
│   ├── layout/                    # Header, Toolbar, Categories, SearchBar
│   ├── market/                    # MarketCard, FeaturedMarket, FeaturedChart, MarketSkeleton
│   ├── modal/                     # BetModal, WalletModal
│   ├── simulator/                 # SimulatorPage, SimulatorBar, StockScreener, ResearchPrices
│   └── profile/                   # PnLChart, HistoryTable
├── pages/                         # HomePage, ProfilePage
└── utils/
    ├── api.js                     # Connection to Java backend (Polymarket API)
    ├── prices.js                  # Connection to CoinGecko and Yahoo Finance
    ├── simulator.jsx              # Context + Provider for the simulator
    ├── portfolio.js               # Simulated portfolio data generation
    ├── helpers.js                 # Currency, date, and percentage formatting
    └── translations.js            # EN/ES/CA dictionaries + useT hook
```

## Tech stack

- **React 19** + **Vite 8**
- **ESLint 10** with React Hooks and React Refresh plugins
- **External APIs:** Polymarket (Java backend), CoinGecko, Yahoo Finance (reverse proxy)
- **Native SVG** for charts (no third-party charting libraries)

## Java backend configuration

Vite's dev server proxies `/api` routes to the Java backend. The configuration lives in `vite.config.js`:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

If your backend runs on a different port or domain, update the `target` value:

```js
target: 'http://localhost:8090'       // Example: different local port
target: 'https://your-backend.com'    // Example: remote
```

## Installation & development

```bash
# 1. Clone the repository
cd polymarket-frontend

# 2. Install dependencies
npm install

# 3. Start dev server (http://localhost:5173)
npm run dev
```

### Other commands

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm run build`    | Build for production into `/dist`  |
| `npm run preview`  | Preview the production build       |
| `npm run lint`     | Run ESLint across the project      |
