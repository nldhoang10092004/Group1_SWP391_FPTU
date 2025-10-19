// src/middleware/paymentAPI.js
import axios from "axios";

const API_BASE = "https://localhost:7010/api/payment";


export async function createPayment(data) {
  try {
    const token = localStorage.getItem("accessToken"); // 🔹 Lấy token từ localStorage
    if (!token) throw new Error("Chưa đăng nhập");

    const res = await axios.post(`${API_BASE}/create`, data, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // 🔹 Gửi kèm token
      },
    });

    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo thanh toán:", error);
    throw error;
  }
}


/**
 * Webhook - backend gọi tới endpoint này (không dùng ở frontend)
 * Dùng để test local hoặc log response webhook
 */
export async function handlePaymentWebhook(payload) {
  try {
    const res = await axios.post(`${API_BASE}/webhook`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi webhook:", error);
    throw error;
  }
}
