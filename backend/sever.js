
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static('public'));

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


app.post('/register', (req, res) => {
    const { username, password } = req.body;

    const userExists = db.users.find(u => u.username === username);
    if (userExists) {
        return res.status(400).json({ error: "Username used" });
    }

    const newUser = { id: db.userIdCounter++, username, password };
    db.users.push(newUser);
    saveDB(db);

    res.json({ success: true, message: "success" });
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = db.users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, userId: user.id, username: user.username });
    } else {
        res.status(401).json({ success: false, error: "username or password invalid" });
    }
});


app.post('/items', (req, res) => {
    const { name, cost, description, userId, image } = req.body;

    const user = db.users.find(u => u.id === Number(userId));

    const newItem = {
        id: db.itemIdCounter++,
        name,
        cost,
        description,
        image,
        userId: Number(userId),
        username: user ? user.username : "Unknown User"
    };

    db.items.push(newItem);
    saveDB(db);

    res.json({ success: true, id: newItem.id });
});


app.get('/items', (req, res) => {
    res.json(db.items);
});


app.get('/items/:userId', (req, res) => {
    const userId = Number(req.params.userId);
    const userItems = db.items.filter(item => item.userId === userId);
    res.json(userItems);
});


app.put('/items/:id', (req, res) => {
    const id = Number(req.params.id);
    const { name, cost, description, image } = req.body;

    const item = db.items.find(item => item.id === id);

    if (item) {
        item.name = name;
        item.cost = cost;
        item.description = description;
        if (image) item.image = image;
        saveDB(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "not found" });
    }
});


app.delete('/items/:id', (req, res) => {
    const id = Number(req.params.id);

    const itemIndex = db.items.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
        db.items.splice(itemIndex, 1);
        saveDB(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "not found" });
    }
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
