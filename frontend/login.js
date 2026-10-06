const API_URL = 'http://localhost:3000';

// ── Token helpers ─────────────────────────────────────────
function getToken() {
    return localStorage.getItem('token') || null;
}

function saveToken(token, username) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
}

function clearToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
}

function getUsername() {
    return localStorage.getItem('username') || '';
}

// ── ถ้า login อยู่แล้ว ไปหน้า home ──────────────────────
if (getToken()) {
    window.location.href = 'home.html';
}

// ── Utility ───────────────────────────────────────────────
function showAuthError(message) {
    document.querySelector('#authError').textContent = message;
}

async function apiRequest(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let response;
    try {
        response = await fetch(`${API_URL}${path}`, { headers, ...options });
    } catch {
        throw new Error('Unable to connect to the server. Is the backend running?');
    }

    const body = await response.json().catch(() => null);

    if (!response.ok || body?.success === false) {
        throw new Error(body?.error ?? `HTTP ${response.status}`);
    }
    return body;
}

// ── Login ─────────────────────────────────────────────────
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
        saveToken(result.token, result.username);
        window.location.href = 'home.html';
    } catch (error) {
        showAuthError(error.message);
    }
});

// ── Logout (ถ้ามีปุ่ม logoutBtn บนหน้า login) ────────────
const logoutBtn = document.querySelector('#logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        clearToken();
        window.location.reload();
    });
}
