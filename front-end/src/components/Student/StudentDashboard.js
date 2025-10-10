import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, ProgressBar } from "react-bootstrap";
import { getStudentDashboard, getAllCourses } from "../../api/studentAPI";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.scss";

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboard, coursesData] = await Promise.all([
          getStudentDashboard(),
          getAllCourses()
        ]);
        setDashboardData(dashboard);
        setCourses(coursesData.data || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container className="text-center py-5">
        <h3>Unable to load dashboard</h3>
      </Container>
    );
  }

  const { User, Stats } = dashboardData;

  return (
    <div className="student-dashboard">
      <Container className="py-4">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <h1>Chào mừng trở lại, {User.Name}!</h1>
            <p className="text-muted">Tiếp tục hành trình học tập của bạn</p>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <h3>{User.XP}</h3>
                <p>Tổng XP</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <h3>{User.Streak}</h3>
                <p>Chuỗi ngày học</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <h3>Level {User.Level}</h3>
                <p>Trình độ hiện tại</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <h3>{User.Progress}%</h3>
                <p>Tiến độ</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Weekly Goals */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="goal-card">
              <Card.Body>
                <h5>Mục tiêu bài học tuần này</h5>
                <ProgressBar 
                  now={(Stats.WeeklyGoal.Lessons.Completed / Stats.WeeklyGoal.Lessons.Total) * 100} 
                  label={`${Stats.WeeklyGoal.Lessons.Completed}/${Stats.WeeklyGoal.Lessons.Total}`}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="goal-card">
              <Card.Body>
                <h5>Thời gian học tuần này</h5>
                <ProgressBar 
                  now={(Stats.WeeklyGoal.StudyTime.Completed / Stats.WeeklyGoal.StudyTime.Total) * 100} 
                  label={`${Stats.WeeklyGoal.StudyTime.Completed}/${Stats.WeeklyGoal.StudyTime.Total} ${Stats.WeeklyGoal.StudyTime.Unit}`}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Available Courses */}
        <Row className="mb-4">
          <Col>
            <h3>Khóa học có sẵn</h3>
          </Col>
        </Row>
        <Row>
          {courses.slice(0, 4).map((course) => (
            <Col md={6} lg={3} key={course.CourseID} className="mb-3">
              <Card className="course-card h-100">
                <Card.Body>
                  <Card.Title>{course.CourseName}</Card.Title>
                  <Card.Text className="text-muted small">
                    {course.Description || "Học tiếng Anh hiệu quả"}
                  </Card.Text>
                  <div className="course-level mb-2">
                    <span className="badge bg-primary">Level {course.CourseLevel}</span>
                  </div>
                  <Button 
                    variant="dark" 
                    size="sm" 
                    className="w-100"
                    onClick={() => navigate(`/student/courses/${course.CourseID}`)}
                  >
                    Xem chi tiết
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* View All Courses Button */}
        <Row className="mt-3">
          <Col className="text-center">
            <Button 
              variant="outline-dark" 
              size="lg"
              onClick={() => navigate("/student/courses")}
            >
              Xem tất cả khóa học
            </Button>
          </Col>
        </Row>

        {/* Achievements */}
        {Stats.Achievements && Stats.Achievements.length > 0 && (
          <>
            <Row className="mt-4 mb-3">
              <Col>
                <h3>Thành tích gần đây</h3>
              </Col>
            </Row>
            <Row>
              {Stats.Achievements.map((achievement, index) => (
                <Col md={6} key={index} className="mb-3">
                  <Card className="achievement-card">
                    <Card.Body>
                      <h5>{achievement.Title}</h5>
                      <p className="text-muted mb-1">{achievement.Description}</p>
                      <small className="text-muted">{achievement.Time}</small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default StudentDashboard;
