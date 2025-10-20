import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaBook, FaExclamationTriangle } from "react-icons/fa";
import { getFlashcardSets } from "../../middleware/flashcardAPI";
import { useNavigate } from "react-router-dom";
import "./FlashcardList.scss";

const FlashcardList = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // Hiện thông báo toast
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };

  // Lấy danh sách flashcard sets
  useEffect(() => {
    const fetchSets = async () => {
      try {
        setError(null);
        showToast("Đang tải danh sách flashcard...", "info");

        const data = await getFlashcardSets();
        // Đảm bảo sets luôn là mảng
        setSets(Array.isArray(data) ? data : []);

        if (!Array.isArray(data) || data.length === 0) {
          showToast("Không có bộ flashcard nào.", "info");
        } else {
          showToast(`Đã tải ${data.length} bộ flashcard`, "success");
        }
      } catch (err) {
        console.error("Error fetching flashcard sets:", err);
        const errorMsg = err.response?.data?.message || err.message || "Không thể tải danh sách flashcard.";
        setError(errorMsg);
        showToast(errorMsg, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  const handleViewFlashcards = (setId, title) => {
    showToast(`Đang mở bộ flashcard: ${title}`, "info");
    navigate(`/flashcards/${setId}`);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <Container className="flashcard-list-page text-center my-5">
        <Spinner animation="border" role="status" />
        <p>Đang tải các bộ flashcard...</p>
      </Container>
    );
  }

  if (error && sets.length === 0) {
    return (
      <Container className="flashcard-list-page text-center my-5">
        <FaExclamationTriangle size={50} className="mb-3 text-danger" />
        <p>{error}</p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="outline-primary" onClick={handleRetry}>
            Thử lại
          </Button>
          <Button variant="primary" onClick={() => navigate("/home")}>
            Về trang chủ
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="flashcard-list-page">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <strong>{toast.message}</strong>
        </div>
      )}

      <Container>
        <Button variant="link" onClick={() => navigate("/home")} className="my-3">
          <FaArrowLeft className="me-2" /> Quay lại trang chủ
        </Button>

        <h1 className="mb-3">📚 Bộ Flashcard</h1>

        {sets.length === 0 ? (
          <div className="text-center my-5">
            <FaBook size={50} className="mb-3" />
            <p>Không có bộ flashcard nào.</p>
            <Button variant="primary" onClick={() => navigate("/home")}>
              Quay về trang chủ
            </Button>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {sets.map((set) => (
              <Col key={set.setID}>
                <div className="card h-100 p-3">
                  <h5>{set.title || "Bộ Flashcard"}</h5>
                  <p>{set.description || "Bộ flashcard học từ vựng tiếng Anh chất lượng cao."}</p>
                  <Button onClick={() => handleViewFlashcards(set.setID, set.title)}>
                    <FaBook className="me-1" /> Học ngay
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default FlashcardList;
