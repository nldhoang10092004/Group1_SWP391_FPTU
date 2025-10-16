import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ProgressBar, Button, Form, Badge } from "react-bootstrap";
import "./Home.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { getCourses } from "../../middleware/courseAPI";

const Home = () => {
  const [user, setUser] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [hasMembership, setHasMembership] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [activeTab, setActiveTab] = useState("baihoc");
  const [loadingCourses, setLoadingCourses] = useState(true);

  
  const demoData = {
    user: {
      name: "Demo Student",
      xp: 850,
      streak: 5,
      level: 3,
      progress: 50,
    },
    stats: {
      khoahoc: { currentLevel: "Level 3", xpToNext: 850 },
      streak: { days: 5, message: "Keep going!" },
      luyentap: { lessonsCompleted: 15, averageScore: "80%" },
      timeSpent: {time: "2h 30m", times:"This week"},
      achievements: [
        { title: "Grammar Master", description: "Completed 10 grammar lessons", time: "2 days ago" },
        { title: "Vocabulary Builder", description: "Learned 50 new words", time: "1 week ago" },
        { title: "Streak Warrior", description: "7-day study streak", time: "1 week ago" }
      ],
      weeklyGoal: {
        lessons: { completed: 5, total: 7 },
        studyTime: { completed: 180, total: 300, unit: "min" }
      }
    },
  };

  const emptyData = {
    user: {
      name: "User",
      xp: 0,
      streak: 0,
      level: 1,
      progress: 0,
    },
    stats: {
      khoahoc: { currentLevel: "Level 1", xpToNext: 0 },
      streak: { days: 0, message: "Bắt đầu học ngay hôm nay!" },
      luyentap: { lessonsCompleted: 0, averageScore: "0%" },
      timeSpent: {time: "0h 0m", times:"This week"},
      achievements: [],
      weeklyGoal: {
        lessons: { completed: 0, total: 7 },
        studyTime: { completed: 0, total: 300, unit: "min" }
      }
    },
    lessons: []
  };

  // Load data dựa theo loại tài khoản và membership
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Kiểm tra account type từ localStorage
        const accountType = localStorage.getItem("accountType") || "real";
        const membershipStatus = localStorage.getItem("hasMembership") === "true";
        
        setHasMembership(membershipStatus);
        
        if (accountType === "demo") {
          setUser(demoData.user);
          setStatsData(demoData.stats);
          if (membershipStatus) {
            setLessons(demoData.lessons);
          } else {
            setLessons([]);
          }
        } else {
          setUser(emptyData.user);
          setStatsData(emptyData.stats);
          if (membershipStatus) {
            setLessons(demoData.lessons); 
          } else {
            setLessons([]);
          }
        }
        
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [hasMembership]);

  useEffect(() => {
    if (activeTab === "khoahoc") {
      setLoadingCourses(true);
      getCourses()
        .then((res) => setCourses(res.courses || []))
        .catch((err) => console.error(err))
        .finally(() => setLoadingCourses(false));
    }
  }, [activeTab]);

  const handleLevelChange = (level) => setSelectedLevel(level);

  const tabs = [
    { id: "baihoc", label: "Bài học" },
    { id: "khoahoc", label: "Khóa học" },
    { id: "luyentap", label: "Luyện tập" },
    { id: "thongke", label: "Thống kê" }
  ];

  const levels = [
    { id: "all", label: "Tất cả", desc: "Xem tất cả nội dung" },
    { id: "beginner", label: "Beginner", desc: "Cấp độ cơ bản Level 1-3" },
    { id: "intermediate", label: "Intermediate", desc: "Cấp độ trung cấp Level 4-6" },
    { id: "advanced", label: "Advanced", desc: "Cấp độ nâng cao Level 7-10" }
  ];

  const getFilteredLessons = () => {
    if (!lessons || lessons.length === 0) return [];
    
    if (selectedLevel === "all") {
      return lessons;
    }
    
    return lessons.filter(lesson => {
      const lessonLevel = lesson.level?.toLowerCase() || '';
      return lessonLevel === selectedLevel.toLowerCase();
    });
  };

  const filteredLessons = getFilteredLessons();

  if (isLoading) {
    return (
      <div className="home-page">
        <Container>
          <div className="loading text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Đang tải dữ liệu...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
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
                <Button 
                  variant="light" 
                  size="lg" 
                  className="me-3 start-learning-btn"
                  onClick={() => navigate("/courses")}
                >
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
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container>
        {/* Welcome Section */}
        <Row className="welcome-section">
          <Col>
            <h1>Chào mừng trở lại, {user?.name || 'User'}!</h1>
            <Row className="stats-row">
              <Col md={4}>
                <Card className="stat-card">
                  <Card.Body>
                    <h3>{user?.xp || 0}</h3>
                    <p>Tổng XP</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="stat-card">
                  <Card.Body>
                    <h3>{user?.streak || 0}</h3>
                    <p>Chuỗi ngày học</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="stat-card">
                  <Card.Body>
                    <h3>{user?.level || 1}</h3>
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

        {/* Tab Content */}
        {activeTab === "baihoc" && (
          <>
            <Row>
              <Col md={4}>
                <div className="your-lessons-section no-border">
                  <h2 className="text-left">Bài học của bạn</h2>
                  {hasMembership ? (
                    <div className="membership-lessons">
                      <p className="text-success">
                        <Badge bg="success">Premium</Badge> Bạn đang sử dụng gói membership
                      </p>
                      <div className="quick-stats mt-3">
                        <div className="stat-item">
                          <strong>{lessons.filter(l => l.status === 'completed').length}</strong> bài đã hoàn thành
                        </div>
                        <div className="stat-item">
                          <strong>{lessons.filter(l => l.status === 'in-progress').length}</strong> bài đang học
                        </div>
                        <div className="stat-item">
                          <strong>{lessons.filter(l => l.status === 'available').length}</strong> bài học mới
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="non-membership-lessons">
                      <p className="text-muted">Bạn chưa có quyền truy cập vào bài học</p>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate("/membership")}
                      >
                        Đăng ký membership
                      </Button>
                    </div>
                  )}
                </div>
              </Col>
              <Col md={8}>
                <div className="level-section-box">
                  <h3 className="section-title">Chọn cấp độ phù hợp</h3>
                  <p className="current-level">Cấp độ hiện tại của bạn: Level {user?.level || 1}</p>
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

                  {hasMembership ? (
                    <>
                      <div className="divider"></div>
                      <div className="lessons-grid">
                        <h5 className="mb-3">Bài học có sẵn ({filteredLessons.length} bài):</h5>
                        {filteredLessons.length > 0 ? (
                          <Row>
                            {filteredLessons.map((lesson) => (
                              <Col md={6} key={lesson.id} className="mb-3">
                                <div className="lesson-card">
                                  <div className="lesson-header">
                                    <h6>{lesson.title}</h6>
                                    <Badge bg={
                                      lesson.level === "Beginner" ? "primary" : 
                                      lesson.level === "Intermediate" ? "warning" : "danger"
                                    }>
                                      {lesson.level}
                                    </Badge>
                                  </div>
                                  <p className="lesson-description">{lesson.description}</p>
                                  <div className="lesson-meta">
                                    <span className="duration">{lesson.duration}</span>
                                    {lesson.progress > 0 && (
                                      <div className="progress-section">
                                        <ProgressBar 
                                          now={lesson.progress} 
                                          className="lesson-progress" 
                                        />
                                        <span>{lesson.progress}%</span>
                                      </div>
                                    )}
                                    <div className="rating">⭐ {lesson.rating}</div>
                                  </div>
                                  <Button 
                                    variant={
                                      lesson.status === "completed" ? "outline-success" :
                                      lesson.status === "in-progress" ? "primary" : "dark"
                                    }
                                    size="sm"
                                    className="w-100 mt-2"
                                    onClick={() => {
                                      if (lesson.action === "Start Lesson" || lesson.action === "Continue") {
                                        navigate(`/lesson/${lesson.id}`);
                                      } else {
                                        navigate(`/review/${lesson.id}`);
                                      }
                                    }}
                                  >
                                    {lesson.action}
                                  </Button>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        ) : (
                          <div className="no-lessons text-center py-4">
                            <p className="text-muted">Không có bài học nào cho cấp độ này.</p>
                            <Button 
                              variant="outline-primary" 
                              onClick={() => setSelectedLevel("all")}
                            >
                              Xem tất cả bài học
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="divider"></div>
                      <div className="membership-required-section">
                        <div className="membership-message">
                          <h5>🔒 Cần membership để truy cập bài học</h5>
                          <p className="mb-3">Đăng ký membership để truy cập toàn bộ bài học và tính năng học tập</p>
                          <div className="membership-benefits mb-4">
                            <h6>Khi đăng ký membership, bạn sẽ được:</h6>
                            <ul className="text-start">
                              <li>Truy cập toàn bộ bài học từ cơ bản đến nâng cao</li>
                              <li>Học không giới hạn mọi lúc, mọi nơi</li>
                              <li>Nhận chứng chỉ hoàn thành khóa học</li>
                              <li>Hỗ trợ từ giáo viên và cộng đồng</li>
                            </ul>
                          </div>
                          <Button 
                            variant="primary" 
                            size="lg"
                            className="mt-3"
                            onClick={() => navigate("/membership")}
                          >
                            Xem gói membership
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Col>
            </Row>
          </>
        )}

        {activeTab === "khoahoc" && (
          <div>
            {loadingCourses ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Đang tải dữ liệu khóa học...</p>
              </div>
            ) : !courses || courses.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">Hiện chưa có khóa học nào</p>
              </div>
            ) : (
              <div className="course-list">
                <Row>
                  {courses.map((course) => (
                    <Col md={6} lg={4} key={course.courseID} className="mb-4">
                      <Card className="h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5>{course.courseName}</h5>
                            <Badge bg="info">Level {course.courseLevel}</Badge>
                          </div>
                          <p className="text-muted">{course.description}</p>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => navigate(`/course/${course.courseID}`)}
                          >
                            Xem chi tiết
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
        )}

        {activeTab === "luyentap" && (
          <div className="practice-section">
            <h4 className="mb-4">Luyện tập kỹ năng</h4>
            <Row>
              {[
                { title: "Flashcards", icon: "📚", available: true },
                { title: "Luyện viết", icon: "✍️", available: true },
                { title: "Ngữ pháp", icon: "📝", available: true },
                { title: "Luyện nói", icon: "🎤", available: hasMembership },
                { title: "Luyện nghe", icon: "🎧", available: hasMembership },
                { title: "Hội thoại", icon: "💬", available: hasMembership }
              ].map((skill, index) => (
                <Col md={4} key={index} className="mb-3">
                  <div className={`skill-card ${!skill.available ? 'skill-locked' : ''}`}>
                    <div className="skill-icon">{skill.icon}</div>
                    <h6>{skill.title}</h6>
                    {!skill.available && (
                      <Badge bg="secondary" className="mb-2">Premium</Badge>
                    )}
                    <Button
                      variant={skill.available ? "outline-dark" : "outline-secondary"}
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        if (!skill.available && !hasMembership) {
                          navigate("/membership");
                          return;
                        }
                        
                        if (skill.title === "Luyện viết") {
                          navigate("/writingpractice"); 
                        } else if (skill.title === "Flashcards") {
                          navigate("/flashcards");
                        } else if (skill.title === "Ngữ pháp") {
                          navigate("/grammar");
                        } else {
                          alert(`Chức năng "${skill.title}" đang được phát triển!`);
                        }
                      }}
                      disabled={!skill.available}
                    >
                      {skill.available ? "Luyện tập" : "Cần membership"}
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {activeTab === "thongke" && (
          <div className="stats-section">
            <Row>
              <Col md={12}>
                <Row>
                  <Col md={3} className="mb-4">
                    <Card className="stat-card">
                      <Card.Body>
                        <h5>Current Level</h5>
                        <div className="stat-item">
                          <strong>{statsData?.khoahoc?.currentLevel || 'Level 1'}</strong>
                        </div>
                        <div className="stat-item">
                          <span>{statsData?.khoahoc?.xpToNext || 0} XP to next level</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={3} className="mb-4">
                    <Card className="stat-card">
                      <Card.Body>
                        <h5>Study Streak</h5>
                        <div className="stat-item">
                          <span>{statsData?.streak?.days || 0} days in a row</span>
                        </div>
                        <div className="stat-item">
                          <span>{statsData?.streak?.message || 'Start learning today!'}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={3} className="mb-4">
                    <Card className="stat-card">
                      <Card.Body>
                        <h5>Lessons Completed</h5>
                        <div className="stat-item">
                          <strong>{statsData?.luyentap?.lessonsCompleted || 0}</strong>
                        </div>
                        <div className="stat-item">
                          <span>Average score: {statsData?.luyentap?.averageScore || '0%'}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={3} className="mb-4">
                    <Card className="stat-card">
                      <Card.Body>
                        <h5>Time Spent</h5>
                        <div className="stat-item">
                          <strong>{statsData?.timeSpent?.time || '0h 0m'}</strong>
                        </div>
                        <div className="stat-item">
                          <span>{statsData?.timeSpent?.times || 'This week'}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>

              <Col md={12}>
                <Row>
                  <Col md={6} className="mb-4">
                    <Card>
                      <Card.Body>
                        <h5>Recent Achievements</h5>
                        <p className="text-muted">Your latest milestones</p>
                        
                        {statsData?.achievements && statsData.achievements.length > 0 ? (
                          statsData.achievements.map((achievement, index) => (
                            <div key={index} className="achievement-item mb-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-1">{achievement.title}</h6>
                                  <p className="mb-0 text-muted">{achievement.description}</p>
                                </div>
                                <span className="achievement-time text-muted">{achievement.time}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted">Chưa có thành tích nào. Hãy bắt đầu học để nhận thành tích!</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6} className="mb-4">
                    <Card>
                      <Card.Body>
                        <h5>Weekly Goal</h5>
                        <p className="text-muted">Keep up the momentum!</p>
                        
                        <div className="weekly-goal-item mb-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Lessons this week</span>
                            <span>{statsData?.weeklyGoal?.lessons?.completed || 0}/{statsData?.weeklyGoal?.lessons?.total || 7}</span>
                          </div>
                        </div>
                        
                        <div className="weekly-goal-item">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Study time goal</span>
                            <span>{statsData?.weeklyGoal?.studyTime?.completed || 0}/{statsData?.weeklyGoal?.studyTime?.total || 300} {statsData?.weeklyGoal?.studyTime?.unit || 'min'}</span>
                          </div>
                          <ProgressBar 
                            now={(statsData?.weeklyGoal?.studyTime?.completed || 0) / (statsData?.weeklyGoal?.studyTime?.total || 300) * 100} 
                            className="custom-progress-bar"
                          />
                          <p className="text-success mt-2">
                            {((statsData?.weeklyGoal?.studyTime?.completed || 0) / (statsData?.weeklyGoal?.studyTime?.total || 300) * 100) >= 50 
                              ? "You're doing great! Keep it up to reach your weekly goal." 
                              : "Let's get started! Complete your first lesson today."}
                          </p>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Home;