import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '@woonwork/shared';
import type { TaskPriority, TaskStatus } from '@prisma/client';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';

async function assertProjectInTenant(tenantId: string, projectId: string | null | undefined) {
  if (!projectId) return;
  const project = await prisma.project.findFirst({ where: { id: projectId, tenantId } });
  if (!project) {
    throw new AppError(400, 'INVALID_PROJECT', 'Proje bu çalışma alanına ait değil');
  }
}

async function assertAssigneeInTenant(tenantId: string, assigneeId: string | null | undefined) {
  if (!assigneeId) return;
  const member = await prisma.tenantMember.findUnique({
    where: { userId_tenantId: { userId: assigneeId, tenantId } },
  });
  if (!member) {
    throw new AppError(400, 'INVALID_ASSIGNEE', 'Sorumlu bu çalışma alanının üyesi değil');
  }
}

export async function listTasks(
  tenantId: string,
  filters?: {
    status?: string;
    priority?: string;
    projectId?: string;
    assigneeId?: string;
    q?: string;
  },
) {
  return prisma.task.findMany({
    where: {
      tenantId,
      ...(filters?.status ? { status: filters.status as TaskStatus } : {}),
      ...(filters?.priority ? { priority: filters.priority as TaskPriority } : {}),
      ...(filters?.projectId ? { projectId: filters.projectId } : {}),
      ...(filters?.assigneeId ? { assigneeId: filters.assigneeId } : {}),
      ...(filters?.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: 'insensitive' } },
              { description: { contains: filters.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }],
  });
}

export async function getTask(tenantId: string, id: string) {
  const task = await prisma.task.findFirst({
    where: { id, tenantId },
    include: {
      project: { select: { id: true, name: true } },
      assignee: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!task) {
    throw new AppError(404, 'TASK_NOT_FOUND', 'Görev bulunamadı');
  }

  return task;
}

export async function createTask(tenantId: string, userId: string, raw: CreateTaskInput) {
  const input = createTaskSchema.parse(raw);
  await assertProjectInTenant(tenantId, input.projectId);
  await assertAssigneeInTenant(tenantId, input.assigneeId);

  return prisma.task.create({
    data: {
      tenantId,
      createdById: userId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'TODO',
      priority: input.priority ?? 'MEDIUM',
      projectId: input.projectId ?? null,
      assigneeId: input.assigneeId ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
}

export async function updateTask(tenantId: string, id: string, raw: UpdateTaskInput) {
  const input = updateTaskSchema.parse(raw);
  await getTask(tenantId, id);

  if (input.projectId !== undefined) {
    await assertProjectInTenant(tenantId, input.projectId);
  }
  if (input.assigneeId !== undefined) {
    await assertAssigneeInTenant(tenantId, input.assigneeId);
  }

  return prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
      ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId } : {}),
      ...(input.dueDate !== undefined
        ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
        : {}),
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
}

export async function deleteTask(tenantId: string, id: string) {
  await getTask(tenantId, id);
  await prisma.task.delete({ where: { id } });
}
