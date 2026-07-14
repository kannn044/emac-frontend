# eMAC Hospital Portal (Frontend)

หน้าเว็บฝั่งโรงพยาบาลของระบบบัตรแพ้ยาอิเล็กทรอนิกส์ (eMAC) — แพทย์/เภสัชกร ตรวจสอบและออกบัตรแพ้ยา
เชื่อมต่อกับ **Drug Allergy Card API** (`../emac-backend`)

React 19 + Vite + Tailwind — production: **https://emac.moph.go.th**

## ภาพรวม

```
เบราว์เซอร์ ──► emac.moph.go.th (nginx เสิร์ฟ static dist/)
                  ├─ /auth/*, /api/*, /embed/*  → proxy ไป api-mophlink.moph.go.th/drugallergy
                  └─ /* → index.html (SPA)
```

frontend เรียก API แบบ **same-origin** (`VITE_API_BASE` ว่าง) — nginx บนเครื่อง emac
proxy ต่อไป backend จึงไม่ติด CORS · การ login ใช้ **MOPH Provider ID (OAuth2)** ผ่าน backend

## สถานะการพัฒนา

| Phase | ขอบเขต | สถานะ |
|-------|--------|-------|
| **P1** | Login + session + app shell (mock สำหรับ dev / **Provider ID จริงสำหรับ production**) | ✅ |
| **P2** | คิวผู้ป่วย + รายละเอียด ดึงจาก API แบบ tenant-scoped (search/filter/paging) | ✅ |
| **P3** | Verify workspace: เลือกยา + กรอกคลินิก + ลงนามดิจิทัล / reject / note | ✅ |
| **P4** | แสดงบัตรที่ออกแล้ว + QR ตรวจความแท้ + เปิด/พิมพ์บัตร (embed) | ✅ |

## การเข้าสู่ระบบ

หน้า login เช็ค `GET /auth/mode` จาก backend แล้วเลือก UI อัตโนมัติ:

- **`real`** (production) — ปุ่ม "เข้าสู่ระบบด้วย Provider ID" → redirect ไป MOPH Provider ID
  → login สำเร็จ backend เด้ง `?code` กลับมา → `AuthContext` แลก code เป็น session JWT
  (ตรวจ `state` กัน CSRF ให้อัตโนมัติ)
- **`mock`** (dev) — เลือกบัญชีจำลองจาก `GET /auth/providers` (เภสัชกร/แพทย์ ต่าง รพ.)

## รันในเครื่อง (dev)

ต้องรัน **2 ตัว**: backend API + frontend นี้

**1) Backend** (โฟลเดอร์ `../emac-backend`) — dev ไม่ต้องมี Postgres:

```bash
cd ../emac-backend
npm install
AUTH_PROVIDER=mock KEY_STORE=memory DATA_STORE=memory SESSION_JWT_SECRET=dev-secret npm run dev
# → http://localhost:3000
```

**2) Frontend** (โฟลเดอร์นี้):

```bash
npm install
npm run dev        # → http://localhost:5173
```

Vite dev server proxy `/auth`, `/api`, `/embed` ไป backend อัตโนมัติ
(ตั้งเป้าหมายที่ `VITE_API_PROXY_TARGET` ใน `.env.local`)

## Build & Deploy (production: emac.moph.go.th)

```bash
npm ci
npm run build:emac     # โหลด .env.production-emac (VITE_API_BASE ว่าง, base=/)
rsync -a --delete dist/ /var/www/emac-frontend/dist/
```

- **ไม่ใช้ pm2/vite preview** — nginx เสิร์ฟ `dist/` ตรง (ดู `deploy/nginx-emac.conf` +
  `deploy/snippets/emac-api-proxy.conf`)
- nginx proxy `/auth`, `/api`, `/embed` → `https://api-mophlink.moph.go.th/drugallergy/...`
  (RHEL: ต้อง `setsebool -P httpd_can_network_connect 1`)
- log: `/var/log/nginx/access.log`, `error.log` (ฝั่ง client ดู DevTools Console/Network)

env build แต่ละ deployment:

| ไฟล์ | ใช้กับ | คำสั่ง build |
|------|--------|--------------|
| `.env.production-emac` | emac.moph.go.th (root domain) | `npm run build:emac` |
| `.env.production` | poc.moph.go.th/emac (subpath, legacy) | `npm run build` |

## โครงสร้าง

```
lib/apiClient.ts        fetch wrapper + Bearer token + typed endpoints + oauthLoginUrl
lib/AuthContext.tsx     สถานะ session ทั้งแอป (login/logout/restore + OAuth callback)
components/
  LoginScreen.tsx       หน้า login (real: ปุ่ม Provider ID / mock: เลือกบัญชี)
  PatientQueue.tsx      คิวผู้ป่วย (filter/search/paging)
  PatientDetail.tsx     รายละเอียด + verify workspace
  CardView.tsx          บัตรแพ้ยา + QR
App.tsx                 gate: login ↔ portal
```
