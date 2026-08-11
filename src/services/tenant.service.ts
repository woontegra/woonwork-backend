import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';

export async function listUserTenants(userId: string) {
  const memberships = await prisma.tenantMember.findMany({
    where: { userId },
    include: { tenant: true },
    orderBy: { createdAt: 'asc' },
  });

  return memberships.map((m) => ({
    id: m.tenant.id,
    name: m.tenant.name,
    slug: m.tenant.slug,
    logoUrl: m.tenant.logoUrl,
    role: m.role,
    createdAt: m.tenant.createdAt,
  }));
}

export async function getTenantForUser(userId: string, tenantId: string) {
  const membership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId, tenantId },
    },
    include: { tenant: true },
  });

  if (!membership) {
    throw new AppError(403, 'TENANT_FORBIDDEN', 'Bu çalışma alanına erişim yetkiniz yok');
  }

  return {
    id: membership.tenant.id,
    name: membership.tenant.name,
    slug: membership.tenant.slug,
    logoUrl: membership.tenant.logoUrl,
    role: membership.role,
    createdAt: membership.tenant.createdAt,
    updatedAt: membership.tenant.updatedAt,
  };
}

export async function listTenantMembers(tenantId: string) {
  const members = await prisma.tenantMember.findMany({
    where: { tenantId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return members.map((m) => ({
    id: m.id,
    role: m.role,
    createdAt: m.createdAt,
    user: m.user,
  }));
}
