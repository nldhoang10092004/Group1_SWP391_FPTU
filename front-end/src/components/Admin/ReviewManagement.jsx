import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Star, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([
    {
      id: 'review1',
      courseId: 'course1',
      courseName: 'English Foundation',
      studentName: 'Nguyễn Văn A',
      rating: 5,
      comment: 'Khóa học rất hay và bổ ích! Giảng viên nhiệt tình, nội dung dễ hiểu.',
      createdAt: '2024-12-20',
      status: 'approved'
    },
    {
      id: 'review2',
      courseId: 'course2',
      courseName: 'Pre-Intermediate English',
      studentName: 'Trần Thị B',
      rating: 4,
      comment: 'Nội dung tốt nhưng cần thêm bài tập thực hành.',
      createdAt: '2024-12-22',
      status: 'pending'
    },
    {
      id: 'review3',
      courseId: 'course1',
      courseName: 'English Foundation',
      studentName: 'Lê Văn C',
      rating: 5,
      comment: 'Tuyệt vời! Đã học được rất nhiều kiến thức bổ ích.',
      createdAt: '2024-12-23',
      status: 'approved'
    },
    {
      id: 'review4',
      courseId: 'course3',
      courseName: 'Intermediate Conversation',
      studentName: 'Phạm Thị D',
      rating: 3,
      comment: 'Khóa học ok nhưng giá hơi cao.',
      createdAt: '2024-12-24',
      status: 'pending'
    },
    {
      id: 'review5',
      courseId: 'course2',
      courseName: 'Advanced Business English',
      studentName: 'Hoàng Văn E',
      rating: 5,
      comment: 'Rất phù hợp cho người đi làm. Nội dung thiết thực.',
      createdAt: '2024-12-25',
      status: 'approved'
    }
  ]);

  const handleApproveReview = (reviewId) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId ? { ...review, status: 'approved' } : review
    ));
    toast.success("Đã phê duyệt đánh giá");
  };

  const handleHideReview = (reviewId) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId ? { ...review, status: 'hidden' } : review
    ));
    toast.success("Đã ẩn đánh giá");
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success("Đã xóa đánh giá");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
            size={16}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { label: 'Đã duyệt', className: 'status-approved' },
      pending: { label: 'Chờ duyệt', className: 'status-pending' },
      hidden: { label: 'Đã ẩn', className: 'status-hidden' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={`status-badge ${config.className}`}>{config.label}</Badge>;
  };

  return (
    <div className="review-management">
      <Card className="management-card">
        <CardHeader>
          <CardTitle>Quản lý đánh giá</CardTitle>
          <CardDescription>Xem, phê duyệt và quản lý đánh giá của học viên</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khóa học</TableHead>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review, index) => (
                  <TableRow key={review.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <TableCell className="course-name">{review.courseName}</TableCell>
                    <TableCell>{review.studentName}</TableCell>
                    <TableCell>
                      <div className="rating-cell">
                        {renderStars(review.rating)}
                        <span className="rating-number">{review.rating}/5</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="review-comment">{review.comment}</div>
                    </TableCell>
                    <TableCell>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell>
                      <div className="action-buttons">
                        {review.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="action-btn"
                              onClick={() => handleApproveReview(review.id)}
                              title="Phê duyệt"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="action-btn"
                              onClick={() => handleHideReview(review.id)}
                              title="Ẩn"
                            >
                              <XCircle className="h-4 w-4 text-orange-600" />
                            </Button>
                          </>
                        )}
                        {review.status === 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="action-btn"
                            onClick={() => handleHideReview(review.id)}
                            title="Ẩn"
                          >
                            <XCircle className="h-4 w-4 text-orange-600" />
                          </Button>
                        )}
                        {review.status === 'hidden' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="action-btn"
                            onClick={() => handleApproveReview(review.id)}
                            title="Hiện lại"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="action-btn" title="Xem chi tiết">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="action-btn"
                          onClick={() => handleDeleteReview(review.id)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
