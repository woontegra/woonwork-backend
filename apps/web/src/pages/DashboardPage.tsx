import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, FileText, FolderKanban, SquareCheckBig } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { DashboardDto } from '../types';
import { EmptyState, Skeleton } from '../components/ui/PageLoader';
import { Badge } from '../components/ui/Form';
import { formatDate, fullName, projectStatusLabels, taskPriorityLabels } from '../lib/labels';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../components/ui/Toast';

export function DashboardPage() {
  const { activeTenant } = useTenant();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeTenant) return;
    let cancelled = false;
    setLoading(true);
    apiRequest<DashboardDto>('/dashboard')
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => toast(err.message || 'Dashboard yüklenemedi', 'error'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTenant, toast]);

  const cards = [
    {
      label: 'Aktif Projeler',
      value: data?.stats.activeProjects ?? 0,
      icon: FolderKanban,
    },
    {
      label: 'Bekleyen Görevler',
      value: data?.stats.pendingTasks ?? 0,
      icon: SquareCheckBig,
    },
    {
      label: 'Bugün Biten İşler',
      value: data?.stats.dueToday ?? 0,
      icon: CalendarClock,
    },
    {
      label: 'Son Sayfalar',
      value: data?.stats.recentPages ?? 0,
      icon: FileText,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm shadow-navy-900/[0.03]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-navy-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-navy-950">{card.value}</p>
                </div>
                <div className="rounded-xl bg-navy-50 p-2.5 text-navy-700">
                  <Icon size={18} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-navy-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-navy-900">Son Projeler</h2>
            <Link to="/projeler" className="text-xs font-medium text-accent hover:underline">
              Tümünü gör
            </Link>
          </div>
          {!data?.recentProjects.length ? (
            <EmptyState title="Henüz proje yok" description="İlk projenizi oluşturarak başlayın." />
          ) : (
            <ul className="divide-y divide-navy-100">
              {data.recentProjects.map((project) => (
                <li key={project.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-900">{project.name}</p>
                    <p className="text-xs text-navy-400">
                      {project._count?.tasks ?? 0} görev · {fullName(project.createdBy)}
                    </p>
                  </div>
                  <Badge tone="blue">{projectStatusLabels[project.status] ?? project.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-navy-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-navy-900">Yaklaşan Görevler</h2>
            <Link to="/gorevler" className="text-xs font-medium text-accent hover:underline">
              Tümünü gör
            </Link>
          </div>
          {!data?.upcomingTasks.length ? (
            <EmptyState title="Yaklaşan görev yok" description="Son tarihi olan görevler burada listelenir." />
          ) : (
            <ul className="divide-y divide-navy-100">
              {data.upcomingTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-900">{task.title}</p>
                    <p className="text-xs text-navy-400">
                      {task.project?.name ?? 'Projesiz'} · {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <Badge tone={task.priority === 'URGENT' || task.priority === 'HIGH' ? 'rose' : 'neutral'}>
                    {taskPriorityLabels[task.priority] ?? task.priority}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-navy-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy-900">Son Sayfalar</h2>
          <Link to="/notlar" className="text-xs font-medium text-accent hover:underline">
            Tümünü gör
          </Link>
        </div>
        {!data?.recentPages.length ? (
          <EmptyState title="Henüz sayfa yok" description="Notlar & belgeler bölümünden sayfa ekleyebilirsiniz." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {data.recentPages.map((page) => (
              <Link
                key={page.id}
                to={`/notlar/${page.id}`}
                className="rounded-xl border border-navy-100 px-3 py-3 transition hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-sm"
              >
                <p className="text-lg">{page.icon || '📄'}</p>
                <p className="mt-1 truncate text-sm font-medium text-navy-900">{page.title}</p>
                <p className="text-xs text-navy-400">{formatDate(page.updatedAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
