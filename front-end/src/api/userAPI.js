import axios from "axios";

const API_BASE_URL = "http://localhost:5293/api/";

export const getUser = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    throw error;
  }
};

export const changePassword = async (id, currentPassword, newPassword) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    throw error;
  }
};

