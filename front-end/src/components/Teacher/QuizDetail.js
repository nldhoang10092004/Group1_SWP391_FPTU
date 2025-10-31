// src/pages/teacher/QuizDetail.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  ListGroup,
  Modal,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuizById,
  importQuizGroups,
  createQuiz,
  getFullQuizById,
} from "../../middleware/teacher/quizTeacherAPI";
import { uploadAsset } from "../../middleware/teacher/uploadAPI";

const QuizDetail = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [importJson, setImportJson] = useState("");
  const [uploading, setUploading] = useState(false);
const [courseId, setCourseId] = useState(null);
const navigate = useNavigate();

  // Popup lỗi
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchQuiz = async (id = quizId) => {
  try {
    setLoading(true);
    const data = await getFullQuizById(id, courseId);
    console.log("✅ Full quiz data:", data);
    setQuiz(data);
  } catch (err) {
    setError(err.response?.data?.message || err.message || "Lỗi tải quiz");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchQuiz();
}, [quizId, courseId]);

  // map assetType number sang string cho upload
  const getAssetTypeString = (type) => {
    switch (type) {
      case 1: return "audio";
      case 2: return "image";
      case 5: return "video";
      default: return "file";
    }
  };

  // import JSON -> tạo quiz mới hoặc import vào quiz hiện tại
  const handleImport = async () => {
    let parsed;
    try {
      parsed = JSON.parse(importJson);
    } catch (err) {
      setErrorMessage("❌ JSON không hợp lệ: " + err.message);
      setShowErrorModal(true);
      return;
    }

    if (!parsed.groups || !Array.isArray(parsed.groups)) {
      setErrorMessage("❌ JSON không có trường 'groups' hoặc không phải mảng");
      setShowErrorModal(true);
      return;
    }

    try {
      setUploading(true);

      let targetQuizId = quizId;

      // Nếu JSON có title -> tạo quiz mới
      if (parsed.title) {
        const createdQuiz = await createQuiz({ title: parsed.title });
        targetQuizId = createdQuiz.quizId; // fix key trả về từ BE
      }

      // Upload asset nếu có file
      for (const group of parsed.groups) {
        if (group.assets) {
          for (const asset of group.assets) {
            if (asset.file) {
              const url = await uploadAsset(asset.file, getAssetTypeString(asset.assetType));
              asset.url = url;
              delete asset.file;
            }
          }
        }

        if (group.questions) {
          for (const q of group.questions) {
            if (q.assets) {
              for (const asset of q.assets) {
                if (asset.file) {
                  const url = await uploadAsset(asset.file, getAssetTypeString(asset.assetType));
                  asset.url = url;
                  delete asset.file;
                }
              }
            }
          }
        }
      }

      // Import nhóm câu hỏi
      await importQuizGroups(targetQuizId, parsed);

      // Reload quiz sau import
      await fetchQuiz(targetQuizId);

      alert("✅ Import quiz thành công!");
      setImportJson(""); // reset textarea
    } catch (err) {
      console.error(err);
      setErrorMessage("❌ Lỗi import quiz: " + (err.response?.data?.message || err.message));
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải quiz...</p>
      </div>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="my-4">
      <h3 className="text-primary mb-4">{quiz.title}</h3>
      <Button variant="link" onClick={() => navigate("/teacher/dashboard")} className="p-0 mb-3">
                  ← Quay lại Dashboard
                </Button>

      {/* Quiz groups */}
      {quiz.groups && quiz.groups.length > 0 ? (
        quiz.groups.map((group, gIdx) => (
          <Card key={gIdx} className="mb-4 shadow-sm rounded-4">
            <Card.Body>
              <h5>Group {group.groupOrder || gIdx + 1} - Type {group.groupType}</h5>
              <p>{group.instruction}</p>

              {/* Assets */}
              {group.assets && group.assets.map((asset, idx) => (
                <div key={idx} className="mb-2">
                  {asset.assetType === 1 && <audio controls src={asset.url} />}
                  {asset.assetType === 2 && <img src={asset.url} alt={asset.caption} style={{ maxWidth: "200px" }} />}
                  {asset.assetType === 3 && <p>{asset.contentText}</p>}
                  {asset.assetType === 5 && <video controls src={asset.url} style={{ maxWidth: "200px" }} />}
                </div>
              ))}

              {/* Questions */}
              {group.questions && group.questions.map((q, qIdx) => (
                <Card key={qIdx} className="mb-2 p-2">
                  <p><strong>{q.questionOrder || qIdx + 1}. {q.content}</strong> (Score: {q.scoreWeight})</p>
                  {q.options && (
                    <ListGroup>
                      {q.options.map((opt, i) => (
                        <ListGroup.Item key={i} variant={opt.isCorrect ? "success" : ""}>
                          {opt.content}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                  {q.assets && q.assets.map((asset, idx) => (
                    <div key={idx} className="mt-1">
                      {asset.assetType === 1 && <audio controls src={asset.url} />}
                      {asset.assetType === 2 && <img src={asset.url} alt={asset.caption} style={{ maxWidth: "150px" }} />}
                      {asset.assetType === 3 && <p>{asset.contentText}</p>}
                      {asset.assetType === 5 && <video controls src={asset.url} style={{ maxWidth: "150px" }} />}
                    </div>
                  ))}
                </Card>
              ))}
            </Card.Body>
          </Card>
        ))
      ) : <p className="text-muted">Chưa có nhóm câu hỏi nào.</p>}

      {/* Import JSON */}
      <Card className="mt-4 shadow-sm rounded-4 p-3">
        <h5>Import Quiz JSON</h5>
        <Form.Group className="mb-3">
          <Form.Label>Paste JSON vào đây</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
          />
        </Form.Group>
        <Button onClick={handleImport} disabled={uploading} variant="primary">
          {uploading ? "Đang import..." : "Import JSON"}
        </Button>
      </Card>

      {/* Modal hiển thị lỗi */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Lỗi Import Quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowErrorModal(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default QuizDetail;
