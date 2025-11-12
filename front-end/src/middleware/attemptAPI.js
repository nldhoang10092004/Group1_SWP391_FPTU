import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Tự động gắn token từ localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAllAttempts = async () => {
  const res = await api.get("/attempts");
  return res.data || [];
};
