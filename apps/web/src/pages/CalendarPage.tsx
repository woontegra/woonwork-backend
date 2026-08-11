import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { TaskDto } from '../types';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../components/ui/Toast';
import { EmptyState, Skeleton } from '../components/ui/PageLoader';
import { Badge } from '../components/ui/Form';
import { taskPriorityLabels } from '../lib/labels';

const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarPage() {
  const { activeTenant } = useTenant();
  const { toast } = useToast();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeTenant) return;
    let cancelled = false;
    setLoading(true);
    apiRequest<TaskDto[]>('/tasks')
      .then((data) => {
        if (!cancelled) setTasks(data.filter((t) => t.dueDate));
      })
      .catch((err) => toast(err.message || 'Takvim yüklenemedi', 'error'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTenant, toast]);

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [cursor]);

  const monthLabel = new Intl.DateTimeFormat('tr-TR', {
    month: 'long',
    year: 'numeric',
  }).format(cursor);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, TaskDto[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = new Date(task.dueDate).toDateString();
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    return map;
  }, [tasks]);

  if (loading) {
    return <Skeleton className="h-[560px]" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize text-navy-900">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-navy-200 bg-white p-2 text-navy-600 hover:bg-navy-50"
            onClick={() =>
              setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
            }
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
            onClick={() => {
              const now = new Date();
              setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
          >
            Bugün
          </button>
          <button
            type="button"
            className="rounded-xl border border-navy-200 bg-white p-2 text-navy-600 hover:bg-navy-50"
            onClick={() =>
              setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
            }
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {!tasks.length ? (
        <EmptyState
          title="Takvimde gösterilecek görev yok"
          description="Son tarihi olan görevler aylık görünümde burada yer alır."
        />
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
        <div className="grid grid-cols-7 border-b border-navy-100 bg-navy-50/70">
          {weekDays.map((d) => (
            <div key={d} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-navy-500">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const inMonth = day.getMonth() === cursor.getMonth();
            const isToday = sameDay(day, new Date());
            const dayTasks = tasksByDay.get(day.toDateString()) ?? [];
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[110px] border-b border-r border-navy-50 p-2 ${
                  inMonth ? 'bg-white' : 'bg-navy-50/40'
                }`}
              >
                <div
                  className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday ? 'bg-navy-900 text-white' : inMonth ? 'text-navy-800' : 'text-navy-300'
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="truncate rounded-md bg-accent-soft px-1.5 py-1 text-[11px] font-medium text-navy-800"
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 ? (
                    <p className="text-[10px] text-navy-400">+{dayTasks.length - 3} daha</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {tasks.length ? (
        <div className="rounded-2xl border border-navy-100 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-navy-900">Bu ayın görevleri</h3>
          <ul className="space-y-2">
            {tasks
              .filter((t) => {
                if (!t.dueDate) return false;
                const d = new Date(t.dueDate);
                return d.getMonth() === cursor.getMonth() && d.getFullYear() === cursor.getFullYear();
              })
              .map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-navy-800">{task.title}</span>
                  <Badge>{taskPriorityLabels[task.priority]}</Badge>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
