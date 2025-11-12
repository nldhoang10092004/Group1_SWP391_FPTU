import { useState, useEffect } from "react";
import { Star, Trash, Eye, EyeOff } from "lucide-react";
import { getAllFeedbacks, toggleFeedbackVisibility, deleteFeedback } from "../../middleware/admin/feedbackAdminAPI";
import "./management-styles.scss";

export function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showPopup = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const data = await getAllFeedbacks();
      setReviews(data);
    } catch (error) {
      showPopup("Không thể tải danh sách đánh giá", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async (feedbackId) => {
    try {
      await toggleFeedbackVisibility(feedbackId);
      // Update local state
      setReviews(reviews.map(review => 
        review.feedbackId === feedbackId 
          ? { ...review, isVisible: !review.isVisible }
          : review
      ));
    } catch (error) {
      showPopup("Không thể cập nhật trạng thái hiển thị", "error");
    }
  };

  const handleDeleteReview = async (feedbackId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) return;
    try {
      await deleteFeedback(feedbackId);
      setReviews(reviews.filter(r => r.feedbackId !== feedbackId));
    } catch (error) {
      showPopup("Không thể xóa đánh giá", "error");
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
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="management-card">
        <div className="management-card-header">
          <div>
            <h2 className="card-title">Quản lý Đánh giá</h2>
            <p className="card-description">Tổng số: {reviews.length} đánh giá</p>
          </div>
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
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.feedbackId}>
                  <td className="font-bold">{review.courseName}</td>
                  <td>{review.username}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm font-medium">({review.rating}/5)</span>
                    </div>
                  </td>
                  <td className="max-w-sm">
                    <div className="text-sm line-clamp-2">{review.comment}</div>
                  </td>
                  <td>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={`status-badge ${review.isVisible ? 'active' : 'inactive'}`}>
                      {review.isVisible ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleVisibility(review.feedbackId)} 
                        className={`action-button ${review.isVisible ? 'hide-button' : 'show-button'}`}
                        title={review.isVisible ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                      >
                        {review.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDeleteReview(review.feedbackId)} 
                        className="action-button delete-button"
                        title="Xóa đánh giá"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {reviews.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Chưa có đánh giá nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewManagement;