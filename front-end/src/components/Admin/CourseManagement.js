import { useState, useEffect } from "react";
import { Eye, Trash } from "lucide-react";
import { getAllCourses, deleteCourse } from "../../middleware/admin/courseManagementAPI";
import "./management-styles.scss"; // Import the new styles

export function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showPopup = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // 📦 Tải danh sách khóa học
  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
      showPopup("Không thể tải danh sách khóa học", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // 🗑️ Xóa khóa học
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này không?")) return;
    try {
      await deleteCourse(courseId);
      showPopup("Đã xóa khóa học thành công", "success");
      setCourses((prev) => prev.filter((c) => c.courseID !== courseId));
    } catch (error) {
      console.error("Error deleting course:", error);
      showPopup("Không thể xóa khóa học", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading-spinner">
        <div className="admin-spinner"></div>
        <p>Đang tải dữ liệu khóa học...</p>
      </div>
    );
  }

  return (
    <div className="management-page-container">
      {/* Toast Notification can be a shared component later */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="management-card">
        <div className="management-card-header">
          <h2 className="card-title">Quản lý khóa học</h2>
          <p className="card-description">Tổng số: {courses.length} khóa học</p>
        </div>

        <div className="management-card-content">
          <table className="management-table">
            <thead>
              <tr>
                <th>Tên khóa học</th>
                <th>Mô tả</th>
                <th>Giảng viên</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.courseID}>
                  <td className="font-bold">{course.courseName}</td>
                  <td>{course.courseDescription}</td>
                  <td>{course.teacherName}</td>
                  <td>{new Date(course.createAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="action-button">
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDeleteCourse(course.courseID)}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CourseManagement;
