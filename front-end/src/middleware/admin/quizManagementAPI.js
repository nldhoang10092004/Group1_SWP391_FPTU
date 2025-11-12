// src/middleware/admin/quizManagementAPI.js
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/admin/quiz`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
};

// 📝 Lấy tất cả quiz
export const getAllQuizzes = async () => {
  try {
    const res = await api.get("", { headers: getAuthHeaders() });
    console.log("📝 getAllQuizzes response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ getAllQuizzes error:", err.response?.data || err.message);
    throw err;
  }
};

// ➕ Tạo quiz mới
export const createQuiz = async (quizData) => {
  try {
    const res = await api.post("", quizData, { headers: getAuthHeaders() });
    console.log("➕ createQuiz response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ createQuiz error:", err.response?.data || err.message);
    throw err;
  }
};

// 📖 Lấy chi tiết quiz theo quizId
export const getQuizById = async (quizId) => {
  try {
    const res = await api.get(`/${quizId}`, { headers: getAuthHeaders() });
    console.log("📖 getQuizById response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ getQuizById error:", err.response?.data || err.message);
    throw err;
  }
};

// 🗑️ Xóa quiz theo quizId
export const deleteQuiz = async (quizId) => {
  try {
    const res = await api.delete(`/${quizId}`, { headers: getAuthHeaders() });
    console.log("🗑️ deleteQuiz response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ deleteQuiz error:", err.response?.data || err.message);
    throw err;
  }
};

// 📤 Import groups vào quiz
export const importQuizGroups = async (quizId, importData) => {
  try {
    const res = await api.post(`/${quizId}/import`, importData, { headers: getAuthHeaders() });
    console.log("📤 importQuizGroups response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ importQuizGroups error:", err.response?.data || err.message);
    throw err;
  }
};

export default {
  getAllQuizzes,
  createQuiz,
  getQuizById,
  deleteQuiz,
  importQuizGroups,
};