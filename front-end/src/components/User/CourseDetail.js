import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Accordion, Alert, Tabs, Tab, Spinner, Card, Badge } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, getVideoById } from "../../middleware/courseAPI";
import { getQuizzesByCourse } from "../../middleware/QuizAPI";
import { checkMembership } from "../../middleware/membershipAPI";
import { getFlashcardSetsByCourseId } from "../../middleware/flashcardAPI";
import { FaPlayCircle, FaBook, FaQuestionCircle, FaLock, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import "./CourseDetail.scss";

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

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [membershipData, courseData] = await Promise.all([
                    checkMembership(),
                    getCourseById(id)
                ]);

                setHasMembership(membershipData.hasMembership || false);
                setCourse(courseData);

                // Auto-select the first watchable video
                if (courseData.chapters?.length > 0) {
                    for (const chapter of courseData.chapters) {
                        if (chapter.videos?.length > 0) {
                            const firstVideo = chapter.videos[0];
                            if (firstVideo.isPreview || membershipData.hasMembership) {
                                handleVideoSelect(firstVideo.videoID, firstVideo.videoName);
                                return; // Exit after finding the first video
                            }
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

    const handleVideoSelect = async (videoId, videoName) => {
        setLoadingVideo(true);
        setVideoError(null);
        try {
            const videoData = await getVideoById(videoId);
            if (videoData.canWatch) {
                setSelectedVideo({
                    videoID: videoId,
                    videoName: videoName,
                    videoURL: videoData.videoURL,
                    canWatch: videoData.canWatch,
                });
            } else {
                setVideoError("Bạn cần đăng ký gói thành viên để xem video này.");
                setSelectedVideo(null);
            }
        } catch (err) {
            setVideoError("Không thể tải video. Vui lòng thử lại.");
            setSelectedVideo(null);
        } finally {
            setLoadingVideo(false);
        }
    };

    const handleLoadQuizzes = async () => {
        if (quizzes.length > 0) return;
        setLoadingQuizzes(true);
        setQuizError(null);
        try {
            const response = await getQuizzesByCourse(id);
            const data = response.data || response; // Handle both {data: []} and []
            setQuizzes(Array.isArray(data) ? data : []);
        } catch (err) {
            setQuizError("Không thể tải danh sách quiz.");
        } finally {
            setLoadingQuizzes(false);
        }
    };

    const handleLoadFlashcards = async () => {
        if (flashcardSets.length > 0) return;
        setLoadingFlashcards(true);
        setFlashcardError(null);
        try {
            const response = await getFlashcardSetsByCourseId(id);
            const data = response.data || response; // Handle both {data: []} and []
            setFlashcardSets(Array.isArray(data) ? data : []);
        } catch (err) {
            setFlashcardError("Không thể tải danh sách flashcard.");
        } finally {
            setLoadingFlashcards(false);
        }
    };

    useEffect(() => {
        if (activeTab === "quiz") {
            handleLoadQuizzes();
        } else if (activeTab === "flashcard") {
            handleLoadFlashcards();
        }
    }, [activeTab]);

    const getVideoEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes("drive.google.com")) {
            const fileId = new URL(url).searchParams.get('id');
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
        return url;
    };

    if (isLoading) {
        return (
            <div className="page-loading-container">
                <Spinner animation="border" variant="primary" />
                <p>Đang tải khóa học...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <Container className="py-5 text-center">
                <Alert variant="warning">Không tìm thấy khóa học.</Alert>
                <Button onClick={() => navigate("/home")}>Quay về trang chủ</Button>
            </Container>
        );
    }

    const totalVideos = course.chapters?.reduce((sum, ch) => sum + (ch.videos?.length || 0), 0) || 0;

    return (
        <div className="course-detail-page">
            <Container fluid="xl">
                <Row>
                    {/* Main Content */}
                    <button onClick={() => navigate("/home")} className="back-button">
                              <FaArrowLeft />
                              <span>Quay lại</span>
                            </button>
                    <Col lg={8} className="main-content-col">
                    
                        <div className="video-player-wrapper">
                            {loadingVideo ? (
                                <div className="player-placeholder">
                                    <Spinner animation="border" variant="light" />
                                    <p>Đang tải video...</p>
                                </div>
                            ) : videoError ? (
                                <div className="player-placeholder error">
                                    <FaLock size={40} />
                                    <p>{videoError}</p>
                                    {!hasMembership && <Button variant="primary" onClick={() => navigate('/membership')}>Nâng cấp tài khoản</Button>}
                                </div>
                            ) : selectedVideo ? (
                                <div className="video-container">
                                    <iframe
                                        src={getVideoEmbedUrl(selectedVideo.videoURL)}
                                        title={selectedVideo.videoName}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="player-placeholder">
                                    <FaPlayCircle size={50} />
                                    <p>Chọn một bài học để bắt đầu</p>
                                </div>
                            )}
                        </div>

                        <div className="course-content-tabs">
                            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="course-tabs">
                                <Tab eventKey="video" title="Tổng quan">
                                    <div className="tab-pane-content">
                                        <h2>{course.courseName}</h2>
                                        <p className="course-description">{course.description}</p>
                                    </div>
                                </Tab>
                                <Tab eventKey="quiz" title={<><FaQuestionCircle /> Luyện tập</>}>
                                    <div className="tab-pane-content">
                                        {loadingQuizzes ? <Spinner animation="border" size="sm" /> :
                                            quizError ? <Alert variant="danger">{quizError}</Alert> :
                                                quizzes.length > 0 ? (
                                                    <div className="resource-list">
                                                        {quizzes.map(quiz => (
                                                            <div key={quiz.quizID} className="resource-item" onClick={() => navigate(`/quiz/start/${quiz.quizID}`)}>
                                                                <FaQuestionCircle className="resource-icon" />
                                                                <div className="resource-info">
                                                                    <strong>{quiz.title}</strong>
                                                                    <span>{quiz.description}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p>Không có bài luyện tập nào cho khóa học này.</p>
                                        }
                                    </div>
                                </Tab>
                                <Tab eventKey="flashcard" title={<><FaBook /> Flashcard</>}>
                                    <div className="tab-pane-content">
                                        {loadingFlashcards ? <Spinner animation="border" size="sm" /> :
                                            flashcardError ? <Alert variant="danger">{flashcardError}</Alert> :
                                                flashcardSets.length > 0 ? (
                                                    <div className="resource-list">
                                                        {flashcardSets.map(set => (
                                                            <div key={set.setID} className="resource-item" onClick={() => navigate(`/flashcard/${set.setID}`)}>
                                                                <FaBook className="resource-icon" />
                                                                <div className="resource-info">
                                                                    <strong>{set.title}</strong>
                                                                    <span>{set.description}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p>Không có bộ flashcard nào cho khóa học này.</p>
                                        }
                                    </div>
                                </Tab>
                            </Tabs>
                        </div>
                    </Col>

                    {/* Sidebar */}
                    <Col lg={4} className="sidebar-col">
                        <div className="course-playlist-card">
                            <Card.Header>
                                <h5>Nội dung khóa học</h5>
                                <span>{totalVideos} bài giảng</span>
                            </Card.Header>
                            <Accordion alwaysOpen defaultActiveKey={course.chapters?.[0]?.chapterID.toString()}>
                                {course.chapters?.map((chapter, index) => (
                                    <Accordion.Item eventKey={chapter.chapterID.toString()} key={chapter.chapterID}>
                                        <Accordion.Header>
                                            <div className="chapter-header">
                                                <span>Chương {index + 1}</span>
                                                <strong>{chapter.chapterName}</strong>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <ul className="video-list">
                                                {chapter.videos?.map(video => {
                                                    const canWatch = video.isPreview || hasMembership;
                                                    const isPlaying = selectedVideo?.videoID === video.videoID;
                                                    return (
                                                        <li
                                                            key={video.videoID}
                                                            className={`${canWatch ? 'watchable' : 'locked'} ${isPlaying ? 'playing' : ''}`}
                                                            onClick={() => canWatch && handleVideoSelect(video.videoID, video.videoName)}
                                                        >
                                                            <div className="video-icon">
                                                                {isPlaying ? <FaPlayCircle className="playing-icon" /> : canWatch ? <FaPlayCircle /> : <FaLock />}
                                                            </div>
                                                            <div className="video-name">{video.videoName}</div>
                                                            {video.isPreview ? (
                                                                <Badge pill bg="info">Xem trước</Badge>
                                                            ) : (
                                                                <Badge pill bg="warning" text="dark">Membership</Badge>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CourseDetail;