# Contributing to Euvia

Thank you for your interest in contributing to Euvia! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/euvia-nodejs`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `pnpm install`
5. Make your changes
6. Run tests: `pnpm test`
7. Run linter: `pnpm run lint`
8. Commit your changes: `git commit -m "Description of changes"`
9. Push to your fork: `git push origin feature/your-feature-name`
10. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 20+
- Redis 7+
- pnpm

### Local Development

```bash
# Install dependencies
pnpm install

# Start Redis (if not running)
redis-server

# Start development server
pnpm run dev

# Run tests in watch mode
pnpm run test:watch
```

## Testing

- Write tests for all new features
- Maintain or improve code coverage
- Run `pnpm test` before committing

## Code Style

- Follow existing code style
- Use TypeScript for type safety
- Run `pnpm run lint:fix` before committing
- Keep functions small and focused
- Add JSDoc comments for public APIs

## Pull Request Guidelines

1. **One feature per PR**: Keep PRs focused on a single feature or fix
2. **Update tests**: Include tests for new functionality
3. **Update docs**: Update README if adding features
4. **Clear description**: Explain what, why, and how
5. **Clean commits**: Use meaningful commit messages
6. **Pass CI**: Ensure all checks pass

## Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

All commits are validated via commitlint. See [COMMIT_CONVENTIONS.md](COMMIT_CONVENTIONS.md) for detailed guidelines.

**Format**:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Example**:

```
feat(tracker): add custom heartbeat interval option

Allow users to configure heartbeat interval via props.
Defaults to 60 seconds for backwards compatibility.

Closes #123
```

Commits that don't follow this format will be rejected by the commit-msg hook.

See the **Git Hooks & Commit Conventions** section in [README.md](README.md#git-hooks--commit-conventions) for detailed examples.

## Reporting Bugs

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)
- Relevant logs or error messages

## Feature Requests

We welcome feature requests! Please:

- Search existing issues first
- Clearly describe the use case
- Explain why it should be added
- Consider GDPR compliance implications

## Questions

For questions, use [GitHub Discussions](https://github.com/Teyk0o/euvia-nodejs/discussions) rather than issues.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
