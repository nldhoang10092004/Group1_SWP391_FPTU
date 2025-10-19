import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Footer.scss"; // import file SCSS của bạn

const Footer = () => {
  return (
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
              <li><a href="#about">Về chúng tôi</a></li>
              <li><a href="#courses">Khóa học</a></li>
              <li><a href="#teachers">Giáo viên</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#contact">Liên hệ</a></li>
            </ul>
          </Col>

          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5 className="footer-heading">Hỗ trợ</h5>
            <ul className="footer-links">
              <li><a href="#faq">Trung tâm trợ giúp</a></li>
              <li><a href="#terms">Điều khoản sử dụng</a></li>
              <li><a href="#privacy">Chính sách bảo mật</a></li>
              <li><a href="#faqs">Câu hỏi thường gặp</a></li>
              <li><a href="#payment">Phương thức thanh toán</a></li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h5 className="footer-heading">Liên hệ</h5>
            <ul className="footer-contact-info">
              <li><span className="icon">📍</span> 123 Đường ABC, Quận 1, TP. Hồ Chí Minh</li>
              <li><span className="icon">📞</span> (+84) 123 456 789</li>
              <li><span className="icon">📧</span> support@englishmaster.vn</li>
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
  );
};

export default Footer;
