import React, { useState } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./createLesson.scss"; 
import axios from "axios";


const CreateLesson = () => {
  const navigate = useNavigate();

  const [lessonData, setLessonData] = useState({
    title: "",
    course: "",
    duration: "",
    type: "Video",
    description: "",
    videoUrl: "",
    material: null,
    thumbnail: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setLessonData({ ...lessonData, [name]: files[0] });
    } else {
      setLessonData({ ...lessonData, [name]: value });
    }
  };

  const handleSave = async () => {
  try {
    const formData = new FormData();
    for (const key in lessonData) {
      formData.append(key, lessonData[key]);
    }

    const response = await axios.post("http://localhost:5293/api/lessons", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Lưu bài học thành công!");
    navigate("/dashboard");
  } catch (error) {
    console.error("Lỗi khi lưu bài học:", error);
    alert("Không thể lưu bài học!");
  }
};

  return (
    <Container fluid className="p-4 create-lesson-container">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h3><strong>Tạo bài học mới</strong></h3>
          <p>Tạo nội dung học tập cho học viên của bạn</p>
        </Col>
        <Col className="text-end">
          <Button variant="outline-dark" className="me-2" onClick={() => navigate("/dashboard")}>
            Hủy
          </Button>
          <Button variant="dark" onClick={handleSave}>
            Lưu bài học
          </Button>
        </Col>
      </Row>

      <Row>
        {/* Form bên trái */}
        <Col md={8}>
          <Card className="p-4 mb-3">
            <h5>Thông tin cơ bản</h5>
            <p className="text-muted">Thông tin chính về bài học</p>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề bài học *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ví dụ: Basic Greetings"
                  name="title"
                  value={lessonData.title}
                  onChange={handleChange}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Khóa học *</Form.Label>
                    <Form.Select
                      name="course"
                      value={lessonData.course}
                      onChange={handleChange}
                    >
                      <option value="">Chọn khóa học</option>
                      <option value="English Foundation">English Foundation</option>
                      <option value="Pre-Intermediate English">Pre-Intermediate English</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Loại bài học *</Form.Label>
                    <Form.Select
                      name="type"
                      value={lessonData.type}
                      onChange={handleChange}
                    >
                      <option value="Video">Video</option>
                      <option value="Tương tác">Tương tác</option>
                      <option value="Bài đọc">Bài đọc</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thời lượng *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: 15 min"
                      name="duration"
                      value={lessonData.duration}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả bài học</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Mô tả ngắn về nội dung bài học"
                  name="description"
                  value={lessonData.description}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          </Card>

          {/* Video */}
          <Card className="p-4 mb-3">
            <h5>📹 Video bài học</h5>
            <p className="text-muted">Tải lên video hoặc nhập URL video cho bài học</p>

            <Row className="mb-3">
              <Col md={8}>
                <Form.Control
                  type="text"
                  placeholder="https://youtube.com/... hoặc URL video khác"
                  name="videoUrl"
                  value={lessonData.videoUrl}
                  onChange={handleChange}
                />
              </Col>
              <Col md={4}>
                <Button variant="outline-dark" className="w-100">Lưu URL</Button>
              </Col>
            </Row>

            <Form.Text className="text-muted">
              Hỗ trợ YouTube, Vimeo hoặc link .mp4
            </Form.Text>
          </Card>

          {/* Tài liệu */}
          <Card className="p-4 mb-3">
            <h5>📑 Tài liệu học tập</h5>
            <p className="text-muted">Thêm tài liệu bổ sung cho bài học (PDF, Word, PowerPoint, etc.)</p>
            <Form.Control type="file" name="material" onChange={handleChange} />
          </Card>
        </Col>

        {/* Sidebar bên phải */}
        <Col md={4}>
          <Card className="p-4 mb-3">
            <h6>🖼️ Hình đại diện</h6>
            <Form.Control type="file" name="thumbnail" onChange={handleChange} />
            <Form.Text className="text-muted">
              Khuyến nghị: 16:9, tối thiểu 1280x720px
            </Form.Text>
          </Card>

          <Card className="p-4">
            <h6>💡 Gợi ý</h6>
            <ul>
              <li>Tiêu đề ngắn gọn và mô tả rõ nội dung</li>
              <li>Video nên có chất lượng HD (720p+)</li>
              <li>Thêm tài liệu bổ sung cho học viên</li>
              <li>Hình đại diện thu hút giúp tăng lượt xem</li>
              <li>Thời lượng tốt nhất: 10-20 phút/bài</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateLesson;
