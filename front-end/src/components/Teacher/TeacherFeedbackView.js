import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { getTeacherFeedbacks } from "../../middleware/teacher/feedbackTeacherAPI";

export function TeacherFeedbackView() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);
      const data = await getTeacherFeedbacks();
      setFeedbacks(data);
      calculateStats(data);
    } catch (error) {
      console.error("Không thể tải danh sách đánh giá", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const sum = data.reduce((acc, fb) => acc + fb.rating, 0);
    const averageRating = total > 0 ? (sum / total).toFixed(1) : 0;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach(fb => {
      if (ratingDistribution[fb.rating] !== undefined) {
        ratingDistribution[fb.rating]++;
      }
    });

    setStats({ total, averageRating, ratingDistribution });
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đánh giá</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đánh giá trung bình</p>
              <div className="flex items-center mt-2">
                <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                <Star className="text-yellow-400 fill-current ml-2" size={24} />
              </div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Star className="text-yellow-600 fill-current" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-3">Phân bố đánh giá</p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8">{rating} ⭐</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${stats.total > 0 ? (stats.ratingDistribution[rating] / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{stats.ratingDistribution[rating]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Danh sách đánh giá</h2>
          <p className="text-sm text-gray-600 mt-1">Xem tất cả đánh giá từ học viên</p>
        </div>

        <div className="p-6">
          {feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Chưa có đánh giá nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback.feedbackId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">{feedback.username}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{feedback.courseName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(feedback.rating)}</div>
                        <span className="text-sm font-medium text-gray-700">({feedback.rating}/5)</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
                      
                      {feedback.isVisible && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Đang hiển thị công khai
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherFeedbackView;