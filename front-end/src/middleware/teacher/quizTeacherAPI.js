// middleware/teacher/quizTeacherAPI.js
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
 * Body: { courseID, title, description, quizType }
 * ===================== */
export const createQuiz = async (quizData) => {
  try {
    const payload = {
      courseID: quizData.courseID,
      title: quizData.title,
      description: quizData.description,
      quizType: quizData.quizType,
    };

    const res = await axios.post(API_BASE, payload, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo quiz:", error.response?.data || error);
    throw error;
  }
};

/* =====================
 * 🟡 API: Cập nhật quiz
 * PUT /api/teacher/quiz/{quizId}
 * Body: { title, description, quizType, isActive }
 * ===================== */
export const updateQuiz = async (quizId, quizData) => {
  try {
    const payload = {
      title: quizData.title,
      description: quizData.description,
      quizType: quizData.quizType,
      isActive: quizData.isActive,
    };

    const res = await axios.put(`${API_BASE}/${quizId}`, payload, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật quiz:", error.response?.data || error);
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
 * GROUP MANAGEMENT APIs
 * ===================== */

/* 🟢 Tạo group mới cho quiz
 * POST /api/teacher/quiz/{quizId}/group
 * Body: { instruction, groupType, groupOrder }
 */
export const createQuizGroup = async (quizId, groupData) => {
  try {
    const payload = {
      instruction: groupData.instruction,
      groupType: groupData.groupType || 1,
      groupOrder: groupData.groupOrder || 1,
    };

    const res = await axios.post(`${API_BASE}/${quizId}/group`, payload, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo group:", error);
    throw error;
  }
};

/* 🟡 Cập nhật group
 * PUT /api/teacher/quiz/group/{groupId}
 * Body: { instruction, groupType, groupOrder }
 */
export const updateQuizGroup = async (groupId, groupData) => {
  try {
    const payload = {
      instruction: groupData.instruction,
      groupType: groupData.groupType,
      groupOrder: groupData.groupOrder,
    };

    const res = await axios.put(`${API_BASE}/group/${groupId}`, payload, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật group:", error);
    throw error;
  }
};

/* 🟠 Xóa group
 * DELETE /api/teacher/quiz/group/{groupId}
 */
export const deleteQuizGroup = async (groupId) => {
  try {
    const res = await axios.delete(`${API_BASE}/group/${groupId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa group:", error);
    throw error;
  }
};

/* =====================
 * QUESTION MANAGEMENT APIs
 * ===================== */

/* 🟢 Tạo câu hỏi cho group
 * POST /api/teacher/quiz/group/{groupId}/question
 * Body: { content, questionType, questionOrder, scoreWeight, metaJson }
 */
export const createQuestion = async (groupId, questionData) => {
  try {
    const payload = {
      content: questionData.content,
      questionType: questionData.questionType || 1,
      questionOrder: questionData.questionOrder || 1,
      scoreWeight: questionData.scoreWeight || 1.0,
      metaJson: questionData.metaJson || null,
    };

    const res = await axios.post(`${API_BASE}/group/${groupId}/question`, payload, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo câu hỏi:", error);
    throw error;
  }
};

/* 🟡 Cập nhật câu hỏi
 * PUT /api/teacher/quiz/question/{questionId}
 * Body: { content, questionType, questionOrder, scoreWeight, metaJson }
 */
export const updateQuestion = async (questionId, questionData) => {
  try {
    const payload = {
      content: questionData.content,
      questionType: questionData.questionType,
      questionOrder: questionData.questionOrder,
      scoreWeight: questionData.scoreWeight,
      metaJson: questionData.metaJson || null,
    };

    const res = await axios.put(`${API_BASE}/question/${questionId}`, payload, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật câu hỏi:", error);
    throw error;
  }
};

/* 🟠 Xóa câu hỏi
 * DELETE /api/teacher/quiz/question/{questionId}
 */
export const deleteQuestion = async (questionId) => {
  try {
    const res = await axios.delete(`${API_BASE}/question/${questionId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa câu hỏi:", error);
    throw error;
  }
};


/* =====================
 * OPTION MANAGEMENT APIs
 * ===================== */

/* 🟢 Tạo option (đáp án) cho câu hỏi
 * POST /api/teacher/quiz/question/{questionId}/option
 * Body: { content, isCorrect }
 */
export const createOption = async (questionId, optionData) => {
  try {
    const payload = {
      content: optionData.content,
      isCorrect: optionData.isCorrect || false,
    };

    const res = await axios.post(`${API_BASE}/question/${questionId}/option`, payload, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo option:", error);
    throw error;
  }
};

/* 🟡 Cập nhật option
 * PUT /api/teacher/quiz/option/{optionId}
 * Body: { content, isCorrect }
 */
export const updateOption = async (optionId, optionData) => {
  try {
    const payload = {
      content: optionData.content,
      isCorrect: optionData.isCorrect,
    };

    const res = await axios.put(`${API_BASE}/option/${optionId}`, payload, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật option:", error);
    throw error;
  }
};

/* 🟠 Xóa option
 * DELETE /api/teacher/quiz/option/{optionId}
 */
export const deleteOption = async (optionId) => {
  try {
    const res = await axios.delete(`${API_BASE}/option/${optionId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa option:", error);
    throw error;
  }
};

/* =====================
 * ASSET MANAGEMENT APIs
 * ===================== */

/* 🟢 Thêm asset cho group
 * POST /api/teacher/quiz/group/{groupId}/asset
 * Body: { assetType, url, contentText, caption, mimeType }
 */
export const createGroupAsset = async (groupId, assetData) => {
  try {
    const payload = {
      assetType: assetData.assetType,
      url: assetData.url || "",
      contentText: assetData.contentText || "",
      caption: assetData.caption || "",
      mimeType: assetData.mimeType || "",
    };

    const res = await axios.post(`${API_BASE}/group/${groupId}/asset`, payload, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo group asset:", error);
    throw error;
  }
};

/* 🟢 Thêm asset cho câu hỏi
 * POST /api/teacher/quiz/question/{questionId}/asset
 * Body: { assetType, url, contentText, caption, mimeType }
 */
export const createQuestionAsset = async (questionId, assetData) => {
  try {
    const payload = {
      assetType: assetData.assetType,
      url: assetData.url || "",
      contentText: assetData.contentText || "",
      caption: assetData.caption || "",
      mimeType: assetData.mimeType || "",
    };

    const res = await axios.post(`${API_BASE}/question/${questionId}/asset`, payload, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo question asset:", error);
    throw error;
  }
};

/* 🟠 Xóa asset
 * DELETE /api/teacher/quiz/asset/{assetId}
 */
export const deleteAsset = async (assetId) => {
  try {
    const res = await axios.delete(`${API_BASE}/asset/${assetId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa asset:", error);
    throw error;
  }
};

/* =====================
 * LEGACY: Import groups (nếu backend còn hỗ trợ)
 * Giữ lại để tương thích với code cũ
 * ===================== */
export const importQuizGroups = async (quizId, importData) => {
  try {
    console.warn("⚠️ importQuizGroups is deprecated. Consider using individual APIs instead.");
    const res = await axios.post(`${API_BASE}/${quizId}/import`, importData, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi import nhóm câu hỏi vào quiz:", error);
    throw error;
  }
};