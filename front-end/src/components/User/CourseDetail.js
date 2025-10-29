import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Accordion, Alert, Tabs, Tab, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, getVideoById } from "../../middleware/courseAPI";
import { getQuizzesByCourse } from "../../middleware/QuizAPI";
import { checkMembership } from "../../middleware/membershipAPI";
import { getFlashcardSetsByCourseId } from "../../middleware/flashcardAPI";
import "./CourseDetail.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("video");

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [hasMembership, setHasMembership] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [flashcardError, setFlashcardError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };


  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const membershipData = await checkMembership();
        setHasMembership(membershipData.hasMembership || false);

        const courseData = await getCourseById(id);
        setCourse(courseData);

        // Load video đầu tiên
        if (courseData.chapters?.length > 0) {
          for (const chapter of courseData.chapters) {
            if (chapter.videos?.length > 0) {
              const firstVideo = chapter.videos[0];
              const videoData = await getVideoById(firstVideo.videoID);
              if (videoData.canWatch) {
                setSelectedVideo({
                  ...firstVideo,
                  videoURL: videoData.videoURL,
                  canWatch: videoData.canWatch,
                });
              }
              break;
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  // 🔹 Lấy danh sách quiz theo course
  const handleLoadQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      setQuizError(null);
      const data = await getQuizzesByCourse(id);
      setQuizzes(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setQuizError("Không thể tải danh sách quiz. Vui lòng thử lại sau.");
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // 🔹 Lấy danh sách flashcard sets theo course
  const handleLoadFlashcards = async () => {
    try {
      setLoadingFlashcards(true);
      setFlashcardError(null);
      const data = await getFlashcardSetsByCourseId(id);
      setFlashcardSets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
      setFlashcardError("Không thể tải danh sách flashcard. Vui lòng thử lại sau.");
    } finally {
      setLoadingFlashcards(false);
    }
  };
  // 🔹 Gọi flashcard khi chuyển sang tab flashcard
  useEffect(() => {
    if (activeTab === "flashcard" && flashcardSets.length === 0) {
      handleLoadFlashcards();
    }
  }, [activeTab]);

  // 🔹 Gọi lại quiz khi chuyển sang tab quiz
  useEffect(() => {
    if (activeTab === "quiz" && quizzes.length === 0) {
      handleLoadQuizzes();
    }
  }, [activeTab]);

  const handleViewFlashcards = (setId, title) => {
    showToast(`Đang mở bộ flashcard: ${title}`, "info");
    navigate(`/flashcard/${setId}`);
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("drive.google.com/uc?export=preview")) {
      const fileId = url.match(/[?&]id=([^&]+)/)?.[1];
      if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
  };

  if (isLoading) {
    return (
      <div className="course-detail-page text-center py-5">
        <Spinner animation="border" role="status" />
        <p>Đang tải khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Không tìm thấy khóa học</Alert>
        <Button onClick={() => navigate("/")}>Quay về trang chủ</Button>
      </Container>
    );
  }
  // 👉 Tính tổng video và preview
  const totalVideos =
    course.chapters?.reduce(
      (sum, ch) => sum + (ch.videos?.length || 0),
      0
    ) || 0;
  const previewVideos =
    course.chapters?.reduce(
      (sum, ch) => sum + (ch.videos?.filter((v) => v.isPreview).length || 0),
      0
    ) || 0;

  return (
    <div className="course-detail-page">
      <Container className="py-4">
        <Button variant="link" onClick={() => navigate(-1)} className="mb-3">
          ← Quay lại trang chủ
        </Button>

        {/* 🟩 Tabs Navigation */}
        <Tabs
          id="course-tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="video" title="🎬 Video">
            <Row>
              <Col lg={8}>
                <Card className="video-player-card mb-4">
                  <Card.Body className="p-0">
                    {loadingVideo ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" />
                        <p>Đang tải video...</p>
                      </div>
                    ) : videoError ? (
                      <Alert variant="danger" className="m-3">
                        {videoError}
                      </Alert>
                    ) : selectedVideo ? (
                      <div className="video-container">
                        <iframe
                          width="100%"
                          height="450"
                          src={getVideoEmbedUrl(selectedVideo.videoURL)}
                          title={selectedVideo.videoName}
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                        <div className="p-3">
                          <h5>{selectedVideo.videoName}</h5>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center py-5">Chưa chọn video</p>
                    )}
                  </Card.Body>
                </Card>

                {/* 🟨 Giới thiệu khóa học + Membership info */}
                <Card className="course-overview-card">
                  <Card.Body>
                    <h5>Giới thiệu khóa học</h5>
                    <p>
                      Khóa học <strong>{course.courseName}</strong> gồm{" "}
                      {course.chapters?.length} chương, tổng cộng{" "}
                      {totalVideos} video học tập chất lượng cao.
                    </p>

                    {!hasMembership ? (
                      <p className="mb-0">
                        <Badge bg="success" className="me-1">
                          Miễn phí
                        </Badge>
                        Bạn có thể xem trước {previewVideos} video miễn phí
                        trước khi đăng ký membership.
                      </p>
                    ) : (
                      <p className="mb-0 text-success">
                        <Badge bg="success" className="me-1">
                          Premium
                        </Badge>
                        Bạn đã có quyền truy cập toàn bộ khóa học!
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* ====== Sidebar nội dung khóa học ====== */}
              <Col lg={4}>
                <Card className="course-content-card sticky-top">
                  <Card.Header>
                    <h5>Nội dung khóa học</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Accordion defaultActiveKey="0" flush>
                      {course.chapters?.map((chapter, idx) => (
                        <Accordion.Item
                          eventKey={idx.toString()}
                          key={chapter.chapterID}
                        >
                          <Accordion.Header>
                            {chapter.chapterName}
                          </Accordion.Header>
                          <Accordion.Body className="p-0">
                            {chapter.videos?.map((video) => (
                              <div
                                key={video.videoID}
                                className={`p-2 video-item ${
                                  selectedVideo?.videoID === video.videoID
                                    ? "bg-light"
                                    : ""
                                }`}
                                onClick={() => setSelectedVideo(video)}
                              >
                                🎥 {video.videoName}{" "}
                                {video.isPreview ? (
                                  <Badge bg="info" className="ms-2">
                                    Preview
                                  </Badge>
                                ) : (
                                  <Badge bg="warning" text="dark" className="ms-2">
                                    Premium
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </Card.Body>
                  {!hasMembership && (
                    <Card.Footer className="text-center">
                      <Button
                        variant="primary"
                        className="w-100"
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
          </Tab>

          {/* ---- Tab QUIZ ---- */}
          <Tab eventKey="quiz" title="🧠 Quiz">
            {!hasMembership ? (
              <div className="text-center py-5">
                <Alert variant="warning" className="d-inline-block">
                  ❗ Bạn cần đăng ký gói thành viên để truy cập quiz.
                </Alert>
                <div className="mt-3">
                  <Button variant="primary" onClick={() => navigate("/membership")}>
                    Xem các gói thành viên
                  </Button>
                </div>
              </div>
            ) : loadingQuizzes ? (
              <div className="text-center py-5">
                <Spinner animation="border" /> <p>Đang tải quiz...</p>
              </div>
            ) : quizError ? (
              <Alert variant="danger" className="m-3">{quizError}</Alert>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-file-earmark"></i>
                <p>Chưa có quiz nào cho khóa học này</p>
              </div>
            ) : (
              <Row>
                {quizzes.map((quiz) => (
                  <Col md={6} lg={4} key={quiz.quizID} className="mb-3">
                    <Card className="quiz-card">
                      <Card.Body>
                        <h6>{quiz.title}</h6>
                        <Button
                          variant="success"
                          onClick={() => navigate(`/quiz/start/${quiz.quizID}`)}
                        >
                          Bắt đầu Quiz
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          {/* ---- Tab FLASHCARD ---- */}
          <Tab eventKey="flashcard" title="📚 Flashcard">
            {!hasMembership ? (
              <div className="text-center py-5">
                <Alert variant="warning" className="d-inline-block">
                  ❗ Bạn cần đăng ký gói thành viên để truy cập flashcard.
                </Alert>
                <div className="mt-3">
                  <Button variant="primary" onClick={() => navigate("/membership")}>
                    Xem các gói thành viên
                  </Button>
                </div>
              </div>
            ) : loadingFlashcards ? (
              <div className="text-center py-5">
                <Spinner animation="border" /> <p>Đang tải flashcards...</p>
              </div>
            ) : flashcardError ? (
              <Alert variant="danger" className="m-3">{flashcardError}</Alert>
            ) : flashcardSets.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-collection"></i>
                <p>Chưa có bộ flashcard nào cho khóa học này</p>
              </div>
            ) : (
              <Row>
                {flashcardSets.map((set) => (
                  <Col md={6} lg={4} key={set.setID} className="mb-3">
                    <Card className="flashcard-card h-100 shadow-sm">
                      <Card.Body>
                        <h6 className="fw-bold">{set.title}</h6>
                        <p className="text-muted small">{set.description}</p>
                        <Button
                          variant="primary"
                          onClick={() => handleViewFlashcards(set.setID, set.title)}
                        >
                          Học Flashcard
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default CourseDetail;
