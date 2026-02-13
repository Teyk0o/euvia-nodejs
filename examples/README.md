# Euvia Examples

This directory contains example implementations of Euvia with different Next.js configurations.

## Examples

### Next.js App Router (Next.js 13+)

Located in `nextjs-app-router/`

Features:

- Server Components
- Client Components for admin dashboard
- Custom dashboard with `useEuviaStats` hook
- Environment variables configuration

### Next.js Pages Router

Located in `nextjs-pages-router/`

Features:

- Traditional Next.js setup
- `_app.tsx` integration
- Compatible with Next.js 12 and 13

## Quick Start

1. Start the Euvia server:

```bash
cd ../
pnpm install
pnpm run server
```

2. Set up your Next.js app:

```bash
cd examples/nextjs-app-router
pnpm install @euvia/live
```

3. Copy environment variables:

```bash
cp .env.example .env.local
```

4. Run the Next.js app:

```bash
pnpm run dev
```

5. Visit:

- Frontend: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin
- Custom Dashboard: http://localhost:3000/custom-dashboard

## Production Deployment

Update `.env.production`:

```bash
NEXT_PUBLIC_EUVIA_URL=wss://analytics.yourdomain.com
```

Ensure your Euvia server is deployed and accessible via WSS (WebSocket Secure).
