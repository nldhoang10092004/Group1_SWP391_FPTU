import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ProgressBar, Button, Badge, Modal, Table } from "react-bootstrap";
import "./Home.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { getCourses } from "../../middleware/courseAPI";
import { checkMembership } from "../../middleware/membershipAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faFire,
  faBookOpen,
  faCheckCircle,
  faClock,
  faLock,
  faGraduationCap,
  faLayerGroup,
  faMicrophone,
  faHeadphones,
  faPencilAlt,
  faFileAlt,
  faComments,
  faTrash,
  faPlay,
  faVideo,
  faListCheck
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  // ===== State =====
  const [user, setUser] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [lessonHistory, setLessonHistory] = useState([]);
  const [hasMembership, setHasMembership] = useState(false);
  const [membershipInfo, setMembershipInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [activeTab, setActiveTab] = useState("baihoc"); // "baihoc" = Lịch sử xem
  const [selectedLevel, setSelectedLevel] = useState("all");

  // Attempts (quiz)
  const [attempts, setAttempts] = useState([]);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  const [streakDays, setStreakDays] = useState(0);

  const navigate = useNavigate();

  // ===== Constants =====
  const emptyData = {
    user: {
      name: "Student",
      xp: 0,
      streak: 0,
      level: 1,
      progress: 0
    },
    stats: {
      khoahoc: { currentLevel: "Level 1", xpToNext: 0 },
      streak: { days: 0, message: "Bắt đầu học ngay hôm nay!" },
      luyentap: { lessonsCompleted: 0, averageScore: "0%" },
      timeSpent: { time: "0h 0m", times: "This week" },
      weeklyGoal: {
        lessons: { completed: 0, total: 7 },
        studyTime: { completed: 0, total: 300, unit: "min" }
      }
    }
  };

  // ===== Helpers =====
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      Accept: "*/*",
      Authorization: token ? `Bearer ${token}` : undefined,
      "ngrok-skip-browser-warning": "true"
    };
  };

  const formatVNDateTime = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(d);
  };

  const formatDateTime = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(d);
  };

  const formatDuration = (minutes) => {
    // Handle invalid inputs
    if (minutes === null || minutes === undefined || isNaN(minutes)) {
      return "0 phút";
    }

    // Convert to number and ensure positive
    const totalMinutes = Math.max(0, Math.round(Number(minutes)));
    if (totalMinutes === 0) {
      return "0 phút";
    }
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
      if (mins > 0) {
        return `${hours} giờ ${mins} phút`;
      }
      return `${hours} giờ`;
    }
    return `${mins} phút`;
  };
  const formatSecondsToMinutes = (seconds) => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return "0 phút";
    }

    const totalSeconds = Math.max(0, Math.round(Number(seconds)));
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    if (minutes === 0) {
      return `${secs} giây`;
    }

    if (secs === 0) {
      return `${minutes} phút`;
    }

    return `${minutes} phút ${secs} giây`;
  };

  const cleanVideoHistoryData = () => {
    try {
      const historyStr = localStorage.getItem("videoWatchHistory");
      if (!historyStr) return;

      const history = JSON.parse(historyStr);
      if (!Array.isArray(history)) return;

      // Clean and validate each entry
      const cleanedHistory = history.map(entry => {
        // Ensure duration is a valid number
        const duration = Number(entry.duration) || 0;
        const watchedMinutes = Number(entry.watchedMinutes) || 0;
        const progress = Number(entry.progress) || 0;

        // Fix: If progress >= 95%, mark as 100% complete
        const finalProgress = progress >= 95 ? 100 : Math.min(progress, 100);

        return {
          ...entry,
          duration: Math.round(duration), // Ensure integer
          watchedMinutes: Math.round(Math.min(watchedMinutes, duration)), // Can't exceed duration
          progress: finalProgress, // 0-100
        };
      });

      // Save cleaned data
      localStorage.setItem("videoWatchHistory", JSON.stringify(cleanedHistory));
      console.log("✅ Cleaned video history data");

      return cleanedHistory;
    } catch (error) {
      console.error("❌ Error cleaning video history:", error);
      return null;
    }
  };
  // Chuẩn hoá phút -> "Xh Ym"
  const toHM = (mins) => {
    const total = Math.max(0, Math.round(mins || 0)); // làm tròn & tránh NaN/âm
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}h ${m}m`;
  };

  const openAttemptModal = () => setShowAttemptModal(true);
  const closeAttemptModal = () => setShowAttemptModal(false);

  const calculateStreak = (arr) => {
    if (!arr || arr.length === 0) return 0;
    const getDateStr = (d) => new Date(d).toDateString();
    // arr có thể là attempts (submittedAt) hoặc video history (lastWatched)
    const uniqueDates = [
      ...new Set(arr.map((x) => getDateStr(x.submittedAt || x.lastWatched)))
    ].sort((a, b) => new Date(b) - new Date(a));

    if (uniqueDates.length === 0) return 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let streak = 1;
    let currentDate = new Date(uniqueDates[0]);
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      const dayDiff = Math.floor((currentDate - prevDate) / 86400000);
      if (dayDiff === 1) {
        streak++;
        currentDate = prevDate;
      } else break;
    }
    return streak;
  };

  // ===== Video History (localStorage) =====
  const loadLessonHistory = () => {
    try {
      // First, clean the data
      const cleanedData = cleanVideoHistoryData();

      const historyStr = localStorage.getItem("videoWatchHistory");
      if (historyStr) {
        const history = JSON.parse(historyStr);
        const historyArray = Array.isArray(history) ? history : [];

        // Sort by lastWatched (newest first)
        historyArray.sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));

        console.log("📚 Loaded lesson history:", historyArray);
        setLessonHistory(historyArray);
      } else {
        setLessonHistory([]);
      }
    } catch (error) {
      console.error("❌ Error loading history:", error);
      setLessonHistory([]);
    }
  };

  const loadStatsFromHistory = () => {
    try {
      const historyStr = localStorage.getItem("videoWatchHistory");
      if (historyStr) {
        const history = JSON.parse(historyStr);
        const calculatedStreak = calculateStreak(history);
        setStreakDays(calculatedStreak);

        const totalVideos = history.length;
        const completedVideos = history.filter(h => h.progress >= 100).length;
        const completionRate = totalVideos > 0 ? ((completedVideos / totalVideos) * 100).toFixed(1) : 0;

        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const thisWeek = history.filter(h => new Date(h.lastWatched) >= weekAgo);
        const weeklyVideos = thisWeek.length;
        const weeklyMinutes = thisWeek.reduce((sum, h) => sum + (Number(h.watchedMinutes) || 0), 0);

        setStatsData({
          khoahoc: {
            currentLevel: `Level ${Math.floor(totalVideos / 10) + 1}`,
            xpToNext: 100 - (totalVideos % 10) * 10
          },
          streak: {
            days: calculatedStreak,
            message: calculatedStreak > 0
              ? `Tuyệt vời! Bạn đã học ${calculatedStreak} ngày liên tiếp!`
              : "Bắt đầu học ngay hôm nay!"
          },
          luyentap: {
            lessonsCompleted: totalVideos,
            averageScore: `${completionRate}%`
          },
          timeSpent: {
            time: toHM(weeklyMinutes),   // <<<<<<  dùng helper ở đây
            times: "Tuần này"
          },
          weeklyGoal: {
            lessons: { completed: weeklyVideos, total: 7 },
            studyTime: { completed: Math.round(weeklyMinutes), total: 300, unit: "min" }
          }
        });
      } else {
        setStreakDays(0);
        setStatsData(emptyData.stats);
      }
    } catch (error) {
      console.error("❌ Error loading stats:", error);
      setStreakDays(0);
      setStatsData(emptyData.stats);
    }
  };


  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem video?")) {
      localStorage.removeItem("videoWatchHistory");
      loadLessonHistory();
      loadStatsFromHistory();
    }
  };

  // ===== Attempts + Stats từ API (quiz) =====
const loadAttemptsAndStats = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attempts`, {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      const attemptsArray = Array.isArray(data) ? data : [];
      setAttempts(attemptsArray);
    } else {
      setAttempts([]);
    }
  } catch (error) {
    console.error("❌ Error loading attempts:", error);
    setAttempts([]);
  }
};

// 1. Effect chính - Load data khi component mount
useEffect(() => {
  const loadData = async () => {
    try {
      setIsLoading(true);

      const userName = localStorage.getItem("userName") || "Student";
      const token = localStorage.getItem("accessToken");

      setUser({ ...emptyData.user, name: userName });
      setStatsData(emptyData.stats);

      if (token) {
        const membershipData = await checkMembership();
        setHasMembership(membershipData.hasMembership);
        setMembershipInfo(membershipData);

        // Lịch sử xem video (localStorage)
        loadLessonHistory();
        loadStatsFromHistory();

        // Attempts cho thống kê (API)
        await loadAttemptsAndStats();
      } else {
        setHasMembership(false);
        setMembershipInfo(null);
        setLessonHistory([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setUser(emptyData.user);
      setStatsData(emptyData.stats);
      setLessonHistory([]);
      setHasMembership(false);
      setMembershipInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// 2. Load courses khi chuyển tab
useEffect(() => {
  if (activeTab === "khoahoc") {
    setLoadingCourses(true);
    getCourses()
      .then((res) => setCourses(res.courses || []))
      .catch((err) => console.error(err))
      .finally(() => setLoadingCourses(false));
  }
}, [activeTab]);

// 3. Auto-refresh khi video history được cập nhật từ CourseDetail
useEffect(() => {
  const handleHistoryUpdate = () => {
    console.log("🔄 Video history updated from CourseDetail!");
    loadLessonHistory();
    loadStatsFromHistory();
  };

  // Lắng nghe event từ CourseDetail
  window.addEventListener('videoHistoryUpdated', handleHistoryUpdate);

  return () => {
    window.removeEventListener('videoHistoryUpdated', handleHistoryUpdate);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// 4. Reload history khi chuyển về tab "baihoc"
useEffect(() => {
  if (activeTab === "baihoc") {
    console.log("🔄 Reloading history for baihoc tab");
    loadLessonHistory();
    loadStatsFromHistory();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab]);

  // ===== UI data helpers =====
  const handleLevelChange = (level) => setSelectedLevel(level);

  const tabs = [
    { id: "baihoc", label: "Lịch sử xem" },
    { id: "khoahoc", label: "Khóa học" },
    { id: "luyentap", label: "Luyện tập" },
    { id: "thongke", label: "Thống kê" }
  ];

  const levels = [
    { id: "all", label: "Tất cả" },
    { id: "watching", label: "Đang xem" },
    { id: "completed", label: "Đã hoàn thành" }
  ];

  const getFilteredLessons = () => {
    if (!lessonHistory || lessonHistory.length === 0) return [];
    if (selectedLevel === "all") return lessonHistory;
    if (selectedLevel === "watching") return lessonHistory.filter((l) => l.progress < 100);
    if (selectedLevel === "completed") return lessonHistory.filter((l) => l.progress >= 100);
    return lessonHistory;
  };

  const filteredLessons = getFilteredLessons();


  // ===== Render =====
  return (
    <div className="home-page">
      <Container>
        {isLoading ? (
          <div className="loading text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Welcome */}
            <Row className="welcome-section">
              <Col>
                <h1>Chào mừng trở lại, {user?.name || "User"}!</h1>
              </Col>
            </Row>

            {/* Stats (quick cards) */}
            <Row className="stats-row">
              <Col md={4} className="mb-4">
                <Card className="stat-card">
                  <Card.Body>
                    <div className="stat-icon-wrapper" style={{ backgroundColor: "rgba(255, 193, 7, 0.1)" }}>
                      <FontAwesomeIcon icon={faFire} className="stat-icon" style={{ color: "#ffc107" }} />
                    </div>
                    <h3 className="stat-value">{streakDays}</h3>
                    <p className="stat-label">Chuỗi ngày học</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Tabs */}
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

            {/* Tab: Lịch sử xem (Video history) */}
            {activeTab === "baihoc" && (
              <div className="lessons-section">
                {hasMembership ? (
                  <>
                    <div className="lessons-header">
                      <div className="header-left">
                        <h4>Lịch sử xem video</h4>
                        <p>Các video bài học bạn đã và đang xem trong các khóa học.</p>
                      </div>
                      <div className="header-right">
                        {lessonHistory.length > 0 && (
                          <Button variant="outline-danger" size="sm" onClick={handleClearHistory} className="me-2">
                            <FontAwesomeIcon icon={faTrash} className="me-1" />
                            Xóa lịch sử
                          </Button>
                        )}
                        <div className="membership-badge">
                          <FontAwesomeIcon icon={faTrophy} />
                          <span>{membershipInfo?.planName || "Premium"}</span>
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
                              <Card
                                className="h-100 shadow-sm border-0"
                                style={{ overflow: "hidden", cursor: "pointer" }}
                              >
                                <div
                                  style={{
                                    height: "180px",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    position: "relative"
                                  }}
                                  onClick={() => navigate(`/course/${lesson.courseID}`)}
                                >
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "50%",
                                      left: "50%",
                                      transform: "translate(-50%, -50%)",
                                      opacity: 0.2
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faVideo} size="4x" style={{ color: "#fff" }} />
                                  </div>

                                  <div
                                    className="play-overlay"
                                    style={{
                                      position: "absolute",
                                      top: "50%",
                                      left: "50%",
                                      transform: "translate(-50%, -50%)",
                                      background: "rgba(0,0,0,0.6)",
                                      borderRadius: "50%",
                                      width: "60px",
                                      height: "60px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      transition: "all 0.3s ease"
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faPlay} size="lg" style={{ color: "#fff", marginLeft: "3px" }} />
                                  </div>

                                  <Badge
                                    bg={lesson.progress >= 100 ? "success" : "warning"}
                                    style={{
                                      position: "absolute",
                                      top: "12px",
                                      right: "12px",
                                      padding: "6px 12px"
                                    }}
                                  >
                                    {lesson.progress >= 100 ? (
                                      <>
                                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                        Hoàn thành
                                      </>
                                    ) : (
                                      `${lesson.progress}%`
                                    )}
                                  </Badge>

                                  {lesson.progress < 100 && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: "4px",
                                        background: "rgba(255,255,255,0.3)"
                                      }}
                                    >
                                      <div
                                        style={{
                                          height: "100%",
                                          width: `${lesson.progress}%`,
                                          background: "#ffc107",
                                          transition: "width 0.3s ease"
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                                <Card.Body>
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <FontAwesomeIcon
                                      icon={faBookOpen}
                                      style={{ color: "#667eea", fontSize: "14px" }}
                                    />
                                    <small className="text-muted text-truncate">{lesson.courseName}</small>
                                  </div>

                                  <h6 className="mb-2" style={{ fontWeight: 600, fontSize: "15px" }}>
                                    {lesson.lessonTitle}
                                  </h6>

                                  <p className="text-muted small mb-3">
                                    <FontAwesomeIcon icon={faClock} className="me-1" />
                                    {formatDateTime(lesson.lastWatched)}
                                  </p>

                                  {/* Duration Info */}
                                  <div className="d-flex justify-content-between align-items-center text-muted small mb-2">
                                    <span>
                                      <FontAwesomeIcon icon={faVideo} className="me-1" />
                                      Thời lượng: <strong>{formatDuration(lesson.duration)}</strong>
                                    </span>
                                    <span className={lesson.progress >= 100 ? "text-success fw-bold" : ""}>
                                      {lesson.progress}%
                                    </span>
                                  </div>

                                  {/* Watched Time */}
                                  <div className="text-muted small mb-3">
                                    <FontAwesomeIcon icon={faClock} className="me-1" />
                                    Đã xem: <strong className={lesson.progress >= 100 ? "text-success" : ""}>
                                      {formatDuration(lesson.watchedMinutes)}
                                    </strong>
                                    {lesson.progress >= 100 && (
                                      <Badge bg="success" className="ms-2">
                                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                        Hoàn thành
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Progress Bar (only show if not completed) */}
                                  {lesson.progress < 100 && lesson.progress > 0 && (
                                    <div className="mb-3">
                                      <div className="progress" style={{ height: "6px" }}>
                                        <div
                                          className="progress-bar bg-primary"
                                          role="progressbar"
                                          style={{ width: `${lesson.progress}%` }}
                                          aria-valuenow={lesson.progress}
                                          aria-valuemin="0"
                                          aria-valuemax="100"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <Button
                                    variant={lesson.progress >= 100 ? "outline-success" : "primary"}
                                    size="sm"
                                    className="w-100"
                                    onClick={() => navigate(`/course/${lesson.courseID}`)}
                                  >
                                    <FontAwesomeIcon
                                      icon={lesson.progress >= 100 ? faCheckCircle : faPlay}
                                      className="me-2"
                                    />
                                    {lesson.progress >= 100 ? "Xem lại" : lesson.progress > 0 ? "Tiếp tục xem" : "Bắt đầu xem"}
                                  </Button>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <div className="no-lessons text-center py-5">
                          <FontAwesomeIcon icon={faBookOpen} size="3x" className="mb-3 text-muted" />
                          <p className="text-muted">
                            {lessonHistory.length === 0
                              ? "Bạn chưa xem video nào. Hãy bắt đầu học ngay!"
                              : selectedLevel === "watching"
                                ? "Không có video đang xem dở."
                                : "Không có video đã hoàn thành."}
                          </p>
                          {lessonHistory.length === 0 ? (
                            <Button variant="primary" onClick={() => setActiveTab("khoahoc")}>
                              Xem khóa học
                            </Button>
                          ) : (
                            <Button variant="outline-primary" onClick={() => setSelectedLevel("all")}>
                              Xem tất cả
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="membership-required-section text-center">
                    <div className="membership-message">
                      <FontAwesomeIcon icon={faLock} className="lock-icon mb-3" />
                      <h5>Cần có gói Membership để truy cập khóa học</h5>
                      <p className="mb-4">Đăng ký để mở khóa toàn bộ khóa học và xem video bài học.</p>
                      <Button variant="primary" size="lg" onClick={() => navigate("/membership")}>
                        Xem các gói Membership
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Khóa học */}


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
                    <FontAwesomeIcon icon={faGraduationCap} size="3x" className="mb-3" style={{ color: "#ccc" }} />
                    <p className="text-muted">Hiện chưa có khóa học nào</p>
                  </div>
                ) : (
                  <Row>
                    {courses.map((course) => (
                      <Col md={6} lg={4} key={course.courseID} className="mb-4">
                        <Card className="h-100 shadow-sm border-0" style={{ overflow: "hidden" }}>
                          {/* Course Header với gradient */}
                          <div
                            style={{
                              height: "120px",
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              position: "relative",
                              padding: "20px"
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <h5 className="text-white mb-0" style={{ fontWeight: 600 }}>
                                {course.courseName}
                              </h5>
                              <Badge
                                bg="light"
                                text="dark"
                                style={{ fontSize: "12px", padding: "6px 12px" }}
                              >
                                Level {course.courseLevel}
                              </Badge>
                            </div>
                          </div>

                          <Card.Body>
                            <p className="text-muted mb-3" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                              {course.description || "Mô tả khóa học"}
                            </p>

                            {/* Teacher Info Section */}
                            {course.teacherID && (
                              <div
                                className="teacher-info-section mb-3 p-3 rounded"
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #e9ecef",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease"
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/teacherinfo/${course.teacherID}`);
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#e9ecef";
                                  e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                                  e.currentTarget.style.transform = "translateY(0)";
                                }}
                              >
                                <div className="d-flex align-items-center gap-3">
                                  <div
                                    style={{
                                      width: "48px",
                                      height: "48px",
                                      borderRadius: "50%",
                                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontWeight: "600",
                                      fontSize: "18px"
                                    }}
                                  >
                                    {course.teacherName ? course.teacherName.charAt(0).toUpperCase() : "T"}
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                      <FontAwesomeIcon
                                        icon={faGraduationCap}
                                        style={{ color: "#667eea", fontSize: "14px" }}
                                      />
                                      <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: 500 }}>
                                        Giảng viên
                                      </span>
                                    </div>
                                  </div>
                                  <FontAwesomeIcon
                                    icon={faPlay}
                                    style={{ color: "#667eea", fontSize: "12px" }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Action Button */}
                            <Button
                              variant="primary"
                              className="w-100"
                              onClick={() => navigate(`/course/${course.courseID}`)}
                              style={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                border: "none",
                                padding: "10px",
                                fontWeight: 500
                              }}
                            >
                              <FontAwesomeIcon icon={faBookOpen} className="me-2" />
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
            {/* Tab: Luyện tập */}
            {activeTab === "luyentap" && (
              <div className="practice-section">
                <h4 className="mb-4">Luyện tập kỹ năng</h4>
                <Row>
                  {[
                    { title: "Flashcards", icon: faLayerGroup, color: "#4A90E2", available: true, path: "/flashcards" },
                    { title: "Luyện nói", icon: faMicrophone, color: "#50E3C2", available: hasMembership, path: "/speakingpractice" },
                    { title: "Luyện nghe", icon: faHeadphones, color: "#9013FE", available: hasMembership, path: "/listeningpractice" },
                    { title: "Luyện viết", icon: faPencilAlt, color: "#F5A623", available: true, path: "/writingpractice" },
                    { title: "Ngữ pháp", icon: faFileAlt, color: "#D0021B", available: true, path: "/grammar" },
                    { title: "Quizz", icon: faComments, color: "#4A90E2", available: hasMembership, path: "/quiz/publish" }
                  ].map((skill, index) => (
                    <Col md={4} key={index} className="mb-4">
                      <div
                        className={`skill-card ${!skill.available ? "skill-locked" : ""}`}
                        onClick={() => {
                          if (skill.available) navigate(skill.path);
                          else navigate("/membership");
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
              </div>
            )}

            {/* Tab: Thống kê (có Attempts + Modal) */}
            {activeTab === "thongke" && (
              <div className="new-stats-section">
                <h4 className="mb-4">Tổng quan thành tích</h4>
                <Row>
                  {[
                    {
                      title: "Cấp độ hiện tại",
                      icon: faGraduationCap,
                      color: "#667eea",
                      value: statsData?.khoahoc?.currentLevel || "Level 1",
                      label: `${statsData?.khoahoc?.xpToNext || 0} XP để lên cấp`
                    },
                    {
                      title: "Chuỗi ngày học",
                      icon: faFire,
                      color: "#ffc107",
                      value: `${streakDays} ngày`,
                      label: statsData?.streak?.message || "Bắt đầu học ngay!"
                    },
                    {
                      title: "Bài làm hoàn thành",
                      icon: faCheckCircle,
                      color: "#28a745",
                      value: statsData?.luyentap?.lessonsCompleted || 0,
                      label: `Điểm trung bình: ${statsData?.luyentap?.averageScore || "0%"}`
                    },
                    {
                      title: "Thời gian học",
                      icon: faClock,
                      color: "#17a2b8",
                      value: statsData?.timeSpent?.time || "0h 0m",
                      label: statsData?.timeSpent?.times || "Tuần này"
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
                            <span>Hoàn thành bài làm</span>
                            <span>
                              {statsData?.weeklyGoal?.lessons?.completed || 0}/
                              {statsData?.weeklyGoal?.lessons?.total || 7}
                            </span>
                          </div>
                          <ProgressBar
                            now={
                              ((statsData?.weeklyGoal?.lessons?.completed || 0) /
                                (statsData?.weeklyGoal?.lessons?.total || 7)) *
                              100
                            }
                            className="custom-progress-bar"
                          />
                        </div>

                        <div className="weekly-goal-item">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Thời gian học</span>
                            <span>
                              {statsData?.weeklyGoal?.studyTime?.completed || 0}/
                              {statsData?.weeklyGoal?.studyTime?.total || 300}{" "}
                              {statsData?.weeklyGoal?.studyTime?.unit || "min"}
                            </span>
                          </div>
                          <ProgressBar
                            now={
                              ((statsData?.weeklyGoal?.studyTime?.completed || 0) /
                                (statsData?.weeklyGoal?.studyTime?.total || 300)) *
                              100
                            }
                            className="custom-progress-bar"
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={12} lg={6} className="mb-4">
                    <Card className="h-100 detail-card">
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div>
                            <h5 className="mb-1">Lịch sử làm bài</h5>
                            <p className="text-muted mb-0">Các bài quiz bạn đã hoàn thành</p>
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
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3">
                          {attempts && attempts.length > 0 ? (
                            attempts.slice(0, 3).map((a) => (
                              <div
                                key={a.attemptID}
                                className="d-flex align-items-center justify-content-between border rounded p-2 mb-2"
                              >
                                <div>
                                  <div className="fw-semibold">{a.quizTitle || "Quiz"}</div>
                                  <div className="text-muted small">#{a.attemptID} • {formatVNDateTime(a.submittedAt)}</div>
                                </div>
                                <div className="text-end">
                                  <div className="badge bg-light text-dark">{a.status || "SUBMITTED"}</div>
                                  <div className="small text-muted mt-1">Điểm: {a.autoScore ?? 0}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-muted py-3">Chưa có bài làm nào. Hãy bắt đầu làm quiz!</div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* Attempt Modal */}
            <Modal show={showAttemptModal} onHide={closeAttemptModal} size="lg" centered>
              <Modal.Header closeButton>
                <Modal.Title>Lịch sử làm bài chi tiết</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {attempts.length === 0 ? (
                  <div className="text-center text-muted py-3">Chưa có bài làm nào để hiển thị.</div>
                ) : (
                  <div className="table-responsive">
                    <Table hover bordered>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Quiz</th>
                          <th>Nộp lúc</th>
                          <th>Điểm</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map((a) => (
                          <tr key={a.attemptID}>
                            <td>#{a.attemptID}</td>
                            <td>{a.quizTitle || "—"}</td>
                            <td>{formatVNDateTime(a.submittedAt)}</td>
                            <td>
                              <Badge
                                bg={
                                  (a.autoScore ?? 0) >= 80
                                    ? "success"
                                    : (a.autoScore ?? 0) >= 50
                                      ? "warning"
                                      : "danger"
                                }
                              >
                                {a.autoScore ?? 0}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={a.status === "SUBMITTED" ? "info" : "secondary"}>
                                {a.status || "SUBMITTED"}
                              </Badge>
                            </td>
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
          </>
        )}
      </Container>

      <style>{`
        .play-overlay:hover {
          transform: translate(-50%, -50%) scale(1.15) !important;
          background: rgba(0,0,0,0.8) !important;
        }
      `}</style>
    </div>
  );
};

export default Home;
