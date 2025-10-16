import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./HomePage.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const HomePage = ({ onShowAuthModal }) => {
  const demoVideos = [
    {
      id: 1,
      title: "Chào hỏi cơ bản trong tiếng Anh",
      description: "Học cách chào hỏi và giới thiệu bản thân một cách tự nhiên",
      level: "Beginner",
      duration: "5:30",
      students: "1.2K",
      rating: 4.8
    },
    {
      id: 2,
      title: "Từ vựng về gia đình",
      description: "Các từ vựng thiết yếu để nói về thành viên gia đình",
      level: "Beginner",
      duration: "4:45",
      students: "856",
      rating: 4.7
    },
    {
      id: 3,
      title: "Cách đặt câu hỏi Yes/No",
      description: "Học cách đặt và trả lời câu hỏi Yes/No một cách chính xác",
      level: "Pre-Intermediate",
      levelColor: "pre-intermediate",
      duration: "6:15",
      students: "2.1K",
      rating: 4.8
    }
  ];

  const premiumCourses = [
    {
      id: 1,
      title: "Khóa học English Foundation",
      subtitle: "30+ bài học từ cơ bản đến nâng cao",
      lessons: "32 bài học",
      students: "8,5.2K học viên",
      level: "",
      locked: true
    },
    {
      id: 2,
      title: "Business English Mastery",
      subtitle: "Tiếng Anh thương mại chuyên nghiệp",
      lessons: "45 bài học",
      students: "9,3.8K học viên",
      level: "Advanced",
      locked: true
    },
    {
      id: 3,
      title: "IELTS Preparation",
      subtitle: "Luyện thi IELTS từ 6.0 lên 8.0+",
      lessons: "60 bài học",
      students: "9,7.5K học viên",
      level: "Intermediate",
      locked: true
    }
  ];

  const membershipFeatures = [
    {
      icon: "🎬",
      title: "Video HD chất lượng cao",
      description: "Hàng trăm video bài giảng được sản xuất chuyên nghiệp"
    },
    {
      icon: "🤖",
      title: "AI chấm bài viết",
      description: "Hệ thống AI chấm điểm và góp ý chi tiết cho bài viết"
    },
    {
      icon: "🎯",
      title: "Luyện tập tương tác",
      description: "Flashcard, quiz và game học tập thú vị"
    },
    {
      icon: "📊",
      title: "Theo dõi tiến độ",
      description: "Dashboard cá nhân theo dõi quá trình học tập"
    }
  ];

  return (
    <div className="homepage-container">
      <section className="new-hero-section">
        <Container>
          <div className="hero-content">
            <h1 className="hero-title">Học tiếng Anh hiệu quả cùng EMT</h1>
            <p className="hero-subtitle">
              Trải nghiệm các bài học demo miễn phí và khám phá phương pháp học tập hiện đại
            </p>
            <div className="hero-actions">
              <Button className="register-btn" onClick={() =>  window.dispatchEvent(new CustomEvent("openAuthModal", { detail: { tab: "register" } }))}>
                Đăng ký membership ngay
              </Button>
              <div className="free-trial">
                <span className="gift-icon">🎁</span>
                <span>Tặng 3 ngày dùng thử miễn phí</span>
              </div>
            </div>
          </div>
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
            {demoVideos.map((video) => (
              <Col lg={4} md={6} key={video.id} className="mb-4">
                <div className="video-card">
                  <div className="video-thumbnail">
                    <div className="level-badge" data-level={video.levelColor || video.level.toLowerCase()}>
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

      {/* Premium Content Section - 3 box có viền */}
      <section className="premium-content-section">
        <Container>
          <div className="section-header">
            <h2>Nội dung premium</h2>
          </div>

          <Row className="premium-courses-row">
            {premiumCourses.map((course) => (
              <Col lg={4} md={4} sm={12} key={course.id} className="mb-4">
                <div className="premium-course-box">
                  <div className="course-content">
                    <div className="course-info">
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-subtitle">{course.subtitle}</p>
                      <div className="course-stats">
                        <span className="lessons">{course.lessons}</span>
                        <span className="students">{course.students}</span>
                      </div>
                      {course.level && (
                        <div className="course-level-tag">
                          {course.level}
                        </div>
                      )}
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

          {/* Membership Features */}
          <div className="membership-features-section">
            <h3 className="features-title">Tính năng nổi bật khi có membership</h3>
            <Row>
              {membershipFeatures.map((feature, index) => (
                <Col lg={6} key={index} className="mb-4">
                  <div className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-content">
                      <h4 className="feature-title">{feature.title}</h4>
                      <p className="feature-description">{feature.description}</p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* CTA Section */}
          <div className="membership-cta">
            <div className="cta-content">
              <h3 className="cta-title">Bắt đầu học ngay - Chỉ từ 199k/tháng</h3>
              <Button className="cta-button" onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal", { detail: { tab: "register" } }))}>
                Đăng ký membership ngay
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;