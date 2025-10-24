import React, { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  createFlashcardSet,
  updateFlashcardSet,
  getFlashcardSetById,
} from "../../middleware/flashcardAPI";
import axios from "axios";

const CreateEditFlashcardSet = () => {
  const { id } = useParams(); // nếu id = "create" => tạo mới
  const navigate = useNavigate();

  // 🟢 Xác định chế độ (true = edit, false = create)
  const isEditMode = id && id !== "create";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseID: "",
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const API_URL = `${process.env.REACT_APP_API_URL}/api/course`;

  // 🟢 Lấy danh sách khóa học
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setCourses(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách khóa học:", err);
      }
    };
    fetchCourses();
  }, []);

  // 🟢 Nếu là edit mode -> load flashcard set theo ID
  useEffect(() => {
    if (isEditMode) {
      (async () => {
        try {
          setLoading(true);
          const data = await getFlashcardSetById(id);
          setFormData({
            title: data.title || "",
            description: data.description || "",
            courseID: data.courseID || "",
          });
        } catch (err) {
          console.error("❌ Lỗi khi tải flashcard set:", err);
          setMessage({ type: "danger", text: "Không thể tải flashcard set." });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🟢 Gửi dữ liệu khi submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseID) {
      setMessage({ type: "danger", text: "Vui lòng chọn khóa học!" });
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        // PUT /api/flashcard/set/{setId}
        await updateFlashcardSet(id, formData);
        setMessage({ type: "success", text: "Cập nhật thành công!" });
      } else {
        // POST /api/flashcard/set
        await createFlashcardSet(formData);
        setMessage({ type: "success", text: "Tạo mới thành công!" });
      }
      setTimeout(() => navigate("/flashcards"), 1200);
    } catch (err) {
      console.error("❌ Lỗi khi lưu flashcard set:", err);
      setMessage({ type: "danger", text: "Có lỗi khi lưu flashcard set." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="p-4">
      <Card className="p-4 shadow-sm">
        <h4>{isEditMode ? "Chỉnh sửa Flashcard Set" : "Tạo Flashcard Set"}</h4>
        {message.text && <Alert variant={message.type}>{message.text}</Alert>}
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Khóa học</Form.Label>
              <Form.Select
                name="courseID"
                value={formData.courseID}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn khóa học --</option>
                {courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex">
              <Button type="submit" variant="primary">
                {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() => navigate("/teacher/dashboard")}
              >
                Hủy
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </Container>
  );
};

export default CreateEditFlashcardSet;
