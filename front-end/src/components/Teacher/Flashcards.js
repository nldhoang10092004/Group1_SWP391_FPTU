import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const Flashcards = () => {
  const flashcards = [
    {
      id: 1,
      course: "English Foundation",
      question: 'How do you say "Xin chào" in English?',
      answer: "Hello"
    },
    {
      id: 2,
      course: "English Foundation",
      question: 'What is the past tense of "go"?',
      answer: "Went"
    }
  ];

  return (
    <div className="tab-content">
      <Row className="mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <h5>Flashcards</h5>
          <button className="btn btn-dark">+ Tạo Flashcard</button>
        </Col>
      </Row>

      <Row>
        {flashcards.map((card) => (
          <Col md={6} key={card.id} className="mb-3">
            <Card className="flashcard">
              <Card.Body>
                <div className="course-badge mb-2">
                  <Badge bg="light" text="dark">{card.course}</Badge>
                </div>
                <div className="flashcard-content">
                  <div className="flashcard-question">
                    <strong>Câu hỏi:</strong>
                    <p>{card.question}</p>
                  </div>
                  <div className="flashcard-answer">
                    <strong>Đáp án:</strong>
                    <p>{card.answer}</p>
                  </div>
                </div>
                <div className="flashcard-actions mt-3">
                  <button className="btn btn-sm btn-outline-dark me-1">✏️</button>
                  <button className="btn btn-sm btn-outline-danger">🗑️</button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Flashcards;