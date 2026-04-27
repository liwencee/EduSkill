const request = require('supertest');
const app = require('../../src/app');

describe('Health check', () => {
  it('GET /api/v1/health returns 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/running/i);
  });
});

describe('404 handling', () => {
  it('returns 404 for unknown route', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('Security headers', () => {
  it('sets X-Content-Type-Options header', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('sets X-Frame-Options header', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('does not expose X-Powered-By', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('sets X-Request-ID on response', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });
});

describe('Auth endpoints (unauthenticated)', () => {
  it('POST /auth/register returns 422 on missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({});
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /auth/register returns 422 on weak password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      password: 'weak',
      name: 'Test User',
      role: 'teacher',
    });
    expect(res.status).toBe(422);
  });

  it('POST /auth/register returns 422 on invalid role', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      password: 'StrongP@ss1',
      name: 'Test User',
      role: 'superadmin',
    });
    expect(res.status).toBe(422);
  });

  it('POST /auth/login returns 422 on missing body', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(422);
  });
});

describe('Protected routes redirect to 401', () => {
  it('GET /edupro/courses without token returns 401', async () => {
    const res = await request(app).get('/api/v1/edupro/courses');
    expect(res.status).toBe(401);
  });

  it('GET /skillup/courses without token returns 401', async () => {
    const res = await request(app).get('/api/v1/skillup/courses');
    expect(res.status).toBe(401);
  });

  it('GET /opportunity/jobs without token returns 401', async () => {
    const res = await request(app).get('/api/v1/opportunity/jobs');
    expect(res.status).toBe(401);
  });

  it('GET /auth/me without token returns 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Input size limit', () => {
  it('rejects payload larger than 10kb', async () => {
    const bigPayload = { data: 'x'.repeat(11 * 1024) };
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(bigPayload);
    expect(res.status).toBe(413);
  });
});
