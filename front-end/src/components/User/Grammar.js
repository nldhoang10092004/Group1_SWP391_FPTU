import React, { useState } from 'react';
import './Grammar.scss'; 
import { useNavigate } from "react-router-dom";

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
  const [selectedOption, setSelectedOption] = useState(null);
  const [completedQuestions, setCompletedQuestions] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = questionsData[currentQuestionIndex];
  const totalQuestions = questionsData.length;

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (selectedOption === currentQuestion.correctAnswer) {
      setCompletedQuestions(completedQuestions + 1);
    }
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedOption(null);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Có thể hiển thị một thông báo hoàn thành hoặc chuyển hướng
      alert('Bạn đã hoàn thành tất cả các câu hỏi!');
    }
  };

    const handleClose = () => {
    navigate("/home");
  };
  const progressPercentage = (completedQuestions / totalQuestions) * 100;

  return (
    <div className="grammar-container">
      <div className="grammar-header">
        <h1>Luyện Grammar</h1>
        <button className="close-button" onClick={handleClose}>×</button>
      </div>

      <div className="progress-section">
        <p>Câu {currentQuestionIndex + 1} / {totalQuestions}</p>
        <div className="progress-bar-background">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="completion-info">
          <span>{completedQuestions} / {totalQuestions} câu hoàn thành</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      <div className="grammar-content">
        <div className="question-card">
          <div className="card-header">
            <span className="icon">📖</span>
            <span className="title">Present Simple Tense</span>
            <span className="difficulty">Dễ</span>
            <span className="tag">Tenses</span>
          </div>
          <p className="description">
            Luyện tập về thì hiện tại đơn với các động từ thường và động từ 'be'
          </p>

          <div className="question-body">
            <p className="question-text">Câu {currentQuestion.id}: {currentQuestion.question}</p>
            <div className="options">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`option-item ${selectedOption === option ? 'selected' : ''} ${showResult && option === currentQuestion.correctAnswer ? 'correct' : ''} ${showResult && selectedOption === option && selectedOption !== currentQuestion.correctAnswer ? 'incorrect' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
            <button
              className="check-button"
              onClick={showResult ? handleNextQuestion : handleSubmit}
              disabled={selectedOption === null && !showResult}
            >
              {showResult ? 'Câu tiếp theo' : 'Kiểm tra'}
            </button>
          </div>
        </div>

        <div className="progress-sidebar">
          <h3>Tiến độ bài tập</h3>
          <ul>
            {['Present Simple Tense', 'Past Simple Tense'].map((tense, index) => (
              <li key={index} className={currentQuestion.tense === tense ? 'active-tense' : ''}>
                <span className="dot"></span>
                {tense}
                <span className="question-count">{questionsData.filter(q => q.tense === tense).length} câu</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button className="chat-icon">💬</button>
    </div>
  );
};

export default Grammar;