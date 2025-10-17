import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import './footer.css';

export default function Footer() {
  return (
    <footer className="emt-footer">
      <div className="footer-container">
        {/* Footer Top */}
        <div className="footer-top">
          <div className="footer-column">
            <div className="footer-logo">
              <BookOpen className="footer-logo-icon" />
              <div>
                <h3>EMT</h3>
                <p>English Master</p>
              </div>
            </div>
            <p className="footer-description">
              Nền tảng học tiếng Anh trực tuyến hàng đầu với đội ngũ giảng viên chuyên nghiệp và phương pháp giảng dạy hiện đại.
            </p>
          </div>

          <div className="footer-column">
            <h4>Liên kết nhanh</h4>
            <ul>
              <li><a href="#courses">Khóa học</a></li>
              <li><a href="#teachers">Giảng viên</a></li>
              <li><a href="#about">Về chúng tôi</a></li>
              <li><a href="#contact">Liên hệ</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><a href="#help">Trung tâm trợ giúp</a></li>
              <li><a href="#terms">Điều khoản sử dụng</a></li>
              <li><a href="#privacy">Chính sách bảo mật</a></li>
              <li><a href="#faq">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Liên hệ</h4>
            <ul className="contact-list">
              <li>
                <Mail className="contact-icon" />
                <span>contact@emt.edu.vn</span>
              </li>
              <li>
                <Phone className="contact-icon" />
                <span>1900 xxxx</span>
              </li>
              <li>
                <MapPin className="contact-icon" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright">
            © 2024 EMT - English Master. All rights reserved.
          </p>
          <div className="social-links">
            <a href="#facebook" className="social-link">
              <Facebook className="social-icon" />
            </a>
            <a href="#twitter" className="social-link">
              <Twitter className="social-icon" />
            </a>
            <a href="#instagram" className="social-link">
              <Instagram className="social-icon" />
            </a>
            <a href="#youtube" className="social-link">
              <Youtube className="social-icon" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
