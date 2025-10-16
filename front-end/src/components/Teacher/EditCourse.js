import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Modal, Accordion } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../../middleware/courseAPI";

import "bootstrap/dist/css/bootstrap.min.css";
import "./EditCourse.scss";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form states
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [courseLevel, setCourseLevel] = useState(1);
  
  // Chapter modal
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterName, setChapterName] = useState("");
  
  // Video modal
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      const data = await getCourseById(id);
      setCourse(data);
      setCourseName(data.courseName);
      setDescription(data.description);
      setCourseLevel(data.courseLevel);
    } catch (err) {
      console.error("Error loading course:", err);
      setError("Không thể tải thông tin khóa học");
    } finally {
      setIsLoading(false);
    }
  };

  // ============ COURSE HANDLERS ============
  const handleUpdateCourse = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      const updatedData = {
        courseName,
        description,
        courseLevel: parseInt(courseLevel)
      };

      // TODO: Call API
      // await updateCourse(id, updatedData);
      
      setCourse({ ...course, ...updatedData });
      setSuccess("Cập nhật khóa học thành công!");
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating course:", err);
      setError("Không thể cập nhật khóa học");
    }
  };

  // ============ CHAPTER HANDLERS ============
  const handleOpenChapterModal = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter);
      setChapterName(chapter.chapterName);
    } else {
      setEditingChapter(null);
      setChapterName("");
    }
    setShowChapterModal(true);
  };

  const handleSaveChapter = async () => {
    try {
      if (!chapterName.trim()) {
        alert("Vui lòng nhập tên chương");
        return;
      }

      if (editingChapter) {
        // Update existing chapter
        // TODO: Call API
        // await updateChapter(editingChapter.chapterID, { chapterName });
        
        const updatedChapters = course.chapters.map(ch =>
          ch.chapterID === editingChapter.chapterID
            ? { ...ch, chapterName }
            : ch
        );
        setCourse({ ...course, chapters: updatedChapters });
        setSuccess("Cập nhật chương thành công!");
      } else {
        // Create new chapter
        const newChapter = {
          chapterID: Math.max(...course.chapters.map(c => c.chapterID), 0) + 1,
          chapterName,
          videos: []
        };
        
        // TODO: Call API
        // const created = await createChapter(id, { chapterName });
        
        setCourse({ ...course, chapters: [...course.chapters, newChapter] });
        setSuccess("Tạo chương mới thành công!");
      }

      setShowChapterModal(false);
      setChapterName("");
      setEditingChapter(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving chapter:", err);
      setError("Không thể lưu chương");
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chương này? Tất cả video trong chương cũng sẽ bị xóa.")) {
      return;
    }

    try {
      // TODO: Call API
      // await deleteChapter(chapterId);
      
      const updatedChapters = course.chapters.filter(ch => ch.chapterID !== chapterId);
      setCourse({ ...course, chapters: updatedChapters });
      setSuccess("Xóa chương thành công!");
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting chapter:", err);
      setError("Không thể xóa chương");
    }
  };

  // ============ VIDEO HANDLERS ============
  const handleOpenVideoModal = (chapterId, video = null) => {
    setSelectedChapterId(chapterId);
    
    if (video) {
      setEditingVideo(video);
      setVideoName(video.videoName);
      setVideoURL(video.videoURL || "");
      setIsPreview(video.isPreview || false);
    } else {
      setEditingVideo(null);
      setVideoName("");
      setVideoURL("");
      setIsPreview(false);
    }
    
    setShowVideoModal(true);
  };

  const handleSaveVideo = async () => {
    try {
      if (!videoName.trim()) {
        alert("Vui lòng nhập tên video");
        return;
      }

      const videoData = {
        videoName,
        videoURL: videoURL.trim() || null,
        isPreview
      };

      if (editingVideo) {
        // Update existing video
        // TODO: Call API
        // await updateVideo(editingVideo.videoID, videoData);
        
        const updatedChapters = course.chapters.map(ch => {
          if (ch.chapterID === selectedChapterId) {
            const updatedVideos = ch.videos.map(v =>
              v.videoID === editingVideo.videoID
                ? { ...v, ...videoData }
                : v
            );
            return { ...ch, videos: updatedVideos };
          }
          return ch;
        });
        
        setCourse({ ...course, chapters: updatedChapters });
        setSuccess("Cập nhật video thành công!");
      } else {
        // Create new video
        const newVideo = {
          videoID: Math.max(...course.chapters.flatMap(ch => ch.videos.map(v => v.videoID)), 0) + 1,
          ...videoData
        };
        
        // TODO: Call API
        // const created = await createVideo(selectedChapterId, videoData);
        
        const updatedChapters = course.chapters.map(ch => {
          if (ch.chapterID === selectedChapterId) {
            return { ...ch, videos: [...ch.videos, newVideo] };
          }
          return ch;
        });
        
        setCourse({ ...course, chapters: updatedChapters });
        setSuccess("Tạo video mới thành công!");
      }

      setShowVideoModal(false);
      resetVideoForm();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving video:", err);
      setError("Không thể lưu video");
    }
  };

  const handleDeleteVideo = async (chapterId, videoId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa video này?")) {
      return;
    }

    try {
      // TODO: Call API
      // await deleteVideo(videoId);
      
      const updatedChapters = course.chapters.map(ch => {
        if (ch.chapterID === chapterId) {
          const updatedVideos = ch.videos.filter(v => v.videoID !== videoId);
          return { ...ch, videos: updatedVideos };
        }
        return ch;
      });
      
      setCourse({ ...course, chapters: updatedChapters });
      setSuccess("Xóa video thành công!");
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting video:", err);
      setError("Không thể xóa video");
    }
  };

  const resetVideoForm = () => {
    setVideoName("");
    setVideoURL("");
    setIsPreview(false);
    setEditingVideo(null);
    setSelectedChapterId(null);
  };

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải khóa học...</p>
        </div>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>Không tìm thấy khóa học.</p>
          <Button variant="outline-danger" onClick={() => navigate("/teacher/dashboard")}>
            Quay về Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4 edit-course-page">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Button 
            variant="link" 
            className="back-button p-0 mb-3"
            onClick={() => navigate("/teacher/dashboard")}
          >
            ← Quay lại Dashboard
          </Button>
          <h2>Chỉnh sửa khóa học</h2>
          <p className="text-muted">Cập nhật thông tin và nội dung khóa học</p>
        </Col>
      </Row>

      {/* Alerts */}
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Row>
        {/* Left Column - Course Info */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Thông tin khóa học</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tên khóa học</Form.Label>
                  <Form.Control
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Nhập tên khóa học"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả về khóa học"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cấp độ</Form.Label>
                  <Form.Select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value)}
                  >
                    <option value="1">Level 1 - Nền tảng</option>
                    <option value="2">Level 2 - Cơ bản</option>
                    <option value="3">Level 3 - Trung cấp</option>
                    <option value="4">Level 4 - Chuyên sâu</option>
                    <option value="5">Level 5 - Nâng cao</option>
                  </Form.Select>
                </Form.Group>

                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={handleUpdateCourse}
                >
                  Lưu thay đổi
                </Button>
              </Form>

              <hr className="my-4" />

              <div className="course-stats">
                <h6 className="mb-3">Thống kê</h6>
                <div className="stat-item mb-2">
                  <span>📚 Số chương:</span>
                  <strong>{course.chapters?.length || 0}</strong>
                </div>
                <div className="stat-item mb-2">
                  <span>🎥 Tổng video:</span>
                  <strong>
                    {course.chapters?.reduce((sum, ch) => sum + (ch.videos?.length || 0), 0) || 0}
                  </strong>
                </div>
                <div className="stat-item">
                  <span>👁️ Video miễn phí:</span>
                  <strong>
                    {course.chapters?.reduce((sum, ch) => 
                      sum + (ch.videos?.filter(v => v.isPreview).length || 0), 0) || 0}
                  </strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Chapters & Videos */}
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Nội dung khóa học</h5>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => handleOpenChapterModal()}
              >
                + Thêm chương
              </Button>
            </Card.Header>
            <Card.Body>
              {course.chapters && course.chapters.length > 0 ? (
                <Accordion defaultActiveKey="0">
                  {course.chapters.map((chapter, index) => (
                    <Accordion.Item eventKey={index.toString()} key={chapter.chapterID}>
                      <Accordion.Header>
                        <div className="chapter-header-content w-100">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{chapter.chapterName}</strong>
                              <small className="text-muted ms-2">
                                ({chapter.videos?.length || 0} videos)
                              </small>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="link"
                                size="sm"
                                className="p-1 me-2"
                                onClick={() => handleOpenChapterModal(chapter)}
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="link"
                                size="sm"
                                className="p-1 text-danger"
                                onClick={() => handleDeleteChapter(chapter.chapterID)}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="mb-3">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleOpenVideoModal(chapter.chapterID)}
                          >
                            + Thêm video
                          </Button>
                        </div>

                        {chapter.videos && chapter.videos.length > 0 ? (
                          <div className="video-list">
                            {chapter.videos.map((video) => (
                              <div key={video.videoID} className="video-item">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="flex-grow-1">
                                    <div className="video-name">{video.videoName}</div>
                                    <div className="video-meta">
                                      {video.videoURL ? (
                                        <>
                                          <Badge bg="success" className="me-2">Có video</Badge>
                                          <a 
                                            href={video.videoURL} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary small"
                                          >
                                            Xem video
                                          </a>
                                        </>
                                      ) : (
                                        <Badge bg="secondary">Chưa có video</Badge>
                                      )}
                                      {video.isPreview && (
                                        <Badge bg="info" className="ms-2">Miễn phí</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="video-actions">
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => handleOpenVideoModal(chapter.chapterID, video)}
                                    >
                                      ✏️
                                    </Button>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="text-danger"
                                      onClick={() => handleDeleteVideo(chapter.chapterID, video.videoID)}
                                    >
                                      🗑️
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted py-3">
                            Chưa có video nào trong chương này
                          </div>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center text-muted py-5">
                  <p>Chưa có chương nào</p>
                  <Button 
                    variant="primary"
                    onClick={() => handleOpenChapterModal()}
                  >
                    Tạo chương đầu tiên
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chapter Modal */}
      <Modal show={showChapterModal} onHide={() => setShowChapterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingChapter ? "Chỉnh sửa chương" : "Tạo chương mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Tên chương</Form.Label>
              <Form.Control
                type="text"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                placeholder="Ví dụ: Chapter 1: Introduction"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowChapterModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveChapter}>
            {editingChapter ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Video Modal */}
      <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingVideo ? "Chỉnh sửa video" : "Thêm video mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên video/bài học</Form.Label>
              <Form.Control
                type="text"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
                placeholder="Ví dụ: Section 1: Basic Grammar"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>URL Video (YouTube embed)</Form.Label>
              <Form.Control
                type="text"
                value={videoURL}
                onChange={(e) => setVideoURL(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
              />
              <Form.Text className="text-muted">
                Để trống nếu chưa có video
              </Form.Text>
            </Form.Group>

            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Cho phép xem trước miễn phí"
                checked={isPreview}
                onChange={(e) => setIsPreview(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowVideoModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveVideo}>
            {editingVideo ? "Cập nhật" : "Thêm video"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditCourse;