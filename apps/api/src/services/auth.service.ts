import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { loginSchema, type LoginInput } from '@woonwork/shared';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import type { AuthUserPayload } from '../types/express';

function parseDurationToMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2];
  const map: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * (map[unit] ?? 1000);
}

function toAuthUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
  };
}

async function getUserTenants(userId: string) {
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
  }));
}

function signAccessToken(userId: string, email: string): string {
  const payload: AuthUserPayload = { sub: userId, email };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

async function createRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function login(raw: LoginInput) {
  const input = loginSchema.parse(raw);
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'E-posta veya şifre hatalı');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'E-posta veya şifre hatalı');
  }

  const accessToken = signAccessToken(user.id, user.email);
  const refreshToken = await createRefreshToken(user.id);
  const tenants = await getUserTenants(user.id);

  return {
    user: toAuthUser(user),
    tokens: { accessToken, refreshToken },
    tenants,
  };
}

export async function refresh(refreshToken: string) {
  if (!refreshToken) {
    throw new AppError(400, 'REFRESH_REQUIRED', 'Yenileme jetonu gerekli');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError(401, 'INVALID_REFRESH', 'Yenileme jetonu geçersiz veya süresi dolmuş');
  }

  if (!stored.user.isActive) {
    throw new AppError(401, 'UNAUTHORIZED', 'Kullanıcı pasif');
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const accessToken = signAccessToken(stored.user.id, stored.user.email);
  const nextRefresh = await createRefreshToken(stored.user.id);

  return {
    accessToken,
    refreshToken: nextRefresh,
  };
}

export async function logout(refreshToken?: string) {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Kullanıcı bulunamadı');
  }

  const tenants = await getUserTenants(userId);
  return { user, tenants };
}
