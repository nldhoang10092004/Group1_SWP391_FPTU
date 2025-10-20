import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Container, Button, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaVolumeUp, FaExclamationTriangle } from "react-icons/fa";
import { getFlashcardSetById } from "../../middleware/flashcardAPI";
import "./Flashcard.scss";

const Flashcard = () => {
  const { setId } = useParams();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // Show toast notification
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        setError(null);
        showToast("Đang tải flashcard...", "info");

        const data = await getFlashcardSetById(setId);
        
        if (data && data.items && data.items.length > 0) {
          const formatted = data.items.map((item) => ({
            word: item.frontText,
            meaning: item.backText,
            phonetic: item.example || "",
            level: item.level || "Trung bình",
          }));
          setWords(formatted);
          showToast(`Đã tải ${formatted.length} thẻ flashcard`, "success");
        } else {
          setWords([]);
          showToast("Bộ flashcard trống", "warning");
        }
      } catch (err) {
        console.error("❌ Lỗi load flashcards:", err);
        const errorMsg = err.response?.data?.message || "Không thể tải flashcard. Vui lòng thử lại sau.";
        setError(errorMsg);
        showToast(errorMsg, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [setId]);

  const handleNext = () => {
    setShowMeaning(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    showToast("Đã chuyển đến thẻ tiếp theo", "info");
  };

  const handlePrev = () => {
    setShowMeaning(false);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? words.length - 1 : prevIndex - 1
    );
    showToast("Đã quay lại thẻ trước", "info");
  };

  const speakWord = (text) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
        }
        
        speechSynthesis.speak(utterance);
        showToast(`Đang phát âm: ${text}`, "success");
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          showToast("Lỗi phát âm. Vui lòng thử lại!", "error");
        };
      } else {
        showToast("Trình duyệt không hỗ trợ phát âm", "error");
      }
    } catch (error) {
      console.error('Error speaking word:', error);
      showToast("Lỗi khi phát âm từ", "error");
    }
  };

  const handleClose = () => {
    showToast("Đang quay về trang chủ...", "info");
    setTimeout(() => {
      navigate("/flashcards");
    }, 1000);
  };

  const handleCardClick = () => {
    setShowMeaning(!showMeaning);
    if (!showMeaning) {
      showToast("Đã hiển thị nghĩa của từ", "success");
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flashcard-container">
        <Container>
          <div className="loading-container">
            <Spinner animation="border" role="status" />
            <p>Đang tải flashcards...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-container">
        <Container>
          <Button 
            variant="link" 
            onClick={() => navigate("/flashcards")} 
            className="back-button"
          >
            <FaArrowLeft className="me-2" />
            Quay lại danh sách
          </Button>
          
          <div className="empty-state">
            <FaExclamationTriangle className="empty-icon" />
            <p>{error}</p>
            <div className="d-flex gap-2 justify-content-center">
              <Button variant="outline-primary" onClick={handleRetry}>
                Thử lại
              </Button>
              <Button variant="primary" onClick={() => navigate("/flashcards")}>
                Về danh sách
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!words.length) {
    return (
      <div className="flashcard-container">
        <Container>
          <Button 
            variant="link" 
            onClick={() => navigate("/flashcards")} 
            className="back-button"
          >
            <FaArrowLeft className="me-2" />
            Quay lại danh sách
          </Button>
          
          <div className="empty-state">
            <p>Không có flashcards để hiển thị.</p>
            <Button variant="primary" onClick={() => navigate("/flashcards")}>
              Quay về danh sách
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const totalWords = words.length;
  const progressPercentage = ((currentIndex + 1) / totalWords) * 100;

  return (
    <div className="flashcard-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-notification">
          <div className={`toast ${toast.type}`}>
            <div className="toast-header">
              <strong className="toast-title me-auto">
                {toast.type === "success" ? "✅ Thành công" : 
                 toast.type === "error" ? "❌ Lỗi" : 
                 toast.type === "warning" ? "⚠️ Cảnh báo" : "ℹ️ Thông báo"}
              </strong>
              <button 
                className="btn-close"
                onClick={() => setToast({ show: false, message: "", type: "" })}
              >
                ×
              </button>
            </div>
            <div className="toast-body">
              {toast.message}
            </div>
          </div>
        </div>
      )}

      <Container>
        {/* Header */}
        <div className="flashcard-header">
          <h1>Luyện từ vựng</h1>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <p>Thẻ {currentIndex + 1} / {totalWords}</p>
          <div className="progress-bar-background">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="completion-info">
            <span>Đã hoàn thành {currentIndex + 1} / {totalWords}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>

        {/* Flashcard Content */}
        <div className="flashcard-content">
          <div className="word-card" onClick={handleCardClick}>
            <span className="word-level">{currentWord.level}</span>
            <h2 className="word-text">{currentWord.word}</h2>
            <p className="word-phonetic">{currentWord.phonetic}</p>
            {showMeaning && (
              <p className="word-meaning">{currentWord.meaning}</p>
            )}
            <button
              className="pronounce-button"
              onClick={(e) => {
                e.stopPropagation();
                speakWord(currentWord.word);
              }}
            >
              <FaVolumeUp className="me-2" />
              Phát âm
            </button>
          </div>

          <div className="navigation-buttons">
            <button className="nav-button secondary" onClick={handlePrev}>
              ⬅ Trước
            </button>
            <button className="nav-button primary" onClick={handleNext}>
              Tiếp ➡
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Flashcard;