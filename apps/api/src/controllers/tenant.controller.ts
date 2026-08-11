import type { Request, Response, NextFunction } from 'express';
import * as tenantService from '../services/tenant.service';
import { ok } from '../lib/errors';

export async function listTenants(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tenantService.listUserTenants(req.user!.id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function getTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tenantService.getTenantForUser(req.user!.id, req.params.tenantId);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function listMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tenantService.listTenantMembers(req.tenant!.id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}
