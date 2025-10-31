// src/middleware/teacher/courseTeacherAPI.js
import axios from "axios";

const API_BASE = `${process.env.REACT_APP_API_URL}/api/teacher/course`;

/* =====================
 * ⚙️ Helper: Header có token
 * ===================== */
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.warn("⚠️ Không tìm thấy token trong localStorage");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  };
};

/* =====================
 * 📘 COURSE API
 * ===================== */

// ✅ Lấy tất cả khóa học của giáo viên
export const getTeacherCourses = async () => {
  try {
    const res = await axios.get(`${API_BASE}`, getAuthHeader());
    console.log("📘 getTeacherCourses - Raw response:", res.data);
    
    // Xử lý linh hoạt: nếu có .courses thì lấy, không thì lấy data
    const coursesList = res.data.courses || res.data;
    
    console.log("📘 getTeacherCourses - Courses list:", coursesList);
    console.log("📘 Is Array?", Array.isArray(coursesList));
    
    return Array.isArray(coursesList) ? coursesList : [];
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách khóa học:", error);
    throw error;
  }
};

// ✅ Lấy chi tiết 1 khóa học
export const getTeacherCourseDetail = async (courseId) => {
  try {
    console.log("🔍 Đang lấy chi tiết khóa học ID:", courseId);

    console.log("useParams courseId:", courseId);

    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      throw new Error("courseId không hợp lệ");
    }
    
    const res = await axios.get(`${API_BASE}/${courseId}`, getAuthHeader());
    console.log("✅ Chi tiết khóa học:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi lấy chi tiết khóa học:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể tải chi tiết khóa học");
  }
};

// ✅ Tạo mới khóa học
export const createTeacherCourse = async (courseData) => {
  try {
    const res = await axios.post(API_BASE, courseData, getAuthHeader());
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi tạo khóa học:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể tạo khóa học mới");
  }
};

// ✅ Cập nhật khóa học
export const updateTeacherCourse = async (courseId, courseData) => {
  try {
    console.log("🔄 Đang cập nhật khóa học ID:", courseId, "với data:", courseData);
    
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      throw new Error("courseId không hợp lệ");
    }
    
    const res = await axios.put(`${API_BASE}/${courseId}`, courseData, getAuthHeader());
    console.log("✅ Cập nhật thành công:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi cập nhật khóa học:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể cập nhật khóa học");
  }
};

// ✅ Xóa khóa học
export const deleteTeacherCourse = async (courseId) => {
  try {
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      throw new Error("courseId không hợp lệ");
    }
    
    const res = await axios.delete(`${API_BASE}/${courseId}`, getAuthHeader());
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi xóa khóa học:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể xóa khóa học");
  }
};

/* =====================
 * 📚 CHAPTER API
 * ===================== */

// ✅ Tạo chương trong khóa học
export const createChapter = async (courseId, chapterData) => {
  try {
    const res = await axios.post(
      `${API_BASE}/${courseId}/chapter`,
      chapterData,
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi tạo chương:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể tạo chương");
  }
};

// ✅ Cập nhật chương
export const updateChapter = async (chapterId, chapterData) => {
  try {
    const res = await axios.put(
      `${API_BASE}/chapter/${chapterId}`,
      chapterData,
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi cập nhật chương:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể cập nhật chương");
  }
};

// ✅ Xóa chương
export const deleteChapter = async (chapterId) => {
  try {
    const res = await axios.delete(
      `${API_BASE}/chapter/${chapterId}`,
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi xóa chương:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể xóa chương");
  }
};

/* =====================
 * 🎬 VIDEO API
 * ===================== */

// ✅ Tạo video trong chương
export const createVideo = async (chapterId, videoData) => {
  try {
    const res = await axios.post(
      `${API_BASE}/${chapterId}/video`,
      videoData,
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi tạo video:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể tạo video");
  }
};

// ✅ Xóa video
export const deleteVideo = async (videoId) => {
  try {
    const res = await axios.delete(
      `${API_BASE}/video/${videoId}`,
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi xóa video:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể xóa video");
  }
};