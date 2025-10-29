// src/middleware/dashboardAdminAPI.js
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/admin/dashboard`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Hàm lấy access token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Gọi API thống kê tổng quan
export const getDashboardOverview = async () => {
  try {
    const response = await api.get("/overview", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    throw error;
  }
};
