import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/flashcard`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
};

// 🟢 Lấy tất cả flashcard sets
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

// 🟢 Lấy flashcard sets theo courseId
export const getFlashcardSetsByCourseId = async (courseId) => {
  try {
    const res = await api.get(`/sets/${courseId}`, { headers: getAuthHeaders() });
    console.log("📘 getFlashcardSetsByCourseId response:", res.data);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ getFlashcardSetsByCourseId error:", err.response?.data || err.message);
    throw err;
  }
};

// 🟢 Lấy flashcard set theo setId (phải login)
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

// 🟢 Tạo mới flashcard set
export const createFlashcardSet = async (data) => {
  try {
    const res = await api.post(`/set`, data, { headers: getAuthHeaders() });
    console.log("📘 createFlashcardSet response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ createFlashcardSet error:", err.response?.data || err.message);
    throw err;
  }
};

// 🟢 Thêm flashcard item (thẻ) vào set
export const createFlashcardItem = async (data) => {
  try {
    const res = await api.post(`/item`, data, { headers: getAuthHeaders() });
    console.log("📘 createFlashcardItem response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ createFlashcardItem error:", err.response?.data || err.message);
    throw err;
  }
};
