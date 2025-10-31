import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Modal, Accordion } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
 getTeacherCourseDetail as getCourseById,
  createTeacherCourse as createCourse,
  updateTeacherCourse as updateCourse,
  createChapter,
  updateChapter,
  deleteChapter,
  createVideo,
  deleteVideo,
} from "../../middleware/teacher/courseTeacherAPI"; // ✅ dùng file API thật của Teacher

import "bootstrap/dist/css/bootstrap.min.css";
import "./EditCourse.scss";

const CreateEditCourse = () => {
  const { id } = useParams(); // nếu không có id → tạo mới
  const navigate = useNavigate();

  const isEditMode = !!id;
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // form state
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [courseLevel, setCourseLevel] = useState(1);

  // modal states
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterName, setChapterName] = useState("");

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  // tải dữ liệu nếu là chế độ sửa
  useEffect(() => {
    if (isEditMode) {
      loadCourseData();
    } else {
      setCourse({ chapters: [] });
    }
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
      console.error("❌ Lỗi tải khóa học:", err);
      setError("Không thể tải thông tin khóa học");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Lưu hoặc tạo mới khóa học
  const handleSaveCourse = async () => {
    try {
      setError(null);
      setSuccess(null);
      if (!courseName.trim()) {
        setError("Tên khóa học không được để trống");
        return;
      }

      const payload = {
        courseName,
        description,
        courseLevel: parseInt(courseLevel),
      };

      let savedCourse = null;
      if (isEditMode) {
        savedCourse = await updateCourse(id, payload);
        setSuccess("✅ Cập nhật khóa học thành công!");
      } else {
        savedCourse = await createCourse(payload);
        setSuccess("✅ Tạo khóa học mới thành công!");
        navigate(`/teacher/courses/edit/${savedCourse.courseID}`); // chuyển sang trang edit
      }

      setCourse(savedCourse);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("❌ Lỗi khi lưu khóa học:", err);
      setError("Không thể lưu khóa học");
    }
  };

  // ✅ Thêm hoặc sửa chương
  const handleSaveChapter = async () => {
    try {
      if (!chapterName.trim()) {
        alert("Vui lòng nhập tên chương");
        return;
      }

      if (editingChapter) {
        const updated = await updateChapter(editingChapter.chapterID, { chapterName });
        const updatedChapters = course.chapters.map((ch) =>
          ch.chapterID === updated.chapterID ? updated : ch
        );
        setCourse({ ...course, chapters: updatedChapters });
        setSuccess("Cập nhật chương thành công!");
      } else {
        const created = await createChapter(course.courseID, { chapterName });
        setCourse({ ...course, chapters: [...course.chapters, created] });
        setSuccess("Tạo chương mới thành công!");
      }

      setShowChapterModal(false);
      setChapterName("");
      setEditingChapter(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("❌ Lỗi khi lưu chương:", err);
      setError("Không thể lưu chương");
    }
  };

  // ✅ Xóa chương
  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chương này?")) return;
    try {
      await deleteChapter(chapterId);
      const updatedChapters = course.chapters.filter((ch) => ch.chapterID !== chapterId);
      setCourse({ ...course, chapters: updatedChapters });
      setSuccess("Xóa chương thành công!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("❌ Lỗi khi xóa chương:", err);
      setError("Không thể xóa chương");
    }
  };

  // ✅ Thêm hoặc sửa video
  const handleSaveVideo = async () => {
    try {
      if (!videoName.trim()) {
        alert("Vui lòng nhập tên video");
        return;
      }

      const payload = {
        videoName,
        videoURL: videoURL.trim() || null,
        isPreview,
      };

      let updatedChapters = [...course.chapters];
      if (editingVideo) {
        const updated = await createVideo(editingVideo.videoID, payload);
        updatedChapters = updatedChapters.map((ch) =>
          ch.chapterID === selectedChapterId
            ? { ...ch, videos: ch.videos.map((v) => (v.videoID === updated.videoID ? updated : v)) }
            : ch
        );
        setSuccess("Cập nhật video thành công!");
      } else {
        const created = await createVideo(selectedChapterId, payload);
        updatedChapters = updatedChapters.map((ch) =>
          ch.chapterID === selectedChapterId ? { ...ch, videos: [...ch.videos, created] } : ch
        );
        setSuccess("Tạo video mới thành công!");
      }

      setCourse({ ...course, chapters: updatedChapters });
      setShowVideoModal(false);
      resetVideoForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("❌ Lỗi khi lưu video:", err);
      setError("Không thể lưu video");
    }
  };

  // ✅ Xóa video
  const handleDeleteVideo = async (chapterId, videoId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa video này?")) return;
    try {
      await deleteVideo(videoId);
      const updatedChapters = course.chapters.map((ch) =>
        ch.chapterID === chapterId
          ? { ...ch, videos: ch.videos.filter((v) => v.videoID !== videoId) }
          : ch
      );
      setCourse({ ...course, chapters: updatedChapters });
      setSuccess("Xóa video thành công!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("❌ Lỗi khi xóa video:", err);
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

  // ================= UI render =================
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Đang tải dữ liệu khóa học...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4 edit-course-page">
      <Row className="mb-4">
        <Col>
          <Button variant="link" onClick={() => navigate("/teacher/dashboard")} className="p-0 mb-3">
            ← Quay lại Dashboard
          </Button>
          <h2>{isEditMode ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}</h2>
          <p className="text-muted">{isEditMode ? "Cập nhật nội dung khóa học" : "Điền thông tin khóa học mới"}</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Row>
        {/* Thông tin khóa học */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header><h5>Thông tin khóa học</h5></Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tên khóa học</Form.Label>
                  <Form.Control value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Cấp độ</Form.Label>
                  <Form.Select value={courseLevel} onChange={(e) => setCourseLevel(e.target.value)}>
                    {[1,2,3,4,5].map(lv => (
                      <option key={lv} value={lv}>Level {lv}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Button variant="primary" className="w-100" onClick={handleSaveCourse}>
                  {isEditMode ? "Lưu thay đổi" : "Tạo khóa học"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Nội dung chương & video */}
        {isEditMode && (
          <Col lg={8}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Nội dung khóa học</h5>
                <Button size="sm" onClick={() => setShowChapterModal(true)}>+ Thêm chương</Button>
              </Card.Header>
              <Card.Body>
                {course?.chapters?.length > 0 ? (
                  <Accordion>
                    {course.chapters.map((chapter, i) => (
                      <Accordion.Item eventKey={i.toString()} key={chapter.chapterID}>
                        <Accordion.Header>
                          <div className="w-100 d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{chapter.chapterName}</strong>
                              <small className="text-muted ms-2">
                                ({chapter.videos?.length || 0} video)
                              </small>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <Button variant="link" size="sm" onClick={() => {
                                setEditingChapter(chapter);
                                setChapterName(chapter.chapterName);
                                setShowChapterModal(true);
                              }}>✏️</Button>
                              <Button variant="link" size="sm" className="text-danger" onClick={() => handleDeleteChapter(chapter.chapterID)}>🗑️</Button>
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="mb-3"
                            onClick={() => {
                              setSelectedChapterId(chapter.chapterID);
                              setShowVideoModal(true);
                            }}
                          >
                            + Thêm video
                          </Button>
                          {chapter.videos?.length ? (
                            chapter.videos.map((video) => (
                              <div key={video.videoID} className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                  <div>{video.videoName}</div>
                                  <div>
                                    {video.isPreview && <Badge bg="info" className="me-2">Miễn phí</Badge>}
                                    {video.videoURL ? (
                                      <a href={video.videoURL} target="_blank" rel="noreferrer">Xem video</a>
                                    ) : (
                                      <Badge bg="secondary">Chưa có URL</Badge>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Button variant="link" size="sm" onClick={() => {
                                    setEditingVideo(video);
                                    setSelectedChapterId(chapter.chapterID);
                                    setVideoName(video.videoName);
                                    setVideoURL(video.videoURL);
                                    setIsPreview(video.isPreview);
                                    setShowVideoModal(true);
                                  }}>✏️</Button>
                                  <Button variant="link" size="sm" className="text-danger" onClick={() => handleDeleteVideo(chapter.chapterID, video.videoID)}>🗑️</Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-muted">Chưa có video nào</div>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center text-muted py-4">
                    Chưa có chương nào
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Chapter Modal */}
      <Modal show={showChapterModal} onHide={() => setShowChapterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingChapter ? "Chỉnh sửa chương" : "Thêm chương mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Tên chương</Form.Label>
              <Form.Control
                type="text"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChapterModal(false)}>Hủy</Button>
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
              <Form.Label>Tên video</Form.Label>
              <Form.Control
                type="text"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL video</Form.Label>
              <Form.Control
                type="text"
                value={videoURL}
                onChange={(e) => setVideoURL(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Cho phép xem trước miễn phí"
              checked={isPreview}
              onChange={(e) => setIsPreview(e.target.checked)}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVideoModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveVideo}>
            {editingVideo ? "Cập nhật" : "Thêm video"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateEditCourse;
