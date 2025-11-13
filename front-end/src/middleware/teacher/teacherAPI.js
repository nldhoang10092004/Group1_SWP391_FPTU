// middleware/teacher/teacherAPI.js
const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Accept: "*/*",
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : undefined,
    "ngrok-skip-browser-warning": "true",
  };
};

export const getTeacherInfo = async (teacherId) => {
  if (!teacherId) {
    throw new Error("teacherId is required for getTeacherInfo");
  }

  const response = await fetch(`${API_URL}/api/teacher/info/${teacherId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const updateTeacherInfo = async (teacherData) => {
  const response = await fetch(`${API_URL}/api/teacher/info`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      description: teacherData.description,
      certUrls: teacherData.certUrls || [],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
