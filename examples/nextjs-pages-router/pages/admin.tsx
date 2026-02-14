import { EuviaLiveStats } from '@euvia/live';

export default function AdminPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">📊 Euvia Admin Dashboard</h1>

        <EuviaLiveStats
          serverUrl={process.env.NEXT_PUBLIC_EUVIA_URL || 'ws://localhost:3001'}
          className="mx-auto"
        />

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
