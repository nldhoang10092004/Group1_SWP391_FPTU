import React, { useEffect, useState } from "react";
import { Container, Spinner, Card } from "react-bootstrap";
import { FaArrowLeft, FaBook, FaExclamationTriangle } from "react-icons/fa";
import { getFlashcardSets } from "../../middleware/flashcardAPI";
import { useNavigate } from "react-router-dom";
import "./FlashcardList.scss";

const FlashcardList = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFlashcardSets();
        // API returns an object with a 'data' property which is the array
        const flashcardData = data.data || data;
        setSets(Array.isArray(flashcardData) ? flashcardData : []);
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Không thể tải danh sách flashcard.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, []);

  const handleViewFlashcards = (setId) => {
    navigate(`/flashcard/${setId}`);
  };

  const getCardCount = (set) => {
    if (set.items && Array.isArray(set.items)) {
      return set.items.length;
    }
    return set.itemCount || 0;
  };

  if (loading) {
    return (
      <div className="flashcard-list-page">
        <Container className="loading-container">
          <Spinner animation="border" variant="primary" />
          <p>Đang tải các bộ flashcard...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-list-page">
        <Container className="empty-state">
          <FaExclamationTriangle className="empty-icon text-danger" />
          <h4>Lỗi Tải Dữ Liệu</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/home")}>
            <FaArrowLeft className="me-2" />
            Về trang chủ
          </button>
        </Container>
      </div>
    );
  }

  return (
    <div className="flashcard-list-page">
      <Container>
        <button onClick={() => navigate("/home")} className="back-button">
          <FaArrowLeft />
          <span>Quay lại</span>
        </button>

        <header className="page-header">
          <h1>Bộ sưu tập Flashcard</h1>
          <p className="page-subtitle">
            Chọn một bộ flashcard để bắt đầu học từ vựng và củng cố kiến thức của bạn.
          </p>
        </header>

        {sets.length === 0 ? (
          <div className="empty-state">
            <FaBook className="empty-icon" />
            <p>Chưa có bộ flashcard nào được tạo.</p>
          </div>
        ) : (
          <div className="sets-grid">
            {sets.map((set) => (
              <Card key={set.setID} className="set-card" onClick={() => handleViewFlashcards(set.setID)}>
                <Card.Body>
                  <div className="card-icon-wrapper">
                    <FaBook />
                  </div>
                  <Card.Title>{set.title || "Bộ Flashcard Chưa Có Tên"}</Card.Title>
                  <Card.Text>
                    {set.description || "Bộ flashcard học từ vựng tiếng Anh."}
                  </Card.Text>
                  <div className="card-footer-info">
                    <span>{getCardCount(set)} thẻ</span>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default FlashcardList;
