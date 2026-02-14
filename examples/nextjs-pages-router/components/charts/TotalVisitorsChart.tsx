'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEuviaCharts } from '@euvia/live';

export function TotalVisitorsChart() {
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

  if (!data || data.totalVisitors.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No data available yet. Wait a few seconds for data to be collected...
      </div>
    );
  }

  const chartData = data.totalVisitors.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    visitors: point.value,
  }));

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
        Total Visitors Over Time
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="visitors" stroke="#2196f3" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
