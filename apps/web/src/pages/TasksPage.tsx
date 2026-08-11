import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { MemberDto, ProjectDto, TaskDto } from '../types';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../components/ui/Toast';
import { EmptyState, Skeleton } from '../components/ui/PageLoader';
import { Badge, Button, Input, Select, TextArea } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import {
  formatDate,
  fullName,
  taskPriorityLabels,
  taskStatusLabels,
} from '../lib/labels';

const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function TasksPage() {
  const { activeTenant } = useTenant();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', projectId: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: '',
    assigneeId: '',
    dueDate: '',
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!activeTenant) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.projectId) params.set('projectId', filters.projectId);

      const [taskData, projectData, memberData] = await Promise.all([
        apiRequest<TaskDto[]>(`/tasks?${params.toString()}`),
        apiRequest<ProjectDto[]>('/projects'),
        apiRequest<MemberDto[]>(`/tenants/${activeTenant.id}/members`),
      ]);
      setTasks(taskData);
      setProjects(projectData);
      setMembers(memberData);
    } catch (err) {
      toast((err as Error).message || 'Görevler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTenant, filters.status, filters.priority, filters.projectId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/tasks', {
        method: 'POST',
        body: {
          title: form.title,
          description: form.description || null,
          status: form.status,
          priority: form.priority,
          projectId: form.projectId || null,
          assigneeId: form.assigneeId || null,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        },
      });
      toast('Görev oluşturuldu', 'success');
      setModalOpen(false);
      setForm({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: '',
        assigneeId: '',
        dueDate: '',
      });
      await load();
    } catch (err) {
      toast((err as Error).message || 'Görev oluşturulamadı', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(task: TaskDto) {
    if (!window.confirm(`“${task.title}” görevini silmek istiyor musunuz?`)) return;
    try {
      await apiRequest(`/tasks/${task.id}`, { method: 'DELETE' });
      toast('Görev silindi', 'success');
      await load();
    } catch (err) {
      toast((err as Error).message || 'Silinemedi', 'error');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <Select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">Tüm durumlar</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {taskStatusLabels[s]}
              </option>
            ))}
          </Select>
          <Select
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          >
            <option value="">Tüm öncelikler</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {taskPriorityLabels[p]}
              </option>
            ))}
          </Select>
          <Select
            value={filters.projectId}
            onChange={(e) => setFilters((f) => ({ ...f, projectId: e.target.value }))}
          >
            <option value="">Tüm projeler</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Yeni Görev
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : !tasks.length ? (
        <EmptyState
          title="Görev bulunamadı"
          description="Yeni bir görev ekleyerek takip etmeye başlayın."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Yeni Görev
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50/60 text-xs uppercase tracking-wide text-navy-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Görev</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold">Öncelik</th>
                <th className="px-4 py-3 font-semibold">Proje</th>
                <th className="px-4 py-3 font-semibold">Sorumlu</th>
                <th className="px-4 py-3 font-semibold">Son Tarih</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {tasks.map((task) => (
                  <motion.tr
                    key={task.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-navy-50 last:border-0 hover:bg-navy-50/40"
                  >
                    <td className="px-4 py-3 font-medium text-navy-900">{task.title}</td>
                    <td className="px-4 py-3">
                      <Badge>{taskStatusLabels[task.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={task.priority === 'URGENT' ? 'rose' : task.priority === 'HIGH' ? 'amber' : 'neutral'}>
                        {taskPriorityLabels[task.priority]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-navy-600">{task.project?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-navy-600">{fullName(task.assignee)}</td>
                    <td className="px-4 py-3 text-navy-500">{formatDate(task.dueDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void onDelete(task)}
                        className="text-xs font-medium text-rose-600 hover:underline"
                      >
                        Sil
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Görev" wide>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Başlık"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <TextArea
            label="Açıklama"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Durum"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {taskStatusLabels[s]}
                </option>
              ))}
            </Select>
            <Select
              label="Öncelik"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {taskPriorityLabels[p]}
                </option>
              ))}
            </Select>
            <Select
              label="Proje"
              value={form.projectId}
              onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
            >
              <option value="">Projesiz</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select
              label="Sorumlu"
              value={form.assigneeId}
              onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
            >
              <option value="">Atanmamış</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {fullName(m.user)}
                </option>
              ))}
            </Select>
            <Input
              label="Son tarih"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
