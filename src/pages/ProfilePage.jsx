import { useMemo, useState } from 'react';
import { fmt, pct, genPortfolio, genData } from '../utils/portfolio';
import PnLChart from '../components/profile/PnLChart';
import WalletModal from '../components/modal/WalletModal';
import HistoryTable from '../components/profile/HistoryTable';

const USER = {
  name: 'Violeta User',
  email: 'user@violeta.explorer',
  wallet: '0x7429c3b8f5a1e6d4b2c8f0a3e7d5b9c1a4f6e8d0',
  joined: 'March 2025',
  avatar: null,
};

export default function ProfilePage({ markets }) {
  const portfolio = useMemo(() => genPortfolio(markets), [markets]);
  const [period, setPeriod] = useState('1W');
  const chartData = useMemo(() => genData(period), [period]);
  const [walletModal, setWalletModal] = useState(null);

  function handleCopy() { navigator.clipboard?.writeText(USER.wallet); }

  return (
    <div className="user-page">
      <div className="user-grid">
        <div className="user-card profile-card">
          <div className="avatar">
            {USER.avatar ? <img src={USER.avatar} alt="" /> : <span className="avatar-letter">V</span>}
          </div>
          <h2 className="user-name">{USER.name}</h2>
          <p className="user-email">{USER.email}</p>
          <p className="user-joined">{USER.joined}</p>
          <div className="wallet-box">
            <div className="wallet-label">Wallet</div>
            <div className="wallet-address">
              <span className="addr">{USER.wallet.slice(0,6)}&hellip;{USER.wallet.slice(-4)}</span>
              <button className="copy-btn" onClick={handleCopy} title="Copy address">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
            <div className="wallet-status inactive">
              <span className="status-dot" /> Disconnected
            </div>
            <div className="wallet-actions">
              <button className="wallet-action-btn deposit" onClick={() => setWalletModal('deposit')}>Deposit</button>
              <button className="wallet-action-btn withdraw" onClick={() => setWalletModal('withdraw')}>Withdraw</button>
            </div>
          </div>
        </div>
        <div className="user-card portfolio-summary">
          <h3>Portfolio</h3>
          <div className="stats-row">
            <div className="stat">
              <span className="stat-label">Total Invested</span>
              <span className="stat-value">{fmt(portfolio.invested)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Current Value</span>
              <span className="stat-value">{fmt(portfolio.value)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Profit / Loss</span>
              <span className={'stat-value ' + (portfolio.pnl >= 0 ? 'positive' : 'negative')}>
                {fmt(portfolio.pnl)}
                <span className="stat-pct">{pct(portfolio.pnl / (portfolio.invested || 1))}</span>
              </span>
            </div>
          </div>
          <PnLChart data={chartData} period={period} setPeriod={setPeriod} />
        </div>
      </div>
      <HistoryTable history={portfolio.history} />
      {walletModal && <WalletModal mode={walletModal} onClose={() => setWalletModal(null)} />}
    </div>
  );
}
