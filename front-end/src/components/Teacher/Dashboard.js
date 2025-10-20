import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Badge, Nav, Modal, Form, Table, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getCourses, getCourseById } from "../../middleware/courseAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "./dashboard.scss"; // Assuming you have this SCSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, 
    faBookOpen, faUsers, faFileAlt, faLayerGroup, 
    faBolt, faStar, faClipboardList, faQuestionCircle, 
    faCommentAlt, faTrashAlt, faPlayCircle, faEye, faPlus, 
    faVideo, faEdit} from '@fortawesome/free-solid-svg-icons';


const Dashboard = () => {
    const [teacher, setTeacher] = useState(null);
    const [courses, setCourses] = useState([]);
    const [allLessons, setAllLessons] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCourse, setNewCourse] = useState({
        title: "",
        level: "",
        description: "",
    });
    const [activeTab, setActiveTab] = useState("courses");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // --- Demo Data for new tabs ---
    const flashcardsData = [
        {
            id: 1,
            course: "IELTS Nền Tảng",
            question: 'How do you say "Xin chào" in English?',
            answer: "Hello",
            tags: ["greeting", "basic"],
            lastEdited: "2024-01-16"
        },
        {
            id: 2,
            course: "IELTS Nền Tảng",
            question: 'What is the past tense of "go"?',
            answer: "Went",
            tags: ["grammar", "verbs"],
            lastEdited: "2024-01-18"
        },
        {
            id: 3,
            course: "IELTS Cơ Bản",
            question: 'Define "Ubiquitous"',
            answer: "Present, appearing, or found everywhere.",
            tags: ["vocabulary", "advanced"],
            lastEdited: "2024-01-20"
        }
    ];

    const quizzesData = [
        {
            id: 1,
            title: "Basic Grammar Quiz",
            course: "IELTS Nền Tảng",
            questions: 15,
            duration: "20 phút",
            passingScore: "70%",
            status: "published",
            created: "2024-01-10"
        },
        {
            id: 2,
            title: "Vocabulary Test Unit 1",
            course: "IELTS Cơ Bản",
            questions: 20,
            duration: "25 phút",
            passingScore: "65%",
            status: "draft",
            created: "2024-01-15"
        }
    ];

    const reviewsData = [
        {
            id: 1,
            student: "Nguyễn Văn A",
            course: "IELTS Nền Tảng",
            comment: "Khóa học rất hay và dễ hiểu! Giảng viên nhiệt tình.",
            date: "2024-12-20",
            rating: 5
        },
        {
            id: 2,
            student: "Trần Thị B",
            course: "IELTS Cơ Bản",
            comment: "Nội dung tốt, cần thêm bài tập thực hành nghe nói.",
            date: "2024-12-22",
            rating: 4
        },
        {
            id: 3,
            student: "Lê Cảnh C",
            course: "IELTS Nền Tảng",
            comment: "Mình đã cải thiện đáng kể sau khóa học này!",
            date: "2025-01-05",
            rating: 5
        }
    ];
    // --- END Demo Data ---

    useEffect(() => {
        const loadTeacherData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const teacherInfo = JSON.parse(localStorage.getItem("teacherInfo") || "{}");
                
                const teacherData = {
                    id: teacherInfo.id || 1,
                    name: teacherInfo.name || "Demo Teacher",
                    email: teacherInfo.email || "teacher@example.com",
                };

                setTeacher(teacherData);

                const response = await getCourses();
                const coursesData = response.courses || [];
                setCourses(coursesData);

                await loadAllLessons(coursesData);

            } catch (err) {
                console.error("Error loading teacher data:", err);
                setError("Không thể tải dữ liệu. Đang sử dụng dữ liệu demo.");
                
                // Fallback to demo data for courses if API fails
                setTeacher({
                    id: 1,
                    name: "Demo Teacher",
                    email: "teacher@example.com"
                });
                
                setCourses([
                    {
                        courseID: 1,
                        courseName: "IELTS Nền Tảng",
                        description: "Khóa học giúp xây dựng nền tảng vững chắc cho IELTS.",
                        courseLevel: 1,
                        status: "published",
                        chapters: [
                            { chapterID: 101, chapterName: "Introduction", videos: [{ videoID: 1001, videoName: "Welcome", videoURL: "https://www.youtube.com/embed/example1", isPreview: true }] },
                            { chapterID: 102, chapterName: "Basic Grammar", videos: [{ videoID: 1002, videoName: "Tenses", videoURL: "https://www.youtube.com/embed/example2", isPreview: false }] }
                        ],
                        students: 150
                    },
                    {
                        courseID: 2,
                        courseName: "IELTS Cơ Bản",
                        description: "Khóa học củng cố kiến thức và kỹ năng cơ bản để đạt band 5.0-6.0.",
                        courseLevel: 2,
                        status: "draft",
                        chapters: [
                            { chapterID: 201, chapterName: "Listening Skills", videos: [{ videoID: 2001, videoName: "Types of Listening Tasks", videoURL: "https://www.youtube.com/embed/example3", isPreview: true }] }
                        ],
                        students: 80
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        loadTeacherData();
    }, []);

    const loadAllLessons = async (coursesData) => {
        try {
            const lessonsPromises = coursesData.map(course => getCourseById(course.courseID));
            const coursesDetails = await Promise.all(lessonsPromises);
            
            const lessons = [];
            coursesDetails.forEach(courseDetail => {
                if (courseDetail.chapters) {
                    courseDetail.chapters.forEach(chapter => {
                        if (chapter.videos) {
                            chapter.videos.forEach(video => {
                                lessons.push({
                                    id: video.videoID,
                                    title: video.videoName,
                                    course: courseDetail.courseName,
                                    courseId: courseDetail.courseID,
                                    chapter: chapter.chapterName,
                                    type: video.videoURL ? "Video" : "Chưa có nội dung",
                                    duration: "15 min", 
                                    status: video.isPreview ? "free" : "premium", // Use "free" and "premium" for clarity
                                    createdDate: "2024-01-16", 
                                    videoURL: video.videoURL,
                                    isPreview: video.isPreview
                                });
                            });
                        }
                    });
                }
            });

            setAllLessons(lessons);
        } catch (err) {
            console.error("Error loading lessons:", err);
            setAllLessons([]);
        }
    };

    const stats = {
        totalCourses: courses.length,
        totalLessons: allLessons.length,
        totalStudents: courses.reduce((sum, course) => sum + (course.students || 0), 0),
        publishedCourses: courses.filter(c => c.status === "published").length,
        draftCourses: courses.filter(c => c.status === "draft").length,
        totalChapters: courses.reduce((sum, c) => sum + (c.chapters?.length || 0), 0)
    };

    const handleCreateCourse = () => {
        if (!newCourse.title || !newCourse.level || !newCourse.description) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        const newId = Math.max(...courses.map(c => c.courseID), 0) + 1;
        const newCourseData = {
            courseID: newId,
            courseName: newCourse.title,
            description: newCourse.description,
            courseLevel: parseInt(newCourse.level),
            chapters: [],
            status: "draft",
            students: 0
        };

        setCourses([...courses, newCourseData]);
        setShowModal(false);
        setNewCourse({ title: "", level: "", description: "" });
        
    };

    const handleDeleteCourse = (courseId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
            setCourses(courses.filter(c => c.courseID !== courseId));
 
        }
    };

    const handleViewCourseDetail = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    const handleEditCourse = (courseId) => {
        navigate(`/editcourse/${courseId}`); 
    };
    
    // For lessons tab status
    const getLessonStatusVariant = (status) => {
        return status === "free" ? "success" : "warning";
    };

    const getLevelBadgeColor = (level) => {
        if (level <= 2) return "primary"; 
        if (level <= 4) return "warning"; 
        return "danger"; 
    };

    const getReviewRatingStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} style={{ color: '#ffc107' }} />);
            } else {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} style={{ color: '#e0e0e0' }} />);
            }
        }
        return stars;
    };

    if (isLoading) {
        return (
            <Container fluid className="p-4 dashboard-container">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Đang tải dữ liệu...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4 dashboard-container">
            {/* Header */}
            <Row className="mb-4 d-flex justify-content-between align-items-center">
                <Col>
                    <h2 className="dashboard-title"><FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" /><strong>Dashboard Giảng viên</strong></h2>
                    <p className="welcome-message">Chào mừng trở lại, {teacher?.name || 'Giảng viên'}!</p>
                    {error && <Alert variant="warning" className="mt-2">{error}</Alert>}
                </Col>
                <Col className="text-end header-buttons">
                    <Button variant="outline-primary" className="me-2" onClick={() => navigate("/guide")}>
                        <FontAwesomeIcon icon={faQuestionCircle} className="me-1" /> Hướng dẫn
                    </Button>
                    <Button variant="primary" onClick={() => navigate("/")}>
                        <FontAwesomeIcon icon={faBookOpen} className="me-1" /> Trang chủ học viên
                    </Button>
                </Col>
            </Row>

            {/* Stats */}
            <Row className="mb-4 stats-row-dashboard">
                <Col md={3} className="mb-3">
                    <Card className="stat-card-dashboard">
                        <Card.Body className="d-flex align-items-center">
                            <div className="stat-icon-wrapper me-3" style={{backgroundColor: '#eef2ff'}}>
                                <FontAwesomeIcon icon={faLayerGroup} size="2x" style={{color: '#667eea'}} />
                            </div>
                            <div>
                                <div className="stat-title-dashboard">Khóa học</div>
                                <div className="stat-value-dashboard">{stats.totalCourses}</div>
                                <small className="text-muted">
                                    <Badge bg="success" className="me-1">{stats.publishedCourses}</Badge>Đã xuất bản, <Badge bg="secondary" className="me-1">{stats.draftCourses}</Badge>Bản nháp
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="stat-card-dashboard">
                        <Card.Body className="d-flex align-items-center">
                            <div className="stat-icon-wrapper me-3" style={{backgroundColor: '#fef3e7'}}>
                                <FontAwesomeIcon icon={faBookOpen} size="2x" style={{color: '#ff9800'}} />
                            </div>
                            <div>
                                <div className="stat-title-dashboard">Bài học</div>
                                <div className="stat-value-dashboard">{stats.totalLessons}</div>
                                <small className="text-muted">Tổng số bài học/video</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="stat-card-dashboard">
                        <Card.Body className="d-flex align-items-center">
                            <div className="stat-icon-wrapper me-3" style={{backgroundColor: '#e6ffed'}}>
                                <FontAwesomeIcon icon={faUsers} size="2x" style={{color: '#4caf50'}} />
                            </div>
                            <div>
                                <div className="stat-title-dashboard">Học viên</div>
                                <div className="stat-value-dashboard">{stats.totalStudents}</div>
                                <small className="text-muted">Trên tất cả khóa học</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="stat-card-dashboard">
                        <Card.Body className="d-flex align-items-center">
                            <div className="stat-icon-wrapper me-3" style={{backgroundColor: '#e0f7fa'}}>
                                <FontAwesomeIcon icon={faFileAlt} size="2x" style={{color: '#00bcd4'}} />
                            </div>
                            <div>
                                <div className="stat-title-dashboard">Chương</div>
                                <div className="stat-value-dashboard">{stats.totalChapters}</div>
                                <small className="text-muted">Tổng số chương</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Tabs */}
            <Row className="mb-3 tab-navigation-row">
                <Col>
                    <Nav
                        className="nav-tabs-dashboard"
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                    >
                        <Nav.Item><Nav.Link eventKey="courses"><FontAwesomeIcon icon={faLayerGroup} className="me-2" />Khóa học</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="lessons"><FontAwesomeIcon icon={faBookOpen} className="me-2" />Bài học</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="flashcards"><FontAwesomeIcon icon={faBolt} className="me-2" />Flashcards</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="quiz"><FontAwesomeIcon icon={faClipboardList} className="me-2" />Quizzes</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="reviews"><FontAwesomeIcon icon={faCommentAlt} className="me-2" />Đánh giá</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="docs"><FontAwesomeIcon icon={faFileAlt} className="me-2" />Tài liệu</Nav.Link></Nav.Item>
                    </Nav>
                </Col>
            </Row>

            {/* Tab Content - Courses */}
            {activeTab === "courses" && (
                <div className="tab-content-wrapper">
                    <Row className="mb-3 align-items-center">
                        <Col>
                            <h5 className="section-title">Khóa học của tôi ({courses.length})</h5>
                        </Col>
                        <Col className="text-end">
                            <Button variant="primary" onClick={() => setShowModal(true)}>
                                <FontAwesomeIcon icon={faLayerGroup} className="me-2" /> Tạo khóa học mới
                            </Button>
                        </Col>
                    </Row>

                    {courses.length === 0 ? (
                        <Alert variant="info" className="empty-state-alert">
                            <Alert.Heading>Chưa có khóa học nào</Alert.Heading>
                            <p>Bắt đầu bằng cách tạo khóa học đầu tiên của bạn để chia sẻ kiến thức với học viên.</p>
                            <Button variant="primary" onClick={() => setShowModal(true)}>
                                <FontAwesomeIcon icon={faLayerGroup} className="me-2" /> Tạo khóa học
                            </Button>
                        </Alert>
                    ) : (
                        <Row>
                            {courses.map((course) => (
                                <Col md={6} lg={4} key={course.courseID} className="mb-4">
                                    <Card className="course-card-dashboard h-100">
                                        <Card.Body className="d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <Badge bg={course.status === "published" ? "success" : "secondary"}>
                                                    {course.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                                                </Badge>
                                                <div className="card-actions">
                                                    <Button 
                                                        variant="link" 
                                                        size="sm" 
                                                        className="action-btn"
                                                        onClick={() => handleEditCourse(course.courseID)}
                                                        title="Chỉnh sửa khóa học"
                                                    >
                                                        <FontAwesomeIcon icon={faChalkboardTeacher} />
                                                    </Button>
                                                    <Button 
                                                        variant="link" 
                                                        size="sm"
                                                        className="action-btn text-danger"
                                                        onClick={() => handleDeleteCourse(course.courseID)}
                                                        title="Xóa khóa học"
                                                    >
                                                        <FontAwesomeIcon icon={faTrashAlt} /> 
                                                    </Button>
                                                </div>
                                            </div>

                                            <h6 className="card-title-dashboard">{course.courseName}</h6>
                                            <p className="card-text-dashboard text-muted flex-grow-1">{course.description}</p>

                                            <div className="course-stats-dashboard mt-auto pt-2 border-top">
                                                <div className="d-flex justify-content-between text-muted mb-2">
                                                    <span><FontAwesomeIcon icon={faLayerGroup} className="me-1" /> {course.chapters?.length || 0} chương</span>
                                                    <span><FontAwesomeIcon icon={faPlayCircle} className="me-1" /> {course.chapters?.reduce((sum, ch) => sum + (ch.videos?.length || 0), 0) || 0} videos</span> {/* Assuming faPlayCircle is imported */}
                                                </div>
                                                <div className="d-flex justify-content-between text-muted">
                                                    <span><FontAwesomeIcon icon={faUsers} className="me-1" /> {course.students || 0} học viên</span>
                                                    <Badge bg={getLevelBadgeColor(course.courseLevel)}>
                                                        Level {course.courseLevel}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="card-footer-dashboard mt-3">
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    className="w-100"
                                                    onClick={() => handleViewCourseDetail(course.courseID)}
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="me-1" /> Xem chi tiết
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            )}

            {/* Tab Content - Lessons */}
            {activeTab === "lessons" && (
                <div className="tab-content-wrapper">
                    <Row className="mb-3 align-items-center">
                        <Col>
                            <h5 className="section-title">Bài học ({allLessons.length})</h5>
                        </Col>
                        <Col className="text-end">
                            <Button variant="primary" onClick={() => navigate("/createlesson")}>
                                <FontAwesomeIcon icon={faPlus} className="me-2" /> Tạo bài học
                            </Button>
                        </Col>
                    </Row>

                    {allLessons.length === 0 ? (
                        <Alert variant="info" className="empty-state-alert">
                            <Alert.Heading>Chưa có bài học nào</Alert.Heading>
                            <p>Bài học sẽ được tự động hiển thị khi bạn thêm videos vào các khóa học.</p>
                            <Button variant="primary" onClick={() => navigate("/teacher/create-lesson")}>
                                <FontAwesomeIcon icon={faPlus} className="me-2" /> Tạo bài học
                            </Button>
                        </Alert>
                    ) : (
                        <div className="table-responsive custom-table-container">
                            <Table responsive hover className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Tiêu đề</th>
                                        <th>Khóa học</th>
                                        <th>Chương</th>
                                        <th>Loại</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allLessons.map((lesson) => (
                                        <tr key={lesson.id}>
                                            <td>
                                                <strong>{lesson.title}</strong>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="p-0 text-primary course-link-btn"
                                                    onClick={() => handleViewCourseDetail(lesson.courseId)}
                                                >
                                                    {lesson.course}
                                                </Button>
                                            </td>
                                            <td className="text-muted">{lesson.chapter}</td>
                                            <td>
                                                {lesson.videoURL ? (
                                                    <Badge bg="info"><FontAwesomeIcon icon={faVideo} className="me-1" /> Video</Badge>
                                                ) : (
                                                    <Badge bg="secondary"><FontAwesomeIcon icon={faFileAlt} className="me-1" /> Nội dung</Badge>
                                                )}
                                            </td>
                                            <td>
                                                <Badge bg={getLessonStatusVariant(lesson.status)}>
                                                    {lesson.status === "free" ? "Miễn phí" : "Premium"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    className="me-2 action-icon-btn"
                                                    onClick={() => navigate(`/teacher/edit-lesson/${lesson.id}`)}
                                                    title="Chỉnh sửa bài học"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Button>
                                                {lesson.videoURL && (
                                                    <Button 
                                                        variant="outline-info" 
                                                        size="sm"
                                                        className="action-icon-btn"
                                                        onClick={() => window.open(lesson.videoURL, '_blank')}
                                                        title="Xem video"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </div>
            )}

            {/* Tab Content - Flashcards */}
            {activeTab === "flashcards" && (
                <div className="tab-content-wrapper">
                    <Row className="mb-3 align-items-center">
                        <Col>
                            <h5 className="section-title">Flashcards ({flashcardsData.length})</h5>
                        </Col>
                        <Col className="text-end">
                            <Button variant="primary" onClick={() => navigate("/create-flashcard")}>
                                <FontAwesomeIcon icon={faPlus} className="me-2" /> Tạo Flashcard
                            </Button>
                        </Col>
                    </Row>

                    {flashcardsData.length === 0 ? (
                        <Alert variant="info" className="empty-state-alert">
                            <Alert.Heading>Chưa có Flashcard nào</Alert.Heading>
                            <p>Tạo các bộ Flashcard để giúp học viên luyện tập từ vựng và ngữ pháp.</p>
                            <Button variant="primary" onClick={() => navigate("/create-flashcard")}>
                                <FontAwesomeIcon icon={faPlus} className="me-2" /> Tạo Flashcard
                            </Button>
                        </Alert>
                    ) : (
                        <Row>
                            {flashcardsData.map((card) => (
                                <Col md={6} lg={4} key={card.id} className="mb-4">
                                    <Card className="flashcard-card h-100">
                                        <Card.Body className="d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <Badge bg="primary">{card.course}</Badge>
                                                <div className="card-actions">
                                                    <Button variant="link" size="sm" className="action-btn" title="Chỉnh sửa" onClick={() => navigate(`/edit-flashcard/${card.id}`)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Button>
                                                    <Button variant="link" size="sm" className="action-btn text-danger" title="Xóa">
                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="flashcard-question-text flex-grow-1">
                                                <strong>Q:</strong> {card.question}
                                            </p>
                                            <p className="flashcard-answer-text flex-grow-1">
                                                <strong>A:</strong> {card.answer}
                                            </p>
                                            <div className="flashcard-meta mt-auto pt-2 border-top text-muted">
                                                <small>Tags: {card.tags.map(tag => <Badge key={tag} bg="light" text="secondary" className="me-1">{tag}</Badge>)}</small><br/>
                                                <small>Cập nhật: {card.lastEdited}</small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            )}

            {/* Tab Content - Quizzes */}
            {activeTab === "quiz" && (
                <div className="tab-content-wrapper">
                    <Row className="mb-3 align-items-center">
                        <Col>
                            <h5 className="section-title">Quizzes ({quizzesData.length})</h5>
                        </Col>
                        <Col className="text-end">
                            <Button variant="primary" onClick={() => alert("Chức năng tạo Quiz đang phát triển!")}>
                                <FontAwesomeIcon icon={faPlus} className="me-2" onClick={() => navigate("/create-quiz")}/> Tạo Quiz
                            </Button>
                        </Col>
                    </Row>

                    {quizzesData.length === 0 ? (
                        <Alert variant="info" className="empty-state-alert">
                            <Alert.Heading>Chưa có Quiz nào</Alert.Heading>
                            <p>Tạo các bài kiểm tra ngắn để đánh giá kiến thức và kỹ năng của học viên.</p>
                            <Button variant="primary" onClick={() => navigate("/create-quiz")}>
                                <FontAwesomeIcon icon={faPlus} className="me-2"/> Tạo Quiz
                            </Button>
                        </Alert>
                    ) : (
                        <div className="table-responsive custom-table-container">
                            <Table responsive hover className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Tiêu đề</th>
                                        <th>Khóa học</th>
                                        <th>Số câu hỏi</th>
                                        <th>Thời gian</th>
                                        <th>Điểm đậu</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quizzesData.map((quiz) => (
                                        <tr key={quiz.id}>
                                            <td>
                                                <strong>{quiz.title}</strong>
                                            </td>
                                            <td><Badge bg="primary">{quiz.course}</Badge></td>
                                            <td>{quiz.questions}</td>
                                            <td>{quiz.duration}</td>
                                            <td>{quiz.passingScore}</td>
                                            <td>
                                                <Badge bg={quiz.status === "published" ? "success" : "secondary"}>
                                                    {quiz.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button variant="outline-primary" size="sm" className="me-2 action-icon-btn" title="Chỉnh sửa" onClick={() => navigate("/edit-quiz/:id")}>
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Button>
                                                <Button variant="outline-danger" size="sm" className="action-icon-btn" title="Xóa">
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </div>
            )}

            {/* Tab Content - Reviews */}
            {activeTab === "reviews" && (
                <div className="tab-content-wrapper">
                    <Row className="mb-3">
                        <Col>
                            <h5 className="section-title">Đánh giá từ học viên ({reviewsData.length})</h5>
                        </Col>
                    </Row>

                    {reviewsData.length === 0 ? (
                        <Alert variant="info" className="empty-state-alert">
                            <Alert.Heading>Chưa có đánh giá nào</Alert.Heading>
                            <p>Học viên của bạn sẽ để lại đánh giá về khóa học tại đây.</p>
                        </Alert>
                    ) : (
                        <Row>
                            {reviewsData.map((review) => (
                                <Col md={6} lg={4} key={review.id} className="mb-4">
                                    <Card className="review-card-dashboard h-100">
                                        <Card.Body className="d-flex flex-column">
                                            <div className="review-header-dashboard mb-3">
                                                <div className="reviewer-info">
                                                    <h6 className="mb-1">{review.student}</h6>
                                                    <Badge bg="info">{review.course}</Badge>
                                                </div>
                                                <div className="review-rating-stars mt-2">
                                                    {getReviewRatingStars(review.rating)}
                                                </div>
                                            </div>
                                            <p className="review-comment-text flex-grow-1">
                                                "{review.comment}"
                                            </p>
                                            <div className="review-date-dashboard text-muted mt-auto pt-2 border-top">
                                                <small>{review.date}</small>
                                            </div>
                                            {/* Optionally add action buttons for reviews */}
                                            {/* <div className="card-actions mt-2">
                                                <Button variant="link" size="sm" title="Trả lời">
                                                    <FontAwesomeIcon icon={faReply} />
                                                </Button>
                                                <Button variant="link" size="sm" className="text-danger" title="Xóa">
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </Button>
                                            </div> */}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            )}


            {/* Tab Content - Docs */}
            {activeTab === "docs" && (
                <div className="tab-content-wrapper">
                    <Row className="mb-4">
                        <Col>
                            <h5 className="section-title">Tài liệu học tập</h5>
                            <p className="text-muted">
                                Quản lý tài liệu từ bài học. Tài liệu học tập được quản lý trực tiếp trong từng bài học.
                            </p>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col>
                            <Card className="doc-info-card-dashboard p-4">
                                <h6>Khi tạo hoặc chỉnh sửa bài học, bạn có thể thêm tài liệu PDF, Word, PowerPoint và các file khác.</h6>
                                <Button variant="primary" className="mt-3" onClick={() => navigate("/teacher/create-lesson")}>
                                    <FontAwesomeIcon icon={faPlus} className="me-2" /> Tạo bài học có tài liệu
                                </Button>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="spec-card-dashboard text-center h-100">
                                <Card.Body>
                                    <div className="spec-icon-dashboard">📄</div>
                                    <h6>PDF Documents</h6>
                                    <p className="text-muted mb-0">Không giới hạn</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="spec-card-dashboard text-center h-100">
                                <Card.Body>
                                    <div className="spec-icon-dashboard">📝</div>
                                    <h6>Word/PPT</h6>
                                    <p className="text-muted mb-0">Không giới hạn</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="spec-card-dashboard text-center h-100">
                                <Card.Body>
                                    <div className="spec-icon-dashboard">💾</div>
                                    <h6>Dung lượng/file</h6>
                                    <p className="text-muted mb-0">50 MB</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}
            
            {/* Create Course Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tạo khóa học mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="newCourseTitle">
                            <Form.Label>Tên khóa học</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ví dụ: IELTS Nâng Cao"
                                value={newCourse.title}
                                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="newCourseLevel">
                            <Form.Label>Cấp độ (Level)</Form.Label>
                            <Form.Select
                                value={newCourse.level}
                                onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                                required
                            >
                                <option value="">Chọn cấp độ</option>
                                <option value="1">Level 1 - Nền tảng</option>
                                <option value="2">Level 2 - Cơ bản</option>
                                <option value="3">Level 3 - Trung cấp</option>
                                <option value="4">Level 4 - Chuyên sâu</option>
                                <option value="5">Level 5 - Nâng cao</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="newCourseDescription">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Mô tả về khóa học"
                                value={newCourse.description}
                                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="primary" onClick={handleCreateCourse}>Tạo khóa học</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Dashboard;