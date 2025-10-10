import axios from "axios";

const API_URL = "https://localhost:7010/api/teacher";

// Get teacher courses
export const getTeacherCourses = async (teacherId) => {
  const response = await axios.get(`${API_URL}/${teacherId}/courses`);
  return response.data;
};

// Get teacher dashboard
export const getTeacherDashboard = async (teacherId) => {
  const response = await axios.get(`${API_URL}/${teacherId}/dashboard`);
  return response.data;
};

// Create a new course
export const createCourse = async (teacherId, courseData) => {
  const response = await axios.post(`${API_URL}/${teacherId}/courses`, courseData);
  return response.data;
};

// Update a course
export const updateCourse = async (teacherId, courseId, courseData) => {
  const response = await axios.put(`${API_URL}/${teacherId}/courses/${courseId}`, courseData);
  return response.data;
};

// Delete a course
export const deleteCourse = async (teacherId, courseId) => {
  const response = await axios.delete(`${API_URL}/${teacherId}/courses/${courseId}`);
  return response.data;
};

// Add a chapter to a course
export const addChapter = async (teacherId, courseId, chapterData) => {
  const response = await axios.post(`${API_URL}/${teacherId}/courses/${courseId}/chapters`, chapterData);
  return response.data;
};

// Update a chapter
export const updateChapter = async (teacherId, courseId, chapterId, chapterData) => {
  const response = await axios.put(`${API_URL}/${teacherId}/courses/${courseId}/chapters/${chapterId}`, chapterData);
  return response.data;
};

// Delete a chapter
export const deleteChapter = async (teacherId, courseId, chapterId) => {
  const response = await axios.delete(`${API_URL}/${teacherId}/courses/${courseId}/chapters/${chapterId}`);
  return response.data;
};

// Add a video to a chapter
export const addVideo = async (teacherId, courseId, chapterId, videoData) => {
  const response = await axios.post(`${API_URL}/${teacherId}/courses/${courseId}/chapters/${chapterId}/videos`, videoData);
  return response.data;
};

// Update a video
export const updateVideo = async (teacherId, courseId, videoId, videoData) => {
  const response = await axios.put(`${API_URL}/${teacherId}/courses/${courseId}/videos/${videoId}`, videoData);
  return response.data;
};

// Delete a video
export const deleteVideo = async (teacherId, courseId, videoId) => {
  const response = await axios.delete(`${API_URL}/${teacherId}/courses/${courseId}/videos/${videoId}`);
  return response.data;
};
