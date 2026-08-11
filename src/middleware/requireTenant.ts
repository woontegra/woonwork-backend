import type { RequestHandler } from 'express';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';

export const requireTenant: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Oturum gerekli');
    }

    const tenantId =
      (req.params.tenantId as string | undefined) ||
      (req.headers['x-tenant-id'] as string | undefined) ||
      (req.query.tenantId as string | undefined);

    if (!tenantId) {
      throw new AppError(400, 'TENANT_REQUIRED', 'Çalışma alanı (tenant) belirtilmeli');
    }

    const membership = await prisma.tenantMember.findUnique({
      where: {
        userId_tenantId: {
          userId: req.user.id,
          tenantId,
        },
      },
      include: {
        tenant: true,
      },
    });

    if (!membership) {
      throw new AppError(403, 'TENANT_FORBIDDEN', 'Bu çalışma alanına erişim yetkiniz yok');
    }

    req.tenant = membership.tenant;
    req.membership = {
      id: membership.id,
      role: membership.role,
      userId: membership.userId,
      tenantId: membership.tenantId,
    };

    next();
  } catch (error) {
    next(error);
  }
};
