# API Documentation

Complete API reference for @euvia/live.

## Client API

### Components

#### `<EuviaTracker />`

Invisible tracking component for visitor analytics.

```tsx
import { EuviaTracker } from '@euvia/live';

<EuviaTracker
  serverUrl="wss://analytics.yourdomain.com"
  heartbeatInterval={60000}
  enabled={true}
  onConnect={() => console.log('Connected')}
  onDisconnect={() => console.log('Disconnected')}
  onError={(error) => console.error('Error:', error)}
/>;
```

**Props:**

| Prop                | Type                     | Required | Default | Description                            |
| ------------------- | ------------------------ | -------- | ------- | -------------------------------------- |
| `serverUrl`         | `string`                 | Yes      | -       | WebSocket server URL (ws:// or wss://) |
| `heartbeatInterval` | `number`                 | No       | `60000` | Heartbeat interval in milliseconds     |
| `enabled`           | `boolean`                | No       | `true`  | Enable/disable tracking                |
| `onConnect`         | `() => void`             | No       | -       | Called when WebSocket connects         |
| `onDisconnect`      | `() => void`             | No       | -       | Called when WebSocket disconnects      |
| `onError`           | `(error: Error) => void` | No       | -       | Called on connection error             |

**Behavior:**

- Renders nothing (null component)
- Automatically sends heartbeat on interval
- Handles reconnection automatically
- Cleans up on unmount

---

#### `<EuviaLiveStats />`

Pre-built component for displaying live statistics.

```tsx
import { EuviaLiveStats } from '@euvia/live';

<EuviaLiveStats
  serverUrl="wss://analytics.yourdomain.com"
  autoConnect={true}
  className="my-custom-class"
  showPaths={true}
  maxPages={10}
  refreshInterval={5000}
/>;
```

**Props:**

| Prop              | Type                     | Required | Default | Description                  |
| ----------------- | ------------------------ | -------- | ------- | ---------------------------- |
| `serverUrl`       | `string`                 | Yes      | -       | WebSocket server URL         |
| `autoConnect`     | `boolean`                | No       | `true`  | Auto-connect on mount        |
| `className`       | `string`                 | No       | `''`    | Custom CSS class name        |
| `showPaths`       | `boolean`                | No       | `true`  | Show unhashed original paths |
| `maxPages`        | `number`                 | No       | `10`    | Maximum pages to display     |
| `refreshInterval` | `number`                 | No       | `5000`  | Auto-refresh interval (ms)   |
| `onConnect`       | `() => void`             | No       | -       | Connection callback          |
| `onDisconnect`    | `() => void`             | No       | -       | Disconnection callback       |
| `onError`         | `(error: Error) => void` | No       | -       | Error callback               |

**Styling:**

The component includes inline styles but can be customized via `className` prop or by overriding CSS classes:

- `.euvia-stats` - Main container
- `.euvia-header` - Header section
- `.euvia-metric` - Metric card
- `.euvia-devices` - Device grid
- `.euvia-pages` - Pages list

---

### Hooks

#### `useEuviaStats(options)`

React hook for building custom analytics dashboards.

```tsx
import { useEuviaStats } from '@euvia/live';

const { stats, isConnected, isLoading, error, refresh, connect, disconnect } = useEuviaStats({
  serverUrl: 'wss://analytics.yourdomain.com',
  autoConnect: true,
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected'),
  onError: (err) => console.error(err),
});
```

**Options:**

```typescript
{
  serverUrl: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}
```

**Returns:**

```typescript
{
  stats: LiveStats | null;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  connect: () => void;
  disconnect: () => void;
}
```

**Usage Example:**

```tsx
function CustomDashboard() {
  const { stats, isConnected, refresh } = useEuviaStats({
    serverUrl: 'wss://analytics.yourdomain.com',
  });

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1>Visitors: {stats.totalVisitors}</h1>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

---

## Server API

### createEuviaServer(config)

Factory function to create an Euvia server instance.

```typescript
import { createEuviaServer } from '@euvia/live/server';

const server = createEuviaServer({
  port: 3001,
  redisUrl: 'redis://localhost:6379',
  statsTTL: 300,
  corsOrigins: ['https://yourdomain.com'],
  broadcastInterval: 2000,
});

await server.start();
```

**Config Options:**

```typescript
interface EuviaServerConfig {
  port?: number; // Default: 3001
  redisUrl?: string; // Default: 'redis://localhost:6379'
  statsTTL?: number; // Default: 300 (seconds)
  corsOrigins?: string[]; // Default: ['*']
  broadcastInterval?: number; // Default: 2000 (ms)
}
```

**Methods:**

```typescript
class EuviaServer {
  async start(): Promise<void>;
  async stop(): Promise<void>;
  getApp(): express.Application;
  getIO(): SocketServer;
  getRedis(): Redis;
}
```

---

## HTTP Endpoints

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": 1708012345678,
  "redis": "ready"
}
```

**Status Codes:**

- `200`: Server is healthy
- `500`: Server error

---

### GET /info

Server information endpoint.

**Response:**

```json
{
  "name": "@euvia/live",
  "version": "1.0.0",
  "uptime": 12345.67,
  "connections": 42
}
```

---

## WebSocket Events

### Client → Server

#### `visitor:heartbeat`

Send visitor heartbeat data.

**Payload:**

```typescript
{
  pageHash: string;
  deviceCategory: 'mobile' | 'desktop' | 'tablet';
  screenBucket: string;
  timestamp: number;
}
```

**Example:**

```typescript
socket.emit('visitor:heartbeat', {
  pageHash: 'L2hvbWU=',
  deviceCategory: 'desktop',
  screenBucket: '1920x1080',
  timestamp: Date.now(),
});
```

---

#### `visitor:disconnect`

Notify server of visitor disconnect.

**Payload:** None

---

#### `admin:subscribe`

Subscribe to live statistics updates.

**Payload:** None

**Response:** Immediate `stats:update` event

---

#### `admin:unsubscribe`

Unsubscribe from statistics updates.

**Payload:** None

---

### Server → Client

#### `connection:ack`

Acknowledgement of successful connection.

**Payload:** None

---

#### `stats:update`

Live statistics update (sent to admin subscribers).

**Payload:**

```typescript
{
  totalVisitors: number;
  topPages: Array<{
    pageHash: string;
    originalPath?: string;
    visitors: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  }
  lastUpdate: number;
}
```

**Example:**

```typescript
socket.on('stats:update', (stats) => {
  console.log(`Total visitors: ${stats.totalVisitors}`);
  console.log(`Top page: ${stats.topPages[0]?.originalPath}`);
});
```

---

## Type Definitions

### VisitorData

```typescript
interface VisitorData {
  pageHash: string;
  deviceCategory: 'mobile' | 'desktop' | 'tablet';
  screenBucket: string;
  timestamp: number;
}
```

### LiveStats

```typescript
interface LiveStats {
  totalVisitors: number;
  topPages: PageStats[];
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  lastUpdate: number;
}
```

### PageStats

```typescript
interface PageStats {
  pageHash: string;
  originalPath?: string;
  visitors: number;
}
```

---

## Utility Functions

### hashPath(pathname)

Hash a pathname to base64 for anonymity.

```typescript
import { hashPath } from '@euvia/live';

const hash = hashPath('/about'); // 'L2Fib3V0'
```

### unhashPath(hash)

Reverse a hashed path back to original.

```typescript
import { unhashPath } from '@euvia/live';

const path = unhashPath('L2Fib3V0'); // '/about'
```

### getDeviceCategory(userAgent)

Categorize user agent into device type.

```typescript
import { getDeviceCategory } from '@euvia/live';

const device = getDeviceCategory(navigator.userAgent);
// 'mobile' | 'desktop' | 'tablet'
```

### getScreenBucket()

Get bucketed screen resolution.

```typescript
import { getScreenBucket } from '@euvia/live';

const bucket = getScreenBucket(); // '1920x1080'
```

---

## Error Handling

### Client Errors

```typescript
<EuviaTracker
  serverUrl="wss://analytics.yourdomain.com"
  onError={(error) => {
    if (error.message.includes('timeout')) {
      // Handle timeout
    } else if (error.message.includes('refused')) {
      // Server unavailable
    }
  }}
/>
```

### Server Errors

Server errors are logged to console. Configure logging:

```typescript
const server = createEuviaServer(config);

server.getRedis().on('error', (err) => {
  console.error('Redis error:', err);
  // Send to error tracking service
});
```

---

## Rate Limiting

Implement rate limiting at reverse proxy level:

**Nginx:**

```nginx
limit_req_zone $binary_remote_addr zone=euvia:10m rate=10r/s;
limit_req zone=euvia burst=20 nodelay;
```

**Express Middleware:**

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
});

const server = createEuviaServer(config);
server.getApp().use(limiter);
```

---

## Environment Variables

| Variable       | Default                  | Description                            |
| -------------- | ------------------------ | -------------------------------------- |
| `PORT`         | `3001`                   | Server port                            |
| `REDIS_URL`    | `redis://localhost:6379` | Redis connection URL                   |
| `STATS_TTL`    | `300`                    | Stats TTL in seconds                   |
| `CORS_ORIGINS` | `*`                      | Allowed CORS origins (comma-separated) |
| `NODE_ENV`     | `development`            | Environment mode                       |

---

## CLI Commands

```bash
# Start server
npx @euvia/live server

# With options
npx @euvia/live server \
  --port 3001 \
  --redis redis://localhost:6379 \
  --ttl 300 \
  --cors "https://example.com"

# Help
npx @euvia/live --help
```
