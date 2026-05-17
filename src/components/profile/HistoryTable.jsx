import { fmt, pct } from '../../utils/portfolio';

export default function HistoryTable({ history }) {
  return (
    <div className="user-card history-card">
      <h3>Investment History</h3>
      {history.length === 0 ? (
        <p className="empty-history">No investments yet.</p>
      ) : (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>Side</th>
                <th>Shares</th>
                <th>Entry Price</th>
                <th>Current Price</th>
                <th>Invested</th>
                <th>Value</th>
                <th>P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td className="td-question">{h.question}</td>
                  <td><span className={'side-badge ' + h.side.toLowerCase()}>{h.side}</span></td>
                  <td>{h.shares}</td>
                  <td>{pct(h.entryPrice)}</td>
                  <td>{pct(h.currentPrice)}</td>
                  <td>{fmt(h.invested)}</td>
                  <td>{fmt(h.currentValue)}</td>
                  <td className={h.pnl >= 0 ? 'positive' : 'negative'}>{fmt(h.pnl)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
