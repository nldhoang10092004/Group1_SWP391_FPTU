import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { getAllCourses, getCoursesByLevel } from "../../api/studentAPI";
import { useNavigate } from "react-router-dom";
import "./StudentCourses.scss";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const navigate = useNavigate();

  const levels = [
    { id: "all", label: "Tất cả", value: null },
    { id: "1", label: "Level 1 - Nền tảng", value: 1 },
    { id: "2", label: "Level 2 - Cơ bản", value: 2 },
    { id: "3", label: "Level 3 - Trung cấp", value: 3 },
    { id: "4", label: "Level 4 - Chuyên sâu", value: 4 }
  ];

  useEffect(() => {
    fetchCourses();
  }, [selectedLevel]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let data;
      if (selectedLevel === "all") {
        data = await getAllCourses();
      } else {
        data = await getCoursesByLevel(parseInt(selectedLevel));
      }
      setCourses(data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level) => {
    const labels = ["", "Nền tảng", "Cơ bản", "Trung cấp", "Chuyên sâu"];
    return labels[level] || "Unknown";
  };

  return (
    <div className="student-courses">
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h1>Khóa học</h1>
            <p className="text-muted">Khám phá các khóa học tiếng Anh phù hợp với trình độ của bạn</p>
          </Col>
        </Row>

        {/* Level Filter */}
        <Row className="mb-4">
          <Col>
            <div className="level-filter">
              {levels.map((level) => (
                <Button
                  key={level.id}
                  variant={selectedLevel === level.id ? "dark" : "outline-dark"}
                  className="me-2 mb-2"
                  onClick={() => setSelectedLevel(level.id)}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </Col>
        </Row>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <Row>
            <Col className="text-center py-5">
              <h4>Không có khóa học nào</h4>
              <p className="text-muted">Hiện chưa có khóa học ở cấp độ này</p>
            </Col>
          </Row>
        ) : (
          <Row>
            {courses.map((course) => (
              <Col md={6} lg={4} key={course.CourseID} className="mb-4">
                <Card className="course-card h-100">
                  <Card.Body>
                    <div className="course-header mb-3">
                      <Badge bg="primary" className="level-badge">
                        Level {course.CourseLevel}
                      </Badge>
                      <span className="text-muted small ms-2">
                        {getLevelLabel(course.CourseLevel)}
                      </span>
                    </div>
                    
                    <Card.Title className="course-title">{course.CourseName}</Card.Title>
                    
                    <Card.Text className="course-description">
                      {course.Description || "Khóa học tiếng Anh chất lượng cao"}
                    </Card.Text>
                    
                    <div className="teacher-info mb-3">
                      <small className="text-muted">
                        <i className="bi bi-person-circle me-1"></i>
                        Giảng viên: {course.Teacher?.Name || "Chưa cập nhật"}
                      </small>
                    </div>
                    
                    <div className="d-grid">
                      <Button 
                        variant="dark" 
                        onClick={() => navigate(`/student/courses/${course.CourseID}`)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default StudentCourses;
