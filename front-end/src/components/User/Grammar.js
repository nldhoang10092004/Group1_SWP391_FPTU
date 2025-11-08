import React, { useState } from 'react';
import './Grammar.scss';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';

const questionsData = [
  {
    id: 1,
    tense: 'Present Simple Tense',
    question: 'She ___ to school every day.',
    options: ['go', 'goes', 'going', 'gone'],
    correctAnswer: 'goes',
  },
  {
    id: 2,
    tense: 'Present Simple Tense',
    question: 'They ___ football on Sundays.',
    options: ['play', 'plays', 'playing', 'played'],
    correctAnswer: 'play',
  },
  {
    id: 3,
    tense: 'Present Simple Tense',
    question: 'He ___ a doctor.',
    options: ['is', 'am', 'are', 'be'],
    correctAnswer: 'is',
  },
  {
    id: 4,
    tense: 'Past Simple Tense',
    question: 'I ___ to the cinema yesterday.',
    options: ['go', 'goes', 'went', 'gone'],
    correctAnswer: 'went',
  },
  {
    id: 5,
    tense: 'Past Simple Tense',
    question: 'They ___ a lot of fun at the party.',
    options: ['have', 'has', 'had', 'having'],
    correctAnswer: 'had',
  },
  {
    id: 6,
    tense: 'Past Simple Tense',
    question: 'She ___ happy with the result.',
    options: ['is', 'am', 'was', 'were'],
    correctAnswer: 'was',
  },
];

const Grammar = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  const currentQuestion = questionsData[currentQuestionIndex];
  const totalQuestions = questionsData.length;

  const handleOptionSelect = (option) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleSubmit = () => {
    let finalScore = 0;
    questionsData.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setIsSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleClose = () => {
    navigate('/home');
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const progressPercentage = (Object.keys(answers).length / totalQuestions) * 100;
  const selectedOption = answers[currentQuestion.id];

  if (isSubmitted) {
    return (
      <div className="grammar-container">
        <Modal show={true} centered backdrop="static">
          <Modal.Header>
            <Modal.Title>Kết quả bài làm</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <h2>
              Điểm của bạn: {score} / {totalQuestions}
            </h2>
            <p>
              Bạn đã hoàn thành bài luyện tập. Hãy xem lại các câu hỏi để rút
              kinh nghiệm nhé.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Về trang chủ
            </Button>
            <Button variant="primary" onClick={handleRestart}>
              Làm lại
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  return (
    <div className="grammar-container">
      <div className="grammar-header">
        <h1>Luyện Grammar</h1>
        <button className="close-button" onClick={handleClose}>×</button>
      </div>

      <div className="grammar-content">
        <div className="question-card">
          <div className="card-header">
            <span className="title">{currentQuestion.tense}</span>
            <span className="difficulty">Dễ</span>
            <span className="tag">Tenses</span>
          </div>

          <div className="question-body">
            <p className="question-text">
              Câu {currentQuestionIndex + 1}: {currentQuestion.question}
            </p>
            <div className="options">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`option-item ${
                    selectedOption === option ? 'selected' : ''
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
            <div className="navigation-buttons">
              <button
                className="nav-button"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Câu trước
              </button>
              {currentQuestionIndex < totalQuestions - 1 && (
                <button
                  className="nav-button"
                  onClick={handleNextQuestion}
                  disabled={selectedOption === undefined}
                >
                  Câu tiếp theo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="progress-sidebar">
          <h3>Tiến độ bài tập</h3>
          
          <div className="progress-overview">
            <p>
              Câu {currentQuestionIndex + 1} / {totalQuestions}
            </p>
            <div className="progress-bar-background">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="completion-info">
              <span>
                Đã trả lời {Object.keys(answers).length} / {totalQuestions} câu
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
          </div>

          <ul>
            {['Present Simple Tense', 'Past Simple Tense'].map((tense, index) => (
              <li key={index} className={currentQuestion.tense === tense ? 'active-tense' : ''}>
                <span className="dot"></span>
                {tense}
                <span className="question-count">{questionsData.filter(q => q.tense === tense).length} câu</span>
              </li>
            ))}
          </ul>

          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== totalQuestions}
          >
            Nộp bài
          </button>
        </div>
      </div>
      <button className="chat-icon">💬</button>
    </div>
  );
};

export default Grammar;