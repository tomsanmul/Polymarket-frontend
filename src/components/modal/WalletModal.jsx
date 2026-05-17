import { useState } from 'react';

const USER_WALLET = '0x7429c3b8f5a1e6d4b2c8f0a3e7d5b9c1a4f6e8d0';

export default function WalletModal({ mode, onClose }) {
  const [amount, setAmount] = useState('');
  const label = mode === 'deposit' ? 'Deposit' : 'Withdraw';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{label}</h2>
          <button className="modal-close" onClick={onClose}>&#10005;</button>
        </div>
        <p className="modal-question" style={{marginBottom:8}}>
          {label} USDC to your wallet
        </p>
        <div className="wallet-addr-display">{USER_WALLET.slice(0,6)}&hellip;{USER_WALLET.slice(-4)}</div>
        <input className="amount-input" type="number" placeholder="Amount (USDC)" value={amount} onChange={e => setAmount(e.target.value)} min="1" />
        <button className="place-btn" disabled={!amount || amount <= 0} onClick={() => { alert('Simulated ' + mode + ' of ' + amount + ' USDC'); onClose(); }}>
          {label}
        </button>
      </div>
    </div>
  );
}
