import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ProgressBar, Button, Form } from "react-bootstrap";
import "./Home.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  const [user, setUser] = useState({
    name: "Demo Student",
    xp: 0,
    streak: 0,
    level: 1,
    progress: 0
  });

  const [statsData, setStatsData] = useState({
    khoahoc: { currentLevel: "Level 1", xpToNext: 0 },
    streak: { days: 0, message: "Bắt đầu học ngay hôm nay!" },
    luyentap: { lessonsCompleted: 0, averageScore: "0%" },
    timeSpent: "this week",
    achievements: [],
    weeklyGoal: {
      lessons: { completed: 0, total: 7 },
      studyTime: { completed: 0, total: 300, unit: "min" }
    }
  });

  
  useEffect(() => {
    // Bỏ comment khi có backend thật
    // fetch("/api/user-info")
    //   .then((res) => res.json())
    //   .then((data) => {
    //     setUser(data.user);
    //     setStatsData(data.stats);
    //   });

    // Dữ liệu giả để test giao diện (bạn có thể xóa)
    const demoData = {
      name: "Demo Student",
      xp: 850,
      streak: 5,
      level: 3,
      progress: 60
    };
    const demoStats = {
      khoahoc: { currentLevel: "Level 3", xpToNext: 850 },
      streak: { days: 5, message: "Keep going!" },
      luyentap: { lessonsCompleted: 15, averageScore: "80%" },
      timeSpent: "this week",
      achievements: [
        { title: "Grammar Master", description: "Completed 10 grammar lessons", time: "2 days ago" },
        { title: "Vocabulary Builder", description: "Learned 50 new words", time: "3 week ago" }
      ],
      weeklyGoal: {
        lessons: { completed: 5, total: 7 },
        studyTime: { completed: 180, total: 300, unit: "min" }
      }
    };

    setUser(demoData);
    setStatsData(demoStats);
  }, []);

  const [selectedLevel, setSelectedLevel] = useState("all");
  const [activeTab, setActiveTab] = useState("baihoc");

  const handleLevelChange = (level) => setSelectedLevel(level);

  const tabs = [
    { id: "baihoc", label: "Bài học" },
    { id: "khoahoc", label: "Khóa học" },
    { id: "luyentap", label: "Luyện tập" },
    { id: "thongke", label: "Thống kê" }
  ];

  const levels = [
    { id: "all", label: "Tất cả", desc: "Xem tất cả nội dung" },
    { id: "beginner", label: "Beginner", desc: "Cấp độ cơ bản - Level 1-3" },
    { id: "intermediate", label: "Intermediate", desc: "Cấp độ trung cấp - Level 4-6" },
    { id: "advanced", label: "Advanced", desc: "Cấp độ nâng cao - Level 7-10" }
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="hero-title">Master English with Interactive Lessons</h1>
              <p className="hero-description">
                Learn English naturally with our AI-powered lessons, real conversations,
                and personalized practice exercises. Join millions of learners worldwide.
              </p>
              <div className="hero-buttons">
                <Button variant="light" size="lg" className="me-3 start-learning-btn">
                  Start Learning Free
                </Button>
                <Button variant="outline-light" size="lg" className="watch-demo-btn">
                  Watch Demo
                </Button>
              </div>
              <div className="hero-stats mt-4">
                <div className="stat-item"><strong>4.9/5</strong> rating</div>
                <div className="stat-item"><strong>2M+</strong> learners</div>
                <div className="stat-item"><strong>1,000+</strong> lessons</div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image-container">
                <img src="/logo.jpg" alt="EnglishMaster" className="hero-logo" />
                <div className="live-lesson-badge">
                  <span className="live-dot"></span> Live lesson in progress
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container>
        {/* Welcome Section */}
        <Row className="welcome-section">
          <Col>
            <h1>Chào mừng trở lại, {user.name}!</h1>
            <Row className="stats-row">
              <Col md={4}>
                <Card className="stat-card">
                  <Card.Body>
                    <h3>{user.xp}</h3>
                    <p>Tổng XP</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="stat-card">
                  <Card.Body>
                    <h3>{user.streak}</h3>
                    <p>Chuỗi ngày học</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="stat-card">
                  <Card.Body>
                    <h3>{user.level}</h3>
                    <p>Trình độ hiện tại</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        <hr className="section-divider" />

        {/* Lessons Navigation */}
        <Row className="lessons-nav">
          <Col>
            <h2>Bài học</h2>
            <div className="tab-navigation mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </Col>
        </Row>

        <hr className="section-divider" />

        {activeTab === "baihoc" && (
          <>
            <Row>
              <Col md={4}>
                <div className="your-lessons-section no-border">
                  <h2 className="text-left">Bài học của bạn</h2>
                </div>
              </Col>
              <Col md={8}>
                <div className="level-section-box">
                  <h3 className="section-title">Chọn cấp độ phù hợp</h3>
                  <p className="current-level">Cấp độ hiện tại của bạn: Level {user.level}</p>
                  <Row className="level-options full-width">
                    {levels.map((level) => (
                      <Col md={3} key={level.id} className="mb-3">
                        <div className={`level-card ${selectedLevel === level.id ? "active" : ""}`}>
                          <Form.Check
                            type="radio"
                            name="levelSelection"
                            id={level.id}
                            checked={selectedLevel === level.id}
                            onChange={() => handleLevelChange(level.id)}
                            className="level-radio"
                          />
                          <label htmlFor={level.id} className="level-label">
                            <strong className="level-name">{level.label}</strong>
                            <div className="level-description">{level.desc}</div>
                          </label>
                        </div>
                      </Col>
                    ))}
                  </Row>

                  <div className="divider"></div>
                  <div className="progress-section">
                    <h5 className="progress-title">Tiến độ mở khóa:</h5>
                    <div className="progress-container">
                      <div className="progress-bar-custom">
                        <div className="progress-fill" style={{ width: `${user.progress}%` }}></div>
                      </div>
                      <div className="progress-info">
                        <span>{user.progress}% hoàn thành</span>
                        <span>{Math.round(user.progress / 5)}/20 bài học</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}

        {activeTab === "thongke" && (
          <div className="stats-section">
            <Row>
              <Col md={8}>
                <h3 className="mb-4">Thống kê học tập</h3>
                <Card className="mb-4 stat-card">
                  <Card.Body>
                    <h5>Khóa học</h5>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Current Level</span>
                      <strong>{statsData.khoahoc.currentLevel}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span>XP to next level</span>
                      <strong>{statsData.khoahoc.xpToNext} XP</strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Home;
