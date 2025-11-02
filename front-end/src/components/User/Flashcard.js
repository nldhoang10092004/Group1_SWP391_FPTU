import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import { Container, Button, Spinner, Toast, ToastContainer } from "react-bootstrap";
import { FaArrowLeft, FaArrowRight, FaVolumeUp, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { getFlashcardSetById } from "../../middleware/flashcardAPI";
import "./Flashcard.scss";

const Flashcard = () => {
    const { setId } = useParams();
    const [flashcardSet, setFlashcardSet] = useState({ title: "", items: [] });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "info" });
    const navigate = useNavigate();

    const words = useMemo(() => {
        if (!flashcardSet.items) return [];
        return flashcardSet.items.map(item => ({
            id: item.id,
            word: item.frontText,
            meaning: item.backText,
            phonetic: item.example || "",
        }));
    }, [flashcardSet.items]);

    useEffect(() => {
        const fetchFlashcards = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getFlashcardSetById(setId);
                if (data && data.items) {
                    setFlashcardSet({ title: data.title, items: data.items });
                } else {
                    setFlashcardSet({ title: "Không tìm thấy", items: [] });
                    showToast("Bộ flashcard này trống hoặc không tồn tại.", "warning");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || "Không thể tải flashcard.";
                setError(errorMsg);
                showToast(errorMsg, "error");
            } finally {
                setLoading(false);
            }
        };
        fetchFlashcards();
    }, [setId]);

    const showToast = (message, type = "info") => {
        setToast({ show: true, message, type });
    };

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev + 1) % words.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev === 0 ? words.length - 1 : prev - 1));
    };

    const speakWord = (text, e) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            speechSynthesis.speak(utterance);
        } else {
            showToast("Trình duyệt không hỗ trợ phát âm.", "warning");
        }
    };

    const handleCardClick = () => {
        setIsFlipped(!isFlipped);
    };

    const currentWord = words[currentIndex];
    const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

    if (loading) {
        return (
            <div className="flashcard-page-loading">
                <Spinner animation="border" variant="primary" />
                <p>Đang tải bộ flashcard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flashcard-page-error">
                <FaExclamationTriangle size={50} className="mb-3 text-danger" />
                <h4>Lỗi Tải Dữ Liệu</h4>
                <p>{error}</p>
                <Button variant="primary" onClick={() => navigate("/flashcard")}>
                    <FaArrowLeft className="me-2" />
                    Quay về danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="flashcard-learn-page">
            <ToastContainer position="top-end" className="p-3">
                <Toast onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={3000} autohide bg={toast.type}>
                    <Toast.Header>
                        <strong className="me-auto">Thông báo</strong>
                    </Toast.Header>
                    <Toast.Body>{toast.message}</Toast.Body>
                </Toast>
            </ToastContainer>

            <header className="flashcard-learn-header">
                <h1 className="set-title">{flashcardSet.title}</h1>
                <button onClick={() => navigate("/flashcard")} className="close-button">
                    <FaTimes />
                </button>
            </header>

            <Container className="flashcard-learn-container">
                <div className="progress-section">
                    <p className="progress-text">Tiến độ: {currentIndex + 1} / {words.length}</p>
                    <div className="progress-bar-background">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {words.length > 0 ? (
                    <div className="main-card-area">
                        <button onClick={handlePrev} className="nav-arrow-button prev" disabled={words.length === 0}>
                            <FaArrowLeft />
                        </button>
                        <div className="flashcard-scene">
                            <div className={`flashcard-item ${isFlipped ? 'is-flipped' : ''}`} onClick={handleCardClick}>
                                <div className="flashcard-face flashcard-front">
                                    <div className="flashcard-content">
                                        <div className="word">{currentWord.word}</div>
                                        <div className="phonetic">{currentWord.phonetic}</div>
                                        <button className="speak-button" onClick={(e) => speakWord(currentWord.word, e)}>
                                            <FaVolumeUp />
                                        </button>
                                    </div>
                                </div>
                                <div className="flashcard-face flashcard-back">
                                    <div className="flashcard-content">
                                        <div className="meaning">{currentWord.meaning}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleNext} className="nav-arrow-button next" disabled={words.length === 0}>
                            <FaArrowRight />
                        </button>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>Bộ flashcard này không có thẻ nào.</p>
                    </div>
                )}

                <div className="navigation-controls" style={{ display: 'none' }}>
                    <Button onClick={handlePrev} disabled={words.length === 0}>
                        <FaArrowLeft />
                        <span>Thẻ trước</span>
                    </Button>
                    <Button onClick={handleNext} disabled={words.length === 0}>
                        <span>Thẻ sau</span>
                        <FaArrowRight />
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default Flashcard;