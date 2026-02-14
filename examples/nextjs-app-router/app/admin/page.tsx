'use client';

import { EuviaLiveStats } from '@euvia/live';
import { AllCharts } from '@/components/charts/AllCharts';
import { useState } from 'react';

export default function AdminPage() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h'>('1h');
  const serverUrl = process.env.NEXT_PUBLIC_EUVIA_URL || 'http://localhost:3001';

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      {/* Live Stats Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Real-time Statistics</h2>
        <EuviaLiveStats
          serverUrl={serverUrl}
          maxPages={15}
          showPaths={true}
          className="shadow-lg"
        />
      </section>

      {/* Historical Trends Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Historical Trends</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('1h')}
              className={`px-4 py-2 rounded ${
                timeRange === '1h'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Last Hour
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-4 py-2 rounded ${
                timeRange === '24h'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Last 24 Hours
            </button>
          </div>
        </div>
        <AllCharts serverUrl={serverUrl} timeRange={timeRange} autoRefresh={true} />
      </section>
    </div>
  );
}
