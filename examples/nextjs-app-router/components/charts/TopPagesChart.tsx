'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useEuviaCharts } from '@euvia/live';

export function TopPagesChart() {
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

  if (!data || data.topPages.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No data available</div>
    );
  }

  const chartData = data.topPages.map((page) => {
    const latestDataPoint = page.dataPoints[page.dataPoints.length - 1];
    return {
      page: page.originalPath || page.pageHash,
      visitors: latestDataPoint?.value || 0,
    };
  });

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
        Top Pages by Visitors
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="page" type="category" width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey="visitors" fill="#9c27b0" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
