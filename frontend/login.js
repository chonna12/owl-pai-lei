const API_URL = 'http://localhost:3000';

let currentUser = loadUser();

// ถ้า login อยู่แล้ว ไปหน้า home เลย
if (currentUser) {
    window.location.href = 'home.html';
}

function loadUser() {
    try {
        const raw = localStorage.getItem('currentUser');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
}

function showAuthError(message) {
    document.querySelector('#authError').textContent = message;
}

function renderView() {
    const authCard = document.querySelector('#authCard');
    const welcomeCard = document.querySelector('#welcomeCard');

    if (currentUser) {
        authCard.hidden = true;
        welcomeCard.hidden = false;
        document.querySelector('#welcomeText').textContent = `Hi, ${currentUser.username}`;
        document.querySelector('#avatarInitial').textContent =
            currentUser.username.charAt(0).toUpperCase();
    } else {
        authCard.hidden = false;
        welcomeCard.hidden = true;
    }
}

async function apiRequest(path, options = {}) {
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
    } catch {
        throw new Error('Unable to connect to the server. Is the backend running?');
    }

    const body = await response.json().catch(() => null);

    if (!response.ok || body?.success === false) {
        throw new Error(body?.error ?? `HTTP ${response.status}`);
    }
    return body;
}

document.querySelector('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    showAuthError('');

    const username = document.querySelector('#loginUsername').value.trim();
    const password = document.querySelector('#loginPassword').value;

    try {
        const result = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        saveUser({ userId: result.userId, username: result.username });
        window.location.href = 'home.html';
    } catch (error) {
        showAuthError(error.message);
    }
});

document.querySelector('#logoutBtn').addEventListener('click', () => {

    clearUser();
    renderView();
});

renderView();
