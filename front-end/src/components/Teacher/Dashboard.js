import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
  Spinner,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faLayerGroup,
  faTrashAlt,
  faEye,
  faEdit,
  faPlus,
  faClipboardList,
  faBrain,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import "./dashboard.scss";
import {
  getTeacherCourses,
  createTeacherCourse,
  updateTeacherCourse,
  deleteTeacherCourse,
} from "../../middleware/teacher/courseTeacherAPI";
import {
  getFlashcardSetsByCourse,
  deleteFlashcardSet,
} from "../../middleware/teacher/flashcardTeacherAPI";
import { getQuizzesByCourse } from "../../middleware/QuizAPI";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses] = useState(null);

  const [flashcards, setFlashcards] = useState([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(true);
  const [errorFlashcards, setErrorFlashcards] = useState(null);

  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [errorQuizzes, setErrorQuizzes] = useState(null);

  const [activeMenu, setActiveMenu] = useState("khoahoc");
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: "",
    description: "",
  });

  const token = localStorage.getItem("accessToken");
  let teacherId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      teacherId = decoded?.id || decoded?.teacherId || decoded?.UserId;
    } catch (err) {
      console.error("❌ Lỗi giải mã token:", err);
    }
  }

  /* -------------------- Lấy khóa học thật từ API -------------------- */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const data = await getTeacherCourses();
        const filtered = teacherId
          ? data.filter((c) => c.teacherID === teacherId)
          : data;
        setCourses(filtered);
      } catch (error) {
        setErrorCourses(error.message || "Không thể tải khóa học");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [teacherId]);

  /* -------------------- Lấy Flashcards -------------------- */
  useEffect(() => {
    const fetchCourseFlashcards = async () => {
      try {
        setLoadingFlashcards(true);
        const allFlashcards = [];
        for (const course of courses) {
          const res = await getFlashcardSetsByCourse(course.courseID);
          if (Array.isArray(res)) {
            const filtered = teacherId
              ? res.filter((f) => f.teacherID === teacherId)
              : res;
            allFlashcards.push(
              ...filtered.map((f) => ({
                ...f,
                courseName: course.courseName,
              }))
            );
          }
        }
        setFlashcards(allFlashcards);
      } catch (error) {
        setErrorFlashcards(error.message || "Không thể tải flashcards");
      } finally {
        setLoadingFlashcards(false);
      }
    };
    if (courses.length > 0) fetchCourseFlashcards();
  }, [courses, teacherId]);

  /* -------------------- Lấy Quiz -------------------- */
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoadingQuizzes(true);
        const allQuizzes = [];
        for (const course of courses) {
          const data = await getQuizzesByCourse(course.courseID);
          if (Array.isArray(data)) {
            const filtered = teacherId
              ? data.filter((q) => q.teacherID === teacherId)
              : data;
            allQuizzes.push(
              ...filtered.map((q) => ({
                ...q,
                courseName: course.courseName,
              }))
            );
          }
        }
        setQuizzes(allQuizzes);
      } catch (error) {
        setErrorQuizzes(error.message || "Không thể tải quiz");
      } finally {
        setLoadingQuizzes(false);
      }
    };
    if (courses.length > 0) fetchQuizzes();
  }, [courses, teacherId]);

  /* -------------------- CRUD khóa học -------------------- */
  const handleCreateCourse = async () => {
    if (!newCourse.courseName.trim()) {
      alert("Vui lòng nhập tên khóa học!");
      return;
    }
    try {
      const payload = { ...newCourse, teacherID: teacherId };
      const created = await createTeacherCourse(payload);
      setCourses((prev) => [...prev, created]);
      setNewCourse({ courseName: "", description: "" });
      setShowModal(false);
      alert("✅ Tạo khóa học thành công!");
    } catch (err) {
      alert(err.message || "Không thể tạo khóa học.");
    }
  };

  const handleEditCourse = (courseId) => navigate(`/editcourse/${courseId}`);
  const handleViewCourseDetail = (courseId) => navigate(`/course/${courseId}`);

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này không?")) return;
    try {
      await deleteTeacherCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.courseID !== courseId));
      alert("🗑️ Xóa khóa học thành công!");
    } catch (error) {
      alert(error.message || "Không thể xóa khóa học.");
    }
  };

  const handleDeleteFlashcard = async (setId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bộ flashcard này không?")) return;
    try {
      await deleteFlashcardSet(setId);
      setFlashcards((prev) => prev.filter((f) => f.setID !== setId));
      alert("🗑️ Xóa flashcard thành công!");
    } catch (error) {
      alert(error.message || "Không thể xóa flashcard.");
    }
  };

  return (
    <Container
      fluid
      className="p-4 dashboard"
      style={{
        background: "linear-gradient(135deg, #f8fafc, #e9f0ff)",
        minHeight: "100vh",
      }}
    >
      <Row className="h-100">
        {/* Sidebar */}
        <Col
          md={3}
          className="border-end bg-white rounded-4 shadow-sm p-3"
          style={{ height: "fit-content" }}
        >
          <h5 className="mb-4 text-primary fw-bold text-center">
            <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
            Bảng điều khiển
          </h5>
          <ListGroup variant="flush">
            {[
              { key: "khoahoc", icon: faBookOpen, label: "Khóa học" },
              { key: "flashcards", icon: faClipboardList, label: "Flashcards" },
              { key: "quiz", icon: faBrain, label: "Quiz" },
              { key: "danhgia", icon: faStar, label: "Đánh giá" },
            ].map((item) => (
              <ListGroup.Item
                key={item.key}
                action
                active={activeMenu === item.key}
                onClick={() => setActiveMenu(item.key)}
                className={`mb-2 rounded-3 ${
                  activeMenu === item.key
                    ? "bg-primary text-white"
                    : "bg-light text-dark"
                }`}
                style={{ cursor: "pointer", transition: "0.2s" }}
              >
                <FontAwesomeIcon icon={item.icon} className="me-2" />
                {item.label}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        {/* Main content */}
        <Col md={9}>
          <Card className="border-0 shadow-lg rounded-4 p-4 bg-white">
            {/* === KHÓA HỌC === */}
            {activeMenu === "khoahoc" && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold text-primary">
                    <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                    Danh sách khóa học
                  </h4>
                  <Button
                    variant="primary"
                    className="rounded-pill px-4"
                    onClick={() => setShowModal(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Tạo khóa học mới
                  </Button>
                </div>

                {loadingCourses ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Đang tải khóa học...</p>
                  </div>
                ) : errorCourses ? (
                  <Alert variant="danger">{errorCourses}</Alert>
                ) : courses.length === 0 ? (
                  <p className="text-muted">Chưa có khóa học nào.</p>
                ) : (
                  <Row>
                    {courses.map((course) => (
                      <Col md={6} lg={4} key={course.courseID} className="mb-4">
                        <Card className="shadow-sm border-0 rounded-4 hover-card h-100">
                          <Card.Body>
                            <Card.Title className="text-primary fw-bold mb-2">
                              {course.courseName}
                            </Card.Title>
                            <Card.Text className="text-muted small mb-3">
                              {course.description}
                            </Card.Text>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <FontAwesomeIcon
                                  icon={faStar}
                                  className="text-warning me-1"
                                />
                                <span className="small">
                                  {course.rating || "Chưa có"}
                                </span>
                              </div>
                              <div className="d-flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() =>
                                    handleViewCourseDetail(course.courseID)
                                  }
                                >
                                  <FontAwesomeIcon icon={faEye} /> Xem
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() =>
                                    handleEditCourse(course.courseID)
                                  }
                                >
                                  <FontAwesomeIcon icon={faEdit} /> Sửa
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() =>
                                    handleDeleteCourse(course.courseID)
                                  }
                                >
                                  <FontAwesomeIcon icon={faTrashAlt} /> Xóa
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}

            {/* === FLASHCARDS === */}
            {activeMenu === "flashcards" && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold text-primary">
                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                    Bộ Flashcards
                  </h4>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/teacher/create")}
                    className="rounded-pill px-4"
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Tạo flashcard mới
                  </Button>
                </div>

                {loadingFlashcards ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Đang tải flashcards...</p>
                  </div>
                ) : errorFlashcards ? (
                  <Alert variant="danger">{errorFlashcards}</Alert>
                ) : flashcards.length === 0 ? (
                  <p className="text-muted">Chưa có bộ flashcard nào.</p>
                ) : (
                  <Row>
                    {flashcards.map((set) => (
                      <Col md={6} lg={4} key={set.setID} className="mb-4">
                        <Card className="shadow-sm border-0 rounded-4 hover-card h-100">
                          <Card.Body>
                            <h6 className="fw-bold text-primary">
                              {set.title}
                            </h6>
                            <p className="text-muted small">{set.description}</p>
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => navigate(`/teacher/flashcards/${set.setID}`)}
                              >
                                <FontAwesomeIcon icon={faEye} /> Xem
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => navigate(`/teacher/edit/${set.setID}`)}
                              >
                                <FontAwesomeIcon icon={faEdit} /> Sửa
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteFlashcard(set.setID)}
                              >
                                <FontAwesomeIcon icon={faTrashAlt} /> Xóa
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}

            {/* === QUIZZES === */}
            {activeMenu === "quiz" && (
              <>
                <h4 className="fw-bold text-primary mb-4">
                  <FontAwesomeIcon icon={faBrain} className="me-2" />
                  Danh sách Quiz
                </h4>

                {loadingQuizzes ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Đang tải quiz...</p>
                  </div>
                ) : errorQuizzes ? (
                  <Alert variant="danger">{errorQuizzes}</Alert>
                ) : quizzes.length === 0 ? (
                  <p className="text-muted">Chưa có quiz nào.</p>
                ) : (
                  <Row>
                    {quizzes.map((quiz) => (
                      <Col md={6} lg={4} key={quiz.quizID} className="mb-4">
                        <Card className="shadow-sm border-0 rounded-4 hover-card h-100">
                          <Card.Body>
                            <h6 className="fw-bold text-primary">
                              {quiz.title}
                            </h6>
                            <p className="text-muted small">
                              Khóa học: {quiz.courseName}
                            </p>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() =>
                                navigate(`/quiz/start/${quiz.quizID}`)
                              }
                            >
                              Làm thử
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal tạo khóa học */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tạo khóa học mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên khóa học</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên khóa học"
                value={newCourse.courseName}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, courseName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Mô tả khóa học"
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleCreateCourse}>
            Tạo mới
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
