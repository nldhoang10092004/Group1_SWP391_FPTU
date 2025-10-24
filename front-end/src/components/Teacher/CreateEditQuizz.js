import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Card, Alert, InputGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CreateEditQuizz.scss";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faEdit, faPlus, faQuestionCircle, faTrashAlt, faLightbulb, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

const CreateEditQuiz = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = !!id;

  const [quizData, setQuizData] = useState({
    title: "",
    course: "",
    duration: "", 
    passingScore: "", // e.g., "70%"
    status: "draft", // "draft" or "published"
    questions: [], // Array of question objects
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchQuiz = async () => {
        setLoading(true);
        setError(null);
        try {
          // Replace with your actual API endpoint to fetch a single quiz
          const response = await axios.get(`http://localhost:5293/api/quizzes/${id}`);
          setQuizData(response.data);
        } catch (err) {
          setError("Không thể tải Quiz để chỉnh sửa.");
          console.error("Error fetching quiz:", err);
          // Fallback to demo data if API fails for edit
          const demoQuizzes = [
            {
              id: "1", title: "Basic Grammar Quiz", course: "IELTS Nền Tảng", questions: [
                { id: 1, text: "The cat ___ on the mat.", options: ["sit", "sits"], correctAnswer: "sits" },
                { id: 2, text: "She ___ to the store yesterday.", options: ["go", "goes", "went"], correctAnswer: "went" }
              ], duration: "20 phút", passingScore: "70%", status: "published", created: "2024-01-10"
            }
          ];
          const demoQuiz = demoQuizzes.find(quiz => quiz.id === id);
          if (demoQuiz) {
            setQuizData(demoQuiz);
            setError("Đang sử dụng dữ liệu demo.");
          } else {
            setError("Không tìm thấy Quiz demo.");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchQuiz();
    }
  }, [id, isEditMode]);

  const handleQuizDetailsChange = (e) => {
    const { name, value } = e.target;
    setQuizData({ ...quizData, [name]: value });
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex][field] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        { id: Date.now(), text: "", options: ["", ""], correctAnswer: "" },
      ],
    });
  };

  const removeQuestion = (qIndex) => {
    const newQuestions = quizData.questions.filter((_, idx) => idx !== qIndex);
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const addOption = (qIndex) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options.push("");
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const removeOption = (qIndex, optIndex) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, idx) => idx !== optIndex);
    if (newQuestions[qIndex].correctAnswer === newQuestions[qIndex].options[optIndex]) {
        newQuestions[qIndex].correctAnswer = ""; 
    }
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!quizData.title || !quizData.course || !quizData.duration || !quizData.passingScore || quizData.questions.length === 0) {
      setError("Vui lòng điền đầy đủ thông tin quiz và thêm ít nhất một câu hỏi!");
      setLoading(false);
      return;
    }

    // Basic validation for questions
    for (const q of quizData.questions) {
      if (!q.text || q.options.some(opt => !opt) || !q.correctAnswer || !q.options.includes(q.correctAnswer)) {
        setError("Vui lòng đảm bảo tất cả câu hỏi có nội dung, ít nhất 2 lựa chọn và đáp án đúng được chọn từ các lựa chọn có sẵn.");
        setLoading(false);
        return;
      }
    }

    try {
      if (isEditMode) {
        // Replace with your actual API endpoint for updating a quiz
        await axios.put(`http://localhost:5293/api/quizzes/${id}`, quizData);
        setSuccess("Cập nhật Quiz thành công!");
      } else {
        // Replace with your actual API endpoint for creating a quiz
        await axios.post("http://localhost:5293/api/quizzes", quizData);
        setSuccess("Tạo Quiz thành công!");
      }
      setTimeout(() => navigate("/teacher/dashboard"), 1500); // Redirect after a short delay
    } catch (err) {
      setError("Đã có lỗi xảy ra khi lưu Quiz.");
      console.error("Error saving quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !error) {
    return (
      <Container fluid className="p-4 create-edit-quiz-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải Quiz...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 create-edit-quiz-container">
      {/* Header */}
      <Row className="mb-4 d-flex justify-content-between align-items-center">
        <Col className="header-content">
          <h3><strong><FontAwesomeIcon icon={isEditMode ? faEdit : faPlus} className="me-2" /> {isEditMode ? "Chỉnh sửa Quiz" : "Tạo Quiz mới"}</strong></h3>
          <p>{isEditMode ? "Cập nhật thông tin và câu hỏi cho Quiz" : "Thiết kế các bài kiểm tra ngắn cho học viên"}</p>
        </Col>
        <Col className="text-end header-buttons">
          <Button variant="outline-primary" className="me-2" onClick={() => navigate("/dashboard")}>
            <FontAwesomeIcon icon={faTimes} className="me-1" /> Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            <FontAwesomeIcon icon={faSave} className="me-1" /> {loading ? "Đang lưu..." : "Lưu Quiz"}
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col md={8}>
          <Card className="p-4 mb-3">
            <h5>Thông tin cơ bản Quiz</h5>
            <p className="text-muted">Đặt tên, chọn khóa học và cấu hình thời gian</p>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề Quiz <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ví dụ: Kiểm tra ngữ pháp cơ bản"
                  name="title"
                  value={quizData.title}
                  onChange={handleQuizDetailsChange}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Khóa học <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="course"
                      value={quizData.course}
                      onChange={handleQuizDetailsChange}
                      required
                    >
                      <option value="">Chọn khóa học</option>
                      <option value="IELTS Nền Tảng">IELTS Nền Tảng</option>
                      <option value="IELTS Cơ Bản">IELTS Cơ Bản</option>
                      <option value="IELTS Nâng Cao">IELTS Nâng Cao</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thời lượng <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: 30 phút"
                      name="duration"
                      value={quizData.duration}
                      onChange={handleQuizDetailsChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Điểm đậu <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Ví dụ: 70"
                        name="passingScore"
                        value={quizData.passingScore.replace('%', '')} // Remove % for input
                        onChange={e => handleQuizDetailsChange({ ...e, target: { ...e.target, value: `${e.target.value.replace(/[^0-9]/g, '')}%` } })}
                        required
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                      name="status"
                      value={quizData.status}
                      onChange={handleQuizDetailsChange}
                    >
                      <option value="draft">Bản nháp</option>
                      <option value="published">Đã xuất bản</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Questions Section */}
          <Card className="p-4 mb-3">
            <h5><FontAwesomeIcon icon={faQuestionCircle} className="me-2" /> Câu hỏi Quiz ({quizData.questions.length})</h5>
            <p className="text-muted">Thêm các câu hỏi và lựa chọn đáp án đúng</p>

            {quizData.questions.map((q, qIndex) => (
              <Card key={q.id || qIndex} className="mb-3 question-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Câu hỏi {qIndex + 1}</h6>
                    <Button variant="outline-danger" size="sm" onClick={() => removeQuestion(qIndex)} title="Xóa câu hỏi">
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </Button>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Nội dung câu hỏi <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Nhập nội dung câu hỏi..."
                      value={q.text}
                      onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Các lựa chọn <span className="text-danger">*</span></Form.Label>
                    {q.options.map((option, optIndex) => (
                      <InputGroup key={optIndex} className="mb-2">
                        <InputGroup.Radio
                          name={`correctAnswer-${qIndex}`}
                          value={option}
                          checked={q.correctAnswer === option}
                          onChange={(e) => handleQuestionChange(qIndex, "correctAnswer", e.target.value)}
                          aria-label={`Đáp án đúng cho lựa chọn ${optIndex + 1}`}
                          title="Chọn làm đáp án đúng"
                        />
                        <Form.Control
                          type="text"
                          placeholder={`Lựa chọn ${optIndex + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                          required
                        />
                        {q.options.length > 2 && ( // Allow removing options if more than 2
                          <Button variant="outline-danger" onClick={() => removeOption(qIndex, optIndex)} title="Xóa lựa chọn">
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
                        )}
                      </InputGroup>
                    ))}
                    <Button variant="outline-secondary" size="sm" onClick={() => addOption(qIndex)} className="mt-2">
                      <FontAwesomeIcon icon={faPlus} className="me-1" /> Thêm lựa chọn
                    </Button>
                  </Form.Group>
                  <div className="text-success mt-2">
                      Đáp án đúng: <strong>{q.correctAnswer || "Chưa chọn"}</strong>
                  </div>
                </Card.Body>
              </Card>
            ))}

            <Button variant="outline-primary" onClick={addQuestion} className="mt-3 w-100">
              <FontAwesomeIcon icon={faPlus} className="me-2" /> Thêm câu hỏi mới
            </Button>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-4">
            <h6><FontAwesomeIcon icon={faLightbulb} className="me-2" /> Gợi ý Quiz</h6>
            <ul>
              <li>Giữ câu hỏi ngắn gọn và rõ ràng.</li>
              <li>Đảm bảo có ít nhất 2 lựa chọn cho mỗi câu hỏi.</li>
              <li>Luôn chọn đáp án đúng cho mỗi câu hỏi.</li>
              <li>Kiểm tra kỹ thời lượng và điểm đậu phù hợp.</li>
              <li>Xuất bản Quiz khi đã hoàn thành để học viên có thể làm.</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateEditQuiz;