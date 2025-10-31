import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Accordion } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getTeacherCourseDetail } from "../../middleware/teacher/courseTeacherAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EditCourse.scss";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      setIsLoading(true);
      const data = await getTeacherCourseDetail(courseId);
      setCourse(data);
    } catch (err) {
      console.error("❌ Lỗi khi tải chi tiết khóa học:", err);
      setError("Không thể tải thông tin khóa học");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Đang tải dữ liệu khóa học...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4 edit-course-page">
      <Row className="mb-4">
        <Col>
          <Button variant="link" onClick={() => navigate("/teacher/dashboard")} className="p-0 mb-3">
            ← Quay lại Dashboard
          </Button>
          <h2>Chi tiết khóa học</h2>
          <p className="text-muted">Xem thông tin khóa học và nội dung chương trình</p>

          <div className="d-flex gap-2 mt-3">
            <Button variant="primary" onClick={() => navigate(`/teacher/editcourse/${course.courseID}`)}>
              ✏️ Chỉnh sửa khóa học
            </Button>
            <Button variant="success" onClick={() => navigate(`/teacher/createcourse`)}>
              ➕ Tạo khóa học mới
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Thông tin khóa học */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header><h5>Thông tin khóa học</h5></Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tên khóa học</Form.Label>
                  <Form.Control value={course.courseName} disabled readOnly />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control as="textarea" rows={3} value={course.description} disabled readOnly />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Cấp độ</Form.Label>
                  <Form.Control value={`Level ${course.courseLevel}`} disabled readOnly />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Danh sách chương và video */}
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Nội dung khóa học</h5>
            </Card.Header>
            <Card.Body>
              {course?.chapters?.length > 0 ? (
                <Accordion>
                  {course.chapters.map((chapter, i) => (
                    <Accordion.Item eventKey={i.toString()} key={chapter.chapterID}>
                      <Accordion.Header>
                        <div className="w-100 d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{chapter.chapterName}</strong>
                            <small className="text-muted ms-2">
                              ({chapter.videos?.length || 0} video)
                            </small>
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        {chapter.videos?.length ? (
                          chapter.videos.map((video) => (
                            <div key={video.videoID} className="mb-2">
                              <div>
                                <strong>{video.videoName}</strong>
                                {video.isPreview && <Badge bg="info" className="ms-2">Miễn phí</Badge>}
                              </div>
                              <div>
                                {video.videoURL ? (
                                  <a href={video.videoURL} target="_blank" rel="noreferrer">
                                    Xem video
                                  </a>
                                ) : (
                                  <Badge bg="secondary">Chưa có video</Badge>
                                )}
                              </div>
                              <hr />
                            </div>
                          ))
                        ) : (
                          <div className="text-muted">Chưa có video nào</div>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center text-muted py-4">
                  Chưa có chương nào trong khóa học
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetail;
