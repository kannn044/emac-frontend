/**
 * AuthContext — สถานะ session ของทั้งแอป
 *   - login(providerId): เรียก API → เก็บ token → โหลด identity
 *   - logout(): ล้าง token
 *   - restore ตอนเปิดแอป: ถ้ามี token เดิม → ตรวจกับ /auth/me (หมดอายุ → logout)
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api, tokenStore, ApiError, type Identity } from './apiClient';

interface AuthState {
  identity: Identity | null;
  loading: boolean;
  error: string | null;
  login: (providerId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // restore session ตอนเปิดแอป
  useEffect(() => {
    let active = true;
    (async () => {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const { identity } = await api.getMe();
        if (active) setIdentity(identity);
      } catch {
        tokenStore.clear();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = async (providerId: string) => {
    setError(null);
    try {
      const res = await api.login(providerId);
      tokenStore.set(res.token);
      const { identity } = await api.getMe();
      setIdentity(identity);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'เข้าสู่ระบบไม่สำเร็จ';
      setError(msg);
      throw e;
    }
  };

  const logout = () => {
    tokenStore.clear();
    setIdentity(null);
  };

  return (
    <AuthContext.Provider value={{ identity, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
