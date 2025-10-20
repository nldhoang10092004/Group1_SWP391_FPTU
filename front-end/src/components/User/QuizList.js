import React, { useEffect, useState } from "react";
import { Row, Col, Card, Badge, Button, Spinner, Container, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faArrowLeft, faFileAlt, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { getAllCoursesWithDetails } from "../../middleware/courseAPI";
import { getQuizzesByCourse } from "../../middleware/QuizAPI";
import "./QuizList.scss";

const QuizList = () => {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setError(null);
        const data = await getAllCoursesWithDetails();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Không thể tải danh sách khóa học. Vui lòng thử lại sau.");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

 const handleViewQuizzes = async (courseId, courseName) => {
  setSelectedCourseId(courseId);
  setSelectedCourseName(courseName);
  setLoadingQuizzes(true);
  setError(null);
  setAlertMessage(null);

  try {
    const data = await getQuizzesByCourse(courseId);
    console.log("Fetched quizzes raw:", data);
data.forEach(q => console.log(q.quizID));

    // Normalize quizID: chú ý backend trả QuizID (chữ hoa)
    const quizzesArray = Array.isArray(data) ? data : [data];
    const normalizedQuizzes = quizzesArray.map(q => ({
      ...q,
      quizID: q.quizID // dùng đúng tên property từ backend
    }));

    setQuizzes(normalizedQuizzes);
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    setError("Không thể tải danh sách quiz. Vui lòng thử lại sau.");
    setQuizzes([]);
  } finally {
    setLoadingQuizzes(false);
  }
};



  const handleStartQuiz = (quizId) => {
    if (quizId === undefined || quizId === null) {
      console.error("Quiz ID is undefined");
      setAlertMessage({
        type: "danger",
        message: "Lỗi: Quiz ID không xác định. Không thể bắt đầu bài quiz này."
      });
      // Auto dismiss after 5 seconds
      setTimeout(() => setAlertMessage(null), 5000);
      return;
    }
    navigate(`/quiz/start/${quizId}`);
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setSelectedCourseName("");
    setQuizzes([]);
    setError(null);
    setAlertMessage(null);
  };

  if (loadingCourses) {
    return (
      <div className="quiz-list-page">
        <Container>
          <div className="loading-container">
            <Spinner animation="border" role="status" />
            <p>Đang tải dữ liệu khóa học...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error && !selectedCourseId) {
    return (
      <div className="quiz-list-page">
        <Container>
          <Button variant="link" onClick={() => navigate("/")} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} />
            Quay lại trang chủ
          </Button>
          <div className="empty-state">
            <FontAwesomeIcon icon={faGraduationCap} className="empty-icon" />
            <p>{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="quiz-list-page">
        <Container>
          <Button variant="link" onClick={() => navigate("/")} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} />
            Quay lại trang chủ
          </Button>
          <div className="empty-state">
            <FontAwesomeIcon icon={faGraduationCap} className="empty-icon" />
            <p>Hiện chưa có khóa học nào</p>
            <Button variant="primary" onClick={() => navigate("/")}>
              Quay về trang chủ
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="quiz-list-page">
      <Container>
        {/* Alert Popup */}
        {alertMessage && (
          <Alert 
            variant={alertMessage.type} 
            dismissible 
            onClose={() => setAlertMessage(null)}
            className="position-fixed top-0 start-50 translate-middle-x mt-3"
            style={{ zIndex: 9999, minWidth: "400px" }}
          >
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {alertMessage.message}
          </Alert>
        )}

        {/* Back Button */}
        <Button 
          variant="link" 
          onClick={selectedCourseId ? handleBackToCourses : () => navigate("/")} 
          className="back-button"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {selectedCourseId ? `Quay lại danh sách khóa học` : 'Quay lại trang chủ'}
        </Button>

        {/* Courses List */}
        {!selectedCourseId && (
          <>
            <div className="mb-4">
              <h2 className="section-title">
                <FontAwesomeIcon icon={faGraduationCap} />
                Danh sách khóa học
              </h2>
              <p className="text-muted">Chọn khóa học để xem các bài quiz có sẵn</p>
            </div>

            <Row>
              {courses.map((course) => (
                <Col md={6} lg={4} key={course.courseID} className="mb-4">
                  <Card className="course-card">
                    <Card.Body>
                      <div className="course-header">
                        <h5>{course.courseName}</h5>
                        <Badge bg="info" className="level-badge">
                          Level {course.courseLevel}
                        </Badge>
                      </div>
                      <p className="course-description">
                        {course.description || "Khóa học tiếng Anh chất lượng cao"}
                      </p>
                      <Button
                        variant="primary"
                        className="quiz-button"
                        onClick={() => handleViewQuizzes(course.courseID, course.courseName)}
                      >
                        <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                        Xem bài quiz
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* Quizzes Section */}
        {selectedCourseId && (
          <div className="quiz-section">
            <h4 className="section-title">
              Quiz của khóa học: {selectedCourseName}
            </h4>
            
            {loadingQuizzes ? (
              <div className="loading-quizzes">
                <Spinner animation="border" role="status" />
                <p>Đang tải danh sách quiz...</p>
              </div>
            ) : error ? (
              <div className="no-quizzes">
                <FontAwesomeIcon icon={faFileAlt} className="no-quiz-icon" />
                <p>{error}</p>
                <Button variant="primary" onClick={() => handleViewQuizzes(selectedCourseId, selectedCourseName)}>
                  Thử lại
                </Button>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="no-quizzes">
                <FontAwesomeIcon icon={faFileAlt} className="no-quiz-icon" />
                <p>Chưa có quiz nào cho khóa học này</p>
                <Button variant="outline-primary" onClick={handleBackToCourses}>
                  Chọn khóa học khác
                </Button>
              </div>
            ) : (
              <Row className="quiz-grid">
                {quizzes.map((quiz) => (
                  <Col md={6} lg={4} key={`quiz-${quiz.quizID}`} className="mb-3">
                    <Card className="quiz-card">
                      <Card.Body>
                        <h6 className="quiz-title">{quiz.title || "Bài Quiz"}</h6>
                        <Button 
                          variant="success" 
                          className="start-quiz-btn"
                          onClick={() => handleStartQuiz(quiz.quizID)}
                        >
                          <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                          Bắt đầu quiz
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default QuizList;