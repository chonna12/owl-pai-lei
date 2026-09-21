

const API_URL = 'http://localhost:3000';

function showError(message) {
    document.querySelector('#registerError').textContent = message;
}

function showSuccess(message) {
    document.querySelector('#registerSuccess').textContent = message;
}

document.querySelector('#registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    showError('');
    showSuccess('');

    const username = document.querySelector('#registerUsername').value.trim();
    const password = document.querySelector('#registerPassword').value;

    let response;
    try {
        response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
    } catch {
        showError('Unable to connect to the server. Is the backend running?');
        return;
    }

    const body = await response.json().catch(() => null);

    if (!response.ok || body?.success === false) {
        showError(body?.error ?? `HTTP ${response.status}`);
        return;
    }

    showSuccess('Account created! Redirecting to login...');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1200);
});
