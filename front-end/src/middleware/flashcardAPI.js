import axios from "axios";

const API_URL = "https://beerier-superlogically-maxwell.ngrok-free.dev/api/flashcard";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // bypass ngrok warning
  };
};

// Lấy tất cả flashcard sets
export const getFlashcardSets = async () => {
  try {
    const res = await api.get("/sets", { headers: getAuthHeaders() });
    console.log("📘 getFlashcardSets response:", res.data);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ getFlashcardSets error:", err.response?.data || err.message);
    throw err;
  }
};

// Lấy flashcard set theo ID
export const getFlashcardSetById = async (setId) => {
  try {
    const res = await api.get(`/set/${setId}`, { headers: getAuthHeaders() });
    console.log("📘 getFlashcardSetById response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ getFlashcardSetById error:", err.response?.data || err.message);
    throw err;
  }
};
