import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Accordion, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../../middleware/courseAPI";
import "./CourseDetail.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const loadCourseDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCourseById(id);
        setCourse(data);
        
        // Tự động chọn video đầu tiên nếu có
        if (data.chapters && data.chapters.length > 0) {
          const firstChapter = data.chapters[0];
          if (firstChapter.videos && firstChapter.videos.length > 0) {
            setSelectedVideo(firstChapter.videos[0]);
          }
        }
      } catch (err) {
        console.error("Error loading course:", err);
        setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseDetail();
  }, [id]);

  const handleVideoSelect = (video) => {
    if (video.videoURL) {
      setSelectedVideo(video);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    // URL đã ở dạng embed sẵn từ API
    return url;
  };

  if (isLoading) {
    return (
      <div className="course-detail-page">
        <Container className="py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Đang tải khóa học...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-detail-page">
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>Lỗi!</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={() => navigate("/")}>
              Quay về trang chủ
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-page">
        <Container className="py-5">
          <Alert variant="warning">
            <p>Không tìm thấy khóa học.</p>
            <Button variant="outline-warning" onClick={() => navigate("/")}>
              Quay về trang chủ
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  const totalVideos = course.chapters?.reduce((sum, chapter) => sum + (chapter.videos?.length || 0), 0) || 0;
  const previewVideos = course.chapters?.reduce((sum, chapter) => 
    sum + (chapter.videos?.filter(v => v.isPreview).length || 0), 0) || 0;

  return (
    <div className="course-detail-page">
      {/* Course Header */}
      <div className="course-header">
        <Container>
          <Button 
            variant="link" 
            className="back-button mb-3"
            onClick={() => navigate("/")}
          >
            ← Quay lại
          </Button>
          <Row>
            <Col lg={8}>
              <h1 className="course-title">{course.courseName}</h1>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <Badge bg="primary" className="me-2">Level {course.courseLevel}</Badge>
                <span className="me-3">📚 {course.chapters?.length || 0} Chương</span>
                <span className="me-3">🎥 {totalVideos} Video</span>
                <span>👁️ {previewVideos} Video xem trước miễn phí</span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          {/* Video Player */}
          <Col lg={8} className="mb-4">
            <Card className="video-player-card">
              <Card.Body className="p-0">
                {selectedVideo && selectedVideo.videoURL ? (
                  <div className="video-container">
                    <iframe
                      width="100%"
                      height="450"
                      src={getYoutubeEmbedUrl(selectedVideo.videoURL)}
                      title={selectedVideo.videoName}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <div className="video-info p-3">
                      <h4>{selectedVideo.videoName}</h4>
                      {selectedVideo.isPreview && (
                        <Badge bg="success">Xem trước miễn phí</Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="no-video-selected">
                    <div className="text-center py-5">
                      <i className="bi bi-play-circle" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                      <h5 className="mt-3">Chọn một video để bắt đầu học</h5>
                      <p className="text-muted">Hãy chọn video từ danh sách bên phải</p>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Course Overview */}
            <Card className="mt-4">
              <Card.Body>
                <h5>Giới thiệu khóa học</h5>
                <p>
                  Khóa học <strong>{course.courseName}</strong> được thiết kế dành cho người học ở{" "}
                  <Badge bg="info">Level {course.courseLevel}</Badge>. 
                  Khóa học bao gồm {course.chapters?.length || 0} chương với tổng cộng {totalVideos} video bài giảng.
                </p>
                <p>
                  Bạn có thể xem trước <strong>{previewVideos} video miễn phí</strong> để trải nghiệm nội dung khóa học 
                  trước khi đăng ký membership.
                </p>
              </Card.Body>
            </Card>
          </Col>

          {/* Course Content Sidebar */}
          <Col lg={4}>
            <Card className="course-content-card sticky-top" style={{ top: '20px' }}>
              <Card.Header>
                <h5 className="mb-0">Nội dung khóa học</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Accordion defaultActiveKey="0" flush>
                  {course.chapters && course.chapters.length > 0 ? (
                    course.chapters.map((chapter, chapterIndex) => (
                      <Accordion.Item eventKey={chapterIndex.toString()} key={chapter.chapterID}>
                        <Accordion.Header>
                          <div className="chapter-header-content">
                            <strong>{chapter.chapterName}</strong>
                            <small className="text-muted d-block">
                              {chapter.videos?.length || 0} videos
                            </small>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body className="p-0">
                          <div className="video-list">
                            {chapter.videos && chapter.videos.length > 0 ? (
                              chapter.videos.map((video) => (
                                <div
                                  key={video.videoID}
                                  className={`video-item ${selectedVideo?.videoID === video.videoID ? 'active' : ''} 
                                    ${!video.videoURL ? 'locked' : ''}`}
                                  onClick={() => handleVideoSelect(video)}
                                  style={{ cursor: video.videoURL ? 'pointer' : 'not-allowed' }}
                                >
                                  <div className="video-item-content">
                                    <div className="d-flex align-items-start">
                                      {video.videoURL ? (
                                        <i className="bi bi-play-circle me-2" style={{ fontSize: '1.2rem' }}></i>
                                      ) : (
                                        <i className="bi bi-lock me-2" style={{ fontSize: '1.2rem' }}></i>
                                      )}
                                      <div className="flex-grow-1">
                                        <div className="video-name">{video.videoName}</div>
                                        {video.isPreview && (
                                          <Badge bg="success" className="mt-1">Miễn phí</Badge>
                                        )}
                                        {!video.videoURL && !video.isPreview && (
                                          <Badge bg="secondary" className="mt-1">Premium</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-muted text-center">
                                Chưa có video
                              </div>
                            )}
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))
                  ) : (
                    <div className="p-3 text-muted text-center">
                      Chưa có nội dung
                    </div>
                  )}
                </Accordion>
              </Card.Body>
              <Card.Footer className="text-center">
                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={() => navigate("/membership")}
                >
                  Đăng ký để mở khóa toàn bộ
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CourseDetail;