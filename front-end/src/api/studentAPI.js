import axios from "axios";

const API_URL = "https://localhost:7010/api/student";

// Get all courses
export const getAllCourses = async () => {
  const response = await axios.get(`${API_URL}/courses`);
  return response.data;
};

// Get course details
export const getCourseDetails = async (courseId) => {
  const response = await axios.get(`${API_URL}/courses/${courseId}`);
  return response.data;
};

// Get courses by level
export const getCoursesByLevel = async (level) => {
  const response = await axios.get(`${API_URL}/courses/level/${level}`);
  return response.data;
};

// Get student dashboard data
export const getStudentDashboard = async () => {
  const response = await axios.get(`${API_URL}/dashboard`);
  return response.data;
};
