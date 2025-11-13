import React, { useState, useEffect } from "react";
import {
  Container, Card, Button, Spinner, Alert, Form, ListGroup,
  Modal, Badge, Row, Col, Accordion,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuizById,
  importQuizGroups,
} from "../../middleware/admin/quizManagementAPI";
import { uploadAsset } from "../../middleware/teacher/uploadAPI";
import { 
  generateAIQuiz, 
  parseAIQuizResponse, 
  convertAIQuestionsToImportFormat 
} from "../../middleware/teacher/aiQuizAPI";
import { Trash2, Plus, Check, Edit2, FolderPlus, Sparkles } from "lucide-react";

const ExamDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [correctAnswersMap, setCorrectAnswersMap] = useState({});

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroupIndex, setEditingGroupIndex] = useState(null);
  const [newGroupInstruction, setNewGroupInstruction] = useState("");
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);
  const [importQuestions, setImportQuestions] = useState([
    { content: "", options: ["", ""], correctIndex: 0, scoreWeight: 1.00 },
  ]);
  const [uploading, setUploading] = useState(false);
  
  // AI Quiz
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSelectedGroupIndex, setAiSelectedGroupIndex] = useState(null);
  
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [showTextAssetModal, setShowTextAssetModal] = useState(false);
  const [textAssetContent, setTextAssetContent] = useState("");
  const [textAssetGroupIndex, setTextAssetGroupIndex] = useState(null);
  const [editingAssetIndex, setEditingAssetIndex] = useState(null);
  const [isEditingAsset, setIsEditingAsset] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingQuestionGroupIndex, setEditingQuestionGroupIndex] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getQuizById(quizId);
      setQuiz(data);

      let parsedGroups = [];
      if (data.groups?.length > 0) {
        parsedGroups = data.groups.map(g => ({
          groupOrder: g.groupOrder || 1,
          groupType: g.groupType || 1,
          instruction: g.instruction || "",
          assets: g.assets || [],
          questions: g.questions || []
        }));
      } else if (data.questionGroups?.length > 0) {
        parsedGroups = data.questionGroups.map(g => ({
          groupOrder: g.groupOrder || 1,
          groupType: g.groupType || 1,
          instruction: g.instruction || "",
          assets: g.assets || [],
          questions: g.questions || []
        }));
      } else if (data.questions?.length > 0) {
        parsedGroups = [{
          groupOrder: 1,
          groupType: 1,
          instruction: "Trả lời các câu hỏi sau",
          assets: [],
          questions: data.questions
        }];
      }
      setGroups(parsedGroups);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không thể tải quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
      const saved = localStorage.getItem(`admin_quiz_${quizId}_answers`);
      if (saved) {
        try {
          setCorrectAnswersMap(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, [quizId]);

  // AI QUIZ GENERATOR
  const handleGenerateAIQuiz = async () => {
    if (!aiPrompt.trim()) {
      setErrorMessage("❌ Vui lòng nhập prompt cho AI!");
      setShowErrorModal(true);
      return;
    }
    if (aiSelectedGroupIndex === null) {
      setErrorMessage("❌ Vui lòng chọn group để thêm câu hỏi!");
      setShowErrorModal(true);
      return;
    }

    try {
      setAiLoading(true);
      const aiResponse = await generateAIQuiz(aiPrompt);
      
      if (aiResponse.error) throw new Error(aiResponse.error);

      const parsedQuiz = parseAIQuizResponse(aiResponse);
      if (!parsedQuiz.questions?.length) {
        throw new Error("AI không tạo được câu hỏi. Vui lòng thử prompt khác.");
      }

      const convertedQuestions = convertAIQuestionsToImportFormat(parsedQuiz.questions);
      const updatedGroups = [...groups];
      const targetGroup = updatedGroups[aiSelectedGroupIndex];
      const currentCount = targetGroup.questions?.length || 0;

      const newQuestions = convertedQuestions.map((q, i) => ({
        questionOrder: currentCount + i + 1,
        questionType: q.questionType || 1,
        content: q.content,
        scoreWeight: q.scoreWeight,
        metaJson: null,
        options: q.options.map((opt, idx) => ({
          content: opt,
          isCorrect: idx === q.correctIndex,
        })),
        assets: [],
      }));

      targetGroup.questions = [...(targetGroup.questions || []), ...newQuestions];

      const importData = formatGroupsForAPI(updatedGroups);
      await importQuizGroups(quizId, importData);

      const newAnswersMap = { ...correctAnswersMap };
      convertedQuestions.forEach((q, i) => {
        newAnswersMap[`${aiSelectedGroupIndex}-${currentCount + i}`] = q.correctIndex;
      });
      setCorrectAnswersMap(newAnswersMap);
      localStorage.setItem(`admin_quiz_${quizId}_answers`, JSON.stringify(newAnswersMap));

      await fetchQuiz();
      setShowAIModal(false);
      setAiPrompt("");
      setAiSelectedGroupIndex(null);
      alert(`✅ AI đã tạo ${convertedQuestions.length} câu hỏi!`);
    } catch (err) {
      setErrorMessage("❌ " + err.message);
      setShowErrorModal(true);
    } finally {
      setAiLoading(false);
    }
  };

  const formatGroupsForAPI = (groupsData) => ({
    groups: groupsData.map(g => ({
      groupOrder: g.groupOrder || 1,
      groupType: g.groupType || 1,
      instruction: g.instruction || "",
      assets: (g.assets || []).map(a => ({
        assetType: a.assetType || 0,
        url: a.url || "",
        contentText: a.contentText || "",
        caption: a.caption || "",
        mimeType: a.mimeType || ""
      })),
      questions: (g.questions || []).map((q, i) => ({
        content: q.content || "",
        questionType: q.questionType || 1,
        questionOrder: i + 1,
        scoreWeight: q.scoreWeight || 1.00,
        metaJson: q.metaJson || null,
        options: (q.options || []).map(o => ({
          content: o.content || o || "",
          isCorrect: o.isCorrect || false
        })),
        assets: (q.assets || []).map(a => ({
          assetType: a.assetType || 0,
          url: a.url || "",
          contentText: a.contentText || "",
          caption: a.caption || "",
          mimeType: a.mimeType || ""
        }))
      }))
    }))
  });

  const handleSaveGroup = async () => {
    if (!newGroupInstruction.trim()) {
      alert("❌ Vui lòng nhập instruction!");
      return;
    }
    try {
      setUploading(true);
      const updatedGroups = [...groups];
      if (editingGroupIndex !== null) {
        updatedGroups[editingGroupIndex].instruction = newGroupInstruction.trim();
      } else {
        updatedGroups.push({
          groupOrder: groups.length + 1,
          groupType: 1,
          instruction: newGroupInstruction.trim(),
          assets: [],
          questions: []
        });
      }
      await importQuizGroups(quizId, formatGroupsForAPI(updatedGroups));
      await fetchQuiz();
      setShowGroupModal(false);
      setNewGroupInstruction("");
      setEditingGroupIndex(null);
      alert("✅ Đã lưu group!");
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteGroup = async (idx) => {
    if (!window.confirm(`Xóa group ${idx + 1}?`)) return;
    try {
      setUploading(true);
      const updated = groups.filter((_, i) => i !== idx);
      updated.forEach((g, i) => { g.groupOrder = i + 1; });
      await importQuizGroups(quizId, formatGroupsForAPI(updated));
      await fetchQuiz();
      alert("✅ Đã xóa!");
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleAssetUpload = async (e, assetType, groupIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("❌ File quá lớn!");
      return;
    }

    const typeMap = { 1: "audio", 2: "image", 5: "video" };
    const typeString = typeMap[assetType];
    if (!typeString) {
      alert("❌ Loại không hỗ trợ!");
      return;
    }

    try {
      setUploadingAsset(true);
      const result = await uploadAsset(file, typeString);
      const updatedGroups = [...groups];
      if (!updatedGroups[groupIndex].assets) updatedGroups[groupIndex].assets = [];
      updatedGroups[groupIndex].assets.push({
        assetType,
        url: result.url,
        caption: file.name,
        mimeType: file.type,
      });
      await importQuizGroups(quizId, formatGroupsForAPI(updatedGroups));
      await fetchQuiz();
      alert("✅ Upload thành công!");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setUploadingAsset(false);
      e.target.value = "";
    }
  };

  const handleAddTextAsset = async () => {
    if (!textAssetContent.trim()) {
      alert("❌ Nhập nội dung!");
      return;
    }
    try {
      setUploading(true);
      const updatedGroups = [...groups];
      const target = updatedGroups[textAssetGroupIndex];
      if (isEditingAsset && editingAssetIndex !== null) {
        target.assets[editingAssetIndex].contentText = textAssetContent.trim();
      } else {
        target.assets.push({
          assetType: 3,
          contentText: textAssetContent.trim()
        });
      }
      await importQuizGroups(quizId, formatGroupsForAPI(updatedGroups));
      await fetchQuiz();
      setShowTextAssetModal(false);
      setTextAssetContent("");
      setTextAssetGroupIndex(null);
      setIsEditingAsset(false);
      setEditingAssetIndex(null);
      alert("✅ Đã lưu!");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditAsset = (gIdx, aIdx, asset) => {
    if (asset.assetType === 3) {
      setTextAssetContent(asset.contentText || "");
      setTextAssetGroupIndex(gIdx);
      setEditingAssetIndex(aIdx);
      setIsEditingAsset(true);
      setShowTextAssetModal(true);
    } else {
      alert("⚠️ Để sửa file, vui lòng xóa và upload lại.");
    }
  };

  const removeAsset = async (gIdx, aIdx) => {
    if (!window.confirm("Xóa?")) return;
    try {
      setUploading(true);
      const updated = [...groups];
      updated[gIdx].assets.splice(aIdx, 1);
      await importQuizGroups(quizId, formatGroupsForAPI(updated));
      await fetchQuiz();
      alert("✅ Đã xóa");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const addQuestion = () => {
    setImportQuestions(prev => [...prev, {
      content: "", options: ["", ""], correctIndex: 0, scoreWeight: 1.00
    }]);
  };

  const removeQuestion = (i) => {
    setImportQuestions(importQuestions.filter((_, idx) => idx !== i));
  };

  const updateQuestion = (i, field, val) => {
    const updated = [...importQuestions];
    updated[i][field] = val;
    setImportQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, val) => {
    const updated = [...importQuestions];
    updated[qIdx].options[oIdx] = val;
    setImportQuestions(updated);
  };

  const addOption = (qIdx) => {
    const updated = [...importQuestions];
    updated[qIdx].options.push("");
    setImportQuestions(updated);
  };

  const removeOption = (qIdx, oIdx) => {
    const updated = [...importQuestions];
    if (updated[qIdx].options.length > 2) {
      updated[qIdx].options.splice(oIdx, 1);
      if (updated[qIdx].correctIndex >= updated[qIdx].options.length) {
        updated[qIdx].correctIndex = updated[qIdx].options.length - 1;
      }
      setImportQuestions(updated);
    } else {
      alert("Phải có ít nhất 2 đáp án!");
    }
  };

  const setCorrectAnswer = (qIdx, oIdx) => {
    const updated = [...importQuestions];
    updated[qIdx].correctIndex = oIdx;
    setImportQuestions(updated);
  };

  const handleImport = async () => {
    for (let i = 0; i < importQuestions.length; i++) {
      const q = importQuestions[i];
      if (!q.content.trim()) {
        setErrorMessage(`Câu ${i + 1} chưa có nội dung!`);
        setShowErrorModal(true);
        return;
      }
      if (q.options.some(o => !o.trim())) {
        setErrorMessage(`Câu ${i + 1} có đáp án trống!`);
        setShowErrorModal(true);
        return;
      }
    }

    try {
      setUploading(true);
      const updated = [...groups];
      const target = updated[selectedGroupIndex];
      const currentCount = target.questions?.length || 0;

      const newQs = importQuestions.map((q, i) => ({
        questionOrder: currentCount + i + 1,
        questionType: 1,
        content: q.content.trim(),
        scoreWeight: q.scoreWeight,
        metaJson: null,
        options: q.options.map((o, oIdx) => ({
          content: o.trim(),
          isCorrect: oIdx === q.correctIndex,
        })),
        assets: [],
      }));

      target.questions = [...(target.questions || []), ...newQs];
      await importQuizGroups(quizId, formatGroupsForAPI(updated));

      const newAnsMap = { ...correctAnswersMap };
      newQs.forEach((_, i) => {
        newAnsMap[`${selectedGroupIndex}-${currentCount + i}`] = importQuestions[i].correctIndex;
      });
      setCorrectAnswersMap(newAnsMap);
      localStorage.setItem(`admin_quiz_${quizId}_answers`, JSON.stringify(newAnsMap));

      await fetchQuiz();
      setShowImportModal(false);
      setImportQuestions([{ content: "", options: ["", ""], correctIndex: 0, scoreWeight: 1.00 }]);
      setSelectedGroupIndex(null);
      alert("✅ Đã thêm!");
    } catch (err) {
      setErrorMessage("❌ " + (err.response?.data?.message || err.message));
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  const handleEditQuestion = (gIdx, qIdx, q) => {
    const opts = q.options || q.choices || [];
    const cIdx = opts.findIndex(o => o.isCorrect || o.correct);
    setEditingQuestion({
      content: q.content || q.questionText || "",
      options: opts.map(o => o.content || o.text || o.optionText || ""),
      correctIndex: cIdx >= 0 ? cIdx : 0,
      scoreWeight: q.scoreWeight || q.score || 1.00,
    });
    setEditingQuestionGroupIndex(gIdx);
    setEditingQuestionIndex(qIdx);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion.content.trim()) {
      setErrorMessage("Câu hỏi trống!");
      setShowErrorModal(true);
      return;
    }
    if (editingQuestion.options.some(o => !o.trim())) {
      setErrorMessage("Có đáp án trống!");
      setShowErrorModal(true);
      return;
    }

    try {
      setUploading(true);
      const updated = [...groups];
      const target = updated[editingQuestionGroupIndex];
      target.questions[editingQuestionIndex] = {
        ...target.questions[editingQuestionIndex],
        content: editingQuestion.content,
        scoreWeight: editingQuestion.scoreWeight,
        options: editingQuestion.options.map((o, i) => ({
          content: o,
          isCorrect: i === editingQuestion.correctIndex,
        })),
      };
      await importQuizGroups(quizId, formatGroupsForAPI(updated));

      const newAnsMap = { ...correctAnswersMap };
      newAnsMap[`${editingQuestionGroupIndex}-${editingQuestionIndex}`] = editingQuestion.correctIndex;
      setCorrectAnswersMap(newAnsMap);
      localStorage.setItem(`admin_quiz_${quizId}_answers`, JSON.stringify(newAnsMap));

      await fetchQuiz();
      setShowEditModal(false);
      setEditingQuestion(null);
      setEditingQuestionGroupIndex(null);
      setEditingQuestionIndex(null);
      alert("✅ Đã cập nhật!");
    } catch (err) {
      setErrorMessage("❌ " + (err.response?.data?.message || err.message));
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      setUploading(true);
      const { groupIndex, questionIndex } = deleteTarget;
      const updated = [...groups];
      updated[groupIndex].questions.splice(questionIndex, 1);
      updated[groupIndex].questions.forEach((q, i) => { q.questionOrder = i + 1; });
      await importQuizGroups(quizId, formatGroupsForAPI(updated));

      const newAnsMap = { ...correctAnswersMap };
      delete newAnsMap[`${groupIndex}-${questionIndex}`];
      setCorrectAnswersMap(newAnsMap);
      localStorage.setItem(`admin_quiz_${quizId}_answers`, JSON.stringify(newAnsMap));

      await fetchQuiz();
      setShowDeleteModal(false);
      setDeleteTarget(null);
      alert(" Đã xóa!");
    } catch (err) {
      setErrorMessage("❌ " + (err.response?.data?.message || err.message));
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  const renderAsset = (asset, idx) => {
    if (!asset) return null;
    const style = { maxWidth: "100%", marginBottom: "10px" };
    switch (asset.assetType) {
      case 1: return <audio key={idx} controls src={asset.url} style={style} className="w-100" />;
      case 2: return <img key={idx} src={asset.url} alt={asset.caption} style={style} className="img-fluid" />;
      case 3: return <div key={idx} className="p-3 bg-light rounded"><p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{asset.contentText}</p></div>;
      case 5: return <video key={idx} controls src={asset.url} style={style} className="w-100" />;
      default: return null;
    }
  };

  const getTotalQuestions = () => groups.reduce((s, g) => s + (g.questions?.length || 0), 0);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="link" onClick={() => navigate(-1)}>← Quay lại</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="link" onClick={() => navigate(-1)} className="p-0 mb-2">← Quay lại</Button>
          <h3 className="text-primary mb-0">{quiz?.title || "Quiz Detail"}</h3>
          {quiz?.description && <p className="text-muted mt-2">{quiz.description}</p>}
          <div className="mt-2">
            <Badge bg="info" className="me-2">{groups.length} groups</Badge>
            <Badge bg="secondary">{getTotalQuestions()} câu</Badge>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={() => { setEditingGroupIndex(null); setNewGroupInstruction(""); setShowGroupModal(true); }}>
            <FolderPlus size={18} className="me-2" />Thêm Group
          </Button>
          {/* AI BUTTON */}
          <Button 
            variant="gradient" 
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              color: "white"
            }}
            onClick={() => {
              if (groups.length === 0) {
                alert("⚠️ Vui lòng tạo ít nhất 1 group trước khi dùng AI!");
                return;
              }
              setAiSelectedGroupIndex(0);
              setAiPrompt("");
              setShowAIModal(true);
            }}
          >
            Tạo đề bằng AI
          </Button>
        </div>
      </div>

      {groups.length > 0 ? (
        <Accordion defaultActiveKey="0">
          {groups.map((group, gIdx) => (
            <Accordion.Item eventKey={gIdx.toString()} key={gIdx}>
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                  <div><strong>Group {gIdx + 1}:</strong> {group.instruction}</div>
                  <div>
                    <Badge bg="info" className="me-2">{group.assets?.length || 0} assets</Badge>
                    <Badge bg="secondary">{group.questions?.length || 0} câu</Badge>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <div className="d-flex gap-2 mb-3">
                  <Button variant="outline-primary" size="sm" onClick={() => { setEditingGroupIndex(gIdx); setNewGroupInstruction(group.instruction); setShowGroupModal(true); }}>
                    <Edit2 size={14} className="me-1" />Sửa
                  </Button>
                  <Button variant="outline-success" size="sm" onClick={() => { setSelectedGroupIndex(gIdx); setImportQuestions([{ content: "", options: ["", ""], correctIndex: 0, scoreWeight: 1.00 }]); setShowImportModal(true); }}>
                    <Plus size={14} className="me-1" />Thêm câu hỏi
                  </Button>
                  <Button variant="outline-info" size="sm" onClick={() => { setAiSelectedGroupIndex(gIdx); setAiPrompt(""); setShowAIModal(true); }}>
                    <Sparkles size={14} className="me-1" />AI
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteGroup(gIdx)}>
                    <Trash2 size={14} className="me-1" />Xóa
                  </Button>
                </div>

                {/* Assets */}
                <Card className="mb-3 border-primary">
                  <Card.Header className="bg-light d-flex justify-content-between">
                    <strong>📎 Assets</strong>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm" disabled={uploadingAsset} onClick={() => document.getElementById(`audio-${gIdx}`).click()}>Audio</Button>
                      <input id={`audio-${gIdx}`} type="file" accept="audio/*" hidden onChange={(e) => handleAssetUpload(e, 1, gIdx)} />
                      <Button variant="outline-success" size="sm" disabled={uploadingAsset} onClick={() => document.getElementById(`image-${gIdx}`).click()}>Image</Button>
                      <input id={`image-${gIdx}`} type="file" accept="image/*" hidden onChange={(e) => handleAssetUpload(e, 2, gIdx)} />
                      <Button variant="outline-info" size="sm" disabled={uploadingAsset} onClick={() => document.getElementById(`video-${gIdx}`).click()}>Video</Button>
                      <input id={`video-${gIdx}`} type="file" accept="video/*" hidden onChange={(e) => handleAssetUpload(e, 5, gIdx)} />
                      <Button variant="outline-secondary" size="sm" onClick={() => { setTextAssetGroupIndex(gIdx); setTextAssetContent(""); setIsEditingAsset(false); setShowTextAssetModal(true); }}>Text</Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {group.assets?.length > 0 ? group.assets.map((a, aIdx) => (
                      <Card key={aIdx} className="mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-2">
                            <Badge bg="info">{a.assetType === 1 ? 'audio' : a.assetType === 2 ? 'image' : a.assetType === 3 ? 'text' : 'video'}</Badge>
                            <div className="d-flex gap-2">
                              <Button variant="outline-primary" size="sm" onClick={() => handleEditAsset(gIdx, aIdx, a)}><Edit2 size={14} /></Button>
                              <Button variant="outline-danger" size="sm" onClick={() => removeAsset(gIdx, aIdx)}><Trash2 size={14} /></Button>
                            </div>
                          </div>
                          {renderAsset(a, aIdx)}
                        </Card.Body>
                      </Card>
                    )) : <p className="text-muted text-center mb-0">Chưa có assets</p>}
                  </Card.Body>
                </Card>

                {/* Questions */}
                <h6 className="mb-3">Câu hỏi</h6>
                {group.questions?.length > 0 ? group.questions.map((q, qIdx) => {
                  const opts = q.options || q.choices || [];
                  return (
                    <Card key={qIdx} className="mb-3 shadow-sm">
                      <Card.Body>
                        <div className="d-flex justify-content-end gap-2 mb-2">
                          <Button variant="outline-primary" size="sm" onClick={() => handleEditQuestion(gIdx, qIdx, q)}><Edit2 size={14} className="me-1" />Sửa</Button>
                          <Button variant="outline-danger" size="sm" onClick={() => { setDeleteTarget({ groupIndex: gIdx, questionIndex: qIdx }); setShowDeleteModal(true); }}><Trash2 size={14} className="me-1" />Xóa</Button>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                          <h6 className="mb-1"><Badge bg="primary" className="me-2">Câu {qIdx + 1}</Badge>{q.content}</h6>
                          <Badge bg="info">Điểm: {q.scoreWeight || 1}</Badge>
                        </div>
                        {opts.length > 0 && (
                          <div>
                            <p className="text-muted mb-2"><small>Đáp án:</small></p>
                            <ListGroup>
                              {opts.map((opt, oIdx) => {
                                const isCorrectAPI = opt.isCorrect === true || opt.correct === true;
                                const isCorrectLocal = correctAnswersMap[`${gIdx}-${qIdx}`] === oIdx;
                                const isCorrect = isCorrectAPI || isCorrectLocal;
                                return (
                                  <ListGroup.Item key={oIdx} variant={isCorrect ? "success" : ""} className="d-flex align-items-center" style={isCorrect ? { backgroundColor: '#d1e7dd', borderColor: '#badbcc' } : {}}>
                                    {isCorrect && <Check size={18} className="me-2 text-success fw-bold" />}
                                    <span className="me-2 fw-bold">{String.fromCharCode(65 + oIdx)}.</span>
                                    <span className={isCorrect ? "fw-bold text-success" : ""}>{opt.content || opt}</span>
                                    {isCorrect && <Badge bg="success" className="ms-auto">✓ Đúng</Badge>}
                                  </ListGroup.Item>
                                );
                              })}
                            </ListGroup>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  );
                }) : <Alert variant="info" className="text-center"><p className="mb-0">Chưa có câu hỏi</p></Alert>}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <Alert variant="info" className="mb-3">
              <strong>Quiz chưa có group</strong>
              <p className="mb-0 mt-2">Tạo group để thêm câu hỏi và assets.</p>
            </Alert>
            <Button variant="primary" onClick={() => { setEditingGroupIndex(null); setNewGroupInstruction(""); setShowGroupModal(true); }}>
              <FolderPlus size={18} className="me-2" />Tạo Group
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* MODALS */}
      
      {/* Group Modal */}
      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingGroupIndex !== null ? "Sửa Group" : "Thêm Group"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Instruction</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="VD: Listen to the audio and answer" value={newGroupInstruction} onChange={(e) => setNewGroupInstruction(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGroupModal(false)} disabled={uploading}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveGroup} disabled={uploading}>
            {uploading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Đang lưu...</> : (editingGroupIndex !== null ? "Lưu" : "Tạo")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* AI Modal */}
      <Modal show={showAIModal} onHide={() => setShowAIModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Sparkles size={24} className="me-2" style={{ color: "#667eea" }} />
            Tạo đề bằng AI
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <strong>💡 Hướng dẫn:</strong>
            <ul className="mb-0 mt-2">
              <li>Mô tả chi tiết nội dung bạn muốn tạo đề</li>
              <li>Ví dụ: "Create 10 questions about Present Continuous Tense for intermediate level"</li>
              <li>Ví dụ: "Tạo 5 câu hỏi về thì hiện tại hoàn thành, level trung bình"</li>
            </ul>
          </Alert>

          {groups.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Chọn Group để thêm câu hỏi</Form.Label>
              <Form.Select value={aiSelectedGroupIndex || 0} onChange={(e) => setAiSelectedGroupIndex(parseInt(e.target.value))}>
                {groups.map((g, i) => (
                  <option key={i} value={i}>Group {i + 1}: {g.instruction}</option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group>
            <Form.Label>Prompt cho AI</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={5} 
              placeholder="Ví dụ: Create 10 multiple choice questions about English grammar, focusing on present perfect tense..."
              value={aiPrompt} 
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={aiLoading}
            />
            <Form.Text className="text-muted">
              Mô tả càng chi tiết, AI sẽ tạo đề càng chính xác
            </Form.Text>
          </Form.Group>

          {aiLoading && (
            <Alert variant="warning" className="mt-3 mb-0">
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>AI đang tạo đề... Vui lòng đợi (có thể mất 30-60 giây)</span>
              </div>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAIModal(false)} disabled={aiLoading}>Hủy</Button>
          <Button 
            variant="primary" 
            onClick={handleGenerateAIQuiz} 
            disabled={!aiPrompt.trim() || aiLoading}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none"
            }}
          >
            {aiLoading ? (
              <><Spinner as="span" animation="border" size="sm" className="me-2" />Đang tạo...</>
            ) : (
              <><Sparkles size={18} className="me-2" />Tạo bằng AI</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import Questions Modal */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm câu hỏi vào Group {selectedGroupIndex !== null ? selectedGroupIndex + 1 : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {selectedGroupIndex !== null && groups[selectedGroupIndex] && (
            <Alert variant="info" className="mb-4">
              <strong>📁 Group:</strong> {groups[selectedGroupIndex].instruction}
            </Alert>
          )}
          {importQuestions.map((q, qIdx) => (
            <Card key={qIdx} className="mb-3">
              <Card.Header className="d-flex justify-content-between">
                <strong>Câu {qIdx + 1}</strong>
                {importQuestions.length > 1 && <Button variant="link" size="sm" className="text-danger p-0" onClick={() => removeQuestion(qIdx)}><Trash2 size={16} /></Button>}
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Nội dung</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="Nhập câu hỏi..." value={q.content} onChange={(e) => updateQuestion(qIdx, "content", e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Điểm</Form.Label>
                  <Form.Control type="number" min="1" step="0.01" value={q.scoreWeight} onChange={(e) => updateQuestion(qIdx, "scoreWeight", parseFloat(e.target.value) || 1)} style={{ width: "100px" }} />
                </Form.Group>
                <Form.Label>Đáp án</Form.Label>
                {q.options.map((opt, oIdx) => (
                  <Row key={oIdx} className="mb-2 align-items-center">
                    <Col xs={1}><Form.Check type="radio" name={`correct-${qIdx}`} checked={q.correctIndex === oIdx} onChange={() => setCorrectAnswer(qIdx, oIdx)} /></Col>
                    <Col xs={1} className="text-center"><strong>{String.fromCharCode(65 + oIdx)}.</strong></Col>
                    <Col xs={9}><Form.Control type="text" placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`} value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} /></Col>
                    <Col xs={1}>{q.options.length > 2 && <Button variant="link" size="sm" className="text-danger p-0" onClick={() => removeOption(qIdx, oIdx)}><Trash2 size={16} /></Button>}</Col>
                  </Row>
                ))}
                <Button variant="outline-secondary" size="sm" onClick={() => addOption(qIdx)}><Plus size={16} className="me-1" />Thêm đáp án</Button>
              </Card.Body>
            </Card>
          ))}
          <Button variant="outline-primary" onClick={addQuestion} className="w-100"><Plus size={18} className="me-2" />Thêm câu hỏi</Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)} disabled={uploading}>Hủy</Button>
          <Button variant="primary" onClick={handleImport} disabled={uploading}>
            {uploading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Đang lưu...</> : `Lưu ${importQuestions.length} câu`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Question Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Sửa câu hỏi</Modal.Title></Modal.Header>
        <Modal.Body>
          {editingQuestion && (
            <div>
              <Form.Group className="mb-3">
                <Form.Label>Nội dung</Form.Label>
                <Form.Control as="textarea" rows={2} value={editingQuestion.content} onChange={(e) => setEditingQuestion({ ...editingQuestion, content: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Điểm</Form.Label>
                <Form.Control type="number" min="1" step="0.01" value={editingQuestion.scoreWeight} onChange={(e) => setEditingQuestion({ ...editingQuestion, scoreWeight: parseFloat(e.target.value) || 1 })} style={{ width: "100px" }} />
              </Form.Group>
              <Form.Label>Đáp án</Form.Label>
              {editingQuestion.options.map((opt, oIdx) => (
                <Row key={oIdx} className="mb-2 align-items-center">
                  <Col xs={1}><Form.Check type="radio" name="correct-edit" checked={editingQuestion.correctIndex === oIdx} onChange={() => setEditingQuestion({ ...editingQuestion, correctIndex: oIdx })} /></Col>
                  <Col xs={1} className="text-center"><strong>{String.fromCharCode(65 + oIdx)}.</strong></Col>
                  <Col xs={9}><Form.Control type="text" value={opt} onChange={(e) => { const newOpts = [...editingQuestion.options]; newOpts[oIdx] = e.target.value; setEditingQuestion({ ...editingQuestion, options: newOpts }); }} /></Col>
                  <Col xs={1}>{editingQuestion.options.length > 2 && <Button variant="link" size="sm" className="text-danger p-0" onClick={() => { if (editingQuestion.options.length > 2) { const newOpts = editingQuestion.options.filter((_, i) => i !== oIdx); const newCIdx = editingQuestion.correctIndex >= newOpts.length ? newOpts.length - 1 : editingQuestion.correctIndex; setEditingQuestion({ ...editingQuestion, options: newOpts, correctIndex: newCIdx }); } }}><Trash2 size={16} /></Button>}</Col>
                </Row>
              ))}
              <Button variant="outline-secondary" size="sm" onClick={() => setEditingQuestion({ ...editingQuestion, options: [...editingQuestion.options, ""] })}><Plus size={16} className="me-1" />Thêm đáp án</Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={uploading}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveEdit} disabled={uploading}>
            {uploading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Đang lưu...</> : "Lưu"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>⚠️ Xác nhận xóa</Modal.Title></Modal.Header>
        <Modal.Body>
          <Alert variant="warning">Bạn chắc chắn muốn xóa câu hỏi này?<br /><strong>Không thể hoàn tác!</strong></Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={uploading}>Hủy</Button>
          <Button variant="danger" onClick={handleDeleteQuestion} disabled={uploading}>
            {uploading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Đang xóa...</> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Text Asset Modal */}
      <Modal show={showTextAssetModal} onHide={() => { setShowTextAssetModal(false); setTextAssetContent(""); setTextAssetGroupIndex(null); setIsEditingAsset(false); setEditingAssetIndex(null); }} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>{isEditingAsset ? "Sửa Text" : "Thêm Text"}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nội dung Text</Form.Label>
            <Form.Control as="textarea" rows={12} placeholder="Nhập nội dung..." value={textAssetContent} onChange={(e) => setTextAssetContent(e.target.value)} style={{ fontSize: "14px" }} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowTextAssetModal(false); setTextAssetContent(""); setTextAssetGroupIndex(null); setIsEditingAsset(false); setEditingAssetIndex(null); }} disabled={uploading}>Hủy</Button>
          <Button variant="primary" onClick={handleAddTextAsset} disabled={!textAssetContent.trim() || uploading}>
            {uploading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Đang lưu...</> : (isEditingAsset ? "Cập nhật" : "Thêm")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Error Modal */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>❌ Lỗi</Modal.Title></Modal.Header>
        <Modal.Body><Alert variant="danger" className="mb-0">{errorMessage}</Alert></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowErrorModal(false)}>Đóng</Button></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ExamDetail;