/**
 * LoginScreen — mock login (P2) : ดึงรายชื่อ provider จาก API แล้วให้เลือกเข้าสู่ระบบ
 * (แทน MOPH Provider ID จริง ระหว่างที่ยังไม่ได้ client id — สลับเป็น OIDC ภายหลัง)
 */
import React, { useEffect, useState } from 'react';
import { Hospital, UserCheck, LogIn, AlertCircle } from 'lucide-react';
import { api, type MockProfile } from '../lib/apiClient';
import { useAuth } from '../lib/AuthContext';
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
    <div className="min-h-screen bg-[#F6FAF7] bg-dot-grid text-[#17281F] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <img
            src={logoMoph}
            alt="ตราสัญลักษณ์กระทรวงสาธารณสุข"
            className="w-20 h-20 mx-auto mb-4 drop-shadow-sm"
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-[#17281F]">
            eMAC Hospital Portal
          </h1>
          <p className="text-xs text-[#61756A] mt-1">
            ระบบบัตรแพ้ยาอิเล็กทรอนิกส์ · กระทรวงสาธารณสุข
          </p>
          {/* เส้นคู่แบบหัวหนังสือราชการ */}
          <div className="w-24 mx-auto mt-4">
            <div className="h-[2px] bg-[#0F7B4D]" />
            <div className="h-px bg-[#CDE5D6] mt-[2px]" />
          </div>
        </div>

        <div className="bg-white border border-[#DBE9E0] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#E6F0E9] bg-[#F9FCFA]">
            <div className="flex items-center gap-2 text-[#17281F]">
              <UserCheck className="w-4 h-4 text-[#0F7B4D]" />
              <span className="text-sm font-bold">เลือกบัญชีเพื่อเข้าสู่ระบบ</span>
            </div>
            <p className="text-[11px] text-[#92600A] mt-1 font-mono">
              MOCK LOGIN — จำลอง MOPH Provider ID (ยังไม่ใช้ client id จริง)
            </p>
          </div>

          <div className="p-4 space-y-2">
            {loading && (
              <div className="py-10 text-center text-xs text-[#61756A]">
                กำลังโหลดรายชื่อบัญชี...
              </div>
            )}

            {loadError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FDECEA] border border-[#F5C6C0] text-[#B42318] text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loadError}</span>
              </div>
            )}

            {providers.map((p) => (
              <button
                key={p.providerId}
                onClick={() => handleLogin(p.providerId)}
                disabled={submitting !== null}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#DBE9E0] bg-white hover:bg-[#EEF6F0] hover:border-[#0F7B4D]/50 transition-all text-left disabled:opacity-50 group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EEF6F0] border border-[#CDE5D6] flex items-center justify-center text-[#0F7B4D] shrink-0">
                  <Hospital className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#17281F] truncate">{p.name}</p>
                  <p className="text-[10px] text-[#61756A] font-mono truncate">
                    {p.hospitalName} · {p.hospcode}
                  </p>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    p.role === 'pharmacist'
                      ? 'bg-[#EEF6F0] text-[#0F7B4D] border-[#CDE5D6]'
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}
                >
                  {p.role}
                </span>
                <LogIn className="w-4 h-4 text-[#A9BDB1] group-hover:text-[#0F7B4D] shrink-0" />
              </button>
            ))}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FDECEA] border border-[#F5C6C0] text-[#B42318] text-xs mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-[#8AA093] mt-6 font-mono">
          Phase 1 · Mock Authentication + Session
        </p>
      </div>
    </div>
  );
};
