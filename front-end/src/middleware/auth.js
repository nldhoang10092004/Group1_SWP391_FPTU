import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/auth`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response, // Nếu thành công, trả về bình thường
  (error) => {
    // Nếu lỗi
    const message =
      error.response?.data?.message || // Lấy message từ backend nếu có
      error.response?.data?.error ||   // Hoặc lấy error
      error.message ||                 // Hoặc message mặc định
      "Đã có lỗi xảy ra";

    // Hiển thị popup
    alert(`Lỗi: ${message}`);

    return Promise.reject(error);
  }
);

// === ĐĂNG NHẬP ===
export const loginApi = (emailOrUsername, password) => {
  return api.post("/login", {
    emailOrUsername,
    password,
  });
};

export const loginGoogle = (idToken) => {
  return api.post("/login/google", { idToken });
};


export const sendOtpApi = (email) => {
  return api.post("/send-otp", { email });
};

export const registerApi = ({ email, username, password, confirmPassword, otp }) => {
  return api.post("/register", { email, username, password, confirmPassword, otp });
};

export const forgotPasswordApi = (email) => {
  return api.post("/forgot-password", { email });
};

export const resetPasswordApi = (token, newPassword, confirmNewPassword) => {
  return api.post("/reset-password", {
    token,
    newPassword,
    confirmNewPassword,
  });
};

export const refreshTokenApi = () => {
  return api.post("/refresh");
};

export const logoutApi = () => {
  return api.post("/logout");
};

export default api;
