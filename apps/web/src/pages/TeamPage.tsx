import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import type { MemberDto } from '../types';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../components/ui/Toast';
import { EmptyState, Skeleton } from '../components/ui/PageLoader';
import { Badge } from '../components/ui/Form';
import { formatDate, fullName, roleLabels } from '../lib/labels';

export function TeamPage() {
  const { activeTenant } = useTenant();
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeTenant) return;
    let cancelled = false;
    setLoading(true);
    apiRequest<MemberDto[]>(`/tenants/${activeTenant.id}/members`)
      .then((data) => {
        if (!cancelled) setMembers(data);
      })
      .catch((err) => toast(err.message || 'Ekip yüklenemedi', 'error'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTenant, toast]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (!members.length) {
    return <EmptyState title="Üye bulunamadı" description="Bu çalışma alanında henüz üye yok." />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-navy-100 bg-navy-50/60 text-xs uppercase tracking-wide text-navy-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Üye</th>
            <th className="px-4 py-3 font-semibold">E-posta</th>
            <th className="px-4 py-3 font-semibold">Rol</th>
            <th className="px-4 py-3 font-semibold">Katılım</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-navy-50 last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-xs font-semibold text-white">
                    {member.user.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">{fullName(member.user)}</p>
                    <p className="text-xs text-navy-400">
                      {member.user.isActive ? 'Aktif' : 'Pasif'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-navy-600">{member.user.email}</td>
              <td className="px-4 py-3">
                <Badge tone="blue">{roleLabels[member.role] ?? member.role}</Badge>
              </td>
              <td className="px-4 py-3 text-navy-500">{formatDate(member.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
