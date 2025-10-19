/**
 * API Services - Business logic layer for API calls
 * All API interactions should go through these services
 */

import { apiClient } from './apiClient.js';
import { ENDPOINTS } from './endpoints.js';

// Authentication Services
export const authApi = {
  signIn: (email, password) => 
    apiClient.post(ENDPOINTS.AUTH.SIGNIN, { email, password }),

  signUp: (userData) => 
    apiClient.post(ENDPOINTS.AUTH.SIGNUP, userData),

  signOut: () => 
    apiClient.post(ENDPOINTS.AUTH.SIGNOUT),

  resetPassword: (email) => 
    apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { email }),

  verifyEmail: (token) => 
    apiClient.post(ENDPOINTS.AUTH.VERIFY_EMAIL, { token })
};

// Profile Services
export const profileApi = {
  get: () => 
    apiClient.get(ENDPOINTS.PROFILE.GET),

  update: (updates) => 
    apiClient.put(ENDPOINTS.PROFILE.UPDATE, updates),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post(ENDPOINTS.PROFILE.AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Course Services
export const courseApi = {
  list: () => 
    apiClient.get(ENDPOINTS.COURSES.LIST),

  get: (id) => 
    apiClient.get(ENDPOINTS.COURSES.GET(id)),

  create: (courseData) => 
    apiClient.post(ENDPOINTS.COURSES.CREATE, courseData),

  update: (id, updates) => 
    apiClient.put(ENDPOINTS.COURSES.UPDATE(id), updates),

  delete: (id) => 
    apiClient.delete(ENDPOINTS.COURSES.DELETE(id)),

  enroll: (courseId) => 
    apiClient.post(ENDPOINTS.COURSES.ENROLL, { courseId })
};

// Lesson Services
export const lessonApi = {
  list: (courseId) => 
    apiClient.get(ENDPOINTS.LESSONS.LIST(courseId)),

  get: (id) => 
    apiClient.get(ENDPOINTS.LESSONS.GET(id)),

  create: (lessonData) => 
    apiClient.post(ENDPOINTS.LESSONS.CREATE, lessonData),

  update: (id, updates) => 
    apiClient.put(ENDPOINTS.LESSONS.UPDATE(id), updates),

  delete: (id) => 
    apiClient.delete(ENDPOINTS.LESSONS.DELETE(id))
};

// Progress Services
export const progressApi = {
  getCourseProgress: (courseId) => 
    apiClient.get(ENDPOINTS.PROGRESS.COURSE(courseId)),

  saveLessonProgress: (progressData) => 
    apiClient.post(ENDPOINTS.PROGRESS.LESSON, progressData),

  saveProgress: (data) => 
    apiClient.post(ENDPOINTS.PROGRESS.SAVE, data)
};

// Subscription Services
export const subscriptionApi = {
  activate: (planId) => 
    apiClient.post(ENDPOINTS.SUBSCRIPTION.ACTIVATE, { planId }),

  cancel: () => 
    apiClient.post(ENDPOINTS.SUBSCRIPTION.CANCEL),

  getStatus: () => 
    apiClient.get(ENDPOINTS.SUBSCRIPTION.STATUS)
};

// Writing Services
export const writingApi = {
  submit: (taskId, content, wordCount) => 
    apiClient.post(ENDPOINTS.WRITING.SUBMIT, { taskId, content, wordCount }),

  getFeedback: (submissionId) => 
    apiClient.get(ENDPOINTS.WRITING.FEEDBACK(submissionId))
};

// Request Services
export const requestApi = {
  list: () => 
    apiClient.get(ENDPOINTS.REQUESTS.LIST),

  create: (requestData) => 
    apiClient.post(ENDPOINTS.REQUESTS.CREATE, requestData),

  update: (id, updates) => 
    apiClient.put(ENDPOINTS.REQUESTS.UPDATE(id), updates),

  delete: (id) => 
    apiClient.delete(ENDPOINTS.REQUESTS.DELETE(id))
};

// Admin Services
export const adminApi = {
  getStats: () => 
    apiClient.get(ENDPOINTS.ADMIN.STATS),

  getUsers: () => 
    apiClient.get(ENDPOINTS.ADMIN.USERS),

  getRequests: () => 
    apiClient.get(ENDPOINTS.ADMIN.REQUESTS),

  getCourses: () => 
    apiClient.get(ENDPOINTS.ADMIN.COURSES),

  getRevenue: () => 
    apiClient.get(ENDPOINTS.ADMIN.REVENUE)
};

// Teacher Services
export const teacherApi = {
  getCourses: () => 
    apiClient.get(ENDPOINTS.TEACHER.COURSES),

  getStudents: () => 
    apiClient.get(ENDPOINTS.TEACHER.STUDENTS),

  getStats: () => 
    apiClient.get(ENDPOINTS.TEACHER.STATS)
};

// Export all services as a single object
export const api = {
  auth: authApi,
  profile: profileApi,
  course: courseApi,
  lesson: lessonApi,
  progress: progressApi,
  subscription: subscriptionApi,
  writing: writingApi,
  request: requestApi,
  admin: adminApi,
  teacher: teacherApi
};
