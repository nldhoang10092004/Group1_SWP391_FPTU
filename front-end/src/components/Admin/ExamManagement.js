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
import { 
  getAllQuizzes, 
  createQuiz, 
  deleteQuiz, 
  updateQuiz 
} from "../../middleware/admin/quizManagementAPI";
import { Eye, Trash2, Plus, BookOpen, BarChart3, Edit2 } from "lucide-react";

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
    quizType: 1,
  });
  const [creating, setCreating] = useState(false);

  // Update Quiz Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingQuiz, setUpdatingQuiz] = useState(null);
  const [updateData, setUpdateData] = useState({
    title: "",
    description: "",
    quizType: 1,
    isActive: true,
  });
  const [updating, setUpdating] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // System Exam Results Modal
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [systemExamResults, setSystemExamResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState("");

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

  const fetchSystemExamResults = async () => {
    try {
      setLoadingResults(true);
      setResultsError("");

      const token = localStorage.getItem("accessToken");
      const API_URL = process.env.REACT_APP_API_URL;

      const response = await fetch(`${API_URL}/api/admin/score-management/system-exams`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ System exam results:", data);
      setSystemExamResults(Array.isArray(data) ? data : []);
      setShowResultsModal(true);
    } catch (err) {
      console.error("❌ Error fetching system exam results:", err);
      setResultsError(err.message || "Không thể tải kết quả system exam");
      alert("❌ Lỗi: " + err.message);
    } finally {
      setLoadingResults(false);
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
        quizType: 1,
      });
      alert("✅ Tạo quiz thành công!");
    } catch (err) {
      console.error("❌ Create quiz error:", err);
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleOpenUpdateModal = (quiz) => {
    const quizId = quiz.quizID || quiz.quizId;
    setUpdatingQuiz(quiz);
    setUpdateData({
      title: quiz.title || "",
      description: quiz.description || "",
      quizType: quiz.quizType || 1,
      isActive: quiz.isActive ?? true,
    });
    setShowUpdateModal(true);
  };

  const handleUpdateQuiz = async () => {
    if (!updateData.title.trim()) {
      alert("❌ Vui lòng nhập tên quiz!");
      return;
    }

    try {
      setUpdating(true);
      const quizId = updatingQuiz.quizID || updatingQuiz.quizId;
      
      // Chỉ update thông tin cơ bản, không động vào groups
      const payload = {
        title: updateData.title,
        description: updateData.description,
        quizType: updateData.quizType,
        isActive: updateData.isActive,
        groups: updatingQuiz.groups || updatingQuiz.questionGroups || []
      };

      await updateQuiz(quizId, payload);
      await fetchQuizzes();
      setShowUpdateModal(false);
      setUpdatingQuiz(null);
      alert("✅ Cập nhật quiz thành công!");
    } catch (err) {
      console.error("❌ Update quiz error:", err);
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
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
    const numType = typeof type === "string" ? parseInt(type, 10) : type;
    switch (numType) {
      case 1:
        return "Multiple Choice";
      case 2:
        return "Listening";
      case 3:
        return "Reading";
      case 4:
        return "Writing";
      case 5:
        return "Speaking";
      default:
        return "Unknown";
    }
  };

  const getQuizTypeVariant = (type) => {
    const numType = typeof type === "string" ? parseInt(type, 10) : type;
    switch (numType) {
      case 1:
        return "info";
      case 2:
        return "danger";
      case 3:
        return "warning";
      case 4:
        return "secondary";
      case 5:
        return "primary";
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
        <div className="d-flex gap-2">
          <Button
            variant="info"
            onClick={fetchSystemExamResults}
            disabled={loadingResults}
          >
            {loadingResults ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Đang tải...
              </>
            ) : (
              <>
                <BarChart3 size={18} className="me-2" />
                Xem System Exam Results
              </>
            )}
          </Button>
          <Button
            variant="success"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} className="me-2" />
            Tạo Quiz Mới
          </Button>
        </div>
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
                  <th style={{ width: "100px" }}>Trạng thái</th>
                  <th style={{ width: "180px" }} className="text-center">
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
                        <Badge bg={quiz.isActive ? "success" : "secondary"}>
                          {quiz.isActive ? "Active" : "Inactive"}
                        </Badge>
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
                          variant="outline-warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenUpdateModal(quiz)}
                          title="Sửa quiz"
                        >
                          <Edit2 size={16} />
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
          <Modal.Title>Tạo Quiz Mới</Modal.Title>
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
                <option value={1}>Multiple Choice (Trắc nghiệm)</option>
                <option value={2}>Listening</option>
                <option value={3}>Reading</option>
                <option value={4}>Writing</option>
                <option value={5}>Speaking</option>
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

      {/* Update Quiz Modal */}
      <Modal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật Quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên Quiz *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên quiz..."
                value={updateData.title}
                onChange={(e) =>
                  setUpdateData({ ...updateData, title: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập mô tả quiz (tùy chọn)..."
                value={updateData.description}
                onChange={(e) =>
                  setUpdateData({ ...updateData, description: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loại Quiz</Form.Label>
              <Form.Select
                value={updateData.quizType}
                onChange={(e) =>
                  setUpdateData({
                    ...updateData,
                    quizType: parseInt(e.target.value),
                  })
                }
              >
                <option value={1}>Multiple Choice (Trắc nghiệm)</option>
                <option value={2}>Listening</option>
                <option value={3}>Reading</option>
                <option value={4}>Writing</option>
                <option value={5}>Speaking</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="quiz-active-switch"
                label="Quiz đang hoạt động"
                checked={updateData.isActive}
                onChange={(e) =>
                  setUpdateData({ ...updateData, isActive: e.target.checked })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUpdateModal(false)}
            disabled={updating}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateQuiz}
            disabled={updating || !updateData.title.trim()}
          >
            {updating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Đang cập nhật...
              </>
            ) : (
              "Cập nhật"
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
            Tất cả groups và câu hỏi sẽ bị xóa vĩnh viễn!
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

      {/* System Exam Results Modal */}
      <Modal
        show={showResultsModal}
        onHide={() => setShowResultsModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <BarChart3 size={24} className="me-2" />
            System Exam Results
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {resultsError && <Alert variant="danger">{resultsError}</Alert>}

          {systemExamResults.length > 0 ? (
            <>
              <Alert variant="info">
                <strong>Tổng số bài thi:</strong> {systemExamResults.length}
              </Alert>
              <Table responsive hover>
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: "80px" }}>Attempt ID</th>
                    <th style={{ width: "80px" }}>Quiz ID</th>
                    <th>Quiz Title</th>
                    <th style={{ width: "100px" }}>User ID</th>
                    <th>User Name</th>
                    <th style={{ width: "80px" }}>Score</th>
                    <th style={{ width: "180px" }}>Attempt Date</th>
                  </tr>
                </thead>
                <tbody>
                  {systemExamResults.map((result, index) => (
                    <tr key={`${result.attemptId}-${index}`}>
                      <td className="align-middle">
                        <Badge bg="secondary">#{result.attemptId}</Badge>
                      </td>
                      <td className="align-middle">
                        <Badge bg="primary">#{result.quizId}</Badge>
                      </td>
                      <td className="align-middle">
                        <strong>{result.quizTitle}</strong>
                        <br />
                        <small className="text-muted">{result.courseName}</small>
                      </td>
                      <td className="align-middle text-center">
                        {result.userId}
                      </td>
                      <td className="align-middle">
                        <strong>{result.userName}</strong>
                      </td>
                      <td className="align-middle text-center">
                        <Badge bg={result.score >= 50 ? "success" : "danger"}>
                          {result.score}
                        </Badge>
                      </td>
                      <td className="align-middle">
                        <small>
                          {new Date(result.attemptDate).toLocaleString('vi-VN')}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <Alert variant="info" className="text-center">
              <BarChart3 size={48} className="text-muted mb-3" />
              <p className="mb-0">Chưa có kết quả system exam nào</p>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowResultsModal(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ExamManagement;