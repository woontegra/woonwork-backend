import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { ProjectDto } from '../types';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../components/ui/Toast';
import { EmptyState, Skeleton } from '../components/ui/PageLoader';
import { Badge, Button, Input, Select, TextArea } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { formatDate, projectStatusLabels } from '../lib/labels';

const statuses = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];

export function ProjectsPage() {
  const { activeTenant } = useTenant();
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectDto | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'ACTIVE' });
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!activeTenant) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      const data = await apiRequest<ProjectDto[]>(`/projects?${params.toString()}`);
      setProjects(data);
    } catch (err) {
      toast((err as Error).message || 'Projeler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTenant, status]);

  const filteredHint = useMemo(() => `${projects.length} proje`, [projects.length]);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', status: 'ACTIVE' });
    setModalOpen(true);
  }

  function openEdit(project: ProjectDto) {
    setEditing(project);
    setForm({
      name: project.name,
      description: project.description ?? '',
      status: project.status,
    });
    setModalOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await apiRequest(`/projects/${editing.id}`, {
          method: 'PATCH',
          body: {
            name: form.name,
            description: form.description || null,
            status: form.status,
          },
        });
        toast('Proje güncellendi', 'success');
      } else {
        await apiRequest('/projects', {
          method: 'POST',
          body: {
            name: form.name,
            description: form.description || null,
            status: form.status,
          },
        });
        toast('Proje oluşturuldu', 'success');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast((err as Error).message || 'Kayıt başarısız', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(project: ProjectDto) {
    if (!window.confirm(`“${project.name}” projesini silmek istiyor musunuz?`)) return;
    try {
      await apiRequest(`/projects/${project.id}`, { method: 'DELETE' });
      toast('Proje silindi', 'success');
      await load();
    } catch (err) {
      toast((err as Error).message || 'Silinemedi', 'error');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void load();
              }}
              placeholder="Proje ara..."
              className="w-full rounded-xl border border-navy-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-navy-400 focus:ring-4 focus:ring-navy-100"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="sm:w-44"
          >
            <option value="">Tüm durumlar</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {projectStatusLabels[s]}
              </option>
            ))}
          </Select>
          <Button variant="secondary" onClick={() => void load()}>
            Filtrele
          </Button>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Yeni Proje
        </Button>
      </div>

      <p className="text-xs text-navy-400">{filteredHint}</p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !projects.length ? (
        <EmptyState
          title="Proje bulunamadı"
          description="Yeni bir proje oluşturarak ekibinizle çalışmaya başlayın."
          action={
            <Button onClick={openCreate}>
              <Plus size={16} />
              Yeni Proje
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50/60 text-xs uppercase tracking-wide text-navy-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Proje</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold">Görev</th>
                <th className="px-4 py-3 font-semibold">Güncelleme</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {projects.map((project) => (
                  <motion.tr
                    key={project.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-navy-50 last:border-0 hover:bg-navy-50/40"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{project.name}</p>
                      <p className="line-clamp-1 text-xs text-navy-400">{project.description || 'Açıklama yok'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="blue">{projectStatusLabels[project.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-navy-600">{project._count?.tasks ?? 0}</td>
                    <td className="px-4 py-3 text-navy-500">{formatDate(project.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(project)}
                          className="rounded-lg p-2 text-navy-500 hover:bg-navy-100 hover:text-navy-800"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDelete(project)}
                          className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Projeyi Düzenle' : 'Yeni Proje'}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Proje adı"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextArea
            label="Açıklama"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Select
            label="Durum"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {projectStatusLabels[s]}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
