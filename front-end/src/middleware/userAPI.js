// src/middleware/userAPI.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://localhost:7010/api";

// 🟢 Xử lý lỗi chung
const handleApiError = (error) => {
  console.error("API Error:", error.response?.data || error.message);
  
  if (error.response?.status === 401) {
    // Token hết hạn
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Token hết hạn");
  }
  throw error;
};

// 🟢 Lấy thông tin chi tiết profile
export const getUser = async (token) => {
  try {
    console.log("🔍 GET /user/profile/detail");
    const res = await axios.get(`${API_URL}/user/profile/detail`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Response:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🟢 Cập nhật thông tin profile (PUT JSON)
export const updateUser = async (userData, token) => {
  try {
    console.log("📤 PUT /user/profile/detail");
    console.log("📤 Data:", userData);
    
    const res = await axios.put(`${API_URL}/user/profile/detail`, userData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log("✅ Update success:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🟢 Cập nhật ảnh đại diện (PUT multipart/form-data)
export const updateAvatar = async (file, token) => {
  try {
    console.log("📤 PUT /user/profile/avatar");
    console.log("📤 File:", file.name, file.size, "bytes");
    
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.put(`${API_URL}/user/profile/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("✅ Avatar uploaded:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🟢 Đổi mật khẩu
export const changePassword = async (currentPassword, newPassword, confirmNewPassword, token) => {
  try {
    console.log("📤 PUT /user/profile/password");
    
    const res = await axios.put(
      `${API_URL}/user/profile/password`,
      { currentPassword, newPassword, confirmNewPassword },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("✅ Password changed:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
