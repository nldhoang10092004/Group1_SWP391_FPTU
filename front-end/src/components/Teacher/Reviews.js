import React from "react";
import "./Reviews.scss";
import { Row, Col, Card } from "react-bootstrap";

const Reviews = () => {
  const reviews = [
    {
      id: 1,
      student: "Nguyễn Văn A",
      course: "English Foundation",
      comment: "Khóa học rất hay và dễ hiểu!",
      date: "2024-12-20",
      rating: 5
    },
    {
      id: 2,
      student: "Trần Thị B",
      course: "Pre-Intermediate English",
      comment: "Nội dung tốt, cần thêm bài tập.",
      date: "2024-12-22",
      rating: 4
    }
  ];

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  return (
    <div className="tab-content">
      <Row className="mb-3">
        <Col>
          <h5>
            <span className="section-label">1</span> Đánh giá từ học viên
          </h5>
        </Col>
      </Row>

      <Row>
        {reviews.map((review, idx) => (
          <Col md={6} key={review.id} className="mb-3">
            <Card className="review-card">
              <Card.Body>
                <div className="review-header mb-3">
                  <div className="reviewer-info">
                    <h6 className="mb-1">
                      <span className="section-label">{idx + 2}</span> {review.student}
                    </h6>
                    <small className="text-muted">{review.course}</small>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <div className="review-date text-muted">
                  <small>{review.date}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Reviews;