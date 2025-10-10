import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table } from "react-bootstrap";
import { getTeacherDashboard } from "../../api/teacherAPI";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.scss";

const TeacherDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // For demo, using hardcoded teacherId. In real app, get from auth context
  const teacherId = 1;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getTeacherDashboard(teacherId);
        setDashboard(data);
      } catch (error) {
        console.error("Failed to fetch teacher dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [teacherId]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!dashboard) {
    return (
      <Container className="text-center py-5">
        <h3>Unable to load dashboard</h3>
      </Container>
    );
  }

  const { Teacher, Stats, RecentCourses } = dashboard;

  return (
    <div className="teacher-dashboard">
      <Container className="py-4">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <h1>Xin chào, {Teacher.Name}!</h1>
            <p className="text-muted">Quản lý khóa học và nội dung giảng dạy của bạn</p>
          </Col>
          <Col xs="auto">
            <Button 
              variant="dark" 
              size="lg"
              onClick={() => navigate("/teacher/courses/manage")}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Tạo khóa học mới
            </Button>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <i className="bi bi-book"></i>
                </div>
                <h3>{Stats.TotalCourses}</h3>
                <p>Tổng khóa học</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <i className="bi bi-collection"></i>
                </div>
                <h3>{Stats.TotalChapters}</h3>
                <p>Tổng chương</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <i className="bi bi-camera-video"></i>
                </div>
                <h3>{Stats.TotalVideos}</h3>
                <p>Tổng video</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <i className="bi bi-people"></i>
                </div>
                <h3>{Stats.TotalStudents}</h3>
                <p>Học viên</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Courses */}
        <Row className="mb-4">
          <Col>
            <Card className="courses-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Khóa học gần đây</h4>
                  <Button 
                    variant="outline-dark"
                    onClick={() => navigate("/teacher/courses/manage")}
                  >
                    Xem tất cả
                  </Button>
                </div>
                
                {!RecentCourses || RecentCourses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">Bạn chưa có khóa học nào</p>
                    <Button 
                      variant="dark"
                      onClick={() => navigate("/teacher/courses/manage")}
                    >
                      Tạo khóa học đầu tiên
                    </Button>
                  </div>
                ) : (
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>Tên khóa học</th>
                        <th>Cấp độ</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RecentCourses.map((course) => (
                        <tr key={course.CourseID}>
                          <td className="fw-semibold">{course.CourseName}</td>
                          <td>
                            <span className="badge bg-primary">
                              Level {course.CourseLevel}
                            </span>
                          </td>
                          <td>
                            {new Date(course.CreateAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td>
                            <Button 
                              variant="outline-dark" 
                              size="sm"
                              onClick={() => navigate(`/teacher/courses/${course.CourseID}/edit`)}
                            >
                              Chỉnh sửa
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Teacher Info */}
        <Row>
          <Col md={6}>
            <Card className="info-card">
              <Card.Body>
                <h5 className="mb-3">Thông tin giảng viên</h5>
                <div className="info-item">
                  <strong>Email:</strong> {Teacher.Email}
                </div>
                <div className="info-item">
                  <strong>Ngày tham gia:</strong>{" "}
                  {new Date(Teacher.JoinAt).toLocaleDateString("vi-VN")}
                </div>
                {Teacher.Description && (
                  <div className="info-item">
                    <strong>Giới thiệu:</strong> {Teacher.Description}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TeacherDashboard;
