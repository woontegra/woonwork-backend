import { useState, type KeyboardEvent } from 'react';
import { EditableText } from '../EditableText';
import type { BlockContent } from '@woonwork/shared';

interface CommonProps {
  content: BlockContent;
  onChange: (content: BlockContent) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  placeholder?: string;
  autoFocus?: boolean;
  blockId: string;
}

export function ParagraphBlock({ content, onChange, onKeyDown, placeholder, autoFocus, blockId }: CommonProps) {
  return (
    <EditableText
      data-block-id={blockId}
      value={content.text ?? ''}
      onChange={(text) => onChange({ ...content, text })}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="min-h-[1.6em] py-1 text-[15px] leading-7 text-navy-900"
    />
  );
}

export function HeadingBlock({
  level,
  content,
  onChange,
  onKeyDown,
  autoFocus,
  blockId,
}: CommonProps & { level: 1 | 2 | 3 }) {
  const sizes = {
    1: 'text-3xl font-semibold tracking-tight py-1',
    2: 'text-2xl font-semibold tracking-tight py-1',
    3: 'text-xl font-semibold tracking-tight py-0.5',
  };
  return (
    <EditableText
      data-block-id={blockId}
      value={content.text ?? ''}
      onChange={(text) => onChange({ ...content, text })}
      onKeyDown={onKeyDown}
      placeholder={`Başlık ${level}`}
      autoFocus={autoFocus}
      className={`min-h-[1.4em] text-navy-950 ${sizes[level]}`}
    />
  );
}

export function ListBlock({
  ordered,
  content,
  onChange,
  onKeyDown,
  autoFocus,
  blockId,
}: CommonProps & { ordered?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-0.5">
      <span className="mt-1.5 w-5 shrink-0 text-center text-sm text-navy-400">
        {ordered ? '1.' : '•'}
      </span>
      <EditableText
        data-block-id={blockId}
        value={content.text ?? ''}
        onChange={(text) => onChange({ ...content, text })}
        onKeyDown={onKeyDown}
        placeholder="Liste öğesi"
        autoFocus={autoFocus}
        className="min-h-[1.6em] flex-1 text-[15px] leading-7 text-navy-900"
      />
    </div>
  );
}

export function TodoBlock({
  content,
  onChange,
  onKeyDown,
  autoFocus,
  blockId,
}: CommonProps) {
  const checked = Boolean(content.checked);
  return (
    <div className="flex items-start gap-2.5 py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange({ ...content, checked: e.target.checked })}
        className="mt-2 h-4 w-4 rounded border-navy-300 text-navy-900"
      />
      <EditableText
        data-block-id={blockId}
        value={content.text ?? ''}
        onChange={(text) => onChange({ ...content, text })}
        onKeyDown={onKeyDown}
        placeholder="Yapılacak"
        autoFocus={autoFocus}
        className={`min-h-[1.6em] flex-1 text-[15px] leading-7 ${
          checked ? 'text-navy-400 line-through opacity-70' : 'text-navy-900'
        }`}
      />
    </div>
  );
}

export function QuoteBlock({ content, onChange, onKeyDown, autoFocus, blockId }: CommonProps) {
  return (
    <div className="border-l-[3px] border-navy-300 pl-4">
      <EditableText
        data-block-id={blockId}
        value={content.text ?? ''}
        onChange={(text) => onChange({ ...content, text })}
        onKeyDown={onKeyDown}
        placeholder="Alıntı"
        autoFocus={autoFocus}
        className="min-h-[1.6em] py-1 text-[15px] italic leading-7 text-navy-700"
      />
    </div>
  );
}

export function CalloutBlock({
  content,
  onChange,
  onKeyDown,
  autoFocus,
  blockId,
  icons,
}: CommonProps & { icons: readonly string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex gap-3 rounded-xl border border-navy-100 bg-navy-50/60 px-3 py-2.5">
      <div className="relative">
        <button
          type="button"
          className="rounded-lg px-1 text-lg hover:bg-white"
          title="İkon seç"
          onClick={() => setOpen((v) => !v)}
        >
          {content.icon || '💡'}
        </button>
        {open ? (
          <div className="absolute left-0 top-8 z-20 grid grid-cols-4 gap-1 rounded-xl border border-navy-100 bg-white p-2 shadow-lg">
            {icons.map((icon) => (
              <button
                key={icon}
                type="button"
                className="rounded-lg p-1.5 text-base hover:bg-navy-50"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange({ ...content, icon });
                  setOpen(false);
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <EditableText
        data-block-id={blockId}
        value={content.text ?? ''}
        onChange={(text) => onChange({ ...content, text })}
        onKeyDown={onKeyDown}
        placeholder="Bilgi metni"
        autoFocus={autoFocus}
        className="min-h-[1.6em] flex-1 text-[15px] leading-7 text-navy-900"
      />
    </div>
  );
}

export function CodeBlock({
  content,
  onChange,
  onKeyDown,
  autoFocus,
  blockId,
  languages,
}: CommonProps & { languages: ReadonlyArray<{ value: string; label: string }> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-navy-800/20 bg-navy-950 text-navy-50">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <select
          value={content.language || 'javascript'}
          onChange={(e) => onChange({ ...content, language: e.target.value })}
          className="rounded-md border-0 bg-transparent text-xs text-navy-200 outline-none"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value} className="text-navy-900">
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      <EditableText
        data-block-id={blockId}
        value={content.text ?? ''}
        onChange={(text) => onChange({ ...content, text })}
        onKeyDown={onKeyDown}
        placeholder="Kod yazın..."
        autoFocus={autoFocus}
        className="min-h-[4rem] px-4 py-3 font-mono text-[13px] leading-6 text-navy-50"
      />
    </div>
  );
}

export function DividerBlock() {
  return <hr className="my-3 border-0 border-t border-navy-200" />;
}
