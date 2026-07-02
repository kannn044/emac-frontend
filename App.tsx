/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { Portal } from './components/Portal';

/** Header หลังล็อกอิน — แสดงตัวตนจาก session + ปุ่มออกจากระบบ */
const AppHeader: React.FC = () => {
  const { identity, logout } = useAuth();
  if (!identity) return null;
  return (
    <header className="border-b border-zinc-900 bg-[#090a0d]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 text-red-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">
              eMAC Hospital Portal
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono">
              ระบบบัตรแพ้ยาอิเล็กทรอนิกส์ · ฝั่งโรงพยาบาล
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-zinc-200">{identity.name}</p>
            <p className="text-[10px] text-zinc-500 font-mono">
              {identity.role} · รพ. {identity.hospcode}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const Gate: React.FC = () => {
  const { identity, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!identity) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 font-sans antialiased flex flex-col">
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
