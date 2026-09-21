// login.js
// Login + logout only. Register lives on its own page now (register.html /
// register.js) so this file stays focused on one job.
// Plain fetch(), no framework - talks to the existing backend
// (backend/sever.js) at its /login route. Doesn't touch any other file.
//
// There is no JWT/session on the backend: after login we just remember
// { userId, username } in localStorage. That matches how simple the
// backend already is - it's not secure against someone editing their own
// localStorage, which is worth mentioning as a known limitation, not
// something to silently claim is solved.

const API_URL = 'http://localhost:3000';

let currentUser = loadUser(); // { userId, username } | null

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
        renderView();
    } catch (error) {
        showAuthError(error.message);
    }
});

document.querySelector('#logoutBtn').addEventListener('click', () => {
    // The backend has no /logout route (sever.js doesn't define one) -
    // logout here is purely local: clear the saved user and show the
    // login form again.
    clearUser();
    renderView();
});

const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#loginPassword');

if (togglePassword && password) {
    togglePassword.addEventListener('click', function () {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);

        // สลับไอคอนดวงตา
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}

renderView();
