import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Card, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./createEditFlashcard.scss";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faEdit, faPlus, faQuestion, faInfoCircle, faTags, faBook } from '@fortawesome/free-solid-svg-icons';

const CreateEditFlashcard = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = !!id;

  const [flashcardData, setFlashcardData] = useState({
    course: "",
    question: "",
    answer: "",
    tags: "", // Comma-separated tags
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchFlashcard = async () => {
        setLoading(true);
        setError(null);
        try {
          // Replace with your actual API endpoint to fetch a single flashcard
          const response = await axios.get(`http://localhost:5293/api/flashcards/${id}`);
          const fetchedData = response.data;
          setFlashcardData({
            course: fetchedData.course,
            question: fetchedData.question,
            answer: fetchedData.answer,
            tags: fetchedData.tags ? fetchedData.tags.join(", ") : "", // Convert array to string
          });
        } catch (err) {
          setError("Không thể tải Flashcard để chỉnh sửa.");
          console.error("Error fetching flashcard:", err);
          // Fallback to demo data if API fails for edit
          const demoFlashcards = [
            {
              id: "1", course: "IELTS Nền Tảng", question: 'How do you say "Xin chào" in English?', answer: "Hello", tags: ["greeting", "basic"], lastEdited: "2024-01-16"
            },
            {
              id: "2", course: "IELTS Nền Tảng", question: 'What is the past tense of "go"?', answer: "Went", tags: ["grammar", "verbs"], lastEdited: "2024-01-18"
            }
          ];
          const demoCard = demoFlashcards.find(card => card.id === id);
          if (demoCard) {
            setFlashcardData({
              course: demoCard.course,
              question: demoCard.question,
              answer: demoCard.answer,
              tags: demoCard.tags ? demoCard.tags.join(", ") : "",
            });
            setError("Đang sử dụng dữ liệu demo.");
          } else {
            setError("Không tìm thấy Flashcard demo.");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchFlashcard();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFlashcardData({ ...flashcardData, [name]: value });
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!flashcardData.course || !flashcardData.question || !flashcardData.answer) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc!");
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        ...flashcardData,
        tags: flashcardData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "") // Convert string to array
      };

      if (isEditMode) {
        // Replace with your actual API endpoint for updating a flashcard
        await axios.put(`http://localhost:5293/api/flashcards/${id}`, dataToSend);
        setSuccess("Cập nhật Flashcard thành công!");
      } else {
        // Replace with your actual API endpoint for creating a flashcard
        await axios.post("http://localhost:5293/api/flashcards", dataToSend);
        setSuccess("Tạo Flashcard thành công!");
      }
      setTimeout(() => navigate("/dashboard"), 1500); // Redirect after a short delay
    } catch (err) {
      setError("Đã có lỗi xảy ra khi lưu Flashcard.");
      console.error("Error saving flashcard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !error) {
    return (
      <Container fluid className="p-4 create-edit-flashcard-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải Flashcard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 create-edit-flashcard-container">
      {/* Header */}
      <Row className="mb-4 d-flex justify-content-between align-items-center">
        <Col className="header-content">
          <h3><strong><FontAwesomeIcon icon={isEditMode ? faEdit : faPlus} className="me-2" /> {isEditMode ? "Chỉnh sửa Flashcard" : "Tạo Flashcard mới"}</strong></h3>
          <p>{isEditMode ? "Cập nhật thông tin Flashcard" : "Tạo Flashcard mới để ôn tập từ vựng, ngữ pháp"}</p>
        </Col>
        <Col className="text-end header-buttons">
          <Button variant="outline-primary" className="me-2" onClick={() => navigate("/dashboard")}>
            <FontAwesomeIcon icon={faTimes} className="me-1" /> Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            <FontAwesomeIcon icon={faSave} className="me-1" /> {loading ? "Đang lưu..." : "Lưu Flashcard"}
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col md={8}>
          <Card className="p-4 mb-3">
            <h5>Thông tin Flashcard</h5>
            <p className="text-muted">Nhập câu hỏi và câu trả lời cho Flashcard</p>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Khóa học <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="course"
                  value={flashcardData.course}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn khóa học</option>
                  <option value="IELTS Nền Tảng">IELTS Nền Tảng</option>
                  <option value="IELTS Cơ Bản">IELTS Cơ Bản</option>
                  <option value="IELTS Nâng Cao">IELTS Nâng Cao</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Câu hỏi <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Ví dụ: What is the past tense of 'eat'?"
                  name="question"
                  value={flashcardData.question}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Câu trả lời <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Ví dụ: Ate"
                  name="answer"
                  value={flashcardData.answer}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Từ khóa/Tags <FontAwesomeIcon icon={faTags} className="ms-1 text-muted" /></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ví dụ: grammar, verbs, IELTS, vocabulary (cách nhau bởi dấu phẩy)"
                  name="tags"
                  value={flashcardData.tags}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Sử dụng dấu phẩy (`,`) để phân tách các từ khóa.
                </Form.Text>
              </Form.Group>
            </Form>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-4">
            <h6><FontAwesomeIcon icon={faInfoCircle} className="me-2" /> Gợi ý Flashcard</h6>
            <ul>
              <li>Giữ câu hỏi và câu trả lời ngắn gọn, súc tích.</li>
              <li>Sử dụng hình ảnh hoặc ví dụ nếu cần.</li>
              <li>Thêm từ khóa liên quan để dễ dàng tìm kiếm và phân loại.</li>
              <li>Tạo Flashcard theo từng chủ đề hoặc bài học cụ thể.</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateEditFlashcard;