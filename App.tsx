/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { Portal } from './components/Portal';
import logoMoph from './assets/logo_moph.png';

/** Header หลังล็อกอิน — แสดงตัวตนจาก session + ปุ่มออกจากระบบ */
const AppHeader: React.FC = () => {
  const { identity, logout } = useAuth();
  if (!identity) return null;
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md">
      <div className="px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src={logoMoph}
              alt="ตราสัญลักษณ์กระทรวงสาธารณสุข"
              className="w-11 h-11 shrink-0"
            />
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-[#17281F]">
                eMAC Hospital Portal
              </h1>
              <p className="text-[11px] text-[#61756A]">
                ระบบบัตรแพ้ยาอิเล็กทรอนิกส์ · กระทรวงสาธารณสุข
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#17281F]">{identity.name}</p>
              <p className="text-[10px] text-[#61756A] font-mono">
                {identity.role} · รพ. {identity.hospcode}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#61756A] hover:text-[#0F7B4D] bg-[#F6FAF7] border border-[#DBE9E0] hover:border-[#0F7B4D]/40 hover:bg-[#EEF6F0] rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
      {/* เส้นคู่แบบหัวหนังสือราชการ */}
      <div className="h-[2px] bg-[#0F7B4D]" />
      <div className="h-px bg-[#CDE5D6] mt-[2px]" />
    </header>
  );
};

const Gate: React.FC = () => {
  const { identity, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6FAF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0F7B4D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!identity) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-[#F6FAF7] text-[#17281F] font-sans antialiased flex flex-col">
      <AppHeader />
      <Portal />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <Gate />
  </AuthProvider>
);

export default App;
