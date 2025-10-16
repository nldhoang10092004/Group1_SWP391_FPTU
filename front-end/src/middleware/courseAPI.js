// middleware/courseAPI.js
const BASE_URL = "https://localhost:7010/api/public";

// Lấy tất cả course
export const getCourses = async () => {
  try {
    const res = await fetch(`${BASE_URL}/course`);
    if (!res.ok) throw new Error("Failed to fetch courses");
    
    const data = await res.json();
    console.log("API Response:", data); // Debug log
    
    return data; // Trả về { courses: [...] }
  } catch (error) {
    console.error("Error in getCourses:", error);
    throw error;
  }
};

// Lấy course theo ID
export const getCourseById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/course/${id}`);
    if (!res.ok) throw new Error("Failed to fetch course by ID");
    
    const data = await res.json();
    console.log("Course Detail:", data); // Debug log
    
    return data;
  } catch (error) {
    console.error("Error in getCourseById:", error);
    throw error;
  }
};