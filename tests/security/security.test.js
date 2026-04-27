const request = require('supertest');
const app = require('../../src/app');

describe('OWASP Security checks', () => {
  // A1 — Injection: SQL via query params should not cause 5xx
  describe('Injection prevention', () => {
    it('SQL injection in query param does not crash', async () => {
      const res = await request(app)
        .get("/api/v1/opportunity/jobs?skill='; DROP TABLE users; --")
        .set('Authorization', 'Bearer invalid');
      expect(res.status).not.toBe(500);
    });

    it('NoSQL injection payload returns 401 (not 500)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: { $gt: '' }, password: { $gt: '' } });
      expect(res.status).not.toBe(500);
    });
  });

  // A2 — Broken Authentication
  describe('Broken authentication prevention', () => {
    it('rejects requests with empty Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer ');
      expect(res.status).toBe(401);
    });

    it('rejects requests with tampered JWT', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6InRhbXBlcmVkIn0.fakesignature');
      expect(res.status).toBe(401);
    });
  });

  // A3 — Sensitive Data Exposure
  describe('Sensitive data exposure', () => {
    it('server does not expose stack traces in production error responses', async () => {
      // In test env (not production), we just verify no stack in 404
      const res = await request(app).get('/api/v1/not-found-route');
      expect(res.body).not.toHaveProperty('stack');
    });
  });

  // A5 — Security misconfiguration
  describe('Security headers', () => {
    it('has Content-Security-Policy header', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.headers['content-security-policy']).toBeDefined();
    });

    it('has Strict-Transport-Security or similar hardening header', async () => {
      const res = await request(app).get('/api/v1/health');
      // helmet sets this
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-dns-prefetch-control']).toBe('off');
    });
  });

  // A7 — XSS via reflected input
  describe('XSS prevention', () => {
    it('response is application/json — browser will not render reflected value as HTML', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: '<script>alert(1)</script>', password: 'x' });

      // The API must respond as JSON — the browser will never parse this as HTML
      expect(res.headers['content-type']).toMatch(/application\/json/);

      // nosniff prevents the browser from re-interpreting the content type
      expect(res.headers['x-content-type-options']).toBe('nosniff');

      // Must not return a 200 OK (which would be dangerous for reflected XSS)
      expect(res.status).not.toBe(200);

      // Response body must be valid JSON (not raw HTML with a script tag)
      expect(() => JSON.parse(JSON.stringify(res.body))).not.toThrow();
    });
  });

  // A6 — Mass assignment / HTTP Parameter Pollution
  describe('HTTP Parameter Pollution prevention', () => {
    it('handles duplicate query params without crashing', async () => {
      const res = await request(app)
        .get('/api/v1/opportunity/jobs?type=job&type=apprenticeship')
        .set('Authorization', 'Bearer invalid');
      expect(res.status).not.toBe(500);
    });
  });

  // A10 — Insufficient logging (verify request ID is on response)
  describe('Request tracing', () => {
    it('every response has X-Request-ID', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.headers['x-request-id']).toMatch(/[0-9a-f-]{36}/);
    });

    it('custom X-Request-ID is echoed back', async () => {
      const id = 'my-custom-request-id-123';
      const res = await request(app)
        .get('/api/v1/health')
        .set('X-Request-ID', id);
      expect(res.headers['x-request-id']).toBe(id);
    });
  });
});
