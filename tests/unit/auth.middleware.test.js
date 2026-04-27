const jwt = require('jsonwebtoken');
const { authenticate, authorize, generateTokens, verifyRefreshToken } = require('../../src/middleware/auth');

const SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('generateTokens', () => {
  it('returns access and refresh tokens', () => {
    const payload = { id: 'user-1', email: 'a@b.com', role: 'teacher' };
    const { access, refresh } = generateTokens(payload);
    expect(typeof access).toBe('string');
    expect(typeof refresh).toBe('string');
    const decoded = jwt.verify(access, SECRET);
    expect(decoded.id).toBe('user-1');
    expect(decoded.role).toBe('teacher');
  });
});

describe('verifyRefreshToken', () => {
  it('decodes a valid refresh token', () => {
    const payload = { id: 'user-2', email: 'x@y.com', role: 'youth' };
    const { refresh } = generateTokens(payload);
    const decoded = verifyRefreshToken(refresh);
    expect(decoded.id).toBe('user-2');
  });

  it('throws on an invalid token', () => {
    expect(() => verifyRefreshToken('bad.token.here')).toThrow();
  });
});

describe('authenticate middleware', () => {
  it('calls next when token is valid', () => {
    const payload = { id: 'user-3', email: 'z@z.com', role: 'employer' };
    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe('user-3');
  });

  it('returns 401 when no token provided', () => {
    const req = { headers: {} };
    const res = mockRes();
    authenticate(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 for expired token', () => {
    const token = jwt.sign({ id: 'x' }, SECRET, { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    authenticate(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Token expired' }));
  });

  it('returns 401 for malformed token', () => {
    const req = { headers: { authorization: 'Bearer not.a.valid.token' } };
    const res = mockRes();
    authenticate(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('authorize middleware', () => {
  it('calls next when user has required role', () => {
    const req = { user: { id: 'u1', role: 'teacher' } };
    const res = mockRes();
    const next = jest.fn();
    authorize('teacher')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when role does not match', () => {
    const req = { user: { id: 'u1', role: 'youth' } };
    const res = mockRes();
    authorize('teacher')(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows access when no roles specified', () => {
    const req = { user: { id: 'u1', role: 'youth' } };
    const res = mockRes();
    const next = jest.fn();
    authorize()(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
