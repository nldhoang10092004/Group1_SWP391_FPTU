// middleware/courseAPI.js
const BASE_URL = "https://beerier-superlogically-maxwell.ngrok-free.dev/api";

// ============= COURSE APIs =============
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'

  };
};
// Lấy tất cả course
export const getCourses = async () => {
  try {
    const res = await fetch(`${BASE_URL}/user/course`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    if (!res.ok) throw new Error("Failed to fetch courses");
    
    const data = await res.json();
    console.log("API Response:", data); 
    
    return data; 
  } catch (error) {
    console.error("Error in getCourses:", error);
    throw error;
  }
};

// Lấy course theo ID
export const getCourseById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/user/course/${id}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    if (!res.ok) throw new Error("Failed to fetch course by ID");
    
    const data = await res.json();
    console.log("Course Detail:", data); // Debug log
    
    return data;
  } catch (error) {
    console.error("Error in getCourseById:", error);
    throw error;
  }
};

// ============= VIDEO APIs ============

// Lấy video theo ID (có check authentication và membership)
export const getVideoById = async (videoId) => {
  try {
    const headers = getAuthHeaders();
    
    // Add authorization token if user is logged in
    const authToken = localStorage.getItem('accessToken');
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const res = await fetch(`${BASE_URL}/public/video/${videoId}`, {
      method: 'GET',
      headers: headers
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN');
      }
      throw new Error("Failed to fetch video");
    }
    
    const data = await res.json();
    console.log("Video Detail:", data); // Debug log
    
    return data;
  } catch (error) {
    console.error("Error in getVideoById:", error);
    throw error;
  }
};

export const getAllCoursesWithDetails = async () => {
  try {
    // 1. Lấy danh sách courses
    const response = await getCourses();
    const coursesList = response?.courses || [];
    
    // 2. Fetch chi tiết từng course song song
    const detailedCoursesPromises = coursesList.map(course => 
      getCourseById(course.courseID)
    );
    
    const detailedCourses = await Promise.all(detailedCoursesPromises);
    
    console.log("All courses with details:", detailedCourses);
    return detailedCourses;
  } catch (error) {
    console.error("Error in getAllCoursesWithDetails:", error);
    throw error;
  }
};