import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { PageDto } from '../types';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../components/ui/Toast';
import { EmptyState, Skeleton } from '../components/ui/PageLoader';
import { Button, Input } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { formatDate } from '../lib/labels';

function buildTree(pages: PageDto[]) {
  const byParent = new Map<string | null, PageDto[]>();
  for (const page of pages) {
    const key = page.parentId;
    const list = byParent.get(key) ?? [];
    list.push(page);
    byParent.set(key, list);
  }
  return byParent;
}

function TreeNodes({
  parentId,
  byParent,
  depth = 0,
}: {
  parentId: string | null;
  byParent: Map<string | null, PageDto[]>;
  depth?: number;
}) {
  const nodes = byParent.get(parentId) ?? [];
  return (
    <ul className={depth === 0 ? 'space-y-1' : 'ml-3 space-y-1 border-l border-navy-100 pl-3'}>
      {nodes.map((page) => (
        <li key={page.id}>
          <Link
            to={`/notlar/${page.id}`}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-navy-700 hover:bg-navy-50"
          >
            <span>{page.icon || '📄'}</span>
            <span className="truncate">{page.title}</span>
            {(byParent.get(page.id)?.length ?? 0) > 0 ? (
              <ChevronRight size={14} className="ml-auto text-navy-300" />
            ) : null}
          </Link>
          <TreeNodes parentId={page.id} byParent={byParent} depth={depth + 1} />
        </li>
      ))}
    </ul>
  );
}

export function PagesPage() {
  const navigate = useNavigate();
  const { activeTenant } = useTenant();
  const { toast } = useToast();
  const [pages, setPages] = useState<PageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [parentId, setParentId] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!activeTenant) return;
    setLoading(true);
    try {
      const data = await apiRequest<PageDto[]>('/pages');
      setPages(data);
    } catch (err) {
      toast((err as Error).message || 'Sayfalar yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTenant]);

  const byParent = useMemo(() => buildTree(pages), [pages]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await apiRequest<PageDto>('/pages', {
        method: 'POST',
        body: {
          title,
          parentId: parentId || null,
        },
      });
      toast('Sayfa oluşturuldu', 'success');
      setModalOpen(false);
      setTitle('');
      setParentId('');
      navigate(`/notlar/${created.id}`);
    } catch (err) {
      toast((err as Error).message || 'Sayfa oluşturulamadı', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-navy-100 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy-900">Sayfa ağacı</h2>
          <Button className="!px-2.5 !py-1.5" onClick={() => setModalOpen(true)}>
            <Plus size={14} />
          </Button>
        </div>
        {loading ? (
          <Skeleton className="h-40" />
        ) : !pages.length ? (
          <p className="text-xs text-navy-400">Henüz sayfa yok</p>
        ) : (
          <TreeNodes parentId={null} byParent={byParent} />
        )}
      </aside>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-navy-500">{pages.length} sayfa</p>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Yeni Sayfa
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : !pages.length ? (
          <EmptyState
            title="Henüz not veya belge yok"
            description="Sayfalar oluşturup hiyerarşik şekilde düzenleyebilirsiniz."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus size={16} />
                Yeni Sayfa
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
            <ul className="divide-y divide-navy-50">
              {pages.map((page) => (
                <li key={page.id}>
                  <Link
                    to={`/notlar/${page.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-navy-50/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-lg">{page.icon || '📄'}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy-900">{page.title}</p>
                        <p className="text-xs text-navy-400">
                          {page._count?.children ?? 0} alt sayfa · {formatDate(page.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-navy-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Sayfa">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Başlık"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-navy-700">Üst sayfa</span>
            <select
              className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy-400 focus:ring-4 focus:ring-navy-100"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">Yok (kök sayfa)</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2">
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
