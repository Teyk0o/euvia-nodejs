'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useEuviaCharts } from '@euvia/live';

export function DeviceBreakdownChart() {
  const { data, loading, error } = useEuviaCharts();

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Loading chart data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f' }}>Error: {error}</div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No data available</div>
    );
  }

  const maxLength = Math.max(
    data.deviceBreakdown.mobile.length,
    data.deviceBreakdown.desktop.length,
    data.deviceBreakdown.tablet.length,
  );

  const chartData = [];
  for (let i = 0; i < maxLength; i++) {
    const timestamp =
      data.deviceBreakdown.mobile[i]?.timestamp ||
      data.deviceBreakdown.desktop[i]?.timestamp ||
      data.deviceBreakdown.tablet[i]?.timestamp;

    chartData.push({
      time: timestamp ? new Date(timestamp).toLocaleTimeString() : '',
      mobile: data.deviceBreakdown.mobile[i]?.value || 0,
      desktop: data.deviceBreakdown.desktop[i]?.value || 0,
      tablet: data.deviceBreakdown.tablet[i]?.value || 0,
    });
  }

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Device Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="desktop" stackId="1" stroke="#2196f3" fill="#2196f3" />
          <Area type="monotone" dataKey="mobile" stackId="1" stroke="#4caf50" fill="#4caf50" />
          <Area type="monotone" dataKey="tablet" stackId="1" stroke="#ff9800" fill="#ff9800" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
