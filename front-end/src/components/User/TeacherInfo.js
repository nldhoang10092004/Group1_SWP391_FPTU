import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faEnvelope,
  faPhone,
  faAward,
  faBookOpen,
  faChevronLeft,
  faEdit,
  faCertificate,
  faUser,
  faCalendar
} from "@fortawesome/free-solid-svg-icons";
import { getTeacherInfo } from "../../middleware/teacher/teacherAPI"; 
import "./TeacherInfor.scss";

const TeacherInfo = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("📚 Fetching teacher info for ID:", teacherId);
        
        const data = await getTeacherInfo(teacherId);
        
        console.log("✅ Teacher info received:", data);
        console.log("📋 Raw API response:", JSON.stringify(data, null, 2));

        // Map API response correctly based on actual API structure
        const mappedData = {
          teacherId: data.teacherID || data.teacherId,
          fullName: data.fullName || data.name,
          email: data.email || null,
          phoneNumber: data.phoneNumber || data.phone || null,
          description: data.description,
          certs: Array.isArray(data.certs) ? data.certs : [],
          courseCount: data.courseCount || 0,
          studentCount: data.studentCount || 0,
          joinAt: data.joinAt
        };

        console.log("🔄 Mapped teacher data:", mappedData);
        console.log("📜 Total certificates:", mappedData.certs.length);
        console.log("📚 Total courses:", mappedData.courseCount);
        
        setTeacherInfo(mappedData);

        // Check if this is the user's own profile
        const currentUserId = localStorage.getItem("userID");
        const userRole = localStorage.getItem("userRole");
        if (userRole === "TEACHER" && currentUserId === teacherId) {
          setIsOwnProfile(true);
        }
      } catch (err) {
        console.error("❌ Error fetching teacher info:", err);
        setError(err.message || "Không thể tải thông tin giảng viên");
      } finally {
        setIsLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacherInfo();
    }
  }, [teacherId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (err) {
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <Container className="teacher-info-page py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải thông tin giảng viên...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="teacher-info-page py-5">
        <Alert variant="danger">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!teacherInfo) {
    return (
      <Container className="teacher-info-page py-5">
        <Alert variant="warning">
          <p>Không tìm thấy thông tin giảng viên</p>
          <Button variant="outline-warning" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="teacher-info-page">
      <Container className="py-4">
        <Button
          variant="outline-secondary"
          size="sm"
          className="mb-4 back-button"
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
          Quay lại
        </Button>

        <Card className="mb-4 shadow-sm border-0 header-card">
          <div className="header-gradient" />
          <Card.Body className="position-relative header-body">
            <div className="avatar-container">
              <div className="avatar-wrapper">
                <div className="avatar-circle">
                  {teacherInfo.fullName ? teacherInfo.fullName.charAt(0).toUpperCase() : "T"}
                </div>
              </div>
            </div>

            <div className="text-center mb-4 teacher-name-section">
              <h2 className="mb-2">{teacherInfo.fullName || "Giảng viên"}</h2>
              <div className="d-flex justify-content-center align-items-center gap-3">
                <Badge className="teacher-badge">
                  <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                  Giảng viên
                </Badge>
                {teacherInfo.certs && teacherInfo.certs.length > 0 && (
                  <Badge className="teacher-stats-badge">
                    <FontAwesomeIcon icon={faCertificate} className="me-2" />
                    {teacherInfo.certs.length} chứng chỉ
                  </Badge>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <div className="text-center mb-3">
                <Button
                  variant="outline-primary"
                  onClick={() => navigate("/profile")}
                  className="edit-profile-btn"
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Chỉnh sửa hồ sơ
                </Button>
              </div>
            )}

            <Row className="mt-4 contact-info-row">
              {teacherInfo.email && (
                <Col md={4} className="mb-3">
                  <div className="info-card">
                    <div className="info-icon-wrapper email-icon">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <strong className="info-text">{teacherInfo.email}</strong>
                    </div>
                  </div>
                </Col>
              )}
              
              {teacherInfo.phoneNumber && (
                <Col md={4} className="mb-3">
                  <div className="info-card">
                    <div className="info-icon-wrapper phone-icon">
                      <FontAwesomeIcon icon={faPhone} />
                    </div>
                    <div>
                      <small className="text-muted d-block">Số điện thoại</small>
                      <strong>{teacherInfo.phoneNumber}</strong>
                    </div>
                  </div>
                </Col>
              )}

              {teacherInfo.joinAt && (
                <Col md={teacherInfo.email || teacherInfo.phoneNumber ? 4 : 12} className="mb-3">
                  <div className="info-card">
                    <div className="info-icon-wrapper calendar-icon">
                      <FontAwesomeIcon icon={faCalendar} />
                    </div>
                    <div>
                      <small className="text-muted d-block">Tham gia</small>
                      <strong>{formatDate(teacherInfo.joinAt)}</strong>
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>

        <Row>
          <Col lg={8} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3 ">
                  Giới thiệu
                </h5>
                {teacherInfo.description ? (
                  <p className="description-text">
                    {teacherInfo.description}
                  </p>
                ) : (
                  <p className="text-muted fst-italic">Chưa có thông tin giới thiệu</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3 section-title">
                  Chứng chỉ ({teacherInfo.certs?.length || 0})
                </h5>
                {teacherInfo.certs && teacherInfo.certs.length > 0 ? (
                  <div className="cert-list">
                    {teacherInfo.certs.map((certUrl, index) => (
                      <a
                        key={index}
                        href={certUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cert-link"
                      >
                        <span>Chứng chỉ {index + 1}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">Chưa có chứng chỉ</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        
      </Container>
    </div>
  );
};

export default TeacherInfo;