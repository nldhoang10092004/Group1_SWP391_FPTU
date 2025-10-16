import React from "react";
import { Row, Col, Table, Badge } from "react-bootstrap";

const Quiz = () => {
  const quizzes = [
    {
      id: 1,
      title: "Basic Grammar Quiz",
      course: "English Foundation",
      questions: 15,
      duration: "20 phút",
      passingScore: "70%",
      status: "published"
    }
  ];

  const getStatusVariant = (status) => {
    return status === "published" ? "success" : "secondary";
  };

  return (
    <div className="tab-content">
      <Row className="mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <h5>Quizzes</h5>
          <button className="btn btn-dark">+ Tạo Quiz</button>
        </Col>
      </Row>

      <div className="table-container">
        <Table responsive hover className="custom-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Khóa học</th>
              <th>Số câu hỏi</th>
              <th>Thời gian</th>
              <th>Điểm đậu</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td>
                  <strong>{quiz.title}</strong>
                </td>
                <td>{quiz.course}</td>
                <td>{quiz.questions}</td>
                <td>{quiz.duration}</td>
                <td>{quiz.passingScore}</td>
                <td>
                  <Badge bg={getStatusVariant(quiz.status)}>
                    {quiz.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                  </Badge>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-dark me-1">✏️</button>
                  <button className="btn btn-sm btn-outline-danger">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Quiz;