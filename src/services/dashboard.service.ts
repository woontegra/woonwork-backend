import { prisma } from '../lib/prisma';

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getDashboard(tenantId: string) {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);

  const [
    activeProjectsCount,
    pendingTasksCount,
    dueTodayCount,
    recentPagesCount,
    recentProjects,
    upcomingTasks,
  ] = await Promise.all([
    prisma.project.count({
      where: { tenantId, status: 'ACTIVE' },
    }),
    prisma.task.count({
      where: {
        tenantId,
        status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] },
      },
    }),
    prisma.task.count({
      where: {
        tenantId,
        dueDate: { gte: todayStart, lte: todayEnd },
        status: { notIn: ['DONE', 'CANCELLED'] },
      },
    }),
    prisma.page.count({ where: { tenantId } }),
    prisma.project.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        _count: { select: { tasks: true } },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        tenantId,
        dueDate: { gte: todayStart, lte: soon },
        status: { notIn: ['DONE', 'CANCELLED'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 8,
      include: {
        project: { select: { id: true, name: true } },
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),
  ]);

  const recentPages = await prisma.page.findMany({
    where: { tenantId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      icon: true,
      updatedAt: true,
      parentId: true,
    },
  });

  return {
    stats: {
      activeProjects: activeProjectsCount,
      pendingTasks: pendingTasksCount,
      dueToday: dueTodayCount,
      recentPages: recentPagesCount,
    },
    recentProjects,
    upcomingTasks,
    recentPages,
  };
}
