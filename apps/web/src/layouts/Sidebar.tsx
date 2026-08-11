import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderKanban,
  Home,
  Menu,
  Settings,
  Share2,
  SquareCheckBig,
  Users,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Ana Sayfa', icon: Home, end: true },
  { to: '/projeler', label: 'Projeler', icon: FolderKanban },
  { to: '/gorevler', label: 'Görevler', icon: SquareCheckBig },
  { to: '/takvim', label: 'Takvim', icon: CalendarDays },
  { to: '/notlar', label: 'Notlar & Belgeler', icon: FileText },
  { to: '/sosyal-medya', label: 'Sosyal Medya', icon: Share2 },
  { to: '/ekip', label: 'Ekip', icon: Users },
  { to: '/ayarlar', label: 'Ayarlar', icon: Settings },
];

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}) {
  const content = (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 border-b border-white/10 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm font-bold tracking-tight text-white ring-1 ring-white/15">
          W
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate font-display text-xl leading-none text-white">WoonWork</p>
            <p className="mt-1 truncate text-[11px] uppercase tracking-[0.18em] text-navy-300">
              Çalışma Alanı
            </p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/12 text-white shadow-inner'
                    : 'text-navy-200 hover:bg-white/6 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={item.label}
            >
              <Icon size={18} className="shrink-0 opacity-90" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-navy-200 transition hover:bg-white/6 hover:text-white lg:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed ? <span>Daralt</span> : null}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 bg-navy-950 text-white transition-[width] duration-300 lg:block ${
          collapsed ? 'w-[76px]' : 'w-[260px]'
        }`}
      >
        {content}
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Menüyü kapat"
              className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-navy-950 text-white lg:hidden"
            >
              <button
                type="button"
                onClick={onCloseMobile}
                className="absolute right-3 top-4 rounded-lg p-2 text-navy-300 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
              {content}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl p-2 text-navy-600 hover:bg-navy-50 lg:hidden"
      aria-label="Menüyü aç"
    >
      <Menu size={20} />
    </button>
  );
}
