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
import "../Admin/admin-dashboard-styles.scss";
import "./teacher-dashboard.scss";
import {
  getTeacherCourses,
  createTeacherCourse,
  deleteTeacherCourse,
  updateTeacherCourse,
} from "../../middleware/teacher/courseTeacherAPI";
import {
  getFlashcardSetsByCourse,
  deleteFlashcardSet,
} from "../../middleware/teacher/flashcardTeacherAPI";
import {
  getQuizzesByCourse,
  createQuiz,
  deleteQuiz,
  updateQuiz,
} from "../../middleware/teacher/quizTeacherAPI";
import { TeacherFeedbackView } from "./TeacherFeedbackView";
import { jwtDecode } from "jwt-decode";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeMenu, setActiveMenu] = useState("khoahoc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [showEditQuizModal, setShowEditQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const [newCourse, setNewCourse] = useState({
    courseName: "",
    description: "",
    courseLevel: 1,
  });

  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    quizType: 1,
    courseID: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showPopup = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const getQuizTypeName = (type) => {
    switch (type) {
      case 1:
        return "Trắc nghiệm (Multiple Choice)";
      case 2:
        return "Listening";
      case 3:
        return "Reading";
      case 4:
        return "Writing";
      case 5:
        return "Speaking";
      default:
        return "Không xác định";
    }
  };

  // 🔐 Lấy teacherId từ token
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

  // 🟢 Load course / flashcard / quiz
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const courseData = await getTeacherCourses();
        const filteredCourses = teacherId
          ? courseData.filter((c) => c.teacherID === teacherId)
          : courseData;

        setCourses(filteredCourses);

        if (filteredCourses.length > 0) {
          const [flashcardData, quizData] = await Promise.all([
            Promise.all(
              filteredCourses.map((c) =>
                getFlashcardSetsByCourse(c.courseID)
              )
            ),
            Promise.all(
              filteredCourses.map((c) => getQuizzesByCourse(c.courseID))
            ),
          ]);

          // 🔧 Ghép flashcard với courseName (dùng index vì API flashcard có thể không trả courseID)
          const allFlashcards = flashcardData.flatMap((setList, idx) =>
            (setList || []).map((f) => ({
              ...f,
              courseID: f.courseID || filteredCourses[idx].courseID,
              courseName: filteredCourses[idx].courseName,
            }))
          );

          // 🔧 Ghép quiz với courseName (fix lỗi courseName bị trống)
          const allQuizzes = quizData.flatMap((quizList, idx) =>
            (quizList || []).map((q) => ({
              ...q,
              courseID: q.courseID || filteredCourses[idx].courseID,
              courseName: filteredCourses[idx].courseName,
            }))
          );

          setFlashcards(
            teacherId
              ? allFlashcards.filter((f) => f.teacherID === teacherId)
              : allFlashcards
          );

          setQuizzes(
            teacherId
              ? allQuizzes.filter((q) => q.teacherID === teacherId)
              : allQuizzes
          );
        }
      } catch (err) {
        console.error("❌ Lỗi load dữ liệu:", err);
        setError(err.message || "Không thể tải dữ liệu");
        showPopup(err.message || "Không thể tải dữ liệu", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId, reloadTrigger]);

  // 🟢 Course handlers
  const handleCreateCourse = async () => {
    if (!newCourse.courseName.trim()) {
      showPopup("Vui lòng nhập tên khóa học!", "error");
      return;
    }
    try {
      const payload = {
        ...newCourse,
        teacherID: teacherId,
        courseLevel: Number(newCourse.courseLevel),
      };
      await createTeacherCourse(payload);
      showPopup("Tạo khóa học thành công!", "success");
      setNewCourse({ courseName: "", description: "", courseLevel: 1 });
      setShowCreateModal(false);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      showPopup(err.message || "Không thể tạo khóa học.", "error");
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse || !editingCourse.courseName.trim()) {
      showPopup("Vui lòng nhập tên khóa học!", "error");
      return;
    }
    try {
      const payload = {
        courseName: editingCourse.courseName,
        description: editingCourse.description,
        courseLevel: Number(editingCourse.courseLevel),
      };
      await updateTeacherCourse(editingCourse.courseID, payload);
      showPopup("Cập nhật khóa học thành công!", "success");
      setShowEditModal(false);
      setEditingCourse(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (error) {
      showPopup(error.message || "Không thể cập nhật khóa học.", "error");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này không?")) return;
    try {
      await deleteTeacherCourse(courseId);
      showPopup("Xóa khóa học thành công!", "success");
      setReloadTrigger((prev) => prev + 1);
    } catch (error) {
      showPopup(error.message || "Không thể xóa khóa học.", "error");
    }
  };

  // 🟢 Flashcard handlers
  const handleDeleteFlashcard = async (setId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bộ flashcard này không?")) return;
    try {
      await deleteFlashcardSet(setId);
      showPopup("Xóa flashcard thành công!", "success");
      setReloadTrigger((prev) => prev + 1);
    } catch (error) {
      showPopup(error.message || "Không thể xóa flashcard.", "error");
    }
  };

  // 🟢 Quiz handlers

  // Xóa quiz
  const handleDeleteQuiz = async (quizId) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa quiz này không? Tất cả câu hỏi, nhóm và kết quả liên quan có thể bị ảnh hưởng!"
      )
    )
      return;

    try {
      console.log("🗑️ Đang xóa quiz ID:", quizId);
      await deleteQuiz(quizId);
      console.log("✅ Xóa quiz thành công");
      showPopup("Xóa quiz thành công!", "success");
      setReloadTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Lỗi xóa quiz:", error);
      console.error("Chi tiết lỗi:", error.response?.data);

      const errorData = error.response?.data;
      const errorMsg = errorData?.error || errorData?.message || error.message;

      if (
        error.response?.status === 409 ||
        errorMsg?.includes("constraint") ||
        errorMsg?.includes("foreign key")
      ) {
        showPopup(
          "Không thể xóa quiz này vì đang có dữ liệu liên quan (học sinh đã làm bài hoặc có câu hỏi liên kết).",
          "error"
        );
      } else if (error.response?.status === 404) {
        showPopup("Quiz không tồn tại hoặc đã bị xóa.", "error");
        setReloadTrigger((prev) => prev + 1);
      } else if (error.response?.status === 403) {
        showPopup("Bạn không có quyền xóa quiz này.", "error");
      } else {
        showPopup(
          errorMsg || "Không thể xóa quiz. Vui lòng thử lại sau.",
          "error"
        );
      }
    }
  };

  // Cập nhật quiz từ Modal Edit
  const handleUpdateQuiz = async () => {
    if (!editingQuiz || !editingQuiz.title?.trim()) {
      showPopup("Vui lòng nhập tiêu đề quiz!", "error");
      return;
    }

    try {
      await updateQuiz(editingQuiz.quizID, {
        title: editingQuiz.title,
        description: editingQuiz.description,
        quizType: editingQuiz.quizType,
        isActive: editingQuiz.isActive,
      });

      showPopup("Cập nhật quiz thành công!", "success");
      setShowEditQuizModal(false);
      setEditingQuiz(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Lỗi cập nhật quiz:", error);
      showPopup(
        error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật quiz.",
        "error"
      );
    }
  };

  // ✅ Toggle bật/tắt trạng thái quiz ngay trên card
  const handleToggleQuizStatus = async (quiz) => {
    try {
      await updateQuiz(quiz.quizID, {
        title: quiz.title,
        description: quiz.description,
        quizType: quiz.quizType,
        isActive: !quiz.isActive,
      });

      showPopup(
        !quiz.isActive ? "Đã bật trạng thái quiz!" : "Đã tắt trạng thái quiz!",
        "success"
      );

      // Cập nhật state local để không cần reload toàn bộ
      setQuizzes((prev) =>
        prev.map((q) =>
          q.quizID === quiz.quizID ? { ...q, isActive: !quiz.isActive } : q
        )
      );
    } catch (error) {
      console.error("❌ Lỗi toggle trạng thái quiz:", error);
      showPopup(
        error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật trạng thái quiz.",
        "error"
      );
    }
  };

  const handleCreateQuiz = async () => {
    if (!newQuiz.title.trim()) {
      showPopup("Vui lòng nhập tiêu đề quiz!", "error");
      return;
    }
    if (!newQuiz.courseID) {
      showPopup("Vui lòng chọn khóa học!", "error");
      return;
    }

    try {
      await createQuiz(newQuiz);
      console.log("📤 Quiz được tạo:", newQuiz);
      showPopup("Tạo quiz thành công!", "success");
      setShowCreateQuizModal(false);
      setNewQuiz({ title: "", description: "", quizType: 1, courseID: "" });
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      showPopup(err.message || "Không thể tạo quiz", "error");
    }
  };

  const handleViewCourseDetail = (courseId) =>
    navigate(`/teacher/coursedetail/${courseId}`);

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
                <p className="card-description">
                  Tổng số: {courses.length} khóa học
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="primary-button"
              >
                <Plus size={18} /> Tạo khóa học mới
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {courses.map((course) => (
                <div key={course.courseID} className="teacher-item-card">
                  <h5 className="font-bold text-lg">{course.courseName}</h5>
                  <p className="text-sm text-gray-600 flex-grow">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="flex items-center text-sm">
                      <Star size={14} className="text-yellow-500 mr-1" />{" "}
                      {course.rating || "N/A"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleViewCourseDetail(course.courseID)
                        }
                        className="action-button"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setShowEditModal(true);
                        }}
                        className="action-button"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.courseID)}
                        className="action-button delete-button"
                      >
                        <Trash size={16} />
                      </button>
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
                <p className="card-description">
                  Tổng số: {flashcards.length} bộ
                </p>
              </div>
              <button
                onClick={() => navigate("/teacher/create")}
                className="primary-button"
              >
                <Plus size={18} /> Tạo flashcard mới
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {flashcards.map((set) => (
                <div key={set.setID} className="teacher-item-card">
                  <h5 className="font-bold text-lg">{set.title}</h5>
                  <p className="text-sm text-gray-600">{set.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Khóa học: {set.courseName || "N/A"}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() =>
                        navigate(`/teacher/flashcards/${set.setID}`)
                      }
                      className="action-button"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/edit/${set.setID}`)}
                      className="action-button"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFlashcard(set.setID)}
                      className="action-button delete-button"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "quiz":
        return (
          <div className="management-card">
            <div className="management-card-header flex justify-between items-center">
              <div>
                <h2 className="card-title">Danh sách Quiz</h2>
                <p className="card-description">
                  Tổng số: {quizzes.length} quiz
                </p>
              </div>
              <button
                onClick={() => setShowCreateQuizModal(true)}
                className="primary-button"
              >
                <Plus size={18} /> Tạo Quiz mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {quizzes.map((quiz) => (
                <div key={quiz.quizID} className="teacher-item-card">
                  <h5 className="font-bold text-lg">{quiz.title}</h5>
                  <p className="text-sm text-gray-600 flex-grow">
                    {quiz.description || "Chưa có mô tả"}
                  </p>

                  <p className="text-sm text-gray-600 mt-2">
                    Loại: {getQuizTypeName(quiz.quizType)}
                  </p>

                  {/* Trạng thái */}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm">
                      <span
                        className={`px-2 py-1 rounded text-white text-xs ${
                          quiz.isActive ? "bg-green-600" : "bg-gray-500"
                        }`}
                      >
                        {quiz.isActive ? "✓ Đang hoạt động" : "⊗ Đã tắt"}
                      </span>
                    </p>

                    
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Khóa học: {quiz.courseName || "N/A"}
                  </p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() =>
                        navigate(`/teacher/quizdetail/${quiz.quizID}`)
                      }
                      className="action-button"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setEditingQuiz(quiz);
                        setShowEditQuizModal(true);
                      }}
                      className="action-button"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteQuiz(quiz.quizID)}
                      className="action-button delete-button"
                      title="Xóa quiz"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "danhgia":
        return <TeacherFeedbackView />;

      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-layout">
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
                  className={`admin-sidebar-menu-item ${
                    isActive ? "active" : ""
                  }`}
                >
                  <Icon size={20} className="admin-sidebar-menu-icon" />
                  <span className="admin-sidebar-menu-label">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="admin-main-content">
        <div className="admin-main-header">
          <div className="admin-main-header-wrapper">
            <div>
              <h2 className="admin-main-header-title">
                {menuItems.find((item) => item.key === activeMenu)?.label ||
                  "Dashboard"}
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

      {/* Modal tạo khóa học */}
      {showCreateModal && (
        <div
          className="management-modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="management-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="card-title mb-6">Tạo khóa học mới</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Tên khóa học"
                value={newCourse.courseName}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, courseName: e.target.value })
                }
                className="form-input"
              />
              <textarea
                placeholder="Mô tả khóa học"
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
                className="form-input"
                rows="3"
              ></textarea>
              <select
                value={newCourse.courseLevel}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    courseLevel: Number(e.target.value),
                  })
                }
                className="form-input"
              >
                <option value={1}>Level 1</option>
                <option value={2}>Level 2</option>
                <option value={3}>Level 3</option>
                <option value={4}>Level 4</option>
              </select>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="secondary-button"
              >
                Hủy
              </button>
              <button onClick={handleCreateCourse} className="primary-button">
                Tạo mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa khóa học */}
      {showEditModal && (
        <div
          className="management-modal-overlay"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="management-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="card-title mb-6">Chỉnh sửa khóa học</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Tên khóa học"
                value={editingCourse?.courseName || ""}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    courseName: e.target.value,
                  })
                }
                className="form-input"
              />
              <textarea
                placeholder="Mô tả khóa học"
                value={editingCourse?.description || ""}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    description: e.target.value,
                  })
                }
                className="form-input"
                rows="3"
              ></textarea>
              <select
                value={editingCourse?.courseLevel || 1}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    courseLevel: Number(e.target.value),
                  })
                }
                className="form-input"
              >
                <option value={1}>Level 1</option>
                <option value={2}>Level 2</option>
                <option value={3}>Level 3</option>
                <option value={4}>Level 4</option>
              </select>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="secondary-button"
              >
                Hủy
              </button>
              <button onClick={handleUpdateCourse} className="primary-button">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo Quiz */}
      {showCreateQuizModal && (
        <div
          className="management-modal-overlay"
          onClick={() => setShowCreateQuizModal(false)}
        >
          <div
            className="management-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="card-title mb-6">Tạo Quiz mới</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Tiêu đề Quiz"
                value={newQuiz.title}
                onChange={(e) =>
                  setNewQuiz({ ...newQuiz, title: e.target.value })
                }
                className="form-input"
              />
              <textarea
                placeholder="Mô tả Quiz"
                value={newQuiz.description}
                onChange={(e) =>
                  setNewQuiz({ ...newQuiz, description: e.target.value })
                }
                className="form-input"
                rows="3"
              ></textarea>

              <select
                value={newQuiz.quizType}
                onChange={(e) =>
                  setNewQuiz({
                    ...newQuiz,
                    quizType: Number(e.target.value),
                  })
                }
                className="form-input"
              >
                <option value="">-- Chọn loại quiz --</option>
                <option value={1}>Trắc nghiệm (Multiple Choice)</option>
                <option value={2}>Listening</option>
                <option value={3}>Reading</option>
                <option value={4}>Writing</option>
                <option value={5}>Speaking</option>
              </select>

              <select
                value={newQuiz.courseID}
                onChange={(e) =>
                  setNewQuiz({
                    ...newQuiz,
                    courseID: Number(e.target.value),
                  })
                }
                className="form-input"
              >
                <option value="">-- Chọn khóa học --</option>
                {courses.map((c) => (
                  <option key={c.courseID} value={c.courseID}>
                    {c.courseName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowCreateQuizModal(false)}
                className="secondary-button"
              >
                Hủy
              </button>
              <button onClick={handleCreateQuiz} className="primary-button">
                Tạo mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa Quiz */}
      {showEditQuizModal && editingQuiz && (
        <div
          className="management-modal-overlay"
          onClick={() => setShowEditQuizModal(false)}
        >
          <div
            className="management-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="card-title mb-6">Chỉnh sửa Quiz</h3>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Tiêu đề Quiz"
                value={editingQuiz.title || ""}
                onChange={(e) =>
                  setEditingQuiz({ ...editingQuiz, title: e.target.value })
                }
                className="form-input"
              />

              <textarea
                placeholder="Mô tả Quiz"
                value={editingQuiz.description || ""}
                onChange={(e) =>
                  setEditingQuiz({
                    ...editingQuiz,
                    description: e.target.value,
                  })
                }
                className="form-input"
                rows="3"
              ></textarea>

              <select
                value={editingQuiz.quizType || 1}
                onChange={(e) =>
                  setEditingQuiz({
                    ...editingQuiz,
                    quizType: Number(e.target.value),
                  })
                }
                className="form-input"
              >
                <option value={1}>Trắc nghiệm</option>
                <option value={2}>Listening</option>
                <option value={3}>Reading</option>
                <option value={4}>Writing</option>
                <option value={5}>Speaking</option>
              </select>

              {/* Trạng thái hoạt động */}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={editingQuiz.isActive ?? true}
                  onChange={(e) =>
                    setEditingQuiz({
                      ...editingQuiz,
                      isActive: e.target.checked,
                    })
                  }
                />
                <span>Đang hoạt động</span>
              </label>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowEditQuizModal(false)}
                className="secondary-button"
              >
                Hủy
              </button>
              <button onClick={handleUpdateQuiz} className="primary-button">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="toast-overlay">
          <div className={`toast-popup ${toast.type}`}>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
