
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));


const users = [];
const items = [];
let userIdCounter = 1;
let itemIdCounter = 1;


app.post('/register', (req, res) => {
    const { username, password } = req.body;


    const userExists = users.find(u => u.username === username);
    if (userExists) {
        return res.status(400).json({ error: "Username used" });
    }

    const newUser = { id: userIdCounter++, username, password };
    users.push(newUser);
    res.json({ success: true, message: "success" });
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;


    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, userId: user.id, username: user.username });
    } else {
        res.status(401).json({ success: false, error: "username or password invalid" });
    }
});

app.post('/items', (req, res) => {
    const { name, cost, description, username, userId, image } = req.body;

    const user = users.find(u => u.id === Number(userId));

    const newItem = {
        id: itemIdCounter++,
        name,
        cost,
        description,
        image,
        userId: Number(userId),
        username: user ? user.username : "Unknown User"


    };

    items.push(newItem);
    res.json({ success: true, id: newItem.id });
});


app.get('/items/:userId', (req, res) => {
    const userId = Number(req.params.userId);


    const userItems = items.filter(item => item.userId === userId);
    res.json(userItems);
});


app.delete('/items/:id', (req, res) => {
    const id = Number(req.params.id);


    const itemIndex = items.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
        items.splice(itemIndex, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "not found" });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
