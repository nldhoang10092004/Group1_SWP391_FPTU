import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ProgressBar, Button, Form, Badge } from "react-bootstrap";
import "./Home.scss"; 
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { getCourses } from "../../middleware/courseAPI"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faFire, faBookOpen, faHourglassHalf, faCheckCircle, faClock, faStar, faLock, faGraduationCap, faUsers, faQuestionCircle, faShieldAlt, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import Footer from "../Footer/footer";

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
      name: "Student", 
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
        { title: "Bậc thầy ngữ pháp", description: "Hoàn thành 10 bài ngữ pháp", time: "2 ngày trước" },
        { title: "Người xây dựng từ vựng", description: "Học được 50 từ mới", time: "1 tuần trước" },
        { title: "Chiến binh chuỗi ngày", description: "Chuỗi học 7 ngày", time: "1 tuần trước" }
      ],
      weeklyGoal: {
        lessons: { completed: 5, total: 7 },
        studyTime: { completed: 180, total: 300, unit: "min" }
      }
    },
    lessons: [
      { id: 1, title: "Basic Greetings", description: "Learn common greetings and introductions.", level: "Beginner", duration: "15 min", progress: 75, rating: 4.8, status: "in-progress", action: "Continue" },
      { id: 2, title: "Present Tense Verbs", description: "Master the use of present simple and continuous.", level: "Beginner", duration: "20 min", progress: 100, rating: 4.7, status: "completed", action: "Review" },
      { id: 3, title: "Past Tense Stories", description: "Narrate events using past simple and continuous.", level: "Intermediate", duration: "22 min", progress: 0, rating: 4.9, status: "available", action: "Start Lesson" },
      { id: 4, title: "Asking Questions", description: "Formulate effective questions in various contexts.", level: "Intermediate", duration: "18 min", progress: 0, rating: 4.6, status: "available", action: "Start Lesson" },
      { id: 5, title: "Daily Conversations", description: "Practice everyday conversations with common phrases.", level: "Intermediate", duration: "25 min", progress: 0, rating: 4.8, status: "available", action: "Start Lesson" },
      { id: 6, title: "Future Plans & Dreams", description: "Talk about your future aspirations and plans.", level: "Advanced", duration: "28 min", progress: 0, rating: 4.7, status: "available", action: "Start Lesson" },
    ]
  };

  const emptyData = {
    user: {
      name: "Student", // Changed to match image
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
  // --- END DEMO DATA ---

  // Load data based on account type and membership
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
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
          // For 'real' accounts, start with empty data, but if they have membership, show demo lessons
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
  }, []); // Empty dependency array means this runs once on mount

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
    
    // Filter by level, ensure case-insensitive comparison
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
      {/* <section className="hero-section">
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
                <img src="https://via.placeholder.com/600x400/e0e7ff/667eea?text=EnglishMaster+Hero" alt="EnglishMaster" className="hero-logo" />
              </div>
            </Col>
          </Row>
        </Container>
      </section> */}

      <Container>
        {/* Welcome Section - Matches second screenshot */}
        <Row className="welcome-section">
          <Col>
            <h1>Chào mừng trở lại, {user?.name || 'User'}!</h1>
            <Row className="stats-row">
              <Col md={4} className="mb-4">
                <Card className="stat-card">
                  <Card.Body>
                    <FontAwesomeIcon icon={faTrophy} size="2x" className="mb-2" style={{color: '#667eea'}}/>
                    <h3>{user?.xp || 0}</h3>
                    <p>Tổng XP</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-4">
                <Card className="stat-card">
                  <Card.Body>
                    <FontAwesomeIcon icon={faFire} size="2x" className="mb-2" style={{color: '#ffc107'}}/>
                    <h3>{user?.streak || 0}</h3>
                    <p>Chuỗi ngày</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-4">
                <Card className="stat-card">
                  <Card.Body>
                    <FontAwesomeIcon icon={faBookOpen} size="2x" className="mb-2" style={{color: '#28a745'}}/>
                    <h3>{user?.level || 1}</h3>
                    <p>Cấp độ</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Tab Navigation - Matches second screenshot */}
        <Row className="lessons-nav">
          <Col>
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
          <Row>
            <Col md={4}>
              <div className="your-lessons-section">
                <h2 className="text-left">Bài học của bạn</h2>
                {hasMembership ? (
                  <div className="membership-lessons">
                    <p className="text-success">
                      <Badge bg="success">Premium</Badge> Bạn đang sử dụng gói membership
                    </p>
                    <div className="quick-stats mt-3">
                      <div className="stat-item">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" style={{color: '#28a745'}}/>
                        <strong>{lessons.filter(l => l.status === 'completed').length}</strong> bài đã hoàn thành
                      </div>
                      <div className="stat-item">
                        <FontAwesomeIcon icon={faHourglassHalf} className="me-2" style={{color: '#ffc107'}}/>
                        <strong>{lessons.filter(l => l.status === 'in-progress').length}</strong> bài đang học
                      </div>
                      <div className="stat-item">
                        <FontAwesomeIcon icon={faBookOpen} className="me-2" style={{color: '#667eea'}}/>
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
                <Row className="level-options">
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
                                  <FontAwesomeIcon icon={faClock} className="me-1" />
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
                                  <FontAwesomeIcon icon={faStar} className="ms-auto me-1" style={{color: '#ffc107'}} />
                                  <div className="rating">{lesson.rating}</div>
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
                          <FontAwesomeIcon icon={faBookOpen} size="3x" className="mb-3" style={{color: '#ccc'}}/>
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
                        <h5><FontAwesomeIcon icon={faLock} className="me-2"/> Cần membership để truy cập bài học</h5>
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
        )}

        {/* Khóa học Tab Content - Matches third screenshot */}
        {activeTab === "khoahoc" && (
          <div className="course-list">
            {loadingCourses ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Đang tải dữ liệu khóa học...</p>
              </div>
            ) : !courses || courses.length === 0 ? (
              <div className="text-center py-4">
                <FontAwesomeIcon icon={faGraduationCap} size="3x" className="mb-3" style={{color: '#ccc'}}/>
                <p className="text-muted">Hiện chưa có khóa học nào</p>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* Luyện tập Tab Content */}
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
                { title: "Quizz", icon: "💬", available: hasMembership }
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

        {/* Thống kê Tab Content - Matches fourth and fifth screenshots */}
        {activeTab === "thongke" && (
          <div className="stats-section">
            <Row>
              <Col md={12}>
                <Row>
                  <Col md={3} className="mb-4">
                    <Card className="stat-card">
                      <Card.Body>
                        <FontAwesomeIcon icon={faGraduationCap} size="2x" className="mb-2" style={{color: '#667eea'}}/>
                        <h5>Cấp độ hiện tại</h5>
                        <div className="stat-item">
                          <strong>{statsData?.khoahoc?.currentLevel || 'Level 1'}</strong>
                        </div>
                        <div className="stat-item">
                          <span>{statsData?.khoahoc?.xpToNext || 0} XP để lên cấp độ tiếp theo</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={3} className="mb-4">
                    <Card className="stat-card">
                      <Card.Body>
                        <FontAwesomeIcon icon={faFire} size="2x" className="mb-2" style={{color: '#ffc107'}}/>
                        <h5>Chuỗi ngày học</h5>
                        <div className="stat-item">
                          <strong>{statsData?.streak?.days || 0} ngày liên tiếp</strong>
                        </div>
                        <div className="stat-item">
                          <span>{statsData?.streak?.message || 'Bắt đầu học ngay hôm nay!'}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={3} className="mb-4">
                    <Card className="stat-card">
                      <Card.Body>
                        <FontAwesomeIcon icon={faCheckCircle} size="2x" className="mb-2" style={{color: '#28a745'}}/>
                        <h5>Bài học đã hoàn thành</h5>
                        <div className="stat-item">
                          <strong>{statsData?.luyentap?.lessonsCompleted || 0}</strong>
                        </div>
                        <div className="stat-item">
                          <span>Điểm trung bình: {statsData?.luyentap?.averageScore || '0%'}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={3} className="mb-4">
                    <Card className="stat-card">
                      <Card.Body>
                        <FontAwesomeIcon icon={faClock} size="2x" className="mb-2" style={{color: '#17a2b8'}}/>
                        <h5>Thời gian học</h5>
                        <div className="stat-item">
                          <strong>{statsData?.timeSpent?.time || '0h 0m'}</strong>
                        </div>
                        <div className="stat-item">
                          <span>{statsData?.timeSpent?.times || 'Tuần này'}</span>
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
                        <h5>Thành tích gần đây</h5>
                        <p className="text-muted">Các cột mốc mới nhất của bạn</p>
                        
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
                        <h5>Mục tiêu hàng tuần</h5>
                        <p className="text-muted">Duy trì đà học tập!</p>
                        
                        <div className="weekly-goal-item mb-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Bài học trong tuần</span>
                            <span>{statsData?.weeklyGoal?.lessons?.completed || 0}/{statsData?.weeklyGoal?.lessons?.total || 7}</span>
                          </div>
                          <ProgressBar 
                            now={(statsData?.weeklyGoal?.lessons?.completed || 0) / (statsData?.weeklyGoal?.lessons?.total || 7) * 100} 
                            className="custom-progress-bar"
                          />
                        </div>
                        
                        <div className="weekly-goal-item">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Mục tiêu thời gian học</span>
                            <span>{statsData?.weeklyGoal?.studyTime?.completed || 0}/{statsData?.weeklyGoal?.studyTime?.total || 300} {statsData?.weeklyGoal?.studyTime?.unit || 'min'}</span>
                          </div>
                          <ProgressBar 
                            now={(statsData?.weeklyGoal?.studyTime?.completed || 0) / (statsData?.weeklyGoal?.studyTime?.total || 300) * 100} 
                            className="custom-progress-bar"
                          />
                          <p className="text-success mt-2">
                            {((statsData?.weeklyGoal?.studyTime?.completed || 0) / (statsData?.weeklyGoal?.studyTime?.total || 300) * 100) >= 50 
                              ? "Bạn đang làm rất tốt! Hãy tiếp tục để đạt mục tiêu hàng tuần." 
                              : "Hãy bắt đầu! Hoàn thành bài học đầu tiên của bạn ngay hôm nay."}
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
      <Footer />
    </div>
  );
};

export default Home;