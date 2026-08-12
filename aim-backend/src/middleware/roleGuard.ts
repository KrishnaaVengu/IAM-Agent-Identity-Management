import { RequestHandler } from 'express';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Admin': ['register', 'suspend', 'reactivate', 'decommission', 'rotate', 'runReview'],
  'Team Owner': ['register', 'rotate'],
  'Viewer': []
};

export function requirePermission(action: string): RequestHandler {
  return (req, res, next) => {
    const roleHeader = req.headers['x-role'];
    const role = (Array.isArray(roleHeader) ? roleHeader[0] : roleHeader) || 'Viewer';
    const permissions = ROLE_PERMISSIONS[role] || [];

    if (!permissions.includes(action)) {
      res.status(403).json({
        ok: false,
        error: {
          code: 'FORBIDDEN',
          message: `Role '${role}' cannot perform '${action}'`
        }
      });
      return;
    }

    next();
  };
}
