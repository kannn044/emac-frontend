/**
 * LoginScreen — mock login (P2) : ดึงรายชื่อ provider จาก API แล้วให้เลือกเข้าสู่ระบบ
 * (แทน MOPH Provider ID จริง ระหว่างที่ยังไม่ได้ client id — สลับเป็น OIDC ภายหลัง)
 */
import React, { useEffect, useState } from 'react';
import { Hospital, UserCheck, LogIn, AlertCircle } from 'lucide-react';
import { api, type MockProfile } from '../lib/apiClient';
import { useAuth } from '../lib/AuthContext';
import { ThemeToggle } from '../lib/theme';
import logoMoph from '../assets/logo_moph.png';

export const LoginScreen: React.FC = () => {
  const { login, error } = useAuth();
  const [providers, setProviders] = useState<MockProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { providers } = await api.getProviders();
        if (active) setProviders(providers);
      } catch {
        if (active)
          setLoadError('เชื่อมต่อ backend ไม่ได้ — ตรวจว่ารัน API ที่พอร์ต 3000 แล้ว');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (providerId: string) => {
    setSubmitting(providerId);
    try {
      await login(providerId);
    } catch {
      /* error แสดงผ่าน useAuth().error */
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)] bg-dot-grid text-[var(--ink)] flex items-center justify-center p-6">
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <img
            src={logoMoph}
            alt="ตราสัญลักษณ์กระทรวงสาธารณสุข"
            className="w-20 h-20 mx-auto mb-4 drop-shadow-sm"
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">
            eMAC Hospital Portal
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            ระบบบัตรแพ้ยาอิเล็กทรอนิกส์ · กระทรวงสาธารณสุข
          </p>
          {/* เส้นคู่แบบหัวหนังสือราชการ */}
          <div className="w-24 mx-auto mt-4">
            <div className="h-[2px] bg-[var(--primary)]" />
            <div className="h-px bg-[var(--line)] mt-[2px]" />
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--border-soft)] bg-[var(--surface-2)]">
            <div className="flex items-center gap-2 text-[var(--ink)]">
              <UserCheck className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-bold">เลือกบัญชีเพื่อเข้าสู่ระบบ</span>
            </div>
            <p className="text-[11px] text-[var(--warn-text)] mt-1 font-mono">
              MOCK LOGIN — จำลอง MOPH Provider ID (ยังไม่ใช้ client id จริง)
            </p>
          </div>

          <div className="p-4 space-y-2">
            {loading && (
              <div className="py-10 text-center text-xs text-[var(--muted)]">
                กำลังโหลดรายชื่อบัญชี...
              </div>
            )}

            {loadError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--danger-bg)] border border-[var(--danger-border)] text-[var(--danger-text)] text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loadError}</span>
              </div>
            )}

            {providers.map((p) => (
              <button
                key={p.providerId}
                onClick={() => handleLogin(p.providerId)}
                disabled={submitting !== null}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--tint)] hover:border-[var(--primary-soft)] transition-all text-left disabled:opacity-50 group"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--tint)] border border-[var(--line)] flex items-center justify-center text-[var(--primary)] shrink-0">
                  <Hospital className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--ink)] truncate">{p.name}</p>
                  <p className="text-[10px] text-[var(--muted)] font-mono truncate">
                    {p.hospitalName} · {p.hospcode}
                  </p>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    p.role === 'pharmacist'
                      ? 'bg-[var(--tint)] text-[var(--primary)] border-[var(--line)]'
                      : 'bg-[var(--info-bg)] text-[var(--info-text)] border-[var(--info-border)]'
                  }`}
                >
                  {p.role}
                </span>
                <LogIn className="w-4 h-4 text-[var(--faint)] group-hover:text-[var(--primary)] shrink-0" />
              </button>
            ))}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--danger-bg)] border border-[var(--danger-border)] text-[var(--danger-text)] text-xs mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-[var(--muted-2)] mt-6 font-mono">
          Phase 1 · Mock Authentication + Session
        </p>
      </div>
    </div>
  );
};
