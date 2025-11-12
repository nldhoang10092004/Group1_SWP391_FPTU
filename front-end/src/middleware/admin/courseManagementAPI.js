// src/middleware/admin/courseManagementAPI.js
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/admin/courses`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
};

// 📘 Lấy tất cả khóa học
export const getAllCourses = async () => {
  try {
    const res = await api.get("/view", { headers: getAuthHeaders() });
    console.log("📚 getAllCourses response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ getAllCourses error:", err.response?.data || err.message);
    throw err;
  }
};

// 📗 Lấy khóa học theo teacherId
export const getCoursesByTeacher = async (teacherId) => {
  try {
    const res = await api.get(`/view/${teacherId}`, { headers: getAuthHeaders() });
    console.log("👨‍🏫 getCoursesByTeacher response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ getCoursesByTeacher error:", err.response?.data || err.message);
    throw err;
  }
};

// 📖 Lấy chi tiết khóa học theo courseId
export const getCourseDetail = async (courseId) => {
  try {
    const res = await api.get(`/detail/${courseId}`, { headers: getAuthHeaders() });
    console.log("📖 getCourseDetail response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ getCourseDetail error:", err.response?.data || err.message);
    throw err;
  }
};

// ❌ Xóa khóa học theo courseId
export const deleteCourse = async (courseId) => {
  try {
    const res = await api.delete(`/delete/${courseId}`, { headers: getAuthHeaders() });
    console.log("🗑️ deleteCourse response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ deleteCourse error:", err.response?.data || err.message);
    throw err;
  }
};