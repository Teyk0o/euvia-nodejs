export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Euvia Analytics Demo</h1>
        <p className="text-xl mb-12 text-gray-600">
          GDPR-compliant real-time analytics for Next.js with historical trends
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a
            href="/admin"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-lg shadow-lg transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="text-lg">Admin Dashboard</div>
            <div className="text-sm opacity-90 mt-2">Live stats + Charts</div>
          </a>

          <a
            href="/trends"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-6 rounded-lg shadow-lg transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">📈</div>
            <div className="text-lg">Historical Trends</div>
            <div className="text-sm opacity-90 mt-2">1h & 24h charts</div>
          </a>

          <a
            href="/custom-dashboard"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-6 rounded-lg shadow-lg transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="text-lg">Custom Dashboard</div>
            <div className="text-sm opacity-90 mt-2">useEuviaStats hook</div>
          </a>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 text-left">
          <h2 className="text-xl font-semibold mb-3">✨ Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Real-time visitor tracking with WebSockets</li>
            <li>✅ Historical trends (1h & 24h) with Recharts</li>
            <li>✅ Device breakdown (Mobile, Desktop, Tablet)</li>
            <li>✅ Top pages analytics</li>
            <li>✅ GDPR-compliant (no personal data stored)</li>
            <li>✅ Redis-based with auto-expiring data</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
