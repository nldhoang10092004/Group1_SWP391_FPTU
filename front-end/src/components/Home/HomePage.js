import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./HomePage.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const HomePage = ({ onShowAuthModal }) => {
  const freeVideos = [
    {
      id: 1,
      level: "Beginner",
      title: "Chào hỏi cơ bản trong tiếng Anh",
      description: "Học cách chào hỏi và giới thiệu bản thân một cách tự nhiên",
      duration: "5:30",
      students: "1.2K",
      rating: 4.8,
    },
    {
      id: 2,
      level: "Vocabulary",
      title: "Từ vựng về gia đình",
      description: "Các từ vựng thiết yếu để nói về thành viên gia đình",
      duration: "4:45",
      students: "856",
      rating: 4.7,
    },
    {
      id: 3,
      level: "Pre-Intermediate",
      title: "Cách đặt câu hỏi Yes/No",
      description: "Học cách đặt và trả lời câu hỏi Yes/No một cách chính xác",
      duration: "6:15",
      students: "2.1K",
      rating: 4.9,
    },
  ];

  const premiumCourses = [
    {
      id: 1,
      title: "Khóa học English Foundation",
      subtitle: "30+ bài học từ cơ bản đến nâng cao",
      lessons: "32 bài học",
      students: "5.2K học viên",
      level: "Beginner",
      locked: true,
    },
    {
      id: 2,
      title: "Business English Mastery",
      subtitle: "Tiếng Anh thương mại chuyên nghiệp",
      lessons: "45 bài học",
      students: "3.8K học viên",
      level: "Advanced",
      locked: true,
    },
    {
      id: 3,
      title: "IELTS Preparation",
      subtitle: "Luyện thi IELTS từ 6.0 lên 8.0+",
      lessons: "60 bài học",
      students: "7.5K học viên",
      level: "Intermediate",
      locked: true,
    },
  ];

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
            Phương pháp học tương tác với AI, feedback real-time và lộ trình được cá nhân 100%. Từ
            zero tới hero chỉ trong 6 tháng.
          </p>
          <div className="hero-cta-buttons">
            <Button className="start-free-btn">
              ▷ Bắt đầu miễn phí
            </Button>
            <Button className="know-more-btn">
              Tìm hiểu thêm
            </Button>
          </div>
          <Row className="hero-stats">
            <Col xs={12} sm={4}>
              <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <span className="stat-value">4.9</span>
                <span className="stat-label">Đánh giá</span>
              </div>
            </Col>
            <Col xs={12} sm={4}>
              <div className="stat-item">
                <span className="stat-icon">👨‍👩‍👧‍👦</span>
                <span className="stat-value">2M+</span>
                <span className="stat-label">Học viên</span>
              </div>
            </Col>
            <Col xs={12} sm={4}>
              <div className="stat-item">
                <span className="stat-icon">📚</span>
                <span className="stat-value">1K+</span>
                <span className="stat-label">Bài học</span>
              </div>
            </Col>
          </Row>
          <Row className="hero-features">
            <Col md={6}>
              <div className="feature-card-hero">
                <div className="feature-icon">⚡</div>
                <h3>AI Feedback</h3>
                <p>Nhận phản hồi chi tiết từ AI trong vài giây. Sửa lỗi ngay lập tức, tiến bộ nhanh gấp 3 lần.</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="feature-card-hero">
                <div className="feature-icon">↗️</div>
                <h3>Lộ trình cá nhân</h3>
                <p>AI phân tích điểm mạnh/yếu của bạn, tạo lộ trình học riêng biệt. Học đúng cái bạn cần.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* General Features */}
      <section className="general-features-section">
        <Container>
          <Row>
            <Col md={4}>
              <div className="feature-box">
                <span className="icon">🥇</span>
                <h3>Chứng chỉ quốc tế</h3>
                <p>Được công nhận toàn cầu</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-box">
                <span className="icon">💯</span>
                <h3>100% tương tác</h3>
                <p>Không học thụ động nhàm chán</p>
              </div>
            </Col>
            <Col md={4}>
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

          <Row>
            {freeVideos.map((video) => (
              <Col lg={4} md={6} key={video.id} className="mb-4">
                <div className="video-card">
                  <div className="video-thumbnail">
                    <img src={video.image} alt={video.title} className="video-thumb-img" />
                    <div className={`level-badge level-${video.level.toLowerCase().replace(/\s/g, '-')}`}>
                      {video.level}
                    </div>
                    <div className="play-button">
                      <span className="play-icon">▷</span>
                      <span>Xem ngay</span>
                    </div>
                  </div>

                  <div className="video-info">
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-description">{video.description}</p>

                    <div className="video-stats">
                      <div className="stat-item">
                        <span className="icon">🕐</span>
                        <span>{video.duration}</span>
                      </div>
                      <div className="stat-item">
                        <span className="icon">👥</span>
                        <span>{video.students}</span>
                      </div>
                      <div className="stat-item rating">
                        <span className="star">⭐</span>
                        <span>{video.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
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

          <Row className="premium-courses-row">
            {premiumCourses.map((course) => (
              <Col lg={4} md={4} sm={12} key={course.id} className="mb-4">
                <div className="premium-course-box">
                  <div className="course-content">
                    <div className="course-header">
                      <span className="lock-icon">🔒</span>
                      <span className={`course-level-tag level-${course.level.toLowerCase().replace(/\s/g, '-')}`}>
                        {course.level}
                      </span>
                    </div>
                    <div className="course-info">
                      <h3 className="course-title">{course.title}</h3>
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
                      </div>
                    </div>
                    <div className="course-action">
                      <div className="membership-lock" onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: { tab: "register" } }))}>
                        <span className="lock-icon">🔒</span>
                        <span className="lock-text">Mở khóa với membership</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {/* Membership Features - New Section */}
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
              <Button className="cta-button" onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: { tab: "register" } }))}>
                Đăng ký ngay
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <Container>
          <Row>
            <Col lg={4} md={6} className="mb-4 mb-lg-0">
              <div className="footer-brand">
                <span className="footer-logo-icon">📖</span> EnglishMaster
              </div>
              <p className="footer-description">
                Nền tảng học tiếng Anh thông minh với AI giúp bạn chinh phục tiếng Anh hiệu quả và
                nhanh chóng.
              </p>
              <div className="social-icons">
                <a href="#facebook" className="social-icon">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#twitter" className="social-icon">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#instagram" className="social-icon">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#linkedin" className="social-icon">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </Col>
            <Col lg={2} md={6} className="mb-4 mb-lg-0">
              <h5 className="footer-heading">Liên kết nhanh</h5>
              <ul className="footer-links">
                <li>
                  <a href="#about">Về chúng tôi</a>
                </li>
                <li>
                  <a href="#courses">Khóa học</a>
                </li>
                <li>
                  <a href="#teachers">Giáo viên</a>
                </li>
                <li>
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#contact">Liên hệ</a>
                </li>
              </ul>
            </Col>
            <Col lg={3} md={6} className="mb-4 mb-lg-0">
              <h5 className="footer-heading">Hỗ trợ</h5>
              <ul className="footer-links">
                <li>
                  <a href="#faq">Trung tâm trợ giúp</a>
                </li>
                <li>
                  <a href="#terms">Điều khoản sử dụng</a>
                </li>
                <li>
                  <a href="#privacy">Chính sách bảo mật</a>
                </li>
                <li>
                  <a href="#faqs">Câu hỏi thường gặp</a>
                </li>
                <li>
                  <a href="#payment">Phương thức thanh toán</a>
                </li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h5 className="footer-heading">Liên hệ</h5>
              <ul className="footer-contact-info">
                <li>
                  <span className="icon">📍</span> 123 Đường ABC, Quận 1, TP. Hồ Chí Minh
                </li>
                <li>
                  <span className="icon">📞</span> (+84) 123 456 789
                </li>
                <li>
                  <span className="icon">📧</span> support@englishmaster.vn
                </li>
              </ul>
            </Col>
          </Row>
          <div className="footer-bottom">
            <p className="copyright">© 2025 EnglishMaster. All rights reserved.</p>
            <div className="footer-legal-links">
              <a href="#privacy">Chính sách bảo mật</a>
              <a href="#terms">Điều khoản dịch vụ</a>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;