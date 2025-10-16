import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./createLesson.scss";

const EditLesson = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // lấy id từ URL

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

  // 🔹 Lấy dữ liệu bài học khi load trang
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await axios.get(`http://localhost:5293/api/lessons/${id}`);
        setLessonData(res.data);
      } catch (error) {
        console.error("Lỗi khi tải bài học:", error);
        alert("Không thể tải dữ liệu bài học!");
      }
    };
    fetchLesson();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setLessonData({ ...lessonData, [name]: files[0] });
    } else {
      setLessonData({ ...lessonData, [name]: value });
    }
  };

  // 🔹 Cập nhật bài học
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      for (const key in lessonData) {
        formData.append(key, lessonData[key]);
      }

      await axios.put(`http://localhost:5293/api/lessons/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Cập nhật bài học thành công!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Lỗi khi cập nhật bài học:", error);
      alert("Không thể cập nhật bài học!");
    }
  };

  return (
    <Container fluid className="p-4 create-lesson-container">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h3><strong>Chỉnh sửa bài học</strong></h3>
          <p>Cập nhật nội dung cho bài học của bạn</p>
        </Col>
        <Col className="text-end">
          <Button variant="outline-dark" className="me-2" onClick={() => navigate("/dashboard")}>
            Hủy
          </Button>
          <Button variant="dark" onClick={handleUpdate}>
            Lưu thay đổi
          </Button>
        </Col>
      </Row>

      <Row>
        {/* Form bên trái */}
        <Col md={8}>
          <Card className="p-4 mb-3">
            <h5>Thông tin cơ bản</h5>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề *</Form.Label>
                <Form.Control
                  type="text"
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

              <Form.Group className="mb-3">
                <Form.Label>Thời lượng *</Form.Label>
                <Form.Control
                  type="text"
                  name="duration"
                  value={lessonData.duration}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
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
            <Row className="mb-3">
              <Col md={8}>
                <Form.Control
                  type="text"
                  name="videoUrl"
                  value={lessonData.videoUrl}
                  onChange={handleChange}
                />
              </Col>
              <Col md={4}>
                <Button variant="outline-dark" className="w-100">Lưu URL</Button>
              </Col>
            </Row>
          </Card>

          {/* Tài liệu */}
          <Card className="p-4 mb-3">
            <h5>📑 Tài liệu học tập</h5>
            <Form.Control type="file" name="material" onChange={handleChange} />
          </Card>
        </Col>

        {/* Sidebar */}
        <Col md={4}>
          <Card className="p-4 mb-3">
            <h6>🖼️ Hình đại diện</h6>
            <Form.Control type="file" name="thumbnail" onChange={handleChange} />
            <Form.Text className="text-muted">Tỷ lệ 16:9, tối thiểu 1280x720px</Form.Text>
          </Card>

          <Card className="p-4">
            <h6>💡 Gợi ý</h6>
            <ul>
              <li>Cập nhật mô tả rõ ràng, dễ hiểu</li>
              <li>Video nên có chất lượng cao (720p+)</li>
              <li>Thêm tài liệu hỗ trợ học viên</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditLesson;
