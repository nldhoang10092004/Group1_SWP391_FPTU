/**
 * API Endpoints - Centralized endpoint definitions
 */

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    SIGNOUT: '/auth/signout',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },

  // User Profile
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
    AVATAR: '/profile/avatar'
  },

  // Courses
  COURSES: {
    LIST: '/courses',
    GET: (id) => `/courses/${id}`,
    CREATE: '/courses',
    UPDATE: (id) => `/courses/${id}`,
    DELETE: (id) => `/courses/${id}`,
    ENROLL: '/enroll'
  },

  // Lessons
  LESSONS: {
    LIST: (courseId) => `/courses/${courseId}/lessons`,
    GET: (id) => `/lessons/${id}`,
    CREATE: '/lessons',
    UPDATE: (id) => `/lessons/${id}`,
    DELETE: (id) => `/lessons/${id}`
  },

  // Progress
  PROGRESS: {
    COURSE: (courseId) => `/progress/course/${courseId}`,
    LESSON: '/progress/lesson',
    SAVE: '/progress/save'
  },

  // Subscription
  SUBSCRIPTION: {
    ACTIVATE: '/subscription/activate',
    CANCEL: '/subscription/cancel',
    STATUS: '/subscription/status'
  },

  // Writing
  WRITING: {
    SUBMIT: '/writing/submit',
    FEEDBACK: (submissionId) => `/writing/${submissionId}`
  },

  // Requests
  REQUESTS: {
    LIST: '/requests/my',
    CREATE: '/requests',
    UPDATE: (id) => `/requests/${id}`,
    DELETE: (id) => `/requests/${id}`
  },

  // Admin
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    REQUESTS: '/admin/requests',
    COURSES: '/admin/courses',
    REVENUE: '/admin/revenue'
  },

  // Teacher
  TEACHER: {
    COURSES: '/teacher/courses',
    STUDENTS: '/teacher/students',
    STATS: '/teacher/stats'
  }
};
