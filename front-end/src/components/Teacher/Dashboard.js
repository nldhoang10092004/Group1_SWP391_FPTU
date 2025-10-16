import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Badge, Nav, Modal, Form, Table, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getCourses, getCourseById } from "../../middleware/courseAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "./dashboard.scss";

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

    // Load courses từ API
    useEffect(() => {
        const loadTeacherData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Lấy thông tin giáo viên từ localStorage hoặc API
                const teacherInfo = JSON.parse(localStorage.getItem("teacherInfo") || "{}");
                
                // Giả lập dữ liệu giáo viên nếu chưa có
                const teacherData = {
                    id: teacherInfo.id || 1,
                    name: teacherInfo.name || "Demo Teacher",
                    email: teacherInfo.email || "teacher@example.com",
                };

                setTeacher(teacherData);

                // Load courses từ API
                const response = await getCourses();
                const coursesData = response.courses || [];

                // Lọc courses của giáo viên hiện tại (giả lập)
                // Trong thực tế, API nên trả về courses theo teacherId
                const teacherCourses = coursesData; 

                setCourses(teacherCourses);

                // Load tất cả lessons từ các courses
                await loadAllLessons(teacherCourses);

            } catch (err) {
                console.error("Error loading teacher data:", err);
                setError("Không thể tải dữ liệu. Sử dụng dữ liệu demo.");
                
                // Fallback to demo data
                setTeacher({
                    id: 1,
                    name: "Demo Teacher",
                    email: "teacher@example.com"
                });
                
                setCourses([
                    {
                        courseID: 1,
                        courseName: "IELTS Nền Tảng",
                        description: "Level 1: Nền tảng",
                        courseLevel: 1,
                        status: "published",
                        chapters: []
                    },
                    {
                        courseID: 2,
                        courseName: "IELTS Cơ Bản",
                        description: "Level 2: Cơ bản",
                        courseLevel: 2,
                        status: "published",
                        chapters: []
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        loadTeacherData();
    }, []);

    // Load tất cả lessons từ các courses
    const loadAllLessons = async (coursesData) => {
        try {
            const lessonsPromises = coursesData.map(course => getCourseById(course.courseID));
            const coursesDetails = await Promise.all(lessonsPromises);
            
            // Flatten tất cả videos từ các chapters
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
                                    duration: "15 min", // Có thể thêm từ API
                                    status: video.isPreview ? "published" : "draft",
                                    createdDate: "2024-01-16", // Có thể thêm từ API
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

    // Tính toán thống kê
    const stats = {
        totalCourses: courses.length,
        totalLessons: allLessons.length,
        totalStudents: courses.reduce((sum, course) => sum + (course.students || 0), 0),
        publishedCourses: courses.filter(c => c.status === "published").length,
        draftCourses: courses.filter(c => c.status === "draft").length
    };

    const handleCreateCourse = () => {
        if (!newCourse.title || !newCourse.level) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        // Trong thực tế, gọi API để tạo course
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
        
        // TODO: Call API to create course
        // createCourse(newCourseData);
    };

    const handleDeleteCourse = (courseId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
            setCourses(courses.filter(c => c.courseID !== courseId));
            // TODO: Call API to delete course
            // deleteCourse(courseId);
        }
    };

    const handleViewCourseDetail = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    const handleEditCourse = (courseId) => {
        navigate(`/editcourse/${courseId}`);
    };

    const getStatusVariant = (status) => {
        return status === "published" ? "success" : "warning";
    };

    const getStatusText = (status) => {
        return status === "published" ? "Đã xuất bản" : "Bản nháp";
    };

    const flashcardsData = [
        {
            id: 1,
            course: "English Foundation",
            question: 'How do you say "Xin chào" in English?',
            answer: "Hello"
        },
        {
            id: 2,
            course: "English Foundation",
            question: 'What is the past tense of "go"?',
            answer: "Went"
        }
    ];

    const quizzesData = [
        {
            id: 1,
            title: "Basic Grammar Quiz",
            course: "English Foundation",
            questions: 15,
            duration: "20 phút",
            passingScore: "70%",
            status: "published"
        }
    ];

    const reviewsData = [
        {
            id: 1,
            student: "Nguyễn Văn A",
            course: "English Foundation",
            comment: "Khóa học rất hay và dễ hiểu!",
            date: "2024-12-20",
            rating: 5
        },
        {
            id: 2,
            student: "Trần Thị B",
            course: "Pre-Intermediate English",
            comment: "Nội dung tốt, cần thêm bài tập.",
            date: "2024-12-22",
            rating: 4
        }
    ];
    const getLevelBadgeColor = (level) => {
        if (level <= 2) return "primary";
        if (level <= 4) return "warning";
        return "danger";
    };

    if (isLoading) {
        return (
            <Container fluid className="p-4">
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
                    <h2><strong>Dashboard Giảng viên</strong></h2>
                    <p>Chào mừng {teacher?.name || 'Teacher'}!</p>
                    {error && <Alert variant="warning" className="mt-2">{error}</Alert>}
                </Col>
                <Col className="text-end">
                    <Button variant="dark" className="me-2" onClick={() => navigate("/guide")}>
                        Hướng dẫn
                    </Button>
                    <Button variant="outline-dark" onClick={() => navigate("/")}>
                        Quay lại trang chủ
                    </Button>
                </Col>
            </Row>

            {/* Stats */}
            <Row className="mb-4">
                <Col md={3}>
                    <div className="stat-box">
                        <div className="stat-left">
                            <div className="stat-title">Khóa học</div>
                            <div className="stat-value">{stats.totalCourses}</div>
                            <small className="text-muted">
                                {stats.publishedCourses} đã xuất bản, {stats.draftCourses} bản nháp
                            </small>
                        </div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="stat-box">
                        <div className="stat-left">
                            <div className="stat-title">Bài học</div>
                            <div className="stat-value">{stats.totalLessons}</div>
                            <small className="text-muted">Tổng số bài học/video</small>
                        </div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="stat-box">
                        <div className="stat-left">
                            <div className="stat-title">Học viên</div>
                            <div className="stat-value">{stats.totalStudents}</div>
                            <small className="text-muted">Trên tất cả khóa học</small>
                        </div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="stat-box">
                        <div className="stat-left">
                            <div className="stat-title">Chapters</div>
                            <div className="stat-value">
                                {courses.reduce((sum, c) => sum + (c.chapters?.length || 0), 0)}
                            </div>
                            <small className="text-muted">Tổng số chương</small>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Tabs */}
            <Row className="mb-3">
                <Col>
                    <Nav
                        className="nav-tabs"
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                    >
                        <Nav.Item><Nav.Link eventKey="courses">Khóa học</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="lessons">Bài học</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="docs">Tài liệu</Nav.Link></Nav.Item>
                    </Nav>
                </Col>
            </Row>

            {/* Tab Content - Courses */}
            {activeTab === "courses" && (
                <>
                    <Row className="mb-3">
                        <Col className="d-flex justify-content-between align-items-center">
                            <h5>Khóa học của tôi ({courses.length})</h5>
                            <Button variant="dark" onClick={() => setShowModal(true)}>
                                + Tạo khóa học mới
                            </Button>
                        </Col>
                    </Row>

                    {courses.length === 0 ? (
                        <Alert variant="info">
                            <Alert.Heading>Chưa có khóa học nào</Alert.Heading>
                            <p>Bắt đầu bằng cách tạo khóa học đầu tiên của bạn!</p>
                            <Button variant="primary" onClick={() => setShowModal(true)}>
                                Tạo khóa học
                            </Button>
                        </Alert>
                    ) : (
                        <Row>
                            {courses.map((course) => (
                                <Col md={4} key={course.courseID} className="mb-3">
                                    <div className="course-card">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Badge bg={course.status === "published" ? "success" : "secondary"}>
                                                {course.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                                            </Badge>
                                            <div>
                                                <Button 
                                                    variant="link" 
                                                    size="sm" 
                                                    className="me-2"
                                                    onClick={() => handleEditCourse(course.courseID)}
                                                    title="Chỉnh sửa"
                                                >
                                                    ✏️
                                                </Button>
                                                <Button 
                                                    variant="link" 
                                                    size="sm"
                                                    onClick={() => handleDeleteCourse(course.courseID)}
                                                    title="Xóa"
                                                >
                                                    🗑️
                                                </Button>
                                            </div>
                                        </div>

                                        <h6 className="card-title">{course.courseName}</h6>
                                        <p className="card-text text-muted">{course.description}</p>

                                        <div className="course-stats mt-3">
                                            <div className="d-flex justify-content-between text-muted mb-2">
                                                <span>📚 {course.chapters?.length || 0} chương</span>
                                                <span>🎥 {course.chapters?.reduce((sum, ch) => sum + (ch.videos?.length || 0), 0) || 0} videos</span>
                                            </div>
                                            <div className="d-flex justify-content-between text-muted">
                                                <span>👥 {course.students || 0} học viên</span>
                                                <Badge bg={getLevelBadgeColor(course.courseLevel)}>
                                                    Level {course.courseLevel}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="card-footer mt-3">
                                            <Button 
                                                variant="outline-dark" 
                                                size="sm" 
                                                className="w-100"
                                                onClick={() => handleViewCourseDetail(course.courseID)}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}

            {/* Tab Content - Lessons */}
            {activeTab === "lessons" && (
                <>
                    <Row className="mb-3">
                        <Col className="d-flex justify-content-between align-items-center">
                            <h5>Bài học ({allLessons.length})</h5>
                            <Button variant="dark" onClick={() => navigate("/createlesson")}>
                                + Tạo bài học
                            </Button>
                        </Col>
                    </Row>

                    {allLessons.length === 0 ? (
                        <Alert variant="info">
                            <Alert.Heading>Chưa có bài học nào</Alert.Heading>
                            <p>Bài học sẽ được tự động hiển thị khi bạn thêm videos vào các khóa học.</p>
                        </Alert>
                    ) : (
                        <div className="table-container">
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
                                                    className="p-0"
                                                    onClick={() => handleViewCourseDetail(lesson.courseId)}
                                                >
                                                    {lesson.course}
                                                </Button>
                                            </td>
                                            <td className="text-muted">{lesson.chapter}</td>
                                            <td>
                                                {lesson.videoURL ? (
                                                    <Badge bg="primary">Video</Badge>
                                                ) : (
                                                    <Badge bg="secondary">Chưa có nội dung</Badge>
                                                )}
                                            </td>
                                            <td>
                                                <Badge bg={getStatusVariant(lesson.status)}>
                                                    {lesson.isPreview ? "Miễn phí" : "Premium"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button 
                                                    variant="outline-dark" 
                                                    size="sm" 
                                                    className="me-1"
                                                    onClick={() => navigate(`/teacher/edit-lesson/${lesson.id}`)}
                                                    title="Chỉnh sửa"
                                                >
                                                    ✏️
                                                </Button>
                                                {lesson.videoURL && (
                                                    <Button 
                                                        variant="outline-primary" 
                                                        size="sm"
                                                        onClick={() => window.open(lesson.videoURL, '_blank')}
                                                        title="Xem video"
                                                    >
                                                        👁️
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </>
            )}

            {/* Tab Content - Docs */}
            {activeTab === "docs" && (
                <>
                    <Row className="mb-4">
                        <Col>
                            <h5>Tài liệu học tập</h5>
                            <p className="text-muted">
                                Quản lý tài liệu từ bài học. Tài liệu học tập được quản lý trực tiếp trong từng bài học.
                            </p>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col>
                            <div className="doc-info-card">
                                <div className="doc-info-content">
                                    <h6>Khi tạo hoặc chỉnh sửa bài học, bạn có thể thêm tài liệu PDF, Word, PowerPoint và các file khác.</h6>
                                    <Button variant="dark" className="mt-3" onClick={() => navigate("/createlesson")}>
                                        + Tạo bài học có tài liệu
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <div className="spec-card">
                                <div className="spec-icon">📄</div>
                                <h6>PDF Documents</h6>
                                <p className="text-muted mb-1">Không giới hạn</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="spec-card">
                                <div className="spec-icon">📝</div>
                                <h6>Word/PPT</h6>
                                <p className="text-muted mb-1">Không giới hạn</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="spec-card">
                                <div className="spec-icon">💾</div>
                                <h6>Dung lượng/file</h6>
                                <p className="text-muted mb-1">50 MB</p>
                            </div>
                        </Col>
                    </Row>
                </>
            )}
            {activeTab === "flashcards" && (
                <>
                    <Row className="mb-3">
                        <Col className="d-flex justify-content-between align-items-center">
                            <h5>Flashcards</h5>
                            <Button variant="dark">+ Tạo Flashcard</Button>
                        </Col>
                    </Row>

                    <Row>
                        {flashcardsData.map((card) => (
                            <Col md={6} key={card.id} className="mb-3">
                                <div className="flashcard">
                                    <div className="course-badge mb-2">
                                        <Badge bg="light" text="dark">{card.course}</Badge>
                                    </div>
                                    <div className="flashcard-content">
                                        <div className="flashcard-question">
                                            <strong>Câu hỏi:</strong>
                                            <p>{card.question}</p>
                                        </div>
                                        <div className="flashcard-answer">
                                            <strong>Đáp án:</strong>
                                            <p>{card.answer}</p>
                                        </div>
                                    </div>
                                    <div className="flashcard-actions mt-3">
                                        <Button variant="outline-dark" size="sm" className="me-1">✏️</Button>
                                        <Button variant="outline-danger" size="sm">🗑️</Button>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {activeTab === "quiz" && (
                <>
                    <Row className="mb-3">
                        <Col className="d-flex justify-content-between align-items-center">
                            <h5>Quizzes</h5>
                            <Button variant="dark">+ Tạo Quiz</Button>
                        </Col>
                    </Row>

                    <div className="table-container">
                        <Table responsive hover className="custom-table">
                            <thead>
                                <tr>
                                    <th>Tiêu đề</th>
                                    <th>Khóa học</th>
                                    <th>Số câu hỏi</th>
                                    <th>Thời gian</th>
                                    <th>Điểm đậu</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quizzesData.map((quiz) => (
                                    <tr key={quiz.id}>
                                        <td>
                                            <strong>{quiz.title}</strong>
                                        </td>
                                        <td>{quiz.course}</td>
                                        <td>{quiz.questions}</td>
                                        <td>{quiz.duration}</td>
                                        <td>{quiz.passingScore}</td>
                                        <td>
                                            <Button variant="outline-dark" size="sm" className="me-1">✏️</Button>
                                            <Button variant="outline-danger" size="sm">🗑️</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </>
            )}

            {activeTab === "reviews" && (
                <>
                    <Row className="mb-3">
                        <Col>
                            <h5>Đánh giá từ học viên</h5>
                        </Col>
                    </Row>

                    <Row>
                        {reviewsData.map((review) => (
                            <Col md={6} key={review.id} className="mb-3">
                                <div className="review-card">
                                    <div className="review-header mb-3">
                                        <div className="reviewer-info">
                                            <h6 className="mb-1">{review.student}</h6>
                                            <small className="text-muted">{review.course}</small>
                                        </div>
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                    <div className="review-date text-muted">
                                        <small>{review.date}</small>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </>
            )}
            {/* Create Course Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tạo khóa học mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên khóa học</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ví dụ: IELTS Nâng Cao"
                                value={newCourse.title}
                                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Cấp độ (Level)</Form.Label>
                            <Form.Select
                                value={newCourse.level}
                                onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                            >
                                <option value="">Chọn cấp độ</option>
                                <option value="1">Level 1 - Nền tảng</option>
                                <option value="2">Level 2 - Cơ bản</option>
                                <option value="3">Level 3 - Trung cấp</option>
                                <option value="4">Level 4 - Chuyên sâu</option>
                                <option value="5">Level 5 - Nâng cao</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Mô tả về khóa học"
                                value={newCourse.description}
                                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-dark" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="dark" onClick={handleCreateCourse}>Tạo khóa học</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Dashboard;