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

/** key เก็บ state (CSRF) ระหว่าง redirect ไป Provider ID แล้วกลับมา */
const OAUTH_STATE_KEY = 'emac_oauth_state';

export const oauthStateStore = {
  create(): string {
    const state = crypto.randomUUID();
    sessionStorage.setItem(OAUTH_STATE_KEY, state);
    return state;
  },
  consume(): string | null {
    const s = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    return s;
  },
};

/** อ่าน ?code&state&error จาก URL callback ของ OAuth แล้วล้างออกจาก address bar */
function consumeOAuthParams(): { code: string; state: string; oauthError: string } | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') ?? '';
  const oauthError = params.get('error') ?? '';
  if (!code && !oauthError) return null;
  const state = params.get('state') ?? '';
  // ล้าง query ออกจาก URL (กัน code ค้างใน history/refresh แล้วยิงซ้ำ)
  window.history.replaceState({}, '', window.location.pathname);
  return { code, state, oauthError };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ตอนเปิดแอป: (1) กลับมาจาก Provider ID พร้อม ?code → แลกเป็น session
  //             (2) ไม่งั้นถ้ามี token เดิม → restore ผ่าน /auth/me
  useEffect(() => {
    let active = true;
    (async () => {
      const oauth = consumeOAuthParams();
      if (oauth) {
        try {
          if (oauth.oauthError) {
            throw new ApiError(400, 'OAUTH_ERROR', `เข้าสู่ระบบไม่สำเร็จ: ${oauth.oauthError}`);
          }
          const expected = oauthStateStore.consume();
          // ตรวจ state เฉพาะกรณีที่เราเป็นคนสร้างไว้ (กัน CSRF)
          if (expected && oauth.state && expected !== oauth.state) {
            throw new ApiError(
              400,
              'OAUTH_STATE_MISMATCH',
              'การเข้าสู่ระบบไม่ปลอดภัย (state ไม่ตรง) กรุณาลองใหม่',
            );
          }
          const res = await api.loginWithCode(oauth.code);
          tokenStore.set(res.token);
          const { identity } = await api.getMe();
          if (active) setIdentity(identity);
        } catch (e) {
          if (active) {
            setError(e instanceof ApiError ? e.message : 'เข้าสู่ระบบไม่สำเร็จ');
          }
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

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
