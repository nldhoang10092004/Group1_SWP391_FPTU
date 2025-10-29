import axios from "axios";
import Swal from "sweetalert2"; 

const API_URL = `${process.env.REACT_APP_API_URL}/api/admin/flashcard`;

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

// 🧩 Hàm hiển thị popup thông báo
const showPopup = (message, type = "success") => {
  Swal.fire({
    icon: type,
    title: type === "success" ? "Thành công" : "Lỗi",
    text: message,
    confirmButtonColor: type === "success" ? "#3085d6" : "#d33",
    timer: 3000,
  });
};

// 🟢 Lấy tất cả Flashcard Sets công khai
export const getPublicSets = async () => {
  try {
    const res = await api.get("/sets/public", { headers: getAuthHeaders() });
    console.log("📘 getPublicSets:", res.data);
    return res.data || [];
  } catch (err) {
    handleError(err, "Không thể tải danh sách Flashcard Sets công khai.");
  }
};

// 🟢 Lấy Flashcard Sets theo Course ID
export const getSetsByCourse = async (courseId) => {
  try {
    const res = await api.get(`/sets/course/${courseId}`, { headers: getAuthHeaders() });
    console.log("📘 getSetsByCourse:", res.data);
    return res.data || [];
  } catch (err) {
    handleError(err, "Không thể tải Flashcard theo khóa học.");
  }
};

// 🟢 Lấy chi tiết Flashcard Set (bao gồm Items)
export const getFlashcardSet = async (setId) => {
  try {
    const res = await api.get(`/set/${setId}`, { headers: getAuthHeaders() });
    console.log("📘 getFlashcardSet:", res.data);
    return res.data;
  } catch (err) {
    handleError(err, "Không thể tải thông tin Flashcard Set.");
  }
};

// 🟢 Tạo mới Flashcard Set
export const createFlashcardSet = async (data) => {
  try {
    const res = await api.post(`/set`, data, { headers: getAuthHeaders() });
    showPopup("Tạo Flashcard Set thành công!", "success");
    return res.data;
  } catch (err) {
    handleError(err, "Không thể tạo Flashcard Set.");
  }
};

// 🟡 Cập nhật Flashcard Set
export const updateFlashcardSet = async (setId, data) => {
  try {
    const res = await api.put(`/set/${setId}`, data, { headers: getAuthHeaders() });
    showPopup("Cập nhật Flashcard Set thành công!", "success");
    return res.data;
  } catch (err) {
    handleError(err, "Không thể cập nhật Flashcard Set.");
  }
};

// 🔴 Xóa Flashcard Set
export const deleteFlashcardSet = async (setId) => {
  try {
    const res = await api.delete(`/set/${setId}`, { headers: getAuthHeaders() });
    showPopup("Xóa Flashcard Set thành công!", "success");
    return res.data;
  } catch (err) {
    handleError(err, "Không thể xóa Flashcard Set.");
  }
};

// 🟢 Thêm Flashcard Item
export const createFlashcardItem = async (data) => {
  try {
    const res = await api.post(`/item`, data, { headers: getAuthHeaders() });
    showPopup("Thêm Flashcard Item thành công!", "success");
    return res.data;
  } catch (err) {
    handleError(err, "Không thể thêm Flashcard Item.");
  }
};

// 🟡 Cập nhật Flashcard Item
export const updateFlashcardItem = async (itemId, data) => {
  try {
    const res = await api.put(`/item/${itemId}`, data, { headers: getAuthHeaders() });
    showPopup("Cập nhật Flashcard Item thành công!", "success");
    return res.data;
  } catch (err) {
    handleError(err, "Không thể cập nhật Flashcard Item.");
  }
};

// 🔴 Xóa Flashcard Item
export const deleteFlashcardItem = async (itemId) => {
  try {
    const res = await api.delete(`/item/${itemId}`, { headers: getAuthHeaders() });
    showPopup("Xóa Flashcard Item thành công!", "success");
    return res.data;
  } catch (err) {
    handleError(err, "Không thể xóa Flashcard Item.");
  }
};

// ⚠️ Xử lý lỗi chung
const handleError = (err, defaultMessage) => {
  const status = err.response?.status;
  let message = defaultMessage;

  if (status === 403) message = "Bạn không có quyền thực hiện hành động này.";
  else if (status === 404) message = "Không tìm thấy dữ liệu yêu cầu.";
  else if (status === 500) message = "Lỗi máy chủ. Vui lòng thử lại sau.";

  console.error("❌ API Error:", err.response?.data || err.message);
  showPopup(message, "error");
};
