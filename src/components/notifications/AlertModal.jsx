import { useState, useEffect } from 'react';
import { useNotifications } from '../../utils/notifications';

export default function AlertModal({ market, onClose }) {
  const { createAlert, alerts } = useNotifications();
  const [type, setType] = useState('PRICE_TARGET');
  const [condition, setCondition] = useState('ABOVE');
  const [targetPrice, setTargetPrice] = useState('');
  const [targetPercent, setTargetPercent] = useState('');

  const existingAlerts = alerts.filter(a => a.marketId === market?.id);

  useEffect(() => {
    if (market?._prices) {
      const price = Number(market._prices[0]) || 0.5;
      setTargetPrice((price * 1.1).toFixed(3));
      setTargetPercent('5');
    }
  }, [market]);

  if (!market) return null;

  function handleSubmit(e) {
    e.preventDefault();
    createAlert({
      marketId: market.id,
      marketQuestion: market.question,
      type,
      condition: type === 'PRICE_TARGET' ? condition : null,
      targetPrice: type === 'PRICE_TARGET' ? Number(targetPrice) : null,
      targetPercent: type === 'PERCENTAGE_CHANGE' ? Number(targetPercent) : null,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-alert" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Alerta</h2>
          <button className="modal-close" onClick={onClose}>&#10005;</button>
        </div>
        <p className="modal-question">{market.question}</p>

        <form onSubmit={handleSubmit}>
          <label className="alert-label">Tipo de alerta</label>
          <select className="alert-select" value={type} onChange={e => setType(e.target.value)}>
            <option value="PRICE_TARGET">Precio objetivo</option>
            <option value="PERCENTAGE_CHANGE">Cambio porcentual</option>
            <option value="MARKET_CLOSE">Cierre del mercado</option>
          </select>

          {type === 'PRICE_TARGET' && (
            <>
              <label className="alert-label">Condici&oacute;n</label>
              <select className="alert-select" value={condition} onChange={e => setCondition(e.target.value)}>
                <option value="ABOVE">Supere el precio</option>
                <option value="BELOW">Baje del precio</option>
              </select>
              <label className="alert-label">Precio objetivo</label>
              <input className="amount-input" type="number" step="0.001" min="0" max="1"
                value={targetPrice} onChange={e => setTargetPrice(e.target.value)} />
            </>
          )}

          {type === 'PERCENTAGE_CHANGE' && (
            <>
              <label className="alert-label">Cambio (%)</label>
              <input className="amount-input" type="number" step="0.1" min="0.1"
                value={targetPercent} onChange={e => setTargetPercent(e.target.value)} />
            </>
          )}

          {type === 'MARKET_CLOSE' && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
              Recibir&aacute;s una notificaci&oacute;n cuando este mercado cierre.
            </p>
          )}

          <button className="place-btn" type="submit" style={{ marginTop: 16 }}>
            Crear Alerta
          </button>
        </form>

        {existingAlerts.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4 style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>Alertas activas para este mercado</h4>
            {existingAlerts.map(a => (
              <div key={a.id} className="existing-alert">
                <span>{a.type === 'PRICE_TARGET' ? `Precio ${a.condition === 'ABOVE' ? '>' : '<'} ${(a.targetPrice * 100).toFixed(0)}%` : a.type === 'PERCENTAGE_CHANGE' ? `Cambio >${a.targetPercent}%` : 'Cierre'}</span>
                <span style={{ color: a.triggered ? 'var(--yes)' : 'var(--text-muted)', fontSize: 12 }}>
                  {a.triggered ? 'Activada' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
