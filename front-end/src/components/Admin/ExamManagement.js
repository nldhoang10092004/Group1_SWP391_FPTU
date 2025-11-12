import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Table,
  Modal,
  Form,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getAllQuizzes, createQuiz, deleteQuiz } from "../../middleware/admin/quizManagementAPI";
import { Eye, Trash2, Plus, BookOpen } from "lucide-react";

export function ExamManagement() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create Quiz Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    courseID: 0,
    title: "",
    description: "",
    quizType: 0,
  });
  const [creating, setCreating] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllQuizzes();
      console.log("✅ Fetched quizzes:", data);
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching quizzes:", err);
      setError(err.response?.data?.message || err.message || "Không thể tải danh sách quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleCreateQuiz = async () => {
    if (!newQuiz.title.trim()) {
      alert("❌ Vui lòng nhập tên quiz!");
      return;
    }

    try {
      setCreating(true);
      await createQuiz(newQuiz);
      await fetchQuizzes();
      setShowCreateModal(false);
      setNewQuiz({
        courseID: 0,
        title: "",
        description: "",
        quizType: 0,
      });
      alert("✅ Tạo quiz thành công!");
    } catch (err) {
      console.error("❌ Create quiz error:", err);
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteQuiz(deleteTarget.quizID || deleteTarget.quizId);
      await fetchQuizzes();
      setShowDeleteModal(false);
      setDeleteTarget(null);
      alert("✅ Xóa quiz thành công!");
    } catch (err) {
      console.error("❌ Delete quiz error:", err);
      alert("❌ Lỗi xóa quiz: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
    }
  };

  const getQuizTypeName = (type) => {
    switch (type) {
      case 0:
        return "Practice";
      case 1:
        return "Exam";
      case 2:
        return "Assignment";
      default:
        return "Unknown";
    }
  };

  const getQuizTypeVariant = (type) => {
    switch (type) {
      case 0:
        return "info";
      case 1:
        return "danger";
      case 2:
        return "warning";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải danh sách quiz...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-primary mb-0">
            <BookOpen size={28} className="me-2" />
            Quản lý Quiz/Exam
          </h3>
          <p className="text-muted mt-2">Tổng cộng: {quizzes.length} quiz</p>
        </div>
        <Button
          variant="success"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} className="me-2" />
          Tạo Quiz Mới
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Quiz Table */}
      {quizzes.length > 0 ? (
        <Card>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: "60px" }}>ID</th>
                  <th>Tên Quiz</th>
                  <th>Mô tả</th>
                  <th style={{ width: "120px" }}>Loại</th>
                  <th style={{ width: "100px" }}>Course ID</th>
                  <th style={{ width: "150px" }} className="text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => {
                  const quizId = quiz.quizID || quiz.quizId;
                  const quizType = quiz.quizType ?? 0;
                  
                  return (
                    <tr key={quizId}>
                      <td className="align-middle">
                        <strong>#{quizId}</strong>
                      </td>
                      <td className="align-middle">
                        <strong>{quiz.title}</strong>
                      </td>
                      <td className="align-middle">
                        <small className="text-muted">
                          {quiz.description || "—"}
                        </small>
                      </td>
                      <td className="align-middle">
                        <Badge bg={getQuizTypeVariant(quizType)}>
                          {getQuizTypeName(quizType)}
                        </Badge>
                      </td>
                      <td className="align-middle text-center">
                        {quiz.courseID || "—"}
                      </td>
                      <td className="align-middle text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => navigate(`/admin/examdetail/${quizId}`)}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setDeleteTarget(quiz);
                            setShowDeleteModal(true);
                          }}
                          title="Xóa quiz"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <BookOpen size={64} className="text-muted mb-3" />
            <h5 className="text-muted">Chưa có quiz nào</h5>
            <p className="text-muted mb-3">
              Nhấn nút "Tạo Quiz Mới" để bắt đầu
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} className="me-2" />
              Tạo Quiz Đầu Tiên
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Create Quiz Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>📝 Tạo Quiz Mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên Quiz *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên quiz..."
                value={newQuiz.title}
                onChange={(e) =>
                  setNewQuiz({ ...newQuiz, title: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập mô tả quiz (tùy chọn)..."
                value={newQuiz.description}
                onChange={(e) =>
                  setNewQuiz({ ...newQuiz, description: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loại Quiz</Form.Label>
              <Form.Select
                value={newQuiz.quizType}
                onChange={(e) =>
                  setNewQuiz({
                    ...newQuiz,
                    quizType: parseInt(e.target.value),
                  })
                }
              >
                <option value={0}>Practice</option>
                <option value={1}>Exam</option>
                <option value={2}>Assignment</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Course ID</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập Course ID (hoặc để 0)..."
                value={newQuiz.courseID}
                onChange={(e) =>
                  setNewQuiz({
                    ...newQuiz,
                    courseID: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Form.Text className="text-muted">
                Để 0 nếu quiz không thuộc course nào
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCreateModal(false)}
            disabled={creating}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateQuiz}
            disabled={creating || !newQuiz.title.trim()}
          >
            {creating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Đang tạo...
              </>
            ) : (
              "Tạo Quiz"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            Bạn có chắc chắn muốn xóa quiz này?
            <br />
            <strong>"{deleteTarget?.title}"</strong>
            <br />
            <br />
            Tất cả groups, câu hỏi và assets sẽ bị xóa vĩnh viễn!
            <br />
            <strong>Hành động này không thể hoàn tác!</strong>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteQuiz}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Đang xóa...
              </>
            ) : (
              "Xóa Quiz"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ExamManagement;