const express = require('express');
const cors = require('cors');
const fs = require('fs'); // เพิ่มโมดูล fs (File System) เพื่อจัดการไฟล์

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.static('public'));

// ตั้งชื่อไฟล์ Database ของเรา
const DATA_FILE = 'database.json';

// ==========================================
// ฟังก์ชันตัวช่วยสำหรับจัดการ Database
// ==========================================

// 1. ฟังก์ชันอ่านข้อมูลจากไฟล์
function readData() {
    // ถ้ายังไม่มีไฟล์ database.json ให้สร้างขึ้นมาใหม่พร้อมโครงสร้างเริ่มต้น
    if (!fs.existsSync(DATA_FILE)) {
        const defaultData = { users: [], items: [], userIdCounter: 1, itemIdCounter: 1 };
        fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    // ถ้ามีไฟล์แล้ว ให้อ่านข้อมูลออกมา
    const rawData = fs.readFileSync(DATA_FILE);
    return JSON.parse(rawData);
}

// 2. ฟังก์ชันเขียนข้อมูลทับลงไปในไฟล์
function writeData(data) {
    // JSON.stringify(data, null, 2) ช่วยจัดหน้าโค้ด JSON ให้อ่านง่าย
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ==========================================
// API Endpoints (ระบบหลังบ้าน)
// ==========================================

// 1. สมัครสมาชิก (Register)
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const data = readData(); // ดึงข้อมูลล่าสุดมา

    const userExists = data.users.find(u => u.username === username);
    if (userExists) {
        return res.status(400).json({ error: "Username used" });
    }

    const newUser = { id: data.userIdCounter++, username, password };
    data.users.push(newUser);

    writeData(data); // บันทึกข้อมูลกลับลงไฟล์
    res.json({ success: true, message: "success" });
});

// 2. เข้าสู่ระบบ (Login)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const data = readData();

    const user = data.users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, userId: user.id, username: user.username });
    } else {
        res.status(401).json({ success: false, error: "username or password invalid" });
    }
});

// 3. เพิ่มสินค้า (Add Item)
app.post('/items', (req, res) => {
    const { name, cost, description, userId, image } = req.body;
    const data = readData();

    const user = data.users.find(u => u.id === Number(userId));

    const newItem = {
        id: data.itemIdCounter++,
        name,
        cost,
        description,
        image,
        userId: Number(userId),
        username: user ? user.username : "Unknown User"
    };

    data.items.push(newItem);

    writeData(data); // บันทึกข้อมูลกลับลงไฟล์
    res.json({ success: true, id: newItem.id });
});

// 4. ดึงข้อมูลสินค้าของแต่ละคน (Get Items)
app.get('/items/:userId', (req, res) => {
    const userId = Number(req.params.userId);
    const data = readData();

    const userItems = data.items.filter(item => item.userId === userId);
    res.json(userItems);
});

// 5. ลบสินค้า (Delete Item)
app.delete('/items/:id', (req, res) => {
    const id = Number(req.params.id);
    const data = readData();

    const itemIndex = data.items.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
        data.items.splice(itemIndex, 1);
        writeData(data); // บันทึกข้อมูลที่ถูกลบกลับลงไฟล์
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "not found" });
    }
});

// 6. แก้ไขสินค้า (Edit Item)
app.put('/items/:id', (req, res) => {
    const id = Number(req.params.id);
    const { name, cost, description, image } = req.body;
    const data = readData();

    const itemIndex = data.items.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
        data.items[itemIndex].name = name;
        data.items[itemIndex].cost = cost;
        data.items[itemIndex].description = description;

        if (image !== undefined) {
            data.items[itemIndex].image = image;
        }

        writeData(data); // บันทึกข้อมูลที่ถูกแก้ไขกลับลงไฟล์
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: "ไม่พบข้อมูลที่ต้องการแก้ไข" });
    }
});

// เปิดเซิร์ฟเวอร์
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});