import axios from "axios";

const API_BASE = `${process.env.REACT_APP_API_URL}/api/teacher/ai-quiz`;


const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  
  if (!token) {
    console.error("❌ Không có token! Cần đăng nhập lại");
    throw new Error("Phiên đăng nhập hết hạn");
  }

  // 🔍 DEBUG: Decode token để xem role
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log("🔑 Token payload:", payload);
    console.log("👤 User role:", payload.role || payload.Role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
  } catch (e) {
    console.error("❌ Cannot decode token:", e);
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
};


export const generateAIQuiz = async (prompt) => {
  try {
    if (!prompt || !prompt.trim()) {
      throw new Error("Prompt không được để trống");
    }

    console.log("Generating AI quiz with prompt:", prompt);

    const response = await axios.post(
      `${API_BASE}/generate`,
      { prompt: prompt.trim() },
      { 
        headers: getAuthHeaders(),
        timeout: 60000, // 60 seconds timeout for AI generation
      }
    );

    console.log("✅ AI quiz generated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Generate AI quiz error:", error);
    
    if (error.code === "ECONNABORTED") {
      throw new Error("AI generation timeout - Vui lòng thử lại");
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      "Không thể tạo quiz bằng AI"
    );
  }
};


export const parseAIQuizResponse = (aiResponse) => {
  try {
    // Nếu có json field, parse nó
    if (aiResponse.json) {
      const parsed = typeof aiResponse.json === 'string' 
        ? JSON.parse(aiResponse.json) 
        : aiResponse.json;
      
      return {
        title: parsed.Title || parsed.title || "AI Generated Quiz",
        description: parsed.Description || parsed.description || "",
        questions: parsed.Questions || parsed.questions || []
      };
    }
    
    // Fallback: parse rawText nếu có
    if (aiResponse.rawText) {
      const parsed = JSON.parse(aiResponse.rawText);
      return {
        title: parsed.Title || parsed.title || "AI Generated Quiz",
        description: parsed.Description || parsed.description || "",
        questions: parsed.Questions || parsed.questions || []
      };
    }
    
    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error("❌ Parse AI quiz error:", error);
    throw new Error("Không thể parse dữ liệu từ AI");
  }
};


export const convertAIQuestionsToImportFormat = (aiQuestions) => {
  return aiQuestions.map((q) => {
    // Tìm đáp án đúng
    const correctIndex = q.Options?.findIndex(opt => opt.IsCorrect || opt.isCorrect) || 0;
    
    return {
      content: q.Content || q.content || "",
      options: (q.Options || q.options || []).map(opt => opt.Content || opt.content || ""),
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      scoreWeight: 1.00,
      questionType: q.QuestionType || q.questionType || 1,
    };
  });
};

export default {
  generateAIQuiz,
  parseAIQuizResponse,
  convertAIQuestionsToImportFormat,
};