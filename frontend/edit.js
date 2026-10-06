
const API_URL = "http://localhost:3000";

// ── Auth ───────────────────────────────────────────
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

// ── Nav ────────────────────────────────────────────
document.querySelector('#navUsername').textContent = getUsername();
document.querySelector('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
});

// ── Helper: fetch พร้อม Bearer token ──────────────
function authFetch(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
    };
    return fetch(`${API_URL}${path}`, { ...options, headers });
}

// ── DOM refs ───────────────────────────────────────
const addName = document.getElementById("addName");
const addCost = document.getElementById("addCost");
const addDescription = document.getElementById("addDescription");
const addBtn = document.getElementById("addBtn");
const addImage = document.getElementById("addImage");
const addImagePreview = document.getElementById("addImagePreview");
const imageDropLabel = document.getElementById("imageDropLabel");

let selectedImageBase64 = "";

const itemGrid = document.getElementById("itemGrid");
const itemCount = document.getElementById("itemCount");
const emptyState = document.getElementById("emptyState");

const editModalOverlay = document.getElementById("editModalOverlay");
const editId = document.getElementById("editId");
const editName = document.getElementById("editName");
const editCost = document.getElementById("editCost");
const editDescription = document.getElementById("editDescription");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editImage = document.getElementById("editImage");
const editImageInput = document.getElementById("editImageInput");
const editImagePreview = document.getElementById("editImagePreview");
const editImageDropLabel = document.getElementById("editImageDropLabel");

// ── File → Base64 ──────────────────────────────────
function fileToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

addImage.addEventListener("change", async () => {
    const file = addImage.files[0];
    if (!file) return;

    selectedImageBase64 = await fileToBase64(file);
    addImagePreview.src = selectedImageBase64;
    addImagePreview.style.display = "block";
    imageDropLabel.style.display = "none";
});

// ── Add item ────────────────────────────────────────
addBtn.addEventListener("click", async () => {
    if (!addName.value.trim()) {
        alert("กรุณากรอกชื่อสินค้า");
        return;
    }

    const response = await authFetch('/items', {
        method: "POST",
        body: JSON.stringify({
            name: addName.value,
            cost: addCost.value,
            description: addDescription.value,
            image: selectedImageBase64,
        })
    });

    const data = await response.json();

    if (data.success) {
        addName.value = "";
        addCost.value = "";
        addDescription.value = "";
        addImage.value = "";
        selectedImageBase64 = "";
        addImagePreview.style.display = "none";
        imageDropLabel.style.display = "block";

        loadItems();
    } else if (response.status === 401) {
        alert("Session หมดอายุ กรุณา Login ใหม่");
        window.location.href = 'login.html';
    } else {
        alert("เพิ่มสินค้าไม่สำเร็จ");
    }
});

// ── Load items ─────────────────────────────────────
async function loadItems() {
    // ดูเฉพาะสินค้าของตัวเอง ผ่าน /items/mine (ต้อง auth)
    const response = await authFetch('/items/mine');

    if (response.status === 401) {
        window.location.href = 'login.html';
        return;
    }

    const items = await response.json();

    itemCount.textContent = items.length + " ชิ้น";

    if (items.length === 0) {
        itemGrid.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";
    itemGrid.innerHTML = "";

    items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "item-card";

        const firstLetter = item.name ? item.name.charAt(0).toUpperCase() : "?";
        const monogramContent = item.image
            ? `<img src="${item.image}">`
            : firstLetter;

        card.innerHTML = `
      <div class="item-monogram">${monogramContent}</div>
      <div class="item-body">
        <span class="item-price">${item.cost} บาท</span>
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.description || ""}</div>
      </div>
      <div class="item-actions">
        <button class="editBtn"
          data-id="${item.id}"
          data-name="${item.name}"
          data-cost="${item.cost}"
          data-description="${item.description || ""}"
          data-image="${item.image || ""}">แก้ไข</button>
        <button class="deleteBtn" data-id="${item.id}">ลบ</button>
      </div>
    `;

        itemGrid.appendChild(card);
    });

    attachItemButtonEvents();
}

// ── Item button events ──────────────────────────────
function attachItemButtonEvents() {
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;

            const response = await authFetch(`/items/${id}`, { method: "DELETE" });
            const data = await response.json();

            if (data.success) {
                loadItems();
            } else if (response.status === 401) {
                alert("Session หมดอายุ กรุณา Login ใหม่");
                window.location.href = 'login.html';
            } else if (response.status === 403) {
                alert("คุณไม่มีสิทธิ์ลบสินค้านี้");
            }
        });
    });

    document.querySelectorAll(".editBtn").forEach((btn) => {
        btn.addEventListener("click", () => {
            editId.value = btn.dataset.id;
            editName.value = btn.dataset.name;
            editCost.value = btn.dataset.cost;
            editDescription.value = btn.dataset.description;
            editImage.value = btn.dataset.image;

            if (btn.dataset.image) {
                editImagePreview.src = btn.dataset.image;
                editImagePreview.style.display = "block";
                editImageDropLabel.style.display = "none";
            } else {
                editImagePreview.style.display = "none";
                editImageDropLabel.style.display = "block";
            }

            editModalOverlay.style.display = "flex";
        });
    });
}

// ── Edit image ─────────────────────────────────────
editImageInput.addEventListener("change", async () => {
    const file = editImageInput.files[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    editImage.value = base64;
    editImagePreview.src = base64;
    editImagePreview.style.display = "block";
    editImageDropLabel.style.display = "none";
});

// ── Save edit ───────────────────────────────────────
saveEditBtn.addEventListener("click", async () => {
    const id = editId.value;

    const response = await authFetch(`/items/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            name: editName.value,
            cost: editCost.value,
            description: editDescription.value,
            image: editImage.value
        })
    });

    const data = await response.json();

    if (data.success) {
        editModalOverlay.style.display = "none";
        loadItems();
    } else if (response.status === 401) {
        alert("Session หมดอายุ กรุณา Login ใหม่");
        window.location.href = 'login.html';
    } else if (response.status === 403) {
        alert("คุณไม่มีสิทธิ์แก้ไขสินค้านี้");
    } else {
        alert("แก้ไขไม่สำเร็จ");
    }
});

cancelEditBtn.addEventListener("click", () => {
    editModalOverlay.style.display = "none";
});

editModalOverlay.addEventListener("click", (event) => {
    if (event.target === editModalOverlay) {
        editModalOverlay.style.display = "none";
    }
});

loadItems();