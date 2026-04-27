const { success, created, error, notFound, unauthorized, forbidden, serverError } = require('../../src/utils/apiResponse');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('apiResponse helpers', () => {
  it('success sends 200 with success flag', () => {
    const res = mockRes();
    success(res, { id: 1 }, 'OK');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'OK', data: { id: 1 } });
  });

  it('created sends 201', () => {
    const res = mockRes();
    created(res, { id: 2 }, 'Created');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('error sends correct status and message', () => {
    const res = mockRes();
    error(res, 'Bad input', 422);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Bad input' }));
  });

  it('error includes errors array when provided', () => {
    const res = mockRes();
    const errs = [{ msg: 'field required' }];
    error(res, 'Validation failed', 422, errs);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: errs }));
  });

  it('notFound sends 404', () => {
    const res = mockRes();
    notFound(res, 'Not found');
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('unauthorized sends 401', () => {
    const res = mockRes();
    unauthorized(res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('forbidden sends 403', () => {
    const res = mockRes();
    forbidden(res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('serverError sends 500', () => {
    const res = mockRes();
    serverError(res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
