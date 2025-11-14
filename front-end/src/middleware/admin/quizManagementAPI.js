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

// ============================================
// QUIZ APIs
// ============================================

// 📝 GET /api/admin/quiz - Lấy tất cả quiz
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

// ➕ POST /api/admin/quiz - Tạo quiz mới
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

// 📖 GET /api/admin/quiz/{quizId} - Lấy chi tiết quiz
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

// 🔄 PUT /api/admin/quiz/{quizId} - Update quiz
export const updateQuiz = async (quizId, updateData) => {
  try {
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

// 🗑️ DELETE /api/admin/quiz/{quizId} - Xóa quiz
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

// ============================================
// GROUP APIs
// ============================================

// ➕ POST /api/admin/quiz/{quizId}/group - Tạo group mới
export const createGroup = async (quizId, groupData) => {
  try {
    const payload = {
      instruction: groupData.instruction || "",
      groupType: groupData.groupType || 1,
      groupOrder: groupData.groupOrder || 1
    };
    const res = await api.post(`/${quizId}/group`, payload, { headers: getAuthHeaders() });
    console.log("➕ createGroup response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ createGroup error:", err.response?.data || err.message);
    throw err;
  }
};

// 🔄 PUT /api/admin/quiz/group/{groupId} - Update group
export const updateGroup = async (groupId, groupData) => {
  try {
    const payload = {
      instruction: groupData.instruction || "",
      groupType: groupData.groupType || 1,
      groupOrder: groupData.groupOrder || 1
    };
    const res = await api.put(`/group/${groupId}`, payload, { headers: getAuthHeaders() });
    console.log("🔄 updateGroup response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ updateGroup error:", err.response?.data || err.message);
    throw err;
  }
};

// 🗑️ DELETE /api/admin/quiz/group/{groupId} - Xóa group
export const deleteGroup = async (groupId) => {
  try {
    const res = await api.delete(`/group/${groupId}`, { headers: getAuthHeaders() });
    console.log("🗑️ deleteGroup response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ deleteGroup error:", err.response?.data || err.message);
    throw err;
  }
};

// ============================================
// QUESTION APIs
// ============================================

// ➕ POST /api/admin/quiz/group/{groupId}/question - Tạo question
export const createQuestion = async (groupId, questionData) => {
  try {
    const payload = {
      content: questionData.content || "",
      questionType: questionData.questionType || 1,
      questionOrder: questionData.questionOrder || 1,
      scoreWeight: questionData.scoreWeight || 1.0,
      metaJson: questionData.metaJson || null
    };
    const res = await api.post(`/group/${groupId}/question`, payload, { headers: getAuthHeaders() });
    console.log("➕ createQuestion response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ createQuestion error:", err.response?.data || err.message);
    throw err;
  }
};

// 🔄 PUT /api/admin/quiz/question/{questionId} - Update question
export const updateQuestion = async (questionId, questionData) => {
  try {
    const payload = {
      content: questionData.content || "",
      questionType: questionData.questionType || 1,
      questionOrder: questionData.questionOrder || 1,
      scoreWeight: questionData.scoreWeight || 1.0,
      metaJson: questionData.metaJson || null
    };
    const res = await api.put(`/question/${questionId}`, payload, { headers: getAuthHeaders() });
    console.log("🔄 updateQuestion response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ updateQuestion error:", err.response?.data || err.message);
    throw err;
  }
};

// 🗑️ DELETE /api/admin/quiz/question/{questionId} - Xóa question
export const deleteQuestion = async (questionId) => {
  try {
    const res = await api.delete(`/question/${questionId}`, { headers: getAuthHeaders() });
    console.log("🗑️ deleteQuestion response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ deleteQuestion error:", err.response?.data || err.message);
    throw err;
  }
};

// ============================================
// OPTION APIs
// ============================================

// ➕ POST /api/admin/quiz/question/{questionId}/option - Tạo option
export const createOption = async (questionId, optionData) => {
  try {
    const payload = {
      content: optionData.content || "",
      isCorrect: optionData.isCorrect || false
    };
    const res = await api.post(`/question/${questionId}/option`, payload, { headers: getAuthHeaders() });
    console.log("➕ createOption response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ createOption error:", err.response?.data || err.message);
    throw err;
  }
};

// 🔄 PUT /api/admin/quiz/option/{optionId} - Update option
export const updateOption = async (optionId, optionData) => {
  try {
    const payload = {
      content: optionData.content || "",
      isCorrect: optionData.isCorrect || false
    };
    const res = await api.put(`/option/${optionId}`, payload, { headers: getAuthHeaders() });
    console.log("🔄 updateOption response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ updateOption error:", err.response?.data || err.message);
    throw err;
  }
};

// 🗑️ DELETE /api/admin/quiz/option/{optionId} - Xóa option
export const deleteOption = async (optionId) => {
  try {
    const res = await api.delete(`/option/${optionId}`, { headers: getAuthHeaders() });
    console.log("🗑️ deleteOption response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ deleteOption error:", err.response?.data || err.message);
    throw err;
  }
};

// ============================================
// ASSET APIs
// ============================================

// ➕ POST /api/admin/quiz/group/{groupId}/asset - Tạo group asset
export const createGroupAsset = async (groupId, assetData) => {
  try {
    const payload = {
      assetType: assetData.assetType || 0,
      url: assetData.url || "",
      contentText: assetData.contentText || "",
      caption: assetData.caption || "",
      mimeType: assetData.mimeType || ""
    };
    const res = await api.post(`/group/${groupId}/asset`, payload, { headers: getAuthHeaders() });
    console.log("➕ createGroupAsset response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ createGroupAsset error:", err.response?.data || err.message);
    throw err;
  }
};

// ➕ POST /api/admin/quiz/question/{questionId}/asset - Tạo question asset
export const createQuestionAsset = async (questionId, assetData) => {
  try {
    const payload = {
      assetType: assetData.assetType || 0,
      url: assetData.url || "",
      contentText: assetData.contentText || "",
      caption: assetData.caption || "",
      mimeType: assetData.mimeType || ""
    };
    const res = await api.post(`/question/${questionId}/asset`, payload, { headers: getAuthHeaders() });
    console.log("➕ createQuestionAsset response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ createQuestionAsset error:", err.response?.data || err.message);
    throw err;
  }
};

// 🗑️ DELETE /api/admin/quiz/asset/{assetId} - Xóa asset
export const deleteAsset = async (assetId) => {
  try {
    const res = await api.delete(`/asset/${assetId}`, { headers: getAuthHeaders() });
    console.log("🗑️ deleteAsset response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ deleteAsset error:", err.response?.data || err.message);
    throw err;
  }
};

// ============================================
// BATCH OPERATIONS (Helper functions)
// ============================================

// 📤 Import toàn bộ quiz structure (batch create)
// ✅ FIX: Xóa hết groups cũ trước khi tạo mới để tránh duplicate
export const importQuizGroups = async (quizId, importData) => {
  try {
    console.log("📤 Starting importQuizGroups for quiz:", quizId);
    console.log("📦 Import data:", JSON.stringify(importData, null, 2));
    
    // ✅ BƯỚC 1: Lấy tất cả groups hiện tại của quiz
    const currentQuiz = await getQuizById(quizId);
    const existingGroups = currentQuiz.groups || [];
    console.log(`🗑️ Found ${existingGroups.length} existing groups, deleting all...`);
    
    // ✅ BƯỚC 2: Xóa hết tất cả groups cũ
    for (const group of existingGroups) {
      if (group.groupID) {
        try {
          await deleteGroup(group.groupID);
          console.log(`✅ Deleted group ${group.groupID}`);
        } catch (err) {
          console.warn(`⚠️ Failed to delete group ${group.groupID}:`, err.message);
        }
      }
    }
    
    console.log("✅ All old groups deleted, now creating new groups...");
    
    // ✅ BƯỚC 3: Tạo mới tất cả groups từ importData
    const results = { groups: [], questions: [], options: [], assets: [] };
    
    for (const groupData of importData.groups || []) {
      // Tạo group mới (không update, luôn tạo mới)
      const groupResult = await createGroup(quizId, groupData);
      results.groups.push(groupResult);
      const groupId = groupResult.groupID || groupResult.groupId;
      console.log(`✅ Created new group ${groupId}: ${groupData.instruction}`);
      
      // Tạo group assets
      for (const assetData of groupData.assets || []) {
        const assetResult = await createGroupAsset(groupId, assetData);
        results.assets.push(assetResult);
      }
      
      // Tạo questions
      for (const questionData of groupData.questions || []) {
        const questionResult = await createQuestion(groupId, questionData);
        results.questions.push(questionResult);
        const questionId = questionResult.questionID || questionResult.questionId;
        
        // Tạo question assets
        for (const assetData of questionData.assets || []) {
          const assetResult = await createQuestionAsset(questionId, assetData);
          results.assets.push(assetResult);
        }
        
        // Tạo options
        for (const optionData of questionData.options || []) {
          const optionResult = await createOption(questionId, optionData);
          results.options.push(optionResult);
        }
      }
    }
    
    console.log("✅ importQuizGroups completed:", {
      groupsCreated: results.groups.length,
      questionsCreated: results.questions.length,
      optionsCreated: results.options.length,
      assetsCreated: results.assets.length
    });
    
    return results;
  } catch (err) {
    console.error("❌ importQuizGroups error:", err.response?.data || err.message);
    throw err;
  }
};

export default {
  // Quiz
  getAllQuizzes,
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  
  // Group
  createGroup,
  updateGroup,
  deleteGroup,
  
  // Question
  createQuestion,
  updateQuestion,
  deleteQuestion,
  
  // Option
  createOption,
  updateOption,
  deleteOption,
  
  // Asset
  createGroupAsset,
  createQuestionAsset,
  deleteAsset,
  
  // Batch
  importQuizGroups,
};