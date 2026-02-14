'use client';

import { EuviaChartsProvider } from '@euvia/live';
import { TotalVisitorsChart } from './TotalVisitorsChart';
import { DeviceBreakdownChart } from './DeviceBreakdownChart';
import { TopPagesChart } from './TopPagesChart';

interface AllChartsProps {
  serverUrl: string;
  timeRange?: '1h' | '24h';
  autoRefresh?: boolean;
}

export function AllCharts({ serverUrl, timeRange = '1h', autoRefresh = true }: AllChartsProps) {
  return (
    <EuviaChartsProvider serverUrl={serverUrl} timeRange={timeRange} autoRefresh={autoRefresh}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          padding: '20px',
        }}
      >
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
          <TotalVisitorsChart />
        </div>
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
          <DeviceBreakdownChart />
        </div>
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
          <TopPagesChart />
        </div>
      </div>
    </EuviaChartsProvider>
  );
}
