'use client';

/**
 * EuviaLiveStats - Admin component to display live statistics
 */

import { useEuviaStats, type UseEuviaStatsOptions } from './useEuviaStats';
import { unhashPath } from '../shared/utils';

export interface EuviaLiveStatsProps extends UseEuviaStatsOptions {
  className?: string;
  showPaths?: boolean; // Show unhashed paths (default: true)
  maxPages?: number; // Max number of pages to display (default: 10)
  refreshInterval?: number; // Auto-refresh interval in ms (default: 5000)
}

export function EuviaLiveStats({
  serverUrl,
  autoConnect = true,
  className = '',
  showPaths = true,
  maxPages = 10,
  refreshInterval: _refreshInterval = 5000,
  onConnect,
  onDisconnect,
  onError,
}: EuviaLiveStatsProps) {
  const { stats, isConnected, isLoading, error } = useEuviaStats({
    serverUrl,
    autoConnect,
    onConnect,
    onDisconnect,
    onError,
  });

  if (isLoading) {
    return (
      <div className={`euvia-stats ${className}`}>
        <div className="euvia-loading">📊 Loading live stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`euvia-stats euvia-error ${className}`}>
        <div className="euvia-error-message">❌ Error: {error.message}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`euvia-stats ${className}`}>
        <div className="euvia-no-data">No data available</div>
      </div>
    );
  }

  const topPages = stats.topPages.slice(0, maxPages);
  const connectionStatus = isConnected ? '🟢 Live' : '🔴 Disconnected';

  return (
    <div className={`euvia-stats ${className}`}>
      <div className="euvia-header">
        <h2>🌐 Euvia Live Stats</h2>
        <span className="euvia-status">{connectionStatus}</span>
      </div>

      <div className="euvia-metric">
        <div className="euvia-metric-label">Total Visitors</div>
        <div className="euvia-metric-value">{stats.totalVisitors}</div>
      </div>

      <div className="euvia-section">
        <h3>📱 Device Breakdown</h3>
        <div className="euvia-devices">
          <div className="euvia-device">
            <span className="euvia-device-icon">🖥️</span>
            <span className="euvia-device-label">Desktop</span>
            <span className="euvia-device-count">{stats.deviceBreakdown.desktop}</span>
          </div>
          <div className="euvia-device">
            <span className="euvia-device-icon">📱</span>
            <span className="euvia-device-label">Mobile</span>
            <span className="euvia-device-count">{stats.deviceBreakdown.mobile}</span>
          </div>
          <div className="euvia-device">
            <span className="euvia-device-icon">📲</span>
            <span className="euvia-device-label">Tablet</span>
            <span className="euvia-device-count">{stats.deviceBreakdown.tablet}</span>
          </div>
        </div>
      </div>

      {topPages.length > 0 && (
        <div className="euvia-section">
          <h3>📊 Top Pages</h3>
          <div className="euvia-pages">
            {topPages.map((page, index) => (
              <div key={page.pageHash} className="euvia-page">
                <span className="euvia-page-rank">#{index + 1}</span>
                <span className="euvia-page-path">
                  {showPaths ? unhashPath(page.pageHash) : page.pageHash}
                </span>
                <span className="euvia-page-count">{page.visitors}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="euvia-footer">
        <small>Last update: {new Date(stats.lastUpdate).toLocaleTimeString()}</small>
      </div>

      <style>{`
        .euvia-stats {
          font-family:
            system-ui,
            -apple-system,
            sans-serif;
          max-width: 600px;
          padding: 1.5rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .euvia-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .euvia-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }
        .euvia-status {
          font-size: 0.9rem;
          font-weight: 500;
        }
        .euvia-metric {
          text-align: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }
        .euvia-metric-label {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }
        .euvia-metric-value {
          font-size: 3rem;
          font-weight: bold;
        }
        .euvia-section {
          margin-bottom: 1.5rem;
        }
        .euvia-section h3 {
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        .euvia-devices {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .euvia-device {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: #f7fafc;
          border-radius: 6px;
        }
        .euvia-device-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .euvia-device-label {
          font-size: 0.85rem;
          color: #718096;
          margin-bottom: 0.25rem;
        }
        .euvia-device-count {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .euvia-pages {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .euvia-page {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f7fafc;
          border-radius: 6px;
        }
        .euvia-page-rank {
          font-weight: bold;
          color: #667eea;
          min-width: 2rem;
        }
        .euvia-page-path {
          flex: 1;
          font-family: monospace;
          font-size: 0.9rem;
        }
        .euvia-page-count {
          font-weight: bold;
          color: #2d3748;
        }
        .euvia-footer {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          color: #718096;
        }
        .euvia-loading,
        .euvia-no-data {
          text-align: center;
          padding: 2rem;
          color: #718096;
        }
        .euvia-error {
          background: #fff5f5;
          border: 1px solid #fc8181;
        }
        .euvia-error-message {
          color: #c53030;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
}
