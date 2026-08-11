export const projectStatusLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  ON_HOLD: 'Beklemede',
  COMPLETED: 'Tamamlandı',
  ARCHIVED: 'Arşiv',
};

export const taskStatusLabels: Record<string, string> = {
  TODO: 'Yapılacak',
  IN_PROGRESS: 'Devam ediyor',
  IN_REVIEW: 'İncelemede',
  DONE: 'Bitti',
  CANCELLED: 'İptal',
};

export const taskPriorityLabels: Record<string, string> = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  URGENT: 'Acil',
};

export const roleLabels: Record<string, string> = {
  OWNER: 'Sahip',
  ADMIN: 'Yönetici',
  EDITOR: 'Editör',
  MEMBER: 'Üye',
  VIEWER: 'Görüntüleyici',
};

export function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatDateTime(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function fullName(user?: { firstName?: string; lastName?: string } | null) {
  if (!user) return '—';
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—';
}
