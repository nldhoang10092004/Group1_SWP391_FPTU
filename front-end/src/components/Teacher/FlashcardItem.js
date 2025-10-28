import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  getFlashcardSetById,
  createFlashcardItem,
  updateFlashcardItem,
  deleteFlashcardItem,
} from "../../middleware/flashcardAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrashAlt,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const FlashcardItem = () => {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [setData, setSetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    frontText: "",
    backText: "",
    example: "",
  });

  const [alertMessage, setAlertMessage] = useState(null);

  // ===== LOAD FLASHCARD SET =====
  useEffect(() => {
    const fetchSet = async () => {
      try {
        setLoading(true);
        const data = await getFlashcardSetById(setId);
        setSetData(data);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu flashcard");
      } finally {
        setLoading(false);
      }
    };
    fetchSet();
  }, [setId]);

  // ===== HANDLE FORM =====
  const handleShowAdd = () => {
    setModalMode("add");
    setFormData({ frontText: "", backText: "", example: "" });
    setShowModal(true);
  };

  const handleShowEdit = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({
      frontText: item.frontText || "",
      backText: item.backText || "",
      example: item.example || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        await createFlashcardItem({
          ...formData,
          setID: parseInt(setId),
        });
        setAlertMessage("✅ Đã thêm thẻ thành công!");
      } else {
        await updateFlashcardItem(selectedItem.itemID, formData);
        setAlertMessage("✅ Đã cập nhật thẻ thành công!");
      }

      const updatedSet = await getFlashcardSetById(setId);
      setSetData(updatedSet);
      setShowModal(false);
    } catch (err) {
      setAlertMessage(`❌ Lỗi: ${err.response?.data || err.message}`);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thẻ này không?")) return;
    try {
      await deleteFlashcardItem(itemId);
      setAlertMessage("🗑️ Đã xóa thẻ thành công!");
      const updatedSet = await getFlashcardSetById(setId);
      setSetData(updatedSet);
    } catch (err) {
      setAlertMessage(`❌ Lỗi khi xóa: ${err.response?.data || err.message}`);
    }
  };

  // ===== RENDER =====
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </Button>
        <h4 className="mb-0">{setData?.title || "Flashcard Set"}</h4>
        <Button variant="primary" onClick={handleShowAdd}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Thêm thẻ mới
        </Button>
      </div>

      {alertMessage && (
        <Alert
          variant={alertMessage.includes("✅") ? "success" : "danger"}
          onClose={() => setAlertMessage(null)}
          dismissible
        >
          {alertMessage}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : !setData?.items || setData.items.length === 0 ? (
        <p>Chưa có thẻ nào trong bộ này.</p>
      ) : (
        <Row>
          {setData.items.map((item) => (
            <Col md={6} lg={4} key={item.itemID} className="mb-3">
              <Card className="shadow-sm h-100 border-0 rounded-3">
                <Card.Body>
                  <h6 className="fw-bold text-primary">
                    {item.frontText || "(Chưa có từ)"}
                  </h6>
                  <p className="text-muted mb-1">{item.backText}</p>
                  {item.example && (
                    <p className="fst-italic text-secondary small">
                      💡 {item.example}
                    </p>
                  )}
                  <div className="d-flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleShowEdit(item)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(item.itemID)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} /> Xóa
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ===== MODAL ===== */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "Thêm thẻ mới" : "Chỉnh sửa thẻ"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Từ / Câu hỏi (Front)</Form.Label>
              <Form.Control
                type="text"
                value={formData.frontText}
                onChange={(e) =>
                  setFormData({ ...formData, frontText: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Đáp án / Giải nghĩa (Back)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.backText}
                onChange={(e) =>
                  setFormData({ ...formData, backText: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ví dụ (Example)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.example}
                onChange={(e) =>
                  setFormData({ ...formData, example: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {modalMode === "add" ? "Thêm" : "Cập nhật"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default FlashcardItem;
