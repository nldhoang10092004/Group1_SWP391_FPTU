// src/middleware/userAPI.js
import axios from "axios";

const API_URL = "https://localhost:7010/api"; 

// 🟢 Lấy thông tin chi tiết profile
export const getUser = async (token) => {
  const res = await axios.get(`${API_URL}/user/profile/detail`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// 🟢 Cập nhật thông tin profile (PUT JSON)
export const updateUser = async (userData, token) => {
  const res = await axios.put(`${API_URL}/user/profile/detail`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// 🟢 Cập nhật ảnh đại diện (PUT multipart/form-data)
export const updateAvatar = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.put(`${API_URL}/user/profile/avatar`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// 🟢 Đổi mật khẩu
export const changePassword = async (currentPassword, newPassword, confirmNewPassword, token) => {
  const res = await axios.put(
    `${API_URL}/user/profile/password`,
    { currentPassword, newPassword, confirmNewPassword },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
