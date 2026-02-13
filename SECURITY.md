# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅        |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Open a Public Issue

Security vulnerabilities should not be disclosed publicly until a fix is available.

### 2. Report Privately

Use GitHub Security Advisories to report vulnerabilities privately:

1. Go to https://github.com/Teyk0o/euvia-nodejs/security/advisories
2. Click "New draft security advisory"
3. Fill in the details:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (critical issues prioritized)

## Security Measures

### GDPR Compliance

- **No PII**: No personal identifiable information is collected
- **Anonymous**: All data is hashed and categorized
- **Ephemeral**: 5-minute TTL on all data
- **No Tracking**: No cookies, fingerprinting, or persistent identifiers

### Data Protection

- **Hashed URLs**: Page paths are base64-encoded
- **Categorized UA**: User agents grouped into device categories
- **Bucketed Screens**: Screen sizes rounded to common resolutions
- **No IP Storage**: IP addresses never logged or stored

### Server Security

- **Redis Auth**: Use Redis password authentication in production
- **CORS**: Configure allowed origins explicitly
- **TLS/SSL**: Use WSS (WebSocket Secure) in production
- **Rate Limiting**: Implement reverse proxy rate limiting
- **Input Validation**: All inputs validated and sanitized

### Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Redis Security**: Use strong passwords and network isolation
3. **HTTPS/WSS**: Always use encrypted connections in production
4. **Firewall**: Restrict Redis port access
5. **Updates**: Keep dependencies up to date

## Secure Deployment Checklist

- [ ] Use WSS (WebSocket Secure) protocol
- [ ] Configure CORS with specific origins (not `*`)
- [ ] Enable Redis authentication
- [ ] Use environment variables for secrets
- [ ] Set up firewall rules
- [ ] Enable TLS/SSL certificates
- [ ] Implement reverse proxy rate limiting
- [ ] Monitor logs for suspicious activity
- [ ] Regular dependency updates
- [ ] Backup Redis data (if needed)

## Privacy Guarantees

Euvia is designed to be GDPR-compliant by default:

1. **Anonymization**: Data is anonymous before storage
2. **Minimization**: Only essential metrics collected
3. **Retention**: Automatic 5-minute data expiration
4. **Transparency**: No hidden tracking or data collection
5. **Control**: Self-hosted, full data ownership

## Known Security Considerations

### WebSocket Connections

- WebSocket connections can be resource-intensive
- Implement connection limits and rate limiting at reverse proxy level
- Monitor concurrent connections

### Redis Access

- Redis is unauthenticated by default
- Always enable authentication in production
- Use network isolation (internal network only)

### DDoS Protection

- Implement rate limiting at nginx/reverse proxy level
- Use connection throttling
- Monitor unusual traffic patterns

## Security Updates

Security updates will be published as patch releases with detailed changelogs.

Subscribe to:

- GitHub Security Advisories
- Release notifications
- npm security alerts
