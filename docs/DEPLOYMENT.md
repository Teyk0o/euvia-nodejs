# Deployment Guide

This guide covers deploying Euvia server to production environments.

## Prerequisites

- Node.js 20+
- Redis 7+
- Domain name with SSL certificate
- Reverse proxy (nginx, Caddy, or similar)

## Deployment Options

### 1. Docker Deployment (Recommended)

#### Step 1: Clone Repository

```bash
git clone https://github.com/Teyk0o/euvia-nodejs
cd euvia-nodejs
```

#### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
NODE_ENV=production
PORT=3001
REDIS_URL=redis://redis:6379
STATS_TTL=300
CORS_ORIGINS=https://yourdomain.com
```

#### Step 3: Build and Start

```bash
docker-compose up -d
```

#### Step 4: Verify

```bash
# Check logs
docker-compose logs -f euvia-server

# Test health endpoint
curl http://localhost:3001/health
```

### 2. VPS/Bare Metal Deployment

#### Step 1: Install Dependencies

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Redis
sudo apt-get install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

#### Step 2: Clone and Build

```bash
git clone https://github.com/Teyk0o/euvia-nodejs
cd euvia-nodejs
npm install
npm run build
```

#### Step 3: Configure Environment

```bash
cp .env.example .env
nano .env
```

#### Step 4: Create Systemd Service

```bash
sudo nano /etc/systemd/system/euvia.service
```

```ini
[Unit]
Description=Euvia Live Analytics Server
After=network.target redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/euvia-nodejs
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /opt/euvia-nodejs/dist/cli.js server
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable euvia
sudo systemctl start euvia
```

#### Step 5: Verify

```bash
sudo systemctl status euvia
journalctl -u euvia -f
```

### 3. Cloud Platforms

#### Railway

1. Fork repository
2. Connect to Railway
3. Add Redis plugin
4. Set environment variables
5. Deploy

#### Render

1. Create new Web Service
2. Connect repository
3. Set build command: `pnpm install && pnpm run build`
4. Set start command: `node dist/cli.js server`
5. Add Redis instance
6. Configure environment variables

#### DigitalOcean App Platform

1. Create new app from GitHub
2. Configure build settings
3. Add Redis managed database
4. Set environment variables
5. Deploy

## Reverse Proxy Configuration

### Nginx

```nginx
upstream euvia_backend {
    server 127.0.0.1:3001;
}

server {
    listen 443 ssl http2;
    server_name analytics.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # WebSocket support
    location / {
        proxy_pass http://euvia_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=euvia:10m rate=10r/s;
    limit_req zone=euvia burst=20 nodelay;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name analytics.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Caddy

```caddy
analytics.yourdomain.com {
    reverse_proxy localhost:3001 {
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

## Redis Configuration

### Production Redis Setup

```bash
sudo nano /etc/redis/redis.conf
```

```conf
# Security
requirepass YOUR_STRONG_PASSWORD
bind 127.0.0.1

# Performance
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence (optional)
save 900 1
save 300 10
save 60 10000

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
```

Update `.env`:

```bash
REDIS_URL=redis://:YOUR_STRONG_PASSWORD@localhost:6379
```

### Redis Cloud (Upstash, Redis Enterprise)

```bash
REDIS_URL=rediss://default:password@host:port
```

## Monitoring

### PM2 (Process Manager)

```bash
npm install -g pm2

# Start with PM2
pm2 start dist/cli.js --name euvia -- server

# Save configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

### Health Check Script

```bash
#!/bin/bash
# /opt/scripts/euvia-health-check.sh

HEALTH_URL="http://localhost:3001/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -ne 200 ]; then
    echo "Euvia health check failed: $RESPONSE"
    systemctl restart euvia
    # Send alert (email, Slack, etc.)
fi
```

Add to cron:

```bash
*/5 * * * * /opt/scripts/euvia-health-check.sh
```

## Scaling

### Horizontal Scaling with Load Balancer

```nginx
upstream euvia_cluster {
    least_conn;
    server 10.0.1.10:3001;
    server 10.0.1.11:3001;
    server 10.0.1.12:3001;
}

server {
    listen 443 ssl http2;
    server_name analytics.yourdomain.com;

    location / {
        proxy_pass http://euvia_cluster;
        # ... (rest of configuration)
    }
}
```

### Redis Cluster

For high availability:

```bash
# Use Redis Cluster or Redis Sentinel
REDIS_URL=redis://sentinel1:26379,sentinel2:26379,sentinel3:26379
```

## Security Checklist

- [ ] Enable HTTPS/WSS only
- [ ] Configure CORS with specific origins
- [ ] Set strong Redis password
- [ ] Enable firewall rules
- [ ] Set up rate limiting
- [ ] Regular security updates
- [ ] Monitor logs
- [ ] Backup configuration
- [ ] Use environment variables for secrets
- [ ] Enable Redis authentication

## Backup and Recovery

### Backup Redis Data (Optional)

```bash
# Backup
redis-cli --rdb /backup/dump.rdb

# Schedule daily backups
0 2 * * * redis-cli --rdb /backup/dump-$(date +\%Y\%m\%d).rdb
```

### Configuration Backup

```bash
# Backup .env and configs
tar -czf euvia-config-backup.tar.gz .env nginx.conf
```

## Troubleshooting

### Check Logs

```bash
# Systemd
journalctl -u euvia -n 100 -f

# Docker
docker-compose logs -f euvia-server

# PM2
pm2 logs euvia
```

### Common Issues

**WebSocket connection fails:**

- Check firewall allows port 3001
- Verify nginx WebSocket configuration
- Check SSL certificate

**High memory usage:**

- Reduce `STATS_TTL`
- Check for connection leaks
- Monitor Redis memory

**Redis connection errors:**

- Verify Redis is running
- Check `REDIS_URL` configuration
- Test Redis connection: `redis-cli ping`

## Performance Optimization

### Node.js Cluster Mode

```javascript
// cluster.js
import cluster from 'cluster';
import os from 'os';
import { createEuviaServer } from '@euvia/live/server';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  const server = createEuviaServer();
  server.start();
}
```

### Redis Optimization

```bash
# Connection pooling
REDIS_MAX_RETRIES_PER_REQUEST=3
REDIS_ENABLE_OFFLINE_QUEUE=false
```

## Support

For deployment issues:

- GitHub Issues: https://github.com/Teyk0o/euvia-nodejs/issues
- Documentation: https://github.com/Teyk0o/euvia-nodejs/wiki
