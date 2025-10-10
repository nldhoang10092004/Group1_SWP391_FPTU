import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Accordion, Badge, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseDetails } from "../../api/studentAPI";
import "./StudentCourseDetail.scss";

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseDetails(courseId);
        setCourse(data);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="text-center py-5">
        <h3>Không tìm thấy khóa học</h3>
        <Button variant="dark" onClick={() => navigate("/student/courses")}>
          Quay lại danh sách khóa học
        </Button>
      </Container>
    );
  }

  const getLevelLabel = (level) => {
    const labels = ["", "Nền tảng", "Cơ bản", "Trung cấp", "Chuyên sâu"];
    return labels[level] || "Unknown";
  };

  return (
    <div className="student-course-detail">
      <Container className="py-4">
        {/* Back Button */}
        <Row className="mb-3">
          <Col>
            <Button 
              variant="link" 
              className="p-0 text-dark"
              onClick={() => navigate("/student/courses")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại
            </Button>
          </Col>
        </Row>

        {/* Course Header */}
        <Row className="mb-4">
          <Col>
            <Card className="course-header-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <Badge bg="primary" className="mb-2">
                      Level {course.CourseLevel} - {getLevelLabel(course.CourseLevel)}
                    </Badge>
                    <h1 className="course-title">{course.CourseName}</h1>
                  </div>
                </div>
                
                <p className="course-description">{course.Description}</p>
                
                <div className="teacher-info mt-3">
                  <h6 className="text-muted mb-1">Giảng viên</h6>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-person-circle fs-4 me-2"></i>
                    <div>
                      <div className="fw-bold">{course.Teacher?.Name}</div>
                      {course.Teacher?.Description && (
                        <small className="text-muted">{course.Teacher.Description}</small>
                      )}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Course Content */}
        <Row>
          <Col>
            <h3 className="mb-3">Nội dung khóa học</h3>
            
            {!course.Chapters || course.Chapters.length === 0 ? (
              <Card>
                <Card.Body className="text-center py-5">
                  <p className="text-muted">Khóa học này chưa có nội dung</p>
                </Card.Body>
              </Card>
            ) : (
              <Accordion defaultActiveKey="0">
                {course.Chapters.map((chapter, chapterIndex) => (
                  <Accordion.Item eventKey={chapterIndex.toString()} key={chapter.ChapterID}>
                    <Accordion.Header>
                      <div className="w-100">
                        <span className="fw-bold">Chương {chapterIndex + 1}: {chapter.ChapterName}</span>
                        <span className="text-muted ms-2">
                          ({chapter.Videos?.length || 0} video)
                        </span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      {!chapter.Videos || chapter.Videos.length === 0 ? (
                        <p className="text-muted mb-0">Chương này chưa có video</p>
                      ) : (
                        <div className="video-list">
                          {chapter.Videos.map((video, videoIndex) => (
                            <Card key={video.VideoID} className="video-card mb-2">
                              <Card.Body className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-play-circle fs-4 me-3 text-primary"></i>
                                  <div>
                                    <div className="video-title">{video.VideoName}</div>
                                    {video.IsPreview && (
                                      <Badge bg="success" className="mt-1">Xem trước miễn phí</Badge>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  variant="outline-dark" 
                                  size="sm"
                                  onClick={() => {
                                    if (video.VideoURL) {
                                      window.open(video.VideoURL, '_blank');
                                    }
                                  }}
                                  disabled={!video.IsPreview}
                                >
                                  {video.IsPreview ? "Xem video" : "Cần đăng ký"}
                                </Button>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Col>
        </Row>

        {/* Enroll Section */}
        <Row className="mt-4">
          <Col>
            <Card className="enroll-card">
              <Card.Body className="text-center">
                <h4>Bạn muốn học khóa học này?</h4>
                <p className="text-muted mb-3">
                  Đăng ký ngay để truy cập toàn bộ nội dung khóa học
                </p>
                <Button variant="dark" size="lg">
                  Đăng ký khóa học
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StudentCourseDetail;
