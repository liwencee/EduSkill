# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Email: security@skillbridge.ng

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive a response within 48 hours. We follow a 90-day responsible disclosure timeline.

## Security Controls

### Authentication & Authorisation
- JWT-based authentication with short-lived access tokens (7d) and refresh tokens (30d)
- Role-based access control: `teacher`, `youth`, `employer`, `admin`
- Passwords hashed with bcrypt (12 rounds)
- Strong password policy enforced at registration

### Transport Security
- HTTPS enforced in production via HSTS header (helmet)
- TLS 1.2+ required

### Input Validation
- All user inputs validated and sanitised with `express-validator`
- Request body size limited to 10 KB
- HTTP Parameter Pollution (HPP) protection

### Rate Limiting
- Global: 100 requests per 15 minutes per IP
- Auth endpoints: 10 requests per 15 minutes per IP
- Progressive slow-down after 50 requests

### Security Headers (helmet)
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-DNS-Prefetch-Control: off`
- `Referrer-Policy: no-referrer`

### Dependency Management
- `npm audit` runs on every CI build (fails on high severity)
- Weekly automated dependency scan via GitHub Actions
- CodeQL static analysis on every push to main

### Secrets Management
- No secrets committed to repository (enforced by CI secret detection job)
- All secrets managed via environment variables
- `.env` files are `.gitignore`d
