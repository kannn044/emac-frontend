/**
 * CardView (P5) — แสดงบัตรที่ออกแล้ว: QR ตรวจความแท้ (public verify) + เปิด/พิมพ์บัตร (embed)
 */
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, ExternalLink, Copy, Check, QrCode } from 'lucide-react';
import type { CardLinks } from '../lib/apiClient';

export const CardView: React.FC<{ links: CardLinks }> = ({ links }) => {
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(links.verifyUrl, { width: 256, margin: 1 })
      .then(setQr)
      .catch(() => setQr(null));
  }, [links.verifyUrl]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(links.verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="p-5 bg-[#EEF6F0] border border-[#CDE5D6] rounded-2xl space-y-4">
      <div className="flex items-center gap-2 text-[#0F7B4D] text-xs font-bold uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4" />
        <span>บัตรแพ้ยาอิเล็กทรอนิกส์ (ออกแล้ว · ลงนามดิจิทัล)</span>
      </div>

      {/* บัตรจริง (render โดย API — ฟอร์แมตราชการ) ฝังผ่าน iframe */}
      <div className="rounded-xl overflow-hidden border border-[#CDE5D6] bg-white">
        <iframe
          title="บัตรแพ้ยา"
          src={links.embedUrl}
          className="w-full"
          style={{ height: 720, border: 'none' }}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="bg-white p-2 rounded-xl border border-[#CDE5D6] shrink-0">
          {qr ? (
            <img src={qr} alt="QR ตรวจความแท้บัตร" className="w-32 h-32" />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center text-[#A9BDB1]">
              <QrCode className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-3 w-full">
          <p className="text-[11px] text-[#4C6456] leading-relaxed">
            สแกน QR เพื่อตรวจความแท้ของบัตรด้วย public key (ใครก็ตรวจได้ ไม่ต้องเชื่อ server)
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate text-[10px] text-[#4C6456] font-mono bg-white border border-[#CDE5D6] rounded-lg px-2 py-1.5">
              {links.verifyUrl}
            </code>
            <button
              onClick={copy}
              className="shrink-0 p-1.5 rounded-lg border border-[#CDE5D6] bg-white text-[#61756A] hover:text-[#0F7B4D]"
              title="คัดลอกลิงก์ตรวจสอบ"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0F7B4D]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={links.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-[#F6FAF7] border border-[#CDE5D6] rounded-xl text-[#17281F]"
            >
              <ExternalLink className="w-3.5 h-3.5" /> เปิด / พิมพ์บัตร
            </a>
            <a
              href={links.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#0F7B4D] hover:bg-[#0B6640] rounded-xl text-white"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> ตรวจความแท้
            </a>
          </div>
          <p className="text-[10px] text-[#8AA093] font-mono">
            ออกเมื่อ {new Date(links.issuedAt).toLocaleString('th-TH')}
          </p>
        </div>
      </div>
    </div>
  );
};
