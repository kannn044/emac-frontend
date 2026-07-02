/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeToggle } from './lib/theme';
import { LoginScreen } from './components/LoginScreen';
import { Portal } from './components/Portal';
import logoMoph from './assets/logo_moph.png';

/** Header หลังล็อกอิน — แสดงตัวตนจาก session + ปุ่มออกจากระบบ */
const AppHeader: React.FC = () => {
  const { identity, logout } = useAuth();
  if (!identity) return null;
  return (
    <header className="sticky top-0 z-40 bg-[var(--header-bg)] backdrop-blur-md">
      <div className="px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src={logoMoph}
              alt="ตราสัญลักษณ์กระทรวงสาธารณสุข"
              className="w-11 h-11 shrink-0"
            />
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-[var(--ink)]">
                eMAC Hospital Portal
              </h1>
              <p className="text-[11px] text-[var(--muted)]">
                ระบบบัตรแพ้ยาอิเล็กทรอนิกส์ · กระทรวงสาธารณสุข
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[var(--ink)]">{identity.name}</p>
              <p className="text-[10px] text-[var(--muted)] font-mono">
                {identity.role} · รพ. {identity.hospcode}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--primary)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--primary-soft)] hover:bg-[var(--tint)] rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
      {/* เส้นคู่แบบหัวหนังสือราชการ */}
      <div className="h-[2px] bg-[var(--primary)]" />
      <div className="h-px bg-[var(--line)] mt-[2px]" />
    </header>
  );
};

const Gate: React.FC = () => {
  const { identity, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!identity) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans antialiased flex flex-col">
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
