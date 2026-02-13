# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-13

### Added

- Initial release of @euvia/live
- `EuviaTracker` component for invisible visitor tracking
- `EuviaLiveStats` component for live statistics display
- `useEuviaStats` React hook for custom dashboards
- Euvia server with Express + Socket.io + Redis
- CLI tool for server management (`npx @euvia/live server`)
- GDPR-compliant anonymous tracking
- Real-time WebSocket communication
- Docker support with docker-compose
- Comprehensive TypeScript types
- Unit tests with Vitest
- GitHub Actions CI/CD pipeline
- Complete documentation and examples

### Features

- Anonymous page tracking (base64 hashed URLs)
- Device category detection (mobile/desktop/tablet)
- Screen size bucketing for privacy
- 5-minute TTL on all data (ephemeral storage)
- Live visitor count
- Top pages ranking
- Device breakdown statistics
- Auto-reconnect WebSocket
- Health check endpoints
- Horizontal scaling support

### Security

- No personal data collection
- No IP address logging
- No cookies or fingerprinting
- First-party self-hosted solution
- Redis TTL-based automatic cleanup

[1.0.0]: https://github.com/Teyk0o/euvia-nodejs/releases/tag/v1.0.0
