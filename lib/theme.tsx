/**
 * theme — dark/light mode
 *   useTheme()   : อ่าน/สลับโหมด (persist ที่ localStorage 'emac-theme')
 *   <ThemeToggle>: สวิตช์เลื่อน พร้อมไอคอนพระอาทิตย์/พระจันทร์
 * ค่าเริ่มต้นถูกตั้งก่อน paint โดย inline script ใน index.html (กัน flash)
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('emac-theme', dark ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);
  return { dark, toggle };
}

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { dark, toggle } = useTheme();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="สลับโหมดสว่าง/มืด"
      title={dark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
      onClick={toggle}
      className={`relative inline-flex w-12 h-6 shrink-0 rounded-full border border-[var(--border)] bg-[var(--tint)] transition-colors hover:border-[var(--primary-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] ${className}`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm flex items-center justify-center transition-transform duration-200 ${
          dark ? 'translate-x-[26px]' : 'translate-x-0'
        }`}
      >
        {dark ? (
          <Moon className="w-3 h-3 text-[var(--primary)]" />
        ) : (
          <Sun className="w-3 h-3 text-[var(--warn-text)]" />
        )}
      </span>
    </button>
  );
};
