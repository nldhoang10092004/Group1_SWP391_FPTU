import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardTeacher,
  faQuestionCircle,
  faBookOpen,
  faLayerGroup,
  faUsers,
  faFileAlt,
  faTrashAlt,
  faEye,
  faEdit,
  faPlus,
  faBolt,
  faClipboardList,
  faCommentAlt,
  faPlayCircle,
  faVideo,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import "./dashboard.scss";
import { getFlashcardSets, getFlashcardSetsByCourseId } from "../../middleware/flashcardAPI";


const Dashboard = () => {
  const navigate = useNavigate();

  const [flashcards, setFlashcards] = useState([]);
const [loadingFlashcards, setLoadingFlashcards] = useState(true);
const [errorFlashcards, setErrorFlashcards] = useState(null);

useEffect(() => {
  const fetchFlashcards = async () => {
    try {
      setLoadingFlashcards(true);
      const data = await getFlashcardSets(); // Gọi API thật
      setFlashcards(data);
    } catch (error) {
      setErrorFlashcards(error.message || "Không thể tải flashcards");
    } finally {
      setLoadingFlashcards(false);
    }
  };

  fetchFlashcards();
}, []);

  // Tabs state -> chuyển thành sidebar state
  const [activeMenu, setActiveMenu] = useState("khoahoc");

  const handleEditCourse = (courseId) => {
    navigate(`/editcourse/${courseId}`);
  };

  const handleViewCourseDetail = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  // Sample data
  const courseData = [
    {
      id: 1,
      name: "IELTS Nền Tảng",
      description: "Khóa học giúp bạn xây nền tảng tiếng Anh vững chắc",
      level: "Cơ bản",
      lessons: 24,
      students: 120,
      rating: 4.8,
      status: "active",
    },
    {
      id: 2,
      name: "IELTS Cơ Bản",
      description: "Phát triển kỹ năng nghe nói đọc viết căn bản",
      level: "Trung bình",
      lessons: 32,
      students: 90,
      rating: 4.5,
      status: "active",
    },
  ];

  const quizzesData = [
    {
      id: 1,
      title: "Quiz Listening",
      course: "IELTS Nền Tảng",
      questions: 10,
      duration: "15 phút",
      passingScore: 7,
      status: "published",
    },
    {
      id: 2,
      title: "Quiz Reading",
      course: "IELTS Cơ Bản",
      questions: 8,
      duration: "10 phút",
      passingScore: 6,
      status: "draft",
    },
  ];

  const reviewsData = [
    { user: "Nguyễn An", rating: 5, comment: "Khóa học rất bổ ích!" },
    { user: "Trần Bình", rating: 4, comment: "Giảng viên dễ hiểu." },
  ];

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
              active={activeMenu === "quiz"}
              onClick={() => setActiveMenu("quiz")}
            >
              <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
              Quiz
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

              <Row>
                {courseData.map((course) => (
                  <Col md={6} key={course.id} className="mb-4">
                    <Card className="shadow-sm">
                      <Card.Body>
                        <Card.Title className="text-primary">
                          {course.name}
                        </Card.Title>
                        <Card.Text>{course.description}</Card.Text>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <Badge bg="info">{course.level}</Badge>
                          <Badge bg="secondary">{course.lessons} bài học</Badge>
                          <Badge bg="success">{course.students} học viên</Badge>
                        </div>
                        <div className="d-flex justify-content-between">
                          <div>
                            <FontAwesomeIcon
                              icon={faStar}
                              className="text-warning me-1"
                            />
                            {course.rating}
                          </div>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleViewCourseDetail(course.id)}
                            >
                              <FontAwesomeIcon icon={faEye} /> Xem
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleEditCourse(course.id)}
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
            </>
          )}

          {activeMenu === "quiz" && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>
                  <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
                  Danh sách Quiz
                </h4>
                <Button variant="success">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Tạo quiz mới
                </Button>
              </div>
              {quizzesData.map((quiz) => (
                <Card key={quiz.id} className="mb-3 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>{quiz.title}</h5>
                        <p className="mb-1 text-muted">
                          <FontAwesomeIcon
                            icon={faBookOpen}
                            className="me-1 text-primary"
                          />
                          {quiz.course} • {quiz.questions} câu hỏi •{" "}
                          {quiz.duration}
                        </p>
                        <Badge
                          bg={quiz.status === "published" ? "success" : "warning"}
                        >
                          {quiz.status}
                        </Badge>
                      </div>
                      <div>
                        <Button variant="outline-info" size="sm" className="me-2">
                          <FontAwesomeIcon icon={faEye} /> Xem
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          <FontAwesomeIcon icon={faTrashAlt} /> Xóa
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </>
          )}

          {activeMenu === "flashcards" && (
  <>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4>
        <FontAwesomeIcon icon={faClipboardList} className="me-2" />
        Danh sách Flashcard Sets
      </h4>
      <Button
        variant="info"
        onClick={() => navigate("/teacher/create-flashcard")}
      >
        <FontAwesomeIcon icon={faPlus} className="me-2" />
        Tạo Flashcard Set mới
      </Button>
    </div>

    {loadingFlashcards ? (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Đang tải flashcards...</p>
      </div>
    ) : errorFlashcards ? (
      <div className="alert alert-danger">{errorFlashcards}</div>
    ) : flashcards.length === 0 ? (
      <p>Chưa có flashcard nào.</p>
    ) : (
      flashcards.map((set) => (
        <Card key={set.setID} className="mb-3 shadow-sm">
          <Card.Body>
            <h5 className="text-primary mb-1">{set.title}</h5>
            <p className="text-muted mb-2">{set.description}</p>
            <Badge bg="secondary">Khóa học ID: {set.courseID}</Badge>
            <div className="d-flex justify-content-end mt-3 gap-2">
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() =>
                  navigate(`/teacher/flashcard/${set.setID}`)
                }
              >
                <FontAwesomeIcon icon={faEye} /> Xem chi tiết
              </Button>
              <Button
                size="sm"
                variant="outline-success"
                onClick={() =>
                  navigate(`/teacher/edit-flashcard/${set.setID}`)
                }
              >
                <FontAwesomeIcon icon={faEdit} /> Sửa
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))
    )}
  </>
)}
          {activeMenu === "danhgia" && (
            <>
              <h4 className="mb-3">
                <FontAwesomeIcon icon={faStar} className="me-2" />
                Đánh giá từ học viên
              </h4>
              {reviewsData.map((review, index) => (
                <Card key={index} className="mb-3 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <h6>{review.user}</h6>
                      <div>
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStar}
                            className="text-warning"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mb-0">{review.comment}</p>
                  </Card.Body>
                </Card>
              ))}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
