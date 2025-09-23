// src/api/auth.js
import axios from "axios";

const API_URL = "https://localhost:7010/api/auth";

export const loginApi = async (email, password) => {
  return axios.post(
    `${API_URL}/login`,
    { emailOrUsername: email, password },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};

export const registerApi = async (name, email, password, role) => {
  return axios.post(
    `${API_URL}/register`,
    { email,username: name, password },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};

export const forgotPasswordApi = async (email) => {
  return axios.post(`${API_URL}/forgot-password`, { email }, {
    headers: { "Content-Type": "application/json" }
  });
};
