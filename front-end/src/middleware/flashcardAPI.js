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

// 🟢 Lấy flashcard set theo setId
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

// 🟡 Cập nhật flashcard set theo setId
export const updateFlashcardSet = async (setId, data) => {
  try {
    const res = await api.put(`/set/${setId}`, data, { headers: getAuthHeaders() });
    console.log("📘 updateFlashcardSet response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ updateFlashcardSet error:", err.response?.data || err.message);
    throw err;
  }
};

// 🔴 Xóa flashcard set theo setId
export const deleteFlashcardSet = async (setId) => {
  try {
    const res = await api.delete(`/set/${setId}`, { headers: getAuthHeaders() });
    console.log("📘 deleteFlashcardSet response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ deleteFlashcardSet error:", err.response?.data || err.message);
    throw err;
  }
};

// 🟢 Tạo flashcard item (thẻ)
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

// 🟡 Cập nhật flashcard item theo itemId
export const updateFlashcardItem = async (itemId, data) => {
  try {
    const res = await api.put(`/item/${itemId}`, data, { headers: getAuthHeaders() });
    console.log("📘 updateFlashcardItem response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ updateFlashcardItem error:", err.response?.data || err.message);
    throw err;
  }
};

// 🔴 Xóa flashcard item theo itemId
export const deleteFlashcardItem = async (itemId) => {
  try {
    const res = await api.delete(`/item/${itemId}`, { headers: getAuthHeaders() });
    console.log("📘 deleteFlashcardItem response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ deleteFlashcardItem error:", err.response?.data || err.message);
    throw err;
  }
};
