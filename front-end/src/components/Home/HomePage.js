import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import "./HomePage.scss";
import "bootstrap/dist/css/bootstrap.min.css";


const HomePage = () => {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [activeTab, setActiveTab] = useState("baihoc");

  const handleLevelChange = (level) => setSelectedLevel(level);

  const tabs = [
    { id: "baihoc", label: "Bài học" },
    { id: "khoahoc", label: "Khóa học" },
    { id: "luyentap", label: "Luyện tập" },
    { id: "thongke", label: "Thống kê" },
  ];

  const levels = [
    { id: "all", label: "Tất cả", desc: "Xem tất cả nội dung" },
    { id: "beginner", label: "Beginner", desc: "Cấp độ cơ bản - Level 1-3" },
    { id: "intermediate", label: "Intermediate", desc: "Cấp độ trung cấp - Level 4-6" },
    { id: "advanced", label: "Advanced", desc: "Cấp độ nâng cao - Level 7-10" },
  ];

  return (
    <div className="homepage-container">
      {/* Hero Section - GIỮ NGUYÊN */}
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

    <section className="lessons-section py-5">
        <Container>
          {/* Tabs Navigation */}
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

          {/* Content based on active tab */}
          {activeTab === "baihoc" && (
            <>
              <Row>
                <Col md={4}>
                  <div className="your-lessons-section no-border">
                    <h2 className="text-left">Bài học của bạn</h2>
                  </div>
                </Col>
                
                {/* Phần "Chọn cấp độ phù hợp" bên phải - 4 box full width */}
                <Col md={8}>
                  <div className="level-section-box">
                    <h3 className="section-title">Chọn cấp độ phù hợp</h3>
                    <p className="current-level">Cấp độ hiện tại của bạn: Level</p>
                    
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
                          <div className="progress-fill" style={{ width: '45%' }}></div>
                        </div>
                        <div className="progress-info">
                          <span>45% hoàn thành</span>
                          <span>9/20 bài học</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row className="mt-4">
                <Col className="text-center">
                 <h4>Đăng nhập để xem bài học</h4>
                  <p className="text-muted mb-3">
                    Đăng nhập để truy cập bài học và theo dõi tiến độ học tập của bạn
                  </p>
                  <Button variant="outline-dark" size="lg" className="login-button">
                    Đăng nhập ngay
                  </Button>
                </Col>
              </Row>
            </>
          )}

          {activeTab === "khoahoc" && (
            <div className="courses-section">
              <Row>
                {/* English Foundation Course */}
                <Col md={4} className="mb-4">
                  <div className="course-card">
                    <div className="course-header">
                      <h5>English Foundation</h5>
                      <span className="course-level beginner">Beginner</span>
                    </div>
                    <p className="course-description">
                      Build a strong foundation in English with basic vocabulary, grammar, and conversation skills
                    </p>
                    <div className="course-stats">
                      <div className="stat">
                        <strong>2</strong>
                        <span> Bài học</span>
                      </div>
                      <div className="stat">
                        <strong>35m</strong>
                        <span> Thời lượng</span>
                      </div>
                      <div className="stat">
                        <strong>4.8</strong>
                        <span> Đánh giá</span>
                      </div>
                    </div>
                    <div className="course-progress">
                      <span>Tiến độ: 50% hoàn thành</span>
                      <div className="progress-bar-custom">
                        <div className="progress-fill" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                    <Button variant="outline-dark" className="w-100 mt-3">
                      Bắt đầu học
                    </Button>
                  </div>
                </Col>

                {/* Intermediate English Course */}
                <Col md={4} className="mb-4">
                  <div className="course-card">
                    <div className="course-header">
                      <h5>Intermediate English</h5>
                      <span className="course-level intermediate">Intermediate</span>
                    </div>
                    <p className="course-description">
                      Advance your English skills with complex grammar, expanded vocabulary, and natural conversation
                    </p>
                    <div className="course-stats">
                      <div className="stat">
                        <strong>1</strong>
                        <span> Bài học</span>
                      </div>
                      <div className="stat">
                        <strong>25m</strong>
                        <span> Thời lượng</span>
                      </div>
                      <div className="stat">
                        <strong>4.7</strong>
                        <span> Đánh giá</span>
                      </div>
                    </div>
                    <div className="course-progress">
                      <span>Tiến độ: 0% hoàn thành</span>
                      <div className="progress-bar-custom">
                        <div className="progress-fill" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                    <Button variant="outline-dark" className="w-100 mt-3">
                      Bắt đầu học
                    </Button>
                  </div>
                </Col>

                {/* Advanced English Course */}
                <Col md={4} className="mb-4">
                  <div className="course-card">
                    <div className="course-header">
                      <h5>Advanced English</h5>
                      <span className="course-level advanced">Advanced</span>
                    </div>
                    <p className="course-description">
                      Master advanced English with business communication, academic writing, and fluent conversation
                    </p>
                    <div className="course-stats">
                      <div className="stat">
                        <strong>1</strong>
                        <span> Bài học</span>
                      </div>
                      <div className="stat">
                        <strong>30m</strong>
                        <span> Thời lượng</span>
                      </div>
                      <div className="stat">
                        <strong>4.6</strong>
                        <span> Đánh giá</span>
                      </div>
                    </div>
                    <Button variant="outline-dark" className="w-100 mt-3">
                      Đăng ký khóa học
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          )}

          {activeTab === "luyentap" && (
            <div className="practice-section">
              <h4 className="mb-4">Luyện tập kỹ năng</h4>
              <Row>
                {[
                  { title: "Flashcards", icon: "📚" },
                  { title: "Luyện viết", icon: "✏️" },
                  { title: "Ngữ pháp", icon: "📖" },
                  { title: "Luyện nói", icon: "🎤" },
                  { title: "Luyện tập", icon: "💪" },
                  { title: "Thống kê", icon: "📊" }
                ].map((skill, index) => (
                  <Col md={4} key={index} className="mb-3">
                    <div className="skill-card">
                      <div className="skill-icon">{skill.icon}</div>
                      <h6>{skill.title}</h6>
                      <Button variant="outline-dark" size="sm" className="mt-2">
                        Luyện tập
                      </Button>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {activeTab === "thongke" && (
            <div className="stats-section text-center">
              <h4 className="mb-3">Đăng nhập để xem thống kê</h4>
              <p className="text-muted mb-4">
                Theo dõi tiến độ học tập và thành tích của bạn
              </p>
              <Button variant="outline-dark" size="lg">
                Đăng nhập ngay
              </Button>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
};

export default HomePage;