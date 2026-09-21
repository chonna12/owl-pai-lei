const API_URL = "http://localhost:3000";

const loginForm = document.getElementById('loginForm');
const authError = document.getElementById('authError');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // ป้องกันไม่ให้เว็บรีเฟรช

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        authError.textContent = ""; // ล้างข้อความ Error เดิม

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                // บันทึกข้อมูลผู้ใช้ลง localStorage (ให้ manager.js ดึงไปใช้ต่อ)
                localStorage.setItem('currentUser', JSON.stringify({
                    userId: data.userId,
                    username: data.username
                }));

                // ล็อกอินสำเร็จ เด้งไปหน้า Manager ทันที
                window.location.href = 'manager.html';
            } else {
                authError.textContent = data.error || "Username หรือ Password ไม่ถูกต้อง";
            }
        } catch (error) {
            authError.textContent = "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ (รัน node server.js หรือยัง?)";
        }
    });
}

// ระบบเปิด/ปิดการมองเห็นรหัสผ่าน
const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#loginPassword');

if (togglePassword && password) {
    togglePassword.addEventListener('click', function () {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}