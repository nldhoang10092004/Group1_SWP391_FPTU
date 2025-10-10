import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert } from "react-bootstrap";
import { getTeacherCourses, createCourse, updateCourse, deleteCourse, addChapter, addVideo } from "../../api/teacherAPI";
import { useNavigate } from "react-router-dom";
import "./TeacherCourseManagement.scss";

const TeacherCourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "create", "edit", "chapter", "video"
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  
  // For demo, using hardcoded teacherId
  const teacherId = 1;

  // Form states
  const [formData, setFormData] = useState({
    courseName: "",
    description: "",
    courseLevel: 1,
    chapterName: "",
    videoName: "",
    videoURL: "",
    isPreview: false
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getTeacherCourses(teacherId);
      setCourses(data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setError("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (type, course = null) => {
    setModalType(type);
    setSelectedCourse(course);
    setError("");
    setSuccess("");
    
    if (type === "edit" && course) {
      setFormData({
        courseName: course.CourseName,
        description: course.Description || "",
        courseLevel: course.CourseLevel
      });
    } else {
      setFormData({
        courseName: "",
        description: "",
        courseLevel: 1,
        chapterName: "",
        videoName: "",
        videoURL: "",
        isPreview: false
      });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (modalType === "create") {
        await createCourse(teacherId, {
          CourseName: formData.courseName,
          Description: formData.description,
          CourseLevel: parseInt(formData.courseLevel)
        });
        setSuccess("Tạo khóa học thành công!");
      } else if (modalType === "edit" && selectedCourse) {
        await updateCourse(teacherId, selectedCourse.CourseID, {
          CourseName: formData.courseName,
          Description: formData.description
        });
        setSuccess("Cập nhật khóa học thành công!");
      }
      
      setTimeout(() => {
        handleCloseModal();
        fetchCourses();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này?")) {
      return;
    }

    try {
      await deleteCourse(teacherId, courseId);
      setSuccess("Xóa khóa học thành công!");
      fetchCourses();
    } catch (error) {
      setError("Không thể xóa khóa học");
    }
  };

  const getLevelLabel = (level) => {
    const labels = ["", "Nền tảng", "Cơ bản", "Trung cấp", "Chuyên sâu"];
    return labels[level] || "Unknown";
  };

  return (
    <div className="teacher-course-management">
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h1>Quản lý khóa học</h1>
            <p className="text-muted">Tạo và quản lý các khóa học của bạn</p>
          </Col>
          <Col xs="auto">
            <Button 
              variant="dark" 
              size="lg"
              onClick={() => handleShowModal("create")}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Tạo khóa học mới
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <h4>Bạn chưa có khóa học nào</h4>
              <p className="text-muted mb-3">Hãy tạo khóa học đầu tiên của bạn</p>
              <Button variant="dark" onClick={() => handleShowModal("create")}>
                Tạo khóa học mới
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Card className="courses-table-card">
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên khóa học</th>
                    <th>Cấp độ</th>
                    <th>Số chương</th>
                    <th>Số video</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.CourseID}>
                      <td>{course.CourseID}</td>
                      <td className="fw-semibold">{course.CourseName}</td>
                      <td>
                        <span className="badge bg-primary">
                          Level {course.CourseLevel} - {getLevelLabel(course.CourseLevel)}
                        </span>
                      </td>
                      <td>{course.ChapterCount}</td>
                      <td>{course.VideoCount}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleShowModal("edit", course)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteCourse(course.CourseID)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {/* Modal for Create/Edit Course */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {modalType === "create" ? "Tạo khóa học mới" : "Chỉnh sửa khóa học"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Tên khóa học</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </Form.Group>

              {modalType === "create" && (
                <Form.Group className="mb-3">
                  <Form.Label>Cấp độ</Form.Label>
                  <Form.Select
                    value={formData.courseLevel}
                    onChange={(e) => setFormData({...formData, courseLevel: e.target.value})}
                  >
                    <option value="1">Level 1 - Nền tảng</option>
                    <option value="2">Level 2 - Cơ bản</option>
                    <option value="3">Level 3 - Trung cấp</option>
                    <option value="4">Level 4 - Chuyên sâu</option>
                  </Form.Select>
                </Form.Group>
              )}

              <div className="d-grid gap-2">
                <Button variant="dark" type="submit">
                  {modalType === "create" ? "Tạo khóa học" : "Cập nhật"}
                </Button>
                <Button variant="outline-secondary" onClick={handleCloseModal}>
                  Hủy
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default TeacherCourseManagement;
