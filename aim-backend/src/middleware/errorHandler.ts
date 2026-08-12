import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    res.status(400).json({
      ok: false,
      error: { code: 'INVALID_JSON', message: 'Malformed JSON payload' }
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    ok: false,
    error: { code: 'INTERNAL_ERROR', message: err.message || 'Internal server error' }
  });
};
