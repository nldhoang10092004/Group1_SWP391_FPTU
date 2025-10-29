import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Modal, Navbar, Nav } from "react-bootstrap";
import "./HomePage.scss"; // Import the SCSS file
import "bootstrap/dist/css/bootstrap.min.css"; 
import { getAllCoursesWithDetails } from '../../middleware/courseAPI';
import { useNavigate } from "react-router-dom";

const HomePage = ({ onShowAuthModal }) => {
  // State cho free videos
  const [freeVideos, setFreeVideos] = useState([]);
  const [loadingFreeVideos, setLoadingFreeVideos] = useState(true);
  
  // State for popup - NOW INTEGRATED HERE
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: '', message: '', type: 'info' });

  // State cho premium courses
  const [premiumCourses, setPremiumCourses] = useState([]);
  const [loadingPremiumCourses, setLoadingPremiumCourses] = useState(true);
  const navigate = useNavigate();
  
  // Membership Features (no change, but can be styled)
  const membershipFeatures = [
    {
      icon: "🎬",
      title: "Video HD chất lượng cao",
      description: "Hàng trăm video bài giảng được sản xuất chuyên nghiệp",
    },
    {
      icon: "🤖",
      title: "AI chấm bài viết",
      description: "Hệ thống AI chấm điểm và góp ý chi tiết cho bài viết",
    },
    {
      icon: "🎯",
      title: "Luyện tập tương tác",
      description: "Flashcard, quiz và game học tập thú vị",
    },
    {
      icon: "📊",
      title: "Theo dõi tiến độ",
      description: "Dashboard cá nhân theo dõi quá trình học tập",
    },
  ];

  // Helper function để map courseLevel sang text
  const getCourseLevelText = (level) => {
    const levelMap = {
      0: "Beginner",
      1: "Elementary", 
      2: "Intermediate",
      3: "Advanced"
    };
    return levelMap[level] || "Beginner";
  };

  // Function to show popup
  const handleShowPopup = (title, message, type = 'info') => {
    setPopupContent({ title, message, type });
    setShowPopup(true);
  };

  // Function to hide popup
  const handleClosePopup = () => setShowPopup(false);

  useEffect(() => {
    const fetchFreeVideos = async () => {
      try {
        setLoadingFreeVideos(true);
        const courses = await getAllCoursesWithDetails();
        
        const previews = [];
        courses.forEach(course => {
          course.chapters?.forEach(chapter => {
            chapter.videos?.forEach(video => {
              if (video.isPreview === 1 || video.isPreview === true) {
                previews.push({
                  videoID: video.videoID,
                  videoName: video.videoName,
                  videoURL: video.videoURL,
                  courseName: course.courseName,
                  courseID: course.courseID,
                });
              }
            });
          });
        });

        console.log("Found preview videos:", previews.length, previews);
        setFreeVideos(previews);
      } catch (error) {
        console.error("Error fetching preview videos:", error);
        handleShowPopup("Lỗi tải video", "Không thể tải video miễn phí. Vui lòng thử lại sau.", "error");
      } finally {
        setLoadingFreeVideos(false);
      }
    };

    fetchFreeVideos();
  }, []);

  useEffect(() => {
    const fetchPremiumCourses = async () => {
      try {
        setLoadingPremiumCourses(true);
        const courses = await getAllCoursesWithDetails();
        
        const premiumCoursesData = courses.map(course => {
          let totalVideos = 0;
          course.chapters?.forEach(chapter => {
            totalVideos += chapter.videos?.length || 0;
          });

          return {
            id: course.courseID,
            name: course.courseName,
            subtitle: course.description || "Khóa học tiếng Anh chất lượng cao",
            level: getCourseLevelText(course.courseLevel),
            lessons: `${totalVideos} bài`,
            students: "1K+",
            chaptersCount: course.chapters?.length || 0,
          };
        });

        console.log("Premium courses data:", premiumCoursesData);
        setPremiumCourses(premiumCoursesData);
      } catch (error) {
        console.error("Error fetching premium courses:", error);
        handleShowPopup("Lỗi tải khóa học", "Không thể tải các khóa học premium. Vui lòng thử lại sau.", "error");
      } finally {
        setLoadingPremiumCourses(false);
      }
    };

    fetchPremiumCourses();
  }, []);

  // Effect for animated particles in Hero Section
  useEffect(() => {
    const heroSection = document.querySelector('.new-hero-section');
    if (!heroSection) return;

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.classList.add('animated-particle');
      
      const size = Math.random() * 8 + 4; // Size between 4px and 12px
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      const x = Math.random() * 100; // % width
      const y = Math.random() * 100; // % height
      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;

      const animationDuration = Math.random() * 10 + 10; // 10s to 20s
      particle.style.animationDuration = `${animationDuration}s`;
      particle.style.animationDelay = `-${Math.random() * animationDuration}s`; // Stagger start
      particle.style.opacity = Math.random() * 0.5 + 0.2; // Opacity between 0.2 and 0.7

      heroSection.appendChild(particle);

      // Remove particle after animation to prevent DOM clutter
      particle.addEventListener('animationend', () => {
        particle.remove();
      });
    };

    // Create a few initial particles
    for (let i = 0; i < 20; i++) { // 20 particles
      createParticle();
    }

    // Optionally, create new particles over time
    // const interval = setInterval(createParticle, 2000); // New particle every 2 seconds
    // return () => clearInterval(interval);

  }, []); // Run once on mount

  const handleStartFree = () => {
    window.dispatchEvent(new CustomEvent("openAuthModal", { detail: { tab: "register" } }));
  };

  const handleKnowMore = () => {
    const premiumSection = document.querySelector('.premium-content-section');
    if (premiumSection) {
      premiumSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper for popup header class
  const getPopupHeaderClass = (type) => {
    switch (type) {
      case 'error':
        return 'popup-header-error';
      case 'success':
        return 'popup-header-success';
      case 'warning':
        return 'popup-header-warning';
      default:
        return 'popup-header-info';
    }
  };

  return (
    <div className="homepage-container">
      

      {/* Hero Section */}
      <section className="new-hero-section">
  <Container>
    <div className="hero-top-info">
      <span className="ai-icon">✨</span> Học thông minh với AI - Tiết kiệm 60% thời gian
    </div>
    <h1 className="hero-main-title">
      Chinh phục tiếng Anh
      <br />
      <span className="highlight-text">không giới hạn</span>
    </h1>
    <p className="hero-description">
      Phương pháp học tương tác với AI, feedback real-time và lộ trình được cá nhân hóa 100%. Từ
      zero tới hero chỉ trong 6 tháng.
    </p>

    {/* Dòng 1: CTA buttons bên trái và stats bên phải */}
    <div className="hero-bottom-row">
      <div className="hero-cta-buttons">
        <Button className="start-free-btn" onClick={handleStartFree}>
          ▷ Bắt đầu miễn phí
        </Button>
        <Button className="know-more-btn" onClick={handleKnowMore}>
          Tìm hiểu thêm
        </Button>
      </div>
      
      <Row className="hero-stats">
        <Col xs={4}>
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">4.9</span>
            <span className="stat-label">Đánh giá</span>
          </div>
        </Col>
        <Col xs={4}>
          <div className="stat-item">
            <span className="stat-icon">👨‍👩‍👧‍👦</span>
            <span className="stat-value">200+</span>
            <span className="stat-label">Học viên</span>
          </div>
        </Col>
        <Col xs={4}>
          <div className="stat-item">
            <span className="stat-icon">📚</span>
            <span className="stat-value">1K+</span>
            <span className="stat-label">Bài học</span>
          </div>
        </Col>
      </Row>
    </div>

    {/* Dòng 2: AI và Lộ trình */}
    <Row className="hero-features">
      <Col md={6} lg={5}>
        <div className="feature-card-hero">
          <div className="feature-icon">⚡</div>
          <h3>AI Feedback</h3>
          <p>Nhận phản hồi chi tiết từ AI trong vài giây. Sửa lỗi ngay lập tức, tiến bộ nhanh gấp 3 lần.</p>
        </div>
      </Col>
      <Col md={6} lg={5}>
        <div className="feature-card-hero">
          <div className="feature-icon">↗️</div>
          <h3>Lộ trình cá nhân</h3>
          <p>AI phân tích điểm mạnh/yếu của bạn, tạo lộ trình học riêng biệt. Học đúng cái bạn cần.</p>
        </div>
      </Col>
    </Row>
  </Container>
</section>

{/* General Features - 3 cái nhỏ ở trung tâm */}
<section className="general-features-section">
  <Container>
    <Row className="justify-content-center">
      <Col md={4} sm={6}>
        <div className="feature-box">
          <span className="icon">🥇</span>
          <h3>Chứng chỉ quốc tế</h3>
          <p>Được công nhận toàn cầu</p>
        </div>
      </Col>
      <Col md={4} sm={6}>
        <div className="feature-box">
          <span className="icon">💯</span>
          <h3>100% tương tác</h3>
          <p>Không học thụ động nhàm chán</p>
        </div>
      </Col>
      <Col md={4} sm={6}>
        <div className="feature-box">
          <span className="icon">💬</span>
          <h3>Cộng đồng sôi động</h3>
          <p>Kết nối & học cùng nhau</p>
        </div>
      </Col>
    </Row>
  </Container>
</section>
      {/* Demo Videos Section */}
      <section className="demo-videos-section">
        <Container>
          <div className="section-header">
            <h2>Video demo miễn phí</h2>
            <span className="free-badge">Miễn phí</span>
          </div>

          <Row className="justify-content-center"> {/* Center align video cards */}
            {loadingFreeVideos && (
              <Col xs={12}>
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Đang tải video miễn phí...</p>
                </div>
              </Col>
            )}
            
            {!loadingFreeVideos && freeVideos.length === 0 && (
              <Col xs={12}>
                <div className="alert alert-info text-center" role="alert">
                  Không có video miễn phí nào.
                </div>
              </Col>
            )}
            
            {!loadingFreeVideos && freeVideos.length > 0 && (
              freeVideos.slice(0, 3).map((video) => ( // Display max 3 videos for demo
                <Col lg={4} md={6} sm={12} key={video.videoID} className="mb-4 d-flex"> {/* d-flex for equal height */}
                  <div className="video-card">
                    <div className="video-thumbnail">
                      <iframe
                        src={video.videoURL}
                        title={video.videoName}
                        width="100%"
                        height="200" // Height needs to be set or managed by CSS aspect-ratio
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        frameBorder="0"
                      ></iframe>
                    </div>
                    <div className="video-info">
                      <h3 className="video-title">{video.videoName}</h3>
                      <p className="video-description">
                        {video.courseName && <span className="course-badge">{video.courseName}</span>}
                        <span className="free-tag">🎁 Miễn phí</span>
                      </p>
                      {/* Placeholder for video meta data */}
                      <div className="video-meta">
                          <span className="video-duration">5:30</span>
                          <span className="video-views">1.2K</span>
                          <span className="video-rating">4.8/5</span>
                      </div>
                    </div>
                  </div>
                </Col>
              ))
            )}
          </Row>
        </Container>
      </section>

      {/* Premium Content Section */}
      <section className="premium-content-section">
        <Container>
          <div className="section-header">
            <h2>Nội dung premium</h2>
            <span className="membership-required-badge">Membership required</span>
          </div>

          <Row className="premium-courses-row justify-content-center"> {/* Center align course cards */}
            {loadingPremiumCourses && (
              <Col xs={12}>
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Đang tải các khóa học premium...</p>
                </div>
              </Col>
            )}
            
            {!loadingPremiumCourses && premiumCourses.length === 0 && (
              <Col xs={12}>
                <div className="alert alert-info text-center" role="alert">
                  Không có khóa học premium nào.
                </div>
              </Col>
            )}
            
            {!loadingPremiumCourses && premiumCourses.length > 0 && (
              premiumCourses.slice(0, 3).map((course) => (
  <Col lg={4} md={6} sm={12} key={course.id} className="mb-4 d-flex">
    <div 
      className="premium-course-box"
      onClick={() => navigate(`/course/${course.id}`)} // Điều hướng sang chi tiết khóa học
      style={{ cursor: "pointer" }}
    >
      <div className="course-content">
        <div className="course-header">
          <span className={`course-level-tag level-${course.level.toLowerCase()}`}>
            {course.level}
          </span>
        </div>
        <div className="course-info">
          <h3 className="course-title">{course.name}</h3>
          <p className="course-subtitle">{course.subtitle}</p>
          <div className="course-stats">
            <div className="stat-item">
              <span className="icon">📚</span>
              <span>{course.lessons}</span>
            </div>
            <div className="stat-item">
              <span className="icon">👥</span>
              <span>{course.students}</span>
            </div>
            {course.chaptersCount > 0 && (
              <div className="stat-item">
                <span className="icon">📖</span>
                <span>{course.chaptersCount} chương</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </Col>
))
            )}
          </Row>

          {/* Membership Features */}
          <div className="membership-features-section-new">
            <h3 className="features-title">Tính năng nổi bật khi có membership</h3>
            <Row className="justify-content-center">
              {membershipFeatures.map((feature, index) => (
                <Col lg={3} md={6} sm={6} xs={12} key={index} className="mb-4">
                  <div className="feature-card-compact">
                    <div className="feature-icon-circle">{feature.icon}</div>
                    <h4 className="feature-title-compact">{feature.title}</h4>
                    <p className="feature-description-compact">{feature.description}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* CTA Section */}
          <div className="membership-cta">
            <div className="cta-content">
              <h3 className="cta-title">Bắt đầu học ngay - Chỉ từ 199K/tháng</h3>
              <Button className="cta-button" onClick={handleStartFree}>
                Đăng ký ngay
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      
    </div>
  );
};

export default HomePage;