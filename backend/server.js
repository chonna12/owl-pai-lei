
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static('../frontend'));

const JWT_SECRET = 'owl-pai-lei-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

const DB_PATH = './database.json';

function loadDB() {
    try {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        return {
            users: parsed.users || [],
            items: parsed.items || [],
            userIdCounter: parsed.userIdCounter || 1,
            itemIdCounter: parsed.itemIdCounter || 1,
        };
    } catch {
        return { users: [], items: [], userIdCounter: 1, itemIdCounter: 1 };
    }
}

function saveDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

let db = loadDB();

// ── Middleware: ตรวจ JWT ──────────────────────────────────
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, username }
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// ── Register ──────────────────────────────────────────────
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const userExists = db.users.find(u => u.username === username);
    if (userExists) {
        return res.status(400).json({ error: 'Username used' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: db.userIdCounter++, username, password: hashedPassword };
    db.users.push(newUser);
    saveDB(db);

    res.json({ success: true, message: 'success' });
});

// ── Login ─────────────────────────────────────────────────
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = db.users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ success: false, error: 'username or password invalid' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ success: false, error: 'username or password invalid' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ success: true, token, username: user.username });
});

// ── GET /me — ดูข้อมูล user ปัจจุบัน (ต้อง auth) ─────────
app.get('/me', authenticate, (req, res) => {
    res.json({ id: req.user.id, username: req.user.username });
});

// ── POST /items — เพิ่มสินค้า (ต้อง auth) ────────────────
app.post('/items', authenticate, (req, res) => {
    const { name, cost, description, image } = req.body;
    const { id: userId, username } = req.user;

    const newItem = {
        id: db.itemIdCounter++,
        name,
        cost,
        description,
        image,
        userId,
        username,
    };

    db.items.push(newItem);
    saveDB(db);

    res.json({ success: true, id: newItem.id });
});

// ── GET /items — ดูสินค้าทั้งหมด (สาธารณะ) ──────────────
app.get('/items', (req, res) => {
    res.json(db.items);
});

// ── GET /items/mine — ดูสินค้าของตัวเอง (ต้อง auth) ─────
app.get('/items/mine', authenticate, (req, res) => {
    const userItems = db.items.filter(item => item.userId === req.user.id);
    res.json(userItems);
});

// ── GET /items/:userId — ดูสินค้าตาม userId (สาธารณะ) ───
app.get('/items/:userId', (req, res) => {
    const userId = Number(req.params.userId);
    const userItems = db.items.filter(item => item.userId === userId);
    res.json(userItems);
});

// ── PUT /items/:id — แก้ไขสินค้า (ต้อง auth + เจ้าของ) ──
app.put('/items/:id', authenticate, (req, res) => {
    const id = Number(req.params.id);
    const { name, cost, description, image } = req.body;

    const item = db.items.find(item => item.id === id);

    if (!item) {
        return res.status(404).json({ error: 'not found' });
    }

    if (item.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: not your item' });
    }

    item.name = name;
    item.cost = cost;
    item.description = description;
    if (image) item.image = image;
    saveDB(db);
    res.json({ success: true });
});

// ── DELETE /items/:id — ลบสินค้า (ต้อง auth + เจ้าของ) ──
app.delete('/items/:id', authenticate, (req, res) => {
    const id = Number(req.params.id);

    const itemIndex = db.items.findIndex(item => item.id === id);

    if (itemIndex === -1) {
        return res.status(404).json({ error: 'not found' });
    }

    if (db.items[itemIndex].userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: not your item' });
    }

    db.items.splice(itemIndex, 1);
    saveDB(db);
    res.json({ success: true });
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
