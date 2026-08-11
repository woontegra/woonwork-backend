import { useEffect, useRef, type KeyboardEvent, type ClipboardEvent } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  'data-block-id'?: string;
}

export function EditableText({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className = '',
  multiline = true,
  autoFocus,
  'data-block-id': dataBlockId,
}: EditableTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastValue = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const current = el.innerText.replace(/\n$/, '');
    if (current === value) return;
    el.innerText = value;
    lastValue.current = value;
    if (document.activeElement === el) {
      placeCaretAtEnd(el);
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
      placeCaretAtEnd(ref.current);
    }
  }, [autoFocus]);

  return (
    <div
      ref={ref}
      role="textbox"
      aria-multiline={multiline}
      contentEditable
      suppressContentEditableWarning
      data-block-id={dataBlockId}
      data-placeholder={placeholder}
      className={`editable-block w-full outline-none ${
        !value
          ? 'before:pointer-events-none before:text-navy-300 before:content-[attr(data-placeholder)]'
          : ''
      } ${className}`}
      onInput={() => {
        const next = ref.current?.innerText ?? '';
        // Normalize contentEditable trailing newline quirks
        const normalized = next.replace(/\n$/, '');
        if (normalized !== lastValue.current) {
          lastValue.current = normalized;
          onChange(normalized);
        }
      }}
      onKeyDown={(event) => {
        if (!multiline && event.key === 'Enter') {
          event.preventDefault();
        }
        onKeyDown?.(event);
      }}
      onPaste={(event: ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }}
    />
  );
}

export function placeCaretAtEnd(el: HTMLElement) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export function focusBlock(blockId: string, atEnd = true) {
  const el = document.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`);
  if (!el) return;
  el.focus();
  if (atEnd) placeCaretAtEnd(el);
}
