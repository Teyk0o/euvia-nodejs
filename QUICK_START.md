# Quick Start Guide

Get Euvia running in 5 minutes.

## 1. Install Dependencies

```bash
pnpm install @euvia/live
```

## 2. Start Server

### Option A: Docker (Recommended)

```bash
git clone https://github.com/Teyk0o/euvia-nodejs
cd euvia-nodejs
docker-compose up -d
```

### Option B: Local

```bash
# Start Redis
redis-server

# Start Euvia
npx @euvia/live server
```

Server will run on: `ws://localhost:3001`

## 3. Add to Your Next.js App

### App Router (Next.js 13+)

```tsx
// app/layout.tsx
import { EuviaTracker } from '@euvia/live';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <EuviaTracker serverUrl="ws://localhost:3001" />
      </body>
    </html>
  );
}
```

### Pages Router

```tsx
// pages/_app.tsx
import { EuviaTracker } from '@euvia/live';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <EuviaTracker serverUrl="ws://localhost:3001" />
    </>
  );
}
```

## 4. View Statistics

### Option A: Built-in Component

```tsx
// app/admin/page.tsx
'use client';

import { EuviaLiveStats } from '@euvia/live';

export default function AdminPage() {
  return <EuviaLiveStats serverUrl="ws://localhost:3001" />;
}
```

### Option B: Custom Hook

```tsx
'use client';

import { useEuviaStats } from '@euvia/live';

export default function Dashboard() {
  const { stats } = useEuviaStats({
    serverUrl: 'ws://localhost:3001',
  });

  return (
    <div>
      <h1>Visitors: {stats?.totalVisitors || 0}</h1>
    </div>
  );
}
```

## 5. Test It

1. Start your Next.js app: `pnpm run dev`
2. Visit your homepage
3. Open `/admin` to see live stats
4. Open multiple tabs to see visitor count increase

## Production Deployment

### Update serverUrl to use WSS

```tsx
<EuviaTracker serverUrl="wss://analytics.yourdomain.com" />
```

### Deploy Server

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## Environment Variables

Create `.env.local` in your Next.js project:

```bash
NEXT_PUBLIC_EUVIA_URL=ws://localhost:3001
```

Then use:

```tsx
<EuviaTracker serverUrl={process.env.NEXT_PUBLIC_EUVIA_URL} />
```

## Troubleshooting

**WebSocket connection fails:**

- Ensure Euvia server is running
- Check server URL is correct (ws:// not http://)
- Verify firewall allows port 3001

**No stats showing:**

- Visit some pages first to generate data
- Check server logs: `docker-compose logs -f`
- Verify Redis is running

**CORS errors:**

- Add your domain to CORS_ORIGINS in server .env
- Example: `CORS_ORIGINS=http://localhost:3000,https://yourdomain.com`

## Next Steps

- Read full [README.md](README.md)
- Explore [API Documentation](docs/API.md)
- Check [Deployment Guide](docs/DEPLOYMENT.md)
- Review [Examples](examples/README.md)

## Support

- Issues: https://github.com/Teyk0o/euvia-nodejs/issues
- Discussions: https://github.com/Teyk0o/euvia-nodejs/discussions
