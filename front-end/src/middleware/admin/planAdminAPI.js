import axios from "axios";
import Swal from "sweetalert2"; 

const API_URL = `${process.env.REACT_APP_API_URL}/api/admin/plans`;

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

// 🟢 Lấy tất cả subscription plans
export const getAllPlans = async () => {
  try {
    const res = await api.get("/view", { headers: getAuthHeaders() });
    console.log("📘 getAllPlans:", res.data);
    return res.data || [];
  } catch (err) {
    handleError(err, "Không thể tải danh sách gói đăng ký.");
  }
};

// 🟢 Lấy chi tiết subscription plan theo ID
export const getPlanById = async (id) => {
  try {
    const res = await api.get(`/${id}`, { headers: getAuthHeaders() });
    console.log("📘 getPlanById:", res.data);
    return res.data;
  } catch (err) {
    handleError(err, "Không thể tải thông tin gói đăng ký.");
  }
};

// 🟢 Tạo mới subscription plan
export const createPlan = async (data) => {
  try {
    const res = await api.post("/create", data, { headers: getAuthHeaders() });
    showPopup("Tạo gói đăng ký thành công!", "success");
    return res.data;
  } catch (err) {
    handleError(err, "Không thể tạo gói đăng ký.");
  }
};

// 🟡 Cập nhật subscription plan
export const updatePlan = async (id, data) => {
  try {
    const res = await api.put(`/update/${id}`, data, { headers: getAuthHeaders() });
    showPopup("Cập nhật gói đăng ký thành công!", "success");
    return res.data;
  } catch (err) {
    handleError(err, "Không thể cập nhật gói đăng ký.");
  }
};

// 🔴 Xóa subscription plan
export const deletePlan = async (id, force = false) => {
  try {
    const res = await api.delete(`/delete/${id}`, { 
      headers: getAuthHeaders(),
      params: { force }
    });
    showPopup("Xóa gói đăng ký thành công!", "success");
    return res.data;
  } catch (err) {
    handleError(err, "Không thể xóa gói đăng ký.");
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