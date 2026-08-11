import type { Tenant, TenantRole } from '@prisma/client';

export interface AuthUserPayload {
  sub: string;
  email: string;
}

export interface RequestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface RequestMembership {
  id: string;
  role: TenantRole;
  userId: string;
  tenantId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
      tenant?: Tenant;
      membership?: RequestMembership;
    }
  }
}

export {};
