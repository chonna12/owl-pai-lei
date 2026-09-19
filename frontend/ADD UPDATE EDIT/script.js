// ===========================================
// ตั้งค่าพื้นฐาน
// ===========================================

// ที่อยู่ของ backend server (ตามที่เพื่อนเขียนไว้ใน sever.js -> app.listen(3000))
const API_URL = "http://localhost:3000";

// เนื่องจากหน้านี้ไม่มีระบบ login แล้ว แต่ backend ยังบังคับให้ทุกสินค้าต้องมี userId
// เลยกำหนด userId ไว้ตายตัวเป็น 1 ไปก่อน
// (ถ้าจะให้ใช้ได้จริงกับหลาย user ทีหลัง ต้องกลับไปทำ login แล้วเปลี่ยนค่านี้ตามคนที่ login)
const FIXED_USER_ID = 1;


// ===========================================
// ดึง element จาก HTML มาเก็บไว้ในตัวแปร
// ===========================================

const addName = document.getElementById("addName");
const addCost = document.getElementById("addCost");
const addDescription = document.getElementById("addDescription");
const addBtn = document.getElementById("addBtn");
const addImage = document.getElementById("addImage");
const addImagePreview = document.getElementById("addImagePreview");
const imageDropLabel = document.getElementById("imageDropLabel");

// ตัวแปรเก็บรูปที่เลือกไว้ (เป็น base64 string) รอตอนกด "เพิ่มลงร้าน" ค่อยส่งไปพร้อมกัน
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


// ===========================================
// ฟังก์ชันช่วย: แปลงไฟล์รูปที่ user เลือก ให้กลายเป็น base64 string
// base64 คือการเข้ารหัสไฟล์ให้เป็นข้อความยาวๆ เพื่อเก็บ/ส่งเป็น string ธรรมดาได้
// เราใช้วิธีนี้เพราะ backend ตอนนี้ยังไม่มีระบบอัปโหลดไฟล์แบบเต็มรูปแบบ (multer ฯลฯ)
// การส่งเป็น base64 string ไปเก็บในตัวแปรง่ายๆ ก็เพียงพอสำหรับตอนนี้
// (ข้อควรระวัง: ถ้ารูปไฟล์ใหญ่มาก string จะยาวมาก ไม่เหมาะกับ production จริง)
// ===========================================
function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // reader.result คือ base64 string ที่ได้
    reader.readAsDataURL(file);
  });
}

// พอ user เลือกไฟล์รูปในฟอร์ม "เพิ่มสินค้า"
addImage.addEventListener("change", async () => {
  const file = addImage.files[0];
  if (!file) return;

  // แปลงไฟล์เป็น base64 แล้วเก็บไว้รอส่งตอนกด "เพิ่มลงร้าน"
  selectedImageBase64 = await fileToBase64(file);

  // เอา base64 นั้นมาโชว์เป็นรูปพรีวิวในกล่องทันที
  addImagePreview.src = selectedImageBase64;
  addImagePreview.style.display = "block";
  imageDropLabel.style.display = "none";
});


// ===========================================
// ส่วนที่ 1: เพิ่มสินค้า (ADD)
// ===========================================

addBtn.addEventListener("click", async () => {
  // ถ้าลืมกรอกชื่อ ไม่ต้องยิง request ไปเลย
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
      image: selectedImageBase64, // ส่ง base64 ของรูปไปด้วย (backend ต้องแก้รับ field นี้ก่อน ดูหมายเหตุท้ายไฟล์)
      userId: FIXED_USER_ID
    })
  });

  const data = await response.json();

  if (data.success) {
    // ล้างช่อง input ให้ว่าง หลังเพิ่มสำเร็จ
    addName.value = "";
    addCost.value = "";
    addDescription.value = "";

    // ล้างรูปพรีวิวกลับไปเป็นค่าเริ่มต้น เตรียมรับสินค้าชิ้นถัดไป
    addImage.value = "";
    selectedImageBase64 = "";
    addImagePreview.style.display = "none";
    imageDropLabel.style.display = "block";

    // โหลดลิสต์ใหม่ จะได้เห็นสินค้าที่เพิ่งเพิ่มไป
    loadItems();
  } else {
    alert("เพิ่มสินค้าไม่สำเร็จ");
  }
});


// ===========================================
// ส่วนที่ 2: โหลด + แสดงรายการสินค้า (LIST)
// ===========================================

async function loadItems() {
  const response = await fetch(`${API_URL}/items/${FIXED_USER_ID}`);
  const items = await response.json(); // items คือ array ของสินค้าที่ backend ส่งกลับมา

  // อัปเดตตัวเลขจำนวนสินค้าด้านบนลิสต์
  itemCount.textContent = items.length + " ชิ้น";

  // ถ้าไม่มีสินค้าเลย ให้โชว์ข้อความ empty state แทน แล้วเลิกทำงานฟังก์ชันนี้
  if (items.length === 0) {
    itemGrid.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  // ล้างของเก่าในกล่องลิสต์ออกก่อน จะได้ไม่ซ้อนกันตอนโหลดใหม่
  itemGrid.innerHTML = "";

  // วนลูปสินค้าทีละชิ้น เพื่อสร้างการ์ดแสดงแต่ละชิ้น
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";

    // ถ้าสินค้ามีรูป (item.image มีค่า) ให้โชว์รูปจริง
    // ถ้าไม่มี ให้ใช้ตัวอักษรแรกของชื่อสินค้าแทนไปก่อน (fallback)
    const firstLetter = item.name ? item.name.charAt(0).toUpperCase() : "?";
    const monogramContent = item.image
      ? `<img src="${item.image}">`
      : firstLetter;

    // data-id / data-cost / data-name / data-description / data-image คือการแปะข้อมูลไว้ที่ตัวการ์ด
    // เพื่อให้ตอนกดปุ่ม "แก้ไข" เรารู้ว่าต้องเอาข้อมูลอะไรไป prefill ในฟอร์ม
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

  // หลังจากสร้างปุ่มลบ/แก้ไขเสร็จ ต้องไปผูก event ให้ปุ่มพวกนี้ทำงานได้
  attachItemButtonEvents();
}


// ===========================================
// ส่วนที่ 3: ผูกปุ่ม "ลบ" และ "แก้ไข" ในลิสต์
// ต้องเรียกใหม่ทุกครั้งหลัง loadItems() เพราะปุ่มพวกนี้ถูกสร้างใหม่ทุกรอบ
// ===========================================

function attachItemButtonEvents() {
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      const response = await fetch(`${API_URL}/items/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        loadItems(); // ลบสำเร็จ -> โหลดลิสต์ใหม่
      }
    });
  });

  document.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // ดึงข้อมูลเดิมของสินค้าที่แปะไว้ใน data-* ตอนสร้างการ์ด
      editId.value = btn.dataset.id;
      editName.value = btn.dataset.name;
      editCost.value = btn.dataset.cost;
      editDescription.value = btn.dataset.description;
      editImage.value = btn.dataset.image; // เก็บรูปเดิมไว้ก่อน เผื่อ user ไม่เปลี่ยนรูปใหม่

      // แสดงรูปเดิมในกล่องพรีวิวของ modal (ถ้ามี)
      if (btn.dataset.image) {
        editImagePreview.src = btn.dataset.image;
        editImagePreview.style.display = "block";
        editImageDropLabel.style.display = "none";
      } else {
        editImagePreview.style.display = "none";
        editImageDropLabel.style.display = "block";
      }

      // เปิด modal แก้ไข (เปลี่ยนจาก display:none เป็น flex)
      editModalOverlay.style.display = "flex";
    });
  });
}


// พอ user เลือกไฟล์รูปใหม่ใน modal แก้ไข ก็แปลงเป็น base64 แล้วอัปเดตพรีวิว+ค่าที่จะส่ง เหมือนฟอร์ม add
editImageInput.addEventListener("change", async () => {
  const file = editImageInput.files[0];
  if (!file) return;

  const base64 = await fileToBase64(file);
  editImage.value = base64; // เก็บรูปใหม่ไว้ในช่องซ่อน รอตอนกด "บันทึก"

  editImagePreview.src = base64;
  editImagePreview.style.display = "block";
  editImageDropLabel.style.display = "none";
});


// ===========================================
// ส่วนที่ 4: บันทึกการแก้ไข (SAVE EDIT)
// ⚠️ ส่วนนี้จะยังใช้งานไม่ได้ จนกว่าเพื่อนจะเพิ่ม endpoint PUT /items/:id ที่ backend ก่อน
// ===========================================

saveEditBtn.addEventListener("click", async () => {
  const id = editId.value;

  const response = await fetch(`${API_URL}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: editName.value,
      cost: editCost.value,
      description: editDescription.value,
      image: editImage.value // จะเป็นรูปใหม่ถ้าเลือกไฟล์ใหม่ หรือรูปเดิมถ้าไม่ได้เปลี่ยน
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

// ปุ่มยกเลิก -> แค่ปิด modal ไม่ต้องยิง request อะไร
cancelEditBtn.addEventListener("click", () => {
  editModalOverlay.style.display = "none";
});

// กดพื้นหลังสีเทานอกกล่อง modal ก็ให้ปิดได้เหมือนกัน (ลูกเล่นเล็กๆ ให้ใช้งานง่ายขึ้น)
editModalOverlay.addEventListener("click", (event) => {
  if (event.target === editModalOverlay) {
    editModalOverlay.style.display = "none";
  }
});


// ===========================================
// โหลดลิสต์สินค้าทันทีตอนเปิดหน้าเว็บ
// ===========================================
loadItems();
