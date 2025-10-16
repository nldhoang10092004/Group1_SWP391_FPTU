import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import "./guide.scss";

const Guide = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "File video tối đa bao nhiêu MB?",
      answer: "Kích thước tối đa cho mỗi file video là 500MB. Nếu video của bạn lớn hơn, bạn nên sử dụng phương pháp URL (YouTube/Vimeo) hoặc nén video trước khi upload."
    },
    {
      question: "Định dạng video nào được hỗ trợ?",
      answer: "Hệ thống hỗ trợ các định dạng phổ biến như MP4, MOV, AVI, và WebM. Khuyến nghị sử dụng MP4 với codec H.264 để có độ tương thích tốt nhất."
    },
    {
      question: "Làm thế nào để lấy URL từ YouTube?",
      answer: "Vào video YouTube, nhấn nút 'Chia sẻ', sau đó sao chép URL. Bạn có thể sử dụng URL dạng youtube.com/watch?v=... hoặc youtu.be/..."
    },
    {
      question: "Tài liệu nào có thể upload?",
      answer: "Bạn có thể upload PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), và text files. Mỗi file tối đa 50MB. Không giới hạn số lượng file cho mỗi bài học."
    },
    {
      question: "Làm sao để thay đổi thumbnail?",
      answer: "Trong phần chỉnh sửa bài học, nhấn vào khu vực 'Hình đại diện' ở sidebar bên phải. Chọn ảnh từ máy tính của bạn. Khuyến nghị kích thước 1280x720px (tỷ lệ 16:9)."
    },
    {
      question: "Sự khác biệt giữa 'Bản nháp' và 'Đã xuất bản'?",
      answer: "Bản nháp (Draft) chỉ bạn mới thấy được, học viên không truy cập được. Đã xuất bản (Published) có nghĩa bài học sẵn sàng cho học viên xem. Bạn có thể chuyển đổi giữa hai trạng thái này bất cứ lúc nào."
    }
  ];

  return (
    <div className="guide-page">
      <div className="container">
        {/* Header với nút đóng */}
        <div className="guide-header">
          <div className="header-content">
            <h2 className="fw-bold mb-2">Hướng dẫn sử dụng</h2>
            <p className="text-muted mb-0">
              Hướng dẫn chi tiết về cách tạo và quản lý bài học
            </p>
          </div>
          <Button 
            variant="outline-dark" 
            className="close-button"
            onClick={() => window.history.back()}
          >
            Đóng
          </Button>
        </div>

        {/* Card Bắt đầu nhanh */}
        <Card className="guide-card p-4">
          <h5 className="card-title fw-bold">✅ Bắt đầu nhanh</h5>
          <p className="mb-3">Các bước cơ bản để tạo một bài học hoàn chỉnh</p>
          <ol className="step-list ps-3">
            <li className="mb-2"><b>Tạo khóa học</b>: Vào tab "Khóa học" và nhấn "Tạo khóa học mới".</li>
            <li className="mb-2"><b>Tạo bài học</b>: Vào tab "Bài học" và nhấn "Tạo bài học mới".</li>
            <li className="mb-2"><b>Upload video</b>: Thêm video bằng cách upload file hoặc URL YouTube/Vimeo.</li>
            <li className="mb-2"><b>Thêm tài liệu</b>: Upload PDF, Word, PowerPoint để học viên tải về.</li>
            <li className="mb-2"><b>Lưu và xuất bản</b>: Nhấn "Lưu bài học" để xuất bản cho học viên.</li>
          </ol>
        </Card>

        {/* Card Hướng dẫn upload video */}
        <Card className="guide-card p-4">
          <h5 className="card-title fw-bold">📹 Hướng dẫn upload video</h5>
          
          <div className="row mt-3">
            <div className="col-md-6">
              <Card className="method-card url-method p-3 mb-3">
                <h6 className="method-title fw-bold">Phương pháp 1: URL Video</h6>
                <ul className="method-list mb-3">
                  <li>Sao chép URL từ YouTube hoặc Vimeo</li>
                  <li>Dán vào ô "URL Video"</li>
                  <li>Nhấn "Lưu URL"</li>
                  <li>Xem preview để kiểm tra</li>
                </ul>
                <p className="text-muted small mb-0">
                  <strong>Khuyến nghị:</strong> Phương pháp này nhanh và tiết kiệm dung lượng
                </p>
              </Card>
            </div>
            <div className="col-md-6">
              <Card className="method-card upload-method p-3 mb-3">
                <h6 className="method-title fw-bold">Phương pháp 2: Upload File</h6>
                <ul className="method-list mb-3">
                  <li>Nhấn vào khu vực upload</li>
                  <li>Chọn file video (MP4, MOV, AVI)</li>
                  <li>Nhấn "Tải lên video"</li>
                  <li>Đợi quá trình upload hoàn tất</li>
                </ul>
                <p className="text-muted small mb-0">
                  <strong>Lưu ý:</strong> Dung lượng tối đa 500MB, nên nén video trước khi upload
                </p>
              </Card>
            </div>
          </div>
        </Card>

        {/* Card Thực hành tốt nhất */}
        <Card className="guide-card p-4">
          <h5 className="card-title fw-bold">🎯 Thực hành tốt nhất</h5>
          
          <div className="row mt-3">
            <div className="col-md-6">
              <Card className="best-practice-card do-card p-3">
                <h6 className="practice-title fw-bold mb-3">✓ Nên làm</h6>
                <ul className="practice-list small">
                  <li>Video chất lượng HD (720p trở lên)</li>
                  <li>Thời lượng 10-20 phút mỗi bài</li>
                  <li>Tiêu đề rõ ràng, dễ hiểu</li>
                  <li>Thêm hình thumbnail hấp dẫn</li>
                  <li>Cung cấp tài liệu bổ sung</li>
                  <li>Kiểm tra preview trước khi lưu</li>
                  <li>Sử dụng mô tả chi tiết</li>
                </ul>
              </Card>
            </div>
            <div className="col-md-6">
              <Card className="best-practice-card dont-card p-3">
                <h6 className="practice-title fw-bold mb-3">✗ Không nên làm</h6>
                <ul className="practice-list small">
                  <li>Video quá dài (trên 30 phút)</li>
                  <li>Chất lượng video kém</li>
                  <li>Tiêu đề mơ hồ, không rõ ràng</li>
                  <li>Không có tài liệu hỗ trợ</li>
                  <li>Upload file quá lớn</li>
                  <li>URL video không hợp lệ</li>
                  <li>Bỏ qua phần mô tả</li>
                </ul>
              </Card>
            </div>
          </div>
        </Card>

        {/* Card Yêu cầu kỹ thuật */}
        <Card className="guide-card p-4">
          <h5 className="card-title fw-bold">📋 Yêu cầu kỹ thuật</h5>
          
          <div className="row mt-3">
            <div className="col-md-4">
              <Card className="tech-specs-card p-3 h-100">
                <h6 className="specs-title">Video</h6>
                <ul className="specs-list small mb-0">
                  <li>Định dạng: MP4, MOV, AVI</li>
                  <li>Kích thước: Tối đa 500MB</li>
                  <li>Chất lượng: 720p trở lên</li>
                  <li>Codec: H.264 (khuyến nghị)</li>
                </ul>
              </Card>
            </div>
            <div className="col-md-4">
              <Card className="tech-specs-card p-3 h-100">
                <h6 className="specs-title">Hình ảnh</h6>
                <ul className="specs-list small mb-0">
                  <li>Định dạng: JPG, PNG</li>
                  <li>Kích thước: Tối đa 10MB</li>
                  <li>Tỷ lệ: 16:9 (1280x720)</li>
                  <li>DPI: 72 trở lên</li>
                </ul>
              </Card>
            </div>
            <div className="col-md-4">
              <Card className="tech-specs-card p-3 h-100">
                <h6 className="specs-title">Tài liệu</h6>
                <ul className="specs-list small mb-0">
                  <li>PDF, Word, PowerPoint</li>
                  <li>Kích thước: Tối đa 50MB</li>
                  <li>Không giới hạn số lượng</li>
                  <li>Encoding: UTF-8</li>
                </ul>
              </Card>
            </div>
          </div>
        </Card>

        {/* Card Câu hỏi thường gặp */}
        <Card className="guide-card p-4">
          <h5 className="card-title fw-bold">❓ Câu hỏi thường gặp</h5>
          
          <div className="faq-section mt-3">
            {faqData.map((faq, index) => (
              <Card key={index} className="faq-item">
                <Card.Header 
                  className="faq-header"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="faq-question">{faq.question}</strong>
                    <span className={`faq-icon ${openFaq === index ? 'open' : ''}`}>
                      &gt;
                    </span>
                  </div>
                </Card.Header>
                {openFaq === index && (
                  <Card.Body className="faq-answer">
                    <p className="mb-0 small">{faq.answer}</p>
                  </Card.Body>
                )}
              </Card>
            ))}
          </div>
        </Card>

        {/* Card Cần hỗ trợ */}
        <Card className="guide-card support-card p-4">
          <h5 className="card-title fw-bold">💬 Cần hỗ trợ?</h5>
          <p className="mb-3">
            Liên hệ với chúng tôi nếu bạn gặp vấn đề hoặc có câu hỏi
          </p>
          <div className="d-flex gap-2">
            <Button variant="outline-dark" size="sm" className="rounded-3">
              Gửi yêu cầu hỗ trợ
            </Button>
            <Button variant="outline-dark" size="sm" className="rounded-3">
              Xem tài liệu đầy đủ
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Guide;