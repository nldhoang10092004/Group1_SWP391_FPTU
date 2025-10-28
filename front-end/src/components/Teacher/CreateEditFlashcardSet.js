import React, { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  createFlashcardSet,
  updateFlashcardSet,
  getFlashcardSetById,
} from "../../middleware/flashcardAPI";
import { getCourses } from "../../middleware/courseAPI";

const CreateEditFlashcardSet = () => {
  const { id } = useParams(); // nếu id = "create" => tạo mới
  const navigate = useNavigate();
  const isEditMode = id && id !== "create";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseID: "",
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 🟢 Lấy danh sách khóa học
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        console.log("📘 API Course data:", data);

        // Ép kiểu về mảng an toàn
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data && Array.isArray(data.courses)) {
          // Trường hợp API trả { courses: [...] }
          setCourses(data.courses);
        } else {
          console.warn("⚠️ Dữ liệu khóa học không hợp lệ:", data);
          setCourses([]);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách khóa học:", err);
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  // 🟢 Nếu là edit mode -> load flashcard set theo ID
  // 🟢 Nếu là edit mode -> load flashcard set theo ID
  useEffect(() => {
    // Chỉ gọi API khi id tồn tại và KHÔNG phải "create"
    if (id && id !== "create") {
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
  }, [id]);

  // 🟢 Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🟢 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.courseID) {
      setMessage({ type: "danger", text: "Vui lòng chọn khóa học!" });
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await updateFlashcardSet(id, formData);
        setMessage({ type: "success", text: "Cập nhật thành công!" });
      } else {
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
            {/* Tiêu đề */}
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Mô tả */}
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

            {/* Khóa học */}
            <Form.Group className="mb-3">
              <Form.Label>Khóa học</Form.Label>
              {isEditMode ? (
                <Form.Control
                  type="text"
                  value={
                    Array.isArray(courses)
                      ? courses.find((c) => c.courseID === formData.courseID)
                          ?.courseName || "Không xác định"
                      : "Không xác định"
                  }
                  disabled
                  readOnly
                />
              ) : (
                <Form.Select
                  name="courseID"
                  value={formData.courseID}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn khóa học --</option>
                  {Array.isArray(courses) &&
                    courses.map((course) => (
                      <option key={course.courseID} value={course.courseID}>
                        {course.courseName}
                      </option>
                    ))}
                </Form.Select>
              )}
            </Form.Group>

            {/* Nút hành động */}
            <div className="d-flex">
              <Button type="submit" variant="primary">
                {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() => navigate(-1)}
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
