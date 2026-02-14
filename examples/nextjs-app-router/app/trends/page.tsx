'use client';

import { EuviaChartsProvider, useEuviaCharts } from '@euvia/live';
import { TotalVisitorsChart } from '@/components/charts/TotalVisitorsChart';
import { DeviceBreakdownChart } from '@/components/charts/DeviceBreakdownChart';
import { TopPagesChart } from '@/components/charts/TopPagesChart';

function ChartsContent() {
  const { timeRange, setTimeRange, loading, error } = useEuviaCharts();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Historical Trends</h1>
          <p className="text-gray-600 mb-6">
            This example shows individual chart components with custom layouts
          </p>

          {/* Time Range Toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setTimeRange('1h')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                timeRange === '1h'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Last Hour
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                timeRange === '24h'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Last 24 Hours
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading charts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <p className="text-red-800 font-semibold">Error loading data:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Charts Grid */}
        {!loading && !error && (
          <div className="space-y-8">
            {/* Total Visitors Chart - Full Width */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <TotalVisitorsChart />
            </div>

            {/* Device Breakdown and Top Pages - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <DeviceBreakdownChart />
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <TopPagesChart />
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 About This Example</h3>
          <p className="text-blue-800">
            This page demonstrates using individual chart components with{' '}
            <code className="bg-blue-100 px-2 py-1 rounded">EuviaChartsProvider</code> for custom
            layouts. Charts auto-refresh every 60 seconds and share the same context.
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a href="/" className="text-indigo-600 hover:text-indigo-800 underline">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TrendsPage() {
  const serverUrl = process.env.NEXT_PUBLIC_EUVIA_URL || 'http://localhost:3001';

  return (
    <EuviaChartsProvider serverUrl={serverUrl} timeRange="1h" autoRefresh={true}>
      <ChartsContent />
    </EuviaChartsProvider>
  );
}
