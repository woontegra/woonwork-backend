import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronsUpDown, LogOut, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { fullName } from '../lib/labels';
import { MobileMenuButton } from './Sidebar';

export function Topbar({
  title,
  onOpenMobile,
}: {
  title: string;
  onOpenMobile: () => void;
}) {
  const { user, logout } = useAuth();
  const { tenants, activeTenant, setActiveTenantId } = useTenant();
  const [userOpen, setUserOpen] = useState(false);
  const [tenantOpen, setTenantOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setUserOpen(false);
        setTenantOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-navy-100/80 bg-cream/85 backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 py-3 lg:px-8">
        <MobileMenuButton onClick={onOpenMobile} />

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-navy-900">{title}</h1>
        </div>

        <div className="hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-400 md:flex">
          <Search size={16} />
          <input
            className="w-full bg-transparent outline-none placeholder:text-navy-300"
            placeholder="Ara... (yakında)"
            disabled
          />
        </div>

        <button
          type="button"
          className="rounded-xl p-2 text-navy-500 hover:bg-navy-50"
          aria-label="Bildirimler"
          title="Bildirimler"
        >
          <Bell size={18} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setTenantOpen((v) => !v);
              setUserOpen(false);
            }}
            className="hidden items-center gap-2 rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm font-medium text-navy-800 hover:bg-navy-50 sm:flex"
          >
            <span className="max-w-[140px] truncate">{activeTenant?.name ?? 'Çalışma alanı'}</span>
            <ChevronsUpDown size={14} className="text-navy-400" />
          </button>

          <AnimatePresence>
            {tenantOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-navy-100 bg-white shadow-xl"
              >
                {tenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    type="button"
                    onClick={() => {
                      setActiveTenantId(tenant.id);
                      setTenantOpen(false);
                      window.location.reload();
                    }}
                    className={`block w-full px-3 py-2.5 text-left text-sm hover:bg-navy-50 ${
                      tenant.id === activeTenant?.id ? 'bg-navy-50 font-semibold text-navy-900' : 'text-navy-700'
                    }`}
                  >
                    {tenant.name}
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setUserOpen((v) => !v);
              setTenantOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-2.5 py-1.5 hover:bg-navy-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-xs font-semibold text-white">
              {(user?.firstName?.[0] || 'U').toUpperCase()}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-navy-900">{fullName(user)}</p>
              <p className="text-[11px] text-navy-400">{user?.email}</p>
            </div>
          </button>

          <AnimatePresence>
            {userOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-navy-100 bg-white shadow-xl"
              >
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-700 hover:bg-rose-50"
                >
                  <LogOut size={16} />
                  Çıkış Yap
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
