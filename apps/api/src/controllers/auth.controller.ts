import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { ok } from '../lib/errors';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.json(ok(result));
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(ok(result));
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.body.refreshToken);
    res.json(ok({ message: 'Çıkış yapıldı' }));
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.me(req.user!.id);
    res.json(ok(result));
  } catch (error) {
    next(error);
  }
}
