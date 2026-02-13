'use client';

import { EuviaLiveStats } from '@euvia/live';

export default function AdminPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <EuviaLiveStats
        serverUrl={process.env.NEXT_PUBLIC_EUVIA_URL || 'ws://localhost:3001'}
        maxPages={15}
        showPaths={true}
        className="shadow-lg"
      />
    </div>
  );
}
