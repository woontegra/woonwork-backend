import { forwardRef, type CSSProperties, type KeyboardEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';
import { defaultBlockContent, type BlockContent, type BlockType } from '@woonwork/shared';
import {
  CalloutBlock,
  CodeBlock,
  DividerBlock,
  HeadingBlock,
  ListBlock,
  ParagraphBlock,
  QuoteBlock,
  TodoBlock,
} from './blocks';
import { CALLOUT_ICONS, CODE_LANGUAGES, type BlockDto } from './types';

interface BlockItemProps {
  block: BlockDto;
  isFirstEmpty: boolean;
  focusId: string | null;
  onContentChange: (blockId: string, content: BlockContent) => void;
  onKeyDown: (block: BlockDto, event: KeyboardEvent<HTMLDivElement>) => void;
  onOpenSlash: (blockId: string, rect: DOMRect | null, mode: 'transform' | 'insert') => void;
}

export const BlockItem = forwardRef<HTMLDivElement, BlockItemProps>(function BlockItem(
  { block, isFirstEmpty, focusId, onContentChange, onKeyDown, onOpenSlash },
  _ref,
) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  const content = (block.content ?? defaultBlockContent(block.type)) as BlockContent;
  const autoFocus = focusId === block.id;
  const placeholder =
    isFirstEmpty && block.type === 'PARAGRAPH'
      ? "Yazmaya başlayın veya '/' ile komut seçin"
      : undefined;

  function renderBody() {
    const common = {
      content,
      onChange: (next: BlockContent) => onContentChange(block.id, next),
      onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => onKeyDown(block, event),
      autoFocus,
      blockId: block.id,
    };

    switch (block.type as BlockType) {
      case 'HEADING_1':
        return <HeadingBlock {...common} level={1} />;
      case 'HEADING_2':
        return <HeadingBlock {...common} level={2} />;
      case 'HEADING_3':
        return <HeadingBlock {...common} level={3} />;
      case 'BULLETED_LIST':
        return <ListBlock {...common} />;
      case 'NUMBERED_LIST':
        return <ListBlock {...common} ordered />;
      case 'TODO':
        return <TodoBlock {...common} />;
      case 'QUOTE':
        return <QuoteBlock {...common} />;
      case 'CALLOUT':
        return <CalloutBlock {...common} icons={CALLOUT_ICONS} />;
      case 'CODE':
        return <CodeBlock {...common} languages={CODE_LANGUAGES} />;
      case 'DIVIDER':
        return <DividerBlock />;
      case 'PARAGRAPH':
      default:
        return <ParagraphBlock {...common} placeholder={placeholder} />;
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg px-1 ${isDragging ? 'z-10 scale-[1.01]' : ''}`}
    >
      <div className="absolute -left-12 top-1 flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          className="rounded-md p-1 text-navy-400 hover:bg-navy-100 hover:text-navy-700"
          title="Blok ekle"
          onMouseDown={(e) => {
            e.preventDefault();
            onOpenSlash(block.id, e.currentTarget.getBoundingClientRect(), 'insert');
          }}
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          className="cursor-grab rounded-md p-1 text-navy-400 hover:bg-navy-100 hover:text-navy-700 active:cursor-grabbing"
          title="Sürükle"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
      </div>
      <div className="min-w-0">{renderBody()}</div>
    </div>
  );
});
