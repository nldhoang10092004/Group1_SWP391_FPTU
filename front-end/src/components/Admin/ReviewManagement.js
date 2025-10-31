import { useState, useEffect } from "react";
import { Star, Trash } from "lucide-react";
import "./management-styles.scss";

// Mock data for reviews - replace with API call
const mockReviews = [
  { id: 1, courseName: "ReactJS for Beginners", userName: "Nguyễn Văn A", rating: 5, comment: "Khóa học rất tuyệt vời, dễ hiểu!", createdAt: "2025-10-26T10:00:00Z" },
  { id: 2, courseName: "Advanced CSS", userName: "Trần Thị B", rating: 4, comment: "Nhiều kiến thức bổ ích, nhưng phần grid hơi khó.", createdAt: "2025-10-25T14:30:00Z" },
  { id: 3, courseName: "ReactJS for Beginners", userName: "Lê Văn C", rating: 5, comment: "Giảng viên dạy hay, nhiệt tình.", createdAt: "2025-10-25T09:00:00Z" },
  { id: 4, courseName: "UI/UX Design Principles", userName: "Phạm Thị D", rating: 3, comment: "Nội dung ổn nhưng cần thêm ví dụ thực tế.", createdAt: "2025-10-24T18:00:00Z" },
];

export function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReviews(mockReviews);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDeleteReview = (reviewId) => {
    if (window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) {
      setReviews(reviews.filter(r => r.id !== reviewId));
      // Add API call to delete review here
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="admin-loading-spinner">
        <div className="admin-spinner"></div>
        <p>Đang tải dữ liệu đánh giá...</p>
      </div>
    );
  }

  return (
    <div className="management-page-container">
      <div className="management-card">
        <div className="management-card-header">
          <h2 className="card-title">Quản lý Đánh giá</h2>
          <p className="card-description">Tổng số: {reviews.length} đánh giá</p>
        </div>

        <div className="management-card-content">
          <table className="management-table">
            <thead>
              <tr>
                <th>Khóa học</th>
                <th>Người dùng</th>
                <th>Đánh giá</th>
                <th>Bình luận</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td className="font-bold">{review.courseName}</td>
                  <td>{review.userName}</td>
                  <td>
                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  </td>
                  <td className="max-w-sm">{review.comment}</td>
                  <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDeleteReview(review.id)} className="action-button delete-button">
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReviewManagement;
