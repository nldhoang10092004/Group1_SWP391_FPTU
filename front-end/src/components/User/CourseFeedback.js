import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, submitCourseFeedback, getCourseFeedbacks } from "../../middleware/courseAPI";
import { FaStar, FaArrowLeft } from "react-icons/fa";
import "./CourseFeedback.scss";

const CourseFeedback = () => {
    const { courseId, id } = useParams(); // Try both common parameter names
    const navigate = useNavigate();
    
    // Use whichever param is defined
    const actualCourseId = courseId || id;
    
    const [course, setCourse] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [existingFeedbacks, setExistingFeedbacks] = useState([]);

    useEffect(() => {
        // Early return if no courseId
        if (!actualCourseId) {
            setError("Không tìm thấy mã khóa học trong URL");
            setIsLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                console.log("Loading course with ID:", actualCourseId);
                
                const [courseData, feedbacks] = await Promise.all([
                    getCourseById(actualCourseId),
                    getCourseFeedbacks(actualCourseId).catch((err) => {
                        console.warn("Could not load feedbacks:", err);
                        return [];
                    })
                ]);
                
                setCourse(courseData);
                setExistingFeedbacks(Array.isArray(feedbacks) ? feedbacks : []);
            } catch (err) {
                console.error("Error loading course:", err);
                setError("Không thể tải thông tin khóa học. Vui lòng kiểm tra lại.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [actualCourseId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            setError("Vui lòng chọn số sao đánh giá");
            return;
        }

        if (comment.trim().length < 10) {
            setError("Nhận xét phải có ít nhất 10 ký tự");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await submitCourseFeedback({
                courseID: parseInt(actualCourseId),
                rating: rating,
                comment: comment.trim()
            });

            setSuccess(true);
            setRating(0);
            setComment("");
            
            // Reload feedbacks
            try {
                const updatedFeedbacks = await getCourseFeedbacks(actualCourseId);
                setExistingFeedbacks(Array.isArray(updatedFeedbacks) ? updatedFeedbacks : []);
            } catch (err) {
                console.warn("Could not reload feedbacks:", err);
            }

            setTimeout(() => {
                navigate(`/course/${actualCourseId}`);
            }, 2000);
        } catch (err) {
            console.error("Error submitting feedback:", err);
            setError(err.message || "Không thể gửi đánh giá. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        size={40}
                        className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{ cursor: 'pointer' }}
                    />
                ))}
            </div>
        );
    };

    // Show error if no courseId in URL
    if (!actualCourseId) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <Alert.Heading>Lỗi</Alert.Heading>
                    <p>Không tìm thấy mã khóa học trong URL</p>
                </Alert>
                <Button onClick={() => navigate("/home")}>Quay về trang chủ</Button>
            </Container>
        );
    }

    if (isLoading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Đang tải...</p>
            </Container>
        );
    }

    if (!course) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    <Alert.Heading>Không tìm thấy khóa học</Alert.Heading>
                    <p>{error || "Khóa học không tồn tại hoặc đã bị xóa"}</p>
                </Alert>
                <Button onClick={() => navigate("/home")}>Quay về trang chủ</Button>
            </Container>
        );
    }

    return (
        <div className="course-feedback-page">
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={8}>
                        <Button 
                            variant="link" 
                            className="mb-3 p-0"
                            onClick={() => navigate(`/course/${actualCourseId}`)}
                        >
                            <FaArrowLeft className="me-2" />
                            Quay lại khóa học
                        </Button>

                        <Card className="shadow-sm">
                            <Card.Body className="p-4">
                                <h2 className="mb-3">Đánh giá khóa học</h2>
                                <p className="text-muted mb-4">{course.courseName}</p>

                                {success && (
                                    <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
                                        <strong>✅ Cảm ơn bạn!</strong> Đánh giá của bạn đã được gửi thành công.
                                    </Alert>
                                )}

                                {error && (
                                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">
                                            Bạn đánh giá khóa học này bao nhiêu sao? *
                                        </Form.Label>
                                        <div className="text-center py-3">
                                            {renderStars()}
                                            <p className="text-muted mt-2">
                                                {rating > 0 ? `${rating} sao` : 'Chọn số sao'}
                                            </p>
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">
                                            Nhận xét của bạn *
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        />
                                        <Form.Text className="text-muted">
                                            Tối thiểu 10 ký tự
                                        </Form.Text>
                                    </Form.Group>

                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Đang gửi...
                                                </>
                                            ) : (
                                                'Gửi đánh giá'
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => navigate(`/course/${actualCourseId}`)}
                                            disabled={isSubmitting}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Display existing feedbacks */}
                        {existingFeedbacks.length > 0 && (
                            <div className="mt-4">
                                <h4 className="mb-3">Đánh giá từ học viên khác</h4>
                                {existingFeedbacks.slice(0, 5).map((feedback, index) => (
                                    <Card key={index} className="mb-3">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <strong>{feedback.userName || "Học viên"}</strong>
                                                    <div className="mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar 
                                                                key={i} 
                                                                className={i < feedback.rating ? "text-warning" : "text-muted"}
                                                                size={14}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <small className="text-muted">
                                                    {feedback.createdDate ? new Date(feedback.createdDate).toLocaleDateString('vi-VN') : ''}
                                                </small>
                                            </div>
                                            <p className="mb-0">{feedback.comment}</p>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CourseFeedback;