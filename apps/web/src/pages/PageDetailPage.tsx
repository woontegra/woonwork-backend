import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { PageDto } from '../types';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../components/ui/Toast';
import { EmptyState, Skeleton } from '../components/ui/PageLoader';
import { Button, Input } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { BlockEditor } from '../components/editor/BlockEditor';
import type { SaveStatus } from '../components/editor/types';

const PAGE_ICONS = ['📄', '📝', '📘', '📌', '💡', '🎯', '🗂️', '✨'] as const;

export function PageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeTenant } = useTenant();
  const { toast } = useToast();
  const [page, setPage] = useState<PageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [childModal, setChildModal] = useState(false);
  const [childTitle, setChildTitle] = useState('');
  const [iconMenu, setIconMenu] = useState(false);

  async function load() {
    if (!activeTenant || !id) return;
    setLoading(true);
    try {
      const data = await apiRequest<PageDto>(`/pages/${id}`);
      setPage(data);
      setTitle(data.title);
    } catch (err) {
      toast((err as Error).message || 'Sayfa yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTenant, id]);

  async function saveTitle() {
    if (!page || title === page.title) return;
    setSaveStatus('saving');
    try {
      const updated = await apiRequest<PageDto>(`/pages/${page.id}`, {
        method: 'PATCH',
        body: { title },
      });
      setPage(updated);
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      toast((err as Error).message || 'Başlık kaydedilemedi', 'error');
    }
  }

  async function saveIcon(icon: string) {
    if (!page) return;
    setIconMenu(false);
    setSaveStatus('saving');
    try {
      const updated = await apiRequest<PageDto>(`/pages/${page.id}`, {
        method: 'PATCH',
        body: { icon },
      });
      setPage(updated);
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      toast((err as Error).message || 'İkon kaydedilemedi', 'error');
    }
  }

  async function createChild(e: FormEvent) {
    e.preventDefault();
    if (!page) return;
    try {
      const created = await apiRequest<PageDto>('/pages', {
        method: 'POST',
        body: { title: childTitle, parentId: page.id },
      });
      toast('Alt sayfa oluşturuldu', 'success');
      setChildModal(false);
      setChildTitle('');
      navigate(`/notlar/${created.id}`);
    } catch (err) {
      toast((err as Error).message || 'Alt sayfa oluşturulamadı', 'error');
    }
  }

  async function removePage() {
    if (!page) return;
    if (!window.confirm(`“${page.title}” sayfasını silmek istiyor musunuz?`)) return;
    try {
      await apiRequest(`/pages/${page.id}`, { method: 'DELETE' });
      toast('Sayfa silindi', 'success');
      navigate('/notlar');
    } catch (err) {
      toast((err as Error).message || 'Silinemedi', 'error');
    }
  }

  const statusLabel =
    saveStatus === 'saving'
      ? 'Kaydediliyor...'
      : saveStatus === 'saved'
        ? 'Kaydedildi'
        : saveStatus === 'error'
          ? 'Kaydetme hatası'
          : '';

  if (loading) return <Skeleton className="h-80" />;
  if (!page) {
    return (
      <EmptyState
        title="Sayfa bulunamadı"
        action={
          <Link to="/notlar" className="text-sm font-medium text-accent hover:underline">
            Notlara dön
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex min-w-0 items-center gap-2 text-sm text-navy-500">
          <Link to="/notlar" className="hover:text-navy-800">
            Notlar & Belgeler
          </Link>
          {page.parent ? (
            <>
              <span>/</span>
              <Link to={`/notlar/${page.parent.id}`} className="truncate hover:text-navy-800">
                {page.parent.icon ? `${page.parent.icon} ` : ''}
                {page.parent.title}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span className="truncate font-medium text-navy-800">{title || 'Adsız'}</span>
        </nav>

        <div className="flex items-center gap-3">
          {statusLabel ? (
            <span
              className={`text-xs ${
                saveStatus === 'error' ? 'text-rose-600' : 'text-navy-400'
              }`}
            >
              {statusLabel}
            </span>
          ) : null}
          <Button variant="secondary" onClick={() => setChildModal(true)}>
            <Plus size={16} />
            Alt Sayfa
          </Button>
          <Button variant="danger" onClick={() => void removePage()}>
            <Trash2 size={16} />
            Sil
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white px-6 py-8 lg:px-12 lg:py-10">
        <div className="relative mb-3 inline-block">
          <button
            type="button"
            className="rounded-xl px-1 text-4xl hover:bg-navy-50"
            onClick={() => setIconMenu((v) => !v)}
            title="İkon değiştir"
          >
            {page.icon || '📄'}
          </button>
          {iconMenu ? (
            <div className="absolute left-0 top-12 z-20 grid grid-cols-4 gap-1 rounded-xl border border-navy-100 bg-white p-2 shadow-xl">
              {PAGE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="rounded-lg p-2 text-lg hover:bg-navy-50"
                  onClick={() => void saveIcon(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => void saveTitle()}
          placeholder="Adsız sayfa"
          className="mb-8 w-full border-0 bg-transparent text-4xl font-semibold tracking-tight text-navy-950 outline-none placeholder:text-navy-300"
        />

        {id ? <BlockEditor pageId={id} onSaveStatusChange={setSaveStatus} /> : null}
      </div>

      {page.children && page.children.length > 0 ? (
        <section className="rounded-2xl border border-navy-100 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-navy-900">Alt sayfalar</h2>
          <ul className="divide-y divide-navy-50">
            {page.children.map((child) => (
              <li key={child.id}>
                <Link
                  to={`/notlar/${child.id}`}
                  className="flex items-center gap-3 px-1 py-3 text-sm hover:bg-navy-50/60"
                >
                  <span>{child.icon || '📄'}</span>
                  <span className="font-medium text-navy-800">{child.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Modal open={childModal} onClose={() => setChildModal(false)} title="Alt Sayfa Oluştur">
        <form onSubmit={createChild} className="space-y-4">
          <Input
            label="Başlık"
            required
            value={childTitle}
            onChange={(e) => setChildTitle(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setChildModal(false)}>
              Vazgeç
            </Button>
            <Button type="submit">Oluştur</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
