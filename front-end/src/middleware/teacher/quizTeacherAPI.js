// src/middleware/teacher/quizTeacherAPI.js
import axios from "axios";

const API_BASE = `${process.env.REACT_APP_API_URL}/api/teacher/quiz`;

/* =====================
 * ⚙️ Helper: Header có token
 * ===================== */
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
};

/* =====================
 * 📘 API: Lấy danh sách quiz của 1 khóa học
 * GET /api/teacher/quiz/course/{courseId}
 * ===================== */
export const getQuizzesByCourse = async (courseId) => {
  try {
    const res = await axios.get(`${API_BASE}/course/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy quiz theo course:", error);
    throw error;
  }
};

/* =====================
 * 📘 API: Lấy chi tiết quiz theo ID
 * GET /api/teacher/quiz/{quizId}
 * ===================== */
export const getQuizById = async (quizId) => {
  try {
    const res = await axios.get(`${API_BASE}/${quizId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết quiz:", error);
    throw error;
  }
};

/* =====================
 * 🟢 API: Tạo quiz mới
 * POST /api/teacher/quiz
 * ===================== */
export const createQuiz = async (quizData) => {
  try {
    const res = await axios.post(API_BASE, quizData, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo quiz:", error.response?.data || error);
    throw error;
  }
};

/* =====================
 * 🟠 API: Xóa quiz
 * DELETE /api/teacher/quiz/{quizId}
 * ===================== */
export const deleteQuiz = async (quizId) => {
  try {
    const res = await axios.delete(`${API_BASE}/${quizId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa quiz:", error);
    throw error;
  }
};

/* =====================
 * 🔄 API: Import group câu hỏi cho quiz
 * POST /api/teacher/quiz/{quizId}/import
 * ===================== */
export const importQuizGroups = async (quizId, importData) => {
  try {
    const res = await axios.post(`${API_BASE}/${quizId}/import`, importData, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi import nhóm câu hỏi vào quiz:", error);
    throw error;
  }
};
// Nếu BE không trả đủ dữ liệu trong getQuizById, fallback qua getQuizzesByCourse
export const getFullQuizById = async (quizId, courseId) => {
  try {
    // Thử gọi chi tiết quiz
    const quiz = await getQuizById(quizId);
    // Nếu có group thì coi như đủ dữ liệu
    if (quiz && quiz.groups && quiz.groups.length > 0) return quiz;

    // Nếu thiếu group → fallback sang gọi toàn bộ quiz theo course
    if (courseId) {
      const allQuizzes = await getQuizzesByCourse(courseId);
      const found = allQuizzes.find(q => q.quizId === parseInt(quizId));
      return found || quiz;
    }

    return quiz;
  } catch (error) {
    console.error("❌ Lỗi khi lấy quiz đầy đủ:", error);
    throw error;
  }
};

