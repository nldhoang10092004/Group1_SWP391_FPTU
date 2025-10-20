// src/middleware/QuizAPI.js
import axios from "axios";

const API_URL = "https://beerier-superlogically-maxwell.ngrok-free.dev/api/user/quiz";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
        'ngrok-skip-browser-warning': 'true'

  },
});

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  
  if (!token) {
    throw new Error("❌ No token found. Please login again.");
  }
  return { Authorization: `Bearer ${token}` };
};

// Lấy quiz theo course
export const getQuizzesByCourse = async (courseId) => {
  try {
    const res = await api.get(`/course/${courseId}`, { headers: getAuthHeader() });
    console.log("📘 getQuizzesByCourse response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ getQuizzesByCourse error:", err.response?.data || err.message);
    throw err;
  }
};

// Lấy quiz theo ID
export const getQuizById = async (quizId) => {
  try {
    const res = await api.get(`/${quizId}`, { headers: getAuthHeader() });
    console.log("📘 getQuizById response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ getQuizById error:", err.response?.data || err.message);
    throw err;
  }
};

// Bắt đầu quiz
export const startQuiz = async (quizId) => {
  try {
    const res = await api.post(`/start/${quizId}`, {}, { headers: getAuthHeader() });
    console.log("🎯 startQuiz response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ startQuiz error:", err.response?.data || err.message);
    throw err;
  }
};

// Nộp quiz - Format theo backend: { Answers: [{ QuestionID, OptionID }] }
export const submitQuiz = async (attemptId, answers) => {
  try {
    const payload = {
      Answers: answers // Backend expect capital 'Answers'
    };
    
    console.log("📝 Submitting to:", `/submit/${attemptId}`);
    console.log("📝 Payload:", payload);
    
    const res = await api.post(
      `/submit/${attemptId}`, 
      payload, 
      { headers: getAuthHeader() }
    );
    
    console.log("✅ submitQuiz response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ submitQuiz error:", err.response?.data || err.message);
    throw err;
  }
};

// Lịch sử quiz
export const getQuizHistory = async () => {
  try {
    const res = await api.get(`/attempts/history`, { headers: getAuthHeader() });
    console.log("📜 getQuizHistory response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ getQuizHistory error:", err.response?.data || err.message);
    throw err;
  }
};