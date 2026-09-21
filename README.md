# 🦉 Owl Pai Lei — ระบบขายของออนไลน์

เว็บแอปพลิเคชันสำหรับลงขายสินค้า สมัครสมาชิก เข้าสู่ระบบ และจัดการสินค้าของตัวเองได้

---

## 📁 โครงสร้างโปรเจกต์

```
owl-pai-lei/
├── backend/
│   ├── server.js          # Express API server
│   ├── database.json      # ฐานข้อมูล JSON (users & items)
│   └── package.json
├── frontend/
│   ├── login.html / login.js        # หน้าเข้าสู่ระบบ
│   ├── register.html / register.js  # หน้าสมัครสมาชิก
│   ├── home.html / home.js          # หน้าหลัก — แสดงสินค้าทั้งหมด
│   ├── edit.html / edit.js          # หน้าจัดการสินค้าของฉัน
│   └── style.css                    # CSS หลัก
└── README.md
```

---

## 🚀 วิธีรัน

### ความต้องการเบื้องต้น
- [Node.js](https://nodejs.org/) v16+

### ขั้นตอน

```bash
# 1. ติดตั้ง dependencies
cd backend
npm install

# 2. รัน server
npm start
```

เปิดเบราว์เซอร์แล้วไปที่ → **http://localhost:3000**

> Server จะ serve ไฟล์ frontend จาก `../frontend` โดยอัตโนมัติ

---

## 🔐 บัญชีทดสอบ (ค่าเริ่มต้น)

| Username | Password |
|----------|----------|
| `1`      | `1`      |
| `2`      | `2`      |

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

### Auth

| Method | Endpoint    | คำอธิบาย         | Body                          |
|--------|-------------|------------------|-------------------------------|
| `POST` | `/register` | สมัครสมาชิก      | `{ username, password }`      |
| `POST` | `/login`    | เข้าสู่ระบบ      | `{ username, password }`      |

**Login response:**
```json
{ "success": true, "userId": 1, "username": "1" }
```

### Items

| Method   | Endpoint          | คำอธิบาย                  | Body / Params              |
|----------|-------------------|---------------------------|----------------------------|
| `GET`    | `/items`          | ดึงสินค้าทั้งหมด          | —                          |
| `GET`    | `/items/:userId`  | ดึงสินค้าของ user คนนั้น  | Param: `userId`            |
| `POST`   | `/items`          | เพิ่มสินค้าใหม่           | `{ name, cost, description, userId, image }` |
| `PUT`    | `/items/:id`      | แก้ไขสินค้า               | `{ name, cost, description, image }` |
| `DELETE` | `/items/:id`      | ลบสินค้า                  | Param: `id`                |

**Item object:**
```json
{
  "id": 1,
  "name": "เสื้อยืดสีขาว",
  "cost": "120",
  "description": "L",
  "image": "<base64 string>",
  "userId": 1,
  "username": "1"
}
```

---

## 🗄️ ฐานข้อมูล

ใช้ **JSON file** (`backend/database.json`) แทน database จริง

```json
{
  "users": [
    { "id": 1, "username": "1", "password": "1" }
  ],
  "items": [
    { "id": 1, "name": "...", "cost": "120", "description": "...", "image": "...", "userId": 1, "username": "1" }
  ],
  "userIdCounter": 3,
  "itemIdCounter": 5
}
```

> ⚠️ รหัสผ่านถูกเก็บเป็น plain text — สำหรับการพัฒนาเท่านั้น ไม่เหมาะกับ production

---

## 🖥️ หน้าเว็บ

| หน้า              | URL            | คำอธิบาย                                         |
|-------------------|----------------|--------------------------------------------------|
| หน้า Login        | `/login.html`  | เข้าสู่ระบบด้วย username / password              |
| หน้า Register     | `/register.html` | สมัครสมาชิกใหม่                                |
| หน้าหลัก (Home)   | `/home.html`   | แสดงสินค้าทั้งหมดในระบบ (ต้อง login ก่อน)      |
| หน้าจัดการสินค้า  | `/edit.html`   | เพิ่ม / แก้ไข / ลบสินค้าของตัวเอง              |

---

## 🛠️ Tech Stack

| ส่วน     | เทคโนโลยี                              |
|----------|----------------------------------------|
| Backend  | Node.js, Express.js                    |
| Frontend | HTML, CSS (Vanilla), JavaScript        |
| Database | JSON File (`database.json`)            |
| Storage  | `localStorage` (เก็บ session ฝั่ง client) |

---

## 📮 Postman Collection

มีไฟล์ Postman Collection ให้ทดสอบ API ได้เลย

```
owl-pai-lei.postman_collection.json
```

**วิธี import:** Postman → Import → เลือกไฟล์ด้านบน

Collection มี **Collection Variables** ให้ตั้งค่าที่เดียว:
- `baseUrl` — `http://localhost:3000`
- `userId` — ถูก set อัตโนมัติหลัง Login
- `itemId` — ถูก set อัตโนมัติหลัง Create Item
