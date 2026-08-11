import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { roleLabels } from '../lib/labels';

const tabs = ['Genel', 'Çalışma Alanı', 'Üyeler', 'Depolama', 'Güvenlik'] as const;

export function SettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Genel');
  const { user } = useAuth();
  const { activeTenant } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-navy-100 pb-3">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
              tab === item
                ? 'bg-navy-900 text-white'
                : 'text-navy-600 hover:bg-navy-50'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-navy-100 bg-white p-6"
      >
        {tab === 'Genel' ? (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-navy-900">Genel</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Ad Soyad" value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} />
              <Info label="E-posta" value={user?.email ?? '—'} />
            </div>
          </div>
        ) : null}

        {tab === 'Çalışma Alanı' ? (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-navy-900">Çalışma Alanı</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Ad" value={activeTenant?.name ?? '—'} />
              <Info label="Slug" value={activeTenant?.slug ?? '—'} />
              <Info label="Rolünüz" value={roleLabels[activeTenant?.role ?? ''] ?? activeTenant?.role ?? '—'} />
            </div>
          </div>
        ) : null}

        {tab === 'Üyeler' ? (
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-navy-900">Üyeler</h2>
            <p className="text-sm text-navy-500">
              Üye yönetimi için Ekip sayfasını kullanın. Davet sistemi sonraki aşamada eklenecek.
            </p>
          </div>
        ) : null}

        {tab === 'Depolama' ? (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-navy-900">Depolama</h2>
            <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4">
              <p className="text-sm text-navy-500">Kullanılan Alan</p>
              <p className="mt-1 text-3xl font-semibold text-navy-950">0 MB</p>
              <p className="mt-2 text-xs text-navy-400">
                Vercel Blob henüz bağlanmadı. StorageProvider abstraction hazır.
              </p>
            </div>
          </div>
        ) : null}

        {tab === 'Güvenlik' ? (
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-navy-900">Güvenlik</h2>
            <p className="text-sm text-navy-500">
              Oturumlar JWT + refresh token ile korunur. Şifre değiştirme ve oturum yönetimi sonraki aşamada eklenecek.
            </p>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-navy-50/40 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-navy-900">{value}</p>
    </div>
  );
}
