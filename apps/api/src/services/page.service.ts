import {
  createPageSchema,
  updatePageSchema,
  defaultBlockContent,
  BlockType,
  type CreatePageInput,
  type UpdatePageInput,
} from '@woonwork/shared';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { POSITION_STEP } from './block.service';
import type { Prisma } from '@prisma/client';

function toJsonContent(content: unknown): Prisma.InputJsonValue {
  return (content ?? {}) as Prisma.InputJsonValue;
}

async function assertParentInTenant(tenantId: string, parentId: string | null | undefined) {
  if (!parentId) return;
  const parent = await prisma.page.findFirst({ where: { id: parentId, tenantId } });
  if (!parent) {
    throw new AppError(400, 'INVALID_PARENT', 'Üst sayfa bu çalışma alanına ait değil');
  }
}

export async function listPages(tenantId: string, filters?: { parentId?: string | null; q?: string }) {
  const parentFilter =
    filters?.parentId === undefined
      ? {}
      : filters.parentId === null || filters.parentId === 'null'
        ? { parentId: null }
        : { parentId: filters.parentId };

  return prisma.page.findMany({
    where: {
      tenantId,
      ...parentFilter,
      ...(filters?.q ? { title: { contains: filters.q, mode: 'insensitive' } } : {}),
    },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      _count: { select: { children: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getPage(tenantId: string, id: string) {
  const page = await prisma.page.findFirst({
    where: { id, tenantId },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      children: {
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          icon: true,
          parentId: true,
          updatedAt: true,
        },
      },
      parent: {
        select: { id: true, title: true, icon: true },
      },
    },
  });

  if (!page) {
    throw new AppError(404, 'PAGE_NOT_FOUND', 'Sayfa bulunamadı');
  }

  return page;
}

export async function createPage(tenantId: string, userId: string, raw: CreatePageInput) {
  const input = createPageSchema.parse(raw);
  await assertParentInTenant(tenantId, input.parentId);

  return prisma.$transaction(async (tx) => {
    const page = await tx.page.create({
      data: {
        tenantId,
        createdById: userId,
        title: input.title,
        parentId: input.parentId ?? null,
        icon: input.icon ?? null,
        coverUrl: input.coverUrl ?? null,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: { select: { children: true } },
      },
    });

    await tx.block.create({
      data: {
        tenantId,
        pageId: page.id,
        createdById: userId,
        type: BlockType.PARAGRAPH,
        content: toJsonContent(defaultBlockContent(BlockType.PARAGRAPH)),
        position: POSITION_STEP,
      },
    });

    return page;
  });
}

export async function updatePage(tenantId: string, id: string, raw: UpdatePageInput) {
  const input = updatePageSchema.parse(raw);
  await getPage(tenantId, id);

  if (input.parentId !== undefined) {
    if (input.parentId === id) {
      throw new AppError(400, 'INVALID_PARENT', 'Sayfa kendi üst sayfası olamaz');
    }
    await assertParentInTenant(tenantId, input.parentId);
  }

  return prisma.page.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
      ...(input.coverUrl !== undefined ? { coverUrl: input.coverUrl } : {}),
    },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      children: {
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          icon: true,
          parentId: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function deletePage(tenantId: string, id: string) {
  await getPage(tenantId, id);
  await prisma.page.delete({ where: { id } });
}
