import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Accordion, Alert, Tabs, Tab, Spinner, Card, Badge } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, getVideoById, getCourseRating, getCourseFeedbacks } from "../../middleware/courseAPI";
import { getQuizzesByCourse } from "../../middleware/QuizAPI";
import { checkMembership } from "../../middleware/membershipAPI";
import { getFlashcardSetsByCourseId } from "../../middleware/flashcardAPI";
import { updateVideoHistory, getVideoProgress } from '../../redux/videoWatchHelper';
import { FaPlayCircle, FaBook, FaQuestionCircle, FaLock, FaArrowLeft, FaCheckCircle, FaStar } from "react-icons/fa";
import "./CourseDetail.scss";

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const iframeRef = useRef(null);
    const progressIntervalRef = useRef(null);

    const [activeTab, setActiveTab] = useState("video");
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [hasMembership, setHasMembership] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [loadingVideo, setLoadingVideo] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const [quizzes, setQuizzes] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [quizError, setQuizError] = useState(null);

    const [flashcardSets, setFlashcardSets] = useState([]);
    const [loadingFlashcards, setLoadingFlashcards] = useState(false);
    const [flashcardError, setFlashcardError] = useState(null);

    const [courseRating, setCourseRating] = useState(null);
    const [courseFeedbacks, setCourseFeedbacks] = useState([]);
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

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

                try {
                    const rating = await getCourseRating(id);
                    setCourseRating(rating);
                } catch (err) {
                    console.log("Could not load rating:", err);
                }

                if (courseData.chapters?.length > 0) {
                    for (const chapter of courseData.chapters) {
                        if (chapter.videos?.length > 0) {
                            const firstVideo = chapter.videos[0];
                            if (firstVideo.isPreview || membershipData.hasMembership) {
                                handleVideoSelect(
                                    firstVideo.videoID, 
                                    firstVideo.videoName,
                                    chapter.chapterName
                                );
                                return;
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

    const isGoogleDriveUrl = (url) => {
        return url && (url.includes('drive.google.com') || url.includes('drive.usercontent.google.com'));
    };

    const isYouTubeUrl = (url) => {
        return url && (url.includes('youtube.com') || url.includes('youtu.be'));
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        
        let videoId = null;
        
        const watchMatch = url.match(/[?&]v=([^&]+)/);
        if (watchMatch) {
            videoId = watchMatch[1];
        }
        
        const shortMatch = url.match(/youtu\.be\/([^?]+)/);
        if (shortMatch) {
            videoId = shortMatch[1];
        }
        
        const embedMatch = url.match(/\/embed\/([^?]+)/);
        if (embedMatch) {
            videoId = embedMatch[1];
        }
        
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?rel=0`;
        }
        
        return null;
    };

    const getDirectVideoUrl = (url) => {
        if (!url) return null;
        
        if (isYouTubeUrl(url)) {
            const embedUrl = getYouTubeEmbedUrl(url);
            if (embedUrl) {
                return {
                    type: 'iframe',
                    url: embedUrl,
                    platform: 'youtube'
                };
            }
        }
        
        if (isGoogleDriveUrl(url)) {
            let fileId = null;
            
            const ucMatch = url.match(/[?&]id=([^&]+)/);
            if (ucMatch) {
                fileId = ucMatch[1];
            }
            
            const fileMatch = url.match(/\/file\/d\/([^\/]+)/);
            if (fileMatch) {
                fileId = fileMatch[1];
            }
            
            const openMatch = url.match(/open\?id=([^&]+)/);
            if (openMatch) {
                fileId = openMatch[1];
            }
            
            if (fileId) {
                return {
                    type: 'iframe',
                    url: `https://drive.google.com/file/d/${fileId}/preview`,
                    platform: 'gdrive'
                };
            }
        }
        
        return {
            type: 'video',
            url: url,
            platform: 'direct'
        };
    };

    const handleVideoSelect = async (videoId, videoName, chapterName) => {
        // Save progress của video cũ trước khi chuyển
        if (selectedVideo) {
            saveVideoProgress();
            // Dừng tracking interval của video cũ
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        }

        setLoadingVideo(true);
        setVideoError(null);
        
        try {
            const videoData = await getVideoById(videoId);
            if (videoData.canWatch) {
                const videoInfo = getDirectVideoUrl(videoData.videoURL);
                
                const newVideo = {
                    videoID: videoId,
                    videoName: videoName,
                    videoURL: videoInfo.url,
                    videoType: videoInfo.type,
                    platform: videoInfo.platform,
                    canWatch: videoData.canWatch,
                    chapterName: chapterName,
                };
                
                console.log("✅ Selected video info:", newVideo);
                setSelectedVideo(newVideo);
                
                const savedProgress = getVideoProgress(videoId);
                if (savedProgress) {
                    setVideoProgress(savedProgress.progress || 0);
                    setCurrentTime(savedProgress.currentTime || 0);
                    setVideoDuration(savedProgress.duration * 60 || 600); // Convert minutes to seconds
                    console.log(`📺 Tiến độ đã lưu: ${savedProgress.progress}% (${savedProgress.currentTime.toFixed(1)}s)`);
                } else {
                    setVideoProgress(0);
                    setCurrentTime(0);
                    setVideoDuration(600); // Default 10 minutes for iframe
                }
                
                // Bắt đầu tracking cho video mới (cả iframe và video)
                startProgressTracking();
            } else {
                setVideoError("Bạn cần đăng ký gói thành viên để xem video này.");
                setSelectedVideo(null);
            }
        } catch (err) {
            console.error("Error loading video:", err);
            setVideoError("Không thể tải video. Vui lòng thử lại.");
            setSelectedVideo(null);
        } finally {
            setLoadingVideo(false);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const duration = videoRef.current.duration;
            setVideoDuration(duration);
            console.log(`📹 Video duration: ${duration.toFixed(2)}s (${(duration / 60).toFixed(1)}m)`);

            const savedProgress = getVideoProgress(selectedVideo.videoID);
            if (savedProgress && savedProgress.currentTime > 0) {
                videoRef.current.currentTime = savedProgress.currentTime;
                console.log(`⏩ Tiếp tục từ: ${savedProgress.currentTime.toFixed(1)}s`);
            }

            startProgressTracking();
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            
            setCurrentTime(current);
            setVideoDuration(duration);
            
            const progress = duration > 0 ? Math.min(100, Math.round((current / duration) * 100)) : 0;
            setVideoProgress(progress);
        }
    };

    const handleVideoEnded = () => {
        if (videoRef.current && selectedVideo) {
            const duration = videoRef.current.duration;
            
            updateVideoHistory(
                {
                    courseID: parseInt(id),
                    courseName: course?.courseName || "Khóa học",
                    lessonID: selectedVideo.videoID,
                    lessonTitle: selectedVideo.videoName,
                },
                duration,
                duration
            );

            setVideoProgress(100);
            console.log("✅ Video đã hoàn thành!");
        }
    };

    const saveVideoProgress = () => {
        if (!selectedVideo || !course) return;

        let current = 0;
        let duration = 0;

        // Lấy thời gian từ video HTML5
        if (selectedVideo.videoType === 'video' && videoRef.current) {
            current = videoRef.current.currentTime;
            duration = videoRef.current.duration;
        } 
        // Với iframe: ước tính hoặc dùng manual tracking
        else if (selectedVideo.videoType === 'iframe') {
            // Lấy từ state đã track
            current = currentTime;
            duration = videoDuration || 600; // Default 10 phút nếu không biết
            
            console.log(`💾 Iframe video - using state: ${current}s / ${duration}s`);
        }

        if (duration > 0 && current >= 0) {
            updateVideoHistory(
                {
                    courseID: parseInt(id),
                    courseName: course.courseName,
                    lessonID: selectedVideo.videoID,
                    lessonTitle: selectedVideo.videoName,
                },
                current,
                duration
            );

            window.dispatchEvent(new Event('videoHistoryUpdated'));

            console.log(`💾 Đã lưu: ${current.toFixed(1)}s / ${duration.toFixed(1)}s (${Math.round((current/duration)*100)}%)`);
        }
    };

    const startProgressTracking = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        // Chỉ track nếu có video được chọn
        if (!selectedVideo) return;

        console.log(`🔄 Bắt đầu tracking cho: ${selectedVideo.videoName} (${selectedVideo.videoType})`);

        // Track mỗi 10 giây
        progressIntervalRef.current = setInterval(() => {
            if (selectedVideo.videoType === 'iframe') {
                // Với iframe, tự động tăng currentTime (giả sử đang xem)
                setCurrentTime(prev => {
                    const newTime = prev + 10;
                    const progress = videoDuration > 0 ? Math.min(100, Math.round((newTime / videoDuration) * 100)) : 0;
                    setVideoProgress(progress);
                    return newTime;
                });
            }
            saveVideoProgress();
        }, 10000);
    };

    useEffect(() => {
        const handleBeforeUnload = () => {
            saveVideoProgress();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            saveVideoProgress();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [selectedVideo, course, currentTime, videoDuration]);

    const markVideoAsCompleted = () => {
        if (!selectedVideo || !course) return;

        if (selectedVideo.videoType === 'video' && videoRef.current) {
            const duration = videoRef.current.duration;
            
            updateVideoHistory(
                {
                    courseID: parseInt(id),
                    courseName: course.courseName,
                    lessonID: selectedVideo.videoID,
                    lessonTitle: selectedVideo.videoName,
                },
                duration,
                duration
            );

            setVideoProgress(100);
            if (videoRef.current) {
                videoRef.current.currentTime = duration;
            }
        } else {
            const duration = videoDuration || 600;
            
            updateVideoHistory(
                {
                    courseID: parseInt(id),
                    courseName: course.courseName,
                    lessonID: selectedVideo.videoID,
                    lessonTitle: selectedVideo.videoName,
                },
                duration,
                duration
            );

            setVideoProgress(100);
            setCurrentTime(duration);
        }
        
        window.dispatchEvent(new Event('videoHistoryUpdated'));
        
        alert("✅ Đã đánh dấu hoàn thành!");
    };

    const handleLoadQuizzes = async () => {
        if (quizzes.length > 0) return;
        setLoadingQuizzes(true);
        setQuizError(null);
        try {
            const response = await getQuizzesByCourse(id);
            const data = response.data || response;
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
            const data = response.data || response;
            setFlashcardSets(Array.isArray(data) ? data : []);
        } catch (err) {
            setFlashcardError("Không thể tải danh sách flashcard.");
        } finally {
            setLoadingFlashcards(false);
        }
    };

    const handleLoadFeedbacks = async () => {
        if (courseFeedbacks.length > 0) return;
        setLoadingFeedbacks(true);
        try {
            const response = await getCourseFeedbacks(id);
            console.log("📥 Feedback response:", response);
            
            // Response structure: { courseID, totalFeedback, feedbacks: [...] }
            const feedbackList = response?.feedbacks || [];
            
            console.log("✅ Feedback list:", feedbackList);
            setCourseFeedbacks(Array.isArray(feedbackList) ? feedbackList : []);
        } catch (err) {
            console.error("❌ Could not load feedbacks:", err);
            setCourseFeedbacks([]);
        } finally {
            setLoadingFeedbacks(false);
        }
    };

    useEffect(() => {
        if (activeTab === "quiz") {
            handleLoadQuizzes();
        } else if (activeTab === "flashcard") {
            handleLoadFlashcards();
        } else if (activeTab === "feedback") {
            handleLoadFeedbacks();
        }
    }, [activeTab]);

    const handleNavigateToFeedback = () => {
        navigate(`/course/${course.courseID}/feedback`);
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                                <>
                                    <div className="video-container">
                                        {selectedVideo.videoType === 'iframe' ? (
                                            <iframe
                                                ref={iframeRef}
                                                src={selectedVideo.videoURL}
                                                title={selectedVideo.videoName}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                style={{
                                                    width: '100%',
                                                    height: '500px',
                                                    backgroundColor: '#000',
                                                    borderRadius: '8px'
                                                }}
                                            ></iframe>
                                        ) : (
                                            <video
                                                ref={videoRef}
                                                src={selectedVideo.videoURL}
                                                controls
                                                controlsList="nodownload"
                                                onLoadedMetadata={handleLoadedMetadata}
                                                onTimeUpdate={handleTimeUpdate}
                                                onEnded={handleVideoEnded}
                                                onPause={saveVideoProgress}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: '#000',
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                    </div>
                                    
                                    
                                </>
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
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <h2>{course.courseName}</h2>
                                                {courseRating && (
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <FaStar className="text-warning" />
                                                        <span className="fw-bold">{courseRating.averageRating || 0}</span>
                                                        
                                                    </div>
                                                )}
                                            </div>
                                            <Button 
                                                variant="primary" 
                                                size="sm"
                                                onClick={handleNavigateToFeedback}
                                            >
                                                {/* <FaComment className="me-2" /> */}
                                                Đánh giá khóa học
                                            </Button>
                                        </div>
                                        <p className="course-description">{course.description}</p>
                                        
                                        {selectedVideo && (
                                            <div className="current-lesson-info mt-4 p-3 border rounded">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h5 className="mb-1">Đang xem: {selectedVideo.videoName}</h5>
                                                        <p className="text-muted mb-0">
                                                            Chương: {selectedVideo.chapterName || "N/A"}
                                                        </p>
                                                    </div>
                                                    {videoProgress < 100 ? (
                                                        <Button 
                                                            variant="success"
                                                            size="sm"
                                                            onClick={markVideoAsCompleted}
                                                            className="d-flex align-items-center gap-2"
                                                        >
                                                            <FaCheckCircle />
                                                            Đánh dấu hoàn thành
                                                        </Button>
                                                    ) : (
                                                        <Badge bg="success" className="d-flex align-items-center gap-1" style={{ fontSize: '14px', padding: '8px 12px' }}>
                                                            <FaCheckCircle />
                                                            Đã hoàn thành
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p>Không có bộ flashcard nào cho khóa học này.</p>
                                        }
                                    </div>
                                </Tab>
                                <Tab eventKey="feedback" title={<><FaStar /> Đánh giá</>}>
                                    <div className="tab-pane-content">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5>Đánh giá từ học viên</h5>
                                            <Button 
                                                variant="primary" 
                                                size="sm"
                                                onClick={handleNavigateToFeedback}
                                            >
                                                Viết đánh giá
                                            </Button>
                                        </div>
                                        {loadingFeedbacks ? (
                                            <div className="text-center py-4">
                                                <Spinner animation="border" size="sm" />
                                            </div>
                                        ) : courseFeedbacks.length > 0 ? (
                                            <div className="feedback-list">
                                                {courseFeedbacks.map((feedback, index) => (
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
                                                                    {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString('vi-VN') : ''}
                                                                </small>
                                                            </div>
                                                            <p className="mb-0">{feedback.comment}</p>
                                                        </Card.Body>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <Alert variant="info">
                                                Chưa có đánh giá nào cho khóa học này. Hãy là người đầu tiên đánh giá!
                                            </Alert>
                                        )}
                                    </div>
                                </Tab>
                            </Tabs>
                        </div>
                    </Col>

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
                                                <strong>{chapter.chapterName}</strong>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <ul className="video-list">
                                                {chapter.videos?.map(video => {
                                                    const canWatch = video.isPreview || hasMembership;
                                                    const isPlaying = selectedVideo?.videoID === video.videoID;
                                                    
                                                    const savedProgress = getVideoProgress(video.videoID);
                                                    const hasWatched = savedProgress && savedProgress.progress > 0;
                                                    const isCompleted = savedProgress && savedProgress.progress >= 100;
                                                    
                                                    return (
                                                        <li
                                                            key={video.videoID}
                                                            className={`${canWatch ? 'watchable' : 'locked'} ${isPlaying ? 'playing' : ''}`}
                                                            onClick={() => canWatch && handleVideoSelect(video.videoID, video.videoName, chapter.chapterName)}
                                                        >
                                                            <div className="video-icon">
                                                                {isPlaying ? (
                                                                    <FaPlayCircle className="playing-icon" />
                                                                ) : isCompleted ? (
                                                                    <FaCheckCircle style={{ color: '#28a745' }} />
                                                                ) : canWatch ? (
                                                                    <FaPlayCircle />
                                                                ) : (
                                                                    <FaLock />
                                                                )}
                                                            </div>
                                                            <div className="video-name">
                                                                {video.videoName}
                                                                {hasWatched && !isCompleted && (
                                                                    <small className="text-muted d-block">
                                                                        {savedProgress.progress}% đã xem
                                                                    </small>
                                                                )}
                                                            </div>
                                                            <div className="video-badges">
                                                                {video.isPreview ? (
                                                                    <Badge pill bg="info">Xem trước</Badge>
                                                                ) : (
                                                                    <Badge pill bg="warning" text="dark">Membership</Badge>
                                                                )}
                                                                {isCompleted && (
                                                                    <Badge pill bg="success" className="ms-1">
                                                                        <FaCheckCircle size={12} />
                                                                    </Badge>
                                                                )}
                                                            </div>
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