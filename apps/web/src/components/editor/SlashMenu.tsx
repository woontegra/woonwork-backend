import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { BlockType } from '@woonwork/shared';
import { SLASH_ITEMS } from './types';

interface SlashMenuProps {
  open: boolean;
  query: string;
  anchorRect: DOMRect | null;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export function SlashMenu({ open, query, anchorRect, onSelect, onClose }: SlashMenuProps) {
  const [index, setIndex] = useState(0);

  const items = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return SLASH_ITEMS;
    return SLASH_ITEMS.filter((item) => {
      const hay = `${item.label} ${item.keywords.join(' ')}`.toLocaleLowerCase('tr-TR');
      return hay.includes(q);
    });
  }, [query]);

  useEffect(() => {
    setIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setIndex((i) => (i + 1) % Math.max(items.length, 1));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setIndex((i) => (i - 1 + Math.max(items.length, 1)) % Math.max(items.length, 1));
        return;
      }
      if (event.key === 'Enter' && items[index]) {
        event.preventDefault();
        event.stopPropagation();
        onSelect(items[index].type);
      }
    }

    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, items, index, onClose, onSelect]);

  if (!open) return null;

  const top = anchorRect ? anchorRect.bottom + 8 + window.scrollY : 120;
  const left = anchorRect ? Math.min(anchorRect.left, window.innerWidth - 320) : 80;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[80] w-72 overflow-hidden rounded-xl border border-navy-100 bg-white shadow-xl shadow-navy-900/10"
        style={{ top, left }}
        role="listbox"
      >
        <div className="border-b border-navy-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-navy-400">
          Bloklar
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {!items.length ? (
            <p className="px-3 py-4 text-sm text-navy-400">Sonuç bulunamadı</p>
          ) : (
            items.map((item, i) => (
              <button
                key={item.type}
                type="button"
                role="option"
                aria-selected={i === index}
                className={`flex w-full flex-col rounded-lg px-3 py-2 text-left transition ${
                  i === index ? 'bg-navy-50' : 'hover:bg-navy-50/70'
                }`}
                onMouseEnter={() => setIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(item.type);
                }}
              >
                <span className="text-sm font-medium text-navy-900">{item.label}</span>
                <span className="text-xs text-navy-400">{item.description}</span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
