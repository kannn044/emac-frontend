/**
 * LoginScreen — mock login (P2) : ดึงรายชื่อ provider จาก API แล้วให้เลือกเข้าสู่ระบบ
 * (แทน MOPH Provider ID จริง ระหว่างที่ยังไม่ได้ client id — สลับเป็น OIDC ภายหลัง)
 */
import React, { useEffect, useState } from 'react';
import { ShieldAlert, Hospital, UserCheck, LogIn, AlertCircle } from 'lucide-react';
import { api, type MockProfile } from '../lib/apiClient';
import { useAuth } from '../lib/AuthContext';

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
    <div className="min-h-screen bg-[#07080a] text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-500 mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            eMAC Hospital Portal
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            ระบบบัตรแพ้ยาอิเล็กทรอนิกส์ · ฝั่งโรงพยาบาล
          </p>
        </div>

        <div className="bg-[#0b0c0e] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2 text-zinc-300">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold">เลือกบัญชีเพื่อเข้าสู่ระบบ</span>
            </div>
            <p className="text-[11px] text-amber-400/80 mt-1 font-mono">
              MOCK LOGIN — จำลอง MOPH Provider ID (ยังไม่ใช้ client id จริง)
            </p>
          </div>

          <div className="p-4 space-y-2">
            {loading && (
              <div className="py-10 text-center text-xs text-zinc-500 font-mono">
                กำลังโหลดรายชื่อบัญชี...
              </div>
            )}

            {loadError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/40 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loadError}</span>
              </div>
            )}

            {providers.map((p) => (
              <button
                key={p.providerId}
                onClick={() => handleLogin(p.providerId)}
                disabled={submitting !== null}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-indigo-500/50 transition-all text-left disabled:opacity-50 group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Hospital className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-100 truncate">{p.name}</p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">
                    {p.hospitalName} · {p.hospcode}
                  </p>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    p.role === 'pharmacist'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  }`}
                >
                  {p.role}
                </span>
                <LogIn className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 shrink-0" />
              </button>
            ))}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/40 text-red-300 text-xs mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-zinc-600 mt-6 font-mono">
          Phase 1 · Mock Authentication + Session
        </p>
      </div>
    </div>
  );
};
