import type { RequestHandler } from 'express';
import { hasMinRole, type TenantRole } from '@woonwork/shared';
import { AppError } from '../lib/errors';

export function requireRole(minRole: TenantRole): RequestHandler {
  return (req, _res, next) => {
    try {
      if (!req.membership) {
        throw new AppError(403, 'FORBIDDEN', 'Üyelik bilgisi bulunamadı');
      }

      if (!hasMinRole(req.membership.role as TenantRole, minRole)) {
        throw new AppError(403, 'INSUFFICIENT_ROLE', 'Bu işlem için yetkiniz yetersiz');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
