import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from '@woonwork/shared';
import type { ProjectStatus } from '@prisma/client';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';

export async function listProjects(tenantId: string, filters?: { status?: string; q?: string }) {
  return prisma.project.findMany({
    where: {
      tenantId,
      ...(filters?.status ? { status: filters.status as ProjectStatus } : {}),
      ...(filters?.q
        ? {
            OR: [
              { name: { contains: filters.q, mode: 'insensitive' } },
              { description: { contains: filters.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProject(tenantId: string, id: string) {
  const project = await prisma.project.findFirst({
    where: { id, tenantId },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      _count: { select: { tasks: true } },
    },
  });

  if (!project) {
    throw new AppError(404, 'PROJECT_NOT_FOUND', 'Proje bulunamadı');
  }

  return project;
}

export async function createProject(tenantId: string, userId: string, raw: CreateProjectInput) {
  const input = createProjectSchema.parse(raw);
  return prisma.project.create({
    data: {
      tenantId,
      createdById: userId,
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? 'ACTIVE',
    },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      _count: { select: { tasks: true } },
    },
  });
}

export async function updateProject(tenantId: string, id: string, raw: UpdateProjectInput) {
  const input = updateProjectSchema.parse(raw);
  await getProject(tenantId, id);

  return prisma.project.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      _count: { select: { tasks: true } },
    },
  });
}

export async function deleteProject(tenantId: string, id: string) {
  await getProject(tenantId, id);
  await prisma.project.delete({ where: { id } });
}
