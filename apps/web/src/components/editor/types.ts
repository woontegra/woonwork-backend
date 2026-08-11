import type { BlockType, BlockContent } from '@woonwork/shared';

export interface BlockDto {
  id: string;
  tenantId: string;
  pageId: string;
  parentBlockId: string | null;
  type: BlockType;
  content: BlockContent;
  position: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const SLASH_ITEMS: Array<{
  type: BlockType;
  label: string;
  keywords: string[];
  description: string;
}> = [
  {
    type: 'PARAGRAPH',
    label: 'Metin',
    keywords: ['metin', 'paragraph', 'text', 'yazı'],
    description: 'Düz metin paragrafı',
  },
  {
    type: 'HEADING_1',
    label: 'Başlık 1',
    keywords: ['başlık', 'baslik', 'h1', 'heading'],
    description: 'Büyük başlık',
  },
  {
    type: 'HEADING_2',
    label: 'Başlık 2',
    keywords: ['başlık', 'baslik', 'h2', 'heading'],
    description: 'Orta başlık',
  },
  {
    type: 'HEADING_3',
    label: 'Başlık 3',
    keywords: ['başlık', 'baslik', 'h3', 'heading'],
    description: 'Küçük başlık',
  },
  {
    type: 'BULLETED_LIST',
    label: 'Madde İşaretli Liste',
    keywords: ['madde', 'liste', 'bullet', 'ul'],
    description: 'Madde işaretli liste öğesi',
  },
  {
    type: 'NUMBERED_LIST',
    label: 'Numaralı Liste',
    keywords: ['numara', 'liste', 'numbered', 'ol'],
    description: 'Numaralı liste öğesi',
  },
  {
    type: 'TODO',
    label: 'Yapılacaklar',
    keywords: ['todo', 'yapılacak', 'checkbox', 'görev'],
    description: 'Kontrol listesi öğesi',
  },
  {
    type: 'QUOTE',
    label: 'Alıntı',
    keywords: ['alıntı', 'alinti', 'quote'],
    description: 'Alıntı bloğu',
  },
  {
    type: 'CALLOUT',
    label: 'Bilgi Kutusu',
    keywords: ['bilgi', 'callout', 'kutu', 'uyarı'],
    description: 'Vurgulu bilgi kutusu',
  },
  {
    type: 'DIVIDER',
    label: 'Ayırıcı',
    keywords: ['ayırıcı', 'ayirici', 'divider', 'çizgi'],
    description: 'Yatay ayırıcı çizgi',
  },
  {
    type: 'CODE',
    label: 'Kod',
    keywords: ['kod', 'code', 'javascript', 'sql'],
    description: 'Kod bloğu',
  },
];

export const CODE_LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'python', label: 'Python' },
] as const;

export const CALLOUT_ICONS = ['💡', '⚠️', '✅', '❌', '📌', '📝', '🔥', 'ℹ️'] as const;

export function getText(content: BlockContent | undefined): string {
  return content?.text ?? '';
}
