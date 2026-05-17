import { createContext, useContext } from 'react';

const translations = {
  en: {
    header: { title: 'Violeta Explorer', subtitle: 'Powered by Polymarket' },
    home: {
      explore: 'Explore Markets',
      totalVolume: 'Total Volume',
      activeMarkets: 'Active Markets',
      categories: 'Categories',
      trending: 'Trending Markets',
      browseBy: 'Browse by Category',
    },
    categories: {
      all: 'All', sports: 'Sports', politics: 'Politics', crypto: 'Crypto',
      pop: 'Pop Culture', tech: 'Science & Tech', esports: 'eSports',
    },
    toolbar: {
      markets: 'Markets', sortBy: 'Sort by',
      vol24h: '24h Volume', volume: 'Total Volume',
      liquidity: 'Liquidity', endDate: 'End Date', newest: 'Newest',
      filter: 'Status', all: 'All', active: 'Active', closed: 'Closed',
    },
    market: { vol: 'vol', ended: 'Ended', today: 'Today', dLeft: 'd left', bet: 'Bet' },
    modal: {
      placeBet: 'Place Bet', placeOrder: 'Place Order',
      amount: 'Amount (USDC)', pricePerShare: 'Price per share:',
      sharesPreview: 'You will receive ~{n} shares of {label}',
      bonus: 'Free bonus applied!',
      submitted: 'Order Submitted \u2713', done: 'Done',
      disclaimer: 'This is a demo simulation. No real order will be placed.',
      market: 'Market', side: 'Side', amount: 'Amount',
      avgPrice: 'Avg Price', shares: 'Shares', status: 'Status',
      filled: 'Filled \u2713', txHash: 'Tx Hash',
    },
    error: { loading: 'Error loading markets:', retry: 'Retry', empty: 'No markets found in this category.' },
    loadMore: 'Load More',
  },
  es: {
    header: { title: 'Violeta Explorer', subtitle: 'Con la tecnolog\u00eda de Polymarket' },
    home: {
      explore: 'Explorar Mercados',
      totalVolume: 'Volumen Total',
      activeMarkets: 'Mercados Activos',
      categories: 'Categor\u00edas',
      trending: 'Mercados Destacados',
      browseBy: 'Explorar por Categor\u00eda',
    },
    categories: {
      all: 'Todos', sports: 'Deportes', politics: 'Pol\u00edtica', crypto: 'Cripto',
      pop: 'Cultura Pop', tech: 'Ciencia y Tecnolog\u00eda', esports: 'eSports',
    },
    toolbar: {
      markets: 'Mercados', sortBy: 'Ordenar por',
      vol24h: 'Volumen 24h', volume: 'Volumen Total',
      liquidity: 'Liquidez', endDate: 'Fecha Fin', newest: 'M\u00e1s Recientes',
      filter: 'Estado', all: 'Todos', active: 'Activos', closed: 'Finalizados',
    },
    market: { vol: 'vol', ended: 'Finalizado', today: 'Hoy', dLeft: 'd restantes', bet: 'Apostar' },
    modal: {
      placeBet: 'Colocar Apuesta', placeOrder: 'Colocar Orden',
      amount: 'Cantidad (USDC)', pricePerShare: 'Precio por acci\u00f3n:',
      sharesPreview: 'Recibir\u00e1s ~{n} acciones de {label}',
      bonus: '\u00a1Bono gratis aplicado!',
      submitted: 'Orden Enviada \u2713', done: 'Hecho',
      disclaimer: 'Esta es una simulaci\u00f3n de demostraci\u00f3n. No se realizar\u00e1 ninguna orden real.',
      market: 'Mercado', side: 'Lado', amount: 'Cantidad',
      avgPrice: 'Precio Promedio', shares: 'Acciones', status: 'Estado',
      filled: 'Ejecutada \u2713', txHash: 'Hash Tx',
    },
    error: { loading: 'Error al cargar mercados:', retry: 'Reintentar', empty: 'No se encontraron mercados en esta categoria.' },
    loadMore: 'Cargar Mas',
  },
  ca: {
    header: { title: 'Violeta Explorer', subtitle: 'Amb la tecnologia de Polymarket' },
    home: {
      explore: 'Explorar Mercats',
      totalVolume: 'Volum Total',
      activeMarkets: 'Mercats Actius',
      categories: 'Categories',
      trending: 'Mercats Destacats',
      browseBy: 'Explorar per Categoria',
    },
    categories: {
      all: 'Tots', sports: 'Esports', politics: 'Pol\u00edtica', crypto: 'Cripto',
      pop: 'Cultura Pop', tech: 'Ci\u00e8ncia i Tecnologia', esports: 'eSports',
    },
    toolbar: {
      markets: 'Mercats', sortBy: 'Ordenar per',
      vol24h: 'Volum 24h', volume: 'Volum Total',
      liquidity: 'Liquiditat', endDate: 'Data Fi', newest: 'M\u00e9s Recents',
      filter: 'Estat', all: 'Tots', active: 'Actius', closed: 'Finalitzats',
    },
    market: { vol: 'vol', ended: 'Finalitzat', today: 'Avui', dLeft: 'd restants', bet: 'Apostar' },
    modal: {
      placeBet: 'Fer Aposta', placeOrder: 'Fer Ordre',
      amount: 'Quantitat (USDC)', pricePerShare: 'Preu per acci\u00f3:',
      sharesPreview: 'Rebr\u00e0s ~{n} accions de {label}',
      bonus: 'Bonificaci\u00f3 aplicada!',
      submitted: 'Ordre Enviada \u2713', done: 'Fet',
      disclaimer: 'Aix\u00f2 \u00e9s una simulaci\u00f3 de demostraci\u00f3. No es realitzar\u00e0 cap ordre real.',
      market: 'Mercat', side: 'Costat', amount: 'Quantitat',
      avgPrice: 'Preu Promig', shares: 'Accions', status: 'Estat',
      filled: 'Executada \u2713', txHash: 'Hash Tx',
    },
    error: { loading: 'Error en carregar mercats:', retry: 'Reintentar', empty: 'No s\'han trobat mercats en aquesta categoria.' },
    loadMore: 'Carregar M\u00e9s',
  },
};

export const LocaleContext = createContext();

export function t(lang, path, replacements = {}) {
  const keys = path.split('.');
  let value = translations[lang];
  for (const key of keys) {
    if (value == null) return path;
    value = value[key];
  }
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (_, k) => replacements[k] ?? `{${k}}`);
  }
  return value ?? path;
}

export function useT() {
  const { lang } = useContext(LocaleContext);
  return (path, replacements) => t(lang, path, replacements);
}
