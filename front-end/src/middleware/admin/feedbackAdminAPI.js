import axios from "axios";
import Swal from "sweetalert2"; 

const API_URL = `${process.env.REACT_APP_API_URL}/api/admin/feedbacks`;

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

// 🟢 Lấy tất cả feedbacks
export const getAllFeedbacks = async () => {
  try {
    const res = await api.get("", { headers: getAuthHeaders() });
    console.log("📘 getAllFeedbacks:", res.data);
    return res.data || [];
  } catch (err) {
    handleError(err, "Không thể tải danh sách đánh giá.");
  }
};

// 🟡 Toggle visibility của feedback (ẩn/hiện)
export const toggleFeedbackVisibility = async (feedbackId) => {
  try {
    const res = await api.patch(`/${feedbackId}/toggle-visibility`, {}, { headers: getAuthHeaders() });
    showPopup(res.data.message || "Đã cập nhật trạng thái hiển thị!", "success");
    return res.data;
  } catch (err) {
    handleError(err, "Không thể cập nhật trạng thái hiển thị.");
  }
};

// 🔴 Xóa feedback
export const deleteFeedback = async (feedbackId) => {
  try {
    const res = await api.delete(`/${feedbackId}`, { headers: getAuthHeaders() });
    showPopup("Xóa đánh giá thành công!", "success");
    return res.data;
  } catch (err) {
    handleError(err, "Không thể xóa đánh giá.");
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