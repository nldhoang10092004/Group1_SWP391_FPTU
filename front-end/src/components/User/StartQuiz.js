import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spinner, Form, Alert, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheckCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { getQuizById, startQuiz, submitQuiz } from "../../middleware/QuizAPI";
import "./StartQuiz.scss";

const StartQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Show toast notification
  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 5000);
  };

  // Fetch quiz and start attempt
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log("📘 Fetching quiz with ID:", quizId);
        const data = await getQuizById(quizId);
        console.log("✅ Quiz data received:", data);

        // Merge all questions from groups
        const allQuestions = data.groups?.flatMap((g) => g.questions || []) || [];
        
        // Chuẩn hóa format questionID
        const normalizedQuestions = allQuestions.map(q => ({
          ...q,
          questionID: q.questionID || q.id,
          options: q.options?.map(opt => ({
            ...opt,
            optionID: opt.optionID || opt.id
          })) || []
        }));

        setQuiz({ 
          ...data, 
          questions: normalizedQuestions,
          quizID: data.quizID || data.id
        });

        // Start quiz attempt
        const attempt = await startQuiz(quizId);
        console.log("🎯 Attempt started:", attempt);
        setAttemptId(attempt.attemptId || attempt.attemptID);
        
        showToast("Quiz đã sẵn sàng! Hãy bắt đầu làm bài.", "success");
      } catch (err) {
        console.error("❌ Error fetching quiz:", err);
        const errorMsg = err.response?.data?.message || err.message || "Không thể tải quiz. Vui lòng thử lại sau!";
        setError(errorMsg);
        showToast(errorMsg, "error");
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId]);

  // Handle answer selection
  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Handle quiz submission
  const handleSubmit = async () => {
    if (!attemptId) {
      const errorMsg = "Không tìm thấy attempt ID, vui lòng tải lại trang!";
      setError(errorMsg);
      showToast(errorMsg, "error");
      return;
    }

    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter(
      question => !answers[question.questionID]
    );

    if (unansweredQuestions.length > 0) {
      const warningMsg = `Bạn còn ${unansweredQuestions.length} câu hỏi chưa trả lời. Bạn có chắc muốn nộp bài?`;
      if (!window.confirm(warningMsg)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      // Format theo đúng backend: { Answers: [{ QuestionID, OptionID }] }
      const formattedAnswers = Object.entries(answers).map(([questionId, optionId]) => ({
        QuestionID: Number(questionId),
        OptionID: Number(optionId)
      }));

      console.log("📝 Submitting answers:", { Answers: formattedAnswers });

      const result = await submitQuiz(attemptId, formattedAnswers);
      console.log("✅ Submit result:", result);

      // Backend trả về totalScore hoặc autoScore
      const finalScore = result.totalScore ?? result.autoScore ?? 0;
      setScore(finalScore);
      setSubmitted(true);
      showToast(`Chúc mừng! Bạn đã hoàn thành bài quiz với ${finalScore} điểm.`, "success");
    } catch (err) {
      console.error("❌ Error submitting quiz:", err);
      const errorMsg = err.response?.data?.message || err.message || "Gửi bài thất bại. Vui lòng thử lại!";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Handle back to quiz list
  const handleBackToList = () => {
    navigate("/quiz");
  };

  // Loading state
  if (loading) {
    return (
      <div className="start-quiz-page">
        <Container>
          <div className="loading-container">
            <Spinner animation="border" role="status" />
            <p>Đang tải quiz...</p>
          </div>
        </Container>
      </div>
    );
  }

  // Error state
  if (!quiz && error) {
    return (
      <div className="start-quiz-page">
        <Container>
          <Button variant="link" onClick={() => navigate("/quiz")} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} />
            Quay lại danh sách quiz
          </Button>
          <div className="error-alert">
            <Alert variant="danger">
              <Alert.Heading>
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                Lỗi
              </Alert.Heading>
              <p>{error}</p>
              <div className="d-flex gap-2">
                <Button variant="outline-danger" onClick={handleRetry}>
                  Thử lại
                </Button>
                <Button variant="primary" onClick={handleBackToList}>
                  Quay lại danh sách
                </Button>
              </div>
            </Alert>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="start-quiz-page">
      <Container>
        {/* Toast Notification */}
        {toast.show && (
          <div className="toast-notification position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 9999 }}>
            <Alert 
              variant={toast.type === "success" ? "success" : "danger"}
              dismissible
              onClose={() => setToast({ show: false, message: "", type: "" })}
            >
              <strong>{toast.type === "success" ? "✅ Thành công" : "❌ Lỗi"}</strong>
              <p className="mb-0 mt-1">{toast.message}</p>
            </Alert>
          </div>
        )}

        {/* Back Button */}
        <Button 
          variant="link" 
          onClick={handleBackToList} 
          className="back-button"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Quay lại danh sách quiz
        </Button>

        {/* Quiz Header */}
        <div className="quiz-header">
          <h1 className="quiz-title">{quiz.title || "Quiz không có tiêu đề"}</h1>
          {quiz.description && <p className="quiz-description">{quiz.description}</p>}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="error-alert mb-4">
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {error}
            </Alert>
          </div>
        )}

        {/* Questions Section */}
        <div className="questions-container">
          {quiz?.questions?.length > 0 ? (
            quiz.questions.map((question, index) => {
              const qid = question.questionID;
              return (
                <Card key={qid} className="question-card mb-3">
                  <Card.Body>
                    <div className="question-title mb-3">
                      <span className="question-number fw-bold">Câu {index + 1}: </span>
                      <span>{question.content || "Không có nội dung"}</span>
                    </div>

                    {question.options?.length > 0 ? (
                      <div className="options-list">
                        {question.options.map((opt) => (
                          <Form.Check
                            key={opt.optionID}
                            type="radio"
                            id={`q_${qid}_opt_${opt.optionID}`}
                            label={opt.content}
                            name={`question_${qid}`}
                            value={opt.optionID}
                            checked={answers[qid] === opt.optionID}
                            onChange={() => handleAnswerChange(qid, opt.optionID)}
                            disabled={submitted}
                            className="mb-2"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="no-options-message">
                        <Alert variant="warning" className="mb-0">
                          ⚠ Không có lựa chọn nào cho câu hỏi này.
                        </Alert>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })
          ) : (
            <div className="no-questions-alert">
              <Alert variant="warning">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                Quiz này hiện chưa có câu hỏi nào.
              </Alert>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!submitted ? (
          <div className="action-buttons d-flex justify-content-center gap-3 mt-4">
            <Button 
              onClick={handleSubmit} 
              variant="primary" 
              size="lg"
              className="submit-button"
              disabled={submitting || quiz?.questions?.length === 0}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang nộp bài...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Nộp bài
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="results-section mt-4">
            <div className="score-alert">
              <Alert variant="success" className="text-center py-4">
                <FontAwesomeIcon icon={faCheckCircle} size="3x"  className="mb-3 text-success" />
                <h3 className="mb-3">Chúc mừng bạn đã hoàn thành!</h3>
                <div className="score-text display-4 fw-bold text-success mb-2" color= "white">
                  {score !== null ? `${score}/100 điểm` : 'Đang chấm...'}
                </div>
                <div className="total-questions text-muted">
                  Tổng số câu hỏi: {quiz.questions?.length || 0}
                </div>
              </Alert>
            </div>
            <div className="action-buttons d-flex justify-content-center gap-3">
              <Button variant="outline-primary" onClick={handleRetry}>
                Làm lại quiz
              </Button>
              <Button variant="primary" onClick={handleBackToList}>
                Quay lại danh sách quiz
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default StartQuiz;