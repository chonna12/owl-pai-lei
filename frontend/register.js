const API_URL = "http://localhost:3000";

const registerForm = document.getElementById('registerForm');
const registerError = document.getElementById('registerError');
const registerSuccess = document.getElementById('registerSuccess');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;

        registerError.textContent = "";
        registerSuccess.textContent = "";

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                registerSuccess.textContent = "สมัครสมาชิกสำเร็จ! กำลังพาไปหน้า Login...";
                // หน่วงเวลา 1.5 วินาที แล้วพาไปหน้า login
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                registerError.textContent = data.error === "Username used" ? "Username นี้มีคนใช้แล้ว" : "สมัครสมาชิกไม่สำเร็จ";
            }
        } catch (error) {
            registerError.textContent = "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ (รัน node server.js หรือยัง?)";
        }
    });
}

// ระบบเปิด/ปิดการมองเห็นรหัสผ่าน
const toggleRegPassword = document.querySelector('#toggleRegPassword');
const regPassword = document.querySelector('#registerPassword');

if (toggleRegPassword && regPassword) {
    toggleRegPassword.addEventListener('click', function () {
        const type = regPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        regPassword.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}