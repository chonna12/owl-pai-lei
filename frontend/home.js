const API_URL = 'http://localhost:3000';

// ── Auth guard ──────────────────────────────────────────
function getToken() {
    return localStorage.getItem('token') || null;
}

function getUsername() {
    return localStorage.getItem('username') || '';
}

const token = getToken();
if (!token) {
    window.location.href = 'login.html';
}

// ── Nav ────────────────────────────────────────────────
document.querySelector('#navUsername').textContent = getUsername();

document.querySelector('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
});

// ── Helper: ส่ง request พร้อม Bearer token ────────────
function authFetch(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_URL}${path}`, { ...options, headers });
}

// ── Load all items ──────────────────────────────────────
async function loadItems() {
    const grid = document.querySelector('#itemGrid');
    const countEl = document.querySelector('#itemCount');

    try {
        const res = await fetch(`${API_URL}/items`);
        const items = await res.json();

        countEl.textContent = `${items.length} ชิ้น`;

        if (items.length === 0) {
            grid.innerHTML = '<p class="empty-state">ยังไม่มีสินค้าในร้านเลย</p>';
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="item-card">
                ${item.image
                    ? `<img class="item-card-img" src="${item.image}" alt="${escHtml(item.name)}">`
                    : `<div class="item-card-img-placeholder">🛍️</div>`
                }
                <div class="item-card-body">
                    <div class="item-card-name">${escHtml(item.name)}</div>
                    <div class="item-card-cost">฿${Number(item.cost).toLocaleString()}</div>
                    ${item.description ? `<div class="item-card-desc">${escHtml(item.description)}</div>` : ''}
                    <div class="item-card-seller">โดย <span>${escHtml(item.username)}</span></div>
                </div>
            </div>
        `).join('');

    } catch {
        grid.innerHTML = '<p class="empty-state">ไม่สามารถโหลดสินค้าได้ — ตรวจสอบว่า server รันอยู่</p>';
    }
}

function escHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

loadItems();
