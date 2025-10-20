import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Accordion, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, getVideoById } from "../../middleware/courseAPI";
import { checkMembership } from "../../middleware/membershipAPI";
import "./CourseDetail.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [hasMembership, setHasMembership] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1️⃣ Kiểm tra membership
        const membershipData = await checkMembership();
        const hasMember = membershipData.hasMembership || false;
        setHasMembership(hasMember);

        // 2️⃣ Tải course
        const courseData = await getCourseById(id);
        setCourse(courseData);

        // 3️⃣ Chọn video đầu tiên và load nó
        if (courseData.chapters?.length > 0) {
          let firstVideo = null;
          for (const chapter of courseData.chapters) {
            if (chapter.videos?.length > 0) {
              firstVideo = chapter.videos[0];
              if (firstVideo) break;
            }
          }
          
          // Load video đầu tiên
          if (firstVideo) {
            try {
              const videoData = await getVideoById(firstVideo.videoID);
              if (videoData.canWatch) {
                setSelectedVideo({
                  ...firstVideo,
                  videoURL: videoData.videoURL,
                  canWatch: videoData.canWatch,
                  requiresMembership: videoData.requiresMembership
                });
              }
            } catch (err) {
              console.error("Error loading first video:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error loading course:", err);
        setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleVideoSelect = async (video) => {
    // Nếu video đã có URL, không cần gọi API lại
    if (video.videoURL && video.canWatch !== undefined) {
      setSelectedVideo(video);
      return;
    }

    // Reset errors và set loading
    setVideoError(null);
    setLoadingVideo(true);
    
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setVideoError("Vui lòng đăng nhập để xem video này");
        setSelectedVideo(null);
        setLoadingVideo(false);
        return;
      }
      
      // Gọi API để lấy video URL thật từ backend
      const videoData = await getVideoById(video.videoID);
      
      // Kiểm tra xem có quyền xem không
      if (!videoData.canWatch) {
        setVideoError("Bạn cần đăng ký Membership để xem video này");
        setSelectedVideo(null);
        return;
      }
      
      // Update video với URL thật từ backend
      const updatedVideo = {
        ...video,
        videoURL: videoData.videoURL,
        canWatch: videoData.canWatch,
        requiresMembership: videoData.requiresMembership
      };
      
      setSelectedVideo(updatedVideo);
      
      // Update video trong course để lần sau không cần gọi API nữa
      setCourse(prevCourse => {
        const updatedCourse = { ...prevCourse };
        updatedCourse.chapters = prevCourse.chapters.map(chapter => ({
          ...chapter,
          videos: chapter.videos.map(v => 
            v.videoID === video.videoID ? updatedVideo : v
          )
        }));
        return updatedCourse;
      });
      
    } catch (error) {
      console.error("Error fetching video:", error);
      
      if (error.message === 'UNAUTHORIZED') {
        setVideoError("Vui lòng đăng nhập để xem video này");
      } else if (error.message === 'FORBIDDEN') {
        setVideoError("Bạn cần đăng ký Membership để xem video này");
      } else {
        setVideoError("Không thể tải video. Vui lòng thử lại sau.");
      }
      
      setSelectedVideo(null);
    } finally {
      setLoadingVideo(false);
    }
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    
    // Fix Google Drive uc?export=preview links
    if (url.includes('drive.google.com/uc?export=preview')) {
      const fileId = url.match(/[?&]id=([^&]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    // Return original URL for other cases
    return url;
  };

  if (isLoading) {
    return (
      <div className="course-detail-page">
        <Container className="py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải khóa học...</p>
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
            <Alert.Heading>Không tìm thấy khóa học</Alert.Heading>
            <p>Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Button variant="outline-warning" onClick={() => navigate("/")}>
              Quay về trang chủ
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  const totalVideos = course.chapters?.reduce((sum, ch) => sum + (ch.videos?.length || 0), 0) || 0;
  const previewVideos = course.chapters?.reduce(
    (sum, ch) => sum + (ch.videos?.filter(v => v.isPreview).length || 0),
    0
  ) || 0;

  return (
    <div className="course-detail-page">
      <Container className="py-4">
        <Button variant="link" onClick={() => navigate("/")} className="back-button">
          ← Quay lại trang chủ
        </Button>
        
        <Row>
          {/* Main Content */}
          <Col lg={8}>
            {/* Video Player */}
            <Card className="video-player-card mb-4">
              <Card.Body className="p-0">
                {loadingVideo ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Đang tải video...</p>
                  </div>
                ) : videoError ? (
                  <Alert variant="warning" className="m-3">
                    <Alert.Heading>Không thể xem video</Alert.Heading>
                    <p>{videoError}</p>
                    {videoError.includes("Membership") && (
                      <Button 
                        variant="primary" 
                        onClick={() => navigate("/membership")}
                      >
                        Đăng ký Membership
                      </Button>
                    )}
                  </Alert>
                ) : selectedVideo ? (
                  <div className="video-container">
                    <iframe
                      width="100%"
                      height="450"
                      src={getVideoEmbedUrl(selectedVideo.videoURL)}
                      title={selectedVideo.videoName}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <div className="video-info p-3">
                      <h4>{selectedVideo.videoName}</h4>
                      {selectedVideo.isPreview && !hasMembership && (
                        <Badge bg="success">Xem trước miễn phí</Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="no-video-selected text-center py-5">
                    <i className="bi bi-play-circle" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                    <h5 className="mt-3">Chọn một video để bắt đầu học</h5>
                    <p className="text-muted">Hãy chọn video từ danh sách bên phải</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Course Overview */}
            <Card className="course-overview-card">
              <Card.Body>
                <h5>Giới thiệu khóa học</h5>
                <p>
                  Khóa học <strong>{course.courseName}</strong> bao gồm {course.chapters?.length} chương, 
                  tổng cộng {totalVideos} video học tập chất lượng cao.
                </p>
                {!hasMembership && (
                  <p className="mb-0">
                    <Badge bg="success" className="me-1">Miễn phí</Badge>
                    Bạn có thể xem trước {previewVideos} video miễn phí trước khi đăng ký membership.
                  </p>
                )}
                {hasMembership && (
                  <p className="mb-0 text-success">
                    <Badge bg="success" className="me-1">Premium</Badge>
                    Bạn đã có quyền truy cập toàn bộ khóa học!
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar - Course Content */}
          <Col lg={4}>
            <Card className="course-content-card sticky-top">
              <Card.Header>
                <h5>Nội dung khóa học</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Accordion defaultActiveKey="0" flush>
                  {course.chapters?.map((chapter, idx) => (
                    <Accordion.Item eventKey={idx.toString()} key={chapter.chapterID}>
                      <Accordion.Header>
                        <div>
                          <strong>{chapter.chapterName}</strong>
                          <small className="text-muted d-block mt-1">
                            {chapter.videos?.length || 0} video{chapter.videos?.length !== 1 ? 's' : ''}
                          </small>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body className="p-0">
                        {chapter.videos?.map(video => {
                          return (
                            <div
                              key={video.videoID}
                              className={`video-item ${selectedVideo?.videoID === video.videoID ? 'active' : ''}`}
                              onClick={() => handleVideoSelect(video)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="video-item-content d-flex align-items-start">
                                <i 
                                  className="bi bi-play-circle me-3" 
                                  style={{ fontSize: '1.2rem', marginTop: '0.1rem' }}
                                ></i>
                                <div className="flex-grow-1">
                                  <div className="video-name">{video.videoName}</div>
                                  <div className="mt-1">
                                    {video.isPreview ? (
                                      <Badge bg="info" className="me-1">Preview</Badge>
                                    ) : (
                                      <Badge bg="warning" text="dark" className="me-1">Premium</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }) || (
                          <div className="p-3 text-muted text-center">
                            <i className="bi bi-film me-2"></i>
                            Chưa có video trong chương này
                          </div>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  )) || (
                    <div className="p-3 text-muted text-center">
                      <i className="bi bi-collection me-2"></i>
                      Khóa học chưa có nội dung
                    </div>
                  )}
                </Accordion>
              </Card.Body>
              
              {!hasMembership && (
                <Card.Footer className="text-center">
                  <Button 
                    variant="primary" 
                    className="w-100 membership-cta-btn"
                    onClick={() => navigate("/membership")}
                  >
                    <i className="bi bi-unlock me-2"></i>
                    Đăng ký Membership để mở khóa toàn bộ
                  </Button>
                </Card.Footer>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CourseDetail;