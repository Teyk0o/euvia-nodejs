import { EuviaLiveStats } from '@euvia/live';
import { AllCharts } from '../components/charts/AllCharts';
import { useState } from 'react';

export default function AdminPage() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h'>('1h');
  const serverUrl = process.env.NEXT_PUBLIC_EUVIA_URL || 'http://localhost:3001';

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">📊 Euvia Admin Dashboard</h1>

        {/* Live Stats Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-center">Real-time Statistics</h2>
          <EuviaLiveStats serverUrl={serverUrl} className="mx-auto" />
        </section>

        {/* Historical Trends Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Historical Trends</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('1h')}
                className={`px-4 py-2 rounded transition-colors ${
                  timeRange === '1h'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Last Hour
              </button>
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-4 py-2 rounded transition-colors ${
                  timeRange === '24h'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Last 24 Hours
              </button>
            </div>
          </div>
          <AllCharts serverUrl={serverUrl} timeRange={timeRange} autoRefresh={true} />
        </section>

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
