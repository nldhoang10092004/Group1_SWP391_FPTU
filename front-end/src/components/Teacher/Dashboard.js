import React, { useState, useEffect } from "react";
import {Container,Row,Col,Card,Button,Badge,ListGroup,} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBookOpen,faLayerGroup,faTrashAlt,faEye,faEdit,faPlus,faClipboardList,faStar,} from "@fortawesome/free-solid-svg-icons";
import "./dashboard.scss";
import { getCourses } from "../../middleware/courseAPI";
import { getFlashcardSets } from "../../middleware/flashcardAPI";

const Dashboard = () => {
  const navigate = useNavigate();

  // ===== STATE =====
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses] = useState(null);

  const [flashcards, setFlashcards] = useState([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(true);
  const [errorFlashcards, setErrorFlashcards] = useState(null);

  const [activeMenu, setActiveMenu] = useState("khoahoc");

  // ===== FETCH COURSES =====
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const data = await getCourses();
        setCourses(data?.courses || []);
      } catch (error) {
        setErrorCourses(error.message || "Không thể tải khóa học");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // ===== FETCH FLASHCARDS =====
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoadingFlashcards(true);
        const data = await getFlashcardSets();
        setFlashcards(data || []);
      } catch (error) {
        setErrorFlashcards(error.message || "Không thể tải flashcards");
      } finally {
        setLoadingFlashcards(false);
      }
    };
    fetchFlashcards();
  }, []);

  const handleEditCourse = (courseId) => {
    navigate(`/editcourse/${courseId}`);
  };

  const handleViewCourseDetail = (courseId) => {
    navigate(`/course/${courseId}`);
  };

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
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2">Đang tải khóa học...</p>
                </div>
              ) : errorCourses ? (
                <div className="alert alert-danger">{errorCourses}</div>
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
                                onClick={() => handleViewCourseDetail(course.courseID)}
                              >
                                <FontAwesomeIcon icon={faEye} /> Xem
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => handleEditCourse(course.courseID)}
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
                          onClick={() => navigate(`/teacher/flashcard/${set.setID}`)}
                        >
                          <FontAwesomeIcon icon={faEye} /> Xem chi tiết
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => navigate(`/teacher/edit-flashcard/${set.setID}`)}
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

          {/* ===== ĐÁNH GIÁ ===== */}
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
