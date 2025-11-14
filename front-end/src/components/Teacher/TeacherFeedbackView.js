import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { getTeacherFeedbacks } from "../../middleware/teacher/feedbackTeacherAPI";

// Helper component to render stars
const RenderStars = ({ rating }) => {
  const filledStars = Math.round(Number(rating));

  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={16}
          // Set the stroke color for all stars
          className="text-yellow-400"
          // Fill the star with yellow if index is less than rating, otherwise fill with gray for an "empty" look
          fill={i < filledStars ? "#facc15" : "#e5e7eb"} // Using hex codes for yellow-400 and gray-200
        />
      ))}
    </div>
  );
};

export function TeacherFeedbackView() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setIsLoading(true);
        // The API likely gets the teacher from the token, so no ID is needed here.
        const data = await getTeacherFeedbacks();
        setFeedbacks(data);
        calculateStats(data);
      } catch (error) {
        console.error("Không thể tải danh sách đánh giá:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeedbacks();
  }, []);

  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats({
        total: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
      return;
    }

    const total = data.length;
    const sum = data.reduce((acc, fb) => acc + fb.rating, 0);
    const averageRating = total > 0 ? (sum / total).toFixed(1) : 0;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach((fb) => {
      const rating = Math.round(fb.rating); // Ensure rating is an integer
      if (ratingDistribution[rating] !== undefined) {
        ratingDistribution[rating]++;
      }
    });

    setStats({ total, averageRating, ratingDistribution });
  };

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) {
      return "N/A";
    }
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
    <div className="management-card">
      <div className="management-card-header">
        <h2 className="card-title">Đánh giá từ học viên</h2>
      </div>

      {/* Statistics Cards */}
      <div className="teacher-feedback-stats mt-4">
        {/* Total Reviews */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Tổng đánh giá</span>
            <div className="admin-stat-icon-wrapper icon-blue">
              <MessageSquare size={20} className="text-white" />
            </div>
          </div>
          <p className="admin-stat-value">{stats.total}</p>
        </div>

        {/* Average Rating */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đánh giá trung bình</span>
            <div className="admin-stat-icon-wrapper icon-orange">
              <Star size={20} className="text-white" />
            </div>
          </div>
          <p className="admin-stat-value">{stats.averageRating}</p>
        </div>

        {/* Rating Distribution */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Phân bổ đánh giá</span>
          </div>
          <div className="rating-distribution-chart mt-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating];
              const maxCount = Math.max(1, ...Object.values(stats.ratingDistribution));
              const percentage = (count / maxCount) * 100;
              return (
                <div key={rating} className="rating-bar-item">
                  <span className="rating-label">{rating} sao</span>
                  <div className="rating-bar-container">
                    <div
                      className="rating-bar-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="rating-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback List Table */}
      <div className="management-table-wrapper mt-6">
        <table className="management-table">
          <thead>
            <tr>
              <th>HỌC VIÊN</th>
              <th>ĐÁNH GIÁ</th>
              <th>NỘI DUNG</th>
              <th>NGÀY GỬI</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <tr key={feedback.feedbackId}>
                  <td className="font-medium">{feedback.username || 'Ẩn danh'}</td>
                  <td>
                    <RenderStars rating={feedback.rating} />
                  </td>
                  <td className="text-gray-600">{feedback.comment}</td>
                  <td className="text-gray-500">{formatDate(feedback.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-12">
                  Chưa có đánh giá nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeacherFeedbackView;