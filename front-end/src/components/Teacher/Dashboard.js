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
import { getCourses } from "../../middleware/courseAPI";
import { getFlashcardSetsByCourseId } from "../../middleware/flashcardAPI";
import { getQuizzesByCourse } from "../../middleware/QuizAPI";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const navigate = useNavigate();

  // ===== STATE =====
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

  // ===== LẤY TEACHER ID TỪ TOKEN =====
  const token = localStorage.getItem("accessToken");
  let teacherId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      // ✅ Tuỳ backend: có thể là id / teacherId / userId
      teacherId = decoded?.id || decoded?.teacherId || decoded?.UserId;
    } catch (err) {
      console.error("❌ Lỗi giải mã token:", err);
    }
  }

  // ===== FETCH COURSES =====
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const data = await getCourses();
        const allCourses = data?.courses || [];

        // ✅ Lọc khóa học theo teacherId
        const filteredCourses = teacherId
          ? allCourses.filter((c) => c.teacherID === teacherId)
          : allCourses;

        setCourses(filteredCourses);
        console.log("🎓 Courses theo teacher:", filteredCourses);
      } catch (error) {
        setErrorCourses(error.message || "Không thể tải khóa học");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [teacherId]);

  // ===== FETCH FLASHCARDS =====
  useEffect(() => {
    const fetchCourseFlashcards = async () => {
      try {
        setLoadingFlashcards(true);
        const allFlashcards = [];

        for (const course of courses) {
          try {
            const res = await getFlashcardSetsByCourseId(course.courseID);
            if (Array.isArray(res)) {
              // ✅ Lọc flashcards theo teacherId
              const filtered = teacherId
                ? res.filter((f) => f.teacherID === teacherId)
                : res;

              const withCourseName = filtered.map((f) => ({
                ...f,
                courseName: course.courseName,
              }));
              allFlashcards.push(...withCourseName);
            }
          } catch (err) {
            console.warn(
              `⚠️ Lỗi khi lấy flashcards của khóa ${course.courseName}`,
              err
            );
          }
        }

        setFlashcards(allFlashcards);
        console.log("📚 Flashcards theo teacher:", allFlashcards);
      } catch (error) {
        setErrorFlashcards(error.message || "Không thể tải flashcards");
      } finally {
        setLoadingFlashcards(false);
      }
    };

    if (courses.length > 0) fetchCourseFlashcards();
  }, [courses, teacherId]);

  // ===== FETCH QUIZZES =====
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoadingQuizzes(true);
        const allQuizzes = [];

        for (const course of courses) {
          const data = await getQuizzesByCourse(course.courseID);
          if (Array.isArray(data)) {
            // ✅ Lọc quiz theo teacherId
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
        console.log("🧠 Quiz theo teacher:", allQuizzes);
      } catch (error) {
        setErrorQuizzes(error.message || "Không thể tải quiz");
      } finally {
        setLoadingQuizzes(false);
      }
    };

    if (courses.length > 0) fetchQuizzes();
  }, [courses, teacherId]);

  // ===== HANDLERS =====
  const handleEditCourse = (courseId) => navigate(`/editcourse/${courseId}`);
  const handleViewCourseDetail = (courseId) => navigate(`/course/${courseId}`);
  const handleViewFlashcards = (setId) =>
    navigate(`/teacher/flashcards/${setId}`);
  const handleAddFlashcard = () => navigate("/teacher/create");
  const handleEditFlashcard = (setId) => navigate(`/teacher/edit/${setId}`);

  // ===== UI =====
  return (
    <Container fluid className="p-4 dashboard">
      <Row>
        {/* Sidebar */}
        <Col md={3} className="border-end bg-light p-3">
          <h5 className="mb-4 text-primary">
            <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
            Bảng điều khiển
          </h5>
          <ListGroup>
            <ListGroup.Item
              action
              active={activeMenu === "khoahoc"}
              onClick={() => setActiveMenu("khoahoc")}
            >
              <FontAwesomeIcon icon={faBookOpen} className="me-2" />
              Khóa học
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeMenu === "flashcards"}
              onClick={() => setActiveMenu("flashcards")}
            >
              <FontAwesomeIcon icon={faClipboardList} className="me-2" />
              Flashcards
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeMenu === "quiz"}
              onClick={() => setActiveMenu("quiz")}
            >
              <FontAwesomeIcon icon={faBrain} className="me-2" />
              Quiz
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeMenu === "danhgia"}
              onClick={() => setActiveMenu("danhgia")}
            >
              <FontAwesomeIcon icon={faStar} className="me-2" />
              Đánh giá
            </ListGroup.Item>
          </ListGroup>
        </Col>

        {/* Content */}
        <Col md={9}>
          {/* ===== KHÓA HỌC ===== */}
          {activeMenu === "khoahoc" && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>
                  <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                  Danh sách khóa học
                </h4>
                <Button variant="primary">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Tạo khóa học mới
                </Button>
              </div>

              {loadingCourses ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Đang tải khóa học...</p>
                </div>
              ) : errorCourses ? (
                <Alert variant="danger">{errorCourses}</Alert>
              ) : courses.length === 0 ? (
                <p>Chưa có khóa học nào.</p>
              ) : (
                <Row>
                  {courses.map((course) => (
                    <Col md={6} key={course.courseID} className="mb-4">
                      <Card className="shadow-sm">
                        <Card.Body>
                          <Card.Title className="text-primary">
                            {course.courseName}
                          </Card.Title>
                          <Card.Text>{course.description}</Card.Text>
                          <div className="d-flex justify-content-between">
                            <div>
                              <FontAwesomeIcon
                                icon={faStar}
                                className="text-warning me-1"
                              />
                              {course.rating || "Chưa có"}
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
                              <Button size="sm" variant="outline-danger">
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

          {/* ===== FLASHCARDS ===== */}
          {activeMenu === "flashcards" && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>
                  <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                  Bộ Flashcards
                </h4>
                <Button variant="primary" onClick={handleAddFlashcard}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Tạo flashcard mới
                </Button>
              </div>

              {loadingFlashcards ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Đang tải flashcards...</p>
                </div>
              ) : errorFlashcards ? (
                <Alert variant="danger">{errorFlashcards}</Alert>
              ) : flashcards.length === 0 ? (
                <p>Chưa có bộ flashcard nào.</p>
              ) : (
                <Row>
                  {flashcards.map((set) => (
                    <Col md={6} lg={4} key={set.setID} className="mb-3">
                      <Card className="flashcard-card h-100 shadow-sm">
                        <Card.Body>
                          <h6 className="fw-bold">{set.title}</h6>
                          <p className="text-muted small">{set.description}</p>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleViewFlashcards(set.setID)}
                            >
                              <FontAwesomeIcon icon={faEye} /> Xem
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleEditFlashcard(set.setID)}
                            >
                              <FontAwesomeIcon icon={faEdit} /> Sửa
                            </Button>
                            <Button size="sm" variant="outline-danger">
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

          {/* ===== QUIZ ===== */}
          {activeMenu === "quiz" && (
            <>
              <h4 className="mb-3">
                <FontAwesomeIcon icon={faBrain} className="me-2" />
                Danh sách Quiz
              </h4>

              {loadingQuizzes ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Đang tải quiz...</p>
                </div>
              ) : errorQuizzes ? (
                <Alert variant="danger">{errorQuizzes}</Alert>
              ) : quizzes.length === 0 ? (
                <p>Chưa có quiz nào.</p>
              ) : (
                <Row>
                  {quizzes.map((quiz) => (
                    <Col md={6} lg={4} key={quiz.quizID} className="mb-3">
                      <Card className="quiz-card shadow-sm">
                        <Card.Body>
                          <h6 className="fw-bold">{quiz.title}</h6>
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
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
