import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spinner, Form, Alert, Container, Badge, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheckCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { getQuizById, startQuiz, submitQuiz } from "../../middleware/QuizAPI";
import "./StartQuiz.scss";

const StartQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [groups, setGroups] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 5000);
  };

  const renderAsset = (asset, idx) => {
    if (!asset) return null;
    const style = { maxWidth: "100%", marginBottom: "10px", borderRadius: "8px" };

    switch (asset.assetType) {
      case 1:
        return (
          <div key={idx} className="mb-2">
            <audio controls src={asset.url} style={style} className="w-100" />
            {asset.caption && <small className="text-muted d-block mt-1">{asset.caption}</small>}
          </div>
        );
      case 2:
        return (
          <div key={idx} className="mb-2">
            <img src={asset.url} alt={asset.caption || "Image"} style={style} className="img-fluid" />
            {asset.caption && <small className="text-muted d-block mt-1">{asset.caption}</small>}
          </div>
        );
      case 3:
        return (
          <div key={idx} className="mb-3 p-3 bg-light rounded">
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{asset.contentText}</p>
          </div>
        );
      case 5:
        return (
          <div key={idx} className="mb-2">
            <video controls src={asset.url} style={style} className="w-100" />
            {asset.caption && <small className="text-muted d-block mt-1">{asset.caption}</small>}
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await getQuizById(quizId);
        let parsedGroups = [];

        if (data.groups && Array.isArray(data.groups) && data.groups.length > 0) {
          parsedGroups = data.groups.map(group => ({
            groupOrder: group.groupOrder || 1,
            instruction: group.instruction || "",
            assets: group.assets || [],
            questions: (group.questions || []).map(q => ({
              ...q,
              questionID: q.questionID || q.id,
              options: (q.options || []).map(opt => ({
                ...opt,
                optionID: opt.optionID || opt.id
              }))
            }))
          }));
        }

        if (parsedGroups.length === 0 && data.questions && data.questions.length > 0) {
          parsedGroups = [{
            groupOrder: 1,
            instruction: "Trả lời các câu hỏi sau",
            assets: [],
            questions: data.questions.map(q => ({
              ...q,
              questionID: q.questionID || q.id,
              options: (q.options || []).map(opt => ({
                ...opt,
                optionID: opt.optionID || opt.id
              }))
            }))
          }];
        }

        setQuiz(data);
        setGroups(parsedGroups);
        const attempt = await startQuiz(quizId);
        setAttemptId(attempt.attemptId || attempt.attemptID);
        showToast("Quiz đã sẵn sàng! Hãy bắt đầu làm bài.", "success");
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Không thể tải quiz. Vui lòng thử lại sau!";
        setError(errorMsg);
        showToast(errorMsg, "error");
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!attemptId) {
      showToast("Không tìm thấy attempt ID, vui lòng tải lại trang!", "error");
      return;
    }

    const allQuestions = groups.flatMap(g => g.questions);
    const unanswered = allQuestions.filter(q => !answers[q.questionID]);

    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(`Bạn còn ${unanswered.length} câu chưa trả lời. Bạn có muốn nộp bài không?`);
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      const formatted = Object.entries(answers).map(([q, o]) => ({
        QuestionID: Number(q),
        OptionID: Number(o)
      }));
      const result = await submitQuiz(attemptId, formatted);
      const finalScore = result.totalScore ?? result.autoScore ?? 0;
      setScore(finalScore);
      setSubmitted(true);
      showToast(`Chúc mừng! Bạn đạt ${finalScore} điểm.`, "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Gửi bài thất bại.";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => window.location.reload();
  const handleBackToList = () => navigate(-1);
  const getTotalQuestions = () => groups.reduce((sum, g) => sum + (g.questions?.length || 0), 0);

  if (loading)
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Đang tải quiz...</p>
      </Container>
    );

  if (!quiz && error)
    return (
      <Container>
        <Button variant="link" onClick={() => navigate("/")} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách quiz
        </Button>
        <Alert variant="danger" className="mt-3">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
      </Container>
    );

  return (
    <div className="start-quiz-page">
      <Container>
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

        <Button variant="link" onClick={handleBackToList} className="mb-3">
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách quiz
        </Button>

        <h1 className="quiz-title mb-3">{quiz.title || "Quiz không có tiêu đề"}</h1>
        {quiz.description && <p className="quiz-description">{quiz.description}</p>}
        <Badge bg="info" className="me-2">{groups.length} phần</Badge>
        <Badge bg="secondary">{getTotalQuestions()} câu hỏi</Badge>

        {groups.length > 0 ? (
          groups.map((group, groupIdx) => (
            <Card key={groupIdx} className="mt-4 p-3 shadow-sm quiz-section">
              <Row>
                {/* CỘT TRÁI - HƯỚNG DẪN VÀ TÀI LIỆU */}
                <Col md={6}>
                  <div className="question-instruction">
                    <h5 className="text-primary mb-3">
                      Phần {groupIdx + 1}
                      <Badge bg="light" text="dark" className="ms-2">
                        {group.questions.length} câu
                      </Badge>
                    </h5>
                    {group.instruction && (
                      <div className="mb-3">
                        <strong>Hướng dẫn:</strong>
                        <p className="mt-2">{group.instruction}</p>
                      </div>
                    )}
                    {group.assets?.length > 0 &&
                      group.assets.map((asset, idx) => renderAsset(asset, idx))}
                  </div>
                </Col>

                {/* CỘT PHẢI - DANH SÁCH CÂU HỎI */}
                <Col md={6}>
                  <div className="questions-container">
                    {group.questions?.map((question, qIdx) => {
                      const qid = question.questionID;
                      return (
                        <Card key={qid} className="mb-3">
                          <Card.Body>
                            <div className="mb-3">
                              <Badge bg="primary" className="me-2">Câu {qIdx + 1}</Badge>
                              <span className="fw-bold">{question.content}</span>
                            </div>
                            {question.assets?.length > 0 &&
                              question.assets.map((asset, idx) => renderAsset(asset, idx))}
                            {question.options?.length > 0 ? (
                              question.options.map(opt => (
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
                              ))
                            ) : (
                              <Alert variant="warning">⚠ Không có lựa chọn nào cho câu hỏi này.</Alert>
                            )}
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                </Col>
              </Row>
            </Card>
          ))
        ) : (
          <Alert variant="warning" className="mt-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Quiz này chưa có câu hỏi nào.
          </Alert>
        )}

        {!submitted ? (
          <div className="text-center mt-4 mb-5">
            <Button
              onClick={handleSubmit}
              variant="primary"
              size="lg"
              disabled={submitting || getTotalQuestions() === 0}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" /> Đang nộp bài...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" /> Nộp bài
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center mt-5 mb-5">
            <Alert variant="success" className="py-4">
              <FontAwesomeIcon icon={faCheckCircle} size="3x" className="mb-3 text-success" />
              <h3>Chúc mừng bạn đã hoàn thành!</h3>
              <h1 className="fw-bold text-success">{score}/100 điểm</h1>
            </Alert>
            <Button variant="outline-primary" onClick={handleRetry} className="me-3">
              Làm lại quiz
            </Button>
            <Button variant="primary" onClick={handleBackToList}>
              Quay lại danh sách quiz
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default StartQuiz;
