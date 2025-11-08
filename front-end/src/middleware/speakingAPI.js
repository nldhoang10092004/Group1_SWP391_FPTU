import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/user/ai-speaking`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

// ✅ API gọi AI tạo đề speaking
export const generateSpeakingPrompt = async () => {
  try {
    const res = await api.post("/generate", {}, { headers: getAuthHeaders() });
    return res.data;
  } catch (err) {
    console.error("Error generating speaking prompt:", err);
    throw err;
  }
};

// ✅ API gửi file audio + prompt để chấm điểm
export const submitSpeakingAnswer = async (audioFile, promptContent) => {
  const formData = new FormData();
  formData.append("File", audioFile);
  formData.append("PromptContent", promptContent);

  try {
    const res = await axios.post(`${API_URL}/submit`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error submitting speaking answer:", err);
    throw err;
  }
};
