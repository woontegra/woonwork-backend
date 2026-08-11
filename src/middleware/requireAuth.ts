import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import type { AuthUserPayload } from '../types/express';

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Oturum gerekli');
    }

    const token = header.slice(7);
    let payload: AuthUserPayload;

    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUserPayload;
    } catch {
      throw new AppError(401, 'INVALID_TOKEN', 'Geçersiz veya süresi dolmuş oturum');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'UNAUTHORIZED', 'Kullanıcı bulunamadı veya pasif');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
