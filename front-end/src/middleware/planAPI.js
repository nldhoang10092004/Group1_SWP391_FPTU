import axios from "axios";

const API_URL = "https://localhost:7010/api/public/plan";

export const getPlans = async () => {
  try {
    const res = await axios.get(API_URL);
    // ✅ Kiểm tra đúng cấu trúc dữ liệu trả về từ API
    if (res.data && Array.isArray(res.data.plan)) {
      return res.data.plan;
    } else {
      console.error("API /plan không trả về mảng hợp lệ:", res.data);
      return [];
    }
  } catch (err) {
    console.error("Lỗi khi gọi API /plan:", err);
    return [];
  }
};
