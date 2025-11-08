import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  Brain,
  Star,
  Plus,
  Eye,
  Edit,
  Trash,
  X,
} from "lucide-react";
import "../Admin/admin-dashboard-styles.scss"; // Re-use the admin styles
import "./teacher-dashboard.scss"; // Add specific teacher styles if needed
import {
  getTeacherCourses,
  createTeacherCourse,
  deleteTeacherCourse,
} from "../../middleware/teacher/courseTeacherAPI";
import {
  getFlashcardSetsByCourse,
  deleteFlashcardSet,
} from "../../middleware/teacher/flashcardTeacherAPI";
import { getQuizzesByCourse } from "../../middleware/QuizAPI";
import { jwtDecode } from "jwt-decode";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [activeMenu, setActiveMenu] = useState("khoahoc");
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: "",
    description: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showPopup = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const token = localStorage.getItem("accessToken");
  let teacherId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      teacherId = decoded?.id || decoded?.teacherId || decoded?.UserId;
    } catch (err) {
      console.error("❌ Lỗi giải mã token:", err);
      showPopup("Lỗi xác thực người dùng", "error");
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const courseData = await getTeacherCourses();
        const filteredCourses = teacherId ? courseData.filter((c) => c.teacherID === teacherId) : courseData;
        setCourses(filteredCourses);

        if (filteredCourses.length > 0) {
          const [flashcardData, quizData] = await Promise.all([
            Promise.all(filteredCourses.map(c => getFlashcardSetsByCourse(c.courseID))),
            Promise.all(filteredCourses.map(c => getQuizzesByCourse(c.courseID)))
          ]);

          const allFlashcards = flashcardData.flat().filter(f => f && (teacherId ? f.teacherID === teacherId : true));
          const allQuizzes = quizData.flat().filter(q => q && (teacherId ? q.teacherID === teacherId : true));

          setFlashcards(allFlashcards);
          setQuizzes(allQuizzes);
        }
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu");
        showPopup(err.message || "Không thể tải dữ liệu", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teacherId]);

  const handleCreateCourse = async () => {
    if (!newCourse.courseName.trim()) {
      showPopup("Vui lòng nhập tên khóa học!", "error");
      return;
    }
    try {
      const payload = { ...newCourse, teacherID: teacherId };
      const created = await createTeacherCourse(payload);
      setCourses((prev) => [...prev, created]);
      setNewCourse({ courseName: "", description: "" });
      setShowModal(false);
      showPopup("Tạo khóa học thành công!", "success");
    } catch (err) {
      showPopup(err.message || "Không thể tạo khóa học.", "error");
    }
  };

  const handleEditCourse = (courseId) => navigate(`/editcourse/${courseId}`);
  const handleViewCourseDetail = (courseId) => navigate(`/course/${courseId}`);

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này không?")) return;
    try {
      await deleteTeacherCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.courseID !== courseId));
      showPopup("Xóa khóa học thành công!", "success");
    } catch (error) {
      showPopup(error.message || "Không thể xóa khóa học.", "error");
    }
  };

  const handleDeleteFlashcard = async (setId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bộ flashcard này không?")) return;
    try {
      await deleteFlashcardSet(setId);
      setFlashcards((prev) => prev.filter((f) => f.setID !== setId));
      showPopup("Xóa flashcard thành công!", "success");
    } catch (error) {
      showPopup(error.message || "Không thể xóa flashcard.", "error");
    }
  };

  const menuItems = [
    { key: "khoahoc", icon: BookOpen, label: "Khóa học" },
    { key: "flashcards", icon: ClipboardList, label: "Flashcards" },
    { key: "quiz", icon: Brain, label: "Quiz" },
    { key: "danhgia", icon: Star, label: "Đánh giá" },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="admin-loading-spinner">
          <div className="admin-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      );
    }
    if (error) {
      return <div className="alert alert-danger">{error}</div>;
    }

    switch (activeMenu) {
      case "khoahoc":
        return (
          <div className="management-card">
            <div className="management-card-header flex justify-between items-center">
              <div>
                <h2 className="card-title">Danh sách khóa học</h2>
                <p className="card-description">Tổng số: {courses.length} khóa học</p>
              </div>
              <button onClick={() => setShowModal(true)} className="primary-button">
                <Plus size={18} /> Tạo khóa học mới
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {courses.map((course) => (
                <div key={course.courseID} className="teacher-item-card">
                  <h5 className="font-bold text-lg">{course.courseName}</h5>
                  <p className="text-sm text-gray-600 flex-grow">{course.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="flex items-center text-sm">
                      <Star size={14} className="text-yellow-500 mr-1" /> {course.rating || "N/A"}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewCourseDetail(course.courseID)} className="action-button"><Eye size={16} /></button>
                      <button onClick={() => handleEditCourse(course.courseID)} className="action-button"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteCourse(course.courseID)} className="action-button delete-button"><Trash size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "flashcards":
        return (
          <div className="management-card">
            <div className="management-card-header flex justify-between items-center">
              <div>
                <h2 className="card-title">Bộ Flashcards</h2>
                <p className="card-description">Tổng số: {flashcards.length} bộ</p>
              </div>
              <button onClick={() => navigate("/teacher/create")} className="primary-button">
                <Plus size={18} /> Tạo flashcard mới
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {flashcards.map((set) => (
                <div key={set.setID} className="teacher-item-card">
                  <h5 className="font-bold text-lg">{set.title}</h5>
                  <p className="text-sm text-gray-600 flex-grow">{set.description}</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => navigate(`/teacher/flashcards/${set.setID}`)} className="action-button"><Eye size={16} /></button>
                    <button onClick={() => navigate(`/teacher/edit/${set.setID}`)} className="action-button"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteFlashcard(set.setID)} className="action-button delete-button"><Trash size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "quiz":
        return (
          <div className="management-card">
            <div className="management-card-header">
              <h2 className="card-title">Danh sách Quiz</h2>
              <p className="card-description">Tổng số: {quizzes.length} quiz</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {quizzes.map((quiz) => (
                <div key={quiz.quizID} className="teacher-item-card">
                  <h5 className="font-bold text-lg">{quiz.title}</h5>
                  <p className="text-sm text-gray-600">Khóa học: {quiz.courseName}</p>
                  <button onClick={() => navigate(`/quiz/start/${quiz.quizID}`)} className="primary-button mt-4">Làm thử</button>
                </div>
              ))}
            </div>
          </div>
        );
      case "danhgia":
        return (
          <div className="management-card">
            <div className="management-card-header">
              <h2 className="card-title">Đánh giá</h2>
              <p className="card-description">Tính năng đang được phát triển.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h5 className="admin-sidebar-title">Teacher Panel</h5>
          <p className="admin-sidebar-subtitle">Bảng điều khiển</p>
        </div>
        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-menu-items">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveMenu(item.key)}
                  className={`admin-sidebar-menu-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={20} className="admin-sidebar-menu-icon" />
                  <span className="admin-sidebar-menu-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        <div className="admin-main-header">
          <div className="admin-main-header-wrapper">
            <div>
              <h2 className="admin-main-header-title">
                {menuItems.find((item) => item.key === activeMenu)?.label || "Dashboard"}
              </h2>
              <p className="admin-main-header-subtitle">
                Quản lý khóa học và tài nguyên của bạn
              </p>
            </div>
            <button onClick={() => navigate("/")} className="secondary-button">
              <X size={16} />
              <span>Về trang chủ</span>
            </button>
          </div>
        </div>
        <div className="admin-content-area">{renderContent()}</div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="management-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="management-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="card-title mb-6">Tạo khóa học mới</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Tên khóa học"
                value={newCourse.courseName}
                onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                className="form-input"
              />
              <textarea
                placeholder="Mô tả khóa học"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="form-input"
                rows="3"
              ></textarea>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShowModal(false)} className="secondary-button">Hủy</button>
              <button onClick={handleCreateCourse} className="primary-button">Tạo mới</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
