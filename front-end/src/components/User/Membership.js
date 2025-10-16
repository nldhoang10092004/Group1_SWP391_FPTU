import React from "react";
import "./membership.scss";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Membership = () => {
    const navigate = useNavigate();

const plans = [
  {
    title: "Gói 1 tháng",
    price: "199.000 ₫",
    sub: "199.000 ₫/tháng",
    features: [
      "Truy cập tất cả khóa học",
      "Video bài giảng HD",
      "Bài tập tương tác",
      "Theo dõi tiến độ",
      "Hỗ trợ chat 24/7",
      "Flashcard từ vựng",
      "Luyện nghe với AI",
    ],
  },
  {
    title: "Gói 3 tháng",
    tag: { text: "Phổ biến", color: "blue" },
    price: "499.000 ₫",
    sub: "597.000 ₫  Tiết kiệm 16%",
    month: "166.333 ₫/tháng",
    features: [
      "Tất cả tính năng gói 1 tháng",
      "Luyện nói với AI",
      "Bài viết có phản hồi",
      "Nhóm học tập online",
      "Webinar hàng tuần",
      "Tài liệu và hỗ trợ",
      "Ưu tiên hỗ trợ",
    ],
    highlight: true,
  },
  {
    title: "Gói 6 tháng",
    tag: { text: "Tiết kiệm nhất", color: "orange" },
    price: "899.000 ₫",
    sub: "1.194.000 ₫  Tiết kiệm 25%",
    month: "149.833 ₫/tháng",
    features: [
      "Tất cả tính năng gói 3 tháng",
      "Lớp học trực tiếp 1-1",
      "Mock test IELTS/TOEIC",
      "Chương trình học cá nhân",
      "Coaching từ giảng viên",
      "Chứng chỉ hoàn thành",
      "Đảm bảo kết quả",
    ],
  },
  {
    title: "Gói 12 tháng",
    tag: { text: "Giá trị tốt nhất", color: "orange" },
    price: "1.599.000 ₫",
    sub: "2.388.000 ₫  Tiết kiệm 33%",
    month: "133.250 ₫/tháng",
    features: [
      "Tất cả tính năng gói 6 tháng",
      "Mentoring 1-1 hàng tuần",
      "Truy cập khóa VIP",
      "Workshop độc quyền",
      "Cộng đồng Premium",
      "Career counseling",
      "Lifetime support",
    ],
  },
];

  return (
    <div className="membership-page">
      <div className="header-section">
        <button className="back-btn" onClick={() => navigate("/home")}>← Quay lại</button>
        <h1>Chọn gói đăng ký</h1>
        <p>Truy cập tất cả khóa học với gói phù hợp cho bạn</p>
      </div>

      <div className="benefits-section">
        <div className="benefit-item">
          <i className="icon book"></i>
          <p>📘</p>
          <p><strong>10+ Khóa học</strong><br />Tất cả trình độ</p>
        </div>
        <div className="benefit-item">
          <i className="icon trophy"></i>
          <p>🏆</p>
          <p><strong>Chứng chỉ</strong><br />Được công nhận</p>
        </div>
        <div className="benefit-item">
          <i className="icon users"></i>
          <p>👥</p>
          <p><strong>Cộng đồng</strong><br />5000+ học viên</p>
        </div>
        <div className="benefit-item">
          <i className="icon headset"></i>
          <p>🎧</p>
          <p><strong>Hỗ trợ 24/7</strong><br />Luôn sẵn sàng</p>
        </div>
      </div>

      <div className="plans-section">
        {plans.map((p, i) => (
          <div
            key={i}
            className={`plan-card ${p.highlight ? "highlight" : ""}`}
          >
            {p.tag && <span className={`tag ${p.tag.color}`}>{p.tag.text}</span>}
            <h3>{p.title}</h3>
            <h2>{p.price}</h2>
            {p.sub && <p className="sub">{p.sub}</p>}
            {p.month && <p className="month">{p.month}</p>}
            <ul>
              {p.features.map((f, idx) => (
                <li key={idx}>
                  <CheckCircle size={18} /> {f}
                </li>
              ))}
            </ul>
            <button className={p.highlight ? "primary" : ""}>Chọn gói này</button>
          </div>
        ))}
      </div>

      <div className="extra-section">
        <div className="extra-item">
          <i className="icon check"></i>
          <p>💰</p>
          <p><strong>Đảm bảo hoàn tiền</strong><br />Hoàn tiền 100% trong 7 ngày đầu nếu không hài lòng</p>
        </div>
        <div className="extra-item">
          <i className="icon calendar"></i>
          <p>📅</p>
          <p><strong>Học linh hoạt</strong><br />Học mọi lúc, mọi nơi với ứng dụng di động và web</p>
        </div>
        <div className="extra-item">
          <i className="icon chat"></i>
          <p>👨‍🏫</p>
          <p><strong>Hỗ trợ chuyên gia</strong><br />Đội ngũ giảng viên sẵn sàng hỗ trợ 24/7</p>
        </div>
      </div>

      <div className="faq-section">
        <h3>Câu hỏi thường gặp</h3>
        <div className="faq-item">
          <strong>Tôi có thể hủy đăng ký bất cứ lúc nào không?</strong>
          <p>Có, bạn có thể hủy đăng ký bất cứ lúc nào. Bạn vẫn có thể sử dụng dịch vụ đến hết thời hạn đã thanh toán.</p>
        </div>
        <div className="faq-item">
          <strong>Gói đăng ký có tự động gia hạn không?</strong>
          <p>Không, tất cả gói đăng ký đều không tự động gia hạn. Bạn sẽ nhận được thông báo trước khi hết hạn.</p>
        </div>
        <div className="faq-item">
          <strong>Tôi có thể chuyển đổi gói đăng ký không?</strong>
          <p>Có, bạn có thể nâng cấp lên gói cao hơn bất cứ lúc nào. Phí chênh lệch sẽ được tính theo tỷ lệ thời gian còn lại.</p>
        </div>
      </div>
    </div>
  );
}

export default Membership;