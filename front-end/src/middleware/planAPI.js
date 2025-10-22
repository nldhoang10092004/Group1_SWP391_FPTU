// src/middleware/planAPI.js
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/public/plan`;

export const getPlans = async () => {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
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
