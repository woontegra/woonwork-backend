import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { TenantDto } from '../types';
import { useAuth } from './AuthContext';
import { getStoredTenantId, setStoredTenantId } from '../lib/api';

interface TenantContextValue {
  tenants: TenantDto[];
  activeTenant: TenantDto | null;
  setActiveTenantId: (id: string) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenants, user } = useAuth();
  const [activeTenantId, setActiveTenantIdState] = useState<string | null>(() => getStoredTenantId());

  useEffect(() => {
    if (!user || tenants.length === 0) {
      setActiveTenantIdState(null);
      return;
    }

    const stored = getStoredTenantId();
    const exists = tenants.some((t) => t.id === stored);
    if (stored && exists) {
      setActiveTenantIdState(stored);
      return;
    }

    const first = tenants[0];
    setStoredTenantId(first.id);
    setActiveTenantIdState(first.id);
  }, [tenants, user]);

  const setActiveTenantId = (id: string) => {
    setStoredTenantId(id);
    setActiveTenantIdState(id);
  };

  const activeTenant = useMemo(
    () => tenants.find((t) => t.id === activeTenantId) ?? null,
    [tenants, activeTenantId],
  );

  const value = useMemo(
    () => ({ tenants, activeTenant, setActiveTenantId }),
    [tenants, activeTenant],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant TenantProvider içinde kullanılmalı');
  return ctx;
}
