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
export const updateQuiz = async (quizId, updateData) => {
  try {
    // Format data theo schema của API
    const formattedData = {
      title: updateData.title,
      description: updateData.description,
      quizType: updateData.quizType?.toString() || "0",
      isActive: updateData.isActive ?? true,
      groups: (updateData.groups || []).map(g => ({
        groupID: g.groupID || 0,
        instruction: g.instruction || "",
        questions: (g.questions || []).map(q => ({
          questionID: q.questionID || 0,
          content: q.content || "",
          questionType: q.questionType?.toString() || "1",
          options: (q.options || []).map(o => ({
            optionID: o.optionID || 0,
            content: o.content || "",
            isCorrect: o.isCorrect || false
          }))
        }))
      }))
    };

    console.log("🔄 updateQuiz payload:", JSON.stringify(formattedData, null, 2));
    
    const res = await api.put(`/${quizId}`, formattedData, { headers: getAuthHeaders() });
    console.log("🔄 updateQuiz response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ updateQuiz error:", err.response?.data || err.message);
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