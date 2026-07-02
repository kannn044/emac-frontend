# eMAC Hospital Portal (Frontend)

หน้าเว็บฝั่งโรงพยาบาลของระบบบัตรแพ้ยาอิเล็กทรอนิกส์ (eMAC) — เภสัชกร/แพทย์ ตรวจสอบและออกบัตรแพ้ยา
เชื่อมต่อกับ **Drug Allergy Card API** (`../api-drugallergy`)

React 19 + Vite + Tailwind

## สถานะการพัฒนา

| Phase | ขอบเขต | สถานะ |
|-------|--------|-------|
| **P1** | Mock login (MOPH Provider ID จำลอง) + session + app shell | ✅ |
| **P2** | คิวผู้ป่วย + รายละเอียด ดึงจาก API แบบ tenant-scoped (search/filter/paging) | ✅ |
| **P3** | Verify workspace: เลือกยา + กรอกคลินิก + ลงนามดิจิทัล / reject / note | ✅ |
| **P4** | แสดงบัตรที่ออกแล้ว + QR ตรวจความแท้ + เปิด/พิมพ์บัตร (embed) | ✅ |

## รันในเครื่อง (dev)

ต้องรัน **2 ตัว**: backend API + frontend นี้

**1) Backend API** (โฟลเดอร์ `../api-drugallergy`) — เฟส 1 ไม่ต้องมี Postgres:

```bash
cd ../api-drugallergy
npm install
# KEY_STORE + DATA_STORE = memory → รันได้ทันทีโดยไม่ต้องมี Postgres (ใช้ seed ผู้ป่วยจำลอง)
KEY_STORE=memory DATA_STORE=memory SESSION_JWT_SECRET=dev-secret npm run dev   # → http://localhost:3000
```

**2) Frontend** (โฟลเดอร์นี้):

```bash
npm install
npm run dev        # → http://localhost:5173
```

Vite dev server จะ proxy `/auth` และ `/api` ไป backend อัตโนมัติ (ตั้งเป้าหมายที่ `VITE_API_PROXY_TARGET` ใน `.env.local`)

## การเข้าสู่ระบบ (mock)

ยังไม่ได้ client id จริงจาก MOPH Provider ID → หน้า login ดึงรายชื่อบัญชีจำลองจาก
`GET /auth/providers` ให้เลือกเข้าสู่ระบบ (เภสัชกร/แพทย์ ต่างโรงพยาบาล + เคสไม่ใช่บุคลากรการแพทย์)
เมื่อสลับเป็น OIDC จริง หน้านี้จะเปลี่ยนเป็น redirect ไป MOPH โดย logic ฝั่งอื่นไม่ต้องแก้

## โครงสร้าง

```
api/client.ts           fetch wrapper + Bearer token + typed endpoints
auth/AuthContext.tsx    สถานะ session ทั้งแอป (login/logout/restore)
components/
  LoginScreen.tsx       หน้า mock login
  PharmacistPortal.tsx  (เดิม — จะต่อ API ใน P2/P3)
  PatientCardMobile.tsx (เดิม)
App.tsx                 gate: login ↔ dashboard
```
