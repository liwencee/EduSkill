const request = require('supertest');
const app = require('../../src/app');

/**
 * Regression tests for the Railway deployment failure:
 *   ValidationError: The 'X-Forwarded-For' header is set but the Express
 *   'trust proxy' setting is false (default).
 *   code: ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
 *
 * Railway (like Vercel/Heroku/any PaaS) terminates TLS at its edge proxy and
 * forwards the real client IP in X-Forwarded-For. With `trust proxy` unset,
 * express-rate-limit refuses to key on that header and throws — which fell
 * through to the generic errorHandler and turned every proxied request into
 * a 500. Rate limiting was also keying every user to the same proxy IP.
 */
describe('Reverse proxy (Railway/Vercel) handling', () => {
  it('serves requests carrying X-Forwarded-For without a 500', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('X-Forwarded-For', '102.89.34.7');

    expect(res.status).toBe(200);
  });

  it('does not surface the express-rate-limit proxy validation error', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('X-Forwarded-For', '102.89.34.7');

    expect(JSON.stringify(res.body)).not.toMatch(/X-Forwarded-For|trust proxy/i);
  });

  it('trusts exactly one proxy hop, so the client IP is the last hop', () => {
    // Railway appends the real client IP as the right-most entry. Trusting a
    // single hop means a client cannot spoof its IP by injecting extra
    // left-hand entries into the header (which would let it evade rate limits).
    expect(app.get('trust proxy')).toBe(1);
  });

  it('still responds normally when no proxy header is present (local/direct)', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
  });
});
