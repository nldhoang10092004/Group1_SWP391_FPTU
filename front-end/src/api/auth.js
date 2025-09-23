// src/api/auth.js
import axios from "axios";

const API_URL = "http://localhost:5293/api/auth";

export const loginApi = async (email, password) => {
  return axios.post(`${API_URL}/login`, { emailOrUsername: email, password }, {
    headers: { "Content-Type": "application/json" }
  });
};

export const registerApi = async (name, email, password, role) => {
  return axios.post(`${API_URL}/register`, { name, email, password, role }, {
    headers: { "Content-Type": "application/json" }
  });
};
