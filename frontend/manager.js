
const API_URL = "http://localhost:3000";


// ดึงข้อมูลผู้ใช้จาก localStorage (ที่ login.js บันทึกไว้)
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// ถ้าไม่มีใครล็อกอิน ให้เด้งกลับไปหน้า login ทันที (เพื่อความปลอดภัย)
if (!currentUser || !currentUser.userId) {
  alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
  window.location.href = "login.html";
}

const ACTIVE_USER_ID = currentUser.userId;



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

  // เอา base64 นั้นมาโชว์เป็นรูปพรีวิวในกล่องทันที
  addImagePreview.src = selectedImageBase64;
  addImagePreview.style.display = "block";
  imageDropLabel.style.display = "none";
});




addBtn.addEventListener("click", async () => {

  if (!addName.value.trim()) {
    alert("กรุณากรอกชื่อสินค้า");
    return;
  }

  const response = await fetch(`${API_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: addName.value,
      cost: addCost.value,
      description: addDescription.value,
      image: selectedImageBase64,
      userId: ACTIVE_USER_ID
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
  } else {
    alert("เพิ่มสินค้าไม่สำเร็จ");
  }
});




async function loadItems() {
  const response = await fetch(`${API_URL}/items/${ACTIVE_USER_ID}`);
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


function attachItemButtonEvents() {
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      const response = await fetch(`${API_URL}/items/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        loadItems();
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



editImageInput.addEventListener("change", async () => {
  const file = editImageInput.files[0];
  if (!file) return;

  const base64 = await fileToBase64(file);
  editImage.value = base64;

  editImagePreview.src = base64;
  editImagePreview.style.display = "block";
  editImageDropLabel.style.display = "none";
});




saveEditBtn.addEventListener("click", async () => {
  const id = editId.value;

  const response = await fetch(`${API_URL}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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
  } else {
    alert("แก้ไขไม่สำเร็จ (เช็คว่าเพื่อนเพิ่ม endpoint PUT /items/:id หรือยัง)");
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
