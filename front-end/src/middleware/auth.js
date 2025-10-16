import axios from "axios";

// 🧩 URL Backend thật (đổi lại nếu bạn chạy local)
const API_URL = "https://localhost:7010/api/auth";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// === ĐĂNG NHẬP ===
// POST /api/auth/login
export const loginApi = (emailOrUsername, password) => {
  return api.post("/login", {
    emailOrUsername,
    password,
  });
};


export const sendOtpApi = (email) => {
  return api.post("/send-otp", { email });
};

// POST /api/auth/register
export const registerApi = ({ email, username, password, confirmPassword, otp }) => {
  return api.post("/register", { email, username, password, confirmPassword, otp });
};



// === QUÊN MẬT KHẨU ===
// POST /api/auth/forgot-password
export const forgotPasswordApi = (email) => {
  return api.post("/forgot-password", { email });
};

// === ĐẶT LẠI MẬT KHẨU ===
// POST /api/auth/reset-password
export const resetPasswordApi = (token, newPassword, confirmNewPassword) => {
  return api.post("/reset-password", {
    token,
    newPassword,
    confirmNewPassword,
  });
};

// === LÀM MỚI TOKEN ===
// POST /api/auth/refresh
export const refreshTokenApi = () => {
  return api.post("/refresh");
};

// === ĐĂNG XUẤT ===
// POST /api/auth/logout
export const logoutApi = () => {
  return api.post("/logout");
};
