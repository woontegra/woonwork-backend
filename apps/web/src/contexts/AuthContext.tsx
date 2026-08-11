import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { TenantDto, UserDto } from '../types';
import {
  apiRequest,
  clearStoredTenantId,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../lib/api';

interface AuthContextValue {
  user: UserDto | null;
  tenants: TenantDto[];
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setTenants([]);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ user: UserDto; tenants: TenantDto[] }>('/auth/me');
      setUser(data.user);
      setTenants(data.tenants);
    } catch {
      clearTokens();
      setUser(null);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string, _rememberMe?: boolean) => {
    const data = await apiRequest<{
      user: UserDto;
      tenants: TenantDto[];
      tokens: { accessToken: string; refreshToken: string };
    }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });

    setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    setUser(data.user);
    setTenants(data.tenants);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: { refreshToken },
          auth: false,
        });
      }
    } catch {
      // ignore
    } finally {
      clearTokens();
      clearStoredTenantId();
      setUser(null);
      setTenants([]);
    }
  }, []);

  const value = useMemo(
    () => ({ user, tenants, loading, login, logout, refreshMe }),
    [user, tenants, loading, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı');
  return ctx;
}
