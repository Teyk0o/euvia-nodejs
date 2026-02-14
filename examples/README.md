# Euvia Analytics Examples

This directory contains example implementations of Euvia analytics in Next.js applications.

## Examples

### 1. Next.js App Router (`nextjs-app-router/`)

Modern Next.js 13+ example using the App Router.

**Pages:**

- `/` - Home page with overview and navigation
- `/admin` - Full dashboard with live stats and historical charts
- `/trends` - Historical trends with individual chart components
- `/custom-dashboard` - Custom implementation using `useEuviaStats` hook

**Key Features Demonstrated:**

- ✅ `EuviaTracker` - Automatic visitor tracking
- ✅ `EuviaLiveStats` - Real-time statistics component
- ✅ `EuviaCharts` - All-in-one charts wrapper
- ✅ Individual chart components (`TotalVisitorsChart`, `DeviceBreakdownChart`, `TopPagesChart`)
- ✅ `EuviaChartsProvider` - Context provider for custom layouts
- ✅ `useEuviaStats` - Hook for programmatic access to stats

### 2. Next.js Pages Router (`nextjs-pages-router/`)

Classic Next.js example using the Pages Router.

**Pages:**

- `/` - Home page
- `/admin` - Admin dashboard with live stats and charts

## Getting Started

### Prerequisites

1. **Redis Server** - Required for data storage

   ```bash
   # Install Redis (macOS)
   brew install redis
   brew services start redis

   # Or use Docker
   docker run -d -p 6379:6379 redis:latest
   ```

2. **Node.js** - Version 20 or higher

### Running the Examples

#### Option 1: Using the Development Workspace

From the repository root:

```bash
# Install dependencies
pnpm install

# Build the Euvia package
pnpm run build

# Start the Euvia server (in one terminal)
npx @euvia/live server

# Start the Next.js app (in another terminal)
cd examples/nextjs-app-router
pnpm run dev
```

#### Option 2: Standalone Example

```bash
cd examples/nextjs-app-router

# Install dependencies
pnpm install

# Start the Euvia server (in one terminal)
pnpm run euvia

# Start Next.js (in another terminal)
pnpm run dev
```

Visit `http://localhost:3000`

## Usage Examples

### 1. Basic Tracking

Add to your layout or page:

```tsx
import { EuviaTracker } from '@euvia/live';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <EuviaTracker serverUrl="http://localhost:3001" />
        {children}
      </body>
    </html>
  );
}
```

### 2. Live Statistics

Display real-time visitor stats:

```tsx
import { EuviaLiveStats } from '@euvia/live';

export default function AdminPage() {
  return (
    <div>
      <h1>Analytics</h1>
      <EuviaLiveStats serverUrl="http://localhost:3001" maxPages={10} showPaths={true} />
    </div>
  );
}
```

### 3. Historical Charts (Easy Mode)

Use the all-in-one wrapper:

```tsx
import { EuviaCharts } from '@euvia/live';

export default function TrendsPage() {
  return (
    <EuviaCharts
      serverUrl="http://localhost:3001"
      timeRange="1h" // or "24h"
      autoRefresh={true}
    />
  );
}
```

### 4. Historical Charts (Custom Layout)

Use individual components with provider:

```tsx
import {
  EuviaChartsProvider,
  TotalVisitorsChart,
  DeviceBreakdownChart,
  TopPagesChart,
} from '@euvia/live';

export default function CustomChartsPage() {
  return (
    <EuviaChartsProvider serverUrl="http://localhost:3001" timeRange="1h">
      <div className="grid grid-cols-2 gap-4">
        <TotalVisitorsChart />
        <DeviceBreakdownChart />
        <TopPagesChart />
      </div>
    </EuviaChartsProvider>
  );
}
```

### 5. Programmatic Access

Use the hook for custom implementations:

```tsx
import { useEuviaStats } from '@euvia/live';

export default function CustomDashboard() {
  const { stats, isConnected, isLoading, error } = useEuviaStats({
    serverUrl: 'http://localhost:3001',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Total Visitors: {stats?.totalVisitors}</h1>
      <p>Mobile: {stats?.deviceBreakdown.mobile}</p>
      <p>Desktop: {stats?.deviceBreakdown.desktop}</p>
    </div>
  );
}
```

## Environment Variables

Create a `.env.local` file:

```env
# Euvia server URL (WebSocket for live stats, HTTP for charts)
NEXT_PUBLIC_EUVIA_URL=http://localhost:3001

# Optional: Redis connection for the server
REDIS_URL=redis://localhost:6379
```

## Features Overview

### Real-time Features

- **Live Visitor Tracking** - WebSocket-based real-time updates
- **Device Breakdown** - Mobile, Desktop, Tablet categorization
- **Top Pages** - Most visited pages with optional path display
- **Connection Status** - Visual indicator for live connection

### Historical Features

- **Time-Series Charts** - Powered by Recharts
- **1-Hour Window** - Last 60 minutes with 1-minute snapshots
- **24-Hour Window** - Last 24 hours with 1-minute snapshots
- **Auto-Refresh** - Charts update every 60 seconds
- **Multiple Chart Types**:
  - Line chart for total visitors
  - Stacked area chart for device breakdown
  - Horizontal bar chart for top pages

### Privacy & Compliance

- **GDPR-Compliant** - No personal data stored
- **Path Hashing** - URLs are hashed (Base64) for anonymity
- **Auto-Expiring Data** - Real-time data expires after 5 minutes
- **No Cookies** - No tracking cookies used
- **No IP Storage** - IP addresses are never stored

## Architecture

```
┌─────────────────┐
│   Next.js App   │
│  (EuviaTracker) │
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐      ┌──────────┐
│  Euvia Server   │◄────►│  Redis   │
│  (Socket.io)    │      │          │
└────────┬────────┘      └──────────┘
         │
         ▼
┌─────────────────┐
│  Admin Dashboard│
│  (Live + Charts)│
└─────────────────┘
```

## Troubleshooting

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Check Redis connection from Node.js
node -e "const Redis = require('ioredis'); const redis = new Redis(); redis.ping().then(() => console.log('Connected!')).catch(console.error);"
```

### Charts Not Loading

1. **Check server URL** - Use `http://` (not `ws://`) for chart components
2. **Verify server is running** - `npx @euvia/live server`
3. **Check browser console** - Look for connection errors
4. **Wait for data** - Charts need at least 1 snapshot (wait 60 seconds)

### No Data Showing

1. **Visit some pages** - Generate traffic by navigating around
2. **Check EuviaTracker** - Ensure it's mounted in your layout
3. **Verify Redis** - Check if data is being stored: `redis-cli KEYS "euvia:*"`

## Learn More

- [Euvia Documentation](../../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Recharts Documentation](https://recharts.org)
- [Socket.io Documentation](https://socket.io/docs)

## License

MIT
