'use client';

import { useEuviaStats } from '@euvia/live';
import { AllCharts } from '@/components/charts/AllCharts';
import { useEffect, useState } from 'react';

export default function CustomDashboard() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h'>('1h');
  const { stats, isConnected, isLoading, error, refresh } = useEuviaStats({
    serverUrl: process.env.NEXT_PUBLIC_EUVIA_URL || 'ws://localhost:3001',
    onConnect: () => console.info('Connected to Euvia'),
    onDisconnect: () => console.info('Disconnected from Euvia'),
  });

  const serverUrl = process.env.NEXT_PUBLIC_EUVIA_URL || 'http://localhost:3001';

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>No data available</div>
      </div>
    );
  }

  const totalDevices =
    stats.deviceBreakdown.mobile + stats.deviceBreakdown.desktop + stats.deviceBreakdown.tablet;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Custom Analytics</h1>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm text-gray-600">{isConnected ? 'Live' : 'Disconnected'}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Visitors */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Total Visitors</div>
            <div className="text-5xl font-bold text-indigo-600">{stats.totalVisitors}</div>
          </div>

          {/* Desktop */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Desktop</div>
            <div className="text-5xl font-bold text-blue-600">{stats.deviceBreakdown.desktop}</div>
            <div className="text-sm text-gray-500 mt-2">
              {totalDevices > 0
                ? `${Math.round((stats.deviceBreakdown.desktop / totalDevices) * 100)}%`
                : '0%'}
            </div>
          </div>

          {/* Mobile */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Mobile</div>
            <div className="text-5xl font-bold text-green-600">{stats.deviceBreakdown.mobile}</div>
            <div className="text-sm text-gray-500 mt-2">
              {totalDevices > 0
                ? `${Math.round((stats.deviceBreakdown.mobile / totalDevices) * 100)}%`
                : '0%'}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Top Pages</h2>

          {stats.topPages.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No page data available</div>
          ) : (
            <div className="space-y-3">
              {stats.topPages.slice(0, 10).map((page, index) => (
                <div
                  key={page.pageHash}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                    <div>
                      <div className="font-mono text-sm">{page.originalPath || page.pageHash}</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-indigo-600">{page.visitors}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historical Trends Section */}
        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Historical Trends</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('1h')}
                className={`px-4 py-2 rounded transition-colors ${
                  timeRange === '1h'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Last Hour
              </button>
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-4 py-2 rounded transition-colors ${
                  timeRange === '24h'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Last 24 Hours
              </button>
            </div>
          </div>
          <AllCharts serverUrl={serverUrl} timeRange={timeRange} autoRefresh={true} />
        </section>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Last updated: {new Date(stats.lastUpdate).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
