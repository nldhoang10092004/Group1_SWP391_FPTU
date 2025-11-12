import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ProgressBar, Button, Form, Badge, Modal, Table, Spinner } from "react-bootstrap";
import "./Home.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { getCourses } from "../../middleware/courseAPI";
import { checkMembership } from "../../middleware/membershipAPI";
import { getAllQuizzes } from "../../middleware/QuizAPI";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy,
  faFire,
  faBookOpen,
  faHourglassHalf,
  faCheckCircle,
  faClock,
  faStar,
  faLock,
  faGraduationCap,
  faLayerGroup,
  faMicrophone,
  faHeadphones,
  faPencilAlt,
  faFileAlt,
  faComments,
  faListCheck
} from '@fortawesome/free-solid-svg-icons';
import Footer from "../Footer/footer";

const Home = () => {
  const [user, setUser] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [hasMembership, setHasMembership] = useState(false);
  const [membershipInfo, setMembershipInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [activeTab, setActiveTab] = useState("baihoc");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [practiceView, setPracticeView] = useState('main'); // 'main' or 'quizList'
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Attempts state
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  const emptyData = {
    user: {
      name: "Student",
      xp: 0,
      streak: 0,
      level: 1,
      progress: 0,
    },
    stats: {
      khoahoc: { currentLevel: "Level 1", xpToNext: 0 },
      streak: { days: 0, message: "Bắt đầu học ngay hôm nay!" },
      luyentap: { lessonsCompleted: 0, averageScore: "0%" },
      timeSpent: { time: "0h 0m", times: "This week" },
      achievements: [],
      weeklyGoal: {
        lessons: { completed: 0, total: 7 },
        studyTime: { completed: 0, total: 300, unit: "min" }
      }
    },
    lessons: []
  };

  // Temporary lessons data - TODO: Replace with API call
  const tempLessons = [
    { id: 1, title: "Basic Greetings", description: "Learn common greetings and introductions.", level: "Beginner", duration: "15 min", progress: 75, rating: 4.8, status: "in-progress", action: "Continue" },
    { id: 2, title: "Present Tense Verbs", description: "Master the use of present simple and continuous.", level: "Beginner", duration: "20 min", progress: 100, rating: 4.7, status: "completed", action: "Review" },
    { id: 3, title: "Past Tense Stories", description: "Narrate events using past simple and continuous.", level: "Intermediate", duration: "22 min", progress: 0, rating: 4.9, status: "available", action: "Start Lesson" },
    { id: 4, title: "Asking Questions", description: "Formulate effective questions in various contexts.", level: "Intermediate", duration: "18 min", progress: 0, rating: 4.6, status: "available", action: "Start Lesson" },
    { id: 5, title: "Daily Conversations", description: "Practice everyday conversations with common phrases.", level: "Intermediate", duration: "25 min", progress: 0, rating: 4.8, status: "available", action: "Start Lesson" },
    { id: 6, title: "Future Plans & Dreams", description: "Talk about your future aspirations and plans.", level: "Advanced", duration: "28 min", progress: 0, rating: 4.7, status: "available", action: "Start Lesson" },
  ];

  // Load data based on membership
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const userName = localStorage.getItem("userName") || "Student";
        const token = localStorage.getItem("accessToken");

        // Initialize with empty data
        setUser({ ...emptyData.user, name: userName });
        setStatsData(emptyData.stats);

        // Check membership if user is logged in
        if (token) {
          const membershipData = await checkMembership();

          setHasMembership(membershipData.hasMembership);
          setMembershipInfo(membershipData);

          // Load lessons if has membership
          if (membershipData.hasMembership) {
            setLessons(tempLessons);
          } else {
            setLessons([]);
          }
        } else {
          // Not logged in
          setHasMembership(false);
          setMembershipInfo(null);
          setLessons([]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setUser(emptyData.user);
        setStatsData(emptyData.stats);
        setLessons([]);
        setHasMembership(false);
        setMembershipInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
    { id: "beginner", label: "Beginner", desc: "Cấp độ cơ bản" },
    { id: "intermediate", label: "Intermediate", desc: "Cấp độ trung cấp" },
    { id: "advanced", label: "Advanced", desc: "Cấp độ nâng cao" }
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

  // ===== Attempts helpers =====
  const formatVNDateTime = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const openAttemptModal = async () => {
    setShowAttemptModal(true);
    setLoadingAttempts(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("https://localhost:7010/api/attempts", {
        headers: {
          Accept: "*/*",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      const data = await res.json();
      setAttempts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load attempts error:", e);
      setAttempts([]);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const closeAttemptModal = () => setShowAttemptModal(false);

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
      <Container>
        {/* Welcome Section */}
        <Row className="welcome-section">
          <Col>
            <h1>Chào mừng trở lại, {user?.name || 'User'}!</h1>
          </Col>
        </Row>

        {/* Stats Section */}
        <Row className="stats-row">
          {/* <Col md={4} className="mb-4">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                  <FontAwesomeIcon icon={faTrophy} className="stat-icon" style={{ color: '#667eea' }} />
                </div>
                <h3 className="stat-value">{user?.xp || 0}</h3>
                <p className="stat-label">Tổng XP</p>
              </Card.Body>
            </Card>
          </Col> */}
          <Col md={4} className="mb-4">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                  <FontAwesomeIcon icon={faFire} className="stat-icon" style={{ color: '#ffc107' }} />
                </div>
                <h3 className="stat-value">{user?.streak || 0}</h3>
                <p className="stat-label">Chuỗi ngày</p>
              </Card.Body>
            </Card>
          </Col>
          {/* <Col md={4} className="mb-4">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)' }}>
                  <FontAwesomeIcon icon={faBookOpen} className="stat-icon" style={{ color: '#28a745' }} />
                </div>
                <h3 className="stat-value">{user?.level || 1}</h3>
                <p className="stat-label">Cấp độ</p>
              </Card.Body>
            </Card>
          </Col> */}
        </Row>

        {/* Tab Navigation */}
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
          <div className="lessons-section">
            {hasMembership ? (
              <>
                <div className="lessons-header">
                  <div className="header-left">
                    <h4>Bài học của bạn</h4>
                    <p>Chọn cấp độ để khám phá các bài học dành riêng cho bạn.</p>
                  </div>
                  <div className="header-right">
                    <div className="membership-badge">
                      <FontAwesomeIcon icon={faTrophy} />
                      <span>{membershipInfo?.planName || 'Premium'}</span>
                    </div>
                  </div>
                </div>

                <div className="level-filters">
                  {levels.map((level) => (
                    <button
                      key={level.id}
                      className={`level-filter-item ${selectedLevel === level.id ? "active" : ""}`}
                      onClick={() => handleLevelChange(level.id)}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>

                <div className="lessons-grid">
                  {filteredLessons.length > 0 ? (
                    <Row className="g-4">
                      {filteredLessons.map((lesson) => (
                        <Col md={6} lg={4} key={lesson.id}>
                          <div className="lesson-card h-100">
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
                            <div className="lesson-meta mt-auto">
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
                              <FontAwesomeIcon icon={faStar} className="ms-auto me-1" style={{ color: '#ffc107' }} />
                              <div className="rating">{lesson.rating}</div>
                            </div>
                            <Button
                              variant={
                                lesson.status === "completed" ? "outline-success" :
                                  lesson.status === "in-progress" ? "primary" : "dark"
                              }
                              size="sm"
                              className="w-100 mt-3"
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
                    <div className="no-lessons text-center py-5">
                      <FontAwesomeIcon icon={faBookOpen} size="3x" className="mb-3 text-muted" />
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
              <div className="membership-required-section text-center">
                <div className="membership-message">
                  <FontAwesomeIcon icon={faLock} className="lock-icon mb-3" />
                  <h5>Cần có gói Membership để truy cập bài học</h5>
                  <p className="mb-4">Đăng ký để mở khóa toàn bộ bài học và các tính năng học tập nâng cao.</p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate("/membership")}
                  >
                    Xem các gói Membership
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Khóa học Tab Content */}
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
                <FontAwesomeIcon icon={faGraduationCap} size="3x" className="mb-3" style={{ color: '#ccc' }} />
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
            {practiceView === 'main' && (
              <>
                <h4 className="mb-4">Luyện tập kỹ năng</h4>
                <Row>
                  {[
                    { title: "Flashcards", icon: faLayerGroup, color: '#4A90E2', available: true, path: '/flashcards' },
                    { title: "Luyện nói", icon: faMicrophone, color: '#50E3C2', available: hasMembership, path: '/speakingpractice' },
                    { title: "Luyện nghe", icon: faHeadphones, color: '#9013FE', available: hasMembership, path: '/listeningpractice' },
                    { title: "Luyện viết", icon: faPencilAlt, color: '#F5A623', available: true, path: '/writingpractice' },
                    { title: "Ngữ pháp", icon: faFileAlt, color: '#D0021B', available: true, path: '/grammar' },
                    { title: "Quizz", icon: faComments, color: '#4A90E2', available: true, action: 'showQuizzes' }
                  ].map((skill, index) => (
                    <Col md={4} key={index} className="mb-4">
                      <div
                        className={`skill-card ${!skill.available ? 'skill-locked' : ''}`}
                        onClick={async () => {
                          if (skill.available) {
                            navigate(skill.path);
                          } else {
                            navigate("/membership");
                          }
                        }}
                      >
                        <div className="skill-icon-wrapper" style={{ backgroundColor: `${skill.color}20` }}>
                          <FontAwesomeIcon icon={skill.icon} className="skill-icon" style={{ color: skill.color }} />
                        </div>
                        <h6 className="skill-title">{skill.title}</h6>
                        {!skill.available && (
                          <div className="premium-lock">
                            <FontAwesomeIcon icon={faLock} />
                          </div>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </div>
        )}

        {/* Thống kê Tab Content */}
        {activeTab === "thongke" && (
          <div className="new-stats-section">
            <h4 className="mb-4">Tổng quan thành tích</h4>
            <Row>
              {[
                {
                  title: "Cấp độ hiện tại",
                  icon: faGraduationCap,
                  color: '#667eea',
                  value: statsData?.khoahoc?.currentLevel || 'Level 1',
                  label: `${statsData?.khoahoc?.xpToNext || 0} XP để lên cấp`
                },
                {
                  title: "Chuỗi ngày học",
                  icon: faFire,
                  color: '#ffc107',
                  value: `${statsData?.streak?.days || 0} ngày`,
                  label: statsData?.streak?.message || 'Bắt đầu học ngay!'
                },
                {
                  title: "Bài học hoàn thành",
                  icon: faCheckCircle,
                  color: '#28a745',
                  value: statsData?.luyentap?.lessonsCompleted || 0,
                  label: `Điểm trung bình: ${statsData?.luyentap?.averageScore || '0%'}`
                },
                {
                  title: "Thời gian học",
                  icon: faClock,
                  color: '#17a2b8',
                  value: statsData?.timeSpent?.time || '0h 0m',
                  label: statsData?.timeSpent?.times || 'Tuần này'
                }
              ].map((stat, index) => (
                <Col md={6} lg={3} key={index} className="mb-4">
                  <div className="stat-overview-card">
                    <div className="icon-wrapper" style={{ backgroundColor: `${stat.color}20` }}>
                      <FontAwesomeIcon icon={stat.icon} className="stat-icon" style={{ color: stat.color }} />
                    </div>
                    <h6 className="stat-title">{stat.title}</h6>
                    <p className="stat-value">{stat.value}</p>
                    <p className="stat-label">{stat.label}</p>
                  </div>
                </Col>
              ))}
            </Row>

            <Row>
              <Col md={12} lg={6} className="mb-4">
                <Card className="h-100 detail-card">
                  <Card.Body>
                    <h5>Mục tiêu hàng tuần</h5>
                    <p className="text-muted">Duy trì đà học tập của bạn!</p>

                    <div className="weekly-goal-item mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Hoàn thành bài học</span>
                        <span>{statsData?.weeklyGoal?.lessons?.completed || 0}/{statsData?.weeklyGoal?.lessons?.total || 7}</span>
                      </div>
                      <ProgressBar
                        now={((statsData?.weeklyGoal?.lessons?.completed || 0) / (statsData?.weeklyGoal?.lessons?.total || 7)) * 100}
                        className="custom-progress-bar"
                      />
                    </div>

                    <div className="weekly-goal-item">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Thời gian học</span>
                        <span>{statsData?.weeklyGoal?.studyTime?.completed || 0}/{statsData?.weeklyGoal?.studyTime?.total || 300} {statsData?.weeklyGoal?.studyTime?.unit || 'min'}</span>
                      </div>
                      <ProgressBar
                        now={((statsData?.weeklyGoal?.studyTime?.completed || 0) / (statsData?.weeklyGoal?.studyTime?.total || 300)) * 100}
                        className="custom-progress-bar"
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* ĐÃ ĐỔI thành thẻ Attempt */}
              <Col md={12} lg={6} className="mb-4">
                <Card className="h-100 detail-card">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <h5 className="mb-1">Attempt</h5>
                        <p className="text-muted mb-0">Danh sách bài làm (quiz attempts) của bạn</p>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="d-inline-flex align-items-center px-3 py-1 rounded"
                          style={{ backgroundColor: "rgba(102,126,234,0.1)" }}
                        >
                          <FontAwesomeIcon icon={faListCheck} className="me-2" style={{ color: "#667eea" }} />
                          <strong>{attempts.length}</strong>
                        </div>
                        <Button variant="primary" size="sm" onClick={openAttemptModal}>
                          Xem Attempt
                        </Button>
                      </div>
                    </div>

                    {/* Gợi ý 3 attempt gần nhất (nếu đã từng load) */}
                    <div className="mt-3">
                      {attempts && attempts.length > 0 ? (
                        attempts.slice(0, 3).map((a) => (
                          <div
                            key={a.attemptID}
                            className="d-flex align-items-center justify-content-between border rounded p-2 mb-2"
                          >
                            <div>
                              <div className="fw-semibold">{a.quizTitle || "Quiz"}</div>
                              <div className="text-muted small">
                                #{a.attemptID} • {a.course || "—"} • {formatVNDateTime(a.submittedAt)}
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="badge bg-light text-dark">
                                {a.status || "SUBMITTED"}
                              </div>
                              <div className="small text-muted mt-1">
                                Score: {a.autoScore ?? 0}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted py-3">
                          Chưa có attempt nào — bấm “Xem Attempt” để tải danh sách.
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* ===== Attempt Modal ===== */}
        <Modal show={showAttemptModal} onHide={closeAttemptModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Danh sách Attempt</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loadingAttempts ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <div className="mt-2">Đang tải attempts...</div>
              </div>
            ) : attempts.length === 0 ? (
              <div className="text-center text-muted py-3">
                Không có attempt nào để hiển thị.
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover bordered>
                  <thead>
                    <tr>
                      <th>Attempt ID</th>
                      <th>Quiz</th>
                      <th>Khoá học</th>
                      <th>Nộp lúc</th>
                      <th>Điểm</th>
                      <th>Trạng thái</th>
                      <th>Student ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((a) => (
                      <tr key={a.attemptID}>
                        <td>#{a.attemptID}</td>
                        <td>{a.quizTitle || "—"}</td>
                        <td>{a.course || "—"}</td>
                        <td>{formatVNDateTime(a.submittedAt)}</td>
                        <td>{a.autoScore ?? 0}</td>
                        <td>
                          <Badge bg={a.status === "SUBMITTED" ? "info" : "secondary"}>
                            {a.status || "SUBMITTED"}
                          </Badge>
                        </td>
                        <td>{a.studentID}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeAttemptModal}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Home;
